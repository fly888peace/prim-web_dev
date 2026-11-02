// 动画底座：所有动画模块都从这里拿 anime.js，只加载一次
// 注意网址末尾的 +esm —— 这是 anime.js 的 ES 模块版本（不是挂 window.anime 的 IIFE 版）
import { animate, stagger } from "animejs";

export { animate, stagger };

// 默认节奏：位移距离、时长、缓动集中放这里，想整体调快调慢只改这一处
const DEFAULTS = {
  y: 18,
  duration: 760,
  gap: 110,
  ease: "outCubic",
};

/**
 * 单个元素各自观察：滚动到自己出现在视口里，才播放入场。
 * 详情页正文这种"一屏放不下"的长内容用它，读一段、浮一段。
 */
export function revealEach(selector, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (records, self) => {
      records.forEach((record) => {
        if (!record.isIntersecting) return;
        self.unobserve(record.target);
        animate(record.target, {
          opacity: [0, 1],
          translateY: [opts.y, 0],
          duration: opts.duration,
          ease: opts.ease,
        });
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * 一组元素整组观察：容器进视口时，子元素依次错峰上浮。
 * 首页记录列表用它，一屏里的几条记录会一个接一个出现，而不是同时闪现。
 */
export function revealGroup(containerSelector, itemSelector, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = container.querySelectorAll(itemSelector);
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (records, self) => {
      if (!records.some((record) => record.isIntersecting)) return;
      self.disconnect();
      animate(items, {
        opacity: [0, 1],
        translateY: [opts.y, 0],
        delay: stagger(opts.gap),
        duration: opts.duration,
        ease: opts.ease,
      });
    },
    { rootMargin: "0px 0px -15% 0px" }
  );

  observer.observe(container);
}
