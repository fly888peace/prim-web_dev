# 存储层：数据存在哪儿、怎么存进去、怎么取出来。
# 实现从 JSON 文件换成了 SQLite，但外面看到的函数名和参数一个字没变。

import sqlite3

DB_FILE = "history.db"


def get_conn():
    """开一个连接。每次用完立刻 close()，不留长连接。"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row      # 查询结果带列名，才能 dict(row) 成 JSON
    return conn


def init_db():
    """启动时调用：确保库文件、表、索引都在。已存在就跳过。"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        text TEXT,
        score REAL,
        label TEXT,
        pinyin TEXT,
        createdAt TEXT
    )
    """)
    # 查询从「按时间排」变成了「先按会话筛，再按时间排」，
    # 索引也要跟着换成两列：先放用来筛的，再放用来排的。
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_history_session_created "
        "ON history(session_id, createdAt)"
    )
    conn.commit()
    conn.close()


def save_record(session_id, record):
    """插入一条，并盖上这个会话的记号。值一律走 ? 占位，不拼字符串。"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO history (session_id, text, score, label, pinyin, createdAt)"
        " VALUES (?, ?, ?, ?, ?, ?)",
        [session_id, record["text"], record["score"],
         record["label"], record["pinyin"], record["createdAt"]],
    )
    conn.commit()
    conn.close()


def get_history(session_id, limit):
    """只取这个会话自己的记录，最近的在前，最多 limit 条。

    筛选、排序、截断三件事全交给 SQL，Python 这边不碰。
    """
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT * FROM history WHERE session_id = ? ORDER BY createdAt DESC LIMIT ?",
        [session_id, limit],
    ).fetchall()
    conn.close()

    records = []
    for row in rows:
        records.append(dict(row))
    return records
