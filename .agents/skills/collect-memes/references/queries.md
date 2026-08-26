# 查询配方

`<CLI>` 是 zhihu skill status 返回的绝对路径。`--count` 最大 10。

## 近期新梗

优先这些，不要一上来搜「英雄联盟 梗」（会回到厂长圣经）：

```text
<CLI> search zhihu --query "LPL 2026 梗" --count 10
<CLI> search zhihu --query "LPL2026 赛季" --count 10
<CLI> search zhihu --query "玉小刚 圣枪" --count 10
```

赛后帖标题常是「如何评价这场比赛」，梗埋在回答里。看到外号、黑称、复读句，再对那个专名搜一次。

## 经典盘点

```text
<CLI> search zhihu --query "你知道的LPL梗都有哪些" --count 10
<CLI> search zhihu --query "历届全球总决赛都诞生了哪些名梗" --count 10
<CLI> search zhihu --query "厂长 4396" --count 5
```

## 专名深挖

已经有候选名时用短 query，避免被同名游戏/小说带跑：

```text
<CLI> search zhihu --query "小天又mvp 你气不气" --count 5
<CLI> search zhihu --query "四通八达 2200 小虎" --count 5
```

## 交叉

知乎只给线索。一手顺序仍是 AGENTS.md：B 站 BV → 贴吧 / 虎扑 / NGA → 知乎 → 官网。

B 站搜索关键词用梗的短名 + 选手 ID。`sources` 里至少一条可点开的 BV 或比赛页；知乎链接 `kind: post`。
