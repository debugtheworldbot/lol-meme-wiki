"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { ArrowRight, Search } from "lucide-react";
import { track } from "@/lib/analytics";
import type { SearchRecord } from "@/lib/types";

export function InlineSearch({ records }: { records: SearchRecord[] }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const fuse = useMemo(() => new Fuse(records, {
    keys: ["title", "aliases", "keywords", "subtitle"],
    threshold: 0.35,
    ignoreLocation: true,
  }), [records]);
  const results = query.trim() ? fuse.search(query.trim(), { limit: 5 }).map((item) => item.item) : [];

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!results[0]) return;
    track("Homepage Search", { query, result: results[0].title });
    router.push(results[0].href);
  }

  return (
    <div className="inline-search-wrap">
      <form className="inline-search" onSubmit={submit}>
        <Search size={22} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 140)}
          placeholder="搜索「YYDS」「大魔王」「世一上」……"
          aria-label="搜索 LOL 梗"
        />
        <button type="submit" aria-label="搜索"><ArrowRight size={21} /></button>
      </form>
      {focused && query ? (
        <div className="inline-results">
          {results.length ? results.map((record) => (
            <button key={record.href} onMouseDown={() => router.push(record.href)}>
              <strong>{record.title}</strong>
              <span>{record.subtitle}</span>
              <small>{record.type === "meme" ? "梗" : record.type === "player" ? "选手" : record.type === "team" ? "战队" : "赛事"}</small>
            </button>
          )) : <p>没有找到，去提交一个新梗？</p>}
        </div>
      ) : null}
    </div>
  );
}
