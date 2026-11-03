// 列表里的「一条记录」。
// 这个组件被 PostList 用 map 循环调用，喂进去一个 post 对象，它就画出一行。
export default function PostEntry({ post, onOpen }) {
  return (
    <a
      className="entry"
      href={`#${post.id}`}
      onClick={(event) => {
        event.preventDefault();
        onOpen(post.id);
      }}
    >
      <div className="entry__thumb">
        <img src={post.cover} alt={post.coverAlt} />
      </div>
      <div className="entry__body">
        <div className="entry__meta">
          <span className="entry__game">{post.game}</span>
          <span className="entry__date">{post.date}</span>
        </div>
        <h2 className="entry__title">{post.title}</h2>
        <p className="entry__excerpt">{post.excerpt}</p>
        <span className="entry__more">阅读全文 →</span>
      </div>
    </a>
  );
}
