// app/post/[id]/page.jsx → 网站路径 "/post/<任意 id>"
// 方括号就是「这一段是变量」的意思：/post/sample-01 里的 sample-01 会变成 params.id。
//
// 这一页在 4.4 里是靠 useRoute 读地址栏、再 posts.find() 找出来的；
// 现在是 Next 按文件夹认路，并把每一篇都**预渲染成真实的 HTML 文件**。
import { notFound } from "next/navigation";
import { posts } from "../../../data/posts.js";
import PostView from "../../../components/PostView.jsx";

// 告诉 Next：这条动态路由在 build 时要生成哪些具体页面。
// 有几篇记录，就预渲染几个 HTML 文件（少写这个函数，路由就变成按需渲染）。
export async function generateStaticParams() {
  return posts.map((post) => ({ id: post.id }));
}

// 每一篇的标题写进 <head>——这就是 Next 送你的 SEO：爬虫不跑 JS 也读得到。
export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = posts.find((item) => item.id === id);
  if (!post) return { title: "找不到这篇记录" };
  return { title: `${post.title} · 游戏记录`, description: post.excerpt };
}

export default async function Page({ params }) {
  // Next 15 起 params 是个 Promise，要 await 才能拿到里面的字段
  const { id } = await params;
  const post = posts.find((item) => item.id === id);

  // 地址栏里敲了个不存在的 id → 走 404
  if (!post) notFound();

  return <PostView post={post} />;
}
