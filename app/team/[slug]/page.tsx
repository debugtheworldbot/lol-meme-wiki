import type { Metadata } from "next";
import { EntityDetail } from "@/components/entity-detail";
import { getEntity, getTeams } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getTeams().map((entry) => ({ slug: entry.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const entry = getEntity("team", slug); return entry ? { title: `${entry.title} 有哪些梗？`, description: entry.summary, alternates: { canonical: `/team/${slug}` } } : {}; }
export default async function TeamPage({ params }: Props) { const { slug } = await params; return <EntityDetail kind="team" slug={slug} />; }
