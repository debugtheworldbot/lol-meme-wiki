import Link from "next/link";
import Image from "next/image";
import { SearchDialog } from "@/components/search-dialog";

const navItems = [
  ["梗目录", "/memes"],
  ["专题", "/topics"],
  ["选手", "/players"],
  ["战队", "/teams"],
  ["赛事", "/events"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Link href="/" className="brand" aria-label="研发.lol 英雄联盟梗百科 首页">
          <span className="brand-mark" aria-hidden="true"><Image src="/lol-meme-wiki-mark.png" alt="" width={36} height={36} loading="eager" /></span>
          <span className="brand-text">
            <span className="brand-title">研发.lol</span>
            <span className="brand-sub">英雄联盟梗百科</span>
          </span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <SearchDialog />
          <Link className="submit-mini" href="/submit">提交新梗</Link>
        </div>
      </div>
    </header>
  );
}
