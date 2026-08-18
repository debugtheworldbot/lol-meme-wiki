import Link from "next/link";
import { Fragment } from "react";
import { InlineSearch } from "@/components/inline-search";
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
  const popular = [...memes].sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0)).slice(0, 8);
  const latest = [...memes].sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? "")).slice(0, 8);
  const tags = [...new Set(memes.flatMap((meme) => meme.tags))].slice(0, 12);
  const typeCounts = [
    { tag: "游戏梗", suffix: "条" },
    { tag: "赛事梗", suffix: "条" },
    { tag: "英雄台词", suffix: "条" },
  ].map((item) => ({
    ...item,
    count: memes.filter((meme) => meme.tags.includes(item.tag)).length,
  }));

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
    <div className="wiki-page wiki-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>LOL 梗 Wiki</h1>
          <p className="wiki-meta">{siteConfig.description}</p>
        </header>

        <div className="home-search">
          <InlineSearch records={records} />
          <RandomMemeButton compact slugs={memes.map((meme) => meme.slug)} />
        </div>
        {popular.length ? (
          <p className="home-hotwords">
            <span>热门：</span>
            {popular.slice(0, 6).map((meme, index) => (
              <Fragment key={meme.slug}>
                {index > 0 ? "、" : null}
                <Link href={`/meme/${meme.slug}`}>{meme.title}</Link>
              </Fragment>
            ))}
          </p>
        ) : null}

        <div className="home-top">
          {featured ? (
            <section>
              <h2 className="wiki-h">推荐词条</h2>
              <p className="wiki-lead">
                <Link href={`/meme/${featured.slug}`}>{featured.title}</Link>
                {featured.summary ? `：${featured.summary}` : null}
              </p>
              {featured.tags.length ? (
                <p className="wiki-note">
                  分类：
                  {featured.tags.map((tag, index) => (
                    <Fragment key={tag}>
                      {index > 0 ? "、" : null}
                      <span className="wiki-tag">{tag}</span>
                    </Fragment>
                  ))}
                  {featured.first_seen ? ` · 首次出现 ${featured.first_seen}` : null}
                </p>
              ) : null}
            </section>
          ) : <div />}
          <aside className="wiki-infobox">
            <div className="wiki-infobox-title">LOL 梗 Wiki</div>
            <table>
              <tbody>
                <tr><th>类型</th><td>社区百科</td></tr>
                <tr><th>梗</th><td><Link href="/memes">{memes.length} 条</Link></td></tr>
                {typeCounts.map((item) => (
                  <tr key={item.tag}>
                    <th>{item.tag}</th>
                    <td>
                      <Link href={`/memes?tag=${encodeURIComponent(item.tag)}`}>
                        {item.count} {item.suffix}
                      </Link>
                    </td>
                  </tr>
                ))}
                <tr><th>选手</th><td><Link href="/players">{players.length} 人</Link></td></tr>
                <tr><th>战队</th><td><Link href="/teams">{teams.length} 支</Link></td></tr>
                <tr><th>赛事</th><td><Link href="/events">{events.length} 项</Link></td></tr>
              </tbody>
            </table>
          </aside>
        </div>

        <div className="wiki-main">
            <div className="home-split">
              <section>
                <h2 className="wiki-h">热门梗</h2>
                <ol className="home-list">
                  {popular.map((meme) => (
                    <li key={meme.slug}>
                      <Link href={`/meme/${meme.slug}`}>{meme.title}</Link>
                      <span>{meme.summary}</span>
                    </li>
                  ))}
                </ol>
                <p className="home-more"><Link href="/memes">全部梗</Link></p>
              </section>
              <section>
                <h2 className="wiki-h">最新收录</h2>
                <ul className="home-list">
                  {latest.map((meme) => (
                    <li key={meme.slug}>
                      {meme.updated_at ? <time>{meme.updated_at}</time> : null}
                      <Link href={`/meme/${meme.slug}`}>{meme.title}</Link>
                      <span>{meme.summary}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section>
              <h2 className="wiki-h">分类</h2>
              <div className="home-cats">
                <div>
                  <strong>选手</strong>
                  <p>
                    {players.slice(0, 8).map((entry, index) => (
                      <Fragment key={entry.slug}>
                        {index > 0 ? "、" : null}
                        <Link href={`/player/${entry.slug}`}>{entry.title}</Link>
                      </Fragment>
                    ))}
                    {players.length > 8 ? "…" : null}
                    {" "}
                    <Link className="home-more" href="/players">全部</Link>
                  </p>
                </div>
                <div>
                  <strong>战队</strong>
                  <p>
                    {teams.slice(0, 8).map((entry, index) => (
                      <Fragment key={entry.slug}>
                        {index > 0 ? "、" : null}
                        <Link href={`/team/${entry.slug}`}>{entry.title}</Link>
                      </Fragment>
                    ))}
                    {teams.length > 8 ? "…" : null}
                    {" "}
                    <Link className="home-more" href="/teams">全部</Link>
                  </p>
                </div>
                <div>
                  <strong>赛事</strong>
                  <p>
                    {events.slice(0, 8).map((entry, index) => (
                      <Fragment key={entry.slug}>
                        {index > 0 ? "、" : null}
                        <Link href={`/event/${entry.slug}`}>{entry.title}</Link>
                      </Fragment>
                    ))}
                    {events.length > 8 ? "…" : null}
                    {" "}
                    <Link className="home-more" href="/events">全部</Link>
                  </p>
                </div>
              </div>
            </section>
        </div>

        <footer className="wiki-cats">
          {tags.length ? (
            <p>
              <span>分类：</span>
              {tags.map((tag, index) => (
                <Fragment key={tag}>
                  {index > 0 ? "、" : null}
                  <Link href={`/memes?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
                </Fragment>
              ))}
            </p>
          ) : null}
          <p>
            <span>找不到？</span>
            <Link href="/submit">提交新梗</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
