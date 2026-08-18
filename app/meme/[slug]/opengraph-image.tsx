import { memeOgParams, OG_CONTENT_TYPE, OG_SIZE, renderMemeOgImage } from "@/components/og-card";

export const alt = "LOL 梗 Wiki 梗词条卡片";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return memeOgParams();
}

export default function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  return renderMemeOgImage(params);
}
