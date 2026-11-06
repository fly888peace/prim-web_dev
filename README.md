# 游戏记录

一个游玩记录站：把自己的截图和文字攻略整理成条目，按游戏名和日期归档。

除了首页列表和详情页，还有一个「关于」页，里面放着「试一试」卡片——把一段文字发给后端，
拿回情感分数和全文拼音，结果按浏览器会话分别存起来，各人只看得到自己的那一份。

零到全栈课程的贯穿项目。

## 技术栈

- 前端：Next.js 15（App Router，静态导出）＋ React 19
- 动画：anime.js 4
- 后端：FastAPI ＋ uvicorn
- 分析：snownlp（情感）、pypinyin（注音）
- 存储：SQLite
- 线上：Nginx（静态文件 ＋ `/api/` 反向代理）＋ systemd 托管后端

**线上是同源部署**：浏览器只跟 80 端口打交道，`/api/` 由 Nginx 转发给只监听
`127.0.0.1` 的后端，8000 端口不对公网开放。

## 页面（文件夹 = 路由）

| 文件 | 地址 |
| --- | --- |
| `app/page.jsx` | `/` |
| `app/about/page.jsx` | `/about` |
| `app/post/[id]/page.jsx` | `/post/<id>`，比如 `/post/sample-01` |

加页面不用注册路由，新建文件夹 + `page.jsx` 就行；加一篇记录只改 `data/posts.js`，
`generateStaticParams` 会把新 id 自动加进预渲染列表。

## 目录结构

```
web_dev/
├── app/                      路由：layout / page / about / post[id]
├── components/               页面组件（含 "use client" 的交互组件）
├── data/
│   ├── posts.js              ★ 所有记录的内容
│   └── site.js               站点文案（品牌、导航、每页标题）
├── css/                      8 个样式文件，按区块拆
├── public/images/            截图放这里，引用写 /images/xxx.jpg
├── backend/                  FastAPI 服务（main.py / storage.py）
├── out/                      构建产物，不进 Git
├── next.config.mjs           output: "export"
└── .env.example              环境变量模板
```

## 本地跑起来

需要：**Node.js 18.18+**（推荐 20+）、**Python 3.11+**。

> Python 版本别用 3.10：`requirements.txt` 里的 `dnspython==2.9.2`、`starlette==1.10.0`
> 都要求 `>=3.11`，在 3.10 上 pip 会直接报「找不到匹配的版本」。

**后端**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # ALLOWED_ORIGINS 填 http://localhost:3000
fastapi dev                   # → http://localhost:8000，接口文档在 /docs
```

**前端**（另开一个终端）

```bash
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_BASE_URL 填 http://localhost:8000
npm run dev                   # → http://localhost:3000
```

本地是**跨源**的（3000 → 8000），所以后端必须带 CORS 配置、前端 fetch 必须带
`credentials: "include"`。线上同源之后这两样不再需要，但代码里要留着，本地开发还要靠它们。

## 部署到服务器

前提：服务器上已装好 Python 3.11+、Node.js 18.18+ 和 Nginx。

**1. 拉取代码**

```bash
cd /home/prim-web_dev
git pull
```

**2. 前端：装依赖、写配置、构建**

```bash
npm install
cp .env.example .env.production   # 按下面「配置说明」填好（线上留空）
npm run build                     # 产物进 out/，由 Nginx 提供服务
```

**3. 后端：建环境、装依赖、写配置**

```bash
cd backend
python3 -m venv .venv             # 首次部署才需要
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # ALLOWED_ORIGINS 填 http://服务器IP
```

**4. 后端：委托给 systemd**（首次部署才需要）

新建 `/etc/systemd/system/PRIM-WEB_DEV.service`：

```ini
[Unit]
Description=prim-web_dev backend (FastAPI)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/prim-web_dev/backend
ExecStart=/home/prim-web_dev/backend/.venv/bin/fastapi run --host 127.0.0.1
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl start PRIM-WEB_DEV.service     # 启动
systemctl enable PRIM-WEB_DEV.service    # 开机自启
systemctl status PRIM-WEB_DEV.service    # 看到 active (running) 就对了
```

`WorkingDirectory` 必须写对：`main.py` 用 `load_dotenv()` 按**当前工作目录**找 `.env`，
目录错了就读不到 `ALLOWED_ORIGINS`，进程起来就崩。

`--host 127.0.0.1` 是故意只监听本机的——来自公网的请求一律由 Nginx 转进来。

**5. Nginx：静态文件 ＋ `/api/` 反向代理**（首次部署才需要）

编辑 `/etc/nginx/sites-enabled/default`：

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /home/prim-web_dev/out;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;     # 末尾不要加斜杠

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
nginx -t && systemctl reload nginx
```

**6. 安全组 / 防火墙**

只放行 **22（SSH）** 和 **80（HTTP）**。**8000 不要放行**——后端只听 `127.0.0.1`，
由 Nginx 转发进去。少开一个口，少一分被扫的风险。

**7. 验证**

```bash
curl localhost/api/profile        # 服务器本机，注意不带端口
```

