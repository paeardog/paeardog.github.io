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

- **卡片式布局**:资料卡(头像 + 别名 + 所在地 + 座右铭 + 标签)、一言卡、时间天气卡、音乐卡、时间线、访问统计、GitHub 贪吃蛇、社交链接、站点与项目合集、技术栈卡片
- **终端模式**:**双击资料卡**进入,支持 `help` / `cd` / `visit` 等命令
- **一言 Hitokoto**:打字机效果逐字显示,定时自动刷新
- **当地时间**:实时时钟 + 中文日期(含星期)与时段问候,每秒更新
- **天气预报**:通过定位链获取天气数据(浏览器 GPS → IP 定位 → 兜底城市),可展开今日详情
- **音乐播放器**:通过 Meting 接口加载网易云歌单,支持歌词、播放列表、音量、播放模式
- **主题设置**:明暗主题切换(Cookie 持久化),背景/卡片的透明度、模糊度与卡片颜色可调(localStorage 持久化),页面组件配色随主题联动
- **GitHub 贡献贪吃蛇**:明暗两套 SVG 随主题切换
- **站点运行时长**:建站起每秒累计的天/时/分/秒
- **细节**:加载动画、联系方式一键复制、自定义光标、固定静态背景、常驻页面底部的页脚、进入问候弹窗、移动端响应式适配

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
│   │   └── fira_code.css     # FiraCode 字体声明(引用 ../fonts/)
│   ├── js/
│   │   ├── simple.js         # 布局逻辑(主题、页脚、光标、运行时长等)
│   │   ├── script.js         # 旧版主页逻辑(当前 index.html 不再引用,保留供参考)
│   │   ├── jquery.min.js     # jQuery
│   │   ├── nodecursor-jquery.js # NodeCursor 光标跟随
│   │   ├── layout.js         # 一言卡片(打字机)
│   │   ├── dashboard.js      # 当地时间 + 天气预报
│   │   ├── terminal.js       # 终端模式
│   │   └── music.js          # 音乐播放器
│   ├── img/                  # 图片资源
│   ├── svg/                  # 贪吃蛇 SVG、技术栈图标(icons/)等素材
│   └── fonts/                # 自托管字体(荆南波波黑 / 霞鹜文楷 / Pacifico / Ubuntu / FiraCode)
│       ├── FiraCode-Bold.woff2
│       ├── FiraCode-Light.woff2
│       ├── FiraCode-Medium.woff2
│       ├── FiraCode-Regular.woff2
│       ├── FiraCode-SemiBold.woff2
│       └── FiraCode-VF.woff2
├── .github/workflows/
│   └── snake.yml             # 每日生成 GitHub 贡献贪吃蛇 SVG,产物提交到 output 分支
├── tools/
│   └── make-skill-icons.py   # 抓取 simple-icons 到 static/svg/icons/,并打印技术栈卡片片段
├── CNAME                     # GitHub Pages 自定义域名
├── Caddyfile                 # Caddy 服务器配置
├── Dockerfile                # 基于 caddy:alpine 的镜像
└── docker-compose.yaml       # Docker Compose 编排
```

## 🎨 字体

主页字体体系定义见 [`static/css/style.css`](static/css/style.css):

| 字体变量 | 字族 | 用途 |
| --- | --- | --- |
| `--font-cn` | `"JingNan"` → 荆南波波黑 Bold | 中文正文 |
| `--font-en` | `"JingNan"` → 荆南波波黑 Bold | 英文与界面正文(`body` 默认) |
| `--font-title` | `"JingNan"` → 荆南波波黑 Bold | 标题(主页的 "eardog") |

主页正文统一使用**荆南波波黑 Bold**,文件为 `static/fonts/JingNanBoBoHei-Bold.woff2`;终端与代码区域仍使用 FiraCode。字体全部**自托管**,不依赖 Google Fonts 等外部 CDN;若主字体加载失败,会回退到霞鹜文楷 / Ubuntu。FiraCode 由 `static/css/fira_code.css` 声明,通过 `../fonts/` 引用 `static/fonts/` 下的 6 个 woff2 字体文件。

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

布局改动集中在 [`index.html`](index.html)、[`static/css/simple.css`](static/css/simple.css) 与 [`static/js/simple.js`](static/js/simple.js);天气、音乐、终端脚本均位于 `static/js/`:

| 配置项 | 位置 | 说明 |
| --- | --- | --- |
| `window.MUSIC_PLAYLIST_CONFIG` | `index.html` 内联脚本 | 网易云歌单 ID(取歌单链接中的 id) |
| `dwWeatherConfig` | `static/js/dashboard.js` | 天气定位方式、兜底城市、刷新间隔与数据源地址 |
| `siteStartTime` | `static/js/simple.js` | 建站起始时间(运行时长统计) |
| 背景图片 | `static/css/simple.css` 中 `#background` | 默认 `url(../img/background.jpg)`,换成自己的图即可 |
| 社交链接 / 时间线 / 标签 / 项目卡片 | `index.html` | 按需替换为自己的内容 |
| 页面标题 / 描述 / 关键词 / ICP 备案号 | `index.html` | `<head>` 与 `<footer>` 中修改 |
| 主题配色 | `static/css/root.css` | `--main_bg_color`、`--item_bg_color` 等变量 |
| 终端命令 | `static/js/terminal.js` | 按需修改命令与提示 |

