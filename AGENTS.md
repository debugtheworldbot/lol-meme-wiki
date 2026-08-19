# AGENTS.md

给 coding agent 的仓库说明（Claude Code 通过 `CLAUDE.md` 引用本文件）。面向人的介绍见 `README.md`。本文件保持短、具体、可复制执行；重复踩坑再补规则，不要写成空话清单。用户当次对话优先于本文件。中文回复。

**最高优先级：每改完一个功能／一块可独立验收的改动，立刻 `git commit`，不问、不等、不攒。** 细则见「完成即提交」。

## 架构

Next.js 16 App Router + React 19 + MDX 的中文英雄联盟梗 Wiki。**内容即数据库**：`content/` 下的 MDX 文件是唯一数据源，没有数据库、没有 CMS、没有构建脚本。

```
content/memes|players|teams|events/*.mdx   YAML front matter + MDX 正文
lib/content.ts                             唯一读取层（fs + gray-matter + React cache）
lib/types.ts                               MemeEntry / EntityEntry / SearchRecord
app/                                       路由；detail 页 generateStaticParams 全量静态化
components/                                UI
```

关键机制，改动前先理解：

- **`lib/content.ts` 是唯一内容层**，`import "server-only"`，同步读文件后用 `cache()` 去重。不要另起数据获取方式，不要在客户端组件里读 `content/`。
- **slug 就是外键。** meme 的 `players` / `teams` / `events` / `related` 存的是对方 slug，不是展示名。`getMemesForEntity()` 反向聚合出实体页的梗列表——所以关联是双向的，只需在 meme 一侧写。slug 写错不会报错，只会在 infobox 里裸显示 slug（`getEntityTitle` 回退），且实体页少一条聚合。
- **搜索索引在服务端生成。** `getSearchRecords()` 把四个集合拍平成 `SearchRecord[]`，含 aliases 和从关联实体展开的 keywords；`layout.tsx` 注入后由 Fuse.js 在客户端（`search-dialog` / `inline-search` / `meme-explorer`）检索。想让某词能搜到，加进 `aliases` 或 `tags`，不要改搜索组件。
- **加 MDX 文件即上线**：静态路由、目录页、聚合页、搜索索引、`sitemap.ts` 全部自动跟随，无需注册。
- **样式是 `app/globals.css` 里一套语义类名**（`wiki-page` / `wiki-shell` / `wiki-infobox` / `wiki-prose`…，~670 行 + CSS 变量）。Tailwind v4 只是 `@import` 进来，组件里**不写 utility class**；`lib/utils.ts` 的 `cn()` 目前无人使用。新 UI 沿用语义类名，不要开始堆 utility。
- **`/api/submit` 三态降级**：有 `GITHUB_TOKEN` + repo → 建 Issue；只有 repo → 返回预填 Issue 链接；都没有 → 返回可复制的 markdown 草稿。含 honeypot 字段 `website`。纠错入口 `components/correction-dialog.tsx` 是站内弹层，走同款三态降级的 `/api/submit` 姊妹路由 `/api/correction`（标题 `[补充/纠错]`、label `内容纠错`），默认直接建 Issue，不跳 GitHub。
- **SEO 分散在页面里**：每页自己的 `generateMetadata` + canonical，meme 页发 `DefinedTerm` JSON-LD、首页发 `WebSite` + SearchAction，`sitemap.ts` / `robots.ts` 从内容生成。加新路由记得补这几样。

## 命令

