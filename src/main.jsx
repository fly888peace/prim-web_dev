import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { motionEnabled } from "./lib/motion.js";

// 9 个 CSS 原样搬进来，顺序和以前 index.html 里的 <link> 一致。
// 这一步是 Vite 在干活，不是 React：它会把这些文件合成一份并在构建时抽成 .css。
import "./css/variables.css";
import "./css/reset.css";
import "./css/layout.css";
import "./css/hero.css";
import "./css/list.css";
import "./css/post.css";
import "./css/footer.css";
import "./css/effects.css";
import "./css/responsive.css";

// 打开「先藏起来」的开关：effects.css 里靠 html.motion 决定要不要把待入场元素置为透明。
// 必须在 render 之前加，否则第一帧会先闪一下完整内容。
if (motionEnabled()) {
  document.documentElement.classList.add("motion");
}

// 整个应用只有这一个入口：把 App 挂进 index.html 里那个空 div。
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
