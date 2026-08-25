import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "联系方式",
  description: "如何投稿、纠错，或就内容、版权、隐私问题联系 LOL 梗 Wiki。",
  alternates: { canonical: "/contact" },
};

const issuesUrl = `https://github.com/${siteConfig.githubRepo}/issues`;

export default function ContactPage() {
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>联系方式</h1>
          <p className="wiki-meta">投稿、纠错、内容与版权问题都可以找到我们</p>
        </header>
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "联系", path: "/contact" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">联系</li>
          </ol>
        </nav>

        <div className="wiki-prose">
          <h2 className="wiki-h">投稿新梗</h2>
          <p>知道站里还没有的梗，请用 <Link href="/submit">投稿页</Link> 提交，尽量写清出处、时间线和链接。</p>

          <h2 className="wiki-h">纠错与补充</h2>
          <p>发现某条词条有误或需要补充，可在该词条页点“纠错”提交；也可直接在 <a href={issuesUrl} target="_blank" rel="noopener noreferrer">GitHub Issues</a> 开一条。</p>

          <h2 className="wiki-h">内容、版权与隐私</h2>
          <p>
            如涉及内容下架、更正、版权或隐私诉求，请在 <a href={issuesUrl} target="_blank" rel="noopener noreferrer">GitHub Issues</a> 说明具体词条与理由，我们会尽快核实处理。本站为非营利社区项目，记录社区用法、不替社区判断人物，也非 Riot Games 官方产品。
          </p>

          <h2 className="wiki-h">项目源码</h2>
          <p>本站开源，代码仓库见 <a href={`https://github.com/${siteConfig.githubRepo}`} target="_blank" rel="noopener noreferrer">GitHub</a>。</p>
        </div>
      </div>
    </article>
  );
}
