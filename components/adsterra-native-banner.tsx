"use client";

import { useEffect, useRef } from "react";

const AD_KEY = "8d96a43131dafb65c73ff424c58946b6";

export function AdsterraNativeBanner() {
  const placement = useRef<HTMLElement>(null);
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = placement.current;
    const container = slot.current;
    if (!host || !container) return;

    // 每次进入词条重新执行广告代码，避免 next/script 的去重缓存留下空广告位。
    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = `https://bauval.org/21/${AD_KEY}`;
    host.appendChild(script);

    return () => {
      script.remove();
      container.replaceChildren();
    };
  }, []);

  return (
    <aside ref={placement} className="wiki-advertisement" aria-label="广告">
      <p className="wiki-advertisement-label">广告</p>
      <div ref={slot} id={`container-${AD_KEY}`} className="wiki-advertisement-slot" />
    </aside>
  );
}
