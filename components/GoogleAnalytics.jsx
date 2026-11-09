// Google Analytics 4（gtag.js）
//
// 放在 app/layout.jsx 里，layout 是全站外壳，所以每个页面都会被包含，
// 不需要在 HomeView / PostView / AboutView 里各引一次。
//
// 用 next/script 而不是原生 <script>：
//   - afterInteractive 表示等页面可交互后再加载，不阻塞首屏；
//   - 同一个 id 的 Script 在客户端路由切换时不会重复插入。
//
// 测量 ID 走环境变量（构建时注入），没配就退回占位符。
// 占位符只是让这段代码结构完整，G-XXXXXXXXXX 不是有效 ID，不会产生任何数据。
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
