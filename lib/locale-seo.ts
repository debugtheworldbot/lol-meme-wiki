import "server-only";

import type { Metadata } from "next";
import { Converter } from "opencc-js/cn2t";
import { localeAlternates, withLocalePath, type Locale } from "@/lib/locale-path";
import { siteConfig } from "@/lib/site";

const traditional = Converter({ from: "cn", to: "tw" });
export function translateSeo(text: string, locale: Locale) {
  return locale === "zh-TW" ? traditional(text) : text;
}

export function localizeMetadata(metadata: Metadata, locale: Locale, path?: string): Metadata {
  const translate = (text: string) => translateSeo(text, locale);
  const translateTitle = (title: Metadata["title"]): Metadata["title"] => {
    if (typeof title === "string") return translate(title);
    if (!title) return title;
    return Object.fromEntries(Object.entries(title).map(([key, value]) => [key, typeof value === "string" ? translate(value) : value])) as typeof title;
  };
  const originalPath = path ?? (typeof metadata.alternates?.canonical === "string" ? metadata.alternates.canonical : "/");
  const canonical = withLocalePath(originalPath, locale);
  const image = /^\/(?:zh-tw\/)?(?:meme|player|team|event)\/[^/]+$/.test(canonical)
    ? `${canonical}/opengraph-image`
    : locale === "zh-TW" ? "/zh-tw/opengraph-image" : "/opengraph-image";
  const noindex = typeof metadata.robots === "object" && metadata.robots?.index === false;
  const title = translateTitle(metadata.title);
  const description = metadata.description ? translate(metadata.description) : metadata.description;
  return {
    ...metadata,
    metadataBase: metadata.metadataBase ?? new URL(siteConfig.url),
    title,
    description,
    keywords: Array.isArray(metadata.keywords) ? metadata.keywords.map(translate) : metadata.keywords ? translate(metadata.keywords) : metadata.keywords,
    alternates: { canonical, ...(!noindex ? { languages: localeAlternates(originalPath) } : {}) },
    // 每页明确分享标题，避免目录页继承首页文案；图片仍由各路由的 metadata 文件生成。
    openGraph: {
      ...metadata.openGraph,
      title: translateTitle(metadata.openGraph?.title ?? metadata.title) ?? undefined,
      description: metadata.openGraph?.description ? translate(metadata.openGraph.description) : description ?? undefined,
      url: canonical,
      locale: locale === "zh-TW" ? "zh_TW" : "zh_CN",
      alternateLocale: locale === "zh-TW" ? ["zh_CN"] : ["zh_TW"],
      images: [{ url: image, width: 1200, height: 630, alt: typeof title === "string" ? title : undefined }],
    },
    twitter: { ...metadata.twitter, card: "summary_large_image", title: title ?? undefined, description: description ?? undefined, images: [image] },
  };
}
