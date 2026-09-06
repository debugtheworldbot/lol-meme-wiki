export type EntityKind = "meme" | "player" | "team" | "event";

export interface Source {
  title: string;
  url?: string;
  kind?: "video" | "match" | "post" | "article";
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface BaseEntry {
  title: string;
  slug: string;
  summary: string;
  aliases?: string[];
  updated_at?: string;
  body: string;
}

export interface MemeEntry extends BaseEntry {
  first_seen?: string;
  players: string[];
  teams: string[];
  events: string[];
  related: string[];
  tags: string[];
  sources: Source[];
  timeline?: TimelineItem[];
  source_note?: string;
  featured?: boolean;
  heat?: number;
}

export interface MemeListItem {
  title: string;
  slug: string;
  summary: string;
  aliases: string[];
  tags: string[];
  heat?: number;
  first_seen?: string;
  updated_at?: string;
  keywords: string[];
}

export type HomeMemeListItem = Pick<
  MemeListItem,
  "title" | "slug" | "summary" | "first_seen" | "updated_at"
>;

export interface EntityEntry extends BaseEntry {
  // 当前实体页以导航为主；补充独立内容并人工复核后才显式开放索引。
  indexable?: boolean;
  display_name?: string;
  region?: string;
  active_years?: string;
}

export interface SearchRecord {
  title: string;
  subtitle: string;
  href: string;
  type: EntityKind;
  aliases: string[];
  keywords: string[];
  heat?: number;
}
