const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const siteConfig = {
  name: "研发.lol",
  shortName: "梗 Wiki",
  description: "英雄联盟梗百科，收录选手外号、赛场名场面、英雄台词和数字梗。按梗名、别名、选手或赛事查含义与出处，查看原始视频、帖子和比赛记录，了解流行背景与使用语境。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000"),
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "debugtheworldbot/lol-meme-wiki",
};
