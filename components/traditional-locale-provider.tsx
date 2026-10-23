"use client";

import type { ReactNode } from "react";
import { Converter } from "opencc-js/cn2t";
import { LocaleContext, type LocaleContextValue } from "@/components/locale-provider";

// 仅繁体根布局引用此入口；简体页面无需下载这份字形词库。
const traditional: LocaleContextValue = {
  locale: "zh-TW",
  translate: Converter({ from: "cn", to: "tw" }),
};

export function TraditionalLocaleProvider({ children }: { children: ReactNode }) {
  return <LocaleContext.Provider value={traditional}>{children}</LocaleContext.Provider>;
}
