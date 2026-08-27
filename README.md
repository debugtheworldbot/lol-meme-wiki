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
- 可选 Plausible 埋点

## 生产环境配置

在 Vercel 项目设置中配置变量，不要把令牌写进仓库：

| 变量 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 生产站点地址，用于 canonical 与 sitemap |
| `NEXT_PUBLIC_GITHUB_REPO` | 公共仓库名，例如 `org/repo`，用于纠错与无令牌投稿 |
| `GITHUB_REPO` | 服务端投稿目标仓库，可与上项相同 |
| `GITHUB_TOKEN` | 创建 Issue 的 GitHub fine-grained token |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | 可选，启用 Plausible Analytics |

## 内容结构

内容位于 `content/memes`、`content/players`、`content/teams` 和 `content/events`。新增 MDX 文件后，静态路由、搜索索引、聚合页与 sitemap 会自动更新。

当前仓库提供 10 个梗词条和对应实体作为内容种子；正式公开上线前仍需按审核原则扩充并复核到计划中的 100 条。

## 检查

```bash
npm run lint
npm run typecheck
npm run build
```
