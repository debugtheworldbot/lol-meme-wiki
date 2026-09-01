import Script from "next/script";

const UMAMI_WEBSITE_ID = "d31f06dd-a3d3-4fb2-9876-4772f082be1e";

export function AnalyticsScript() {
  return (
    <Script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}
