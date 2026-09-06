"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import type { Source } from "@/lib/types";

export function MemeArticle({ slug, sources, children }: {
  slug: string;
  sources: Source[];
  children: ReactNode;
}) {
  const end = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!end.current || !("IntersectionObserver" in window)) return;
    // 仅表示末尾进入视野；跳转到锚点也可能触发，不作为读完或停留时长。
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      track("Article End Visible", { meme: slug });
      observer.disconnect();
    });
    observer.observe(end.current);
    return () => observer.disconnect();
  }, [slug]);

  function trackLink(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a");
    if (!anchor || !event.currentTarget.contains(anchor)) return;
    const href = anchor.getAttribute("href");
    if (!href) return;
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin) {
      if (url.pathname === window.location.pathname && url.hash) {
        track("Article Section Click", { meme: slug, section: url.hash });
      } else if (url.pathname.startsWith("/topics/")) {
        track("Topic Guide Click", { from: slug, to: url.pathname, placement: "article" });
      } else if (url.pathname.startsWith("/meme/")) {
        track("Related Meme Click", { from: slug, to: url.pathname.slice(6), placement: "article" });
      }
      return;
    }
    const position = sources.findIndex((source) => source.url === href);
    if (position < 0) return;
    const source = sources[position];
    track("Source Click", {
      meme: slug, source: source.title, kind: source.kind ?? "unknown",
      domain: url.hostname, position: position + 1, placement: "inline",
    });
  }

  return (
    <div className="wiki-prose" onClick={trackLink}>
      {children}
      <span ref={end} className="article-end-marker" aria-hidden="true" />
    </div>
  );
}
