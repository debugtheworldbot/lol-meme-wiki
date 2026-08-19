import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getEntity, getMemesForEntity } from "@/lib/content";
import type { EntityKind } from "@/lib/types";
import { buildBreadcrumbJsonLd, buildEntityJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { CorrectionDialog } from "@/components/correction-dialog";

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
    <article className="wiki-page">
      <JsonLd data={buildEntityJsonLd(kind, entry)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "首页", path: "/" },
          { name: meta.label, path: meta.list },
          { name: entry.title, path: `/${kind}/${slug}` },
        ])}
      />
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>{entry.title}</h1>
          <p className="wiki-meta">
            {entry.display_name ? <span>{entry.display_name}</span> : null}
            {entry.aliases?.length ? <span>又称：{entry.aliases.join(" / ")}</span> : null}
            {entry.updated_at ? <span>更新日期：{entry.updated_at}</span> : null}
          </p>
        </header>

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

        <div className="wiki-layout">
          <aside className="wiki-infobox">
            <div className="wiki-infobox-title">{entry.title}</div>
            <table>
              <tbody>
                <tr><th>类型</th><td>{meta.label}</td></tr>
                {entry.display_name ? <tr><th>常用名</th><td>{entry.display_name}</td></tr> : null}
                {entry.aliases?.length ? <tr><th>又称</th><td>{entry.aliases.join("、")}</td></tr> : null}
                <tr><th>赛区</th><td>{entry.region ?? "—"}</td></tr>
                <tr><th>活跃</th><td>{entry.active_years ?? "—"}</td></tr>
                <tr>
                  <th>相关梗</th>
                  <td>
                    {memes.length
                      ? memes.map((meme, index) => (
                          <Fragment key={meme.slug}>
                            {index > 0 ? "、" : null}
                            <Link href={`/meme/${meme.slug}`}>{meme.title}</Link>
                          </Fragment>
                        ))
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </aside>

          <div className="wiki-main">
            <section>
              <h2 className="wiki-h">简介</h2>
              <p className="wiki-lead">{entry.summary}</p>
              <div className="wiki-prose">
                <MDXRemote source={entry.body} />
              </div>
            </section>

            <section>
              <h2 className="wiki-h">相关梗</h2>
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
