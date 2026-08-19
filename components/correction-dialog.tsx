"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Clipboard, ExternalLink, LoaderCircle, PencilLine, X } from "lucide-react";
import { track } from "@/lib/analytics";

type CorrectionResult = { mode: "created" | "link" | "preview"; issueUrl?: string; markdown?: string };

export function CorrectionDialog({ title, pathname }: { title: string; pathname: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setError("");
    setResult(null);
    setCopied(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = { ...Object.fromEntries(formData.entries()), title, pathname };
    try {
      const response = await fetch("/api/correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "提交失败，请稍后重试。");
      setResult(data);
      track("Correction Submission", { mode: data.mode, page: pathname });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "提交失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="wiki-tool-button" onClick={() => setOpen(true)}>纠错</button>
      {open ? (
        <div className="correction-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}>
          <section className="correction-modal" role="dialog" aria-modal="true" aria-label={`纠错：${title}`}>
            <header className="correction-head">
              <div>
                <span className="correction-eyebrow"><PencilLine size={13} /> 内容纠错</span>
                <strong>{title}</strong>
              </div>
              <button type="button" className="correction-close" onClick={close} aria-label="关闭"><X size={18} /></button>
            </header>

            {result ? (
              <div className="correction-result">
                <span className="success-icon"><Check size={18} /></span>
                <h3>{result.mode === "created" ? "纠错已提交" : "纠错草稿已生成"}</h3>
                <p>{result.mode === "created" ? "感谢帮忙校对，维护者会在 GitHub Issue 中核对来源与措辞。" : "当前环境未启用自动建 Issue。你可以复制草稿，或前往已配置的 GitHub 仓库提交。"}</p>
                <div className="success-actions">
                  {result.issueUrl ? <a className="button-primary" href={result.issueUrl} target="_blank" rel="noreferrer">打开 GitHub Issue <ExternalLink size={16} /></a> : null}
                  {result.markdown ? (
                    <button type="button" className="button-secondary" onClick={async () => {
                      await navigator.clipboard.writeText(result.markdown ?? "");
                      setCopied(true);
                    }}>{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? "已复制" : "复制草稿"}</button>
                  ) : null}
                </div>
                <button type="button" className="text-button" onClick={close}>完成</button>
              </div>
            ) : (
              <form className="submission-form correction-form" onSubmit={submit}>
                <label>
                  <span>修改内容 <b>*</b></span>
                  <textarea name="content" rows={5} required maxLength={3000} placeholder="哪里不对？应该改成什么？" autoFocus />
                </label>
                <label>
                  <span>参考来源</span>
                  <input name="source" maxLength={1000} placeholder="比赛 / 视频 / 帖子链接，便于核实" />
                </label>
                <label className="form-honeypot" aria-hidden="true">请勿填写<input name="website" tabIndex={-1} autoComplete="off" /></label>
                {error ? <p className="form-error" role="alert">{error}</p> : null}
                <div className="correction-submit">
                  <p>提交即进入 GitHub Issue 审核队列，无需离开本页。</p>
                  <button className="button-primary" disabled={loading}>{loading ? <LoaderCircle className="spin" size={16} /> : null}{loading ? "提交中" : "提交纠错"}</button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
