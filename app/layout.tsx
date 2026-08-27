/* 赛后公报室：全站以暖象牙、深墨与赛点朱砂维持统一阅读氛围。 */
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { AnalyticsScript } from "@/components/analytics-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSearchRecords } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import "./globals.css";

/* 字体自托管（next/font 构建期下载，运行时不依赖 Google CDN）；preload 关闭：
   中文切片上百个文件，逐个 preload 反而污染 head，交给 CSS 的 unicode-range 按需加载。 */
const notoSans = Noto_Sans_SC({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
  preload: false,
});
const notoSerif = Noto_Serif_SC({
  weight: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
});

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
    <html lang="zh-CN" suppressHydrationWarning className={`${notoSans.variable} ${notoSerif.variable}`}>
      <head>
        {/* AdSense 站点验证 + 广告投放：必须是 head 里的原生 script，Google 爬虫不执行 next/script 的客户端注入。 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3460143338187515"
          crossOrigin="anonymous"
        />
      </head>
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
