"use client";

// 顶部横条：左边品牌，右边导航。
// 和 4.4 长得一样，只换了「跳页面」的写法：
//   4.4 是手搓的 useRoute + onClick 调 navigate + 自己监听 popstate
//   现在 Next 全接管了：<Link href> 负责跳，usePathname() 负责告诉你现在在哪
//
// 用到 usePathname，得在浏览器里跑，所以顶上必须写 "use client"。
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "../data/site.js";

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="hero-topline">
      <p className="brand-eyebrow">{site.brand}</p>

      <nav className="inline-links">
        {site.nav.map((item) => {
          // 首页要把 /post/xxx 也算进来——详情页属于「记录」这一区
          const active =
            item.path === "/"
              ? pathname === "/" || pathname.startsWith("/post")
              : pathname.startsWith(item.path);

          return (
            <Link
              key={item.key}
              href={item.path}
              className={"nav-link" + (active ? " active" : "")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
