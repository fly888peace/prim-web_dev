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
- 线上：Nginx 发静态文件，后端跑在 8000

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
cp .env.example .env          # 按下面「配置说明」填好
fastapi dev                   # → http://localhost:8000，接口文档在 /docs
```

**前端**（另开一个终端）

```bash
npm install
cp .env.example .env.local    # 按下面「配置说明」填好
npm run dev                   # → http://localhost:3000
```

两个进程都要开着：前端只发静态页面，数据全靠后端。

## 部署到服务器

前提：服务器上已装好 Python 3.11+、Node.js 18.18+ 和 Nginx，
且 Nginx 的站点根目录已指向本项目的 `out/`、监听 80 端口。

**1. 拉取代码**

```bash
cd ~/prim-web_dev
git pull
```

**2. 前端：装依赖、写配置、构建**

```bash
npm install
cp .env.example .env.production   # 按下面「配置说明」填好
npm run build                     # 产物进 out/，由 Nginx 提供服务
```

**3. 后端：建环境、装依赖、写配置**

```bash
cd backend
python3 -m venv .venv             # 首次部署才需要
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # 按下面「配置说明」填好
```

**4. 后端：在后台跑起来**

```bash
cd /home/prim-web_dev/backend
nohup .venv/bin/fastapi run >> backend.log 2>&1 &
```

`fastapi run` 是生产模式，监听 `0.0.0.0:8000`；`nohup ... &` 让它在 SSH 断开后继续运行，
日志写进 `backend.log`。

查看日志、停止服务：

```bash
tail -f backend.log           # 看日志
ps aux | grep fastapi         # 找到进程号
kill 进程号                    # 停掉
```

> 这一步一定要在 `backend/` 目录里执行。`main.py` 用 `load_dotenv()` 读 `.env`，
> 而它按**当前工作目录**找文件——在别的目录启动，`.env` 读不到，进程会直接起不来。

**5. 放行 8000 端口**

去云平台控制台的安全组 / 防火墙，放行 8000 端口（80 端口应该已经放行）。

加完规则后**确认这个安全组确实关联了当前实例**——只加规则、实例挂在别的安全组上，
端口照样不通，而且表现是「超时」而不是「连接被拒」，很容易误判。

验证方法（在服务器上执行）：

```bash
curl -s -o /dev/null -w "%{http_code}\n" --max-time 5 http://服务器IP:8000/api/profile
```

返回 `200` 才算真正打通。

**6. 验证**

浏览器访问 `http://服务器IP`，打开「关于」页做一次分析，再看历史记录。
换一个浏览器（或无痕窗口）再试一次，两边的历史记录应该是互相看不到的。

Nginx 站点配置（静态导出，注意 `$uri.html`）：

```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    root /home/prim-web_dev/out;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }
}
```

## 配置说明

配置文件不进 Git，请照着 `.env.example` 自己建一份。

**前端**：开发用 `.env.local`，生产构建用 `.env.production`

| 键 | 说明 | 本地 | 线上 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 后端接口地址 | `http://localhost:8000` | `http://服务器IP:8000` |

**后端**：`backend/.env`

| 键 | 说明 | 本地 | 线上 |
| --- | --- | --- | --- |
| `ALLOWED_ORIGINS` | 允许跨源访问的前端地址，多个用逗号隔开 | `http://localhost:3000` | `http://服务器IP`（不带端口、不带结尾斜杠） |

三个容易踩的点：

1. `NEXT_PUBLIC_` 前缀的值会**被打包进浏览器代码**，且是**构建时写死的**。改了必须重新
   `npm run build`，只重启服务没用；也只能放公开地址，不能放密钥。
2. `ALLOWED_ORIGINS` 必须和浏览器地址**逐字一致**。`http://1.2.3.4` 和 `http://1.2.3.4/`
   在 CORS 眼里是两个源；后端改完 `.env` 要**重启进程**才生效（`--reload` 只监听 `.py`）。
3. 后端开了 `allow_credentials=True`，所以前端 fetch 必须带 `credentials: "include"`，
   否则 `session_id` 这个 cookie 不会跟着走，历史记录永远是空的。

## 接口

| 接口 | 用在哪 |
| --- | --- |
| `GET /api/profile` | 首页标题、副标题（拿不到就用 `data/site.js` 打底） |
| `POST /api/analyze` | 「试一试」卡：返回情感分数、判断和全文拼音，并记一条历史 |
| `GET /api/history?limit=10` | 历史记录弹窗，只回当前会话自己的那几条 |

`POST /api/analyze` 带 `Content-Type: application/json`，属于「非简单请求」，
浏览器会先自动发一条 `OPTIONS` 预检，通过后才发真正的 POST。这条 OPTIONS 不是你写的代码，
`curl` 里看不到，但 DevTools 的 Network 面板能看到两条。

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

**点「发给后端」报 `Failed to fetch`**

先分三步看：

1. `curl http://服务器IP:8000/api/profile` 通不通 → 不通是端口/安全组问题；
2. DevTools Network 里那条 `OPTIONS` 返回什么 → `502` 说明前面有代理连不上后端；
3. 返回 `200` 但没有 `access-control-allow-origin` → `ALLOWED_ORIGINS` 写错或没重启。

**后端一会儿能连、一会儿 502**

多半是前台跑的 `fastapi run` 被 SSH 断开带走了。用 `nohup ... &` 或者 systemd 托管，
进程才不会随终端退出。

**页面能开，但图片/样式 404**

`out/` 目录不是同一版构建的产物，或者 Nginx 的 `root` 指错了位置。重新 `npm run build`
并把整个 `out/` 传上去。

## 和上一版（Vite + React）的差别

- `index.html`、`main.jsx`、`App.jsx`、`src/router/useRoute.js` 全部删掉了：路由交给文件夹，挂载交给框架
- 跳转从 `onClick + history.pushState` 换成 `<Link href>`
- 页面不再是一个空 `<div id="root">` + JS 现画，而是 build 出真实的 `.html` 文件
- 每个页面的标题从 `generateMetadata` 出，爬虫不跑 JS 也读得到
