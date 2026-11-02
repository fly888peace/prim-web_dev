# 游戏记录

记录自己玩过的游戏：截图 + 文字攻略。

纯静态站点，没有构建步骤、没有依赖包、没有框架。`git clone` 下来起个静态服务就能访问。
样式拆成 `css/` 下一组小文件，脚本拆成 `js/` 下一组 **ES 模块**，页面只引入口。

## 目录结构

```
web_dev/
├── index.html              首页：所有记录的列表
├── css/
│   ├── variables.css       设计变量：配色、字体、缓动
│   ├── reset.css           基础重置：盒模型、body 基线、图片、选区
│   ├── layout.css          版心骨架：main 容器宽度
│   ├── hero.css            首屏：小标 / 大标题 / 副标题 / 墨线
│   ├── list.css            首页记录列表与悬停效果
│   ├── post.css            详情页：标题区、封面、正文排版、阅读进度条
│   ├── footer.css          页脚
│   ├── effects.css         入场动效的"起手状态"与降级规则
│   └── responsive.css      小屏适配 + 减少动态效果
├── js/
│   ├── main.js             全站入口：只负责按需加载并调用各模块
│   ├── motion.js           动画底座：anime.js 引入 + 滚动入场封装
│   ├── hero.js             首屏：标题拆字、逐字上浮
│   ├── list.js             首页：记录条目整组错峰入场
│   ├── post.js             详情页：正文逐段浮现 + 阅读进度条
│   └── year.js             页脚年份
├── posts/
│   ├── sample-01.html      一篇记录（示例，可删）
│   └── sample-02.html      另一篇记录（示例，可删）
└── assets/
    └── images/
        ├── cover-01.svg    占位图，换成你自己的截图
        └── cover-02.svg
```

## 本地预览

**不能双击 `index.html` 打开。** ES 模块必须通过 http 协议加载，`file://` 会被浏览器拦下（控制台报 CORS，动画不生效）。

```bash
python -m http.server 8000
# 浏览器打开 http://localhost:8000
```

这种情况下页面不会白屏——只是没有动画，原因见下面「动画的降级」一节。

## CSS 是怎么拆的

按"改哪块就开哪个文件"来分，不是一个选择器一个文件那么碎：

- `variables.css` 只放变量。想改主色、改版心宽度、改缓动曲线，只动这一个文件。
- `reset.css` 只做浏览器默认样式的必要清理。
- `layout.css` 只放版心，不掺任何视觉。
- `hero.css` / `list.css` / `post.css` / `footer.css` 按页面区块分。
- `effects.css` 只放动画的初始状态和降级规则，和布局互不干扰。
- `responsive.css` 放所有 `@media`，避免媒体查询散落各处。

引用的顺序有讲究，HTML 里按这个顺序排：

```html
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/hero.css">   <!-- 详情页换成 css/post.css -->
<link rel="stylesheet" href="css/list.css">   <!-- 详情页没有列表，不引 -->
<link rel="stylesheet" href="css/footer.css">
<link rel="stylesheet" href="css/effects.css">
<link rel="stylesheet" href="css/responsive.css">
```

变量文件放在最前面，后面的文件才能直接用 `var(--accent)`；`responsive.css` 放最后，媒体查询里的规则才能覆盖前面的常规规则。

## JS 是怎么模块化的

页面底部只有一行：

```html
<script type="module" src="js/main.js"></script>
```

详情页在子目录，写成 `../js/main.js`。

依赖关系全写在 `import` 里，不再靠 `<script>` 的先后顺序：

```
main.js ──> hero.js ──┐
        ├─> list.js ──┼──> motion.js ──> anime.js（CDN 的 ES 模块版本）
        └─> post.js ──┘
```

各文件的分工：

| 文件 | 职责 | 对外暴露 |
| --- | --- | --- |
| `main.js` | 唯一入口，`html` 打标记、按需加载动画模块 | 无 |
| `motion.js` | 引入 anime.js，封装"滚到才入场"的观察器 | `animate` / `stagger` / `revealEach` / `revealGroup` |
| `hero.js` | 标题拆字 + 逐字入场 | `initHero()` |
| `list.js` | 首页条目错峰入场 | `initList()` |
| `post.js` | 正文逐段浮现 + 顶部进度条 | `initPost()` |
| `year.js` | 页脚年份 | `initYear()` |

