# 简繁中文与 SEO 维护规范

本规范适用于新增词条、页面、组件和 SEO 改动。界面规范见 [DESIGN.md](../DESIGN.md)，执行与提交规则见 [AGENTS.md](../AGENTS.md)。

## URL 与唯一内容源

- 简体保留原 URL，例如 `/meme/hongwen`；繁体使用 `/zh-tw/meme/hongwen`，首页为 `/zh-tw`。路径中的 slug、外键和锚点 ID 不翻译。
- `content/` 是唯一内容源，不复制一套繁体 MDX。OpenCC 使用 `cn → tw` 字形转换，不使用替换地区词汇的 `twp`；释义、来源和考证边界仍需编辑复核。
- 简体页面实现位于 `app/(zh-cn)/`，路由组名不进入 URL；繁体入口位于 `app/zh-tw/`，复用页面实现和 `generateStaticParams`。新词条自动生成两版；新增路由必须同时增加繁体入口，更新 `lib/locale-path.ts` 的页面范围，并按索引策略加入 sitemap。
- 两个根布局分别提供简体、繁体语言上下文。URL 决定内容，不能按 Cookie、localStorage、IP 或浏览器语言自动覆盖 URL 对应的语言。

## 服务端正文与交互

- 两版的初始 HTML 必须直接包含可读的标题、正文和导航，正文位于 `main`，不依赖点击切换、执行脚本或搬运隐藏容器才能出现。
- 可见组件返回的 JSX 使用 `LocalizedContent`；服务端预渲染与客户端更新采用同一转换路径。每段文字只转换一次，禁止叠加 DOM MutationObserver 翻译。
- MDX 保留原始源码，使用 `MDXRemote` 的 `wrapper: LocalizedContent`、`a: LocaleLink` 映射。不能对整段 MDX 源码、HTML 字符串、序列化数据或 JSON-LD 做无差别文本替换。
- 站内页面使用 `LocaleLink`，命令式跳转使用 `withLocalePath`；当前语言内浏览不应意外跳回另一版。API、资源、第三方来源、代码、ID、表单输入和 `translate="no"` 内容不转换。
- “繁／简”入口必须输出真实 `<a href>`，链接到当前页面另一语言版本。浏览器切换保留查询条件和锚点；关闭 JavaScript 时仍可切换语言、阅读和跟随链接。
- 全局搜索、首页搜索、目录筛选继续共享简繁归一化规则；显示结果跟随页面语言，搜索输入与埋点关键词保留用户原文。未提交表单草稿只在当前浏览器会话内跨语言保留，不发送到服务端。

## 每页 SEO 契约

| 项目 | 简体 | 繁体 |
| --- | --- | --- |
| HTML lang | `zh-CN` | `zh-Hant` |
| canonical | 当前简体 URL | 当前繁体 URL，不能指回简体 |
| hreflang | `zh-Hans` → 简体、`zh-Hant` → 繁体、`x-default` → 简体 | 同一组互相回指的链接 |
| Open Graph locale | `zh_CN` | `zh_TW` |
| 正文、标题、描述、分享图 | 简体 | 服务端生成的繁体 |

- 使用 `localizeMetadata` 统一生成 canonical、hreflang、OG/Twitter 标题描述与分享图 URL；`NEXT_PUBLIC_SITE_URL` 必须是正式站点域名。不要把 localhost 或预览域名的产物部署为正式索引地址。
- 使用共享 `JsonLd`：只翻译展示字段，内部 URL 跟随语言，`WebSite`／`WebPage`／`CollectionPage` 等声明对应 `inLanguage`。保留 Schema 类型、日期、外部来源和其他标识符。
- `/memes` 的筛选与搜索参数仍规范化到当前语言目录本身；不要为任意筛选组合开放独立索引。
- sitemap 只列可索引页面，简繁成对并附同一组语言替代链接。两版使用同一份真实内容更新时间；不因部署或重新转换而刷新 `lastmod`。
- `draft: true` 的词条两版均不生成；`indexable !== true` 的实体、投稿页两版均保留 `noindex`，不进入 sitemap，不发布语言替代声明。
- 未知路径和不存在的词条返回 HTTP 404；不重定向到首页或返回伪 200。双根布局使用独立 `global-not-found.tsx`，直接输出完整错误文档和简繁首页恢复链接，不声明错误页的 canonical／hreflang。

## 验收与发布

1. 运行相关 lint、类型与内容检查，执行生产构建，再运行 `npm run check:locale-seo`（使用 Python 3 标准库解析 HTML/XML，不增加生产依赖）。本机 Turbopack 受端口权限限制时可用 `npm run build -- --webpack`，不因此改变线上构建配置。
2. 构建检查覆盖全部索引页的 canonical、互相回指的 hreflang、sitemap、JSON-LD、分享元数据及主内容；对照简体文字节点检查繁体转换，避免重复转写或只翻译界面未翻译正文。
3. 浏览器检查首页、词条、专题、实体、目录和表单：禁用 JS 后直接打开繁体页面；验证跨语言链接、query/hash、三处搜索、草稿恢复和 404；检查桌面、390px、320px 及相关断点。
4. 部署后重新核对正式 URL、robots 和 sitemap，使用 Search Console URL 检查确认抓取与渲染。只有收到用户推送／部署授权后才执行这些发布动作。
5. IndexNow 全量和 `--since` 从双语 sitemap 取 URL；`--changed` 自动覆盖已公开、可索引内容的两种语言，专题导读也映射到专题页。先 `--dry-run`；线上验证通过后再提交。手动 `--url` 仅提交显式指定的 URL。
6. HTTP 200、构建检查通过、IndexNow 接收、Search Console 抓取成功和实际收录是不同状态；不得用前者宣称后者完成。繁体页存在也不保证特定关键词排名或流量增长。

参考：[Google 多语言站点](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)、[语言版本标记](https://developers.google.com/search/docs/specialty/international/localized-versions)、[Next.js 国际化](https://nextjs.org/docs/app/guides/internationalization)、[OpenCC.js](https://github.com/nk2028/opencc-js)。
