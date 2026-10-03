"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { Check, Clipboard, ExternalLink, LoaderCircle } from "lucide-react";
import { track } from "@/lib/analytics";

type SubmitResult = { mode: "created" | "link" | "preview"; issueUrl?: string; markdown?: string };

export function SubmissionForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const wasResultRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const id = useId();

  useEffect(() => {
    const requestedName = new URLSearchParams(window.location.search).get("name");
    if (requestedName && nameRef.current) nameRef.current.value = requestedName.slice(0, 80);
  }, []);

  useEffect(() => {
    if (result) {
      wasResultRef.current = true;
      resultHeadingRef.current?.focus();
    } else if (wasResultRef.current) {
      wasResultRef.current = false;
      nameRef.current?.focus();
    }
  }, [result]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    track("Meme Submission Start");
    setLoading(true);
    setError("");
    setCopied(false);
    setCopyError("");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "提交失败，请稍后重试。");
      setResult(data);
      track("Meme Submission Success", { mode: data.mode });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "提交失败，请稍后重试。");
      track("Meme Submission Failure");
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

  if (result) {
    return (
      <div className="submission-success">
        {result.mode === "created" ? <span className="success-icon"><Check size={20} aria-hidden="true" /></span> : null}
        <h2 ref={resultHeadingRef} tabIndex={-1}>{result.mode === "created" ? "投稿已进入审核队列" : result.mode === "link" ? "还差一步，前往确认提交" : "投稿草稿已生成"}</h2>
        <p>{result.mode === "created" ? "谢谢你补充这个梗。维护者会核实来源、整理措辞，再收录到百科。你可以在 GitHub 查看处理进度。" : result.mode === "link" ? "内容已整理好，请打开 GitHub 确认提交。完成前，维护者还不会收到这份投稿。" : "这份草稿尚未提交。请先复制保存，稍后再来提交。"}</p>
        <div className="success-actions">
          {result.issueUrl ? <a className="button-primary" href={result.issueUrl} target="_blank" rel="noreferrer">{result.mode === "created" ? "查看处理进度" : "前往 GitHub 提交"}<ExternalLink size={17} aria-hidden="true" /></a> : null}
          {result.markdown ? <button type="button" className="button-secondary" onClick={() => { void copyDraft(); }}>{copied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}{copied ? "已复制" : "复制投稿草稿"}</button> : null}
        </div>
        <p className="submission-status" role="status">{copied ? "草稿已复制到剪贴板。" : ""}</p>
        {copyError ? <p className="form-error" role="alert">{copyError}</p> : null}
        {result.markdown ? <details className="draft-preview" open={Boolean(copyError)}><summary>查看投稿草稿</summary><textarea readOnly value={result.markdown} rows={10} aria-label="投稿草稿，可选中后复制" /></details> : null}
        <button type="button" className="text-button" onClick={() => { setResult(null); setCopied(false); setCopyError(""); }}>再提交一条</button>
      </div>
    );
  }

  return (
    <form className="submission-form" onSubmit={submit} aria-busy={loading}>
      <p className="form-help">标注“必填”的两项需要填写，其余可以按你了解的情况补充。</p>
      <fieldset className="form-section">
        <legend>这个梗是什么</legend>
        <label>
          <span>梗名称 <small className="form-required">必填</small></span>
          <input ref={nameRef} name="name" required maxLength={80} placeholder="例如：我 Chovy" />
        </label>
        <label>
          <span>一句话解释 <small className="form-required">必填</small></span>
          <input name="summary" required maxLength={180} placeholder="用一句话解释，让没看过的人也能明白" />
        </label>
        <label>
          <span>详细说明</span>
          <textarea name="details" rows={5} maxLength={3000} placeholder="发生了什么？后来大家在什么场景下使用这个梗？" />
        </label>
      </fieldset>
      <fieldset className="form-section">
        <legend>它从哪里来</legend>
        <p className="form-help" id={`${id}-source-help`}>优先提供原始比赛、视频或帖子。暂时找不到也可以先提交线索。</p>
        <div className="form-row two-columns">
          <label><span>出处链接</span><input name="sourceUrl" type="url" maxLength={3000} placeholder="https://…" aria-describedby={`${id}-source-help`} autoCapitalize="off" spellCheck={false} /></label>
          <label><span>来源类型</span><select name="sourceType" defaultValue="比赛"><option>比赛</option><option>视频</option><option>帖子</option><option>直播</option><option>其他</option></select></label>
        </div>
      </fieldset>
      <fieldset className="form-section">
        <legend>相关背景</legend>
        <div className="form-row three-columns">
          <label><span>相关人物</span><input name="players" maxLength={3000} placeholder="例如：Chovy、Bin" /></label>
          <label><span>相关战队</span><input name="teams" maxLength={3000} placeholder="例如：BLG" /></label>
          <label><span>相关赛事</span><input name="events" maxLength={3000} placeholder="例如：2025 全球总决赛" /></label>
        </div>
        <label><span>补充说明</span><textarea name="notes" rows={3} maxLength={3000} placeholder="有争议的说法、待核实的细节，或容易被误解的语境。" /></label>
      </fieldset>
      <label className="form-honeypot" aria-hidden="true">请勿填写<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="form-submit-row">
        <p>投稿由维护者核实与编辑，通过审核后才会公开收录。</p>
        <button type="submit" className="button-primary" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : null}{loading ? "正在提交…" : "提交新梗"}</button>
      </div>
    </form>
  );
}
