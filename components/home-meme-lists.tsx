/* 赛后公报室：词条列表以时间标尺、卷宗编号与定长翻页替代普通“加载更多”按钮。 */
"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { MemeEntry } from "@/lib/types";

const PAGE_SIZE = 6;

type PaginatedListProps = { title: string; description: string; memes: MemeEntry[]; showFirstSeen?: boolean; };

function PaginatedList({ title, description, memes, showFirstSeen = false }: PaginatedListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(memes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = memes.slice(start, start + PAGE_SIZE);
  const fillers = Array.from({ length: PAGE_SIZE - visible.length }, (_, index) => index);

  return (
    <section className="home-list-section" aria-label={title}>
      <div className="home-list-heading"><div><h2>{title}</h2><p>{description}</p></div><span>{memes.length} 条</span></div>
      <ol className="home-list">
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

export function HomeMemeLists({ chronologicalMemes, latestMemes }: { chronologicalMemes: MemeEntry[]; latestMemes: MemeEntry[] }) {
  return <div className="home-split"><PaginatedList title="按时间排序" description="从刚刚诞生的复读句，倒着回看那些至今仍在被引用的名场面。" memes={chronologicalMemes} showFirstSeen /><PaginatedList title="最新收录" description="最近补齐出处、更新语境或刚刚被整理进档案室的词条。" memes={latestMemes} /></div>;
}
