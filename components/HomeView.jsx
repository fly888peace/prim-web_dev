"use client";

// 首页。结构、文案和 4.4 的 HomePage 一模一样（只是改名 HomePage → HomeView）。
// 和 demo 不同的地方：这里的「筛选」用了 useState，所以它必须是客户端组件。
// （demo 的 TextLab 把 state 藏在 InputCard 里，页面本身才可能留成服务端组件。）
import { useState } from "react";
import { posts } from "../data/posts.js";
import { site } from "../data/site.js";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import SearchCard from "./SearchCard.jsx";
import StatsCard from "./StatsCard.jsx";
import PostCard from "./PostCard.jsx";

// 日期写法固定是 2026.10.14，去掉点按数字比大小就够
const dateValue = (text) => Number(text.replace(/\./g, ""));

export default function HomeView() {
  // 关键字存在这一层：筛选框和记录列表两个子组件都要用它
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
        <Nav />
        <PageHeading title={site.home.title} subtitle={site.home.subtitle} />
      </article>

      <SearchCard value={keyword} onChange={setKeyword} count={filtered.length} total={posts.length} />
      <StatsCard total={posts.length} games={gameCount} latest={latest} />

      {filtered.length ? (
        filtered.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <article className="panel panel-full empty-panel">
          <p>没有匹配「{query}」的记录。</p>
        </article>
      )}
    </AnimatedCardGrid>
  );
}
