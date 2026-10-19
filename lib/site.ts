const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const siteConfig = {
  name: "研发.lol",
  shortName: "梗 Wiki",
  description: "研发.lol 是面向玩家的英雄联盟与电竞社区梗百科，整理选手外号、赛场名场面、英雄台词、数字梗和直播语录。可以按梗名、别名与关键词搜索，也能从选手、战队、赛事和专题继续阅读。词条解释含义、比赛背景与常见用法，并列出可查看的视频、帖子或比赛记录；首次出现时间、计时差异和首创归属未确认时，会保留来源说明，回到原始语境理解。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000"),
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "debugtheworldbot/lol-meme-wiki",
};
