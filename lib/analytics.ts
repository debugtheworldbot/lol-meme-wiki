import { track as trackVercel } from "@vercel/analytics";

type AnalyticsProperties = Record<string, string | number | boolean>;

export function track(event: string, props?: AnalyticsProperties) {
  if (typeof window === "undefined") return;
  trackVercel(event, props);
  const analytics = window as Window & {
    plausible?: (name: string, options?: { props?: AnalyticsProperties }) => void;
    umami?: { track: (name: string, data?: AnalyticsProperties) => void };
  };
  analytics.plausible?.(event, props ? { props } : undefined);
  analytics.umami?.track(event, props);
}
