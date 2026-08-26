---
name: collect-memes
description: >
  用知乎开放平台 CLI 搜英雄联盟梗，对照 content/ 已有词条找缺口，再按 AGENTS.md 写成 MDX 并提交。
  Use when 用户要搜梗、知乎搜梗、找新梗、最近的新梗、收录梗、补词条、批量写入梗、去知乎搜索，或运行 /collect-memes。
---

# 知乎搜梗收录

本仓库专用。找料入口是知乎官方 CLI，写法只以 [AGENTS.md](../../../AGENTS.md) 为准。不要复述 AGENTS 里的字段清单。

## 默认路径

1. **只搜**：跑完对照，列出「站里已有 / 建议新开 / 可并进旧条」，带原文链接。**先停，等用户说补。**
2. **搜完就写**：用户说「补上」「批量写入」「这些都可以加上」时，按建议清单写 MDX，立刻 commit。
3. **指定名单**：只处理点名的梗，不顺手扩圈。

同一会话里，搜和写是两段；写完一块就提交，不攒。

## 搜

先读并走 `zhihu` skill（`~/.grok/skills/zhihu/SKILL.md`）：status → 只用返回的 `binary_path`，不从 PATH 调 `zhihu-cli`。

```bash
<CLI> search zhihu --query "…" --count 10
```

- 一次最多 2 条搜索。`Code: 30001` 立刻停，改查询或换源，禁止重试同一 query。
- 新梗优先从 **2025/2026 赛后帖** 里扒，不要只搜「是什么梗」（那条路偏经典盘点）。
- 查询配方见 [references/queries.md](references/queries.md)。
- 摘要不是全文。B 站 / 虎扑 / 官网交叉后再定稿；知乎当线索和 `kind: post`。

对照站内：

```bash
python3 .agents/skills/collect-memes/scripts/inventory.py
```

按 title、aliases、正文关键词匹配。已有近义条（如「圣枪大师」vs「玉小刚」）标成衍生，不重复开条。

## 写

用户确认后再动 `content/`。

1. 缺的 `players` / `teams` / `events` **先建实体**，再写梗。外键只写 slug。
2. 字段、小节、来源顺序、`source_note`、tags、heat：跟 AGENTS.md「写内容」。范本 `content/memes/wo-chovy.mdx`。
3. 同一套材料的衍生（谐音逃生、队名玩法）收进主条 aliases / 正文，不另开。
4. 新条 `related` 只指向已存在的 meme slug；旧条只追加，不改无关字段。
5. 校验：

```bash
python3 .agents/skills/collect-memes/scripts/validate-memes.py
```

不过不要提交。过了就 `feat(content): …`，中文 subject，只 stage 这次文件。

## 输出

搜的回合：表格或短列表，每条一句定义 + 链接 + 建议（新开 / 并入 / 已有）。
写的回合：写了哪些 slug、并了哪些衍生、commit 一行说明。
