import { entityOgParams, OG_CONTENT_TYPE, OG_SIZE, renderEntityOgImage } from "@/components/og-card";

export const alt = "研發.lol 戰隊词条卡片";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return entityOgParams("team");
}

export default function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  return renderEntityOgImage("team", params, "zh-TW");
}
