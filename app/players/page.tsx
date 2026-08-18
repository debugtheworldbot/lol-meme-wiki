import type { Metadata } from "next";
import Link from "next/link";
import { EntityDirectory } from "@/components/entity-directory";
import { getPlayers } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "选手梗档案",
  description: "按英雄联盟职业选手浏览相关社区梗与赛事出处。",
  alternates: { canonical: "/players" },
};

export default function PlayersPage() {
  const entries = getPlayers();
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>选手</h1>
          <p className="wiki-meta">共 {entries.length} 人 · 从一个 ID 找到相关梗</p>
        </header>
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "选手", path: "/players" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">选手</li>
          </ol>
        </nav>
        <h2 className="wiki-h">全部选手</h2>
        <EntityDirectory entries={entries} kind="player" />
      </div>
    </article>
  );
}
