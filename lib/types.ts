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

export interface EntityEntry extends BaseEntry {
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
