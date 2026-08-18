import { entityOgParams, OG_CONTENT_TYPE, OG_SIZE, renderEntityOgImage } from "@/components/og-card";

export const alt = "LOL 梗 Wiki 选手词条卡片";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return entityOgParams("player");
}

export default function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  return renderEntityOgImage("player", params);
}
