import type { Metadata } from "next";
import Link from "next/link";
import { DirectoryNavigation, EntityDirectory } from "@/components/entity-directory";
import { getEvents } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

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
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "赛事", path: "/events" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">赛事</li></ol>
        </nav>
        <header className="wiki-head">
          <h1>赛事</h1>
          <p className="wiki-meta">共 {entries.length} 项赛事。回到比赛，找当时的解说、比分和赛后故事。</p>
        </header>
        <DirectoryNavigation current="/events" />
        <EntityDirectory entries={entries} kind="event" />
      </div>
    </article>
  );
}