每个 `init` 函数进来先找自己的目标元素，找不到就直接 `return`。所以同一份 `main.js` 在首页和详情页都能跑，不会因为"这页没有列表"而报错。

### 想再加一个动画

1. 新建 `js/xxx.js`，从 `./motion.js` 里 `import` 需要的东西，导出 `initXxx()`；
2. 在 `js/main.js` 的 `Promise.all` 里加一行 `import("./xxx.js")`，下面补一句 `xxx.initXxx()`；
3. 元素需要在入场前先藏起来，就把它的选择器加进 `css/effects.css`。

## 动画的降级

这是这套写法里唯一需要特意设计的地方：

- `css/effects.css` 里所有"先藏起来"的规则都挂在 `html.motion` 下，默认状态元素是可见的；
- `main.js` 在加载动画模块**之前**才加上 `motion` 类；
- 动画模块加载失败（CDN 挂了）或用户系统开了"减少动态效果"，`main.js` 就把这个类去掉，页面直接以完整静态状态呈现。

效果就是：**动画是加分项，不是内容能否显示的前提。**

阅读进度条还多一层兜底：`css/post.css` 里写了 `@supports (animation-timeline: scroll())` 的纯 CSS 版本，浏览器支持滚动驱动动画时由它直接按滚动位置画进度，JS 不参与；不支持的浏览器才走 `post.js` 里那套 `scaleX` 计算。

另外 `hero.js` 拆字时会保留完整的 `aria-label`，逐字 `<span>` 标了 `aria-hidden="true"`，读屏软件念到的还是原来那句话。

## 新增一篇记录

1. 把截图放进 `assets/images/`，建议命名成 `游戏名-01.jpg` 这种，方便找。
   图片宽度压到 1600px 以内就够，单张控制在 500KB 以下，手机上看也快。
2. 复制 `posts/sample-01.html`，改名成你自己的一篇，比如 `posts/eldenring-01.html`。
3. 改里面这几处：
   - `<title>` 和 `<h1 class="post__title">` —— 标题
   - `post__game` 里的游戏名、`post__date` 里的日期
   - 封面图 `post__cover` 的 `src`
   - 正文 `<article class="article">` 里的 `h2` / `p` / `ul` / `figure`
4. 回到首页 `index.html`，复制一整块 `<a class="entry">...</a>`，把 `href` 指向新页面，
   改缩略图 `src`、游戏名、日期、标题、摘要。

正文里想插图就用：

```html
<figure>
  <img src="../assets/images/你的图.jpg" alt="图片说明">
  <figcaption>图下面这行小字</figcaption>
</figure>
```

正文里加新段落不需要做任何额外处理：`post.js` 是按 `.article > *` 逐个观察的，新段落会自动带入场动画。

## 部署到服务器

### Nginx（推荐，长期用）

服务器上拉代码：

```bash
git clone <你的仓库地址> /var/www/play-log
```

新建 `/etc/nginx/conf.d/play-log.conf`：

```nginx
server {
    listen 80;
    server_name 你的域名或服务器IP;

    root /var/www/play-log;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

然后：

```bash
nginx -t && systemctl reload nginx
```

以后更新内容只需要：

```bash
cd /var/www/play-log && git pull
```

Nginx 不用重启，刷新页面即可。

`.js` 文件由 Nginx 默认的 `mime.types` 认成 `text/javascript`，`type="module"` 才能正常执行，不用额外配置。

### 临时验证（调试用）

```bash
cd /var/www/play-log
python3 -m http.server 80
```

关掉终端就停，只适合用来确认能访问，别长期这么跑。

## 关于路径

详情页在 `posts/` 目录里，所以它引用根目录的东西要加 `../`：

- 样式：`../css/post.css`
- 脚本：`../js/main.js`
- 图片：`../assets/images/xxx.jpg`
- 回首页：`../index.html`

首页在根目录，引用时不需要 `../`，脚本直接写 `js/main.js`。这是唯一容易写错的地方。

## 上线前可以把示例删掉

```bash
rm posts/sample-01.html posts/sample-02.html
```

再删掉 `index.html` 里对应的两个 `<a class="entry">` 块。
