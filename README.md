# 游戏记录

React + Vite 的游玩记录站：截图 + 文字攻略。

结构对齐课程 zero-to-tech 4.3/4.4 的 demo：两页切换 + dashboard 卡片栅格 + 路由/数据分离。

## 页面与路由

| 地址 | 页面 | 组件 |
|---|---|---|
| `/` | 记录列表 | `HomePage` |
| `/about` | 关于 | `AboutPage` |
| `/post/<id>` | 某篇记录 | `PostPage` |

路由是自己写的 `src/router/useRoute.js`：把「当前在哪一页」存进 `window.location.pathname`，点导航用 `history.pushState` 改地址，前进/后退靠 `popstate`。真实项目里会用 react-router，这里为了看清原理手搓的。

## 目录结构

```
web_dev/
├── index.html                空壳：<div id="root"> + 入口脚本
├── vite.config.js            React 插件挂到 Vite
├── public/images/            截图放这里，引用写 /images/xxx.jpg
└── src/
    ├── main.jsx              入口：引 8 个 CSS + createRoot 挂 App
    ├── App.jsx               总管：读地址栏，三选一
    ├── router/
    │   └── useRoute.js       手写路由（pushState + popstate）
    ├── data/
    │   ├── posts.js          ★ 所有记录的内容
    │   └── site.js           站点文案（品牌、导航、每页标题）
    ├── css/                  8 个文件：reset/variables/layout/nav/hero/cards/post/responsive
    └── components/
        ├── Nav.jsx           顶部导航（三页共用）
        ├── PageHeading.jsx   大标题（三页共用，内容靠 props）
        ├── AnimatedCardGrid.jsx  12 列栅格容器 + 卡片错峰入场
        ├── SearchCard.jsx    筛选卡（受控组件）
        ├── StatsCard.jsx     统计卡
        ├── PostCard.jsx      网格里的一张记录卡
        ├── HomePage.jsx      首页 = hero + 筛选 + 统计 + 记录卡 × N
        ├── AboutPage.jsx     关于页
        ├── PostPage.jsx      详情页
        └── PostBody.jsx      正文渲染：blocks 数组 → 标签
```

调用链：

```
index.html → main.jsx（挂载，全项目唯一一次）
  └─ App.jsx（读 useRoute 的 path，三选一）
     ├─ HomePage  → AnimatedCardGrid[ Nav + PageHeading + SearchCard + StatsCard + PostCard × N ]
     ├─ AboutPage → AnimatedCardGrid[ Nav + PageHeading + 三张卡 ]
     └─ PostPage  → AnimatedCardGrid[ Nav + 返回 + PageHeading + 正文大卡 ]
```

## 本地跑

```bash
npm install     # 只需一次
npm run dev
```

打开终端给的地址（http://localhost:5173）。**不要双击 index.html**——浏览器不认 .jsx。

## 加一条记录

只改 `src/data/posts.js`，在数组最前面加一个对象：

```js
{
  id: "eldenring-01",              // 会成为 /post/eldenring-01，别重名
  game: "艾尔登法环",
  date: "2026.11.02",
  title: "宁姆格福开荒路线",
  excerpt: "列表卡片上的两行摘要",
  cover: "/images/eldenring-01.jpg",   // 截图先放进 public/images/
  coverAlt: "游戏截图",
  coverCaption: "详情页封面下的小字",
  body: [
    { type: "p",      text: "段落" },
    { type: "h2",     text: "小标题" },
    { type: "ul",     items: ["条目一", "条目二"] },
    { type: "ol",     items: ["第一步", "第二步"] },
    { type: "quote",  text: "引用块" },
    { type: "figure", src: "/images/eldenring-02.jpg", alt: "说明", caption: "图下小字" },
    { type: "hr" },
  ],
}
```

存盘自动刷新。首页的统计卡、筛选、详情页全部跟着变——它们读的是同一份数据。

改站点文字（品牌名、导航、各页标题、关于页文案）在 `src/data/site.js`。

## 部署（Nginx）

```bash
git clone <你的仓库地址> /var/www/play-log
cd /var/www/play-log
npm ci
npm run build
```

`/etc/nginx/conf.d/play-log.conf`：

```nginx
server {
    listen 80;
    server_name 你的域名或服务器IP;

    root /var/www/play-log/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`root` 必须指向 `dist/`；`try_files` 最后一行 `/index.html` **这次是必需的**——路由改成了 pathname（`/about`、`/post/xxx`），用户直接打开或刷新这些地址时，要让 Nginx 把 index.html 返回给浏览器，否则 404。

更新内容：`git pull && npm ci && npm run build`，不用重启 Nginx。
