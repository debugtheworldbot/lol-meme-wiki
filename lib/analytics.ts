export function track(event: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const plausible = (window as Window & {
    plausible?: (name: string, options?: { props?: Record<string, string | number> }) => void;
  }).plausible;
  plausible?.(event, props ? { props } : undefined);
}
