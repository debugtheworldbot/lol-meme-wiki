import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";
import { Converter } from "opencc-js/cn2t";

// 只读检查 next build 产物；HTML/XML 使用 Python 标准库解析，无第三方解析依赖。
const buildRoot = path.resolve(".next/server/app");
const sitemapFile = path.join(buildRoot, "sitemap.xml.body");
if (!fs.existsSync(sitemapFile)) throw new Error("缺少生产构建产物，请先 npm run build。");

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}

const parser = String.raw`
import json, sys, xml.etree.ElementTree as ET
from html.parser import HTMLParser

VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
SKIP = set('script style noscript code pre textarea'.split())
class Page(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.stack=[]; self.result={'lang':'','title':'','meta':{},'canonical':[], 'alternates':{},'links':[], 'jsonld':[], 'texts':[], 'h1':[], 'mainCount':0,'hiddenContent':False,'outsideMain':False}; self.ld=None
 def protected(self):
  return any(t in SKIP or a.get('translate')=='no' or a.get('contenteditable') in ('','true') for t,a in self.stack)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='html':self.result['lang']=a.get('lang','')
  if t=='meta':self.result['meta'][a.get('name',a.get('property',''))]=a.get('content','')
  if t=='link' and a.get('rel')=='canonical':self.result['canonical'].append(a.get('href',''))
  if t=='link' and a.get('rel')=='alternate' and a.get('hreflang'):self.result['alternates'][a['hreflang']]=a.get('href','')
  if t=='a' and a.get('href'):self.result['links'].append({'href':a['href'],'switch':bool(a.get('hreflang'))})
  if t=='main':self.result['mainCount']+=1
  if t in ('h1','article'):
   if not any(tag=='main' for tag,_ in self.stack):self.result['outsideMain']=True
   if t=='h1':self.result['h1'].append('')
  if t=='script' and a.get('type')=='application/ld+json':self.ld=''
  if t not in VOID:self.stack.append((t,a))
 def handle_endtag(self,t):
  if t=='script' and self.ld is not None:
   try:self.result['jsonld'].append(json.loads(self.ld))
   except Exception as e:self.result['jsonld'].append({'parseError':str(e)})
   self.ld=None
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==t:self.stack=self.stack[:i];break
 def handle_data(self,text):
  if self.ld is not None:self.ld+=text
  if any(t=='title' for t,_ in self.stack):self.result['title']+=text
  if any(t=='h1' for t,_ in self.stack) and self.result['h1']:self.result['h1'][-1]+=text
  if self.protected() or not text.strip():return
  if any('hidden' in a or a.get('id','').startswith('S:') for _,a in self.stack):self.result['hiddenContent']=True
  if any(t=='main' for t,_ in self.stack):self.result['texts'].append(text.strip())
input_data=json.load(sys.stdin)
result=[]
for file in input_data['files']:
 p=Page()
 with open(file,encoding='utf8') as f:p.feed(f.read())
 result.append({'file':file,**p.result})
root=ET.parse(input_data['sitemap']).getroot(); ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','h':'http://www.w3.org/1999/xhtml'}
urls=[]
for entry in root.findall('s:url',ns):
 urls.append({'loc':entry.findtext('s:loc',namespaces=ns),'alternates':{a.attrib.get('hreflang'):a.attrib.get('href') for a in entry.findall('h:link',ns)}})
print(json.dumps({'pages':result,'urls':urls},ensure_ascii=False))
`;
const parsed = spawnSync("python3", ["-c", parser], {
  input: JSON.stringify({ files: htmlFiles(buildRoot), sitemap: sitemapFile }),
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
if (parsed.error || parsed.status !== 0) throw new Error(`HTML/XML 解析失败（需要 Python 3）：${parsed.error?.message ?? parsed.stderr}`);
const { pages: rawPages, urls } = JSON.parse(parsed.stdout);
const origin = new URL(urls[0].loc).origin;
const convert = Converter({ from: "cn", to: "tw" });
const errors = [];
const fail = (page, message) => errors.push(`${page}: ${message}`);
const normalizePath = (value) => value.replace(/\/$/, "") || "/";
const stripLocale = (value) => normalizePath(value.replace(/^\/zh-tw(?=\/|$)/, ""));
const traditionalPath = (value) => `/zh-tw${value === "/" ? "" : value}`;
const isTraditional = (value) => value === "/zh-tw" || value.startsWith("/zh-tw/");
const isNoindex = (page) => /(?:^|[\s,])noindex(?:$|[\s,])/.test(page.meta.robots ?? "");
const asUrl = (value) => new URL(value, origin);
const sameUrl = (value, expectedPath) => {
  try { const url = asUrl(value); return url.origin === origin && normalizePath(url.pathname) === expectedPath && !url.search && !url.hash; }
  catch { return false; }
};
function routeFor(file) {
  const segments = path.relative(buildRoot, file).split(path.sep).filter((segment) => !/^\(.*\)$/.test(segment));
  const route = `/${segments.join("/").replace(/\.html$/, "")}`;
  return normalizePath(route.replace(/\/index$/, ""));
}
const pages = new Map();
for (const page of rawPages) {
  const route = routeFor(page.file);
  if (/(?:^|\/)(?:_not-found|_global-error|404|500)$/.test(route)) continue;
  if (pages.has(route)) fail(route, "多个 HTML 产物映射到同一网址");
  pages.set(route, page);
}
const sitemapPaths = new Set(urls.map(({ loc }) => normalizePath(asUrl(loc).pathname)));
const expectedAlternates = (route) => ({ "zh-Hans": stripLocale(route), "zh-Hant": traditionalPath(stripLocale(route)), "x-default": stripLocale(route) });
function checkAlternates(route, alternates, label) {
  for (const [language, expected] of Object.entries(expectedAlternates(route))) {
    if (!sameUrl(alternates[language], expected)) fail(route, `${label} ${language} 未指向 ${expected}`);
  }
}
for (const { loc, alternates } of urls) {
  const route = normalizePath(asUrl(loc).pathname);
  if (!pages.has(route)) fail(route, "sitemap URL 缺少静态 HTML 产物");
  if (isNoindex(pages.get(route) ?? { meta: {} })) fail(route, "noindex 页面进入 sitemap");
  checkAlternates(route, alternates, "sitemap hreflang");
}

const languageTypes = new Set(["WebSite", "WebPage", "CollectionPage", "Article"]);
const urlKeys = new Set(["url", "@id", "item", "target", "urlTemplate"]);
function checkJsonLd(value, route, key = "") {
  if (typeof value === "string" && urlKeys.has(key)) {
    let url;
    try { url = asUrl(value); } catch { return; }
    if (url.origin === origin && pages.has(stripLocale(url.pathname)) && isTraditional(url.pathname) !== isTraditional(route)) fail(route, `JSON-LD ${key} 语言错误：${value}`);
  } else if (Array.isArray(value)) value.forEach((item) => checkJsonLd(item, route, key));
  else if (value && typeof value === "object") {
    if (value.parseError) fail(route, `JSON-LD 不是合法 JSON：${value.parseError}`);
    if (languageTypes.has(value["@type"]) && value.inLanguage !== (isTraditional(route) ? "zh-Hant" : "zh-Hans")) fail(route, "JSON-LD inLanguage 缺失或错误");
    Object.entries(value).forEach(([name, item]) => checkJsonLd(item, route, name));
  }
}
for (const [route, page] of pages) {
  const traditional = isTraditional(route);
  if (page.lang !== (traditional ? "zh-Hant" : "zh-CN")) fail(route, `html lang 错误：${page.lang}`);
  if (page.canonical.length !== 1 || !sameUrl(page.canonical[0], route)) fail(route, "canonical 没有唯一指向自身");
  const metaFile = page.file.replace(/\.html$/, ".meta");
  if (fs.existsSync(metaFile)) {
    const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
    if (meta.status && meta.status !== 200) fail(route, `预渲染响应状态为 ${meta.status}`);
  }
  if (page.mainCount !== 1 || page.h1.length !== 1 || page.outsideMain || page.hiddenContent || !page.texts.length) fail(route, "主内容/H1 没有直接且完整输出到 main");
  if (!page.title.trim() || !page.meta.description?.trim() || !page.meta["og:title"]?.trim() || !page.meta["og:description"]?.trim()) fail(route, "标题、描述或 Open Graph 文案缺失");
  if (!sameUrl(page.meta["og:url"], route)) fail(route, "og:url 没有指向自身");
  if (page.meta["og:locale"] !== (traditional ? "zh_TW" : "zh_CN")) fail(route, "og:locale 错误");
  const imagePath = /^\/(?:zh-tw\/)?(?:meme|player|team|event)\/[^/]+$/.test(route)
    ? `${route}/opengraph-image` : traditional ? "/zh-tw/opengraph-image" : "/opengraph-image";
  for (const key of ["og:image", "twitter:image"]) {
    // Next metadata 文件可给图 URL 附加缓存参数；域名和路径必须仍属于当前语言。
    try {
      const image = asUrl(page.meta[key]);
      if (image.origin !== origin || image.pathname !== imagePath) fail(route, `${key} 的域名或语言路径错误`);
    } catch { fail(route, `${key} 缺失或不是有效 URL`); }
  }
  if (!isNoindex(page)) {
    checkAlternates(route, page.alternates, "HTML hreflang");
    if (!sitemapPaths.has(route)) fail(route, "可索引页面未进入 sitemap");
  }
  if (stripLocale(route) === "/submit" && !isNoindex(page)) fail(route, "投稿页缺少 noindex");
  for (const link of page.links) {
    let url;
    try { url = asUrl(link.href); } catch { continue; }
    if (url.origin !== origin || link.href.startsWith("#")) continue;
    if (url.pathname.startsWith("/zh-tw/api/")) fail(route, `API 被错误加上语言前缀：${link.href}`);
    if (pages.has(stripLocale(url.pathname)) && !link.switch && isTraditional(url.pathname) !== traditional) fail(route, `站内链接跳出当前语言：${link.href}`);
  }
  page.jsonld.forEach((data) => checkJsonLd(data, route));
  if (traditional) {
    const simplified = pages.get(stripLocale(route));
    if (!simplified) { fail(route, "缺少简体对应页"); continue; }
    if (page.h1[0] !== convert(simplified.h1[0] ?? "")) fail(route, "H1 与简体源转换结果不一致");
    for (const key of ["description", "og:title", "og:description"]) if (page.meta[key] !== convert(simplified.meta[key] ?? "")) fail(route, `${key} 未完整繁体化`);
    if (page.title !== convert(simplified.title)) fail(route, "搜索标题未完整繁体化");
    if (page.texts.length !== simplified.texts.length) fail(route, "简繁正文文字节点数量不同，请核对是否漏渲染");
    else {
      const mismatch = page.texts.findIndex((text, i) => text !== convert(simplified.texts[i]));
      if (mismatch >= 0) fail(route, `正文未匹配源文转换：${JSON.stringify(page.texts[mismatch].slice(0, 90))}，预期 ${JSON.stringify(convert(simplified.texts[mismatch]).slice(0, 90))}`);
    }
  } else if (!pages.has(traditionalPath(route))) fail(route, "缺少繁体对应页");
}
for (const collection of ["players", "teams", "events"]) {
  const kind = { players: "player", teams: "team", events: "event" }[collection];
  for (const file of fs.readdirSync(`content/${collection}`).filter((file) => file.endsWith(".mdx"))) {
    const { data } = matter(fs.readFileSync(`content/${collection}/${file}`, "utf8"));
    if (data.indexable === true) continue;
    for (const route of [`/${kind}/${data.slug}`, `/zh-tw/${kind}/${data.slug}`]) {
      if (sitemapPaths.has(route)) fail(route, "未开放索引的实体进入 sitemap");
      if (pages.has(route) && !isNoindex(pages.get(route))) fail(route, "未开放索引的实体丢失 noindex");
    }
  }
}
if (errors.length) {
  console.error(errors.slice(0, 60).join("\n"));
  if (errors.length > 60) console.error(`…另有 ${errors.length - 60} 项错误`);
  process.exitCode = 1;
} else console.log(`简繁 SEO 验收通过：${pages.size} 个静态页面，${urls.length} 个 sitemap URL；正文直出、语言互链、元数据、JSON-LD、语言内链及 noindex 均符合规范。`);
