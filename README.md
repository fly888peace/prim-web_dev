# 游戏记录

记录自己玩过的游戏：截图 + 文字攻略。

纯静态站点，没有构建步骤、没有依赖、没有框架。`git clone` 下来直接就能访问。

## 目录结构

```
web_dev/
├── index.html              首页：所有记录的列表
├── style.css               全站唯一一份样式（首页和详情页共用）
├── posts/
│   ├── sample-01.html      一篇记录（示例，可删）
│   └── sample-02.html      另一篇记录（示例，可删）
└── assets/
    └── images/
        ├── cover-01.svg    占位图，换成你自己的截图
        └── cover-02.svg
```

## 本地预览

双击 `index.html` 就能看。想要更接近线上的效果（http 协议）：

```bash
python -m http.server 8000
# 浏览器打开 http://localhost:8000
```

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

### 临时验证（调试用）

```bash
cd /var/www/play-log
python3 -m http.server 80
```

关掉终端就停，只适合用来确认能访问，别长期这么跑。

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

## 关于路径

详情页在 `posts/` 目录里，所以它引用根目录的东西要加 `../`：

- 样式：`../style.css`
- 图片：`../assets/images/xxx.jpg`
- 回首页：`../index.html`

首页在根目录，引用时不需要 `../`。这是唯一容易写错的地方。

## 上线前可以把示例删掉

```bash
rm posts/sample-01.html posts/sample-02.html
```

再删掉 `index.html` 里对应的两个 `<a class="entry">` 块。
