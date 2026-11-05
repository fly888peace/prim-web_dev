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
        text TEXT,
        score REAL,
        label TEXT,
        pinyin TEXT,
        createdAt TEXT
    )
    """)
    # createdAt 是每次查询都要 ORDER BY 的列，值得建索引
    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_created ON history(createdAt)")
    conn.commit()
    conn.close()


def save_record(record):
    """插入一条。值一律走 ? 占位，不拼字符串，从根上防注入。"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO history (text, score, label, pinyin, createdAt) VALUES (?, ?, ?, ?, ?)",
        [record["text"], record["score"], record["label"], record["pinyin"], record["createdAt"]],
    )
    conn.commit()
    conn.close()


def get_history(limit):
    """取最近 limit 条，新的在前。

    文件版里要做的三件事（全量读、自己倒序、自己切片），
    现在一句 SQL 全包了，Python 这边不再碰排序逻辑。
    """
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT * FROM history ORDER BY createdAt DESC LIMIT ?",
        [limit],
    ).fetchall()
    conn.close()

    records = []
    for row in rows:
        records.append(dict(row))
    return records
