import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "联系方式",
  description: "如何投稿、纠错，或就内容、版权、隐私问题联系 研发.lol。",
  alternates: { canonical: "/contact" },
};

const issuesUrl = `https://github.com/${siteConfig.githubRepo}/issues`;

export default function ContactPage() {
  return (
    <InfoPage title="联系方式" description="投稿、纠错、内容与版权问题都可以找到我们" pathname="/contact" sections={[
        { id: "submit", title: "投稿新梗" },
        { id: "corrections", title: "纠错与补充" },
        { id: "requests", title: "内容、版权与隐私" },
        { id: "source-code", title: "项目源码" },
    ]}>
      <h2 id="submit" className="wiki-h">投稿新梗</h2>
      <p>知道站里还没有的梗，请用 <Link href="/submit">投稿页</Link> 提交，尽量写清出处、时间线和链接。</p>

      <h2 id="corrections" className="wiki-h">纠错与补充</h2>
      <p>发现某条词条有误或需要补充，可在该词条页点“纠错”提交；也可直接在 <a href={issuesUrl} target="_blank" rel="noopener noreferrer">GitHub Issues</a> 开一条。</p>

      <h2 id="requests" className="wiki-h">内容、版权与隐私</h2>
      <p>
        如涉及内容下架、更正、版权或隐私诉求，请在 <a href={issuesUrl} target="_blank" rel="noopener noreferrer">GitHub Issues</a> 说明具体词条与理由，我们会尽快核实处理。本站为非营利社区项目，记录社区用法、不替社区判断人物，也非 Riot Games 官方产品。
      </p>

      <h2 id="source-code" className="wiki-h">项目源码</h2>
      <p>本站开源，代码仓库见 <a href={`https://github.com/${siteConfig.githubRepo}`} target="_blank" rel="noopener noreferrer">GitHub</a>。</p>
    </InfoPage>
  );
}
