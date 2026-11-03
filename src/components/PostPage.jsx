import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import PostBody from "./PostBody.jsx";

/**
 * 详情页。整页只有两张卡：
 *   一张是顶部 hero（导航 + 标题），一张是正文大卡。
 * 换一篇记录只是换 props，页面结构永远只有这一份。
 */
export default function PostPage({ post, current, onNavigate, onBack }) {
  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <Nav current={current} onNavigate={onNavigate} />
        <a
          className="post-back"
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          ← 全部记录
        </a>
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