返回 `{"heroTitle": ...}` 就说明 Nginx 到后端这条路通了。浏览器访问 `http://服务器IP`，
做一次分析、看一眼历史记录；换个无痕窗口再试，两边的历史应该互相看不到。

## 日常发布

```bash
cd /home/prim-web_dev
git pull

npm run build                          # 前端改了才需要
systemctl restart PRIM-WEB_DEV.service # 后端改了才需要
```

## 常用运维命令

```bash
systemctl status PRIM-WEB_DEV.service    # 看状态
systemctl restart PRIM-WEB_DEV.service   # 重启
systemctl stop PRIM-WEB_DEV.service      # 停掉
journalctl -u PRIM-WEB_DEV.service -f    # 实时看日志（Ctrl+C 退出）
journalctl -u PRIM-WEB_DEV.service -n 50 # 看最后 50 行

nginx -t                                 # 改完 Nginx 配置先验语法
systemctl reload nginx                   # 再让它重读
```

`Restart=always` 意味着进程崩了会自动拉起，所以「网站一会儿能用一会儿不能」这种
以前常见的问题不会再出现；真出问题时直接看 `journalctl` 里的异常，而不是去猜进程死没死。

## 配置说明

配置文件不进 Git，请照着 `.env.example` 自己建一份。

**前端**：开发用 `.env.local`，生产构建用 `.env.production`

| 键 | 说明 | 本地 | 线上 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 后端接口地址 | `http://localhost:8000` | **留空**——前后端同源，代码里走相对路径 |

**后端**：`backend/.env`

| 键 | 说明 | 本地 | 线上 |
| --- | --- | --- | --- |
| `ALLOWED_ORIGINS` | 允许跨源访问的前端地址，多个用逗号隔开 | `http://localhost:3000` | `http://服务器IP`（不带端口、不带结尾斜杠） |

四个容易踩的点：

1. `NEXT_PUBLIC_` 前缀的值会**被打包进浏览器代码**，且是**构建时写死的**。改了必须重新
   `npm run build`，只重启服务没用；也只能放公开地址，不能放密钥。
2. 线上把 `NEXT_PUBLIC_API_BASE_URL` **留空**（`NEXT_PUBLIC_API_BASE_URL=` 这行要留，
   不能整行删掉），代码里 `${API}/api/analyze` 才会拼成相对路径 `/api/analyze`。
   变量整个不存在会拼成 `undefined/api/analyze`。
3. `ALLOWED_ORIGINS` 线上其实用不上了（同源请求不触发 CORS），但**不能删**：
   `main.py` 里 `os.getenv("ALLOWED_ORIGINS").split(",")` 取不到就会抛异常、进程起不来；
   本地开发 3000 → 8000 也仍然需要它。
4. 后端改了 `.env` 要 `systemctl restart PRIM-WEB_DEV.service` 才生效
   （`--reload` 只监听 `.py` 文件，不监听 `.env`）。

## 接口

| 接口 | 用在哪 |
| --- | --- |
| `GET /api/profile` | 首页标题、副标题（拿不到就用 `data/site.js` 打底） |
| `POST /api/analyze` | 「试一试」卡：返回情感分数、判断和全文拼音，并记一条历史 |
| `GET /api/history?limit=10` | 历史记录弹窗，只回当前会话自己的那几条 |

线上同源之后，`POST /api/analyze` 在 Network 面板里只有一条 POST，**看不到 OPTIONS 预检**——
同源请求浏览器不需要先问一句。本地 3000 → 8000 是跨源，才会出现那条自动生成的 OPTIONS。

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

截图丢进 `public/images/`。改站点文字在 `data/site.js`。

## 常见问题

**点「发给后端」没反应，报 `Failed to fetch`**

按顺序排：

```bash
curl localhost/api/profile                 # 服务器本机：Nginx → 后端 这条路通不通
journalctl -u PRIM-WEB_DEV.service -n 30   # 后端有没有异常
tail -20 /var/log/nginx/error.log          # Nginx 侧有没有报错
```

本机 `curl` 通、浏览器不通 → 多半是 `out/` 里的构建产物还指着旧地址（比如 `:8000`），
重新 `npm run build` 即可。

**历史记录一直是空的**

`fetch` 少了 `credentials: "include"`，`session_id` 这个 cookie 没跟着走，
后端每次都当你是新人。或者前端和后端不是同一个主机（cookie 不会跨站共享）。

**页面能开，但图片/样式 404**

`out/` 不是同一版构建的产物，或者 Nginx 的 `root` 指错了位置。重新 `npm run build`，
把整个 `out/` 传上去。

## 和上一版（Vite + React）的差别

- `index.html`、`main.jsx`、`App.jsx`、`src/router/useRoute.js` 全部删掉了：路由交给文件夹，挂载交给框架
- 跳转从 `onClick + history.pushState` 换成 `<Link href>`
- 页面不再是一个空 `<div id="root">` + JS 现画，而是 build 出真实的 `.html` 文件
- 每个页面的标题从 `generateMetadata` 出，爬虫不跑 JS 也读得到
