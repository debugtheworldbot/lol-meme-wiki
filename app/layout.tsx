/* 赛后公报室：全站以暖象牙、深墨与赛点朱砂维持统一阅读氛围。 */
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { AnalyticsScript } from "@/components/analytics-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSearchRecords } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name}｜英雄联盟梗文化档案`, template: `%s｜${siteConfig.name}` },
  description: siteConfig.description,
  keywords: ["英雄联盟梗", "LOL梗", "LPL梗", "电竞梗", "梗百科", "LOL Wiki"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: siteConfig.name,
    title: `${siteConfig.name}｜英雄联盟梗文化档案`,
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
};

export const viewport: Viewport = {
  themeColor: "#f7f1e5",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const records = getSearchRecords();
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">跳到正文</a>
        <SiteHeader records={records} />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <AnalyticsScript />
        <Analytics />
      </body>
    </html>
  );
}
