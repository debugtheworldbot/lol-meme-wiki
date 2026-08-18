"use client";

import Link from "next/link";
import { useState } from "react";
import type { MemeEntry } from "@/lib/types";

const PAGE_SIZE = 6;

type PaginatedListProps = {
  title: string;
  description: string;
  memes: MemeEntry[];
  showFirstSeen?: boolean;
};

function PaginatedList({ title, description, memes, showFirstSeen = false }: PaginatedListProps) {
  const [page, setPage] = useState(1);
  const visible = memes.slice(0, page * PAGE_SIZE);
  const hasNextPage = visible.length < memes.length;

  return (
    <section className="home-list-section" aria-label={title}>
      <div className="home-list-heading">
        <div>
          <h2 className="wiki-h">{title}</h2>
          <p>{description}</p>
        </div>
        <span>{memes.length} 条</span>
      </div>
      <ol className="home-list">
        {visible.map((meme) => (
          <li key={meme.slug}>
            {showFirstSeen && meme.first_seen ? <time>出现：{meme.first_seen}</time> : null}
            {!showFirstSeen && meme.updated_at ? <time>收录：{meme.updated_at}</time> : null}
            <Link href={`/meme/${meme.slug}`}>{meme.title}</Link>
            <span>{meme.summary}</span>
          </li>
        ))}
      </ol>
      <div className="home-list-actions">
        {hasNextPage ? (
          <button type="button" className="home-load-more" onClick={() => setPage((current) => current + 1)}>
            加载下一页
          </button>
        ) : (
          <span className="home-list-complete">已加载全部 {memes.length} 条</span>
        )}
        <Link href="/memes">查看全部梗</Link>
      </div>
    </section>
  );
}

export function HomeMemeLists({ chronologicalMemes, latestMemes }: { chronologicalMemes: MemeEntry[]; latestMemes: MemeEntry[] }) {
  return (
    <div className="home-split">
      <PaginatedList
        title="按时间排序"
        description="按梗最早出现时间倒序，最新发生的梗排在前面。"
        memes={chronologicalMemes}
        showFirstSeen
      />
      <PaginatedList
        title="最新收录"
        description="按站内更新日期倒序，展示最近补充或修订的词条。"
        memes={latestMemes}
      />
    </div>
  );
}
