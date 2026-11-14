#!/usr/bin/env python3
"""把技能清单落成 static/svg/icons/<slug>.svg，并打印可直接粘进 index.html 的卡片片段。

图标取自 simple-icons（CC0-1.0），商标归各自品牌方；它没有的条目走 LOCAL 手画。
改清单只需要动 SKILLS，然后重跑并把输出替换进 index.html 的 .stackbox：
    python tools/make-skill-icons.py
"""

import concurrent.futures
import os
import re
import ssl
import sys
import urllib.request

try:
    import certifi
except ImportError:
    certifi = None

CDN = "https://cdn.simpleicons.org/{}"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, ".icon-cache")
OUTDIR = os.path.join(ROOT, "static", "svg", "icons")

# (分组注释, [(slug, 显示名, 官网), ...]) —— 分组只影响顺序和片段里的注释，页面上不显示标题。
# 卡片整块可点，新标签页打开第三方的官方网站，所以每条都得有个能落地的 URL。
SKILLS = [
    ("基础设施", [
        ("cloudflare", "Cloudflare", "https://www.cloudflare.com"),
    ]),
    ("AI", [
        ("python", "Python", "https://www.python.org"),
        ("qwen", "Qwen", "https://chat.qwen.ai"),
        ("deepseek", "DeepSeek", "https://www.deepseek.com"),
        ("claude", "Claude", "https://www.anthropic.com/claude"),
        ("googlegemini", "Gemini", "https://gemini.google.com"),
        ("lmstudio", "LM Studio", "https://lmstudio.ai"),
    ]),
    ("数据与模型", [
        ("numpy", "NumPy", "https://numpy.org"),
        ("opencv", "OpenCV", "https://opencv.org"),
        ("onnx", "ONNX", "https://onnx.ai"),
        ("anaconda", "Conda", "https://docs.conda.io"),
        ("sqlite", "SQLite", "https://www.sqlite.org"),
    ]),
    ("后端", [
        ("openjdk", "JDK 17", "https://openjdk.org"),
        ("dotnet", ".NET", "https://dotnet.microsoft.com"),
        ("nodedotjs", "Node.js", "https://nodejs.org"),
        ("mysql", "MySQL", "https://www.mysql.com"),
        ("epl", "易语言", "https://www.eyuyan.com"),
    ]),
    ("前端与工具链", [
        ("html5", "HTML5", "https://developer.mozilla.org/en-US/docs/Web/HTML"),
        ("javascript", "JS", "https://developer.mozilla.org/en-US/docs/Web/JavaScript"),
        ("git", "Git", "https://git-scm.com"),
        ("githubactions", "Actions", "https://github.com/features/actions"),
        ("intellijidea", "IDEA", "https://www.jetbrains.com/idea/"),
        ("pycharm", "PyCharm", "https://www.jetbrains.com/pycharm/"),
    ]),
    ("折腾", [
        ("linux", "Linux", "https://www.kernel.org"),
        ("curl", "cURL", "https://curl.se"),
        ("arduino", "Arduino", "https://www.arduino.cc"),
        ("ffmpeg", "FFmpeg", "https://ffmpeg.org"),
        ("vmware", "VMware", "https://www.vmware.com"),
    ]),
]

FILL_RE = re.compile(r'fill="(#[0-9a-fA-F]{3,6})"')
BRANDS = {}
# IDEA / PyCharm / OpenJDK / LM Studio 的官方色就是纯黑，拿它做悬停光晕等于没有，
# 这几个统一退成钢灰。只影响 --brand，logo 文件本身保持原色。
BLACK_GLOW = "#8fa3bf"
# simple-icons 里没有、或者现成的矢量在 24px 下没法用的条目，文件已经在 static/svg/icons/
# 里，生成器只登记品牌色、不去 CDN 抓：
#   epl     —— 照着易语言官方印章 logo 重绘的阴刻矢量；
#   mysql   —— 官方只有「线条海豚 + MySQL 字标」的组合 logo，压到 24px 线条就消失，
#              所以照官方姿势重绘成实心剪影（点表是在 1200px 网格图上量的）；
#   dotnet  —— 官方 logo 就是字标，直接放会和文字标签重复，改成紫牌 + mask 挖空字标。
#   vmware  —— simple-icons 那份是整条「vmware」字标，24px 下糊成噪点；官方 favicon
#              本来就是蓝牌 + 「vmw」，照它量中心线，用 mask 把字挖穿。
LOCAL = {
    "epl": "#FE0000",
    "mysql": "#4479A1",
    "dotnet": "#512BD4",
    "vmware": "#007AA9",
}


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "skill-icons"})
    if certifi:
        ctx = ssl.create_default_context(cafile=certifi.where())
    else:
        # 没装 certifi 时退回系统默认；MSYS2 那套解释器不带 CA 根，会握手失败
        ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
        with open(dest, "wb") as fh:
            fh.write(resp.read())


def fetch(slug):
    """返回 (svg 文本, 品牌色)。落盘缓存，缓存命中时离线可跑。"""
    os.makedirs(CACHE, exist_ok=True)
    local = os.path.join(CACHE, slug + ".svg")
    if not os.path.exists(local):
        download(CDN.format(slug), local)
    with open(local, encoding="utf-8") as fh:
        svg = fh.read()
    fill = FILL_RE.search(svg)
    return svg, (fill.group(1) if fill else "#c9d4e3")


def snippet():
    lines = ['\t\t\t<div class="workbox stackbox">']
    for title, items in SKILLS:
        lines.append('\t\t\t\t<!-- %s -->' % title)
        for slug, name, url in items:
            head = ('\t\t\t\t<a class="stack" href="%(url)s" target="_blank"'
                    ' rel="noopener noreferrer" style="--brand:%(brand)s">'
                    % {"brand": BRANDS[slug], "url": url})
            body = ('<img src="./static/svg/icons/%s.svg" alt="" aria-hidden="true">'
                    '<span>%s</span></a>' % (slug, name))
            lines.append(head + body)
    lines.append('\t\t\t</div>')
    return "\n".join(lines)


def main():
    # 片段的落点是 index.html，那个文件是纯 LF。Windows 下 stdout 默认按 CRLF + 本地
    # 代码页（GBK）写，注释里的中文会直接变成非法字节，所以行尾和编码都强制成 UTF-8/LF。
    # 统计走 stderr，重定向到文件时同样要按 UTF-8 落。
    sys.stdout.reconfigure(newline="\n", encoding="utf-8")
    sys.stderr.reconfigure(newline="\n", encoding="utf-8")
    slugs = [s for _, items in SKILLS for s, _, _ in items]
    fetched = [s for s in slugs if s not in LOCAL]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        results = pool.map(fetch, fetched)
    os.makedirs(OUTDIR, exist_ok=True)
    for slug in slugs:
        if slug in LOCAL:
            BRANDS[slug] = LOCAL[slug]
            path = os.path.join(OUTDIR, slug + ".svg")
            if not os.path.exists(path):
                sys.exit("手画图标缺失：%s —— 生成器不会去 CDN 抓它" % path)
    for slug, (svg, brand) in zip(fetched, results):
        BRANDS[slug] = BLACK_GLOW if brand.lower() == "#000000" else brand
        with open(os.path.join(OUTDIR, slug + ".svg"), "w", encoding="utf-8") as fh:
            fh.write(svg)
    print(snippet())
    print("<!-- %d 个抓自 simple-icons，%d 个手画 -->" % (len(fetched), len(LOCAL)), file=sys.stderr)


if __name__ == "__main__":
    main()
