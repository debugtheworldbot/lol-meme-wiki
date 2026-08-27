"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { ArrowUpRight, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MemeEntry } from "@/lib/types";

export function MemeExplorer({ memes }: { memes: MemeEntry[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const allTags = useMemo(() => Array.from(new Set(memes.flatMap((meme) => meme.tags))), [memes]);
  const requestedTag = searchParams.get("tag") ?? "全部";
  const tag = allTags.includes(requestedTag) ? requestedTag : "全部";
  const sort = searchParams.get("sort") === "latest" ? "latest" : "hot";
  /* 内容层的 localeCompare 让数字标题（02331 这类）沉在头部，这里按 heat / updated_at 重排 */
  const ordered = useMemo(() => {
    const byHeat = [...memes].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
    return sort === "latest" ? [...memes].sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? "")) : byHeat;
  }, [memes, sort]);
  const tags = useMemo(() => {
    const chips = ["全部", ...allTags.slice(0, 12)];
    if (tag !== "全部" && !chips.includes(tag)) {
      chips.splice(1, 0, tag);
    }
    return chips;
  }, [allTags, tag]);
  const [query, setQuery] = useState(() => (searchParams.get("q") ?? "").slice(0, 80));
  const fuse = useMemo(() => new Fuse(memes, { keys: ["title", "aliases", "summary", "tags"], threshold: 0.35 }), [memes]);
  const searched = query ? fuse.search(query).map((result) => result.item) : ordered;
  const visible = tag === "全部" ? searched : searched.filter((meme) => meme.tags.includes(tag));

  function selectTag(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "全部") params.delete("tag");
    else params.set("tag", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function selectSort(next: "hot" | "latest") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "hot") params.delete("sort");
    else params.set("sort", next);
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
        <div className="sort-switch" role="group" aria-label="排序方式">
          <button type="button" aria-pressed={sort === "hot"} className={sort === "hot" ? "active" : ""} onClick={() => selectSort("hot")}>最热</button>
          <button type="button" aria-pressed={sort === "latest"} className={sort === "latest" ? "active" : ""} onClick={() => selectSort("latest")}>最新</button>
        </div>
        <span className="result-total">{visible.length} 条</span>
      </div>
      <div className="tag-filter" aria-label="按类型筛选">
        {tags.map((item) => (
          <button key={item} className={item === tag ? "active" : ""} onClick={() => selectTag(item)}>{item}</button>
        ))}
      </div>
      {visible.length ? (
        <ul className="entry-list">
          {visible.map((meme) => (
            <li key={meme.slug}>
              <Link href={`/meme/${meme.slug}`}>{meme.title}<ArrowUpRight size={14} /></Link>
              {meme.tags.length ? <span className="entry-alias">{meme.tags.slice(0, 3).join(" · ")}</span> : null}
              <p>{meme.summary}</p>
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
