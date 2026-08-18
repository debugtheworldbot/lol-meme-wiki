import Link from "next/link";
import { ArrowDown, ArrowUpRight, Asterisk, Crosshair, Radio, Sparkles } from "lucide-react";
import { InlineSearch } from "@/components/inline-search";
import { MemeCard } from "@/components/meme-card";
import { RandomMemeButton } from "@/components/random-meme-button";
import { getEvents, getMemes, getPlayers, getSearchRecords, getTeams } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  const memes = getMemes();
  const records = getSearchRecords();
  const players = getPlayers();
  const teams = getTeams();
  const events = getEvents();
  const featured = memes.find((meme) => meme.featured) ?? memes[0];
  const popular = [...memes].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0)).slice(0, 6);
  const latest = [...memes].sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? "")).slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LOL 梗 Wiki",
    description: "英雄联盟与电竞社区梗文化档案",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/memes?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero-section">
        <div className="hero-grid page-shell">
          <div className="hero-copy reveal-1">
            <div className="hero-kicker"><span><Radio size={13} /> 社区协作档案</span><b>ARCHIVE / 001</b></div>
            <h1><span>LOL</span> 梗<br /><em>Wiki</em><sup>®</sup></h1>
            <p className="hero-description">记录英雄联盟以及电竞社区里，<strong>那些莫名其妙但大家都懂的东西。</strong></p>
            <InlineSearch records={records} />
            <div className="hero-hotwords">
              <span>大家正在查</span>
              {popular.slice(0, 5).map((meme) => <Link key={meme.slug} href={`/meme/${meme.slug}`}>{meme.title}</Link>)}
            </div>
          </div>
          <aside className="hero-aside reveal-2" aria-label="Wiki 数据概览">
            <div className="hero-number-bg">4396</div>
            <div className="live-label"><i /> LIVE INDEX</div>
            <div className="hero-stat-main"><strong>{memes.length.toString().padStart(3, "0")}</strong><span>已收录<br />社区梗</span></div>
            <div className="hero-mini-stats">
              <p><span>选手档案</span><b>{players.length.toString().padStart(2, "0")}</b></p>
              <p><span>战队档案</span><b>{teams.length.toString().padStart(2, "0")}</b></p>
              <p><span>赛事节点</span><b>{events.length.toString().padStart(2, "0")}</b></p>
            </div>
            <RandomMemeButton slugs={memes.map((meme) => meme.slug)} />
          </aside>
        </div>
        <div className="hero-scroll"><ArrowDown size={16} /> 沿关系继续浏览</div>
      </section>

      {featured ? (
        <section className="feature-section page-shell section-pad">
          <header className="section-header">
            <div><p className="eyebrow"><Crosshair size={14} /> 今日档案</p><h2>从一个数字，<br />进入一段社区记忆。</h2></div>
            <p>不止解释“是什么意思”，还原出处、事件与后来发生的一切。</p>
          </header>
          <Link className="archive-feature" href={`/meme/${featured.slug}`}>
            <div className="archive-code"><span>CASE</span><strong>{featured.title}</strong><small>NO. 0001</small></div>
            <div className="archive-copy">
              <div className="archive-tags">{featured.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <h3>{featured.title} 是什么梗？</h3>
              <p>{featured.summary}</p>
              <div className="archive-meta">
                <span><small>首次出现</small>{featured.first_seen ?? "待考"}</span>
                <span><small>关联节点</small>{featured.players.length + featured.teams.length + featured.events.length + featured.related.length} 个</span>
                <b>打开完整档案 <ArrowUpRight size={18} /></b>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="popular-section section-pad">
        <div className="page-shell">
          <header className="section-header compact">
            <div><p className="eyebrow"><Sparkles size={14} /> 热门梗</p><h2>社区热搜榜</h2></div>
            <Link className="arrow-link" href="/memes">查看全部词条 <ArrowUpRight size={17} /></Link>
          </header>
          <div className="meme-grid">
            {popular.map((meme, index) => <MemeCard key={meme.slug} meme={meme} index={index + 1} featured={index === 0} />)}
          </div>
        </div>
      </section>

      <section className="graph-section page-shell section-pad">
        <header className="section-header compact">
          <div><p className="eyebrow"><Asterisk size={14} /> 关系入口</p><h2>一个梗，从来不是孤岛。</h2></div>
          <p>从选手、战队和赛事切入，顺着内部链接继续逛。</p>
        </header>
        <div className="entity-columns">
          <div className="entity-column">
            <div className="entity-column-title"><span>PLAYERS</span><b>选手</b><small>{players.length}</small></div>
            {players.slice(0, 5).map((entry) => <Link key={entry.slug} href={`/player/${entry.slug}`}><span>{entry.title}</span><small>{entry.display_name ?? entry.region}</small><ArrowUpRight size={16} /></Link>)}
            <Link className="column-more" href="/players">全部选手 →</Link>
          </div>
          <div className="entity-column accent-column">
            <div className="entity-column-title"><span>TEAMS</span><b>战队</b><small>{teams.length}</small></div>
            {teams.slice(0, 5).map((entry) => <Link key={entry.slug} href={`/team/${entry.slug}`}><span>{entry.title}</span><small>{entry.region}</small><ArrowUpRight size={16} /></Link>)}
            <Link className="column-more" href="/teams">全部战队 →</Link>
          </div>
          <div className="entity-column">
            <div className="entity-column-title"><span>EVENTS</span><b>赛事</b><small>{events.length}</small></div>
            {events.slice(0, 5).map((entry) => <Link key={entry.slug} href={`/event/${entry.slug}`}><span>{entry.title}</span><small>{entry.active_years}</small><ArrowUpRight size={16} /></Link>)}
            <Link className="column-more" href="/events">全部赛事 →</Link>
          </div>
        </div>
      </section>

      <section className="latest-section section-pad">
        <div className="page-shell latest-grid">
          <div className="latest-heading"><p className="eyebrow">RECENTLY FILED</p><h2>最新收录</h2><p>每一次补充，都是社区共同写下的一小段历史。</p></div>
          <div className="latest-list">
            {latest.map((meme, index) => (
              <Link key={meme.slug} href={`/meme/${meme.slug}`}>
                <span className="latest-no">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{meme.title}</strong><small>{meme.summary}</small></div>
                <time>{meme.updated_at?.slice(5).replace("-", ".")}</time><ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="submit-cta">
        <div className="page-shell submit-cta-inner">
          <div><p>这个梗居然没有？</p><h2>把你知道的，<em>留在档案里。</em></h2></div>
          <div><p>投稿会进入 GitHub Issues，由维护者核对来源后收录。无需注册，也不会直接修改正式内容。</p><Link className="button-primary large" href="/submit">提交新梗 <ArrowUpRight size={20} /></Link></div>
        </div>
      </section>
    </>
  );
}
