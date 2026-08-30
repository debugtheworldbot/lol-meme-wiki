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
    <nav className="meme-continue" aria-labelledby="meme-continue-title">
      <div className="meme-continue-head">
        <h2 id="meme-continue-title">继续看</h2>
        <p>顺着人物、战队与同类说法继续查档。</p>
      </div>
      <ol>
        {items.map((item, index) => (
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
              <span className="meme-continue-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="meme-continue-copy">
                <strong>{item.title}</strong>
                <small>{item.summary}</small>
              </span>
              <span className="meme-continue-arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
