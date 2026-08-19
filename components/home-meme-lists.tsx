/* 赛后公报室：词条列表以时间标尺、卷宗编号与定长翻页替代普通“加载更多”按钮。 */
"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { MemeEntry } from "@/lib/types";

/* 单栏每页 6 条；双栏在宽屏是 4 行 × 2 列，故每页 8 条 */
const PAGE_SIZE = { 1: 6, 2: 8 } as const;

type HomeMemeListProps = { title: string; description: string; memes: MemeEntry[]; showFirstSeen?: boolean; headingId?: string; columns?: 1 | 2; };

export function HomeMemeList({ title, description, memes, showFirstSeen = false, headingId, columns = 1 }: HomeMemeListProps) {
  const [page, setPage] = useState(1);
  const pageSize = PAGE_SIZE[columns];
  const totalPages = Math.max(1, Math.ceil(memes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = memes.slice(start, start + pageSize);
  const fillers = Array.from({ length: pageSize - visible.length }, (_, index) => index);

  return (
    <section className="home-list-section" aria-label={title}>
      <div className="home-list-heading"><div><h2 id={headingId}>{title}</h2><p>{description}</p></div><span>{memes.length} 条</span></div>
      <ol className={columns === 2 ? "home-list home-list-split" : "home-list"}>
        {visible.map((meme, index) => (
          <li key={meme.slug}>
            <span className="list-index">{String(start + index + 1).padStart(2, "0")}</span>
            <div className="home-list-copy">
              {showFirstSeen && meme.first_seen ? <time>初见 {meme.first_seen}</time> : null}
              {!showFirstSeen && meme.updated_at ? <time>归档 {meme.updated_at}</time> : null}
              <Link href={`/meme/${meme.slug}`}>{meme.title}<ArrowUpRight size={14} /></Link>
              <span>{meme.summary}</span>
            </div>
          </li>
        ))}
        {fillers.map((filler) => <li key={`filler-${filler}`} className="home-list-filler" aria-hidden="true" />)}
      </ol>
      <div className="home-list-actions">
        <div className="home-pager">
          <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="上一页"><ChevronLeft size={15} /> 上一页</button>
          <span className="home-pager-status">{String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}</span>
          <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="下一页">下一页 <ChevronRight size={15} /></button>
        </div>
        <Link href="/memes">查看完整目录 <ArrowUpRight size={14} /></Link>
      </div>
    </section>
  );
}
