import type { Metadata } from "next";
import Link from "next/link";
import { DirectoryNavigation } from "@/components/entity-directory";
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
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "梗专题", path: "/topics" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">梗专题</li></ol>
        </nav>
        <header className="wiki-head dir-head">
          <div>
            <h1>梗专题</h1>
            <p className="wiki-meta">{topicDefinitions.length} 个专题，从一个选手、一类说法或一个赛季开始读。</p>
          </div>
        </header>
        <DirectoryNavigation current="/topics" />
        <ul className="entry-list" aria-label="梗专题列表">
          {topicDefinitions.map((topic) => {
            const count = getMemesForTopic(memes, topic).length;
            return (
              <li key={topic.slug}>
                <Link href={`/topics/${topic.slug}`}>{topic.player ? `${topic.tag} 梗导读` : /^\d{4}$/.test(topic.tag) ? `${topic.tag} 年的新梗` : topic.tag}</Link>
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
