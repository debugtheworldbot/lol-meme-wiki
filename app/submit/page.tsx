import type { Metadata } from "next";
import { CheckCircle2, GitFork, ShieldCheck } from "lucide-react";
import { SubmissionForm } from "@/components/submission-form";

export const metadata: Metadata = { title: "提交新梗", description: "向 LOL 梗 Wiki 提交新词条、原始出处或内容补充。", alternates: { canonical: "/submit" } };
export default function SubmitPage() {
  return <div className="submit-page"><header className="submit-page-hero"><div className="page-shell"><p className="eyebrow">COMMUNITY INTAKE / GITHUB ISSUES</p><h1>提交一条<br /><em>社区记忆。</em></h1><p>你提供线索，我们负责整理、核验和连接。投稿不会直接写入正式词条。</p></div></header><div className="page-shell submit-layout section-pad"><aside className="submission-guide"><p className="eyebrow">提交之前</p><h2>一条好线索，至少能回答两个问题。</h2><ol><li><span>01</span><div><strong>它是什么意思？</strong><p>先用一句话让没看过的人也能明白。</p></div></li><li><span>02</span><div><strong>它从哪里来？</strong><p>原始比赛、视频或帖子，比二手截图更有价值。</p></div></li><li><span>03</span><div><strong>后来怎么用了？</strong><p>记录社区语境，区分事实和调侃。</p></div></li></ol><div className="moderation-note"><ShieldCheck size={20} /><div><strong>审核原则</strong><p>不编造来源；不以编辑者口吻进行人身攻击；争议事件优先采用可靠证据。</p></div></div><div className="github-flow"><GitFork size={18} /><span>表单</span>→<span>GitHub Issue</span>→<span><CheckCircle2 size={15} /> 审核收录</span></div></aside><SubmissionForm /></div></div>;
}
