# AGENTS.md

给 coding agent 的仓库说明。面向人的介绍见 `README.md`。本文件保持短、具体、可复制执行；重复踩坑再补规则，不要写成空话清单。用户当次对话优先于本文件。

## 仓库

Next.js App Router + MDX 的英雄联盟梗 Wiki。词条进 `content/` 后，静态路由、搜索索引、聚合页和 sitemap 会跟着更新。

- `app/` 路由与页面
- `components/` UI
- `lib/` 内容读取、类型、站点配置
- `content/memes|players|teams|events/` 词条（YAML front matter + MDX）
- 不要手改 `.next/`、`.open-next/`、`.wrangler/`、`node_modules/`、`.vercel/`

## 命令

优先跑和改动相关的检查，不要默认全量 `build`。

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm run build        # 改路由、metadata、内容集合或生产配置时再跑
```

改可见 UI 时，按用户规则在浏览器里走完路径，不要只看截图。

## 约定

- TypeScript 严格；沿用现有组件和 `lib/content.ts` 的读取方式，勿另起内容层。
- 新词条对齐现有 MDX 字段（`slug`、关联实体、`sources`、`timeline`）。关联用已有 slug，不要写死展示名当外键。
- 令牌和站点配置走环境变量，见 `README.md`。不要把 `GITHUB_TOKEN`、`.env*` 写进仓库。
- 生产依赖先问再加。脚本名以 `package.json` 为准。

## 完成即提交

写完一个功能，或完成一块可独立验收的改动后，**立刻 `git commit`，不要等用户开口**。提交是检查点：绿了就锁住，坏了能回退；下一段会话只靠 git 历史接着干。

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
- `scope` 可选：`meme` / `search` / `content` / `seo` 等
- `subject` 祈使、一句说清做了什么；中英均可
- 需要时在 body 写为什么，不重复 diff

坏例子：`update`、`fix bug`、`wip`、一条里塞功能和无关重构。

### 不要做

- 默认只 commit，**不 push、不改远程、不 force push、不改已推送历史**。用户明确要求再推。
- 不要用 commit 当聊天记录，不要为“看起来勤快”拆成无意义碎提交。
- 不要提交半截、编译失败或明知会炸的代码。
