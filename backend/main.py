# fastapi
from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
# python三方库
from pypinyin import lazy_pinyin, Style
from snownlp import SnowNLP
# 标准库
import uuid
from datetime import datetime, timezone
# 存储层：存哪儿、怎么存、怎么取都归 storage.py 管，这里只经过这一行
from storage import init_db, save_record, get_history


app = FastAPI()

init_db()   # 启动时确保库、表、索引都在；已经存在就跳过

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # 带凭证时不能用 *，必须点名到具体源
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_credentials=True,                    # 允许跨源请求把 cookie 带过来
)


def get_session_id(request: Request, response: Response) -> str:
    """认纸条：请求里带了 session_id 就用它，没带就发一张新的。

    发新的那一次，response 会被塞上一个 Set-Cookie 头——这就是「服务器下发」。
    这个函数只管发纸条，纸条里记的是谁，它不管。
    """
    sid = request.cookies.get("session_id")
    if not sid:
        sid = uuid.uuid4().hex                  # 32 位十六进制：唯一、且猜不出
        response.set_cookie(
            "session_id",
            sid,
            httponly=True,                      # 页面上的 JS 读不到它
            samesite="lax",                     # 跨站请求不会自动带
            max_age=60 * 60 * 24 * 30,          # 30 天，单位是秒
        )
    return sid


profile = {
    # 这几个字段要和前端 data/site.js 的 home 对得上，改一边就要改另一边
    "heroTitle": "游戏记录",
    "heroSubtitle": "玩过的、卡住的、终于过了的，都记在这里",
}

class AnalyzeRequest(BaseModel):
    text: str

@app.get("/api/profile")
def get_profile():
    return profile
    
def score_label(score):
    if score >= 0.6:
        return "偏积极"
    elif score <= 0.4:
        return "偏消极"
    else:
        return "中性"


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest, request: Request, response: Response):
    sid = get_session_id(request, response)                       # 先认人，再干活
    text = req.text
    score = round(SnowNLP(text).sentiments, 2)                    # 真模型打的分
    result = {
        "text": text,
        "score": score,
        "label": score_label(score),                              # ← 先留着，下面处理
        "pinyin": " ".join(lazy_pinyin(text, style=Style.TONE)),  # 真拼音，带声调
        "createdAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    save_record(sid, result)      # 存的时候盖上这个会话的记号
    return result                 # 返回体一个字没变，session_id 只走 cookie

@app.get("/api/history")
def history(request: Request, response: Response, limit: int = 10):
    sid = get_session_id(request, response)
    return get_history(sid, limit)   # 只回这个会话自己的；条数由 ?limit= 决定


