const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const siteConfig = {
  name: "研发.lol",
  shortName: "梗 Wiki",
  description: "记录英雄联盟以及电竞社区里那些莫名其妙但大家都懂的东西。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000"),
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "debugtheworldbot/lol-meme-wiki",
};
