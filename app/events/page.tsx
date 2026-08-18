import type { Metadata } from "next";
import Link from "next/link";
import { EntityDirectory } from "@/components/entity-directory";
import { getEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "赛事梗档案",
  description: "按英雄联盟赛事浏览比赛名场面与相关社区梗。",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  const entries = getEvents();
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>赛事</h1>
          <p className="wiki-meta">共 {entries.length} 项 · 赛程里留下的社区梗</p>
        </header>
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">赛事</li>
          </ol>
        </nav>
        <h2 className="wiki-h">全部赛事</h2>
        <EntityDirectory entries={entries} kind="event" />
      </div>
    </article>
  );
}
