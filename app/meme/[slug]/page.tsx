import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getEntity, getEntityTitle, getMeme, getMemes, getRelatedMemes } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildMemeMetadata, getContentLastModified } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { EntityKind, MemeEntry } from "@/lib/types";
import { WikiLinkedText } from "@/components/wiki-linked-text";
import { JsonLd } from "@/components/json-ld";
import { CorrectionDialog } from "@/components/correction-dialog";
import { MemeContinueReading } from "@/components/meme-continue-reading";
import { MemeArticle } from "@/components/meme-article";
import { MemeInfobox } from "@/components/meme-infobox";
import { TrackedSourceLink } from "@/components/tracked-source-link";
import { getTopicForTag } from "@/lib/topics";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

const sourceKindLabel = {
  video: "视频",
  match: "比赛",
  post: "帖子",
  article: "文章",
} as const;

export function generateStaticParams() {
  return getMemes().map((meme) => ({ slug: meme.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meme = getMeme(slug);
  return meme ? buildMemeMetadata(meme) : {};
}

function collectWikiTerms(meme: MemeEntry) {
  const terms: { label: string; href: string }[] = [];
  const push = (kind: Exclude<EntityKind, "meme">, slug: string) => {
    const href = `/${kind}/${slug}`;
    const entry = getEntity(kind, slug);
    if (!entry) {
      terms.push({ label: slug, href });
      return;
    }
    terms.push({ label: entry.title, href });
    if (entry.display_name) terms.push({ label: entry.display_name, href });
    for (const alias of entry.aliases ?? []) {
      if (alias.length >= 2) terms.push({ label: alias, href });
    }
  };
  meme.players.forEach((slug) => push("player", slug));
  meme.teams.forEach((slug) => push("team", slug));
  meme.events.forEach((slug) => push("event", slug));
  return terms;
}

function WikiJoin({
  slugs,
  kind,
}: {
  slugs: string[];
  kind: Exclude<EntityKind, "meme">;
}) {
  if (!slugs.length) return "—";
  return slugs.map((slug, index) => (
    <Fragment key={slug}>
      {index > 0 ? "、" : null}
      <Link href={`/${kind}/${slug}`}>{getEntityTitle(kind, slug)}</Link>
    </Fragment>
  ));
}

export default async function MemeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const meme = getMeme(slug);
  if (!meme) notFound();
  const related = getRelatedMemes(meme);
  const terms = collectWikiTerms(meme);
  const quickFacts = [
    meme.players[0] ? { kind: "player" as const, slug: meme.players[0] } : null,
    meme.teams[0] ? { kind: "team" as const, slug: meme.teams[0] } : null,
    meme.events[0] ? { kind: "event" as const, slug: meme.events[0] } : null,
  ].filter((fact): fact is { kind: Exclude<EntityKind, "meme">; slug: string } => Boolean(fact));
  const url = `${siteConfig.url}/meme/${meme.slug}`;
  const lastModified = getContentLastModified([meme]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: meme.title,
    alternateName: meme.aliases?.length ? meme.aliases : undefined,
    description: meme.summary,
    url,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: {
      "@type": "WebPage",
      url,
      datePublished: meme.collected_at,
      dateModified: lastModified,
    },
  };

  return (
    <article className="wiki-page wiki-detail-page">
      <JsonLd data={jsonLd} />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "梗目录", path: "/memes" }, { name: meme.title, path: `/meme/${meme.slug}` }])} />
      <div className="wiki-shell">
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li><Link href="/memes">梗目录</Link></li>
            <li aria-current="page">{meme.title}</li>
          </ol>
          <div className="wiki-tools">
            <CorrectionDialog title={meme.title} pathname={`/meme/${meme.slug}`} />
          </div>
        </nav>

        <header className="wiki-head">
          <h1>{meme.title}</h1>
          <p className="wiki-meta">
            {meme.collected_at ? <span>收录于 <time dateTime={meme.collected_at}>{meme.collected_at}</time></span> : null}
            {lastModified ? <span>更新于 <time dateTime={lastModified}>{lastModified}</time></span> : null}
          </p>
        </header>

        <div className="wiki-layout meme-layout">
          <div className="meme-intro wiki-intro">
            <p className="wiki-lead">
              <WikiLinkedText text={meme.summary} terms={terms} />
            </p>
          </div>

          <MemeInfobox
            title={meme.title}
            quickLinks={quickFacts.length ? quickFacts.map((fact) => (
              <span key={`${fact.kind}-${fact.slug}`}>
                <WikiJoin slugs={[fact.slug]} kind={fact.kind} />
              </span>
            )) : undefined}
          >
            <dl className="wiki-infobox-facts">
              {meme.aliases?.length ? <div><dt>又称</dt><dd>{meme.aliases.join("、")}</dd></div> : null}
              <div><dt>时间线索</dt><dd>{meme.first_seen ?? "尚待考证"}</dd></div>
              {meme.players.length ? <div><dt>相关人物</dt><dd><WikiJoin slugs={meme.players} kind="player" /></dd></div> : null}
              {meme.teams.length ? <div><dt>相关战队</dt><dd><WikiJoin slugs={meme.teams} kind="team" /></dd></div> : null}
              {meme.events.length ? <div><dt>相关赛事</dt><dd><WikiJoin slugs={meme.events} kind="event" /></dd></div> : null}
              <div>
                <dt>分类</dt>
                <dd>
                  {meme.tags.length
                    ? meme.tags.map((tag, index) => {
                        const topic = getTopicForTag(tag);
                        return (
                          <Fragment key={tag}>
                            {index > 0 ? "、" : null}
                            <Link className="wiki-tag" href={topic ? `/topics/${topic.slug}` : `/memes?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
                          </Fragment>
                        );
                      })
                    : "—"}
                </dd>
              </div>
            </dl>
          </MemeInfobox>

          <div className="wiki-main">
            <nav className="wiki-page-nav" aria-label="本页内容">
              <span>本页内容</span>
              <a href="#meme-body">释义</a>
              {meme.timeline?.length ? <a href="#meme-timeline">演变</a> : null}
              <a href="#meme-sources">参考来源</a>
              {related.length ? <a href="#meme-related">相关梗</a> : null}
            </nav>
            <MemeArticle key={meme.slug} slug={meme.slug} sources={meme.sources}>
              <MDXRemote source={meme.body} />
            </MemeArticle>

            {meme.timeline?.length ? (
              <section id="meme-timeline" className="wiki-detail-section" aria-labelledby="meme-timeline-title">
                <h2 id="meme-timeline-title" className="wiki-h">演变</h2>
                <ul className="wiki-timeline">
                  {meme.timeline.map((item) => (
                    <li key={`${item.year}-${item.title}`}>
                      {/^\d{4}(?:-\d{2}){0,2}$/.test(item.year)
                        ? <time className="wiki-timeline-date" dateTime={item.year}>{item.year}</time>
                        : <span className="wiki-timeline-date">{item.year}</span>}
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section id="meme-sources" className="wiki-detail-section" aria-labelledby="meme-sources-title">
              <h2 id="meme-sources-title" className="wiki-h">参考来源</h2>
              {meme.sources.length ? (
                <ol className="wiki-refs">
                  {meme.sources.map((source, index) => (
                    <li key={source.title}>
                      {source.kind ? `${sourceKindLabel[source.kind] ?? source.kind}：` : null}
                      {source.url ? (
                        <TrackedSourceLink
                          memeSlug={meme.slug}
                          position={index + 1}
                          source={{ ...source, url: source.url }}
                        />
                      ) : (
                        source.title
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="wiki-empty">出处尚无可靠记录，当前只记录已知社区用法。</p>
              )}
              {meme.source_note ? <p className="wiki-note">编辑注：{meme.source_note}</p> : null}
            </section>

            <MemeContinueReading
              currentSlug={meme.slug}
              items={related.map((entry) => ({
                slug: entry.slug,
                title: entry.title,
                summary: entry.summary,
              }))}
            />
          </div>
        </div>

        <footer className="wiki-cats">
          {meme.tags.length ? (
            <p>
              <span>分类：</span>
              {meme.tags.map((tag, index) => {
                const topic = getTopicForTag(tag);
                return (
                  <Fragment key={tag}>
                    {index > 0 ? "、" : null}
                    <Link href={topic ? `/topics/${topic.slug}` : `/memes?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
                  </Fragment>
                );
              })}
            </p>
          ) : null}
        </footer>
      </div>
    </article>
  );
}
