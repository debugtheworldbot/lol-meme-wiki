"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import type { MemeListItem } from "@/lib/types";

const DEFAULT_TAG = "全部";
const QUERY_MAX = 80;

type Sort = "hot" | "latest";

export function MemeExplorer({ memes, canonicalTags }: { memes: MemeListItem[]; canonicalTags: string[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
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
  const hasFilters = Boolean(query) || tag !== DEFAULT_TAG;

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

  function clearFilters() {
    setQuery("");
    setTag(DEFAULT_TAG);
    replaceSearchParams((params) => {
      params.delete("q");
      params.delete("tag");
    });
    inputRef.current?.focus();
  }

  return (
    <>
      <div className="directory-tools">
        <label>
          <Search size={18} aria-hidden="true" />
          <input ref={inputRef} type="search" aria-label="筛选词条、别名或标签" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={QUERY_MAX} placeholder="输入梗名、别名或关键词" />
        </label>
        <div className="sort-switch" role="group" aria-label="排序方式">
          <button type="button" disabled={Boolean(query)} aria-pressed={sort === "hot"} className={sort === "hot" ? "active" : ""} onClick={() => selectSort("hot")}>常见优先</button>
          <button type="button" disabled={Boolean(query)} aria-pressed={sort === "latest"} className={sort === "latest" ? "active" : ""} onClick={() => selectSort("latest")}>最近更新</button>
        </div>
      </div>
      <div className="tag-filter" role="group" aria-label="按类型筛选">
        {tags.map((item) => (
          <button key={item} type="button" aria-pressed={item === tag} className={item === tag ? "active" : ""} onClick={() => selectTag(item)}>{item}</button>
        ))}
      </div>
      <div className="directory-results-summary">
        <p role="status" aria-live="polite">
          {hasFilters ? `找到 ${visible.length} 条，共 ${memes.length} 条` : `共 ${memes.length} 条词条`}
          {tag !== DEFAULT_TAG ? <span> · {tag}</span> : null}
          {query ? <span> · “{query}”</span> : null}
        </p>
        {hasFilters ? <button type="button" onClick={clearFilters}>清除筛选</button> : null}
      </div>
      {query ? <p className="directory-sort-note">搜索结果按相关程度排列；清除关键词后恢复所选排序。</p> : null}
      {visible.length ? (
        <ul className="entry-list" aria-label="梗词条列表">
          {visible.map((meme) => (
            <li key={meme.slug}>
              <Link href={`/meme/${meme.slug}`}>{meme.title}</Link>
              {meme.tags.length ? <span className="entry-alias">{meme.tags.slice(0, 3).join(" · ")}</span> : null}
              <p>{meme.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="directory-empty">
          <strong>没有找到匹配的词条</strong>
          <p>试试更短的关键词、其他别名，或清除分类筛选。</p>
          <button type="button" className="button-secondary" onClick={clearFilters}>清除筛选，查看全部梗</button>
          <p>还没有收录？<Link href={`/submit${query.trim() ? `?name=${encodeURIComponent(query.trim())}` : ""}`}>提交一个新梗</Link></p>
        </div>
      )}
    </>
  );
}
