import { entityOgParams, OG_CONTENT_TYPE, OG_SIZE, renderEntityOgImage } from "@/components/og-card";

export const alt = "LOL 梗 Wiki 战队词条卡片";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return entityOgParams("team");
}

export default function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  return renderEntityOgImage("team", params);
}
