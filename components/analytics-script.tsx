import Script from "next/script";
import { siteConfig } from "@/lib/site";

const UMAMI_WEBSITE_ID = "d31f06dd-a3d3-4fb2-9876-4772f082be1e";

export function AnalyticsScript() {
  const hostname = new URL(siteConfig.url).hostname;
  if (process.env.NODE_ENV !== "production" || ["localhost", "127.0.0.1", "[::1]"].includes(hostname)) return null;
  return (
    <Script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_WEBSITE_ID}
      data-domains={hostname}
      data-exclude-hash="true"
      strategy="afterInteractive"
    />
  );
}