### 天气定位说明

天气默认**显示访问者所在地**,定位链为:

```
浏览器 GPS(带跑偏校验) → IP 定位(多源轮询) → 兜底城市
```

```js
var weatherConfig = {
    locationMode: "auto",        // "auto" 定位访客所在地(默认) | "fixed" 永远用兜底城市
    fallbackCity: "长沙",         // 定位全部失败时的兜底城市
    fallbackLatitude: 28.2278,
    fallbackLongitude: 112.9388,
    maxAutoDistanceKm: 80,       // 定位点离兜底城市超过该公里数即判定跑偏，继续往下一级回退
    requestTimeoutMs: 8000,      // 单个请求超时
    locationDeadlineMs: 6000,    // 整条定位链的总时限(多级回退是串行的，必须封顶)
    refreshIntervalMinutes: 15,  // 天气自动刷新间隔
    ipApis: [                    // 备用 IP 定位源，按顺序轮询，都必须支持 CORS
        "https://v2.xxapi.cn/api/ip",
        "https://whois.pconline.com.cn/ipJson.jsp?json=true"
    ],

    // ===================== 数据来源:Open-Meteo =====================
    // 免注册、免 Key,只需经纬度,不存在「凭据是谁的」这类问题。
    // 数据按 CC BY 4.0 授权,页面上的来源署名请勿删除。
    openMeteoHost: "https://api.open-meteo.com",
    airQualityHost: "https://air-quality-api.open-meteo.com"
};
```

想固定显示某个城市,把 `locationMode` 改成 `"fixed"` 即可(不依赖任何第三方定位接口)。

> 早前用的是和风天气(QWeather),需要 API Key 与账号专属 API Host。 fork 下来时那两项还是原作者的凭据,他账号侧的安全限制会把请求直接判 `403 Security Restriction`,天气卡片整块挂掉 —— 这正是换掉数据源的原因。想改回和风的话,除了填自己的 Key 和 Host,还要在控制台的安全限制里放行 `me.paeardog.top`。

**设计要点**(改动前请先读,都是踩过的坑):

1. **取数只用坐标,不用地名反查。** 地名仅用于显示。中文地名库不可靠 —— 实测「保定」会命中云南的一个村,「涞源县」则完全查不到。Open-Meteo 同样直接吃经纬度,不需要反查。
2. **IP 定位必须多源轮询。** 国内宽带 IP 归属地会跨市漂移,实测同一个 IP 被不同 IP 库分别解析成涞源 / 保定 / 石家庄 / 承德(跨度 300 km)。任一源异常/超时都自动切下一个源。
3. **电脑端浏览器 GPS 其实是 WiFi 定位库**,经常偏到隔壁市,所以用 `maxAutoDistanceKm` 做距离校验,跑偏就忽略并改走 IP 定位。
4. **所有定位请求都必须带超时**,且整条链要有总时限 —— 否则接口挂住不返回时,页面会一直停在「正在定位...」。
5. 定位类接口偶发失败是常态,所以任何一级都不能是单点,最后一定要能回退到兜底城市。

### 技术栈卡片

主页底部的技术栈是 28 张真实卡片(`index.html` 里的 `.workbox.stackbox`),按**本机实际装的软件 + 在用的服务**归纳,外观与交互直接复用上方「站点合集 / 个人项目」那套 `.workbox` 面板:平时把 logo 压成剪影,悬停才放大浮起、亮起品牌色光晕并还原 logo 原色。每张卡片本身是个 `<a>`,点了在新标签页打开对应官网。

图标是 simple-icons 的官方路径,落在 `static/svg/icons/`,由 [`tools/make-skill-icons.py`](tools/make-skill-icons.py) 抓取。四条例外登记在脚本顶部的 `LOCAL`,生成器不去 CDN 抓:易语言是 simple-icons 里根本没这个条目,照官方印章手画;MySQL、.NET 和 VMware 的官方矢量虽然存在,但放到 24px 完全不能用,照官方 logo 重绘(细节见下面第 4、5 条)。

```bash
# 1. 编辑脚本顶部的 SKILLS,每条是 (slug, 显示名, 官网) —— slug 要在 https://simpleicons.org 上存在
# 2. 重跑,把 stdout 整块替换进 index.html 的技术栈 section
python tools/make-skill-icons.py
```

缓存抓在 `tools/.icon-cache/`(已 gitignore),命中时离线也能重跑。

六个坑,改之前先读:

