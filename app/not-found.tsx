import Link from "next/link";
import { InlineSearch } from "@/components/inline-search";

export default function NotFound() {
  return (
    <article className="wiki-page not-found">
      <div className="wiki-shell">
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">404</li>
          </ol>
        </nav>
        <header className="wiki-head">
          <h1>没找到这个页面</h1>
          <p className="wiki-meta">链接可能有误，或者这条内容还未收录。试试搜索你记得的名字。</p>
        </header>
        <div className="not-found-search"><InlineSearch /></div>
        <div className="not-found-actions">
          <Link className="button-secondary" href="/">返回首页</Link>
          <Link className="button-secondary" href="/memes">浏览梗目录</Link>
          <Link className="text-button" href="/submit">补充一个新梗</Link>
        </div>
      </div>
    </article>
  );
}
