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
  const inputRef = useRef<HTMLInputElement>(null);
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
    : records.filter((record) => record.type === "meme").slice(0, 6);

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
    if (!open) return;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function visit(record: SearchRecord) {
    track("Search Result Click", { query, type: record.type, result: record.title });
    setOpen(false);
    setQuery("");
    router.push(record.href);
  }

  return (
    <>
      <button className="search-trigger" onClick={() => setOpen(true)} aria-label="打开全局搜索">
        <Search size={16} />
        <span>搜索</span>
        <kbd>⌘ K</kbd>
      </button>
      {open ? (
        <div className="search-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="search-modal" role="dialog" aria-modal="true" aria-label="全局搜索">
            <div className="search-modal-input">
              <Search size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) visit(results[0]);
                }}
                placeholder="试试 YYDS、大魔王、世一上……"
                aria-label="搜索梗、选手、战队或赛事"
              />
              <button onClick={() => setOpen(false)} aria-label="关闭搜索"><X size={19} /></button>
            </div>
            <div className="search-caption">
              <span>{query ? `“${query}” 的搜索结果` : "热门词条"}</span>
              <span>{results.length} 项</span>
            </div>
            <div className="search-results">
              {results.length ? results.map((record) => (
                <button key={`${record.type}-${record.href}`} onClick={() => visit(record)}>
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
            <div className="search-hint"><kbd>Enter</kbd> 打开首条结果 <span>·</span> <kbd>Esc</kbd> 关闭</div>
          </section>
        </div>
      ) : null}
    </>
  );
}
