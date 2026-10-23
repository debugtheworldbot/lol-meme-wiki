import { LocalizedContent } from "@/components/localized-content";
// 仅投稿页使用整页骨架；可索引的阅读页应直接输出完整正文。
export default function Loading() {
  return <LocalizedContent>{(
    <div className="homepage homepage-loading" role="status" aria-label="正在加载页面">
      <div className="homepage-shell" aria-hidden="true">
        <div className="homepage-loading-title" />
        <div className="homepage-loading-description" />
        <div className="homepage-loading-search" />
        <div className="homepage-loading-list">
          {[0, 1, 2].map((row) => <div key={row}><i /><i /><i /></div>)}
        </div>
      </div>
    </div>
  )}</LocalizedContent>;
}
