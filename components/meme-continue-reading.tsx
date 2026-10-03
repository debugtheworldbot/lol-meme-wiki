"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

interface ContinueReadingItem {
  slug: string;
  title: string;
  summary: string;
}

export function MemeContinueReading({
  currentSlug,
  items,
}: {
  currentSlug: string;
  items: ContinueReadingItem[];
}) {
  if (!items.length) return null;

  return (
    <nav id="meme-related" className="meme-continue wiki-detail-section" aria-labelledby="meme-continue-title">
      <div className="meme-continue-head">
        <h2 id="meme-continue-title">相关梗</h2>
        <p>从同一人物、比赛或相近说法继续了解。</p>
      </div>
      <ul>
        {items.slice(0, 4).map((item, index) => (
          <li key={item.slug}>
            <Link
              href={`/meme/${item.slug}`}
              onClick={() => track("Related Meme Click", {
                from: currentSlug,
                to: item.slug,
                position: index + 1,
                placement: "after_article",
              })}
            >
              <span className="meme-continue-copy">
                <strong>{item.title}</strong>
                <small>{item.summary}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {items.length > 4 ? (
        <div className="meme-continue-more">
          <span>更多相关</span>
          {items.slice(4).map((item, index) => (
            <Link
              key={item.slug}
              href={`/meme/${item.slug}`}
              onClick={() => track("Related Meme Click", {
                from: currentSlug,
                to: item.slug,
                position: index + 5,
                placement: "after_article",
              })}
            >{item.title}</Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
