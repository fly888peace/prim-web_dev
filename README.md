# 游戏记录

记录自己玩过的游戏：截图 + 文字攻略。

React + Vite。页面结构、正文内容都写在组件和数据文件里，`index.html` 只是一个空壳挂载点。

## 目录结构

```
web_dev/
├── index.html                空壳：只有 <div id="root"> 和一行入口脚本
├── package.json              依赖与脚本（vite / react / animejs）
├── vite.config.js            把 React 插件挂到 Vite 上
├── public/
│   └── images/               图片放这里，引用时写 /images/xxx.jpg
├── src/
│   ├── main.jsx              总入口：引 9 个 CSS，把 App 挂进 #root
│   ├── App.jsx               总管：决定显示首页还是某篇记录
│   ├── data/
│   │   └── posts.js          ★ 所有记录的内容都在这里
│   ├── lib/
│   │   └── motion.js         动画底座：anime.js + 滚动入场封装
│   ├── css/                  9 个样式文件，从旧版原样搬来
│   │   ├── variables.css     设计变量：配色、字体、缓动
│   │   ├── reset.css         基础重置
│   │   ├── layout.css        版心骨架
│   │   ├── hero.css          首屏
│   │   ├── list.css          首页记录列表
│   │   ├── post.css          详情页排版 + 阅读进度条
│   │   ├── footer.css        页脚
│   │   ├── effects.css       入场动效的"起手状态"与降级
│   │   └── responsive.css    小屏适配 + 减少动态效果
│   └── components/
│       ├── SiteHero.jsx      首屏：标题拆字逐字上浮
│       ├── PostList.jsx      列表容器：条目错峰入场
│       ├── PostEntry.jsx     列表里的一条
│       ├── PostDetail.jsx    详情页：标题区 + 封面 + 正文 + 进度条
│       ├── PostBody.jsx      正文渲染：把 blocks 数组翻成标签
│       └── Footer.jsx        页脚
├── node_modules/             本地依赖，不入库
└── dist/                     构建产物，不入库
```

组件之间的调用关系：

```
index.html
└─ src/main.jsx
   └─ App.jsx
      ├─ 首页：SiteHero → main > PostList → PostEntry × N → Footer
      └─ 详情：PostDetail → PostBody → Footer
```

## 本地跑

```bash
npm install     # 只需一次
npm run dev
```

终端给的地址（一般是 http://localhost:5173）直接用浏览器打开。

**不要双击 `index.html` 打开**：浏览器不认 `.jsx`，必须经过 Vite 编译。

## 加一条记录

只需要改 `src/data/posts.js`，不用碰任何 HTML。

1. 截图丢进 `public/images/`，比如 `eldenring-01.jpg`。
   宽度压到 1600px 以内、单张 500KB 以下就够，手机上看也快。
2. 打开 `src/data/posts.js`，在数组**最前面**加一个对象：

```js
{
  id: "eldenring-01",              // 会成为地址栏的 #eldenring-01，别重名
  game: "艾尔登法环",
  date: "2026.11.02",
  title: "宁姆格福开荒路线",
  excerpt: "列表里显示的两行摘要",
  cover: "/images/eldenring-01.jpg",   // 列表缩略图 + 详情页封面用同一张
  coverAlt: "游戏截图",
  coverCaption: "封面图下面那行小字",
  body: [ /* 正文，见下 */ ]
}
```

3. `body` 是一个数组，按顺序往下排，支持这几种块：

```js
{ type: "p",      text: "一个段落" }
{ type: "h2",     text: "小标题" }
{ type: "ul",     items: ["条目一", "条目二"] }
{ type: "ol",     items: ["第一步", "第二步"] }
{ type: "quote",  text: "引用块" }
{ type: "figure", src: "/images/eldenring-02.jpg", alt: "说明", caption: "图下小字" }
{ type: "hr" }
```

存盘，页面自动刷新。列表和详情都会跟着变——它们读的是同一份数据。

正文里的段落不需要额外注册：`PostDetail.jsx` 是按 `.article > *` 逐个观察的，新块自动带入场动画。

## 几个设计点

**CSS 完全没被 React 碰过。** 9 个文件是旧的 vanilla 版本原样搬来的，唯一的变化是从 `<link>` 改成了 `main.jsx` 里的 `import`——那是 Vite 的扩展语法，它负责合并、注入/抽取，React 只负责在 JSX 里写 `className`。

**动画的降级。** `effects.css` 里所有"先藏起来"的规则都挂在 `html.motion` 下；`main.jsx` 只在 `motionEnabled()` 为真（用户没开"减少动态效果"）时才加这个类。加类之前不渲染，避免第一帧闪一下完整内容。

**StrictMode 下别乱加"只跑一次"的标记。** 开发模式下 effect 会「执行 → 清理 → 再执行」。如果第二次靠标记直接 return，而第一次的 observer 已经被清理掉，列表会永远停在 `opacity:0` 上（整块空白）。`PostList.jsx` 里有一段注释专门记这个坑。

**进度条有两层实现。** `post.css` 里写了 `@supports (animation-timeline: scroll())` 的纯 CSS 版本，浏览器支持滚动驱动动画时 JS 不参与；不支持的浏览器才走 `PostDetail.jsx` 里的 `scaleX` 计算。

**拆字不影响读屏。** `SiteHero.jsx` 拆字时保留完整 `aria-label`，逐字 `<span>` 标了 `aria-hidden="true"`。

## 地址与刷新

记录页的地址是 `#记录 id`，比如 `http://你的域名/#sample-01`。

- 分享这串链接，对方直接落在这一篇；
- 刷新不会退回首页；
- 浏览器前进/后退可用。

`App.jsx` 里那两段 `useEffect` 就是干这个的，属于课程 4.3 之外的补充。不想要的话删掉这两段，把 `openPost` / `closePost` 改成只 `setActiveId(...)` 即可，代价是刷新会回首页、链接没法分享。

## 构建与部署

```bash
npm run build     # 产物在 dist/
```

Nginx（长期用）：

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

`root` 必须指向 **`dist/`**，不是仓库根目录：`.jsx` 要经过构建才能变成浏览器认识的文件。

`try_files` 最后那行 `/index.html` 是为以后接前端路由留的，现在只有 `#` 锚点跳转，用不到也不会出错。

更新内容：

```bash
cd /var/www/play-log && git pull && npm ci && npm run build
```

不用重启 Nginx。

临时验证（不上 Nginx）：

```bash
npm run build && cd dist && python3 -m http.server 80
```

## 清理

`src/components/ResultCard.jsx` 是 4.3「第一拍」留下的练习文件，没有任何组件引用它，构建时不会被打包。确认不需要了可以删掉。
