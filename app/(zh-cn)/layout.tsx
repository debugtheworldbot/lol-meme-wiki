import { LocaleProvider } from "@/components/locale-provider";
import { SiteDocument, SiteChrome } from "@/components/site-document";
export { metadata, viewport } from "@/lib/site-metadata";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="zh-CN"><LocaleProvider><SiteChrome>{children}</SiteChrome></LocaleProvider></SiteDocument>;
}