1. **别用 `.skill` 当类名。** 旧版主页的 `static/css/style.css` 里已经有 `.skill { width: 100% }` 和 `.skill img { width: 100% }`,而 style.css 与 simple.css 同时加载 —— 新卡片会被撑成一屏一张。现在的类名是 `.stack`。
2. **微软、Adobe 那批图标被商标方从 simple-icons 下架了**,`vscode` / `powershell` / `photoshop` / `java` 全是 404。所以 Java 走 `openjdk`,VS Code 与 PowerShell 干脆没上(机器上装了,但没有合规图标可用)。
3. **黑 logo 必须压成剪影。** IDEA、PyCharm、OpenJDK、LM Studio 的官方色就是纯黑,直接铺在深色面板上会整块隐形,所以默认 `filter: brightness(0) invert(...)`;纯黑品牌做光晕也看不见,`--brand` 统一退成钢灰。
4. **纯线条、纯字标的 logo 不能直接搬。** simple-icons 的 `mysql` 是「线条海豚 + MySQL 字标」的组合 logo,海豚是开放笔触(没有闭合轮廓,所以既填不出实心也 flood-fill 不了),压到 24px 线条直接消失;`dotnet` 就是 `.NET` 四个字,放进卡片会和文字标签重复成 `.NET .NET`;`vmware` 是整条「vmware」字标,在 24 的 viewBox 里横向铺开 23.8、竖向只有 3.8,塞进 24px 的图标框就糊成一条噪点。所以 MySQL 重绘成实心海豚剪影,.NET 和 VMware 改成方牌 + 挖空字标 —— VMware 照的是它自己的官方 favicon,那本来就是蓝牌 + 「vmw」。
5. **手画图标要跟着剪影滤镜走。** 默认滤镜是 `brightness(0)`,它只压亮度不动 alpha,所以每个图标都得是「单色 + 透明底」:品牌色写在 `fill` 上,要留白的地方必须是真洞口,不能画成白色填充,否则剪影会糊成一团白。易语言的印章和 MySQL 的海豚都是单条 `fill-rule="evenodd"` 路径(印章是外圈圆角方 + 阴刻「易」,海豚是身体 + 挖掉的眼);.NET 的牌面用 `<mask>` 把官方字标挖穿,挖空路径加了 `stroke-width="0.5"`,不然 24px 下字标会糊没;VMware 的「vmw」是单线字体,直接拿 `fill="none" stroke="#000" stroke-width="6"` 画中心线(中心线坐标是在官方 favicon 的 96px 网格上量的,拱顶是平的、不是半圆),再 `scale(0.25)` 落进 24 的 viewBox。`LOCAL` 里的 slug 生成器不去 CDN 抓,文件丢了会直接报错退出。
6. **官网 URL 得自己填,别指望 simple-icons。** 它的 `simple-icons.json` 只给 `hex` 和 logo 来源页,没有主页(记录在 `data/slugs/**.md` 的 frontmatter 里,不在打包数据中),所以 URL 手写在 SKILLS 第三列。加条目时先确认链接真的能打开 —— 卡片是第三方外链,统一带 `target="_blank" rel="noopener noreferrer"`,`<a>` 上也别留下划线(`text-decoration: none`),否则会和上方项目卡片的观感不一致。

窄屏不需要特殊处理:卡片是 `flex-wrap` 换行的,不是轮播 —— 28 项排成横滑要划十几屏,铺开桌面端三行就装完了。

## 🧰 技术栈

原生 HTML / CSS / JavaScript,**无框架、无构建工具**,克隆下来就能跑。

- **音乐**:原生 `Audio` API + [Meting](https://github.com/metowolf/Meting) 接口解析网易云歌单
- **图标**:Font Awesome 7(CDN,主页异步加载不阻塞首屏)
- **字体**:全部自托管(霞鹜文楷 / Pacifico / Ubuntu / FiraCode)
- **天气**:Open-Meteo(免费、无需 API Key)
- **部署**:GitHub Pages 或 Caddy + Docker

## 🙏 鸣谢

- [zyyo.cc](https://zyyo.cc) — 主页页面模板
- [Muyu の 主页](https://muyuhome.cc.cd/) — 二改
- [Meting](https://github.com/metowolf/Meting) — 音乐接口解析
- [Hitokoto 一言](https://hitokoto.cn) — 一言数据
- [Open-Meteo](https://open-meteo.com/) — 天气与空气质量数据(CC BY 4.0)
- [simple-icons](https://simpleicons.org/) — 技术栈卡片用的品牌图标路径(CC0-1.0;商标仍归各自品牌方)
- [NodeCursor](https://github.com/hmongouachon/NodeCursor) — 主页光标跟随效果
- [霞鹜文楷 LXGW WenKai](https://github.com/lxgw/LxgwWenKai) — 中文字体
- [荆南波波黑](https://www.maoken.com/freefonts/14257.html) — 荆南字坊出品的免费商用字体

---

eardog © 2026 · 本仓库仅作个人使用与学习交流
