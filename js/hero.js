// 首屏：大标题拆成单字逐个上浮，小标和副标题随后跟上
import { animate, stagger } from "./motion.js";

export function initHero() {
  const hero = document.querySelector(".hero");
  const title = document.querySelector(".hero__title");
  if (!hero || !title) return;

  splitChars(title);

  // CSS 先把整个标题藏住了，拆完字才放开；
  // 单字本身还是透明的，所以看到的是"一个个字浮上来"，不会先闪一句完整标题
  title.style.opacity = "1";

  // 标题单字：先下沉一点再弹回，缓动用 outBack 才有那个回弹的尾巴
  animate(hero.querySelectorAll(".hero__char"), {
    opacity: [0, 1],
    translateY: [26, 0],
    delay: stagger(90),
    duration: 900,
    ease: "outBack",
  });

  // 小标与副标题：比标题晚一拍，跟上来
  animate(hero.querySelectorAll(".hero__eyebrow, .hero__sub"), {
    opacity: [0, 1],
    translateY: [14, 0],
    delay: stagger(120, { start: 260 }),
    duration: 800,
    ease: "outCubic",
  });

  // 给 CSS 一个信号：标题下方那道墨线可以展开了
  hero.classList.add("is-in");
}

/**
 * 把标题拆成 <span class="hero__char">单字</span>。
 * 读屏软件会念 aria-label 里的完整标题，逐字 span 标了 aria-hidden，
 * 所以拆字只是视觉上的事，不影响无障碍。
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
