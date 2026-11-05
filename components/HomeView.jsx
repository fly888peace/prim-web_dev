"use client";

// 首页。结构没变，只多了一件事：标题和副标题先问后端要。
//
// 流程是「打底 + 覆盖」：
//   1. 先用 data/site.js 里的文案渲染（保证首屏立刻有字，不等网络）
//   2. 挂载后 GET /api/profile，拿到数据再覆盖
//   3. 请求失败就什么都不做，页面继续用 site.js 的内容——不会白屏
import { useEffect, useState } from "react";
import { posts } from "../data/posts.js";
import { site } from "../data/site.js";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import SearchCard from "./SearchCard.jsx";
import StatsCard from "./StatsCard.jsx";
import PostCard from "./PostCard.jsx";

// 后端地址不写死，从环境变量读。改地址只动 .env.local，不用翻组件。
const API = process.env.NEXT_PUBLIC_API_BASE_URL;

// 日期写法固定是 2026.10.14，去掉点按数字比大小就够
const dateValue = (text) => Number(text.replace(/\./g, ""));

export default function HomeView() {
  // 关键字存在这一层：筛选框和记录列表两个子组件都要用它
  const [keyword, setKeyword] = useState("");

  // 标题先拿本地文案打底，后端的回来了再换掉
  const [hero, setHero] = useState(site.home);

  useEffect(() => {
    let alive = true; // 组件卸载后别再 setState

    fetch(`${API}/api/profile`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!alive || !data?.heroTitle) return;
        // 后端字段叫 heroTitle / heroSubtitle，这里映射成组件用的 title / subtitle
        setHero({ title: data.heroTitle, subtitle: data.heroSubtitle });
      })
      .catch((err) => {
        // 后端没跑、CORS 被拦，都走这里。不打红字，页面保持打底数据
        console.warn("[profile] 取后端数据失败，继续用 site.js 的文案：", err.message);
      });

    return () => {
      alive = false;
    };
  }, []);

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
        <PageHeading title={hero.title} subtitle={hero.subtitle} />
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
