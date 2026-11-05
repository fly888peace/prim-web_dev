"use client";

// 试一试：把一段文字 POST 给后端，拿回它算的结果。
//
// 这个卡片专门用来走一遍「非简单请求」的完整链路：
//   POST + Content-Type: application/json
//   → 浏览器先自动发 OPTIONS 预检（你写不出来的那条）
//   → 后端 CORSMiddleware 应答允许（allow_methods 里得有 POST）
//   → 预检过了，真正的 POST 才发出去
//
// 打开 DevTools 的 Network，点一次按钮会看到两条请求：OPTIONS 在前，POST 在后。
import { useState } from "react";
import HistoryModal from "./HistoryModal.jsx";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function TryCard() {
  const [text, setText] = useState("今天的风很轻，适合把想法写下来");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 历史记录：数据本身 + 弹窗开关。点开的那一刻才去拉，不占首屏
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  async function openHistory() {
    setHistoryOpen(true);          // 先开弹窗，哪怕请求慢也立刻有反馈
    try {
      const res = await fetch(`${API}/api/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHistory(await res.json());
    } catch (err) {
      // 后端没起来时不让页面崩掉，弹窗里显示「还没有记录」
      console.warn("[history] 取历史失败：", err.message);
      setHistory([]);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setResult(await res.json());
    } catch (err) {
      // 失败时把「可能的原因」直接写出来，省得去猜
      setResult(null);
      setError(
        `请求失败：${err.message}。检查两件事——后端是否在 8000 跑着，CORS 的 allow_origins 是否写的是当前前端地址。`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="panel panel-full card">
      <div className="try-heading">
        <div>
          <p className="section-kicker">试一试</p>
          <h3 className="panel-title">把一段文字发给后端</h3>
        </div>
        <button type="button" className="ghost-button" onClick={openHistory}>
          历史记录
        </button>
      </div>

      <form className="try-form" onSubmit={handleSubmit}>
        <textarea
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="要提交给后端的文字"
        />
        <button className="try-button" type="submit" disabled={loading}>
          {loading ? "发送中…" : "发给后端"}
        </button>
      </form>

      {error ? <p className="try-error">{error}</p> : null}

      {result ? (
        <div className="try-result">
          <div className="try-item">
            <span>后端收到的原文</span>
            <strong>{result.text}</strong>
          </div>
          <div className="try-item">
            <span>情感分数</span>
            <strong>{result.score}</strong>
          </div>
          <div className="try-item">
            <span>情感判断</span>
            <strong>{result.label}</strong>
          </div>
        </div>
      ) : null}

      <HistoryModal
        open={historyOpen}
        items={history}
        onClose={() => setHistoryOpen(false)}
      />
    </article>
  );
}
