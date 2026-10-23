"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/components/locale-provider";
import { withLocalePath } from "@/lib/locale-path";
import { LocalizedContent } from "@/components/localized-content";

export default function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const { locale, translate } = useLocale();
  const localizedHref = typeof href === "string"
    ? withLocalePath(href, locale)
    : href.pathname && !href.host && !href.hostname && !href.protocol
      ? { ...href, pathname: withLocalePath(href.pathname, locale) } : href;
  const displayProps = { ...props };
  for (const key of ["title", "aria-label", "aria-description", "aria-valuetext"] as const) {
    const value = props[key];
    if (typeof value === "string") displayProps[key] = translate(value);
  }
  return <Link {...displayProps} href={localizedHref}><LocalizedContent>{props.children}</LocalizedContent></Link>;
}
