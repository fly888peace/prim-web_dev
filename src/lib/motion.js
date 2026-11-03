// 动画底座：全站只在这个文件里 import anime.js
// 原来 js/motion.js 用 document.querySelector 找元素；
// 现在改成「谁调用谁把元素递进来」，React 里拿到 DOM 的标准做法是 ref。
import { animate, stagger } from "animejs";

export { animate, stagger };

// 默认节奏：想整体调快调慢只改这一处
const DEFAULTS = {
  y: 18,
  duration: 760,
  gap: 110,
  ease: "outCubic",
};

/** 系统里开了「减少动态效果」时不播动画（css/effects.css 里也有一套同样的判断） */
export function motionEnabled() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 单个元素各自观察：滚到自己出现在视口里，才播放入场。
 * 详情页正文这种「一屏放不下」的长内容用它，读一段、浮一段。
 * 返回一个清理函数，交给 useEffect 当返回值，组件卸载时断开观察。
 */
export function revealEach(elements, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const targets = Array.from(elements).filter(Boolean);
  if (!targets.length) return () => {};

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
  return () => observer.disconnect();
}

/**
 * 一组元素整组观察：容器进视口时，子元素依次错峰上浮。
 * 首页记录列表用它，几条记录一个接一个出现。
 */
export function revealGroup(container, itemSelector, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  if (!container) return () => {};

  const items = container.querySelectorAll(itemSelector);
  if (!items.length) return () => {};

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
  return () => observer.disconnect();
}
