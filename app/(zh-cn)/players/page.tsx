import { localizeMetadata } from "@/lib/locale-seo";
import { LocalizedContent } from "@/components/localized-content";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { DirectoryNavigation, EntityDirectory } from "@/components/entity-directory";
import { getPlayers } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = localizeMetadata({
  title: "选手梗档案",
  description: "按英雄联盟职业选手浏览相关社区梗与赛事出处。",
  alternates: { canonical: "/players" },
}, "zh-CN");

export default function PlayersPage() {
  const entries = getPlayers();
  return <LocalizedContent>{(
    <article className="wiki-page">
      <div className="wiki-shell">
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "选手", path: "/players" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">选手</li></ol>
        </nav>
        <header className="wiki-head">
          <h1>选手</h1>
          <p className="wiki-meta">共 {entries.length} 位选手。找一个熟悉的名字，看看相关的外号、语录和比赛。</p>
        </header>
        <DirectoryNavigation current="/players" />
        <EntityDirectory entries={entries} kind="player" />
      </div>
    </article>
  )}</LocalizedContent>;
}
