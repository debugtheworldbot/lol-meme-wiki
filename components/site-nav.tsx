"use client";

import { LocalizedContent } from "@/components/localized-content";

import Link from "@/components/locale-link";
import { usePathname } from "next/navigation";
import { ChineseScriptToggle } from "@/components/chinese-script-toggle";
import { stripLocalePath } from "@/lib/locale-path";

const items = [
  { label: "梗目录", href: "/memes", detail: "/meme/" },
  { label: "专题", href: "/topics", detail: "/topics/" },
  { label: "选手", href: "/players", detail: "/player/" },
  { label: "战队", href: "/teams", detail: "/team/" },
  { label: "赛事", href: "/events", detail: "/event/" },
];

export function SiteNav() {
  const pathname = stripLocalePath(usePathname());
  return <LocalizedContent>{(
    <nav className="main-nav" aria-label="主导航">
      {items.map((item) => (
        <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : pathname.startsWith(item.detail) ? "location" : undefined}>
          {item.label}
        </Link>
      ))}
      <ChineseScriptToggle />
    </nav>
  )}</LocalizedContent>;
}
