"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MemeEntry } from "@/lib/types";

export function MemeExplorer({ memes }: { memes: MemeEntry[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const allTags = useMemo(() => Array.from(new Set(memes.flatMap((meme) => meme.tags))), [memes]);
  const requested = searchParams.get("tag") ?? "全部";
  const tag = allTags.includes(requested) ? requested : "全部";
  const tags = useMemo(() => {
    const chips = ["全部", ...allTags.slice(0, 12)];
    if (tag !== "全部" && !chips.includes(tag)) {
      chips.splice(1, 0, tag);
    }
    return chips;
  }, [allTags, tag]);
  const [query, setQuery] = useState(() => (searchParams.get("q") ?? "").slice(0, 80));
  const fuse = useMemo(() => new Fuse(memes, { keys: ["title", "aliases", "summary", "tags"], threshold: 0.35 }), [memes]);
  const searched = query ? fuse.search(query).map((result) => result.item) : memes;
  const visible = tag === "全部" ? searched : searched.filter((meme) => meme.tags.includes(tag));

  function selectTag(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "全部") params.delete("tag");
    else params.set("tag", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

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
          <button key={item} className={item === tag ? "active" : ""} onClick={() => selectTag(item)}>{item}</button>
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
