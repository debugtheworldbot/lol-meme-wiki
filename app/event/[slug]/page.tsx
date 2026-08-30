import type { Metadata } from "next";
import { EntityDetail } from "@/components/entity-detail";
import { getEntity, getEvents } from "@/lib/content";
import { buildEntityMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getEvents().map((entry) => ({ slug: entry.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const entry = getEntity("event", slug); return entry ? buildEntityMetadata("event", entry) : {}; }
export default async function EventPage({ params }: Props) { const { slug } = await params; return <EntityDetail kind="event" slug={slug} />; }
