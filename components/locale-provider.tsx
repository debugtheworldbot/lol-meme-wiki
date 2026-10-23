"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/locale-path";

export interface LocaleContextValue {
  locale: Locale;
  translate: (text: string) => string;
}

const simplified: LocaleContextValue = { locale: "zh-CN", translate: (text) => text };
export const LocaleContext = createContext<LocaleContextValue>(simplified);

export function LocaleProvider({ children }: { children: ReactNode }) {
  return <LocaleContext.Provider value={simplified}>{children}</LocaleContext.Provider>;
}

export const SimplifiedLocaleProvider = LocaleProvider;

export function useLocale() {
  return useContext(LocaleContext);
}
