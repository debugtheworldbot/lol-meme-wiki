"use client";

import { FormEvent, useState } from "react";
import { Check, Clipboard, ExternalLink, LoaderCircle } from "lucide-react";
import { track } from "@/lib/analytics";

type SubmitResult = { mode: "created" | "link" | "preview"; issueUrl?: string; markdown?: string };

export function SubmissionForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
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
      track("Meme Submission", { mode: data.mode });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "提交失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="submission-success">
        <span className="success-icon"><Check size={20} /></span>
        <h2>{result.mode === "created" ? "投稿已进入审核队列" : "投稿草稿已生成"}</h2>
        <p>{result.mode === "created" ? "感谢补全这份社区档案。维护者会在 GitHub Issue 中审核来源与措辞。" : "当前环境未启用自动建 Issue。你可以复制规范化草稿，或前往已配置的 GitHub 仓库提交。"}</p>
        <div className="success-actions">
          {result.issueUrl ? <a className="button-primary" href={result.issueUrl} target="_blank" rel="noreferrer">打开 GitHub Issue <ExternalLink size={17} /></a> : null}
          {result.markdown ? (
            <button className="button-secondary" onClick={async () => {
              await navigator.clipboard.writeText(result.markdown ?? "");
              setCopied(true);
            }}>{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? "已复制" : "复制投稿草稿"}</button>
          ) : null}
        </div>
        <button className="text-button" onClick={() => setResult(null)}>再提交一条</button>
      </div>
    );
  }

  return (
    <form className="submission-form" onSubmit={submit}>
      <div className="form-row two-columns">
        <label><span>梗名称 <b>*</b></span><input name="name" required maxLength={80} placeholder="例如：科目四" /></label>
        <label><span>一句话解释 <b>*</b></span><input name="summary" required maxLength={180} placeholder="用一句话回答“这是什么梗？”" /></label>
      </div>
      <label><span>详细说明</span><textarea name="details" rows={6} placeholder="发生了什么？后来这个词又是怎么被使用的？" /></label>
      <div className="form-row two-columns">
        <label><span>出处链接</span><input name="sourceUrl" type="url" placeholder="比赛 / 视频 / 帖子链接" /></label>
        <label><span>来源类型</span><select name="sourceType" defaultValue="比赛"><option>比赛</option><option>视频</option><option>帖子</option><option>直播</option><option>其他</option></select></label>
      </div>
      <div className="form-row three-columns">
        <label><span>相关人物</span><input name="players" placeholder="Clearlove, Uzi" /></label>
        <label><span>相关战队</span><input name="teams" placeholder="EDG" /></label>
        <label><span>相关赛事</span><input name="events" placeholder="Worlds 2016" /></label>
      </div>
      <label><span>补充说明</span><textarea name="notes" rows={3} placeholder="有争议的说法、待核实信息，或你希望编辑注意的语境。" /></label>
      <label className="form-honeypot" aria-hidden="true">请勿填写<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="form-submit-row">
        <p>提交即表示你同意维护者对措辞与结构进行编辑。争议内容必须附可靠来源。</p>
        <button className="button-primary" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : null}{loading ? "正在整理投稿" : "提交至审核队列"}<span>↗</span></button>
      </div>
    </form>
  );
}
