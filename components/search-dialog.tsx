"use client";

import { type KeyboardEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { loadClientSearchIndex, type ClientSearchIndex } from "@/lib/client-search-index";
import type { SearchRecord } from "@/lib/types";

const labels = { meme: "梗", player: "选手", team: "战队", event: "赛事" } as const;
const PAGE_SIZE = 12;

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [index, setIndex] = useState<ClientSearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pendingIndexRef = useRef<Promise<ClientSearchIndex | null> | null>(null);
  const expansionFocusRef = useRef<number | null>(null);
  const wasOpenRef = useRef(false);
  const navigatingRef = useRef(false);
  const composingRef = useRef(false);
  const id = useId();
  const listId = `${id}-results`;
  const headingId = `${id}-heading`;
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
      track("Search Index Load Failure", { surface: "global" });
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
    ? (index?.fuse.search(trimmedQuery).map((result) => result.item) ?? [])
    : (index?.records ?? []).filter((record) => record.type === "meme")
      .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0)).slice(0, 6), [index, trimmedQuery]);
  const visibleResults = results.slice(0, visibleCount);
  const activeResult = visibleResults[activeIndex];
  const hasResults = !loading && !loadError && visibleResults.length > 0;

  function openSearch(surface: "header" | "shortcut") {
    returnFocusRef.current = surface === "header" ? triggerRef.current
      : document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : triggerRef.current;
    track("Search Open", { surface });
    setOpen(true);
    void ensureSearchIndex();
  }

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.isComposing || event.keyCode === 229) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (!open && document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        event.preventDefault();
        if (open) setOpen(false);
        else {
          returnFocusRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : triggerRef.current;
          track("Search Open", { surface: "shortcut" });
          setOpen(true);
          void ensureSearchIndex();
        }
      }
      if (open && event.key === "Escape" && !composingRef.current) {
        event.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ensureSearchIndex, open]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
      return () => { document.body.style.overflow = previousOverflow; };
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      if (navigatingRef.current) navigatingRef.current = false;
      else if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
      else triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open && activeIndex >= 0) document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId, open]);

  useEffect(() => {
    if (expansionFocusRef.current === null) return;
    document.getElementById(`${listId}-${expansionFocusRef.current}`)?.focus();
    expansionFocusRef.current = null;
  }, [listId, visibleCount]);

  function trapTab(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]',
    ));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function trackResult(record: SearchRecord, position: number) {
    track("Search Result Click", {
      query: trimmedQuery, type: record.type, result: record.title, position,
      mode: trimmedQuery ? "query" : "popular",
    });
  }

  function closeForNavigation() {
    navigatingRef.current = true;
    // Close before the route transition can suspend the navigation.
    flushSync(() => { setOpen(false); setQuery(""); setActiveIndex(-1); setVisibleCount(PAGE_SIZE); });
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="search-trigger"
        onFocus={() => { void ensureSearchIndex(); }}
        onMouseEnter={() => { void ensureSearchIndex(); }}
        onClick={() => openSearch("header")}
        aria-label="打开全局搜索"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Search size={16} aria-hidden="true" />
        <span>搜索</span>
        <kbd aria-hidden="true">⌘ K</kbd>
      </button>
      {open ? createPortal(
        <div className="search-overlay" role="presentation" onPointerDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="search-modal" role="dialog" aria-modal="true" aria-labelledby={headingId} onKeyDown={trapTab}>
            <header className="search-modal-head">
              <h2 id={headingId}>搜索百科</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="关闭搜索"><X size={20} aria-hidden="true" /></button>
            </header>
            <div className="search-modal-input">
              <Search size={20} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  expansionFocusRef.current = null;
                  setQuery(event.target.value);
                  setActiveIndex(-1);
                  setVisibleCount(PAGE_SIZE);
                }}
                onCompositionStart={() => { composingRef.current = true; }}
                onCompositionEnd={() => { composingRef.current = false; }}
                onKeyDown={(event) => {
                  if (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    if (!visibleResults.length) return;
                    setActiveIndex((current) => current < 0
                      ? (event.key === "ArrowDown" ? 0 : visibleResults.length - 1)
                      : (current + (event.key === "ArrowDown" ? 1 : -1) + visibleResults.length) % visibleResults.length);
                  } else if (event.key === "Enter" && activeResult) {
                    event.preventDefault();
                    trackResult(activeResult, activeIndex + 1);
                    closeForNavigation();
                    router.push(activeResult.href);
                  }
                }}
                placeholder="搜梗名、选手、战队或赛事"
                aria-label="搜索梗、选手、战队或赛事"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={hasResults}
                aria-controls={hasResults ? listId : undefined}
                aria-activedescendant={hasResults && activeResult ? `${listId}-${activeIndex}` : undefined}
                aria-describedby={hintId}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="search-caption" role="status">
              <span>{trimmedQuery ? `“${trimmedQuery}”的搜索结果` : "从这些词条开始"}</span>
              <span>{loading ? "载入中" : loadError ? "暂不可用" : `${results.length} 条`}</span>
            </div>
            <div className="search-results">
              {loading ? (
                <div className="search-index-state" role="status">正在载入搜索内容…</div>
              ) : loadError ? (
                <div className="search-index-state" role="alert">
                  <span>暂时无法载入搜索，请重新试一次。</span>
                  <button type="button" onClick={() => { void ensureSearchIndex(); }}>重新加载</button>
                </div>
              ) : results.length ? (
                <ul className="search-result-list" id={listId} role="listbox" aria-label={trimmedQuery ? "搜索结果" : "推荐词条"}>
                  {visibleResults.map((record, position) => (
                    <li key={record.href} role="none">
                      <Link
                        className="search-result"
                        href={record.href}
                        id={`${listId}-${position}`}
                        role="option"
                        aria-selected={position === activeIndex}
                        data-active={position === activeIndex ? "true" : undefined}
                        onMouseEnter={() => setActiveIndex(position)}
                        onFocus={() => setActiveIndex(position)}
                        onClick={(event) => {
                          trackResult(record, position + 1);
                          if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) closeForNavigation();
                        }}
                      >
                        <span className="result-copy"><strong>{record.title}</strong><small>{record.subtitle}</small></span>
                        <span className="result-type">{labels[record.type]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-search" role="status">
                  <strong>没有找到“{trimmedQuery}”</strong>
                  <span>试试别名，或补充我们还没收录的词条。</span>
                  {trimmedQuery ? (
                    <Link href={`/submit?name=${encodeURIComponent(trimmedQuery)}`} onClick={(event) => {
                      track("Search No Result Action", { query: trimmedQuery, surface: "global" });
                      if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) closeForNavigation();
                    }}>补充这个词条</Link>
                  ) : null}
                </div>
              )}
            </div>
            {hasResults && results.length > visibleResults.length ? (
              <button className="search-more" type="button" onClick={() => {
                expansionFocusRef.current = visibleResults.length;
                setVisibleCount((count) => count + PAGE_SIZE);
              }}>再显示 {Math.min(PAGE_SIZE, results.length - visibleResults.length)} 条<span>已显示 {visibleResults.length} 条</span></button>
            ) : null}
            <p className="search-hint" id={hintId}>↑ ↓ 选择结果 · Enter 打开 · Esc 关闭</p>
          </section>
        </div>, document.body,
      ) : null}
    </>
  );
}
