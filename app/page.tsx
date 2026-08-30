/* 赛后公报室：首页以不对称档案首屏、朱砂索引与高密度可读信息为核心。 */
import Link from "next/link";
import { Fragment } from "react";
import { ArrowUpRight, BookOpenText, CircleDot, Layers3 } from "lucide-react";
import { InlineSearch } from "@/components/inline-search";
import { RandomMemeButton } from "@/components/random-meme-button";
import { getEvents, getMemeListItems, getPlayers, getSearchRecords, getTeams } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { HomeMemeList } from "@/components/home-meme-lists";
import { getTopicForTag } from "@/lib/topics";
import type { HomeMemeListItem, MemeListItem } from "@/lib/types";

function toHomeMemeListItem(meme: MemeListItem): HomeMemeListItem {
  return {
    title: meme.title,
    slug: meme.slug,
    summary: meme.summary,
    first_seen: meme.first_seen,
    updated_at: meme.updated_at,
  };
}

export default function HomePage() {
  const memes = getMemeListItems();
  const records = getSearchRecords();
  const players = getPlayers();
  const teams = getTeams();
  const events = getEvents();
  const popular = [...memes].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
  const homeMemeListItems = memes.map(toHomeMemeListItem);
  /* 初见只认 YYYY / YYYY-MM 这类可比较写法；“更早”等未定时间沉到时间线末尾，不占头部。 */
  const datedFirstSeen = (value?: string) => (/^\d{4}/.test(value ?? "") ? (value as string) : "");
  const chronological = [...homeMemeListItems].sort((a, b) => datedFirstSeen(b.first_seen).localeCompare(datedFirstSeen(a.first_seen)));
  const latest = [...homeMemeListItems].sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  const tags = [...new Set(memes.flatMap((meme) => meme.tags))].slice(0, 12);
  const typeCounts = [
    { tag: "游戏梗", suffix: "条" },
    { tag: "赛事梗", suffix: "条" },
    { tag: "英雄台词", suffix: "条" },
  ].map((item) => ({ ...item, count: memes.filter((meme) => meme.tags.includes(item.tag)).length }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "研发.lol",
    url: siteConfig.url,
    description: "英雄联盟与电竞社区梗文化档案",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/memes?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="wiki-page wiki-home">
      <JsonLd data={jsonLd} />
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-bg" aria-hidden="true" />
        <div className="wiki-shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-kicker"><CircleDot size={13} /> 赛后公报室 · 持续归档</p>
            <p className="home-hero-index">ARCHIVE / 2026 · 01</p>
            <h1 id="home-title">把赛后的<br /><em>复读句</em>找回来。</h1>
            <p className="home-hero-description">从名场面到弹幕暗号，记录英雄联盟社区里那些<strong>大家都懂</strong>的瞬间，也把它们的出处和语境保留下来。</p>
            <div className="home-search home-hero-search">
              <InlineSearch records={records} />
              <RandomMemeButton compact slugs={memes.map((meme) => meme.slug)} />
            </div>
            {popular.length ? (
              <div className="home-hotwords" aria-label="热门词条">
                <span>此刻在刷</span>
                {popular.slice(0, 6).map((meme) => <Link key={meme.slug} href={`/meme/${meme.slug}`}>{meme.title}</Link>)}
              </div>
            ) : null}
          </div>

          <aside className="home-hero-ledger" aria-label="站点资料概览">
            <div className="ledger-stamp"><BookOpenText size={20} /><span>MEME<br />DOSSIER</span></div>
            <div className="ledger-topline"><span>本期卷宗</span><span>2026.08</span></div>
            <div className="ledger-total"><strong>{memes.length}</strong><span>条可追溯词条</span></div>
            <div className="ledger-lines">
              <p><span>赛事叙事</span><b>{typeCounts.find((item) => item.tag === "赛事梗")?.count ?? 0}</b></p>
              <p><span>选手档案</span><b>{players.length}</b></p>
              <p><span>战队坐标</span><b>{teams.length}</b></p>
            </div>
            <Link href="/memes" className="ledger-link">翻阅全部词条 <ArrowUpRight size={15} /></Link>
            <div className="ledger-route" aria-hidden="true"><i /><i /><i /><i /></div>
          </aside>
        </div>
      </section>

      <div className="wiki-shell home-content">
        <section className="home-featured" aria-labelledby="timeline-title">
          <div className="section-label"><span>01 / 时间线</span><p>按初见时间倒着回看，最近发生的复读句排在最前。</p></div>
          <div className="home-top">
            <HomeMemeList headingId="timeline-title" title="按时间排序" description="从刚刚诞生的复读句，倒着回看那些至今仍在被引用的名场面。" memes={chronological} showFirstSeen />
            <aside className="wiki-infobox home-index-card">
              <div className="wiki-infobox-title"><Layers3 size={15} /> 收录索引</div>
              <table><tbody>
                <tr><th>类型</th><td>社区百科</td></tr>
                <tr><th>词条</th><td><Link href="/memes">{memes.length} 条</Link></td></tr>
                {typeCounts.map((item) => {
                  const topic = getTopicForTag(item.tag);
                  return <tr key={item.tag}><th>{item.tag}</th><td><Link href={topic ? `/topics/${topic.slug}` : `/memes?tag=${encodeURIComponent(item.tag)}`}>{item.count} {item.suffix}</Link></td></tr>;
                })}
                <tr><th>选手</th><td><Link href="/players">{players.length} 人</Link></td></tr>
                <tr><th>战队</th><td><Link href="/teams">{teams.length} 支</Link></td></tr>
                <tr><th>赛事</th><td><Link href="/events">{events.length} 项</Link></td></tr>
              </tbody></table>
            </aside>
          </div>
        </section>

        <main className="wiki-main home-main">
          <div className="section-label home-list-label"><span>02 / 归档动态</span><p>追踪站内最近补齐出处、更新语境的词条。</p></div>
          <HomeMemeList columns={2} title="最新收录" description="最近补齐出处、更新语境或刚刚被整理进档案室的词条。" memes={latest} />
          <section className="home-catalogue" aria-labelledby="catalogue-title">
            <div className="section-label"><span>03 / 索引柜</span><p>从人、队伍与赛事三个入口，继续追踪一条梗的来处。</p></div>
            <h2 id="catalogue-title">继续翻阅</h2>
            <div className="home-cats">
              <div><strong>选手档案</strong><p>{players.slice(0, 8).map((entry, index) => <Fragment key={entry.slug}>{index > 0 ? "、" : null}<Link href={`/player/${entry.slug}`}>{entry.title}</Link></Fragment>)}{players.length > 8 ? "…" : null} <Link className="home-more" href="/players">浏览全部 <ArrowUpRight size={13} /></Link></p></div>
              <div><strong>战队档案</strong><p>{teams.slice(0, 8).map((entry, index) => <Fragment key={entry.slug}>{index > 0 ? "、" : null}<Link href={`/team/${entry.slug}`}>{entry.title}</Link></Fragment>)}{teams.length > 8 ? "…" : null} <Link className="home-more" href="/teams">浏览全部 <ArrowUpRight size={13} /></Link></p></div>
              <div><strong>赛事索引</strong><p>{events.slice(0, 8).map((entry, index) => <Fragment key={entry.slug}>{index > 0 ? "、" : null}<Link href={`/event/${entry.slug}`}>{entry.title}</Link></Fragment>)}{events.length > 8 ? "…" : null} <Link className="home-more" href="/events">浏览全部 <ArrowUpRight size={13} /></Link></p></div>
            </div>
          </section>
        </main>

        <footer className="wiki-cats home-tag-footer">
          {tags.length ? <p><span>主题索引</span>{tags.map((tag) => { const topic = getTopicForTag(tag); return <Link key={tag} href={topic ? `/topics/${topic.slug}` : `/memes?tag=${encodeURIComponent(tag)}`}>{tag}</Link>; })}<Link href="/topics">全部专题</Link></p> : null}
          <p><span>没找到想查的？</span><Link href="/submit">提交一份新卷宗 <ArrowUpRight size={14} /></Link></p>
        </footer>
      </div>
    </div>
  );
}
