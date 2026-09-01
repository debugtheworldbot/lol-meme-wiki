import Script from "next/script";

const UMAMI_WEBSITE_ID = "d31f06dd-a3d3-4fb2-9876-4772f082be1e";

export function AnalyticsScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <>
      {domain ? (
        <Script defer data-domain={domain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      ) : null}
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id={UMAMI_WEBSITE_ID}
        strategy="afterInteractive"
      />
    </>
  );
}
