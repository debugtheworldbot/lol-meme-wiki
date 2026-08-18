# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

面向人的介绍见 `README.md`；`AGENTS.md` 是同一套规则的通用 agent 版本，两者冲突时以本文件为准。中文回复。

## 命令

无测试框架，检查 = lint / typecheck / build。优先只跑和改动相关的那一项。

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint (flat config, eslint-config-next)
npm run typecheck  # tsc --noEmit，TS strict
npm run build      # 改路由、metadata、内容集合、生产配置时才跑
```

改可见 UI 后要在浏览器里真正走完路径，不要只看截图。

## 架构

Next.js 16 App Router + React 19 + MDX 的中文英雄联盟梗 Wiki。**内容即数据库**：`content/` 下的 MDX 文件是唯一数据源，没有数据库、没有 CMS、没有构建脚本。

```
content/memes|players|teams|events/*.mdx   YAML front matter + MDX 正文
lib/content.ts                             唯一读取层（fs + gray-matter + React cache）
lib/types.ts                               MemeEntry / EntityEntry / SearchRecord
app/                                       路由；detail 页 generateStaticParams 全量静态化
```

关键机制，改动前先理解：

- **`lib/content.ts` 是唯一内容层**，`import "server-only"`，同步读文件后用 `cache()` 去重。不要另起数据获取方式，不要在客户端组件里读 `content/`。
- **slug 就是外键。** meme 的 `players` / `teams` / `events` / `related` 存的是对方 slug，不是展示名。`getMemesForEntity()` 反向聚合出实体页的梗列表——所以关联是双向的，只需在 meme 一侧写。slug 写错不会报错，只会在 infobox 里裸显示 slug（`getEntityTitle` 回退），且实体页少一条聚合。
- **搜索索引在服务端生成。** `getSearchRecords()` 把四个集合拍平成 `SearchRecord[]`，含 aliases 和从关联实体展开的 keywords；`layout.tsx` 注入后由 Fuse.js 在客户端（`search-dialog` / `inline-search` / `meme-explorer`）检索。想让某词能搜到，加进 `aliases` 或 `tags`，不要改搜索组件。
- **加 MDX 文件即上线**：静态路由、目录页、聚合页、搜索索引、`sitemap.ts` 全部自动跟随，无需注册。
- **样式是 `app/globals.css` 里一套语义类名**（`wiki-page` / `wiki-shell` / `wiki-infobox` / `wiki-prose`…，~670 行 + CSS 变量）。Tailwind v4 只是 `@import` 进来，组件里**不写 utility class**；`lib/utils.ts` 的 `cn()` 目前无人使用。新 UI 沿用语义类名，不要开始堆 utility。
- **`/api/submit` 三态降级**：有 `GITHUB_TOKEN` + repo → 建 Issue；只有 repo → 返回预填 Issue 链接；都没有 → 返回可复制的 markdown 草稿。含 honeypot 字段 `website`。纠错入口走 `lib/utils.ts` 的 `getIssueUrl()`。
- **SEO 分散在页面里**：每页自己的 `generateMetadata` + canonical，meme 页发 `DefinedTerm` JSON-LD、首页发 `WebSite` + SearchAction，`sitemap.ts` / `robots.ts` 从内容生成。加新路由记得补这几样。

## 写内容

新词条对齐现有 MDX 字段，参考 `content/memes/wo-chovy.mdx`（字段最全）。

- 必填：`title` / `slug` / `summary` / `players` / `teams` / `events` / `related` / `tags` / `sources`；可选 `aliases` / `first_seen` / `timeline` / `source_note` / `updated_at` / `featured` / `heat`。
- 关联的实体 slug 必须已存在于 `content/players|teams|events/`，否则先补实体文件。
- 正文从 `##` 起（`#` 留给页面标题），惯用小节：`## 一句话看懂`、`## 为什么是 X`、`## 现在怎么用`。`MDXRemote` 没配自定义组件映射，写标准 markdown 即可。
- `tags` 是自由词表（现 75 个），沿用高频词：`游戏梗` `选手梗` `赛事梗` `英雄台词` `回旋镖` `数字梗` `技能梗` `谐音梗` `贴吧梗` `虎扑梗` `出圈梗` `黑称`，加年份 `2026` / 赛季 `S15`。首页会统计 `游戏梗` / `赛事梗` / `英雄台词` 三类计数，`/memes?tag=` 靠它筛选。
- `heat`（现 72–99）决定首页热门排序；`featured` 现已有 32 条为 true，首页只取标题排序后**第一条**，所以它基本不是"置顶"开关，别指望靠它上首页。
- `summary` 会被 `WikiLinkedText` 自动把关联实体的名字/别名（≥2 字）变成链接，也会截成 155 字以内的 meta description——第一句写清"是什么"。
- 考证不确定的（首次出现时间、谁先说的）写进 `source_note` 显式声明，不要在正文里含糊断言。

### 找料与来源

**优先查中文社区一手素材**，按此顺序：Bilibili（原视频/切片/合集，`bilibili.com` / `b23.tv` 的可打开 BV 页）→ 百度贴吧 → 虎扑步行街/JRs → NGA → 知乎、小红书、微博等；再退到赛事官网（`lol.qq.com`）、萌娘百科、新闻稿。英文侧可用 Reddit / Leaguepedia 交叉验证。现有 `sources` 分布以 Bilibili 为主（126 条）。

**来源必须标清楚**：每条 `sources` 写 `title`（能看出是什么内容，不要只写"链接"）、`url`（可直接打开）、`kind`（`video` / `match` / `post` / `article`，页面按此显示"视频/比赛/帖子/文章"）。梗的说法归社区，不要把二手转述当出处；同一说法有争议时列多条来源，并在 `source_note` 里说明分歧。

## 提交

写完一块可独立验收的改动就**立刻 `git commit`，不要等用户开口**。一块 = 一个逻辑增量（一个页面、一个组件、一次修 bug、一条词条）。

- Conventional Commits：`<type>(<scope>): <subject>`，scope 常用 `meme` / `content` / `search` / `ui` / `home` / `seo`，subject 中文祈使句。
- 只 stage 本次文件，不要 `git add .`。提交前跑相关 lint / typecheck，**不提交红的状态**。
- 默认只 commit：不 push、不改远程、不 force push、不改已推送历史，除非用户明确要求。

## 环境与禁区

- 令牌和站点配置全走环境变量（`NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_GITHUB_REPO` / `GITHUB_REPO` / `GITHUB_TOKEN` / `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`，见 `README.md`）。不要把 token 或 `.env*` 写进仓库。
- 不要手改 `.next/` `.open-next/` `.wrangler/` `.vercel/` `node_modules/` `work/`（`.open-next`、`.wrangler` 是遗留构建产物，当前部署走 Vercel）。
- 新增生产依赖先问。
