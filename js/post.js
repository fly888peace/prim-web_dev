// 详情页：正文逐段浮现 + 顶部阅读进度条
import { revealEach } from "./motion.js";

export function initPost() {
  const article = document.querySelector(".article");
  if (!article) return;

  // 标题区、封面、正文每一段各自观察，读者滚到哪儿，哪儿浮上来
  revealEach(".post__head > *, .post__cover, .article > *", {
    y: 16,
    duration: 700,
  });

  initProgress();
}

/**
 * 顶部阅读进度：把滚动进度换算成 0~1，写到进度条的 scaleX 上。
 * 用 requestAnimationFrame 节流，滚动事件再频繁也只在一帧里算一次。
 */
function initProgress() {
  const bar = document.querySelector(".reading-progress");
  if (!bar) return;

  let queued = false;

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    bar.style.transform = `scaleX(${ratio})`;
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      update();
      queued = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
  update();
}
