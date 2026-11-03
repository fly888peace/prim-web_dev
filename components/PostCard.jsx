import Link from "next/link";

/**
 * 网格里的一张记录卡。
 * 图片在上、文字在下，整张卡可点，点开的是 /post/<id>。
 * 4.4 是 <a href> + onClick 拦下来调 onOpen；现在直接交给 Next 的 <Link>：
 * 它会自己接管点击、只换内容不刷新整页。
 */
export default function PostCard({ post }) {
  return (
    <Link className="panel panel-half card post-card" href={`/post/${post.id}`}>
      <div className="post-card__cover">
        <img src={post.cover} alt={post.coverAlt} loading="lazy" />
      </div>

      <div className="post-card__body">
        <div className="post-card__meta">
          <span className="post-card__game">{post.game}</span>
          <span>{post.date}</span>
        </div>
        <h3 className="post-card__title">{post.title}</h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
      </div>
    </Link>
  );
}
