"use client";

import { Archive, ChevronDown } from "lucide-react";
import { ReactNode, useId, useState } from "react";

export function MemeInfobox({
  title,
  itemCount,
  quickLinks,
  children,
}: {
  title: string;
  itemCount: number;
  quickLinks: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <aside className="wiki-infobox meme-infobox" data-open={open ? "true" : "false"}>
      <div className="wiki-infobox-title">{title}</div>
      <div className="meme-infobox-mobile-head">
        <button
          type="button"
          className="meme-infobox-toggle"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((value) => !value)}
        >
          <Archive size={17} aria-hidden="true" />
          <strong>词条档案</strong>
          <span>· {itemCount} 项</span>
          <ChevronDown size={17} aria-hidden="true" />
        </button>
        <div className="meme-infobox-quicklinks" aria-label="主要关联">
          {quickLinks}
        </div>
      </div>
      <div id={contentId} className="meme-infobox-body">
        {children}
      </div>
    </aside>
  );
}
