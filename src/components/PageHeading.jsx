/**
 * 页面顶部的大标题 + 副标题。
 * 三个页面都用它，只是喂进去的文字不同——这就是 props 的意义：
 * 结构写一次，内容由调用方给。
 */
export default function PageHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="hero-copy">
      {eyebrow ? <p className="hero-eyebrow">{eyebrow}</p> : null}
      <h1 className="hero-display">{title}</h1>
      {subtitle ? <p className="hero-subtitle">{subtitle}</p> : null}
    </div>
  );
}
