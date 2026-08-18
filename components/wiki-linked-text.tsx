import { Fragment } from "react";
import Link from "next/link";

export function WikiLinkedText({
  text,
  terms,
}: {
  text: string;
  terms: { label: string; href: string }[];
}) {
  const unique = new Map<string, string>();
  for (const term of terms) {
    if (term.label.length >= 2 && !unique.has(term.label)) unique.set(term.label, term.href);
  }
  const labels = [...unique.keys()].sort((a, b) => b.length - a.length);
  if (!labels.length) return text;

  const pattern = new RegExp(`(${labels.map(escapeRegExp).join("|")})`, "g");
  const parts = text.split(pattern);
  return parts.map((part, index) => {
    const href = unique.get(part);
    return href ? (
      <Link key={`${part}-${index}`} href={href}>{part}</Link>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    );
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
