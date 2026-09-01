import { track as trackVercel } from "@vercel/analytics";

type AnalyticsProperties = Record<string, string | number | boolean>;

export function track(event: string, props?: AnalyticsProperties) {
  if (typeof window === "undefined") return;
  trackVercel(event, props);
  const umami = (window as Window & {
    umami?: { track: (name: string, data?: AnalyticsProperties) => void };
  }).umami;
  umami?.track(event, props);
}
