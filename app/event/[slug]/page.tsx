import type { Metadata } from "next";
import { EntityDetail } from "@/components/entity-detail";
import { getEntity, getEvents } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getEvents().map((entry) => ({ slug: entry.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const entry = getEntity("event", slug); return entry ? { title: `${entry.title} 有哪些梗？`, description: entry.summary, alternates: { canonical: `/event/${slug}` } } : {}; }
export default async function EventPage({ params }: Props) { const { slug } = await params; return <EntityDetail kind="event" slug={slug} />; }
