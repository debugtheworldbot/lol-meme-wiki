import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// 检查可机械验证的来源与关联错误；不把字数或链接数量当作内容质量评分。
const root = path.join(process.cwd(), "content");
const collections = Object.fromEntries(
  ["memes", "players", "teams", "events"].map((kind) => [
    kind,
    fs.readdirSync(path.join(root, kind)).filter((file) => file.endsWith(".mdx")).map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(root, kind, file), "utf8"));
      return { file, ...data, body: content };
    }),
  ]),
);
const errors = [];
const slugs = Object.fromEntries(Object.entries(collections).map(([kind, entries]) => [kind, new Set(entries.map((entry) => entry.slug))]));
const published = new Set(collections.memes.filter((entry) => entry.draft !== true).map((entry) => entry.slug));
for (const [kind, entries] of Object.entries(collections)) {
  for (const entry of entries) {
    const fail = (message) => errors.push(kind + "/" + entry.file + ": " + message);
    if (entry.slug !== entry.file.slice(0, -4)) fail("slug 与文件名不一致");
    for (const key of ["title", "summary"]) {
      if (typeof entry[key] !== "string" || !entry[key].trim()) fail(key + " 不能为空");
    }
    if (kind !== "memes") continue;
    if (entry.draft !== undefined && typeof entry.draft !== "boolean") fail("draft 必须是布尔值");
    for (const [field, target] of [["players", "players"], ["teams", "teams"], ["events", "events"], ["related", "memes"]]) {
      if (!Array.isArray(entry[field])) fail(field + " 必须是数组");
      else for (const slug of entry[field]) if (!slugs[target].has(slug)) fail(field + " 关联不存在: " + slug);
    }
    if (entry.draft === true) {
      if (!entry.source_note?.trim()) fail("待考证稿件必须说明撤回或未发布原因");
      continue;
    }
    if (!entry.body.trim()) fail("正文不能为空");
    if (!Array.isArray(entry.sources) || !entry.sources.length) fail("公开词条必须有具体来源");
    else for (const source of entry.sources) {
      if (!source.title?.trim()) fail("来源缺少标题");
      if (!["video", "match", "post", "article"].includes(source.kind)) fail("来源类型缺失或无效");
      try {
        const url = new URL(source.url);
        if (!["https:", "http:"].includes(url.protocol)) fail("来源必须使用 HTTP(S)");
        if (url.hostname.startsWith("search.") || /\/(search|search_result)(\/|$)/.test(url.pathname)) fail("搜索结果不能充当来源: " + source.url);
        if (url.pathname === "/" || /^\/(?:[a-z]{2}-[A-Z]{2}\/)?news\/?$/.test(url.pathname)) fail("首页或新闻目录不能充当具体来源: " + source.url);
      } catch {
        fail("来源 URL 无效");
      }
    }
    // related 允许留存草稿外键，运行时会过滤；正文硬编码链接则需要编辑处理。
    for (const match of entry.body.matchAll(/\]\(\/meme\/([^\s)#?]+)/g)) {
      if (!published.has(match[1])) fail("正文链接指向未公开词条: " + match[1]);
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("内容校验通过：" + published.size + " 篇公开词条，" + (collections.memes.length - published.size) + " 篇待考证。");
}
