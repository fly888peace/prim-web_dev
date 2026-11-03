import { useEffect, useRef } from "react";
import { revealEach, motionEnabled } from "../lib/motion.js";
import PostBody from "./PostBody.jsx";
import Footer from "./Footer.jsx";

// 详情页：阅读进度条 + 标题区 + 封面 + 正文。
// 原来这套东西是一个独立的 posts/xxx.html 文件，现在是一个组件，
// 换哪篇记录只是传不同 props —— 页面结构永远只有这一份。
export default function PostDetail({ post, onBack }) {
  const barRef = useRef(null);
  const headRef = useRef(null);
  const coverRef = useRef(null);
  const articleRef = useRef(null);

  // 逐段浮现：标题区、封面、正文每一段各自观察，滚到哪儿哪儿浮上来
  useEffect(() => {
    if (!motionEnabled()) return;

    const head = headRef.current;
    const cover = coverRef.current;
    const article = articleRef.current;
    if (!head || !cover || !article) return;

    const nodes = [...head.children, cover, ...article.children];
    return revealEach(nodes, { y: 16, duration: 700 });
  }, [post.id]);

  // 顶部阅读进度条
  useEffect(() => {
    const bar = barRef.current;
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

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [post.id]);

  return (
    <>
      <div className="reading-progress" aria-hidden="true" ref={barRef} />

      <header className="post__head" ref={headRef}>
        <a
          className="post__back"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          ← 全部记录
        </a>
        <div className="post__meta">
          <span className="post__game">{post.game}</span>
          <span className="post__date">{post.date}</span>
        </div>
        <h1 className="post__title">{post.title}</h1>
      </header>

      <figure className="post__cover" ref={coverRef}>
        <img src={post.cover} alt={post.coverAlt} />
        <figcaption>{post.coverCaption}</figcaption>
      </figure>

      <article className="article" ref={articleRef}>
        <PostBody blocks={post.body} />
      </article>

      <Footer />
    </>
  );
}
