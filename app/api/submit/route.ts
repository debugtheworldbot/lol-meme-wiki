import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";

type Submission = Record<string, unknown>;
const fields = ["name", "summary", "details", "sourceUrl", "sourceType", "players", "teams", "events", "notes"] as const;

function text(value: unknown, max = 3000) {
  return typeof value === "string" ? value.replaceAll("\0", "").trim().slice(0, max) : "";
}

function markdown(payload: Submission) {
  const value = Object.fromEntries(fields.map((field) => [field, text(payload[field])])) as Record<(typeof fields)[number], string>;
  return [
    "## 基础信息",
    `- 梗名称：${value.name}`,
    `- 一句话解释：${value.summary}`,
    "",
    "## 详细说明",
    value.details || "未提供",
    "",
    "## 出处",
    `- 类型：${value.sourceType || "未提供"}`,
    `- 链接：${value.sourceUrl || "未提供"}`,
    "",
    "## 关系节点",
    `- 相关人物：${value.players || "未提供"}`,
    `- 相关战队：${value.teams || "未提供"}`,
    `- 相关赛事：${value.events || "未提供"}`,
    "",
    "## 补充说明",
    value.notes || "无",
    "",
    "---",
    "由 LOL 梗 Wiki 投稿表单生成。",
  ].join("\n");
}

export async function POST(request: Request) {
  let payload: Submission;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "请求格式无效。" }, { status: 400 }); }
  if (text(payload.website)) return NextResponse.json({ mode: "preview", markdown: "" });
  const name = text(payload.name, 80);
  const summary = text(payload.summary, 180);
  if (!name || !summary) return NextResponse.json({ error: "请填写梗名称和一句话解释。" }, { status: 400 });
  const body = markdown({ ...payload, name, summary });
  const repo = process.env.GITHUB_REPO ?? siteConfig.githubRepo;
  const token = process.env.GITHUB_TOKEN;

  if (repo && token && /^[\w.-]+\/[\w.-]+$/.test(repo)) {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
      body: JSON.stringify({ title: `[新梗] ${name}`, body, labels: ["新梗投稿"] }),
    });
    if (!response.ok) return NextResponse.json({ mode: "preview", markdown: body });
    const issue = await response.json();
    return NextResponse.json({ mode: "created", issueUrl: issue.html_url, markdown: body });
  }

  if (repo && /^[\w.-]+\/[\w.-]+$/.test(repo)) {
    const params = new URLSearchParams({ title: `[新梗] ${name}`, body, labels: "新梗投稿" });
    return NextResponse.json({ mode: "link", issueUrl: `https://github.com/${repo}/issues/new?${params}`, markdown: body });
  }
  return NextResponse.json({ mode: "preview", markdown: body });
}
