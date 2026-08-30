import type { Metadata } from "next";
import Link from "next/link";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "研发.lol 如何收集、使用与保护你的信息，以及第三方广告与统计的 Cookie 说明。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="wiki-page">
      <div className="wiki-shell">
        <header className="wiki-head">
          <h1>隐私政策</h1>
          <p className="wiki-meta">最后更新：2026-08-30</p>
        </header>
        <JsonLd data={buildBreadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "隐私政策", path: "/privacy" }])} />
        <nav className="wiki-crumb" aria-label="面包屑">
          <ol>
            <li><Link href="/">首页</Link></li>
            <li aria-current="page">隐私政策</li>
          </ol>
        </nav>

        <div className="wiki-prose">
          <p>
            本站 研发.lol（以下称“本站”）是一个记录英雄联盟及电竞社区文化的公益词条站。我们尽量少收集个人信息。本政策说明我们会接触到哪些数据、如何使用，以及第三方服务的相关处理。
          </p>

          <h2 className="wiki-h">我们收集的信息</h2>
          <ul>
            <li><strong>浏览与交互数据：</strong>访问页面时，服务器与统计工具会记录常规技术信息，如页面地址、来源、大致地区、设备与浏览器类型；也会记录搜索、筛选、随机浏览、投稿与纠错等功能是否被使用。搜索词用于发现未收录内容，请不要在搜索框输入个人信息。</li>
            <li><strong>你主动提交的信息：</strong>当你使用“投稿”或“纠错”功能时，你填写的内容会通过接口进入本站的公开 GitHub Issues 供审核。请不要在其中填写你不愿公开的个人信息。</li>
          </ul>
          <p>本站没有账号系统，不要求注册，也不主动收集姓名、邮箱等身份信息（除非你在投稿内容里自行填写）。</p>

          <h2 className="wiki-h">Cookie 与第三方广告</h2>
          <p>
            本站可能展示由第三方广告服务商（包括 Google 及其 AdSense 合作网络）投放的广告。这些第三方可能使用 Cookie 或类似技术，根据你在本站及其它网站的访问记录来投放和衡量广告效果。
          </p>
          <ul>
            <li>作为第三方供应商，Google 会使用 Cookie（含 DART Cookie）在本站及其它网站投放广告。</li>
            <li>你可以访问 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google 广告设置</a> 管理或关闭个性化广告；也可通过 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a> 了解更多选择。</li>
            <li>更多关于 Google 如何处理数据的说明，见 <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google 合作伙伴网站隐私政策</a>。</li>
          </ul>
          <p>你也可以在浏览器设置中禁用或删除 Cookie，但这可能影响部分功能与广告体验。</p>

          <h2 className="wiki-h">访问统计</h2>
          <p>
            本站使用注重隐私的网站分析工具统计聚合访问量和不与账号绑定的功能事件，不用于识别具体个人。这些数据帮助我们改进内容与体验。
          </p>

          <h2 className="wiki-h">第三方链接</h2>
          <p>
            词条中的来源链接会指向 Bilibili、贴吧、虎扑、知乎、赛事官网等外部站点。这些站点有各自的隐私政策，本站不对其内容与数据处理负责。
          </p>

          <h2 className="wiki-h">未成年人</h2>
          <p>本站面向一般公众，不针对 13 周岁以下儿童，也不会有意收集其个人信息。</p>

          <h2 className="wiki-h">政策变更</h2>
          <p>我们可能不时更新本政策，更新后会修改本页顶部的日期。继续使用本站即表示你接受更新后的政策。</p>

          <h2 className="wiki-h">联系我们</h2>
          <p>对隐私或数据有疑问，请见 <Link href="/contact">联系方式</Link>。</p>
        </div>
      </div>
    </article>
  );
}
