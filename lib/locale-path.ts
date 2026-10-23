export type Locale = "zh-CN" | "zh-TW";

const TRADITIONAL_PREFIX = "/zh-tw";
const PAGES = new Set(["/", "/memes", "/topics", "/players", "/teams", "/events", "/about", "/contact", "/privacy", "/submit"]);

export function getPathLocale(path: string): Locale {
  return /^\/zh-tw(?:\/|[?#]|$)/.test(path) ? "zh-TW" : "zh-CN";
}

export function stripLocalePath(path: string): string {
  return path.replace(/^\/zh-tw(?=\/|[?#]|$)/, "") || "/";
}

export function withLocalePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [, pathname, suffix] = /^([^?#]*)(.*)$/.exec(href)!;
  const path = stripLocalePath(pathname).replace(/\/$/, "") || "/";
  // 只改站内页面，不把 API、图片、静态文件和外部来源带入语言目录。
  if (!PAGES.has(path) && !/^\/(?:meme|player|team|event|topics)\/[^/]+$/.test(path)) return href;
  return `${locale === "zh-TW" ? TRADITIONAL_PREFIX + (path === "/" ? "" : path) : path}${suffix}`;
}

export function localeAlternates(path: string) {
  return {
    "zh-Hans": withLocalePath(path, "zh-CN"),
    "zh-Hant": withLocalePath(path, "zh-TW"),
    "x-default": withLocalePath(path, "zh-CN"),
  };
}
