import { useRoute } from "./router/useRoute.js";
import { posts } from "./data/posts.js";
import HomePage from "./components/HomePage.jsx";
import AboutPage from "./components/AboutPage.jsx";
import PostPage from "./components/PostPage.jsx";

/**
 * 总管组件。它只干一件事：读地址栏，决定显示哪一页。
 *
 * 地址栏和页面的对应关系：
 *   /                  → 首页（记录列表）
 *   /about             → 关于
 *   /post/sample-01    → 某一篇记录
 *
 * 页面自己不知道地址是什么，它们只收到「现在该显示什么」和「要跳转时该怎么改」。
 */
export default function App() {
  const { path, navigate } = useRoute();

  // /post/ 后面那一截就是记录的 id
  const postId = path.startsWith("/post/")
    ? decodeURIComponent(path.slice("/post/".length))
    : null;
  const activePost = postId ? posts.find((post) => post.id === postId) : null;

  const page = activePost ? "post" : path.startsWith("/about") ? "about" : "home";

  // 详情页也算「记录」区，导航里高亮「记录」
  const navCurrent = page === "about" ? "about" : "home";

  let content;
  if (page === "post") {
    content = (
      <PostPage
        post={activePost}
        current={navCurrent}
        onNavigate={navigate}
        onBack={() => navigate("/")}
      />
    );
  } else if (page === "about") {
    content = <AboutPage current={navCurrent} onNavigate={navigate} />;
  } else {
    content = (
      <HomePage
        current={navCurrent}
        onNavigate={navigate}
        onOpen={(id) => navigate(`/post/${id}`)}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="page-shell">{content}</div>
    </div>
  );
}
