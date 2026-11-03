import { useEffect, useRef } from "react";
import { animate, stagger, motionEnabled } from "../lib/motion.js";

// 首屏：大标题拆成单字逐个上浮，小标和副标题随后跟上。
// 原来这段逻辑写在 js/hero.js 里，靠 document.querySelector 找元素；
// 现在用 ref 直接拿到本组件自己的 DOM 节点，不再满页面找。
export default function SiteHero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!motionEnabled()) return;

    const hero = heroRef.current;
    const title = titleRef.current;

    // StrictMode 下 effect 会跑两遍，这里挡一下，避免把已经拆好的标题再拆一次
    if (!hero || !title || hero.dataset.played === "1") return;
    hero.dataset.played = "1";

    splitChars(title);

    // CSS 先把整个标题藏住了，拆完字才放开；
    // 单字本身还是透明的，所以看到的是「一个个字浮上来」
    title.style.opacity = "1";

    animate(hero.querySelectorAll(".hero__char"), {
      opacity: [0, 1],
      translateY: [26, 0],
      delay: stagger(90),
      duration: 900,
      ease: "outBack",
    });

    animate(hero.querySelectorAll(".hero__eyebrow, .hero__sub"), {
      opacity: [0, 1],
      translateY: [14, 0],
      delay: stagger(120, { start: 260 }),
      duration: 800,
      ease: "outCubic",
    });

    // 给 CSS 一个信号：标题下方那道墨线可以展开了
    hero.classList.add("is-in");
  }, []);

  return (
    <header className="hero" ref={heroRef}>
      <p className="hero__eyebrow">PLAY LOG</p>
      <h1 className="hero__title" ref={titleRef}>游戏记录</h1>
      <p className="hero__sub">玩过的、卡住的、终于过了的，都记在这里</p>
    </header>
  );
}

/**
 * 把标题拆成 <span class="hero__char">单字</span>。
 * 读屏软件念 aria-label 里的完整标题，逐字 span 标了 aria-hidden，
 * 拆字只影响视觉，不影响无障碍。
 */
function splitChars(el) {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  el.textContent = "";

  Array.from(text).forEach((char) => {
    if (/\s/.test(char)) {
      el.appendChild(document.createTextNode(" "));
      return;
    }
    const span = document.createElement("span");
    span.className = "hero__char";
    span.textContent = char;
    span.setAttribute("aria-hidden", "true");
    el.appendChild(span);
  });
}
