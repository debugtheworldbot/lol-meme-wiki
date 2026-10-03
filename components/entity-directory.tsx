import Link from "next/link";
import type { EntityEntry, EntityKind } from "@/lib/types";

const directoryLinks = [
  { href: "/memes", label: "全部梗" },
  { href: "/topics", label: "专题" },
  { href: "/players", label: "选手" },
  { href: "/teams", label: "战队" },
  { href: "/events", label: "赛事" },
] as const;

export function DirectoryNavigation({ current }: { current: typeof directoryLinks[number]["href"] }) {
  return (
    <nav className="directory-nav" aria-label="浏览分类">
      {directoryLinks.map(({ href, label }) => (
        <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}

export function EntityDirectory({ entries, kind }: { entries: EntityEntry[]; kind: Exclude<EntityKind, "meme"> }) {
  if (!entries.length) {
    return <p className="wiki-empty">还没有条目。</p>;
  }
  return (
    <ul className="entry-list" aria-label={{ player: "选手列表", team: "战队列表", event: "赛事列表" }[kind]}>
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link href={`/${kind}/${entry.slug}`}>{entry.title}</Link>
          {entry.display_name && entry.display_name !== entry.title ? <span className="entry-alias">{entry.display_name}</span> : null}
          <p>{entry.summary}</p>
        </li>
      ))}
    </ul>
  );
}
