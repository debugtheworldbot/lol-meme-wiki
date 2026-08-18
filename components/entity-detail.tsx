import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MemeCard } from "@/components/meme-card";
import { getEntity, getMemesForEntity } from "@/lib/content";
import type { EntityKind } from "@/lib/types";

const config = {
  player: { label: "选手档案", en: "PLAYER FILE", list: "/players" },
  team: { label: "战队档案", en: "TEAM FILE", list: "/teams" },
  event: { label: "赛事档案", en: "EVENT FILE", list: "/events" },
} as const;

export function EntityDetail({ kind, slug }: { kind: Exclude<EntityKind, "meme">; slug: string }) {
  const entry = getEntity(kind, slug);
  if (!entry) notFound();
  const memes = getMemesForEntity(kind, slug);
  const meta = config[kind];
  return (
    <article className="entity-detail-page">
      <header className="entity-detail-hero">
        <div className="page-shell">
          <Link className="back-link" href={meta.list}><ArrowLeft size={15} /> 返回{meta.label}</Link>
          <div className="entity-detail-grid">
            <div><p className="eyebrow">{meta.en} / {entry.region ?? "GLOBAL"}</p><h1>{entry.title}</h1>{entry.display_name ? <p className="entity-display-name">{entry.display_name}</p> : null}<p>{entry.summary}</p></div>
            <div className="entity-count"><strong>{memes.length.toString().padStart(2, "0")}</strong><span>相关梗<br />已归档</span><small>{entry.active_years ?? entry.region ?? "社区档案"}</small></div>
          </div>
        </div>
      </header>
      <div className="page-shell section-pad entity-body">
        <section><p className="eyebrow">PROFILE</p><h2>档案说明</h2><div className="wiki-prose"><MDXRemote source={entry.body} /></div></section>
        <section><header className="section-header compact"><div><p className="eyebrow">CONNECTED MEMES</p><h2>相关梗</h2></div><span className="count-badge">{memes.length} 条连接</span></header>{memes.length ? <div className="meme-grid">{memes.map((meme, index) => <MemeCard key={meme.slug} meme={meme} index={index + 1} />)}</div> : <div className="directory-empty"><strong>还没有关联梗。</strong><span>你可以提交第一条线索。</span><Link href="/submit">提交新梗 <ArrowUpRight size={16} /></Link></div>}</section>
      </div>
    </article>
  );
}
