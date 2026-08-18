"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { MemeEntry } from "@/lib/types";

export function MemeExplorer({ memes }: { memes: MemeEntry[] }) {
  const searchParams = useSearchParams();
  const allTags = useMemo(() => Array.from(new Set(memes.flatMap((meme) => meme.tags))), [memes]);
  const requested = searchParams.get("tag") ?? "全部";
  const tags = useMemo(() => {
    const chips = ["全部", ...allTags.slice(0, 12)];
    if (requested !== "全部" && allTags.includes(requested) && !chips.includes(requested)) {
      chips.splice(1, 0, requested);
    }
    return chips;
  }, [allTags, requested]);
  const [query, setQuery] = useState(() => (searchParams.get("q") ?? "").slice(0, 80));
  const [tag, setTag] = useState(() => (allTags.includes(requested) ? requested : "全部"));
  const fuse = useMemo(() => new Fuse(memes, { keys: ["title", "aliases", "summary", "tags"], threshold: 0.35 }), [memes]);
  const searched = query ? fuse.search(query).map((result) => result.item) : memes;
  const visible = tag === "全部" ? searched : searched.filter((meme) => meme.tags.includes(tag));

  return (
    <>
      <div className="directory-tools">
        <label>
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="筛选词条、别名或标签……" />
        </label>
        <span className="result-total">{visible.length} 条</span>
      </div>
      <div className="tag-filter" aria-label="按类型筛选">
        {tags.map((item) => (
          <button key={item} className={item === tag ? "active" : ""} onClick={() => setTag(item)}>{item}</button>
        ))}
      </div>
      {visible.length ? (
        <ul className="home-list">
          {visible.map((meme) => (
            <li key={meme.slug}>
              <Link href={`/meme/${meme.slug}`}>{meme.title}</Link>
              <span>{meme.summary}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="directory-empty">
          <strong>没有匹配词条。</strong>
          <span>换个关键词，或者 <Link href="/submit">提交一个新梗</Link>。</span>
        </div>
      )}
    </>
  );
}