无测试框架，检查 = lint / typecheck / build。优先只跑和改动相关的那一项，不要默认全量 `build`。

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint (flat config, eslint-config-next)
npm run typecheck  # tsc --noEmit，TS strict
npm run build      # 改路由、metadata、内容集合、生产配置时才跑
```

改可见 UI 后要在浏览器里真正走完路径，不要只看截图。

## 写内容

新词条对齐现有 MDX 字段，参考 `content/memes/wo-chovy.mdx`（字段最全）。

- 必填：`title` / `slug` / `summary` / `players` / `teams` / `events` / `related` / `tags` / `sources`；可选 `aliases` / `first_seen` / `timeline` / `source_note` / `updated_at` / `featured` / `heat`。
- 关联的实体 slug 必须已存在于 `content/players|teams|events/`，否则先补实体文件。不要写死展示名当外键。
- 正文从 `##` 起（`#` 留给页面标题），惯用小节：`## 一句话看懂`、`## 为什么是 X`、`## 现在怎么用`。`MDXRemote` 没配自定义组件映射，写标准 markdown 即可。
- `tags` 是自由词表（现 75 个），沿用高频词：`游戏梗` `选手梗` `赛事梗` `英雄台词` `回旋镖` `数字梗` `技能梗` `谐音梗` `贴吧梗` `虎扑梗` `出圈梗` `黑称`，加年份 `2026` / 赛季 `S15`。首页会统计 `游戏梗` / `赛事梗` / `英雄台词` 三类计数，`/memes?tag=` 靠它筛选。
- `heat`（现 72–99）决定首页热门排序；`featured` 现已有 32 条为 true，首页只取标题排序后**第一条**，所以它基本不是“置顶”开关，别指望靠它上首页。
- `summary` 会被 `WikiLinkedText` 自动把关联实体的名字/别名（≥2 字）变成链接，也会截成 155 字以内的 meta description——第一句写清“是什么”。
- 考证不确定的（首次出现时间、谁先说的）写进 `source_note` 显式声明，不要在正文里含糊断言。

### 找料与来源

**优先查中文社区一手素材**，按此顺序：Bilibili（原视频/切片/合集，`bilibili.com` / `b23.tv` 的可打开 BV 页）→ 百度贴吧 → 虎扑步行街/JRs → NGA → 知乎、小红书、微博等；再退到赛事官网（`lol.qq.com`）、萌娘百科、新闻稿。英文侧可用 Reddit / Leaguepedia 交叉验证。现有 `sources` 分布以 Bilibili 为主（126 条）。

**来源必须标清楚**：每条 `sources` 写 `title`（能看出是什么内容，不要只写“链接”）、`url`（可直接打开）、`kind`（`video` / `match` / `post` / `article`，页面按此显示“视频/比赛/帖子/文章”）。梗的说法归社区，不要把二手转述当出处；同一说法有争议时列多条来源，并在 `source_note` 里说明分歧。

## 约定

- TypeScript 严格；沿用现有组件和 `lib/content.ts` 的读取方式，勿另起内容层。
- 令牌和站点配置全走环境变量（`NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_GITHUB_REPO` / `GITHUB_REPO` / `GITHUB_TOKEN` / `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`，见 `README.md`）。不要把 token 或 `.env*` 写进仓库。
- 不要手改 `.next/` `.open-next/` `.wrangler/` `.vercel/` `node_modules/` `work/`（`.open-next`、`.wrangler` 是遗留构建产物，当前部署走 Vercel）。
- 生产依赖先问再加。脚本名以 `package.json` 为准。

## 完成即提交

写完一个功能，或完成一块可独立验收的改动后，**立刻 `git commit`**。这是默认动作，不是可选项：

- 不要问“要不要提交”“需要我 commit 吗”，直接提交，提交完在回复里用一行说明提交了什么。
- 不要等用户开口，不要攒到会话结束，不要因为“可能还要再改”就先放着。
- 唯一例外：用户当次明确说了别提交／先别动 git。

提交是检查点：绿了就锁住，坏了能回退；下一段会话只靠 git 历史接着干。

一块 = 一个逻辑增量（一个页面、一个组件、一次修 bug、一份文档、一条词条），不是整次会话结束才交。无关改动拆开提交。

### 提交前

1. `git status` / `git diff` / `git log -5`：确认范围、对齐仓库 message 风格。
2. 只 stage 本次文件。不要 `git add .` 把无关改动、密钥、`.env*`、构建产物带上。
3. 代码改动至少跑相关 `lint` / `typecheck`；检查不过先修，**不要提交红的状态**。
4. 工作区已脏且混有别人/上次未提交改动时，分开 stage，只交自己这块；分不清就先问。
5. 大重构或不确定的大改之前，先交一个干净检查点，再动手。

### 提交说明

用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>
```

- `type`：`feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `perf` / `style`
- `scope` 可选：`meme` / `content` / `search` / `ui` / `home` / `seo` 等
- `subject` 祈使、一句说清做了什么；中文优先
- 需要时在 body 写为什么，不重复 diff

坏例子：`update`、`fix bug`、`wip`、一条里塞功能和无关重构。

### 不要做

- 默认只 commit，**不 push、不改远程、不 force push、不改已推送历史**。用户明确要求再推。
- 不要用 commit 当聊天记录，不要为“看起来勤快”拆成无意义碎提交。
- 不要提交半截、编译失败或明知会炸的代码。
