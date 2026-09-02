"use client";

import type { Source } from "@/lib/types";
import { track } from "@/lib/analytics";

function getSourceDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

export function TrackedSourceLink({
  memeSlug,
  position,
  source,
}: {
  memeSlug: string;
  position: number;
  source: Source & { url: string };
}) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      onClick={() => track("Source Click", {
        meme: memeSlug,
        source: source.title,
        kind: source.kind ?? "unknown",
        domain: getSourceDomain(source.url),
        position,
      })}
    >
      {source.title}
    </a>
  );
}
