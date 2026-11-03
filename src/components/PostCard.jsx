/**
 * 网格里的一张记录卡。
 * 图片在上、文字在下，整张卡可点，点开的是 /post/<id>。
 * 它不知道自己在第几个、总共有几张——那是 HomePage 用 map 决定的事。
 */
export default function PostCard({ post, onOpen }) {
  return (
    <a
      className="panel panel-half card post-card"
      href={`/post/${post.id}`}
      onClick={(event) => {
        event.preventDefault();
        onOpen(post.id);
      }}
    >
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
    </a>
  );
}
