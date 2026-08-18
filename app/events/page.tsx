import type { Metadata } from "next";
import { EntityDirectory } from "@/components/entity-directory";
import { getEvents } from "@/lib/content";

export const metadata: Metadata = { title: "赛事梗档案", description: "按英雄联盟赛事浏览比赛名场面与相关社区梗。", alternates: { canonical: "/events" } };
export default function EventsPage() { const entries = getEvents(); return <div className="directory-page page-shell section-pad"><header className="directory-header"><div><p className="eyebrow">EVENT INDEX / {entries.length.toString().padStart(3, "0")}</p><h1>赛事档案</h1><p>把散落在赛程里的经典瞬间，重新连接成可浏览的文化时间线。</p></div></header><EntityDirectory entries={entries} kind="event" /></div>; }
