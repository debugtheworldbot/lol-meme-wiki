import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { InlineSearch } from "@/components/inline-search";
import { RandomMemeButton } from "@/components/random-meme-button";
import { HomeMemeList } from "@/components/home-meme-lists";
import { JsonLd } from "@/components/json-ld";
import { getMeme, getMemeListItems, getPlayers } from "@/lib/content";
import { getTopic } from "@/lib/topics";
import { siteConfig } from "@/lib/site";
import type { HomeMemeListItem, MemeListItem } from "@/lib/types";

const topicLinks = [
  { slug: "xuanshou-geng", label: "选手外号", description: "一个称呼背后的比赛与故事" },
  { slug: "saishi-geng", label: "赛事名场面", description: "从那场比赛，看到今天的弹幕" },
  { slug: "yingxiong-taici", label: "英雄台词", description: "原句、空耳，还有玩家的改写" },
  { slug: "shuzi-geng", label: "数字梗", description: "把一串数字放回它的语境" },
] as const;

function toHomeItem(meme: MemeListItem): HomeMemeListItem {
  return {
    title: meme.title,
    slug: meme.slug,
    summary: meme.summary,
    first_seen: meme.first_seen,
    collected_at: meme.collected_at,
  };
}

export default function HomePage() {
  const memes = getMemeListItems();
  const latest = [...memes]
    .sort((a, b) => (b.collected_at ?? "").localeCompare(a.collected_at ?? "") || a.title.localeCompare(b.title, "zh-CN"))
    .slice(0, 6)
    .map(toHomeItem);
  // 仅用明确的日期排序，不把“已有传播记录，首发未确认”等说明当成首发日期。
  const chronological = memes
    .filter((meme) => /^\d{4}(?:-\d{2}){0,2}$/.test(meme.first_seen ?? ""))
    .sort((a, b) => b.first_seen!.localeCompare(a.first_seen!) || a.title.localeCompare(b.title, "zh-CN"))
    .slice(0, 6)
    .map(toHomeItem);
  const featured = getMeme("yyds");
  const featuredSource = featured?.sources.find((source) => source.url);
  const examples = ["hongwen", "4396", "wo-chovy"]
    .map((slug) => memes.find((meme) => meme.slug === slug))
    .filter((meme) => meme !== undefined);
  const players = getPlayers();
  const playerLinks = ["uzi", "faker", "bin", "the-shy", "chovy"]
    .map((slug) => players.find((player) => player.slug === slug))
    .filter((player) => player !== undefined);

  return (
    <div className="homepage">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteConfig.url}/memes?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }} />
      <div className="homepage-shell">
        <section className="homepage-intro" aria-labelledby="home-title">
          <div className="homepage-intro-heading">
            <h1 id="home-title">英雄联盟的梗，查个明白。</h1>
            <Link className="homepage-count" href="/memes">已收录 {memes.length} 条</Link>
          </div>
          <p className="homepage-description">选手外号、赛场名场面、弹幕里的半句话。查含义，也找出处。</p>
          <InlineSearch />
          <div className="homepage-search-foot">
            {examples.length ? (
              <div className="homepage-examples" aria-label="可以从这些梗开始看">
                <span>比如</span>
                {examples.map((meme) => <Link key={meme.slug} href={`/meme/${meme.slug}`}>{meme.title}</Link>)}
              </div>
            ) : null}
            <RandomMemeButton compact slugs={memes.map((meme) => meme.slug)} />
          </div>
        </section>

        <div className="homepage-columns">
          <HomeMemeList latest={latest} chronological={chronological} />
          <aside className="homepage-aside" aria-label="推荐阅读与专题">
            {featured ? (
              <section className="homepage-pick" aria-labelledby="home-pick-title">
                <h2 id="home-pick-title">精选词条</h2>
                <h3><Link href={`/meme/${featured.slug}`}>{featured.title}</Link></h3>
                <p>{featured.summary}</p>
                <Link className="homepage-read-link" href={`/meme/${featured.slug}`}>读完整释义</Link>
                {featuredSource?.url ? (
                  <div className="homepage-source">
                    <span>来源线索</span>
                    <a href={featuredSource.url} target="_blank" rel="noreferrer">
                      {featuredSource.title}<ExternalLink size={13} aria-label="在新窗口打开" />
                    </a>
                  </div>
                ) : null}
              </section>
            ) : null}
            <section className="homepage-topics" aria-labelledby="home-topics-title">
              <div className="homepage-section-heading">
                <h2 id="home-topics-title">顺着专题看</h2>
                <Link href="/topics">全部专题</Link>
              </div>
              <ul>
                {topicLinks.map(({ slug, label, description }) => {
                  if (!getTopic(slug)) return null;
                  return (
                    <li key={slug}>
                      <Link href={`/topics/${slug}`}>{label}</Link>
                      <p>{description}</p>
                    </li>
                  );
                })}
              </ul>
            </section>
            {playerLinks.length ? (
              <section className="homepage-players" aria-labelledby="home-players-title">
                <h2 id="home-players-title">从选手找梗</h2>
                <div>{playerLinks.map((player) => <Link key={player.slug} href={`/player/${player.slug}`}>{player.title}</Link>)}</div>
                <Link className="homepage-read-link" href="/players">全部选手</Link>
              </section>
            ) : null}
          </aside>
        </div>

        <section className="homepage-contribute" aria-labelledby="home-contribute-title">
          <div>
            <h2 id="home-contribute-title">你记得的，也值得留下来。</h2>
            <p>有漏掉的梗，或者更早的出处？带上原帖或视频，一起补全。</p>
          </div>
          <Link href="/submit">提交新梗</Link>
        </section>
      </div>
    </div>
  );
}
