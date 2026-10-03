import { ImageResponse } from "next/og";
import { getEntity, getEvents, getMeme, getMemes, getMemesForEntity, getPlayers, getTeams } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import type { EntityKind } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type EntityKindWithoutMeme = Exclude<EntityKind, "meme">;

const palette = { ink: "#202122", paper: "#fcfaf6", muted: "#54595d", accent: "#a43829", border: "#d8d4cc" };

const entityOg = {
  player: { kicker: "选手与他们的梗", list: getPlayers },
  team: { kicker: "战队与名场面", list: getTeams },
  event: { kicker: "赛事与名场面", list: getEvents },
} as const satisfies Record<EntityKindWithoutMeme, { kicker: string; list: () => { slug: string }[] }>;

function siteHost() {
  try {
    return new URL(siteConfig.url).host;
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
        background: palette.paper,
        color: palette.ink,
        padding: "64px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 24, borderBottom: `1px solid ${palette.border}`, fontSize: 24, color: palette.accent }}>
        <span>{kicker}</span>
        <span>{siteHost()}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: titleFontSize(title), lineHeight: 1.12, fontWeight: 800 }}>{title}</div>
        {subtitle ? (
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, lineHeight: 1.4, color: palette.muted }}>{subtitle}</div>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 32, paddingTop: 24, borderTop: `1px solid ${palette.border}`, fontSize: 22, lineHeight: 1.4, color: palette.muted }}>
        <span style={{ maxWidth: "55%" }}>{footLeft ?? ""}</span>
        <span style={{ maxWidth: "42%", textAlign: "right" }}>{footRight ?? ""}</span>
      </div>
    </div>
  );
}

export function renderSiteOgImage() {
  return new ImageResponse(
    (
      <OgCard
        kicker="英雄联盟梗百科"
        title={siteConfig.name}
        subtitle="英雄联盟的梗，查个明白。查含义，也找出处。"
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
        kicker="英雄联盟梗百科"
        title={meme.title}
        subtitle={leadSentence(meme.summary)}
        footLeft={meme.tags.slice(0, 3).map((tag) => `#${tag}`).join(" ")}
        footRight={meme.first_seen ? `时间线索：${meme.first_seen}` : "时间线索尚待考证"}
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
