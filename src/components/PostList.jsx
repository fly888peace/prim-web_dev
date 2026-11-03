import { useEffect, useRef } from "react";
import { revealGroup, motionEnabled } from "../lib/motion.js";
import PostEntry from "./PostEntry.jsx";

// 首页的记录列表：容器进视口时，几条记录依次错峰上浮。
// 和 4.2 的差别只在于——这里没有一段手写的 <a class="entry">，
// 只有一次 map，有多少条数据就画多少条。
export default function PostList({ posts, onOpen }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!motionEnabled()) return;

    const list = listRef.current;
    if (!list) return;

    // 这里不能加「只跑一次」的标记。
    // StrictMode 下 effect 会「执行 → 清理 → 再执行」，
    // 如果第二次因为标记直接 return，第一次的 observer 又已经被清理掉，
    // 就永远没人观察这块列表，条目会一直停在 opacity:0 上（整块空白）。
    return revealGroup(list, ".entry", { y: 22, gap: 120, duration: 820 });
  }, []);

  return (
    <section className="list" aria-label="记录列表" ref={listRef}>
      {posts.map((post) => (
        <PostEntry key={post.id} post={post} onOpen={onOpen} />
      ))}
    </section>
  );
}
