import { OG_CONTENT_TYPE, OG_SIZE, renderSiteOgImage } from "@/components/og-card";

export const alt = "研發.lol — 英雄聯盟社群文化檔案";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderSiteOgImage("zh-TW");
}
