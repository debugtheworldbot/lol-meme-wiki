"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { MemeCard } from "@/components/meme-card";
import type { MemeEntry } from "@/lib/types";

export function MemeExplorer({ memes }: { memes: MemeEntry[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => (searchParams.get("q") ?? "").slice(0, 80));
  const [tag, setTag] = useState("全部");
  const tags = ["全部", ...Array.from(new Set(memes.flatMap((meme) => meme.tags))).slice(0, 8)];
  const fuse = useMemo(() => new Fuse(memes, { keys: ["title", "aliases", "summary", "tags"], threshold: 0.35 }), [memes]);
  const searched = query ? fuse.search(query).map((result) => result.item) : memes;
  const visible = tag === "全部" ? searched : searched.filter((meme) => meme.tags.includes(tag));

  return (
    <>
      <div className="directory-tools">
        <label>
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="在梗目录中筛选……" />
        </label>
        <span className="result-total">{visible.length.toString().padStart(3, "0")} 条记录</span>
      </div>
      <div className="tag-filter" aria-label="按类型筛选">
        <SlidersHorizontal size={16} />
        {tags.map((item) => (
          <button key={item} className={item === tag ? "active" : ""} onClick={() => setTag(item)}>{item}</button>
        ))}
      </div>
      {visible.length ? (
        <div className="meme-grid directory-grid">
          {visible.map((meme, index) => <MemeCard key={meme.slug} meme={meme} index={index + 1} />)}
        </div>
      ) : (
        <div className="directory-empty"><strong>没有匹配词条。</strong><span>换个关键词，或者提交一个新梗。</span></div>
      )}
    </>
  );
}
