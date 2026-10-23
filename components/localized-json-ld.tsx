"use client";

import { useLocale } from "@/components/locale-provider";
import { withLocalePath } from "@/lib/locale-path";

const TEXT_KEYS = new Set(["name", "description", "headline", "alternateName", "jobTitle", "sport"]);
const URL_KEYS = new Set(["url", "@id", "item", "target", "urlTemplate"]);
const LANGUAGE_TYPES = new Set(["WebSite", "WebPage", "CollectionPage", "Article"]);

export function LocalizedJsonLd({ data, siteUrl }: { data: object; siteUrl: string }) {
  const { locale, translate } = useLocale();
  const origin = new URL(siteUrl).origin;
  function visit(value: unknown, key = ""): unknown {
    if (typeof value === "string") {
      if (TEXT_KEYS.has(key)) return translate(value);
      if (URL_KEYS.has(key)) {
        try {
          const url = new URL(value, origin);
          if (url.origin === origin) return origin + withLocalePath(url.pathname + url.search + url.hash, locale);
        } catch { /* 非 URL 的 Schema 标识符保持原样。 */ }
      }
      return value;
    }
    if (Array.isArray(value)) return value.map((item) => visit(item, key));
    if (value && typeof value === "object") {
      const object = Object.fromEntries(Object.entries(value).map(([name, item]) => [name, visit(item, name)]));
      if (LANGUAGE_TYPES.has(object["@type"] as string)) object.inLanguage = locale === "zh-TW" ? "zh-Hant" : "zh-Hans";
      return object;
    }
    return value;
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(visit(data)).replace(/</g, "\\u003c") }} />;
}
