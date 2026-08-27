import type { Metadata } from "next";
import Link from "next/link";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "关于本站",
  description: "研发.lol 是什么、收录原则、内容免责与参与方式。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>关于本站</h1>
          <p className="wiki-meta">记录社区用法，不替社区判断人物</p>
        </header>
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "关于", path: "/about" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">关于</li>
          </ol>
        </nav>

        <div className="wiki-prose">
          <p>
            研发.lol 是一个记录《英雄联盟》及电竞社区文化的中文词条站。我们把散落在比赛、直播、贴吧、虎扑、B 站里那些“莫名其妙但大家都懂”的梗，尽量考证清楚出处、时间线和用法，收成可检索的条目。
          </p>

          <h2 className="wiki-h">我们做什么</h2>
          <ul>
            <li>按<Link href="/memes">梗</Link>、<Link href="/players">选手</Link>、<Link href="/teams">战队</Link>、<Link href="/events">赛事</Link>四条线组织词条，相互关联。</li>
            <li>每条梗尽量标注原始来源（视频 / 比赛 / 帖子 / 文章），方便溯源，而不是二手转述。</li>
            <li>区分“事实”与“社区调侃”，考证不确定处会显式说明分歧。</li>
          </ul>

          <h2 className="wiki-h">收录原则</h2>
          <p>
            本站<strong>记录社区已有的用法，不代表本站对任何人物、战队的评价或判断</strong>。涉及选手的称呼与梗，描述的是社区语境中的传播现象；我们不以编辑者口吻进行人身攻击，也不编造来源。若你认为某条内容不当或有误，欢迎通过<Link href="/contact">联系方式</Link>提出。
          </p>

          <h2 className="wiki-h">免责声明</h2>
          <p>
            本站为非营利性社区项目，<strong>并非 Riot Games 官方产品，亦未获得 Riot Games 认可</strong>。《英雄联盟》及相关名称、标识的商标与版权归 Riot Games 及各自权利人所有。本站内容仅供参考与文化记录之用。
          </p>

          <h2 className="wiki-h">参与共建</h2>
          <p>
            词条由社区共同维护。你可以<Link href="/submit">投稿新梗</Link>，或在任意词条页对已有内容纠错补充。审核核对来源后才会写入。
          </p>
        </div>
      </div>
    </article>
  );
}
