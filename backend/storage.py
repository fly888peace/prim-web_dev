# 存储层：数据存在哪儿、怎么存进去、怎么取出来。
# 外面只跟这三个函数打交道，不关心底层是 JSON 文件还是数据库。

import json

HISTORY_FILE = "history.json"


def load_history():
    """读出文件里的全部记录。文件还不存在时返回空列表。"""
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def save_record(record):
    """追加一条记录：读全部 -> 内存里 append -> 整个写回。"""
    records = load_history()
    records.append(record)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)


def get_history(limit):
    """取最近的 limit 条，新的排在前面。

    这里只决定「怎么取」（倒序、切前 limit 条），
    至于 limit 具体是 10 还是 20，由调用方说了算。
    """
    records = load_history()
    records.reverse()
    return records[:limit]
