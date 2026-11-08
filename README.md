<div align="center">

<img src="static/img/favicon.gif" width="120" alt="logo" />

# 基于 Muyu の 主页 修改的 个人主页

淡淡的就会顺顺的.

个人主页源码,纯静态页面,无需构建,采用**卡片式 Dashboard 主页**。

在线访问:[https://paeardog.github.io](https://paeardog.github.io)

</div>

## 📖 项目简介

主页入口为 [`index.html`](index.html),采用卡片式 Dashboard 风格:单列资料区 + 双列网格、紫色点缀;保留明暗主题与背景/卡片调节,包含终端、时间天气、音乐、时间线、站点与项目合集。

样式、脚本、图片与字体统一存放在 `static/` 下。

## ✨ 功能特性

### 主页

- **卡片式布局**:资料卡(头像 + 别名 + 所在地 + 座右铭 + 标签)、一言卡、时间天气卡、音乐卡、时间线、访问统计、GitHub 贪吃蛇、社交链接、站点与项目合集、技能图
- **终端模式**:**双击资料卡**进入,支持 `help` / `cd` / `visit` 等命令
- **一言 Hitokoto**:打字机效果逐字显示,定时自动刷新
- **当地时间**:实时时钟 + 中文日期(含星期)与时段问候,每秒更新
- **天气预报**:通过定位链获取和风天气数据(浏览器 GPS → IP 定位 → 兜底城市),可展开今日详情
- **音乐播放器**:通过 Meting 接口加载网易云歌单,支持歌词、播放列表、音量、播放模式
- **主题设置**:明暗主题切换(Cookie 持久化),背景/卡片的透明度、模糊度与卡片颜色可调(localStorage 持久化),页面组件配色随主题联动
- **GitHub 贡献贪吃蛇**:明暗两套 SVG 随主题切换
- **站点运行时长**:建站起每秒累计的天/时/分/秒
- **细节**:加载动画、图片弹窗(QQ / 赞赏码)、右键菜单、自定义光标、固定静态背景、常驻页面底部的页脚、进入问候弹窗、移动端响应式适配

## 📁 目录结构

```text
.
├── index.html                # Dashboard 主页
├── static/                   # 主页资源
│   ├── css/
│   │   ├── style.css         # 基础样式 / 主题变量 / 加载动画 / 弹窗
│   │   ├── root.css          # 主题配色变量
│   │   ├── simple.css        # Dashboard 布局(卡片、网格、响应式)
│   │   ├── dashboard.css     # 时间天气卡样式
│   │   ├── terminal.css      # 终端样式
│   │   ├── fira_code.css     # FiraCode 字体声明(引用 ../fonts/)
│   │   └── Right.css         # 右键菜单样式
│   ├── js/
│   │   ├── simple.js         # 布局逻辑(主题、页脚、光标、运行时长等)
│   │   ├── script.js         # 旧版主页逻辑(当前 index.html 不再引用,保留供参考)
│   │   ├── jquery.min.js     # jQuery
│   │   ├── nodecursor-jquery.js # NodeCursor 光标跟随
│   │   ├── layout.js         # 一言卡片(打字机)
│   │   ├── dashboard.js      # 当地时间 + 天气预报
│   │   ├── terminal.js       # 终端模式
│   │   ├── music.js          # 音乐播放器
│   │   └── Right.js          # 右键菜单
│   ├── img/                  # 图片资源
│   ├── svg/                  # 贪吃蛇 SVG、技能图等素材
│   └── fonts/                # 自托管字体(霞鹜文楷 / Pacifico / Ubuntu / FiraCode)
│       ├── FiraCode-Bold.woff2
│       ├── FiraCode-Light.woff2
│       ├── FiraCode-Medium.woff2
│       ├── FiraCode-Regular.woff2
│       ├── FiraCode-SemiBold.woff2
│       └── FiraCode-VF.woff2
├── worker/                   # 电脑状态中转(Cloudflare Worker + D1)
│   ├── device-status-worker.js  # 上报 / 读取 / 探活三个接口
│   ├── wrangler.toml         # D1 / KV 绑定与 Worker 名称
│   └── README.md             # 部署四步 + 接口文档
├── tools/                    # 本机上报脚本(Windows PowerShell)
│   ├── report-device.ps1     # 取前台窗口 + 空闲时长,POST 上报,并同步一份快照到 Gist
│   ├── install-device-task.ps1   # 注册开机自启(计划任务 + 启动文件夹快捷方式)
│   └── uninstall-device-task.ps1 # 卸载自启与运行中的实例
├── CNAME                     # GitHub Pages 自定义域名
├── Caddyfile                 # Caddy 服务器配置
├── Dockerfile                # 基于 caddy:alpine 的镜像
└── docker-compose.yaml       # Docker Compose 编排
```

## 🎨 字体

主页字体体系定义见 [`static/css/style.css`](static/css/style.css):

| 字体变量 | 字族 | 用途 |
| --- | --- | --- |
| `--font-cn` | `"a"` → 霞鹜文楷 LXGW ZhenKai | 中文正文 |
| `--font-en` | `"b"` → Ubuntu | 英文与界面正文(`body` 默认) |
| `--font-title` | `"title"` → Pacifico | 标题手写体(主页的 "eardog") |

字体全部**自托管**,不依赖 Google Fonts 等外部 CDN。FiraCode 由 `static/css/fira_code.css` 声明,通过 `../fonts/` 引用 `static/fonts/` 下的 6 个 woff2 字体文件。

## 🚀 本地预览

纯静态页面,任选其一:

```bash
# 方式一:直接用浏览器打开 index.html

# 方式二:从仓库根目录起一个本地静态服务(推荐,相对路径更接近线上)
python -m http.server 8080
# 主页:http://localhost:8080/
```

> 一言、天气、音乐等接口需联网才能正常加载。

## 📦 部署

### GitHub Pages

1. Fork 或推送到你的 `<用户名>.github.io` 仓库
2. 仓库 Settings → Pages,选择 `main` 分支保存即可

### Docker 自建

```bash
git clone https://github.com/paeardog/paeardog.github.io.git
cd paeardog.github.io
# 将 Caddyfile 中的 example.com 改为你的域名
docker compose up -d
```

## 🔧 个性化配置

### 主页

布局改动集中在 [`index.html`](index.html)、[`static/css/simple.css`](static/css/simple.css) 与 [`static/js/simple.js`](static/js/simple.js);天气、音乐、终端、右键菜单脚本均位于 `static/js/`:

| 配置项 | 位置 | 说明 |
| --- | --- | --- |
| `window.MUSIC_PLAYLIST_CONFIG` | `index.html` 内联脚本 | 网易云歌单 ID(取歌单链接中的 id) |
| `dwWeatherConfig` | `static/js/dashboard.js` | 天气定位方式、兜底城市、刷新间隔与和风天气 Key |
| `siteStartTime` | `static/js/simple.js` | 建站起始时间(运行时长统计) |
| 背景图片 | `static/css/simple.css` 中 `#background` | 默认 `url(../img/background.jpg)`,换成自己的图即可 |
| 社交链接 / 时间线 / 标签 / 项目卡片 | `index.html` | 按需替换为自己的内容 |
| 页面标题 / 描述 / 关键词 / ICP 备案号 | `index.html` | `<head>` 与 `<footer>` 中修改 |
| 主题配色 | `static/css/root.css` | `--main_bg_color`、`--item_bg_color` 等变量 |
| 终端命令 / 右键菜单项 | `static/js/terminal.js`、`static/js/Right.js` | 按需修改命令与菜单项 |

### 天气定位说明

天气默认**显示访问者所在地**,定位链为:

```
浏览器 GPS(带跑偏校验) → IP 定位(多源轮询) → 兜底城市
```

```js
var weatherConfig = {
    locationMode: "auto",        // "auto" 定位访客所在地(默认) | "fixed" 永远用兜底城市
    fallbackCity: "涞源",         // 定位全部失败时的兜底城市
    fallbackLatitude: 39.3602,
    fallbackLongitude: 114.6940,
    maxAutoDistanceKm: 80,       // 定位点离兜底城市超过该公里数即判定跑偏，继续往下一级回退
    requestTimeoutMs: 8000,      // 单个请求超时
    locationDeadlineMs: 6000,    // 整条定位链的总时限(多级回退是串行的，必须封顶)
    refreshIntervalMinutes: 15,  // 天气自动刷新间隔
    ipApis: [                    // 备用 IP 定位源，按顺序轮询，都必须支持 CORS
        "https://v2.xxapi.cn/api/ip",
        "https://whois.pconline.com.cn/ipJson.jsp?json=true"
    ],

    // ===================== 和风天气(QWeather)=====================
    // 认证必须走请求头 X-QW-Api-Key；旧的 ?key= 查询参数已废弃。
    // API Host 是每个账号专属的，不是公共的 api.qweather.com
    // (官方公告：公共地址自 2026 年起逐步停服)，换账号时这两项都要改。
    qweatherApiKey: "你的和风天气 API Key",
    qweatherApiHost: "https://xxxxxxxxxx.re.qweatherapi.com"
};
```

想固定显示某个城市,把 `locationMode` 改成 `"fixed"` 即可(不依赖任何第三方定位接口)。

> ⚠️ 这是纯静态站点,Key 随仓库公开、任何人可见并可消耗你的额度。如需保密,必须改成自建后端代理,把 Key 留在服务端。

**设计要点**(改动前请先读,都是踩过的坑):

1. **取数只用坐标,不用地名反查。** 地名仅用于显示。中文地名库不可靠 —— 实测「保定」会命中云南的一个村,「涞源县」则完全查不到。和风 v1 直接吃经纬度,同样不需要反查。
2. **IP 定位必须多源轮询。** 国内宽带 IP 归属地会跨市漂移,实测同一个 IP 被不同 IP 库分别解析成涞源 / 保定 / 石家庄 / 承德(跨度 300 km)。任一源异常/超时都自动切下一个源。
3. **电脑端浏览器 GPS 其实是 WiFi 定位库**,经常偏到隔壁市,所以用 `maxAutoDistanceKm` 做距离校验,跑偏就忽略并改走 IP 定位。
4. **所有定位请求都必须带超时**,且整条链要有总时限 —— 否则接口挂住不返回时,页面会一直停在「正在定位...」。
5. 定位类接口偶发失败是常态,所以任何一级都不能是单点,最后一定要能回退到兜底城市。

### 电脑状态卡

> ⚠️ 当前主页改版后**不再展示电脑状态卡**,以下链路与 `worker/`、`tools/` 代码仍完整保留;需要恢复时,可把卡片结构加回页面并复用 `static/js/script.js` 里的 `deviceStatusConfig` 逻辑。

纯静态站点没有后端,读不到「本机正在用什么软件」,所以这条链路是**本机主动上报 + 云端中转**:

```
本机 PowerShell(变化驱动+心跳)  ──POST──▶  Cloudflare Worker  ──▶  D1
        │           ▲                                            │
        │           └────────── 取前台窗口 / 空闲时长              ▼
        │                                     访客浏览器  ◀──GET── 读取
        │
        └──(每次成功上报后再写一份快照)──▶  GitHub Gist  ◀──GET── 主通道读不到时兜底
```

**部署四步**(详细说明见 [worker/README.md](worker/README.md)):

```bash
npm i -g wrangler
wrangler login
wrangler d1 create muyu-device-status    # 把返回的 id 填进 worker/wrangler.toml
cd worker && wrangler deploy             # 表结构由 Worker 首次写入时自动建
wrangler secret put REPORT_TOKEN         # 自定义一个口令
```

> ⚠️ **不要把 `*.workers.dev` 地址填进来**。该域名在部分网络(尤其国内)会被 DNS 污染,解析到不可达的 IP,表现为「关掉代理就取不到状态」。所以 `worker/wrangler.toml` 里已经配好一条自定义域名路由,把 Worker 挂在自己已接入 Cloudflare 的域名下:
>
> ```toml
> routes = [
>   { pattern = "muyuhome.cc.cd/api/device/*", zone_name = "muyuhome.cc.cd" }
> ]
> ```
>
> 它只接管 `/api/device/*`,该域名的其他路径(整站页面)不受影响。换成自己的域名时改 `pattern` 与 `zone_name` 两处再重新 `wrangler deploy` 即可。

然后把 Worker 上报地址填进 `tools/report-device.ps1` 顶部的 `$Endpoint`,口令写进 `tools/report-token.local`(该文件已在 `.gitignore` 中,不会进公开仓库;也可以改用环境变量 `MUYU_REPORT_TOKEN`)。先 `-Once` 试跑,确认无误后注册开机自启:

```powershell
powershell -ExecutionPolicy Bypass -File tools\report-device.ps1 -Once
powershell -ExecutionPolicy Bypass -File tools\install-device-task.ps1
```

最后把 Worker 的读接口地址填进 `static/js/script.js` 的 `deviceStatusConfig.endpoint`:

```js
var deviceStatusConfig = {
    endpoint: "https://muyuhome.cc.cd/api/device/status",
    fallbackEndpoint: "https://gist.githubusercontent.com/<你>/<gist-id>/raw/device.json",  // 备用通道,留空则不用
    refreshIntervalSeconds: 60,     // 前端轮询间隔
    requestTimeoutMs: 8000,         // 单请求超时,超时按离线处理
    staleAfterSeconds: 600,         // 仅本地参考;权威值在 Worker 侧,由上报的心跳间隔自动推算
    iconMap: { ... },               // 进程名 → Font Awesome 图标
    keywordIcons: [ ... ]           // 没命中时的关键词兜底
};
```

> 注册计划任务时 `New-ScheduledTaskTrigger -AtLogOn` **必须带 `-User`**。不带 `-User` 的触发器属于「任意用户登录」,注册需要管理员权限,普通账户会直接报 `Access is denied (0x80070005)`;带上当前用户后普通账户即可注册。

#### 备用通道(GitHub Gist)

主通道整条链路都在 Cloudflare 上(域名被污染、Worker 故障、KV 额度耗尽都会失效),所以加了一条完全独立的兜底:

1. 建一个 **secret gist**,里面放一个 `device.json`(内容随意,会被覆盖);
2. 把 gist id 写进 `tools/gist-id.local`;
3. 让上报脚本能拿到一个**带 `gist` scope** 的 GitHub 令牌 —— 环境变量 `MUYU_GITHUB_TOKEN`,或写进 `tools/github-token.local`,或直接复用 git 凭据管理器里那个(脚本会自动去取)。

之后每次成功上报都会顺带把同一份 JSON `PATCH` 到 gist(最快 60 秒一次),前端在主通道读不到新鲜数据时改读它。三个 `.local` 文件都已在 `.gitignore` 里。加 `-NoSnapshot` 可整体关掉。

> 实测要点:GitHub raw 响应带 `Cache-Control: max-age=300`,浏览器自己会缓存 5 分钟;挂 `?t=<时间戳>` 只能绕开**浏览器**这一层(浏览器按完整 URL 做键)。**别指望它能绕开 GitHub 那边**——实测连写 5 轮、每轮都用随机查询串读,看到新内容的延迟分别是 **1 / 58 / 103 / 54 / 46 秒**,查询串对 Fastly 与 GitHub 自身的传播延迟没有作用。
>
> 所以这条通道**天生比主通道慢一分钟左右**,真正的兜底是读快照里的 `reportedAt` 在本地判一次时效:万一 CDN 发了旧副本,页面会按快照自己的时间戳算出「离线」,而不是把一份几分钟前的数据当成实时的。备用通道的定位就是「主通道彻底挂了时还能看到个大概」,不追求秒级。快照写入是尽力而为:失败只打一行黄字,绝不影响主通道。

**设计要点**:

1. **`endpoint` 留空 = 功能未启用**,JS 会直接把整张卡片 `hidden`,页面上不会留一块空白,所以没部署也可以安心提交。
2. **上报与展示的职责分离**:应用中文名与吐槽文案在**本机脚本**里映射(那张 100+ 条的 `$AppMap`),Worker 只做字段白名单与长度截断,前端不做业务映射 —— 想加新应用只改本机脚本,不用重新部署前端。
3. **状态分级**:`online`(在用)/ `away`(空闲 >5 分钟)/ `locked`(无前台窗口,已锁屏)/ `offline`(上报断流)。前三种由本机判断,`offline` 由 Worker 判定。**离线阈值不用手动同步**:上报脚本会把当前心跳间隔(`heartbeatSeconds`)一起报上来,Worker 按「心跳 × 2」自动推算,改心跳只需改本机脚本,两端不会失配;前端拿到 `online:false` 就渲染离线态。
4. **失败不清空**:请求失败时只把状态角标改成「离线」并保留上一次的内容,避免网络抖动让卡片闪成空白。
5. **后台标签页不轮询**:`document.visibilityState !== "visible"` 时跳过,切回前台若距上次成功超过 20 秒立刻补一次 —— 后台定时器会被浏览器降频,不能只依赖 `setInterval`。
6. **读接口公开、写接口带口令**:与常见做法一致 —— 访客要能看到状态,所以 `GET` 放开跨域;`POST` 必须带 `X-Report-Token`,Worker 侧用恒定时间比较避免逐位爆破。
7. **存储用 D1 而不是 KV**:KV 免费额度瓶颈是**写**(每天 1000 次),固定 30 秒上报 = 2880 次/天,必然爆 —— 实测 2026-10-13 当天写了 1117 次后,Worker 直接开始返回 `your account has reached the free usage limit for this operation for today`(HTTP 500),上报全线失败。D1 免费额度是每天 10 万行写入,同样的用法只占百分之几。另外上报仍走「变化驱动」:本机每 15 秒读一次前台窗口(纯本地调用,零网络开销),只有应用身份变了才上报,不变时只发心跳(在线 5 分钟、空闲 10 分钟),挂机约 288 写/天,而状态切换依然是**秒级实时**的。
8. **两条独立链路互为备份**:主通道走 Cloudflare,备用通道走 GitHub Gist。它们除了「都由本机写」之外没有任何共同依赖,同时挂掉的概率很低。降级判断有三层:主通道请求失败 → 走备用;主通道返回「离线」但备用有更新鲜的快照 → 以备用为准(避免 Cloudflare 那一段的问题被误报成「电脑关机」);两条都失败才显示离线,且**不清空**上次内容。
9. **自启有两条独立路径**:计划任务 + 启动文件夹快捷方式。计划任务曾经在毫无征兆的情况下凭空消失过一次(Tasks 目录下的文件没了),上报静默中断两小时。脚本里有命名互斥体做单实例保护,所以两条路径同时生效也不会重复上报,后来者会立刻退出。
10. **失败要留痕**:计划任务是无窗口运行的,出问题时控制台什么都没留下。上报脚本会把启动、上报失败、快照失败写进 `%LOCALAPPDATA%\muyu-device-status\reporter.log`(超过 512KB 自动轮转),事后能查。

## 🧰 技术栈

原生 HTML / CSS / JavaScript,**无框架、无构建工具**,克隆下来就能跑。

- **音乐**:原生 `Audio` API + [Meting](https://github.com/metowolf/Meting) 接口解析网易云歌单
- **图标**:Font Awesome 7(CDN,主页异步加载不阻塞首屏)
- **字体**:全部自托管(霞鹜文楷 / Pacifico / Ubuntu / FiraCode)
- **天气**:和风天气 QWeather v1 API
- **部署**:GitHub Pages 或 Caddy + Docker

## 🙏 鸣谢

- [zyyo.cc](https://zyyo.cc) — 主页页面模板
- [Muyu の 主页](https://muyuhome.cc.cd/) — 二改
- [Meting](https://github.com/metowolf/Meting) — 音乐接口解析
- [Hitokoto 一言](https://hitokoto.cn) — 一言数据
- [和风天气 QWeather](https://www.qweather.com) — 天气与空气质量数据
- [NodeCursor](https://github.com/hmongouachon/NodeCursor) — 主页光标跟随效果
- [霞鹜文楷 LXGW WenKai](https://github.com/lxgw/LxgwWenKai) — 中文字体

---

Muyu © 2026 · 豫ICP备2026015852号-1 · 本仓库仅作个人使用与学习交流
