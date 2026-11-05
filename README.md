# 游戏记录

Next.js 15（App Router）的游玩记录站：截图 + 文字攻略。

三个页面，全部在 build 时**预渲染成真实的 HTML 文件**——直接访问不 404、首屏不用等 JS、爬虫也能读到内容。

## 页面（文件夹 = 路由）

| 文件 | 地址 |
|---|---|
| `app/page.jsx` | `/` |
| `app/about/page.jsx` | `/about` |
| `app/post/[id]/page.jsx` | `/post/<id>`，比如 `/post/sample-01` |

加页面不用注册路由，新建文件夹 + `page.jsx` 就行。加一篇记录也不用建文件，那是数据的事（见下）。

## 目录结构

```
web_dev/
├── app/
│   ├── layout.jsx            全站外壳：<html>/<body> + 8 个 CSS + metadata
│   ├── page.jsx              /
│   ├── about/page.jsx        /about
│   └── post/[id]/page.jsx    /post/<id>（generateStaticParams 决定预渲染哪几篇）
├── components/
│   ├── Nav.jsx               "use client"（Link + usePathname）
│   ├── HomeView.jsx          "use client"（useState 筛选）
│   ├── SearchCard.jsx        "use client"（受控输入）
│   ├── AnimatedCardGrid.jsx  "use client"（anime.js 入场动画）
│   ├── PostCard.jsx          服务端（Link）
│   ├── PostView.jsx          服务端
│   ├── AboutView.jsx         服务端
│   ├── PageHeading.jsx       服务端
│   ├── StatsCard.jsx         服务端
│   └── PostBody.jsx          服务端
├── data/
│   ├── posts.js              ★ 所有记录的内容
│   └── site.js               站点文案（品牌、导航、每页标题）
├── css/                      8 个样式文件
├── public/images/            截图放这里，引用写 /images/xxx.jpg
└── next.config.mjs
```

### `"use client"` 怎么判断

- 用到 `useState` / `useEffect` / `usePathname` / 点击事件 / 动画 → 顶上写 `"use client"`
- 纯展示、只是把别的组件摆在一起 → 不写，默认是服务端组件，build 时直接渲染成 HTML

注意：写了 `"use client"` 不等于「不预渲染」。客户端组件同样会被预渲染成 HTML，只是额外再送一份 JS 到浏览器让它能交互。

## 命令

```bash
npm install     # 只需一次
npm run dev     # 开发，http://localhost:3000（注意不是 5173）
npm run build   # 构建
npm start       # 用构建产物起服务，同样是 3000
```

## 加一条记录

只改 `data/posts.js`，在数组最前面加一个对象：

```js
{
  id: "eldenring-01",              // 会成为 /post/eldenring-01，别重名
  game: "艾尔登法环",
  date: "2026.11.02",
  title: "宁姆格福开荒路线",
  excerpt: "列表卡片上的两行摘要",
  cover: "/images/eldenring-01.jpg",
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

`generateStaticParams` 会自动把新 id 加入预渲染列表，`/post/eldenring-01` 直接可访问。截图丢进 `public/images/`。

改站点文字在 `data/site.js`。

## 部署

和 Vite 那版不同：**Nginx 不能直接指向源码或某个静态目录了**，Next 有自己的服务器。

### 方案 A：Node 常驻 + Nginx 反代（推荐）

```bash
# 服务器上，先装 Node（nvm 或 apt 都行）
cd ~/web_dev && git pull && npm install && npm run build
npm start            # 监听 3000，可以配合 pm2 / systemd 常驻
```

Nginx 只做转发：

```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 方案 B：静态导出，仍交给 Nginx

`next.config.mjs` 加一行 `output: "export"`，然后 `npm run build`，产物在 `out/`，可以像 Vite 的 `dist/` 一样丢给 Nginx：

```nginx
root /var/www/web_dev/out;
location / {
    try_files $uri $uri/ $uri.html /index.html;
}
```

代价：所有页面在 build 时就定死了，以后要加「每次请求都不同」的动态内容就没法办。当前这个站全是静态内容，方案 B 完全够用。

## 前后端联调

前端（3000）和后端（8000）是两个独立进程，各开一个终端。

### 后端

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

`--reload` 让改完 Python 自动重启，省得每次按 Ctrl+C。启动后打开 http://localhost:8000/docs 是 FastAPI 自动生成的接口文档。

### 前端

```powershell
npm run dev      # http://localhost:3000
```

### 两个接口

| 接口 | 用在哪 |
|---|---|
| `GET /api/profile` | 首页标题、副标题（拿不到就用 `data/site.js` 打底） |
| `POST /api/analyze` | 关于页的「试一试」卡，返回分数和判断 |

### 环境变量

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

组件里读 `process.env.NEXT_PUBLIC_API_BASE_URL`。改完必须**重启** `npm run dev` 才生效，因为环境变量是启动时读的。

`NEXT_PUBLIC_` 前缀意味着这个值会**被打包进浏览器代码**，只能放公开地址，不能放密钥。

### CORS 是一对，别只改一半

`backend/main.py` 里：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # ← 前端的地址
    allow_methods=["GET", "POST"],
)
```

这个 `allow_origins` 必须和前端实际访问地址一致。换端口、换域名、部署上线，两边要同时改，否则浏览器报 CORS 错误。

### 为什么点一次按钮会出现两条请求

`POST /api/analyze` 带了 `Content-Type: application/json`，属于「非简单请求」，浏览器会先自动发一条 `OPTIONS` 预检，通过后才发真正的 POST。这条 OPTIONS 不是你写的代码，是浏览器发的，`curl` 里永远看不到。

### 静态导出的注意点

`next.config.mjs` 里用了 `output: "export"`，前端产物是一堆死文件，没有服务端。所以：

- 所有 fetch 必须写在 `"use client"` 组件里
- 后端地址在 **build 那一刻**就被写进 JS 了，改 `.env.local` 后必须重新 `npm run build`，光重启服务没用

## 和上一版（Vite + React）的差别

- `index.html`、`main.jsx`、`App.jsx`、`src/router/useRoute.js` 全部删掉了：路由交给文件夹，挂载交给框架
- 跳转从 `onClick + history.pushState` 换成 `<Link href>`
- 页面不再是一个空 `<div id="root">` + JS 现画，而是 build 出真实的 `.html` 文件
- 每个页面的标题从 `generateMetadata` 出，爬虫不跑 JS 也读得到
