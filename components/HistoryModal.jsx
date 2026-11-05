"use client";

// 历史记录弹窗：把 /api/history 拿到的数组逐条列出来。
// 它只管「把数组画出来」，至于这个数组是全站的还是某个访客自己的，它不关心。
//
// 为什么用 createPortal 挂到 <body>：调用它的卡片（.card）身上有 transform
// （入场动画 anime.js 写的），而 transform 会让里面的 position: fixed 变成
// 相对那张卡定位，遮罩就只盖住卡片、盖不住整屏。挂到 body 才回到视口坐标系。
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// 后端存的是 UTC（带 +00:00 那种），这里交给浏览器转成本机时区再显示。
// new Date() 认识 ISO 字符串里的时区偏移，toLocaleString 按用户所在时区输出。
function formatTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;   // 解析不了就原样显示，不崩
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryModal({ open, items, onClose }) {
  // 服务端预渲染时没有 document，等挂载完再开 Portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 按 Esc 关闭：只在打开时挂监听，关掉就摘掉
  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    // 点遮罩关闭；点弹窗本体时 stopPropagation，免得点到内容也被关掉
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <p className="section-kicker">历史记录</p>
            <h3 className="panel-title">最近的分析</h3>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            关闭
          </button>
        </div>

        {items.length === 0 ? (
          <p className="history-empty">还没有记录，先分析一句试试。</p>
        ) : (
          <div className="history-list">
            {/* 数组逐条长出来，key 用数据库发的那个唯一 id */}
            {items.map((item) => (
              <div className="history-item" key={item.id}>
                <p className="history-text">{item.text}</p>
                <span className="history-meta">
                  {item.score} · {item.label} · {formatTime(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
