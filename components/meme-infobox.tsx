"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode, useId, useState } from "react";

export function MemeInfobox({
  title,
  label = "词条资料",
  quickLinks,
  children,
}: {
  title: string;
  label?: string;
  quickLinks?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <aside className="wiki-infobox meme-infobox" aria-label={`${title}的${label}`} data-open={open ? "true" : "false"}>
      <h2 className="wiki-infobox-title">{label}</h2>
      <div className="meme-infobox-mobile-head">
        <button
          type="button"
          className="meme-infobox-toggle"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((value) => !value)}
        >
          <strong>{label}</strong>
          <span>{open ? "收起" : "展开"}</span>
          <ChevronDown size={17} aria-hidden="true" />
        </button>
        {quickLinks ? <div className="meme-infobox-quicklinks" aria-label="主要关联">
          {quickLinks}
        </div> : null}
      </div>
      <div id={contentId} className="meme-infobox-body">
        {children}
      </div>
    </aside>
  );
}
