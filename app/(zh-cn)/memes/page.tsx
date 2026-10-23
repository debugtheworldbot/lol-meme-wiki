import { localizeMetadata } from "@/lib/locale-seo";
import { LocalizedContent } from "@/components/localized-content";
import type { Metadata } from "next";
import Link from "@/components/locale-link";
import { MemeExplorer } from "@/components/meme-explorer";
import { RandomMemeButton } from "@/components/random-meme-button";
import { getMemeListItems } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { topicDefinitions } from "@/lib/topics";
import { DirectoryNavigation } from "@/components/entity-directory";

export const metadata: Metadata = localizeMetadata({
  title: "全部 LOL 梗",
  description: "英雄联盟梗目录，按梗名、别名和关键词查找选手外号、数字梗、英雄台词与赛事名场面。支持分类筛选、常见优先和最近更新排序，查看每条梗的含义、出处、比赛背景与使用语境。",
  alternates: { canonical: "/memes" },
}, "zh-CN");

export default function MemesPage() {
  const memes = getMemeListItems();
  // 选手专题按 players 聚合，只在专题导航中展示，不作为 tag 筛选。
  const canonicalTags = topicDefinitions.filter((topic) => !topic.player).map((topic) => topic.tag);
  return <LocalizedContent>{(
    <article className="wiki-page">
      <div className="wiki-shell">
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "梗目录", path: "/memes" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">梗目录</li></ol>
        </nav>
        <header className="wiki-head dir-head">
          <div>
            <h1>全部梗</h1>
            <p className="wiki-meta">查梗名、别名和关键词，也可以按类型慢慢找。</p>
          </div>
          <RandomMemeButton compact slugs={memes.map((meme) => meme.slug)} />
        </header>
        <DirectoryNavigation current="/memes" />
        <MemeExplorer memes={memes} canonicalTags={canonicalTags} />
      </div>
    </article>
  )}</LocalizedContent>;
}
