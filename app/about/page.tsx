import type { Metadata } from "next";
import Link from "next/link";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于本站",
  description: "研发.lol 的收录范围、来源核对方式、编辑修订记录与纠错渠道。",
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
            <li>每条公开梗附具体来源（视频 / 比赛 / 帖子 / 文章），并区分原始材料与后来的回顾。</li>
            <li>区分“事实”与“社区调侃”，考证不确定处会显式说明分歧。</li>
          </ul>

          <h2 className="wiki-h">怎样核对一个梗</h2>
          <ol>
            <li><strong>先确认是什么。</strong> 找到实际使用这句话或名称的材料，再解释它指向的比赛、人物与语境。赛事背景本身不能证明一个梗确实流传过。</li>
            <li><strong>将来源对应到说法。</strong> 比赛数据优先对照赛事记录，原话优先找视频或原帖。后来的讲解只作为回顾材料；搜索结果页和网站首页不作为具体出处。</li>
            <li><strong>日期只写到证据支持的精度。</strong> 区分事件发生、视频上传和后续传播的时间。“时间线索”不一定是首次出现日期；找不到首发时明确写未确认。</li>
            <li><strong>补充读者需要的解释。</strong> 说明数字如何拆分、相近叫法有什么差别，以及在哪些场景使用。社区评价与可核对事实分开写。</li>
          </ol>
          <p>
            内容整理和文字修订会使用 AI 辅助。AI 生成的描述不作为证据，来源链接也不等于全文已经得到证明；无法确认的细节会在编辑注中说明。若连核心释义都缺乏依据，词条会暂时撤下，补齐材料后再发布。
          </p>

          <h2 className="wiki-h">修订记录与责任</h2>
          <p>
            站点维护者负责整理投稿与修订内容。可在
            <a href={`https://github.com/${siteConfig.githubRepo}`}>公开项目仓库</a>
            查看维护账号、文件历史和已记录的问题；词条上的更新日期表示内容修订时间，不表示梗首次出现，也不表示所有外链当天都能播放。
          </p>
          <p>2026 年 9 月的来源复核包括以下更正：</p>
          <ul>
            <li><Link href="/meme/02331">02331</Link>：拆开首局击杀数与另一局经济差，不把不同对局的数字拼成同一份统计。</li>
            <li><Link href="/meme/1557">1557</Link>：注明社区简称与部分赛后记录的计时差异。</li>
            <li><Link href="/meme/yixiao-xiaodao-s9">一笑笑到 S9</Link>：用 2018 年底的公开记录修正旧版起源时间。</li>
          </ul>
          <p>
            发现错误时，可从词条页的“补充 / 纠错”入口提供具体段落及证据，也可通过
            <Link href="/contact">联系页面</Link>反馈。投稿与纠错不会直接成为正文；涉及个人信息时，请先阅读
            <Link href="/privacy">隐私政策</Link>，避免将私人信息写入公开问题记录。
          </p>

          <h2 className="wiki-h">收录原则</h2>
          <p>
            本站<strong>记录社区已有的用法，不代表本站对任何人物、战队的评价或判断</strong>。涉及选手的称呼与梗，描述的是社区语境中的传播现象；我们不以编辑者口吻进行人身攻击，也不编造来源。若你认为某条内容不当或有误，欢迎通过<Link href="/contact">联系方式</Link>提出。
          </p>

          <h2 className="wiki-h">免责声明</h2>
          <p>
            本站是独立社区项目，<strong>并非 Riot Games 官方产品，亦未获得 Riot Games 认可</strong>。《英雄联盟》及相关名称、标识的商标与版权归 Riot Games 及各自权利人所有。本站内容仅供参考与文化记录之用。
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
