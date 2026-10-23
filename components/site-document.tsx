import { Analytics } from "@vercel/analytics/next";
import { AnalyticsScript } from "@/components/analytics-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LocalizedContent } from "@/components/localized-content";
import type { Locale } from "@/lib/locale-path";
import "@/app/globals.css";

export function SiteDocument({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return (
    <html lang={locale === "zh-TW" ? "zh-Hant" : "zh-CN"} data-scroll-behavior="smooth">
      <body>
        {children}
      </body>
    </html>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return <LocalizedContent>
        <a className="skip-link" href="#main-content">跳到正文</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <AnalyticsScript />
        <Analytics />
  </LocalizedContent>;
}
