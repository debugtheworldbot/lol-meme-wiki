import type { Metadata } from "next";
import { EntityDetail } from "@/components/entity-detail";
import { getEntity, getTeams } from "@/lib/content";
import { buildEntityMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getTeams().map((entry) => ({ slug: entry.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const entry = getEntity("team", slug); return entry ? buildEntityMetadata("team", entry) : {}; }
export default async function TeamPage({ params }: Props) { const { slug } = await params; return <EntityDetail kind="team" slug={slug} />; }
