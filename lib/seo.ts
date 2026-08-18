import type { Metadata } from "next";
import { getMemesForEntity } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import type { EntityEntry, EntityKind, MemeEntry } from "@/lib/types";

const DESCRIPTION_MAX = 155;
const BASE_KEYWORDS = ["LOL梗", "英雄联盟梗", "LPL梗", "电竞梗", "梗百科"];

type EntityKindWithoutMeme = Exclude<EntityKind, "meme">;

// 标题里必须带用户真实会搜的疑问词（“是什么梗”“有哪些梗”），这是点击率和长尾覆盖的主要来源。
const entityCopy = {
  player: { titleSuffix: "有哪些梗？外号和名场面出处", intent: ["的梗", "外号", "黑称"] },
  team: { titleSuffix: "有哪些梗？相关梗和名场面出处", intent: ["的梗", "黑称", "名场面"] },
  event: { titleSuffix: "有哪些梗？名场面和相关梗出处", intent: ["的梗", "名场面", "回顾"] },
} as const satisfies Record<EntityKindWithoutMeme, { titleSuffix: string; intent: readonly string[] }>;

function clamp(text: string, max = DESCRIPTION_MAX) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

const KEYWORDS_MAX = 16;

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, KEYWORDS_MAX);
}

export function buildMemeMetadata(meme: MemeEntry): Metadata {
  const title = `${meme.title}是什么梗？出处和含义`;
  const description = clamp(meme.summary);
  const url = `/meme/${meme.slug}`;
  return {
    title,
    description,
    // 别名是最主要的长尾入口（“不会真有人”和“不会吧不会吧”是两个搜索词），页面正文已有“又称”，这里再给一遍。
    keywords: unique([
      meme.title,
      ...(meme.aliases ?? []),
      `${meme.title}是什么梗`,
      `${meme.title}什么意思`,
      `${meme.title}出处`,
      ...meme.tags,
      ...BASE_KEYWORDS,
    ]),
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, modifiedTime: meme.updated_at },
  };
}

export function buildEntityMetadata(kind: EntityKindWithoutMeme, entry: EntityEntry): Metadata {
  const copy = entityCopy[kind];
  const names = unique([entry.title, entry.display_name ?? "", ...(entry.aliases ?? [])]);
  const title = `${entry.title}${copy.titleSuffix}`;
  const count = getMemesForEntity(kind, entry.slug).length;
  const description = clamp(count ? `${entry.summary}本页收录 ${count} 条相关梗及其出处。` : entry.summary);
  const url = `/${kind}/${entry.slug}`;
  return {
    title,
    description,
    // 只给主名和全名做疑问词组合；单字别名（“彬”）组合出来全是噪音。
    keywords: unique([
      ...names,
      ...names.filter((name) => name.length >= 2).flatMap((name) => copy.intent.map((intent) => `${name}${intent}`)),
      ...BASE_KEYWORDS,
    ]),
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, modifiedTime: entry.updated_at },
  };
}

export type Crumb = { name: string; path: string };

// 页面上已有可见面包屑，这里只是把同一条路径喂给搜索引擎，让结果页显示层级而不是裸 URL。
// item 必须是绝对地址；末级 Google 允许省略，但显式写出对其它抓取器更稳。
export function buildBreadcrumbJsonLd(trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteConfig.url}${crumb.path === "/" ? "" : crumb.path}`,
    })),
  };
}
