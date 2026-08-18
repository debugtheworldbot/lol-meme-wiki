import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EntityEntry, EntityKind } from "@/lib/types";

export function EntityDirectory({ entries, kind }: { entries: EntityEntry[]; kind: Exclude<EntityKind, "meme"> }) {
  return (
    <div className="entity-directory-grid">
      {entries.map((entry, index) => (
        <Link key={entry.slug} href={`/${kind}/${entry.slug}`}>
          <div className="entity-directory-top"><span>{String(index + 1).padStart(2, "0")}</span><small>{entry.region ?? "GLOBAL"}</small></div>
          <h2>{entry.title}</h2>
          {entry.display_name ? <strong>{entry.display_name}</strong> : null}
          <p>{entry.summary}</p>
          <div className="entity-directory-bottom"><span>打开档案</span><ArrowUpRight size={18} /></div>
        </Link>
      ))}
    </div>
  );
}
