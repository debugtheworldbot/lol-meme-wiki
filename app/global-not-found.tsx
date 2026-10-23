import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = { metadataBase: new URL(siteConfig.url), title: "页面不存在｜研发.lol", robots: { index: false, follow: true } };

export default function GlobalNotFound() {
  return (
    <html lang="zh-CN">
      <body>
        <main className="wiki-page">
          <div className="wiki-shell">
            <header className="wiki-head"><h1>404 · 页面不存在</h1></header>
            <p>链接可能有误，或这条内容尚未收录。</p>
            <p lang="zh-Hant">連結可能有誤，或這條內容尚未收錄。</p>
            <div className="not-found-actions">
              <Link className="button-secondary" href="/">返回简体首页</Link>
              <Link className="button-secondary" href="/zh-tw" lang="zh-Hant">返回繁體首頁</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
