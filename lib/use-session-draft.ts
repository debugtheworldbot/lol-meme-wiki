"use client";

import { useCallback, useRef } from "react";
import { stripLocalePath } from "@/lib/locale-path";

const FIELD_LIMITS = {
  correction: { content: 3000, source: 1000 },
  submission: { name: 80, summary: 180, details: 3000, sourceUrl: 3000, sourceType: 20, players: 3000, teams: 3000, events: 3000, notes: 3000 },
} as const;
type Draft = Record<string, string>;

/** 仅保存本标签页会话中的白名单输入，简繁 URL 共用一份草稿。 */
export function useSessionDraft(kind: keyof typeof FIELD_LIMITS, pathname: string) {
  const key = `wiki-draft:${kind}:${stripLocalePath(pathname)}`;
  const memory = useRef<{ key: string; value: Draft } | null>(null);

  const sanitize = useCallback((value: unknown): Draft => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.entries(FIELD_LIMITS[kind]).flatMap(([field, limit]) =>
      typeof record[field] === "string" ? [[field, record[field].slice(0, limit)]] : [],
    ));
  }, [kind]);

  const readDraft = useCallback((): Draft => {
    if (memory.current?.key === key) return memory.current.value;
    let value: Draft = {};
    try { value = sanitize(JSON.parse(sessionStorage.getItem(key) ?? "null")); } catch { /* 存储不可用或草稿损坏时保持表单可用。 */ }
    memory.current = { key, value };
    return value;
  }, [key, sanitize]);

  const saveDraft = useCallback((input: unknown) => {
    const value = sanitize(input);
    memory.current = { key, value };
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* 本页填写不受影响。 */ }
  }, [key, sanitize]);

  const clearDraft = useCallback(() => {
    memory.current = { key, value: {} };
    try { sessionStorage.removeItem(key); } catch { /* 不阻塞提交结果和下一次填写。 */ }
  }, [key]);

  return { readDraft, saveDraft, clearDraft };
}
