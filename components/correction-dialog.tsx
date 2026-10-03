"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Clipboard, ExternalLink, LoaderCircle, X } from "lucide-react";
import { track } from "@/lib/analytics";

type CorrectionResult = { mode: "created" | "link" | "preview"; issueUrl?: string; markdown?: string };

export function CorrectionDialog({ title, pathname }: { title: string; pathname: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const wasOpenRef = useRef(false);
  const id = useId();

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previousOverflow; };
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (result) resultHeadingRef.current?.focus();
    else contentRef.current?.focus();
  }, [open, result]);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], summary',
    )).filter((element) => element.tabIndex >= 0 && !element.closest('[aria-hidden="true"]') && element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === resultHeadingRef.current)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    track("Correction Submission Start", { page: pathname });
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
      track("Correction Submission Success", { mode: data.mode, page: pathname });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "提交失败，请稍后重试。");
      track("Correction Submission Failure", { page: pathname });
    } finally {
      setLoading(false);
    }
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(result?.markdown ?? "");
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError("未能复制，请在下方草稿中选中文字手动复制。");
    }
  }

  return (
    <>
      <button ref={triggerRef} type="button" className="wiki-tool-button" aria-haspopup="dialog" aria-expanded={open} onClick={() => {
        track("Correction Open", { page: pathname });
        setOpen(true);
      }}>补充 / 纠错</button>
      {open ? createPortal(
        <div className="correction-overlay" role="presentation" onPointerDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="correction-modal" role="dialog" aria-modal="true" aria-labelledby={`${id}-heading`} aria-describedby={`${id}-description`} onKeyDown={handleDialogKeyDown}>
            <header className="correction-head">
              <div>
                <h2 id={`${id}-heading`}>补充或纠正词条</h2>
                <p className="correction-subtitle" id={`${id}-description`}>{title}</p>
              </div>
              <button type="button" className="correction-close" onClick={() => setOpen(false)} aria-label="关闭纠错窗口"><X size={20} aria-hidden="true" /></button>
            </header>
            {result ? (
              <div className="correction-result">
                {result.mode === "created" ? <span className="success-icon"><Check size={20} aria-hidden="true" /></span> : null}
                <h3 ref={resultHeadingRef} tabIndex={-1}>{result.mode === "created" ? "纠错已提交" : result.mode === "link" ? "还差一步，前往确认提交" : "纠错草稿已生成"}</h3>
                <p>{result.mode === "created" ? "谢谢你帮忙校对。维护者核实来源后会更新词条，你可以在 GitHub 查看处理进度。" : result.mode === "link" ? "内容已整理好，请打开 GitHub 确认提交。完成前，维护者还不会收到这条纠错。" : "这份草稿尚未提交。请先复制保存，稍后再来提交。"}</p>
                <div className="success-actions">
                  {result.issueUrl ? <a className="button-primary" href={result.issueUrl} target="_blank" rel="noreferrer">{result.mode === "created" ? "查看处理进度" : "前往 GitHub 提交"}<ExternalLink size={16} aria-hidden="true" /></a> : null}
                  {result.markdown ? <button type="button" className="button-secondary" onClick={() => { void copyDraft(); }}>{copied ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}{copied ? "已复制" : "复制草稿"}</button> : null}
                </div>
                <p className="submission-status" role="status">{copied ? "草稿已复制到剪贴板。" : ""}</p>
                {copyError ? <p className="form-error" role="alert">{copyError}</p> : null}
                {result.markdown ? <details className="draft-preview" open={Boolean(copyError)}><summary>查看草稿</summary><textarea readOnly value={result.markdown} rows={7} aria-label="纠错草稿，可选中后复制" /></details> : null}
                <div className="success-actions">
                  <button type="button" className="text-button" onClick={() => {
                    setResult(null); setContent(""); setSource(""); setCopied(false); setCopyError(""); setError("");
                  }}>再补充一条</button>
                  <button type="button" className="text-button" onClick={() => setOpen(false)}>完成</button>
                </div>
              </div>
            ) : (
              <form className="submission-form correction-form" onSubmit={submit} aria-busy={loading}>
                <label>
                  <span>修改内容 <small className="form-required">必填</small></span>
                  <textarea ref={contentRef} name="content" rows={5} required maxLength={3000} value={content} onChange={(event) => setContent(event.target.value)} placeholder="哪里不准确？你建议改成什么？" aria-describedby={`${id}-content-help`} />
                  <small className="form-help" id={`${id}-content-help`}>可以补充出处、修正事实，或解释容易误解的语境。</small>
                </label>
                <label>
                  <span>参考来源</span>
                  <input name="source" maxLength={1000} value={source} onChange={(event) => setSource(event.target.value)} placeholder="比赛、视频或帖子链接" aria-describedby={`${id}-source-help`} />
                  <small className="form-help" id={`${id}-source-help`}>可选。直接出处能帮助维护者更快核实。</small>
                </label>
                <label className="form-honeypot" aria-hidden="true">请勿填写<input name="website" tabIndex={-1} autoComplete="off" /></label>
                {error ? <p className="form-error" role="alert">{error}</p> : null}
                <div className="correction-submit">
                  <p>核实后再更新词条；提交结果会显示在这里。</p>
                  <button type="submit" className="button-primary" disabled={loading}>{loading ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : null}{loading ? "正在提交…" : "提交纠错"}</button>
                </div>
              </form>
            )}
          </section>
        </div>, document.body,
      ) : null}
    </>
  );
}
