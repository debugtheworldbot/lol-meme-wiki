"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { loadTraditionalConverter, type ChineseConverter } from "@/lib/chinese-converter";
import { convertChineseDocument } from "@/lib/chinese-dom";
import { getChineseScript, getServerChineseScript, setChineseScript, subscribeChineseScript } from "@/lib/chinese-script-preference";

export function ChineseScriptToggle() {
  const script = useSyncExternalStore(subscribeChineseScript, getChineseScript, getServerChineseScript);
  const [converter, setConverter] = useState<ChineseConverter | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const traditional = script === "traditional" && converter !== null;
  const loading = script === "traditional" && !converter && !error;

  useEffect(() => {
    if (script !== "traditional" || converter) return;
    let active = true;
    loadTraditionalConverter().then((convert) => {
      if (active) { setConverter(() => convert); setError(false); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [script, converter, attempt]);

  useEffect(() => {
    if (!traditional || !converter) return;
    const root = document.documentElement;
    const originalLanguage = root.lang;
    const restore = convertChineseDocument(root, converter);
    root.lang = "zh-Hant";
    return () => { restore(); root.lang = originalLanguage; };
  }, [traditional, converter]);

  const label = loading ? "正在加载繁体转换" : traditional ? "切換為簡體中文" : error ? "重新加载繁体转换" : "切换为繁体中文";
  return (
    <div className="script-switch" translate="no">
      <button
        type="button"
        className="script-switch-button"
        aria-label={label}
        title={label}
        aria-pressed={traditional}
        aria-busy={loading}
        disabled={loading}
        onClick={() => {
          setError(false);
          setAttempt((value) => value + 1);
          setChineseScript(traditional ? "simplified" : "traditional");
        }}
      >{traditional ? "简" : "繁"}</button>
      {error && script === "traditional" ? <span className="script-switch-error" role="alert">繁体暂不可用，点击“繁”重试。</span> : null}
      <span className="sr-only" role="status">{traditional ? "已切換為繁體中文" : loading ? "正在加载繁体转换" : "当前为简体中文"}</span>
    </div>
  );
}
