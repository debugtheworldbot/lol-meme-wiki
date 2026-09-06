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
