import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getEntity, getMemesForEntity } from "@/lib/content";
import type { EntityKind } from "@/lib/types";
import { buildBreadcrumbJsonLd, buildEntityJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { CorrectionDialog } from "@/components/correction-dialog";
import { MemeInfobox } from "@/components/meme-infobox";

const config = {
  player: { label: "选手", list: "/players" },
  team: { label: "战队", list: "/teams" },
  event: { label: "赛事", list: "/events" },
} as const;

export function EntityDetail({ kind, slug }: { kind: Exclude<EntityKind, "meme">; slug: string }) {
  const entry = getEntity(kind, slug);
  if (!entry) notFound();
  const memes = getMemesForEntity(kind, slug);
  const meta = config[kind];

  return (
    <article className="wiki-page wiki-detail-page">
      <JsonLd data={buildEntityJsonLd(kind, entry)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "首页", path: "/" },
          { name: meta.label, path: meta.list },
          { name: entry.title, path: `/${kind}/${slug}` },
        ])}
      />
      <div className="wiki-shell">
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li><Link href={meta.list}>{meta.label}</Link></li>
            <li aria-current="page">{entry.title}</li>
          </ol>
          <div className="wiki-tools">
            <CorrectionDialog title={entry.title} pathname={`/${kind}/${slug}`} />
          </div>
        </nav>

        <header className="wiki-head">
          <h1>{entry.title}</h1>
          <p className="wiki-meta">
            <span>{meta.label}</span>
            {entry.display_name ? <span>{entry.display_name}</span> : null}
            {entry.updated_at ? <span>更新于 <time dateTime={entry.updated_at}>{entry.updated_at}</time></span> : null}
          </p>
        </header>

        <div className="wiki-layout meme-layout">
          <div className="meme-intro wiki-intro">
            <p className="wiki-lead">{entry.summary}</p>
          </div>

          <MemeInfobox title={entry.title} label={`${meta.label}资料`}>
            <dl className="wiki-infobox-facts">
              <div><dt>类型</dt><dd>{meta.label}</dd></div>
              {entry.display_name ? <div><dt>常用名</dt><dd>{entry.display_name}</dd></div> : null}
              {entry.aliases?.length ? <div><dt>又称</dt><dd>{entry.aliases.join("、")}</dd></div> : null}
              {entry.region ? <div><dt>{kind === "event" ? "范围" : "赛区"}</dt><dd>{entry.region}</dd></div> : null}
              {entry.active_years ? <div><dt>{kind === "event" ? "举办时间" : "活跃时间"}</dt><dd>{entry.active_years}</dd></div> : null}
              <div><dt>相关梗</dt><dd><a href="#entity-memes">{memes.length} 条</a></dd></div>
            </dl>
          </MemeInfobox>

          <div className="wiki-main">
            <nav className="wiki-page-nav" aria-label="本页内容">
              <span>本页内容</span>
              <a href="#entity-background">背景介绍</a>
              <a href="#entity-memes">相关梗（{memes.length}）</a>
            </nav>

            <section id="entity-background" className="wiki-detail-section" aria-labelledby="entity-background-title">
              <h2 id="entity-background-title" className="wiki-h">背景介绍</h2>
              <div className="wiki-prose">
                <MDXRemote source={entry.body} />
              </div>
            </section>

            <section id="entity-memes" className="wiki-detail-section" aria-labelledby="entity-memes-title">
              <h2 id="entity-memes-title" className="wiki-h">相关梗 <span className="wiki-section-count">{memes.length}</span></h2>
              {memes.length ? (
                <ul className="wiki-related">
                  {memes.map((meme) => (
                    <li key={meme.slug}>
                      <Link href={`/meme/${meme.slug}`}>{meme.title}</Link>
                      <span>{meme.summary}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="wiki-empty">
                  还没有关联梗。<Link href="/submit">提交一条</Link>
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
