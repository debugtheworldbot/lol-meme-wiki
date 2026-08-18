import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { AlertTriangle, ArrowLeft, ArrowUpRight, CalendarDays, ExternalLink, FileQuestion, Link2, UserRound } from "lucide-react";
import { MemeCard } from "@/components/meme-card";
import { getEntityTitle, getMeme, getMemes, getRelatedMemes } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { formatDate, getIssueUrl } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getMemes().map((meme) => ({ slug: meme.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meme = getMeme(slug);
  if (!meme) return {};
  const description = meme.summary.length > 155 ? `${meme.summary.slice(0, 152)}…` : meme.summary;
  return {
    title: `${meme.title} 是什么梗？出处和含义`,
    description,
    alternates: { canonical: `/meme/${meme.slug}` },
    openGraph: { type: "article", title: `${meme.title} 是什么梗？出处和含义`, description, url: `/meme/${meme.slug}`, modifiedTime: meme.updated_at },
  };
}

export default async function MemeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const meme = getMeme(slug);
  if (!meme) notFound();
  const related = getRelatedMemes(meme);
  const issueUrl = getIssueUrl(meme.title, `/meme/${meme.slug}`);
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
    <article className="detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="detail-hero">
        <div className="page-shell">
          <Link className="back-link" href="/memes"><ArrowLeft size={15} /> 返回梗目录</Link>
          <div className="detail-hero-grid">
            <div className="detail-title">
              <div className="detail-label"><span>MEME FILE</span><b>#{meme.slug.toUpperCase()}</b></div>
              <h1>{meme.title}</h1>
              {meme.aliases?.length ? <p className="aliases">又称：{meme.aliases.join(" / ")}</p> : null}
              <p className="answer">{meme.summary}</p>
              <div className="detail-tags">{meme.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <aside className="fact-sheet">
              <div className="fact-stamp">VERIFIED<br /><strong>ENTRY</strong></div>
              <dl>
                <div><dt><CalendarDays size={15} /> 首次出现</dt><dd>{formatDate(meme.first_seen)}</dd></div>
                <div><dt><UserRound size={15} /> 相关人物</dt><dd>{meme.players.length ? meme.players.map((item) => <Link key={item} href={`/player/${item}`}>{getEntityTitle("player", item)}</Link>) : "—"}</dd></div>
                <div><dt>◇ 相关战队</dt><dd>{meme.teams.length ? meme.teams.map((item) => <Link key={item} href={`/team/${item}`}>{getEntityTitle("team", item)}</Link>) : "—"}</dd></div>
                <div><dt>◎ 相关赛事</dt><dd>{meme.events.length ? meme.events.map((item) => <Link key={item} href={`/event/${item}`}>{getEntityTitle("event", item)}</Link>) : "—"}</dd></div>
              </dl>
              <small>最后更新 {meme.updated_at ?? "—"}</small>
            </aside>
          </div>
        </div>
      </header>

      <div className="page-shell detail-layout section-pad">
        <div className="detail-main">
          <section className="article-section" id="meaning">
            <div className="article-section-number">01</div>
            <div><p className="eyebrow">MEANING & CONTEXT</p><h2>梗的含义</h2><div className="wiki-prose"><MDXRemote source={meme.body} /></div></div>
          </section>

          <section className="article-section source-section" id="sources">
            <div className="article-section-number">02</div>
            <div>
              <p className="eyebrow">PRIMARY SOURCES</p><h2>出处与证据</h2>
              {meme.sources.length ? (
                <div className="source-list">{meme.sources.map((source, index) => source.url ? (
                  <a key={source.title} href={source.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><div><small>{source.kind ?? "source"}</small><strong>{source.title}</strong></div><ExternalLink size={17} /></a>
                ) : (
                  <div className="source-row" key={source.title}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{source.kind ?? "source"}</small><strong>{source.title}</strong></div><FileQuestion size={17} /></div>
                ))}</div>
              ) : <div className="source-missing"><AlertTriangle size={19} /><div><strong>出处尚无可靠记录</strong><p>当前版本只记录已知社区用法，不补写无法核实的起点。</p></div></div>}
              {meme.source_note ? <p className="source-note">编辑注：{meme.source_note}</p> : null}
            </div>
          </section>

          {meme.timeline?.length ? (
            <section className="article-section" id="timeline">
              <div className="article-section-number">03</div>
              <div><p className="eyebrow">EVOLUTION LOG</p><h2>演变时间线</h2><div className="timeline">{meme.timeline.map((item) => <div key={`${item.year}-${item.title}`}><time>{item.year}</time><i /><section><h3>{item.title}</h3><p>{item.description}</p></section></div>)}</div></div>
            </section>
          ) : null}
        </div>
        <aside className="detail-toc">
          <p>词条索引</p><a href="#meaning">含义与语境 <span>01</span></a><a href="#sources">出处与证据 <span>02</span></a>{meme.timeline?.length ? <a href="#timeline">演变时间线 <span>03</span></a> : null}
          <div><Link href={issueUrl}><Link2 size={15} /> 补充 / 纠错</Link><small>发现错误？帮助我们让档案更准确。</small></div>
        </aside>
      </div>

      {related.length ? (
        <section className="related-section section-pad">
          <div className="page-shell"><header className="section-header compact"><div><p className="eyebrow">KEEP EXPLORING</p><h2>顺着这条线继续看</h2></div><p>相关梗是这份档案的下一条线索。</p></header><div className="meme-grid related-grid">{related.slice(0, 4).map((entry, index) => <MemeCard key={entry.slug} meme={entry} index={index + 1} />)}</div></div>
        </section>
      ) : null}

      <section className="correction-strip">
        <div className="page-shell"><div><span>信息不是最终版</span><h2>发现错误，或者有新的出处？</h2></div><Link className="button-primary" href={issueUrl}>补充 / 纠错 <ArrowUpRight size={18} /></Link></div>
      </section>
    </article>
  );
}
