"use client";

import { type FormEvent, type KeyboardEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { track } from "@/lib/analytics";
import { loadClientSearchIndex, type ClientSearchIndex } from "@/lib/client-search-index";
import type { SearchRecord } from "@/lib/types";
import styles from "./inline-search.module.css";

const PREVIEW_LIMIT = 5;
const PAGE_SIZE = 12;
const typeLabels: Record<SearchRecord["type"], string> = {
  meme: "梗",
  player: "选手",
  team: "战队",
  event: "赛事",
};

export function InlineSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [index, setIndex] = useState<ClientSearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const expansionFocusRef = useRef<number | null>(null);
  const pendingIndexRef = useRef<Promise<ClientSearchIndex | null> | null>(null);
  const composingRef = useRef(false);
  const id = useId();
  const listId = `${id}-results`;
  const hintId = `${id}-hint`;
  const router = useRouter();
  const trimmedQuery = query.trim();

  const ensureSearchIndex = useCallback(() => {
    if (index) return Promise.resolve(index);
    if (pendingIndexRef.current) return pendingIndexRef.current;
    setLoading(true);
    setLoadError(false);
    const pending = loadClientSearchIndex().then((loadedIndex) => {
      setIndex(loadedIndex);
      return loadedIndex;
    }).catch(() => {
      track("Search Index Load Failure", { surface: "homepage" });
      setLoadError(true);
      return null;
    }).finally(() => {
      setLoading(false);
      pendingIndexRef.current = null;
    });
    pendingIndexRef.current = pending;
    return pending;
  }, [index]);

  const results = useMemo(() => trimmedQuery
    ? (index?.fuse.search(trimmedQuery).map((item) => item.item) ?? [])
    : [], [index, trimmedQuery]);
  const visibleResults = results.slice(0, expanded ? visibleCount : PREVIEW_LIMIT);
  const showPanel = open && Boolean(trimmedQuery);
  const activeResult = showPanel ? visibleResults[activeIndex] : undefined;

  useEffect(() => {
    function close() {
      setOpen(false);
      setActiveIndex(-1);
    }
    function closeOutside(event: Event) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        close();
      }
    }
    // Safari can blur the input before clicking an internal link without moving
    // focus to that link. Close only after focus actually arrives outside.
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    window.addEventListener("blur", close);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      window.removeEventListener("blur", close);
    };
  }, []);

  useEffect(() => {
    if (showPanel && activeIndex >= 0) {
      document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, listId, showPanel]);

  useEffect(() => {
    if (expansionFocusRef.current === null) return;
    document.getElementById(`${listId}-${expansionFocusRef.current}`)?.focus();
    expansionFocusRef.current = null;
  }, [expanded, listId, visibleCount]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!trimmedQuery || composingRef.current) return;
    setOpen(true);
    setExpanded(true);
    setVisibleCount(PAGE_SIZE);
    setActiveIndex(-1);
    const loadedIndex = await ensureSearchIndex();
    if (!loadedIndex) return;
    const count = loadedIndex.fuse.search(trimmedQuery).length;
    track(count ? "Homepage Search" : "Homepage Search No Results", {
      query: trimmedQuery,
      result_count: count,
      mode: "all_results",
    });
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!trimmedQuery) return;
      event.preventDefault();
      setOpen(true);
      if (!visibleResults.length) return;
      setActiveIndex((current) => {
        if (!open || current < 0) return event.key === "ArrowDown" ? 0 : visibleResults.length - 1;
        return event.key === "ArrowDown"
          ? (current + 1) % visibleResults.length
          : (current - 1 + visibleResults.length) % visibleResults.length;
      });
    } else if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      track("Homepage Search", {
        query: trimmedQuery,
        result: activeResult.title,
        type: activeResult.type,
      });
      router.push(activeResult.href);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`home-search-wrap ${styles.wrapper}`}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || composingRef.current || event.nativeEvent.isComposing) return;
        if (showPanel) event.stopPropagation();
        inputRef.current?.focus();
        setOpen(false);
        setActiveIndex(-1);
      }}
    >
      <form className={styles.form} role="search" onSubmit={submit}>
        <Search size={21} aria-hidden="true" />
        <input
          ref={inputRef}
          className={styles.input}
          value={query}
          onChange={(event) => {
            expansionFocusRef.current = null;
            setQuery(event.target.value);
            setOpen(true);
            setExpanded(false);
            setActiveIndex(-1);
            setVisibleCount(PAGE_SIZE);
            void ensureSearchIndex();
          }}
          onFocus={() => {
            setOpen(true);
            void ensureSearchIndex();
          }}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { composingRef.current = false; }}
          onKeyDown={handleInputKeyDown}
          placeholder="搜梗名、选手、战队或赛事"
          aria-label="搜索梗、选手、战队或赛事"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={showPanel && !loading && !loadError && results.length ? listId : undefined}
          aria-activedescendant={activeResult ? `${listId}-${activeIndex}` : undefined}
          aria-describedby={hintId}
          autoComplete="off"
          spellCheck={false}
        />
        <button className={styles.submit} type="submit">搜索</button>
      </form>
      <span id={hintId} className={styles.srOnly}>输入后可用上下方向键选择结果，回车打开；直接回车查看全部结果。</span>
      {showPanel ? (
        <div className={`${styles.panel} ${expanded ? styles.expanded : ""}`}>
          {loading || (!index && !loadError) ? (
            <p className={styles.message} role="status">正在载入搜索内容…</p>
          ) : loadError ? (
            <p className={styles.message} role="alert">
              搜索暂时不可用。
              <button className={styles.textButton} type="button" onClick={() => { void ensureSearchIndex(); }}>
                重新加载
              </button>
            </p>
          ) : results.length ? (
            <>
              <div className={styles.resultsHeading} role="status">
                <span>找到 {results.length} 条结果</span>
                <span className={styles.keyboardHint}>↑ ↓ 选择 · 回车打开</span>
              </div>
              <ul className={styles.results} id={listId} role="listbox" aria-label={`“${trimmedQuery}”的搜索结果`}>
                {visibleResults.map((record, position) => (
                  <li key={record.href} role="none">
                    <Link
                      className={styles.result}
                      href={record.href}
                      id={`${listId}-${position}`}
                      role="option"
                      aria-selected={activeIndex === position}
                      onFocus={() => setActiveIndex(position)}
                      onClick={() => track("Homepage Search Result Click", {
                        query: trimmedQuery,
                        result: record.title,
                        type: record.type,
                        position: position + 1,
                      })}
                    >
                      <span className={styles.resultTitle}>{record.title}</span>
                      <span className={styles.resultType}>{typeLabels[record.type]}</span>
                      <span className={styles.resultDescription}>{record.subtitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {results.length > visibleResults.length ? (
                <button
                  className={styles.more}
                  type="button"
                  onClick={() => {
                    expansionFocusRef.current = visibleResults.length;
                    setExpanded(true);
                    setActiveIndex(-1);
                    setVisibleCount(expanded ? visibleCount + PAGE_SIZE : PAGE_SIZE);
                  }}
                >
                  {expanded ? `再显示 ${Math.min(PAGE_SIZE, results.length - visibleResults.length)} 条` : `查看全部 ${results.length} 条结果`}
                  <span>已显示 {visibleResults.length} 条</span>
                </button>
              ) : null}
            </>
          ) : (
            <p className={styles.message} role="status">
              没有找到“{trimmedQuery}”。试试别名，或
              <Link
                href={`/submit?name=${encodeURIComponent(trimmedQuery)}`}
                onClick={() => track("Search No Result Action", {
                  query: trimmedQuery,
                  surface: "homepage",
                })}
              >补充这个词条</Link>。
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
