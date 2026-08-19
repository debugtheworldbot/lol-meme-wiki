import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";

type Correction = Record<string, unknown>;

function text(value: unknown, max = 3000) {
  return typeof value === "string" ? value.replaceAll("\0", "").trim().slice(0, max) : "";
}

function markdown(title: string, pathname: string, content: string, source: string) {
  return [
    `- 词条：${title}`,
    `- 页面：${pathname || "未提供"}`,
    "",
    "## 修改内容",
    content,
    "",
    "## 参考来源",
    source || "未提供",
    "",
    "---",
    "由 LOL 梗 Wiki 纠错入口生成。",
  ].join("\n");
}

export async function POST(request: Request) {
  let payload: Correction;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "请求格式无效。" }, { status: 400 }); }
  if (text(payload.website)) return NextResponse.json({ mode: "preview", markdown: "" });
  const title = text(payload.title, 120);
  const pathname = text(payload.pathname, 200);
  const content = text(payload.content);
  const source = text(payload.source, 1000);
  if (!title || !content) return NextResponse.json({ error: "请填写词条与修改内容。" }, { status: 400 });
  const body = markdown(title, pathname, content, source);
  const repo = process.env.GITHUB_REPO ?? siteConfig.githubRepo;
  const token = process.env.GITHUB_TOKEN;
  const issueTitle = `[补充/纠错] ${title}`;

  if (repo && token && /^[\w.-]+\/[\w.-]+$/.test(repo)) {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
      body: JSON.stringify({ title: issueTitle, body, labels: ["内容纠错"] }),
    });
    if (!response.ok) return NextResponse.json({ mode: "preview", markdown: body });
    const issue = await response.json();
    return NextResponse.json({ mode: "created", issueUrl: issue.html_url, markdown: body });
  }

  if (repo && /^[\w.-]+\/[\w.-]+$/.test(repo)) {
    const params = new URLSearchParams({ title: issueTitle, body, labels: "内容纠错" });
    return NextResponse.json({ mode: "link", issueUrl: `https://github.com/${repo}/issues/new?${params}`, markdown: body });
  }
  return NextResponse.json({ mode: "preview", markdown: body });
}
