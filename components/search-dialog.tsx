"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { ArrowUpRight, Search, X } from "lucide-react";
import { track } from "@/lib/analytics";
import type { SearchRecord } from "@/lib/types";

const labels = { meme: "梗", player: "选手", team: "战队", event: "赛事" } as const;

export function SearchDialog({ records }: { records: SearchRecord[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const router = useRouter();
  const fuse = useMemo(
    () => new Fuse(records, {
      keys: [
        { name: "title", weight: 0.45 },
        { name: "aliases", weight: 0.28 },
        { name: "keywords", weight: 0.17 },
        { name: "subtitle", weight: 0.1 },
      ],
      threshold: 0.36,
      ignoreLocation: true,
      minMatchCharLength: 1,
    }),
    [records],
  );

  const results = query.trim()
    ? fuse.search(query.trim(), { limit: 8 }).map((result) => result.item)
    : records
        .filter((record) => record.type === "meme")
        .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
        .slice(0, 6);
  /* 结果集变化后 activeIndex 可能越界，读取时统一收紧 */
  const activeIndexSafe = Math.max(0, Math.min(activeIndex, results.length - 1));

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      document.body.style.overflow = "hidden";
      const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => { window.clearTimeout(timer); document.body.style.overflow = ""; };
    }
    /* 从弹层内任意路径关闭后，焦点回到触发的搜索按钮 */
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
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
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, input"));
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

  function visit(record: SearchRecord) {
    track("Search Result Click", { query, type: record.type, result: record.title });
    setOpen(false);
    setQuery("");
    router.push(record.href);
  }

  return (
    <>
      <button ref={triggerRef} className="search-trigger" onClick={() => setOpen(true)} aria-label="打开全局搜索">
        <Search size={16} />
        <span>搜索</span>
        <kbd>⌘ K</kbd>
      </button>
      {open ? (
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
                    visit(results[activeIndexSafe]);
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
              <span>{results.length} 项</span>
            </div>
            <div className="search-results" id="search-result-list" ref={resultsRef}>
              {results.length ? results.map((record, index) => (
                <button
                  key={`${record.type}-${record.href}`}
                  data-active={index === activeIndexSafe ? "true" : undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => visit(record)}
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
                  <span>换个叫法试试，或者提交一个新梗。</span>
                </div>
              )}
            </div>
            <div className="search-hint"><kbd>↑</kbd><kbd>↓</kbd> 选择 <span>·</span> <kbd>Enter</kbd> 打开 <span>·</span> <kbd>Esc</kbd> 关闭</div>
          </section>
        </div>
      ) : null}
    </>
  );
}
