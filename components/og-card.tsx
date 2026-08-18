import { ImageResponse } from "next/og";
import { getEntity, getEvents, getMeme, getMemes, getMemesForEntity, getPlayers, getTeams } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import type { EntityKind } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type EntityKindWithoutMeme = Exclude<EntityKind, "meme">;

const palette = { ink: "#07110f", paper: "#eee9d9", muted: "#9da9a1", acid: "#d8ff43" };

const entityOg = {
  player: { kicker: "PLAYER ARCHIVE", list: getPlayers },
  team: { kicker: "TEAM ARCHIVE", list: getTeams },
  event: { kicker: "EVENT ARCHIVE", list: getEvents },
} as const satisfies Record<EntityKindWithoutMeme, { kicker: string; list: () => { slug: string }[] }>;

function siteHost() {
  try {
    return new URL(siteConfig.url).host.toUpperCase();
  } catch {
    return siteConfig.name;
  }
}

// 卡片里放不下整段摘要，取第一句“是什么”。宁可少几个字也要断在标点或空格上，
// 硬切出来的“使用盲僧打…”读不通。
function leadSentence(summary: string, max = 58) {
  const first = (summary.split(/[。；！？]/)[0] ?? summary).trim();
  if (first.length <= max) return first;
  const head = first.slice(0, max);
  const boundary = Math.max(head.lastIndexOf("，"), head.lastIndexOf("、"), head.lastIndexOf(" "));
  return `${(boundary > max * 0.6 ? head.slice(0, boundary) : head).trimEnd()}…`;
}

function titleFontSize(title: string) {
  if (title.length <= 6) return 116;
  if (title.length <= 10) return 92;
  if (title.length <= 16) return 68;
  return 52;
}

function OgCard({
  kicker,
  title,
  subtitle,
  footLeft,
  footRight,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  footLeft?: string;
  footRight?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: palette.ink,
        color: palette.paper,
        padding: "64px",
        border: `18px solid ${palette.acid}`,
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 24, color: palette.acid }}>
        <span>{kicker}</span>
        <span>{siteHost()}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: titleFontSize(title), lineHeight: 1.12, fontWeight: 800 }}>{title}</div>
        {subtitle ? (
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, lineHeight: 1.4, color: palette.muted }}>{subtitle}</div>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 24, color: palette.paper }}>
        <span>{footLeft ?? ""}</span>
        <span style={{ color: palette.muted }}>{footRight ?? ""}</span>
      </div>
    </div>
  );
}

export function renderSiteOgImage() {
  return new ImageResponse(
    (
      <OgCard
        kicker="COMMUNITY ARCHIVE"
        title={siteConfig.name}
        subtitle="记录那些莫名其妙，但大家都懂的东西。"
        footLeft="#4396 #红温 #1557 #忍界大战"
        footRight={`收录 ${getMemes().length} 条梗`}
      />
    ),
    OG_SIZE,
  );
}

export function memeOgParams() {
  return getMemes().map((meme) => ({ slug: meme.slug }));
}

export async function renderMemeOgImage(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const meme = getMeme(slug);
  if (!meme) return renderSiteOgImage();
  return new ImageResponse(
    (
      <OgCard
        kicker="MEME ARCHIVE"
        title={meme.title}
        subtitle={leadSentence(meme.summary)}
        footLeft={meme.tags.slice(0, 3).map((tag) => `#${tag}`).join(" ")}
        footRight={meme.first_seen ? `首次出现 ${meme.first_seen}` : "出处待考"}
      />
    ),
    OG_SIZE,
  );
}

export function entityOgParams(kind: EntityKindWithoutMeme) {
  return entityOg[kind].list().map((entry) => ({ slug: entry.slug }));
}

export async function renderEntityOgImage(kind: EntityKindWithoutMeme, params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const entry = getEntity(kind, slug);
  if (!entry) return renderSiteOgImage();
  const count = getMemesForEntity(kind, slug).length;
  return new ImageResponse(
    (
      <OgCard
        kicker={entityOg[kind].kicker}
        title={entry.title}
        subtitle={entry.display_name ?? leadSentence(entry.summary)}
        footLeft={`收录 ${count} 条相关梗`}
        footRight={entry.active_years ?? entry.region ?? ""}
      />
    ),
    OG_SIZE,
  );
}
