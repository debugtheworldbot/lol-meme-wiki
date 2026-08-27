import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { getMemes } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { getMemesForTopic, topicDefinitions } from "@/lib/topics";

export const metadata: Metadata = {
  title: "LOL 梗专题",
  description: "按选手、赛事、英雄台词、年份和类型浏览英雄联盟梗专题，集中查看相关词条及出处。",
  alternates: { canonical: "/topics" },
};

export default function TopicsPage() {
  const memes = getMemes();
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <header className="wiki-head dir-head">
          <div>
            <h1>梗专题</h1>
            <p className="wiki-meta">从选手、赛事、年份和表达形式进入 LOL 梗档案</p>
          </div>
        </header>
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "梗专题", path: "/topics" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">梗专题</li></ol>
        </nav>
        <ul className="entry-list">
          {topicDefinitions.map((topic) => {
            const count = getMemesForTopic(memes, topic).length;
            return (
              <li key={topic.slug}>
                <Link href={`/topics/${topic.slug}`}>{topic.title}<ArrowUpRight size={14} /></Link>
                <span className="entry-alias">{count} 条词条</span>
                <p>{topic.introduction}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
