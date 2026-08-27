import { entityOgParams, OG_CONTENT_TYPE, OG_SIZE, renderEntityOgImage } from "@/components/og-card";

export const alt = "研发.lol 赛事词条卡片";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return entityOgParams("event");
}

export default function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  return renderEntityOgImage("event", params);
}
