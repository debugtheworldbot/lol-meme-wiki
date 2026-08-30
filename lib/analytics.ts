import { track as trackVercel } from "@vercel/analytics";

type AnalyticsProperties = Record<string, string | number | boolean>;

export function track(event: string, props?: AnalyticsProperties) {
  if (typeof window === "undefined") return;
  trackVercel(event, props);
  const plausible = (window as Window & {
    plausible?: (name: string, options?: { props?: AnalyticsProperties }) => void;
  }).plausible;
  plausible?.(event, props ? { props } : undefined);
}
