import Link from "next/link";
import type { EntityEntry, EntityKind } from "@/lib/types";

export function EntityDirectory({ entries, kind }: { entries: EntityEntry[]; kind: Exclude<EntityKind, "meme"> }) {
  if (!entries.length) {
    return <p className="wiki-empty">还没有条目。</p>;
  }
  return (
    <ul className="home-list">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link href={`/${kind}/${entry.slug}`}>{entry.title}</Link>
          {entry.display_name ? `（${entry.display_name}）` : null}
          <span>{entry.summary}</span>
        </li>
      ))}
    </ul>
  );
}
