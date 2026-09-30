# 研发.lol

一个以 MDX 内容为核心、由社区协作维护的英雄联盟梗文化 Wiki MVP。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 已实现

- 首页发现、热门梗、随机梗与最新收录
- Fuse.js 客户端全局搜索与梗目录筛选
- 梗、选手、战队、赛事的静态详情页与双向聚合
- MDX + YAML Front Matter 内容存储
- 梗来源、演变时间线、相关梗和纠错入口
- GitHub Issues 投稿 API，并在未配置令牌时生成可复制草稿
- 自动 metadata、canonical、OpenGraph、JSON-LD、sitemap 和 robots
- Vercel Analytics 与 Umami 双埋点

## 生产环境配置

在 Vercel 项目设置中配置变量，不要把令牌写进仓库：

| 变量 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 生产站点地址，用于 canonical 与 sitemap |
| `NEXT_PUBLIC_GITHUB_REPO` | 公共仓库名，例如 `org/repo`，用于纠错与无令牌投稿 |
| `GITHUB_REPO` | 服务端投稿目标仓库，可与上项相同 |
| `GITHUB_TOKEN` | 创建 Issue 的 GitHub fine-grained token |

## 内容结构

内容位于 `content/memes`、`content/players`、`content/teams` 和 `content/events`。新增 MDX 文件后，静态路由、搜索索引、聚合页与 sitemap 会自动更新。

公开词条应解释具体含义、背景和使用差别，并以具体视频、原帖或赛事记录支持核心说法。不要为了数量或字数扩写重复内容；来源可定位不等于事实已经核实，转载时间也不等于起源时间。面向读者的编辑原则见 `/about`。

公开梗词条必填 `collected_at: "YYYY-MM-DD"`，表示首次收录到本站的日期，首页“最新收录”按此排序。历史词条按首次加入 Git 的北京时间一次性补齐，构建时不读取 Git。`first_seen` 记录梗本身的时间线索，`updated_at` 记录正文修改；修改旧文不更改 `collected_at`。草稿首次公开时填写收录日期。可选 `seo_title` 定制搜索结果标题，省略时沿用自动标题，不改变 slug 或页面主标题。

专题导读放在 `content/guides/<专题 slug>.mdx`，使用 `title`、`slug`、`summary`、`updated_at` 与标准 Markdown 正文。通过唯一内容层读取，显示在已有专题目录之前；正文中的证据链接应紧邻对应说法。导读不单独生成重复页面，需与 `lib/topics.ts` 中已有专题 slug 对应。

人物专题在 `lib/topics.ts` 设置 `player` 外键后，按词条的 `players` 聚合，不要求额外补标签。长词条可在 MDX 中使用 `meme-reading-nav` 原生导航与有 `id` 的二级标题；锚点应随内容保留，避免已有链接失效。

### 阅读行为统计

`MemeArticle` 保留服务端 MDX 正文，仅为正文内链接和末尾标记增加客户端统计；事件经 `lib/analytics.ts` 独立发送给 Vercel 与 Umami，一个服务异常不阻断另一个或页面操作。

- `Article Section Click`：页内目录点击，属性 `meme` / `section`。
- `Topic Guide Click`：正文中的专题入口，属性 `from` / `to` / `placement`。
- `Related Meme Click`：正文链接 `placement=article`，末尾推荐 `placement=after_article`。
- `Source Click`：正文来源 `placement=inline`，参考列表 `placement=references`，其余属性沿用已有格式。
- `Article End Visible`：每次挂载词条时最多一次；仅表示正文末尾进入视野，不能解释为读完、有效阅读时长或降低跳出率。

Umami 脚本仅在生产构建加载，并通过 `data-domains` 限定站点配置的域名，排除本地及其他预览主机。忽略 URL hash，避免目录锚点拆分页面统计。验收时不要向生产统计发送伪造事件；上线后在 Umami 按正式域名、发布日期和页面过滤，核对真实事件及后续阅读变化。

### AI 搜索与引荐复盘

- 复用现有来源统计，分别观察 `chatgpt.com`、`perplexity.ai`、`claude.ai`、`gemini.google.com`、`copilot.microsoft.com`，也记录实际出现的其他 AI 来源。使用完整 28 天，保存时区、起止时间、生产环境及主机过滤条件；后续对比保持同一口径。
- Vercel Web Analytics 用 `visits/aggregate` 按 `referrerHostname`、`requestPath` 查询。核对响应中的实际时间边界；来源页面不自动等于会话首次入口，各页面访客数也不能直接相加当去重访客数。API 不可用时可在 Umami 按来源筛选后查看入口页、后续页面和已有阅读事件。
- 把 AI 引荐访客、PV、引用出现次数、爬虫请求分开记录。缺少 referrer 的访问无法可靠归因；没有可识别来源不等于没有 AI 访问。日志或报表权限不足时记为“未验证”，不要记作零。
- 内容优先依据 Search Console 的实际曝光与现有 AI 来源页面补强：直接释义、紧邻事实的原始来源、传播日期与首创边界。保留已有完整词条，不为制造新鲜度只改日期。`first_seen` 是梗的时间线索，页面发布时间使用 `collected_at`；修改日期取收录与编辑日期中的较晚值，专题日期随导读及关联公开词条更新。
- `robots.txt` 已允许公开页面抓取。机器人管理规则与真实抓取结果分别核对；搜索抓取和训练抓取是独立用途，开放训练不是搜索曝光前提。参考 [OpenAI 爬虫说明](https://developers.openai.com/api/docs/bots)、[Vercel Web Analytics API](https://vercel.com/docs/analytics/web-analytics-api)。

### 待考证与索引

- 尚不能确认核心释义的梗设置 `draft: true`，在 `source_note` 中记录待补证据或撤回原因。文件保留在仓库，但内容层统一将它排除：不生成详情页，不进入目录、搜索、随机推荐、关联展示或 sitemap。
- `related` 可保留待考证词条的 slug，运行时过滤；正文不能硬编码指向未公开词条的链接。补足证据、完成修订与复核后才能移除 `draft`。
- 选手、战队、赛事详情默认是导航页，使用 `noindex, follow`，不进入 sitemap。只有补充独立正文并复核后，才在实体 MDX 中显式设置 `indexable: true`。
- 索引控制用于减少搜索中的薄弱重复页，不能代替内容质量整改，也不能保证 AdSense 审核通过。不要在 robots.txt 中禁止抓取需要读取 noindex 的公开导航页。

### AdSense 整改与重新送审

当前全站暂停加载广告脚本，以全局 `google-adsense-account` meta 标签保留站点验证，`public/ads.txt` 保留发布商声明。重新开放广告时需单独确定有实质内容的广告页面与位置。

1. 先修订重点词条，撤回核心事实无依据的稿件，检查来源与正文是否真正对应。
2. 运行下列检查后部署新版本；只在本地修改并不会更新送审网站。
3. 在生产域名核对代表词条、搜索、导航、关于、联系、隐私页面与移动端路径；核对验证 meta、广告脚本状态及 sitemap。外链需要人工检查可访问性与证据内容，构建校验不负责判定事实真伪。
4. 确认部署生效且实际问题已修复后，再在 AdSense 勾选已解决并申请审核。没有固定词条数、字数或等待天数能保证通过，不应以自动校验通过替代质量复核。

## 检查

```bash
npm run lint
npm run typecheck
npm run check:content
npm run build
```

`build` 会先运行内容校验，阻止无具体来源、搜索结果链接、失效外键及指向待考证稿件的正文链接进入构建。它只检查结构，不检查远程可访问性、原创性或事实准确性。
