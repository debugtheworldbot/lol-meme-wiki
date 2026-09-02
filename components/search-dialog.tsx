"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { loadClientSearchIndex, type ClientSearchIndex } from "@/lib/client-search-index";
import type { SearchRecord } from "@/lib/types";

const labels = { meme: "梗", player: "选手", team: "战队", event: "赛事" } as const;

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [index, setIndex] = useState<ClientSearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const navigatingRef = useRef(false);
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
      track("Search Index Load Failure", { surface: "global" });
      setLoadError(true);
      return null;
    } finally {
      setLoading(false);
    }
  }, [index]);

  const results = query.trim()
    ? (index?.fuse.search(query.trim(), { limit: 8 }).map((result) => result.item) ?? [])
    : (index?.records ?? [])
        .filter((record) => record.type === "meme")
        .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
        .slice(0, 6);
  /* 结果集变化后 activeIndex 可能越界，读取时统一收紧 */
  const activeIndexSafe = Math.max(0, Math.min(activeIndex, results.length - 1));

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          track("Search Open", { surface: "shortcut" });
          setOpen(true);
          void ensureSearchIndex();
        }
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ensureSearchIndex, open]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      document.body.style.overflow = "hidden";
      const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => { window.clearTimeout(timer); document.body.style.overflow = ""; };
    }
    /* 从弹层内任意路径关闭后，焦点回到触发的搜索按钮；因跳转而关闭时焦点归新页面 */
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      if (navigatingRef.current) navigatingRef.current = false;
      else triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    resultsRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, query]);

  function moveActive(delta: number) {
    setActiveIndex(Math.min(Math.max(activeIndexSafe + delta, 0), results.length - 1));
  }

  function trapTab(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, input, a[href]"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function visit(record: SearchRecord, position: number) {
    track("Search Result Click", {
      query: query.trim(),
      type: record.type,
      result: record.title,
      position,
      mode: query.trim() ? "query" : "popular",
    });
    navigatingRef.current = true;
    /* 必须先同步提交关闭：router.push 的 transition 会让 AppRouter 在 render 里挂起，
       同一批次里的普通更新会被一起压住，弹层就停在页面上直到新路由数据到达 */
    flushSync(() => {
      setOpen(false);
      setQuery("");
    });
    router.push(record.href);
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="search-trigger"
        onFocus={() => { void ensureSearchIndex(); }}
        onMouseEnter={() => { void ensureSearchIndex(); }}
        onClick={() => {
          track("Search Open", { surface: "header" });
          setOpen(true);
          void ensureSearchIndex();
        }}
        aria-label="打开全局搜索"
      >
        <Search size={16} />
        <span>搜索</span>
        <kbd>⌘ K</kbd>
      </button>
      {open ? createPortal(
        /* portal 到 body：site-header 的 backdrop-filter 会把 fixed 后代的包含块改成 header 自身，遮罩就只剩 header 那条 */
        <div className="search-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="search-modal" role="dialog" aria-modal="true" aria-label="全局搜索" onKeyDown={trapTab}>
            <div className="search-modal-input">
              <Search size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moveActive(1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moveActive(-1);
                  } else if (event.key === "Enter" && results[activeIndexSafe]) {
                    /* 拦掉默认行为，避免关闭后残余的 keypress 打到新获得焦点的元素上 */
                    event.preventDefault();
                    visit(results[activeIndexSafe], activeIndexSafe + 1);
                  }
                }}
                placeholder="试试 YYDS、大魔王、世一上……"
                aria-label="搜索梗、选手、战队或赛事"
                aria-controls="search-result-list"
              />
              <button onClick={() => setOpen(false)} aria-label="关闭搜索"><X size={19} /></button>
            </div>
            <div className="search-caption">
              <span>{query ? `“${query}” 的搜索结果` : "热门词条"}</span>
              <span>{loading ? "载入中" : loadError ? "暂不可用" : `${results.length} 项`}</span>
            </div>
            <div className="search-results" id="search-result-list" ref={resultsRef}>
              {loading ? (
                <div className="search-index-state" role="status">正在载入搜索档案……</div>
              ) : loadError ? (
                <div className="search-index-state" role="alert">
                  <span>搜索档案暂时没有载入。</span>
                  <button type="button" onClick={() => { void ensureSearchIndex(); }}>重试</button>
                </div>
              ) : results.length ? results.map((record, index) => (
                <button
                  key={`${record.type}-${record.href}`}
                  data-active={index === activeIndexSafe ? "true" : undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => visit(record, index + 1)}
                >
                  <span className={`result-type type-${record.type}`}>{labels[record.type]}</span>
                  <span className="result-copy">
                    <strong>{record.title}</strong>
                    <small>{record.subtitle}</small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              )) : (
                <div className="empty-search">
                  <strong>档案里还没有这个词。</strong>
                  <span>换个叫法试试，或者把它提交给编辑。</span>
                  {query.trim() ? (
                    <Link
                      href={`/submit?name=${encodeURIComponent(query.trim())}`}
                      onClick={() => {
                        track("Search No Result Action", {
                          query: query.trim(),
                          surface: "global",
                        });
                        navigatingRef.current = true;
                        flushSync(() => {
                          setOpen(false);
                          setQuery("");
                        });
                      }}
                    >
                      提交“{query.trim()}” ↗
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
            <div className="search-hint"><kbd>↑</kbd><kbd>↓</kbd> 选择 <span>·</span> <kbd>Enter</kbd> 打开 <span>·</span> <kbd>Esc</kbd> 关闭</div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
