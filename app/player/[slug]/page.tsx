import type { Metadata } from "next";
import { EntityDetail } from "@/components/entity-detail";
import { getEntity, getPlayers } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getPlayers().map((entry) => ({ slug: entry.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const entry = getEntity("player", slug); return entry ? { title: `${entry.title} 有哪些梗？`, description: entry.summary, alternates: { canonical: `/player/${slug}` } } : {}; }
export default async function PlayerPage({ params }: Props) { const { slug } = await params; return <EntityDetail kind="player" slug={slug} />; }
