import type { Metadata } from "next";
import { EntityDetail } from "@/components/entity-detail";
import { getEntity, getPlayers } from "@/lib/content";
import { buildEntityMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getPlayers().map((entry) => ({ slug: entry.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const entry = getEntity("player", slug); return entry ? buildEntityMetadata("player", entry) : {}; }
export default async function PlayerPage({ params }: Props) { const { slug } = await params; return <EntityDetail kind="player" slug={slug} />; }
