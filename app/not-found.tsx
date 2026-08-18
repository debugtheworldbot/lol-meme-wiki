import Link from "next/link";

export default function NotFound() {
  return (
    <article className="wiki-page not-found">
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>未找到页面</h1>
          <p className="wiki-meta">这条词条还不存在，或者链接写错了</p>
        </header>
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">404</li>
          </ol>
        </nav>
        <h2 className="wiki-h">接下来</h2>
        <p className="wiki-lead">
          可以回 <Link href="/">首页</Link> 或 <Link href="/memes">梗目录</Link> 再找，
          也可以 <Link href="/submit">提交新梗</Link>。
        </p>
      </div>
    </article>
  );
}
