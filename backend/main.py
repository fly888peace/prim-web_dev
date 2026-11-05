from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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
    
@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    return {
        "text": req.text,
        "score": 0.5,
        "label": "偏平静",
        "pinyin": "（模块 6 再说）",
    }
