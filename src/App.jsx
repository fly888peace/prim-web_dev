import { useEffect, useState } from "react";
import { posts } from "./data/posts.js";
import SiteHero from "./components/SiteHero.jsx";
import PostList from "./components/PostList.jsx";
import PostDetail from "./components/PostDetail.jsx";
import Footer from "./components/Footer.jsx";

// 从地址栏的 # 后面读出「当前打开哪篇记录」。
// #sample-01 → "sample-01"；没有 → null（首页）
function readHashId() {
  const id = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  return id || null;
}

/**
 * 总管组件。它只记一件事：现在该显示首页，还是某篇记录。
 *
 * 注意：下面这两段 useEffect 是课程 4.3 之外的补充。
 * 4.3 用 useState 在两个页面之间切换就够了，但那样有个副作用——
 * 刷新页面会退回首页、链接也没法发给别人。
 * 这里把状态和地址栏的 # 绑在一起，刷新和分享都能落回同一篇。
 * 不想要的话，把 hash 相关的两段删掉，openPost/closePost 改成只 setActiveId 即可。
 */
export default function App() {
  const [activeId, setActiveId] = useState(readHashId);

  // 地址栏的 # 变了（前进/后退、手动改），跟着同步
  useEffect(() => {
    const sync = () => setActiveId(readHashId());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // 换页时回到顶部，不然点开一篇长文会停在上一页的滚动位置
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeId]);

  const openPost = (id) => {
    window.location.hash = id;
    setActiveId(id);
  };

  const closePost = () => {
    window.location.hash = "";
    setActiveId(null);
  };

  const activePost = posts.find((post) => post.id === activeId);

  if (activePost) {
    return <PostDetail post={activePost} onBack={closePost} />;
  }

  return (
    <>
      <SiteHero />
      <main>
        <PostList posts={posts} onOpen={openPost} />
      </main>
      <Footer />
    </>
  );
}
