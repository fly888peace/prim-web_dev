import Link from "next/link";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import PostBody from "./PostBody.jsx";

/**
 * 详情页。整页两张卡：顶部 hero（导航 + 标题），一张正文大卡。
 *
 * 和 4.4 的区别只有一个：4.4 传进来的是 current / onNavigate / onBack 三个回调，
 * 现在这些全被 Next 接管了——跳页写成 <Link>，当前在哪由 Nav 自己去问 usePathname。
 * 所以这个组件只剩一个 props：post。它是纯展示的，不需要 "use client"。
 */
export default function PostView({ post }) {
  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <Nav />
        <Link className="post-back" href="/">
          ← 全部记录
        </Link>
        <PageHeading
          eyebrow={`${post.game} · ${post.date}`}
          title={post.title}
          subtitle={post.coverCaption}
        />
      </article>

      <article className="panel panel-full card post-panel">
        <img className="post-cover" src={post.cover} alt={post.coverAlt} />

        <div className="article">
          <PostBody blocks={post.body} />
        </div>
      </article>
    </AnimatedCardGrid>
  );
}
