// 全站脚本入口：每个页面只引这一个文件。
// 它本身不带 CDN 依赖 —— anime.js 是在 try/catch 里用动态 import 拿的，
// 所以就算 CDN 挂了、或者直接双击 file:// 打开，页面也只是没有动画，不会一片空白。
import { initYear } from "./year.js";

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initYear();

if (!reducedMotion) {
  // 打开"先藏起来"的开关：css/effects.css 里靠 html.motion 决定要不要把待入场元素置为透明
  root.classList.add("motion");

  try {
    const [hero, list, post] = await Promise.all([
      import("./hero.js"),
      import("./list.js"),
      import("./post.js"),
    ]);

    // 三个模块各自先找自己的目标元素，找不到就直接返回，所以在哪个页面都能安全调用
    hero.initHero();
    list.initList();
    post.initPost();
  } catch (error) {
    // 动画没起来：撤掉开关，退回普通静态展示
    root.classList.remove("motion");
    console.warn("[motion] 动画模块加载失败，已退回静态显示：", error);
  }
}
