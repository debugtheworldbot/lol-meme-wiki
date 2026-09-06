import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { JsonLd } from "@/components/json-ld";
import { getMemes, getTopicGuide } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getMemesForTopic, getTopic, topicDefinitions } from "@/lib/topics";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return topicDefinitions.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const topic = getTopic((await params).slug);
  if (!topic) return {};
  const url = `/topics/${topic.slug}`;
  const guide = getTopicGuide(topic.slug);
  const title = guide?.title ?? topic.title;
  const description = guide?.summary ?? topic.description;
  return {
    title,
    description,
    keywords: [topic.tag, `${topic.tag}大全`, "LOL梗", "英雄联盟梗", "LPL梗"],
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();
  const memes = getMemesForTopic(getMemes(), topic);
  const guide = getTopicGuide(topic.slug);
  const title = guide?.title ?? topic.title;
  const path = `/topics/${topic.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: guide?.summary ?? topic.description,
    dateModified: guide?.updated_at,
    url: `${siteConfig.url}${path}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: memes.length,
      itemListElement: memes.map((meme, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: meme.title,
        url: `${siteConfig.url}/meme/${meme.slug}`,
      })),
    },
  };

  return (
    <article className="wiki-page">
      <JsonLd data={jsonLd} />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "梗专题", path: "/topics" }, { name: topic.tag, path }])} />
      <div className="wiki-shell">
        <header className="wiki-head dir-head">
          <div><h1>{title}</h1><p className="wiki-meta">共 {memes.length} 条{guide?.updated_at ? ` · 导读更新：${guide.updated_at}` : " · 持续补充出处与演变"}</p></div>
        </header>
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li><Link href="/topics">梗专题</Link></li><li aria-current="page">{topic.tag}</li></ol>
        </nav>
        {guide ? (
          <section className="wiki-prose">
            <MDXRemote source={guide.body} />
          </section>
        ) : (
          <section className="wiki-main">
            <h2 className="wiki-h">专题说明</h2>
            <p className="wiki-lead">{topic.introduction}</p>
          </section>
        )}
        <h2 className="wiki-h">相关词条目录</h2>
        <ul className="entry-list">
          {memes.map((meme) => (
            <li key={meme.slug}>
              <Link href={`/meme/${meme.slug}`}>{meme.title}<ArrowUpRight size={14} /></Link>
              {meme.aliases?.length ? <span className="entry-alias">又称：{meme.aliases.slice(0, 3).join(" · ")}</span> : null}
              <p>{meme.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
