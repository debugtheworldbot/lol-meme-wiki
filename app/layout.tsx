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
  twitter: { card: "summary_large_image", title: siteConfig.name, description: siteConfig.description },
  category: "reference",
};

export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light" };

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
      </body>
    </html>
  );
}
