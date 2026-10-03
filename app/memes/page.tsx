import type { Metadata } from "next";
import Link from "next/link";
import { MemeExplorer } from "@/components/meme-explorer";
import { RandomMemeButton } from "@/components/random-meme-button";
import { getMemeListItems } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { topicDefinitions } from "@/lib/topics";
import { DirectoryNavigation } from "@/components/entity-directory";

export const metadata: Metadata = {
  title: "全部 LOL 梗",
  description: "浏览 研发.lol 收录的英雄联盟与电竞社区梗，按名称、别名与类型快速筛选。",
  alternates: { canonical: "/memes" },
};

export default function MemesPage() {
  const memes = getMemeListItems();
  const canonicalTags = topicDefinitions.map((topic) => topic.tag);
  return (
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
  );
}
