import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getEntity, getEntityTitle, getMeme, getMemes, getRelatedMemes } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildMemeMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { EntityKind, MemeEntry } from "@/lib/types";
import { WikiLinkedText } from "@/components/wiki-linked-text";
import { JsonLd } from "@/components/json-ld";
import { CorrectionDialog } from "@/components/correction-dialog";
import { MemeContinueReading } from "@/components/meme-continue-reading";
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
  const infoboxItemCount = 3
    + Number(meme.players.length > 0)
    + Number(meme.teams.length > 0)
    + Number(meme.events.length > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: meme.title,
    description: meme.summary,
    url: `${siteConfig.url}/meme/${meme.slug}`,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: siteConfig.name, url: siteConfig.url },
    dateModified: meme.updated_at,
  };

  return (
    <article className="wiki-page">
      <JsonLd data={jsonLd} />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "梗目录", path: "/memes" }, { name: meme.title, path: `/meme/${meme.slug}` }])} />
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>{meme.title}</h1>
          <p className="wiki-meta">
            {meme.aliases?.length ? <span>又称：{meme.aliases.join(" / ")}</span> : null}
            {meme.updated_at ? <span>更新日期：{meme.updated_at}</span> : null}
            {meme.first_seen ? <span>首次出现：{meme.first_seen}</span> : null}
          </p>
        </header>

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

        <div className="wiki-layout meme-layout">
          <section className="meme-intro">
            <h2 className="wiki-h">背景介绍</h2>
            <p className="wiki-lead">
              <WikiLinkedText text={meme.summary} terms={terms} />
            </p>
          </section>

          <MemeInfobox
            title={meme.title}
            itemCount={infoboxItemCount}
            quickLinks={quickFacts.map((fact) => (
              <span key={`${fact.kind}-${fact.slug}`}>
                <WikiJoin slugs={[fact.slug]} kind={fact.kind} />
              </span>
            ))}
          >
            <table>
              <tbody>
                <tr><th>类型</th><td>梗</td></tr>
                <tr><th>出处</th><td>{meme.first_seen ?? "社区流传"}</td></tr>
                {meme.players.length ? <tr><th>相关人物</th><td><WikiJoin slugs={meme.players} kind="player" /></td></tr> : null}
                {meme.teams.length ? <tr><th>相关战队</th><td><WikiJoin slugs={meme.teams} kind="team" /></td></tr> : null}
                {meme.events.length ? <tr><th>相关赛事</th><td><WikiJoin slugs={meme.events} kind="event" /></td></tr> : null}
                <tr>
                  <th>TAG标签</th>
                  <td>
                    {meme.tags.length
                      ? meme.tags.map((tag, index) => (
                          <Fragment key={tag}>
                            {index > 0 ? "、" : null}
                            <Link className="wiki-tag" href={`/memes?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
                          </Fragment>
                        ))
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </MemeInfobox>

          <div className="wiki-main">
            <div className="wiki-prose">
              <MDXRemote source={meme.body} />
            </div>
            <MemeContinueReading
              currentSlug={meme.slug}
              items={related.slice(0, 4).map((entry) => ({
                slug: entry.slug,
                title: entry.title,
                summary: entry.summary,
              }))}
            />

            {meme.timeline?.length ? (
              <section>
                <h2 className="wiki-h">演变</h2>
                <ul className="wiki-timeline">
                  {meme.timeline.map((item) => (
                    <li key={`${item.year}-${item.title}`}>
                      <time>{item.year}</time>
                      <div>
                        <strong>{item.title}</strong>
                        {item.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2 className="wiki-h">参考</h2>
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
          {related.length ? (
            <p>
              <span>参见：</span>
              {related.map((entry, index) => (
                <Fragment key={entry.slug}>
                  {index > 0 ? "、" : null}
                  <Link href={`/meme/${entry.slug}`}>{entry.title}</Link>
                </Fragment>
              ))}
            </p>
          ) : null}
        </footer>
      </div>
    </article>
  );
}
