import type { MetadataRoute } from "next";
import { getEvents, getMemes, getPlayers, getTeams, getTopicGuide } from "@/lib/content";
import { getContentLastModified } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getMemesForTopic, topicDefinitions } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const allMemes = getMemes();
  const staticRoutes = ["", "/memes", "/topics", "/players", "/teams", "/events", "/about", "/contact", "/privacy"].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 }));
  const topics = topicDefinitions.map((topic) => ({
    url: `${base}/topics/${topic.slug}`,
    lastModified: getContentLastModified([
      { updated_at: getTopicGuide(topic.slug)?.updated_at },
      ...getMemesForTopic(allMemes, topic),
    ]),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const memes = allMemes.map((entry) => ({ url: `${base}/meme/${entry.slug}`, lastModified: getContentLastModified([entry]), changeFrequency: "monthly" as const, priority: 0.9 }));
  const entities = ([
    ["player", getPlayers()], ["team", getTeams()], ["event", getEvents()],
  ] as const).flatMap(([kind, entries]) => entries.filter((entry) => entry.indexable === true).map((entry) => ({ url: `${base}/${kind}/${entry.slug}`, lastModified: entry.updated_at, changeFrequency: "monthly" as const, priority: 0.65 })));
  return [...staticRoutes, ...topics, ...memes, ...entities];
}
