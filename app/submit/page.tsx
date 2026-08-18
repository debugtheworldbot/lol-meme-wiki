import type { Metadata } from "next";
import Link from "next/link";
import { SubmissionForm } from "@/components/submission-form";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "提交新梗",
  description: "向 LOL 梗 Wiki 提交新词条、原始出处或内容补充。",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>提交新梗</h1>
          <p className="wiki-meta">投稿进入 GitHub Issues，核对来源后才会写入词条</p>
        </header>
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "提交", path: "/submit" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">提交</li>
          </ol>
        </nav>

        <div className="submit-layout">
          <section className="submission-guide">
            <h2 className="wiki-h">怎么写</h2>
            <ol>
              <li>
                <strong>它是什么意思？</strong>
                <p>先用一句话让没看过的人也能明白。</p>
              </li>
              <li>
                <strong>它从哪里来？</strong>
                <p>原始比赛、视频或帖子，比二手截图更有价值。</p>
              </li>
              <li>
                <strong>后来怎么用了？</strong>
                <p>记录社区语境，区分事实和调侃。</p>
              </li>
            </ol>
            <div className="moderation-note">
              <strong>审核原则</strong>
              <p>不编造来源；不以编辑者口吻进行人身攻击；争议事件优先采用可靠证据。</p>
            </div>
            <p className="github-flow">
              <span>表单</span>→<span>GitHub Issue</span>→<span>审核收录</span>
            </p>
          </section>

          <section>
            <h2 className="wiki-h">投稿表单</h2>
            <SubmissionForm />
          </section>
        </div>
      </div>
    </article>
  );
}
