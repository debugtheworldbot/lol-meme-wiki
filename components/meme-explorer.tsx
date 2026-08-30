"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { ArrowUpRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import type { MemeListItem } from "@/lib/types";

const DEFAULT_TAG = "全部";
const QUERY_MAX = 80;

type Sort = "hot" | "latest";

export function MemeExplorer({ memes, canonicalTags }: { memes: MemeListItem[]; canonicalTags: string[] }) {
  const router = useRouter();
  const allTags = useMemo(() => new Set(memes.flatMap((meme) => meme.tags)), [memes]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(DEFAULT_TAG);
  const [sort, setSort] = useState<Sort>("hot");

  useEffect(() => {
    function syncFromLocation() {
      const params = new URLSearchParams(window.location.search);
      const requestedTag = params.get("tag");
      setQuery((params.get("q") ?? "").slice(0, QUERY_MAX));
      setTag(requestedTag && allTags.has(requestedTag) ? requestedTag : DEFAULT_TAG);
      setSort(params.get("sort") === "latest" ? "latest" : "hot");
    }

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [allTags]);

  /* 内容层的 localeCompare 让数字标题（02331 这类）沉在头部，这里按 heat / updated_at 重排 */
  const ordered = useMemo(() => {
    const byHeat = [...memes].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
    return sort === "latest" ? [...memes].sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? "")) : byHeat;
  }, [memes, sort]);
  const tags = useMemo(() => {
    const chips = [DEFAULT_TAG, ...new Set(canonicalTags)];
    if (tag !== DEFAULT_TAG && !chips.includes(tag)) {
      chips.splice(1, 0, tag);
    }
    return chips;
  }, [canonicalTags, tag]);
  const fuse = useMemo(() => new Fuse(memes, { keys: ["title", "aliases", "summary", "tags", "keywords"], threshold: 0.35 }), [memes]);
  const searched = query ? fuse.search(query).map((result) => result.item) : ordered;
  const visible = tag === DEFAULT_TAG ? searched : searched.filter((meme) => meme.tags.includes(tag));

  function replaceSearchParams(update: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(window.location.search);
    if (query) params.set("q", query);
    else params.delete("q");
    update(params);
    const qs = params.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function selectTag(next: string) {
    setTag(next);
    track("Directory Tag Filter", { tag: next });
    replaceSearchParams((params) => {
      if (next === DEFAULT_TAG) params.delete("tag");
      else params.set("tag", next);
    });
  }

  function selectSort(next: Sort) {
    setSort(next);
    track("Directory Sort", { sort: next });
    replaceSearchParams((params) => {
      if (next === "hot") params.delete("sort");
      else params.set("sort", next);
    });
  }

  return (
    <>
      <div className="directory-tools">
        <label>
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} maxLength={QUERY_MAX} placeholder="筛选词条、别名或标签……" />
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
