import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <p className="footer-logo">LOL 梗 Wiki<span>®</span></p>
          <p>记录社区用法，不替社区判断人物。</p>
        </div>
        <div className="footer-links">
          <Link href="/memes">全部梗</Link><Link href="/players">选手</Link><Link href="/teams">战队</Link><Link href="/events">赛事</Link><Link href="/submit">投稿</Link>
        </div>
        <p className="footer-note">非 Riot Games 官方产品，亦未获得 Riot Games 认可。所有相关商标归其各自所有者。</p>
      </div>
    </footer>
  );
}
