import type { Metadata } from "next";
import Link from "next/link";
import { DirectoryNavigation, EntityDirectory } from "@/components/entity-directory";
import { getTeams } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "战队梗档案",
  description: "按英雄联盟职业战队浏览相关社区梗与赛事出处。",
  alternates: { canonical: "/teams" },
};

export default function TeamsPage() {
  const entries = getTeams();
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "战队", path: "/teams" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">战队</li></ol>
        </nav>
        <header className="wiki-head">
          <h1>战队</h1>
          <p className="wiki-meta">共 {entries.length} 支战队。从队伍的外号、战绩和名场面继续找梗。</p>
        </header>
        <DirectoryNavigation current="/teams" />
        <EntityDirectory entries={entries} kind="team" />
      </div>
    </article>
  );
}
