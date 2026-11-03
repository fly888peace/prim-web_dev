import { useState } from "react";
import { posts } from "../data/posts.js";
import { site } from "../data/site.js";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import SearchCard from "./SearchCard.jsx";
import StatsCard from "./StatsCard.jsx";
import PostCard from "./PostCard.jsx";

// 一串日期写法固定是 2026.10.14，去掉点按数字比大小就够
const dateValue = (text) => Number(text.replace(/\./g, ""));

export default function HomePage({ current, onNavigate, onOpen }) {
  // 关键字存在这一层，因为「筛选框」和「记录列表」两个子组件都要用它。
  // 谁的数据被多方共用，谁就往上挪一层——这是 React 里最常见的一次提级。
  const [keyword, setKeyword] = useState("");

  const query = keyword.trim();
  const filtered = query
    ? posts.filter((post) =>
        `${post.game}${post.title}${post.excerpt}`.includes(query)
      )
    : posts;

  const latest = posts.map((post) => post.date).sort((a, b) => dateValue(a) - dateValue(b)).at(-1);
  const gameCount = new Set(posts.map((post) => post.game)).size;

  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <Nav current={current} onNavigate={onNavigate} />
        <PageHeading title={site.home.title} subtitle={site.home.subtitle} />
      </article>

      <SearchCard value={keyword} onChange={setKeyword} count={filtered.length} total={posts.length} />
      <StatsCard total={posts.length} games={gameCount} latest={latest} />

      {filtered.length ? (
        filtered.map((post) => <PostCard key={post.id} post={post} onOpen={onOpen} />)
      ) : (
        <article className="panel panel-full empty-panel">
          <p>没有匹配「{query}」的记录。</p>
        </article>
      )}
    </AnimatedCardGrid>
  );
}
