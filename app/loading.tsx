/* 赛后公报室：加载态展示可读的档案骨架，避免空白页或突兀旋转图标。 */
export default function Loading() {
  return (
    <div className="wiki-page wiki-home home-loading" aria-busy="true" aria-live="polite">
      <div className="wiki-shell loading-shell">
        <section className="loading-hero" aria-label="正在打开词条档案">
          <div className="loading-copy"><span className="loading-eyebrow">正在调取赛后卷宗</span><i className="loading-line loading-title" /><i className="loading-line loading-subtitle" /><div className="loading-search"><i /><i /></div></div>
          <div className="loading-ledger"><i /><i /><i /><i /></div>
        </section>
        <div className="loading-section"><span>整理编辑台</span><div className="loading-cards"><i /><i /><i /><i /></div></div>
        <div className="loading-section"><span>展开时间线</span><div className="loading-rows"><i /><i /><i /><i /></div></div>
      </div>
    </div>
  );
}
