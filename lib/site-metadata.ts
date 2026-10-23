import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site";
import { localizeMetadata } from "@/lib/locale-seo";

export const metadata: Metadata = localizeMetadata({
  other: { "google-adsense-account": "ca-pub-3460143338187515" },
  metadataBase: new URL(siteConfig.url),
  title: { default: `英雄联盟梗百科：选手外号与名场面｜${siteConfig.name}`, template: `%s｜${siteConfig.name}` },
  description: siteConfig.description,
  keywords: ["英雄联盟梗", "LOL梗", "LPL梗", "电竞梗", "梗百科", "LOL Wiki"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: siteConfig.name,
    title: `英雄联盟梗百科：选手外号与名场面｜${siteConfig.name}`,
    description: siteConfig.description,
    url: "/",
  },
  // 只声明卡片类型：title/description 留空，好让每个页面的 metadata 自己填，否则全站分享卡片都是站点名。
  twitter: { card: "summary_large_image" },
  category: "reference",
  icons: {
    icon: "/lol-meme-wiki-mark.png",
    apple: "/lol-meme-wiki-mark.png",
  },
}, "zh-CN", "/");

export const viewport: Viewport = {
  themeColor: "#fcfaf6",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};
