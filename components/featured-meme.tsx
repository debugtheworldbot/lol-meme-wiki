"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { MemeEntry, Source } from "@/lib/types";

type FeaturedItem = Pick<MemeEntry, "title" | "slug" | "summary"> & { source?: Source };

const STORAGE_KEY = "home-featured-meme";
let lastFeaturedSlug: string | null = null;

function readPreviousSlug() {
  if (lastFeaturedSlug !== null) return lastFeaturedSlug;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return lastFeaturedSlug;
  }
}

export function FeaturedMeme({ items }: { items: FeaturedItem[] }) {
  const [featured, setFeatured] = useState(items[0]);

  useEffect(() => {
    if (!items.length) return;
    let frame = 0;

    function schedulePick() {
      cancelAnimationFrame(frame);
      // 页面重新激活时也抽选；取消尚未执行的帧，避免 StrictMode 预演多抽一次。
      frame = requestAnimationFrame(() => {
        const previous = readPreviousSlug();
        const alternatives = items.filter((item) => item.slug !== previous);
        const pool = alternatives.length ? alternatives : items;
        const next = pool[Math.floor(Math.random() * pool.length)];
        lastFeaturedSlug = next.slug;
        try {
          sessionStorage.setItem(STORAGE_KEY, next.slug);
        } catch {
          // 存储不可用时，仍可在本次站内浏览中避免连续重复。
        }
        setFeatured(next);
      });
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) schedulePick();
    }

    schedulePick();
    window.addEventListener("pageshow", onPageShow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [items]);

  if (!featured) return null;

  return (
    <section className="homepage-pick" aria-labelledby="home-pick-title">
      <h2 id="home-pick-title">精选词条</h2>
      <h3><Link href={`/meme/${featured.slug}`}>{featured.title}</Link></h3>
      <p>{featured.summary}</p>
      <Link className="homepage-read-link" href={`/meme/${featured.slug}`}>读完整释义</Link>
      {featured.source?.url ? (
        <div className="homepage-source">
          <span>来源线索</span>
          <a href={featured.source.url} target="_blank" rel="noreferrer">
            {featured.source.title}<ExternalLink size={13} aria-label="在新窗口打开" />
          </a>
        </div>
      ) : null}
    </section>
  );
}
