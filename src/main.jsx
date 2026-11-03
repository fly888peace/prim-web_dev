import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// 8 个 CSS 由 Vite 处理：开发时注入 <style>，构建时合并成一份 .css。
// 顺序有讲究：变量 → 重置 → 布局 → 各区块 → 最后是响应式（要能覆盖前面）。
import "./css/reset.css";
import "./css/variables.css";
import "./css/layout.css";
import "./css/nav.css";
import "./css/hero.css";
import "./css/cards.css";
import "./css/post.css";
import "./css/responsive.css";

// 整个应用只有这一个入口：把 App 挂进 index.html 里那个空 div。
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
