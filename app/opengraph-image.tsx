import { OG_CONTENT_TYPE, OG_SIZE, renderSiteOgImage } from "@/components/og-card";

export const alt = "LOL 梗 Wiki — 英雄联盟社区文化档案";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderSiteOgImage();
}
