import type { Metadata } from "next";
import Link from "next/link";
import { SubmissionForm } from "@/components/submission-form";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "提交新梗",
  description: "向 研发.lol 提交新词条、原始出处或内容补充。",
  alternates: { canonical: "/submit" },
  robots: { index: false, follow: true },
};

export default function SubmitPage() {
  return (
    <article className="wiki-page submit-page">
      <div className="wiki-shell">
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "提交新梗", path: "/submit" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol><li><Link href="/">首页</Link></li><li aria-current="page">提交新梗</li></ol>
        </nav>
        <header className="wiki-head">
          <h1>提交新梗</h1>
          <p className="wiki-meta">发现了还没收录的梗？写下你知道的故事和出处，维护者核实后会整理成词条。</p>
        </header>
        <div className="submit-layout">
          <section aria-label="新梗投稿表单"><SubmissionForm /></section>
          <aside className="submission-guide" aria-labelledby="submission-guide-title">
            <h2 id="submission-guide-title">不用写成完整文章</h2>
            <p>先把你知道的写下来。清楚的解释和可核实的出处，比篇幅更有帮助。</p>
            <ol>
              <li><strong>说清是什么意思</strong><p>让没看过比赛、没追过直播的人也能看懂。</p></li>
              <li><strong>尽量找到直接出处</strong><p>原始视频、比赛录像或社区帖子，都能帮助核实来龙去脉。</p></li>
              <li><strong>区分事实和调侃</strong><p>有争议的细节可以标注“不确定”，交给大家继续考证。</p></li>
            </ol>
            <div className="moderation-note">
              <h3>想修改已有词条？</h3>
              <p>请打开对应词条，使用“补充 / 纠错”。这样维护者能直接找到需要修改的位置。</p>
              <Link href="/memes">查找已有词条</Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
