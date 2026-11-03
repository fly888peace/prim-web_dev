import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * 布局容器 + 入场动画。
 *
 * 这个组件不生产任何看得见的内容：它的 return 里只有一个 <section>，
 * 里面装的是外面传进来的 children。它负责两件事：
 *   1. 提供 .dashboard-grid，让子元素按 12 列栅格排；
 *   2. 挂载后找出所有 .card，让它们依次错峰浮上来。
 *
 * 因为内容全是别人的，它也就不知道该有多少张卡——所以用 querySelectorAll 现场数。
 */
export default function AnimatedCardGrid({ className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(".card");
    if (!cards.length) return;

    // 系统里开了「减少动态效果」就直接摆出来，不播动画
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "none";
      });
      return;
    }

    animate(cards, {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: stagger(90),      // 每张卡错开 90ms
      duration: 640,
      ease: "outBack",         // 弹性落地
    });
  }, []);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
