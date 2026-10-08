"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 1280px)";
const placements = [
  { side: "left", adKey: "2411be85bd2e8ce8caf5212cde0951a3", height: 600 },
  { side: "right", adKey: "a82c66041da88d3fc1abac93e91f3d3f", height: 300 },
] as const;

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function DesktopBanner({ side, adKey, height }: typeof placements[number]) {
  const observer = useRef<MutationObserver | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => () => observer.current?.disconnect(), []);

  // 两个广告的 atOptions 分别留在自己的文档中，避免覆盖彼此的配置。
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body>
<script>var atOptions={key:${JSON.stringify(adKey)},format:"iframe",height:${height},width:160,params:{}};</script>
<script src="https://bauval.org/22/${adKey}"></script>
</body></html>`;

  return (
    <aside className={`wiki-desktop-ad wiki-desktop-ad-${side}`} aria-label={`${side === "left" ? "左" : "右"}侧广告`} data-ready={ready}>
      <div className="wiki-desktop-ad-sticky">
        <p className="wiki-advertisement-label">广告</p>
        <iframe
          className="wiki-desktop-ad-slot"
          title={`${side === "left" ? "左" : "右"}侧广告内容`}
          width={160}
          height={height}
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          onLoad={(event) => {
            observer.current?.disconnect();
            const doc = event.currentTarget.contentDocument;
            if (!doc?.body) return;
            const check = () => {
              if (!doc.body.querySelector("iframe")) return;
              setReady(true);
              observer.current?.disconnect();
            };
            observer.current = new MutationObserver(check);
            observer.current.observe(doc.body, { childList: true, subtree: true });
            check();
          }}
        />
      </div>
    </aside>
  );
}

export function AdsterraDesktopSidebars() {
  const isDesktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );

  if (!isDesktop) return null;

  return (
    <>
      {placements.map((placement) => <DesktopBanner key={placement.side} {...placement} />)}
    </>
  );
}
