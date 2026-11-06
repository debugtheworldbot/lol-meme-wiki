import { LocalizedContent } from "@/components/localized-content";
import Link from "@/components/locale-link";
import Image from "next/image";
import { SearchDialog } from "@/components/search-dialog";
import { SiteNav } from "@/components/site-nav";
import { ChineseScriptToggle } from "@/components/chinese-script-toggle";

export function SiteHeader() {
  return <LocalizedContent>{(
    <header className="site-header">
      <div className="page-shell header-inner">
        <Link href="/" className="brand" aria-label="研发.lol 英雄联盟梗百科 首页">
          <span className="brand-mark" aria-hidden="true"><Image src="/lol-meme-wiki-mark.png" alt="" width={36} height={36} loading="eager" /></span>
          <span className="brand-text">
            <span className="brand-title">研发.lol</span>
            <span className="brand-sub">英雄联盟梗百科</span>
          </span>
        </Link>
        <SiteNav />
        <div className="header-actions">
          <SearchDialog />
          <div className="mobile-script-switch"><ChineseScriptToggle /></div>
          <Link className="submit-mini" href="/submit" aria-label="提交新梗">
            <span className="desktop-control-label">提交新梗</span>
            <span className="mobile-control-label">投稿</span>
          </Link>
        </div>
      </div>
    </header>
  )}</LocalizedContent>;
}
