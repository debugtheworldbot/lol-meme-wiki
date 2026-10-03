import type { ReactNode } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

const pages = [
  { href: "/about", title: "关于本站" },
  { href: "/contact", title: "联系方式" },
  { href: "/privacy", title: "隐私政策" },
];

export function InfoPage({ title, description, pathname, sections, children }: {
  title: string;
  description: string;
  pathname: string;
  sections: { id: string; title: string }[];
  children: ReactNode;
}) {
  return (
    <article className="wiki-page wiki-info-page">
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: title, path: pathname }])} />
      <div className="wiki-shell">
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">{title}</li></ol>
        </nav>
        <header className="wiki-head">
          <h1>{title}</h1>
          <p className="wiki-meta">{description}</p>
        </header>
        <div className="info-layout">
          <div className="wiki-prose">{children}</div>
          <aside className="info-sidebar">
            <nav className="info-contents" aria-label="本页内容">
              <h2>本页内容</h2>
              <ul>{sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ul>
            </nav>
            <nav className="info-links" aria-label="站点说明">
              <h2>站点说明</h2>
              {pages.map((page) => <Link key={page.href} href={page.href} aria-current={page.href === pathname ? "page" : undefined}>{page.title}</Link>)}
            </nav>
          </aside>
        </div>
      </div>
    </article>
  );
}
