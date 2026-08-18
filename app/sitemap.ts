import type { MetadataRoute } from "next";
import { getEvents, getMemes, getPlayers, getTeams } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = ["", "/memes", "/players", "/teams", "/events", "/submit"].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 }));
  const memes = getMemes().map((entry) => ({ url: `${base}/meme/${entry.slug}`, lastModified: entry.updated_at, changeFrequency: "monthly" as const, priority: 0.9 }));
  const entities = ([
    ["player", getPlayers()], ["team", getTeams()], ["event", getEvents()],
  ] as const).flatMap(([kind, entries]) => entries.map((entry) => ({ url: `${base}/${kind}/${entry.slug}`, lastModified: entry.updated_at, changeFrequency: "monthly" as const, priority: 0.65 })));
  return [...staticRoutes, ...memes, ...entities];
}
