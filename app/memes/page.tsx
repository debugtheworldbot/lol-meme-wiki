import type { Metadata } from "next";
import { Suspense } from "react";
import { MemeExplorer } from "@/components/meme-explorer";
import { RandomMemeButton } from "@/components/random-meme-button";
import { getMemes } from "@/lib/content";

export const metadata: Metadata = {
  title: "全部 LOL 梗",
  description: "浏览 LOL 梗 Wiki 收录的英雄联盟与电竞社区梗，按名称、别名与类型快速筛选。",
  alternates: { canonical: "/memes" },
};

export default function MemesPage() {
  const memes = getMemes();
  return (
    <div className="directory-page page-shell section-pad">
      <header className="directory-header">
        <div><p className="eyebrow">MEME DIRECTORY / {memes.length.toString().padStart(3, "0")}</p><h1>全部梗</h1><p>从数字黑话到名场面，按你记得的任何一个词开始找。</p></div>
        <RandomMemeButton compact slugs={memes.map((meme) => meme.slug)} />
      </header>
      <Suspense fallback={null}>
        <MemeExplorer memes={memes} />
      </Suspense>
    </div>
  );
}
