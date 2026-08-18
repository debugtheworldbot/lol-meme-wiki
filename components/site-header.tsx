/* 赛后公报室：导航是克制的编辑部工具栏，品牌标记与检索入口必须始终清晰。 */
import Link from "next/link";
import { GitFork } from "lucide-react";
import Image from "next/image";
import { SearchDialog } from "@/components/search-dialog";
import { siteConfig } from "@/lib/site";
import type { SearchRecord } from "@/lib/types";

const navItems = [
  ["梗目录", "/memes"],
  ["选手", "/players"],
  ["战队", "/teams"],
  ["赛事", "/events"],
] as const;

export function SiteHeader({ records }: { records: SearchRecord[] }) {
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Link href="/" className="brand" aria-label="LOL 梗 Wiki 首页">
          <span className="brand-mark" aria-hidden="true"><Image src="/lol-meme-wiki-mark.png" alt="" width={30} height={30} priority /></span>
          <span>LOL 梗 Wiki</span>
          <span className="brand-beta">BETA</span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <SearchDialog records={records} />
          <Link className="submit-mini" href="/submit">提交新梗 <span>↗</span></Link>
          <a
            className="icon-link"
            href={`https://github.com/${siteConfig.githubRepo}`}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub 仓库"
          >
            <GitFork size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
