import type { MetadataRoute } from "next";
import { getEvents, getMemes, getPlayers, getTeams } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { topicDefinitions } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = ["", "/memes", "/topics", "/players", "/teams", "/events", "/submit", "/about", "/contact", "/privacy"].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 }));
  const topics = topicDefinitions.map((topic) => ({ url: `${base}/topics/${topic.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  const memes = getMemes().map((entry) => ({ url: `${base}/meme/${entry.slug}`, lastModified: entry.updated_at, changeFrequency: "monthly" as const, priority: 0.9 }));
  const entities = ([
    ["player", getPlayers()], ["team", getTeams()], ["event", getEvents()],
  ] as const).flatMap(([kind, entries]) => entries.map((entry) => ({ url: `${base}/${kind}/${entry.slug}`, lastModified: entry.updated_at, changeFrequency: "monthly" as const, priority: 0.65 })));
  return [...staticRoutes, ...topics, ...memes, ...entities];
}
