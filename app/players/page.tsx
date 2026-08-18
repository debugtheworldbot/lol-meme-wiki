import type { Metadata } from "next";
import { EntityDirectory } from "@/components/entity-directory";
import { getPlayers } from "@/lib/content";

export const metadata: Metadata = { title: "选手梗档案", description: "按英雄联盟职业选手浏览相关社区梗与赛事出处。", alternates: { canonical: "/players" } };
export default function PlayersPage() { const entries = getPlayers(); return <div className="directory-page page-shell section-pad"><header className="directory-header"><div><p className="eyebrow">PLAYER INDEX / {entries.length.toString().padStart(3, "0")}</p><h1>选手档案</h1><p>从一个 ID 出发，找到与他有关的名场面、称呼和社区叙事。</p></div></header><EntityDirectory entries={entries} kind="player" /></div>; }
