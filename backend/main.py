# fastapi
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
# python三方库
from pypinyin import lazy_pinyin, Style
from snownlp import SnowNLP
# 时间基准
from datetime import datetime, timezone
# 存储层：存哪儿、怎么存、怎么取都归 storage.py 管，这里只经过这一行
from storage import init_db, save_record, get_history


app = FastAPI()

init_db()   # 启动时确保库、表、索引都在；已经存在就跳过

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],   
    allow_headers=["*"],
    allow_credentials=True,
)

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
def analyze(req: AnalyzeRequest):
    text = req.text
    score = round(SnowNLP(text).sentiments, 2)                    # 真模型打的分
    result = {
        "text": text,
        "score": score,
        "label": score_label(score),                              # ← 先留着，下面处理
        "pinyin": " ".join(lazy_pinyin(text, style=Style.TONE)),  # 真拼音，带声调
        "createdAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    save_record(result)
    return result

@app.get("/api/history")
def history():
    return get_history(10)     # 取多少条由接口层决定，storage 只管取

