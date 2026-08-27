import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import type { EntityEntry, EntityKind, MemeEntry, SearchRecord } from "@/lib/types";

const contentRoot = path.join(process.cwd(), "content");

function readCollection<T extends { slug: string; title: string; summary: string }>(folder: string): T[] {
  const directory = path.join(contentRoot, folder);
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(directory, file), "utf8");
      const { data, content } = matter(raw);
      return { ...data, body: content.trim() } as unknown as T;
    })
    .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
}

export const getMemes = cache(() => readCollection<MemeEntry>("memes"));
export const getPlayers = cache(() => readCollection<EntityEntry>("players"));
export const getTeams = cache(() => readCollection<EntityEntry>("teams"));
export const getEvents = cache(() => readCollection<EntityEntry>("events"));

export const getMeme = cache((slug: string) => getMemes().find((entry) => entry.slug === slug));

export const getEntity = cache((kind: Exclude<EntityKind, "meme">, slug: string) => {
  const collections = { player: getPlayers, team: getTeams, event: getEvents };
  return collections[kind]().find((entry) => entry.slug === slug);
});

export function getMemesForEntity(kind: Exclude<EntityKind, "meme">, slug: string) {
  const field = { player: "players", team: "teams", event: "events" }[kind] as
    | "players"
    | "teams"
    | "events";
  return getMemes().filter((meme) => meme[field].includes(slug));
}

export function getRelatedMemes(meme: MemeEntry) {
  return meme.related
    .map((slug) => getMeme(slug))
    .filter((entry): entry is MemeEntry => Boolean(entry));
}

export function getSearchRecords(): SearchRecord[] {
  const relationKeywords = new Map(
    [...getPlayers(), ...getTeams(), ...getEvents()].map((entry) => [
      entry.slug,
      [entry.title, entry.display_name ?? "", ...(entry.aliases ?? [])],
    ]),
  );
  const memeRecords: SearchRecord[] = getMemes().map((meme) => ({
    title: meme.title,
    subtitle: meme.summary,
    href: `/meme/${meme.slug}`,
    type: "meme",
    aliases: meme.aliases ?? [],
    heat: meme.heat,
    keywords: [
      ...meme.players,
      ...meme.teams,
      ...meme.events,
      ...meme.tags,
      ...[...meme.players, ...meme.teams, ...meme.events].flatMap(
        (slug) => relationKeywords.get(slug) ?? [],
      ),
    ],
  }));

  const entityRecords = (
    [
      ["player", getPlayers()],
      ["team", getTeams()],
      ["event", getEvents()],
    ] as const
  ).flatMap(([type, entries]) =>
    entries.map((entry) => ({
      title: entry.title,
      subtitle: entry.summary,
      href: `/${type}/${entry.slug}`,
      type,
      aliases: entry.aliases ?? [],
      keywords: [entry.display_name ?? "", entry.region ?? ""],
    })),
  );

  return [...memeRecords, ...entityRecords];
}

export function getEntityTitle(kind: Exclude<EntityKind, "meme">, slug: string) {
  return getEntity(kind, slug)?.title ?? slug;
}
