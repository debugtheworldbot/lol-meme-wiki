import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EntityEntry, EntityKind } from "@/lib/types";

export function EntityDirectory({ entries, kind }: { entries: EntityEntry[]; kind: Exclude<EntityKind, "meme"> }) {
  if (!entries.length) {
    return <p className="wiki-empty">还没有条目。</p>;
  }
  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link href={`/${kind}/${entry.slug}`}>{entry.title}<ArrowUpRight size={14} /></Link>
          {entry.display_name ? <span className="entry-alias">{entry.display_name}</span> : null}
          <p>{entry.summary}</p>
        </li>
      ))}
    </ul>
  );
}
