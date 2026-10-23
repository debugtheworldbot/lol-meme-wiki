import { TraditionalLocaleProvider } from "@/components/traditional-locale-provider";
import { SiteDocument, SiteChrome } from "@/components/site-document";
import { metadata as simplifiedMetadata } from "@/lib/site-metadata";
import { localizeMetadata } from "@/lib/locale-seo";
export { viewport } from "@/lib/site-metadata";

export const metadata = localizeMetadata(simplifiedMetadata, "zh-TW", "/");

export default function TraditionalLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="zh-TW"><TraditionalLocaleProvider><SiteChrome>{children}</SiteChrome></TraditionalLocaleProvider></SiteDocument>;
}
