// 正文渲染器：把 data/posts.js 里那段 blocks 数组，翻译成真正的标签。
// 每块按 type 分派——这就是「数据驱动界面」最小的一个例子：
// 你只写数据长什么样，标签由这里统一生成。
export default function PostBody({ blocks }) {
  return blocks.map((block, index) => {
    const key = `${block.type}-${index}`;

    switch (block.type) {
      case "h2":
        return <h2 key={key}>{block.text}</h2>;

      case "ol":
        return (
          <ol key={key}>
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );

      case "ul":
        return (
          <ul key={key}>
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );

      case "quote":
        return (
          <blockquote key={key}>
            <p>{block.text}</p>
          </blockquote>
        );

      case "figure":
        return (
          <figure key={key}>
            <img src={block.src} alt={block.alt} />
            {block.caption ? <figcaption>{block.caption}</figcaption> : null}
          </figure>
        );

      case "hr":
        return <hr key={key} />;

      case "p":
      default:
        return <p key={key}>{block.text}</p>;
    }
  });
}
