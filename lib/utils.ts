import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/lib/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string) {
  if (!date) return "待考";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00+08:00`));
}

export function getIssueBody(title: string, pathname: string) {
  return [
    `词条：${title}`,
    `页面：${pathname}`,
    "",
    "修改内容：",
    "",
    "参考来源：",
  ].join("\n");
}

export function getIssueUrl(title: string, pathname: string) {
  const repo = siteConfig.githubRepo;
  const params = new URLSearchParams({
    title: `[补充/纠错] ${title}`,
    body: getIssueBody(title, pathname),
    labels: "内容纠错",
  });
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
