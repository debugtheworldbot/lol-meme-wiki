"use client";

import { FormEvent, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { track } from "@/lib/analytics";
import { loadClientSearchIndex, type ClientSearchIndex } from "@/lib/client-search-index";
import type { SearchRecord } from "@/lib/types";

export function InlineSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [index, setIndex] = useState<ClientSearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const router = useRouter();

  const ensureSearchIndex = useCallback(async () => {
    if (index) return index;
    setLoading(true);
    setLoadError(false);
    try {
      const loadedIndex = await loadClientSearchIndex();
      setIndex(loadedIndex);
      return loadedIndex;
    } catch {
      track("Search Index Load Failure", { surface: "homepage" });
      setLoadError(true);
      return null;
    } finally {
      setLoading(false);
    }
  }, [index]);

  const results = query.trim()
    ? (index?.fuse.search(query.trim(), { limit: 5 }).map((item) => item.item) ?? [])
    : [];

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const loadedIndex = index ?? await ensureSearchIndex();
    if (!loadedIndex) return;
    const firstResult = loadedIndex.fuse.search(trimmedQuery, { limit: 1 })[0]?.item;
    if (!firstResult) {
      track("Homepage Search No Results", { query: trimmedQuery });
      return;
    }
    track("Homepage Search", {
      query: trimmedQuery,
      result: firstResult.title,
      type: firstResult.type,
    });
    router.push(firstResult.href);
  }

  function visit(record: SearchRecord, position: number) {
    track("Homepage Search Result Click", {
      query: query.trim(),
      result: record.title,
      type: record.type,
      position,
    });
    router.push(record.href);
  }

  return (
    <div className="inline-search-wrap">
      <form className="inline-search" onSubmit={submit}>
        <Search size={22} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!index) void ensureSearchIndex();
          }}
          onFocus={() => {
            setFocused(true);
            void ensureSearchIndex();
          }}
          onBlur={() => window.setTimeout(() => setFocused(false), 140)}
          placeholder="搜索「YYDS」「大魔王」「世一上」……"
          aria-label="搜索 LOL 梗"
        />
        <button type="submit" aria-label="搜索"><ArrowRight size={21} /></button>
      </form>
      {focused && query ? (
        <div className="inline-results">
          {loading || (!index && !loadError) ? (
            <p role="status">正在载入搜索档案……</p>
          ) : loadError ? (
            <p role="alert">
              搜索档案暂时不可用，
              <button
                className="inline-search-retry"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => { void ensureSearchIndex(); }}
              >
                重试
              </button>
              。
            </p>
          ) : results.length ? results.map((record, index) => (
            <button key={record.href} onMouseDown={() => visit(record, index + 1)}>
              <strong>{record.title}</strong>
              <span>{record.subtitle}</span>
              <small>{record.type === "meme" ? "梗" : record.type === "player" ? "选手" : record.type === "team" ? "战队" : "赛事"}</small>
            </button>
          )) : (
            <p>
              没有找到，
              <Link
                href={`/submit?name=${encodeURIComponent(query.trim())}`}
                onMouseDown={() => track("Search No Result Action", {
                  query: query.trim(),
                  surface: "homepage",
                })}
              >
                去提交“{query.trim()}”
              </Link>
              ？
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
