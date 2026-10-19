import type { Metadata } from "next";
import Link from "next/link";
import { MemeExplorer } from "@/components/meme-explorer";
import { RandomMemeButton } from "@/components/random-meme-button";
import { getMemeListItems } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { topicDefinitions } from "@/lib/topics";
import { DirectoryNavigation } from "@/components/entity-directory";

export const metadata: Metadata = {
  title: "全部 LOL 梗",
  description: "浏览研发.lol 收录的英雄联盟与电竞社区梗，按梗名、别名和关键词检索，或通过游戏梗、赛事梗、英雄台词等分类筛选。支持常见优先与最近更新排序，每条结果提供简短解释，点击可继续查看出处、比赛背景和使用语境。还可以沿相关选手、战队、赛事与专题发现其他词条，查清数字、外号和弹幕半句话的意思；找不到时可清除筛选或提交新梗线索。",
  alternates: { canonical: "/memes" },
};

export default function MemesPage() {
  const memes = getMemeListItems();
  // 选手专题按 players 聚合，只在专题导航中展示，不作为 tag 筛选。
  const canonicalTags = topicDefinitions.filter((topic) => !topic.player).map((topic) => topic.tag);
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "梗目录", path: "/memes" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">梗目录</li></ol>
        </nav>
        <header className="wiki-head dir-head">
          <div>
            <h1>全部梗</h1>
            <p className="wiki-meta">查梗名、别名和关键词，也可以按类型慢慢找。</p>
          </div>
          <RandomMemeButton compact slugs={memes.map((meme) => meme.slug)} />
        </header>
        <DirectoryNavigation current="/memes" />
        <MemeExplorer memes={memes} canonicalTags={canonicalTags} />
      </div>
    </article>
  );
}
