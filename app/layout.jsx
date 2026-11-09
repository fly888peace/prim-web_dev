// app/layout.jsx 是 Next.js 的「全站外壳」，所有页面都套在它里面。
// 它接手了 4.4 里 index.html + main.jsx + App.jsx 最外层那圈壳：
//   - <html> / <body> 由它提供（4.4 写在 index.html 里）
//   - app-shell / page-shell 这层包裹，原样搬过来
//   - 8 行 CSS import 也搬到这里，顺序不变
//
// 注意：导航条 Nav 不在 layout 里，它在每一页的 hero 里，这样每页都能自己控制高亮。

import "../css/reset.css";
import "../css/variables.css";
import "../css/layout.css";
import "../css/nav.css";
import "../css/hero.css";
import "../css/cards.css";
import "../css/post.css";
import "../css/responsive.css";

// 全站统计：放在 layout 里，所有页面自动带上，不用每页各引一次
import GoogleAnalytics from "../components/GoogleAnalytics.jsx";

// 站点标题和描述：写在这里，所有页面共享；Next 会把它塞进每页的 <head>
export const metadata = {
  title: "游戏记录 · 截图与攻略",
  description: "我玩过的游戏，截图和攻略都记在这里。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app-shell">
          <div className="page-shell">{children}</div>
        </div>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
