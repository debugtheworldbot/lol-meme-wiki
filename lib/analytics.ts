import { track as trackVercel } from "@vercel/analytics";

type AnalyticsProperties = Record<string, string | number | boolean>;

export function track(event: string, props?: AnalyticsProperties) {
  if (typeof window === "undefined") return;
  // 统计服务不可用时，不应阻断导航，也不能妨碍另一个服务接收事件。
  try { trackVercel(event, props); } catch { /* best-effort analytics */ }
  const umami = (window as Window & {
    umami?: { track: (name: string, data?: AnalyticsProperties) => void };
  }).umami;
  try { umami?.track(event, props); } catch { /* best-effort analytics */ }
}
