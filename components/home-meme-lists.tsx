"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { HomeMemeListItem } from "@/lib/types";

const modes = [
  { id: "latest", title: "最新收录", description: "最近加入本站的词条，新梗老梗都有。" },
  { id: "chronological", title: "按出现时间", description: "按已记录的出现时间倒序排列，首发不明的词条请到目录查阅。" },
] as const;

type Mode = typeof modes[number]["id"];

export function HomeMemeList({ latest, chronological }: { latest: HomeMemeListItem[]; chronological: HomeMemeListItem[] }) {
  const [mode, setMode] = useState<Mode>("latest");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = modes.find((item) => item.id === mode)!;
  const memes = mode === "latest" ? latest : chronological;

  return (
    <section className="homepage-feed" aria-label="浏览梗词条">
      <div className="homepage-feed-heading">
        <div className="homepage-tabs" role="tablist" aria-label="词条排序">
          {modes.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={`home-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              aria-controls="home-feed-panel"
              tabIndex={mode === item.id ? 0 : -1}
              onClick={() => setMode(item.id)}
              onKeyDown={(event) => {
                let next: number;
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") next = (index + 1) % modes.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = modes.length - 1;
                else return;
                event.preventDefault();
                setMode(modes[next].id);
                tabRefs.current[next]?.focus();
              }}
            >{item.title}</button>
          ))}
        </div>
        <Link href="/memes">全部梗</Link>
      </div>
      <div id="home-feed-panel" role="tabpanel" aria-labelledby={`home-tab-${mode}`} tabIndex={0}>
        <p className="homepage-feed-description">{selected.description}</p>
        {memes.length ? (
          <ul className="homepage-entries">
            {memes.map((meme) => {
              const date = mode === "latest" ? meme.collected_at : meme.first_seen;
              return (
                <li key={meme.slug}>
                  <article>
                    <div className="homepage-entry-heading">
                      <h2><Link href={`/meme/${meme.slug}`}>{meme.title}</Link></h2>
                      {date ? <time dateTime={/^\d{4}(?:-\d{2}){0,2}$/.test(date) ? date : undefined}>{mode === "latest" ? "收录" : "出现"} {date}</time> : null}
                    </div>
                    <p>{meme.summary}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : <p className="homepage-feed-empty">这里暂时没有词条，可以先去<Link href="/memes">梗目录</Link>看看。</p>}
        <Link className="homepage-browse" href="/memes">去梗目录继续看</Link>
      </div>
    </section>
  );
}
