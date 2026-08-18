import type { Metadata } from "next";
import { EntityDirectory } from "@/components/entity-directory";
import { getTeams } from "@/lib/content";

export const metadata: Metadata = { title: "战队梗档案", description: "按英雄联盟职业战队浏览相关社区梗与赛事出处。", alternates: { canonical: "/teams" } };
export default function TeamsPage() { const entries = getTeams(); return <div className="directory-page page-shell section-pad"><header className="directory-header"><div><p className="eyebrow">TEAM INDEX / {entries.length.toString().padStart(3, "0")}</p><h1>战队档案</h1><p>胜负会结束，但战队留下的故事还在社区里继续生长。</p></div></header><EntityDirectory entries={entries} kind="team" /></div>; }
