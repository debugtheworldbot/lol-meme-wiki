import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MemeExplorer } from "@/components/meme-explorer";
import { RandomMemeButton } from "@/components/random-meme-button";
import { getMemes } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "全部 LOL 梗",
  description: "浏览 研发.lol 收录的英雄联盟与电竞社区梗，按名称、别名与类型快速筛选。",
  alternates: { canonical: "/memes" },
};

export default function MemesPage() {
  const memes = getMemes();
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <header className="wiki-head dir-head">
          <div>
            <h1>全部梗</h1>
            <p className="wiki-meta">共 {memes.length} 条 · 从数字黑话到名场面</p>
          </div>
          <RandomMemeButton compact slugs={memes.map((meme) => meme.slug)} />
        </header>
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "梗目录", path: "/memes" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">梗目录</li>
          </ol>
        </nav>
        <Suspense fallback={null}>
          <MemeExplorer memes={memes} />
        </Suspense>
      </div>
    </article>
  );
}
