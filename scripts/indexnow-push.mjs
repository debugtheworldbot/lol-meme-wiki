// 把站点 URL 推给 IndexNow，一次提交同时喂 Bing / Yandex / Seznam / Naver。
//
// key 不是密钥：IndexNow 靠「public/<key>.txt 能被公开抓到」来验证站点所有权，
// 所以它必须进仓库、必须可匿名访问。脚本默认就从 public/ 里认出那个文件，
// key 只存一处，不会出现文件和参数两边不同步。
//
//   npm run push:indexnow                              # 推 sitemap 全量
//   npm run push:indexnow -- --changed HEAD~1..HEAD    # 只推这些提交改过的词条
//   npm run push:indexnow -- --since 2026-08-01        # 按 sitemap 的 lastmod 筛
//   npm run push:indexnow -- --url /meme/wo-chovy
//   npm run push:indexnow -- --verify                  # 推前确认线上已 200（CI 用）
//   npm run push:indexnow -- --dry-run                 # 只打印，不发请求

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const PUBLIC_DIR = "public";
const BATCH = 10000; // IndexNow 单请求 URL 上限
// content/ 的目录名 → 路由前缀。和 app/sitemap.ts 的单数路径保持一致。
const CONTENT_ROUTES = { memes: "meme", players: "player", teams: "team", events: "event" };
const VERIFY_TIMEOUT_MS = 180000;
const VERIFY_INTERVAL_MS = 10000;

function parseArgs(argv) {
  const opts = { urls: [], dryRun: false, verify: false, limit: Infinity, since: null, changed: null, site: null, key: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("-")) throw new Error(`${arg} 缺少参数值`);
      i += 1;
      return value;
    };
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--verify") opts.verify = true;
    else if (arg === "--url") opts.urls.push(next());
    else if (arg === "--since") opts.since = next();
    else if (arg === "--changed") opts.changed = next();
    else if (arg === "--site") opts.site = next();
    else if (arg === "--key") opts.key = next();
    else if (arg === "--limit") {
      const n = Number(next());
      if (!Number.isInteger(n) || n <= 0) throw new Error("--limit 要正整数");
      opts.limit = n;
    } else throw new Error(`未知参数 ${arg}`);
  }
  if (opts.since && Number.isNaN(Date.parse(opts.since))) throw new Error(`--since 不是合法日期：${opts.since}`);
  return opts;
}

// public/ 下内容与文件名主干一致的 .txt 就是 key 文件——IndexNow 对它的要求恰好让它自我标识。
function detectKey() {
  const found = readdirSync(PUBLIC_DIR)
    .filter((name) => extname(name) === ".txt")
    .map((name) => ({ name, stem: basename(name, ".txt"), body: readFileSync(join(PUBLIC_DIR, name), "utf8").trim() }))
    .filter((file) => file.body === file.stem);
  if (found.length === 0) throw new Error(`${PUBLIC_DIR}/ 里没有 IndexNow key 文件（<key>.txt，内容为 key 本身）`);
  if (found.length > 1) throw new Error(`${PUBLIC_DIR}/ 里有多个 key 文件：${found.map((f) => f.name).join(", ")}，用 --key 指定`);
  return found[0].stem;
}

function normalizeSite(raw) {
  if (!raw) throw new Error("没有站点地址：设 NEXT_PUBLIC_SITE_URL，或传 --site https://your-domain");
  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withScheme);
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") throw new Error(`站点是 ${url.origin}，本地地址推不了，用 --site 或 NEXT_PUBLIC_SITE_URL 指定线上域名`);
  return url.origin;
}

// 只认新增/改名/修改，删掉的词条不推：它的 URL 已经 404，等不到 --verify 通过，
// 让 Bing 按 sitemap 自然移除即可。
function changedContentPaths(range) {
  let out;
  try {
    out = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", range, "--", "content/"], { encoding: "utf8" });
  } catch {
    throw new Error(`git diff ${range} 失败：范围不存在或仓库历史不完整（CI 里记得 fetch-depth: 0）`);
  }
  const paths = [];
  const skipped = [];
  for (const line of out.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const match = line.match(/^content\/([^/]+)\/(.+)\.mdx$/);
    const route = match && CONTENT_ROUTES[match[1]];
    if (route) paths.push(`/${route}/${match[2]}`);
    else skipped.push(line);
  }
  if (skipped.length > 0) console.log(`跳过 ${skipped.length} 个无法映射成路由的文件：${skipped.slice(0, 3).join(", ")}`);
  return paths;
}

async function isLive(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "user-agent": "indexnow-push" } });
    return res.status === 200;
  } catch {
    return false;
  }
}

// 部署是原子切换的，推早了 Bing 会抓到旧部署上的 404，反而伤信任度。
async function waitLive(urls, singlePass = false) {
  const pending = new Set(urls);
  const live = [];
  const deadline = Date.now() + VERIFY_TIMEOUT_MS;
  for (;;) {
    const results = await Promise.all([...pending].map(async (url) => [url, await isLive(url)]));
    for (const [url, ok] of results) {
      if (ok) {
        live.push(url);
        pending.delete(url);
      }
    }
    if (pending.size === 0 || singlePass || Date.now() >= deadline) break;
    console.log(`等 ${pending.size} 条上线，${VERIFY_INTERVAL_MS / 1000}s 后重试…`);
    await new Promise((resolve) => setTimeout(resolve, VERIFY_INTERVAL_MS));
  }
  return { live: urls.filter((url) => live.includes(url)), missing: [...pending] };
}

async function fetchSitemap(site) {
  const url = `${site}/sitemap.xml`;
  const res = await fetch(url, { headers: { "user-agent": "indexnow-push" } });
  if (!res.ok) throw new Error(`拉 ${url} 失败：HTTP ${res.status}`);
  const xml = await res.text();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: match[1].match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim(),
    lastmod: match[1].match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1]?.trim() ?? null,
  }));
  if (entries.length === 0) throw new Error(`${url} 里没解析出 <url> 条目`);
  return entries.filter((entry) => entry.loc);
}

async function submit(site, key, urls) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(site).hostname, key, keyLocation: `${site}/${key}.txt`, urlList: urls }),
  });
  // IndexNow 用状态码表达原因，body 通常是空的，所以这里把码翻出来。
  const meaning = {
    200: "已接收",
    202: "已接收，key 仍在验证中（首次推送正常，稍后会自动通过）",
    400: "请求格式有问题",
    403: "key 无效——线上抓不到 key 文件，或内容不匹配",
    422: "URL 与 host 不符，或 key 与站点对不上",
    429: "推太频繁，被限流",
  }[res.status] ?? "未知响应";
  return { status: res.status, ok: res.status === 200 || res.status === 202, meaning };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const site = normalizeSite(opts.site ?? process.env.NEXT_PUBLIC_SITE_URL ?? "");
  const key = opts.key ?? process.env.INDEXNOW_KEY ?? detectKey();
  const toAbsolute = (raw) => (/^https?:\/\//.test(raw) ? raw : `${site}${raw.startsWith("/") ? "" : "/"}${raw}`);

  let urls;
  let scope;
  if (opts.urls.length > 0 || opts.changed) {
    const manual = opts.urls;
    const fromGit = opts.changed ? changedContentPaths(opts.changed) : [];
    urls = [...manual, ...fromGit].map(toAbsolute);
    scope = [manual.length > 0 ? `手动 ${manual.length} 条` : null, opts.changed ? `${opts.changed} 改动 ${fromGit.length} 条` : null].filter(Boolean).join(" + ");
  } else {
    let entries = await fetchSitemap(site);
    const total = entries.length;
    if (opts.since) {
      const cutoff = Date.parse(opts.since);
      entries = entries.filter((entry) => entry.lastmod && Date.parse(entry.lastmod) >= cutoff);
      scope = `sitemap ${total} 条 → lastmod ≥ ${opts.since} 命中 ${entries.length} 条`;
    } else scope = `sitemap 全量 ${total} 条`;
    urls = entries.map((entry) => entry.loc);
  }

  // 同 host 是 IndexNow 的硬要求，混进别的域名整批会被拒。
  const foreign = urls.filter((url) => new URL(url).origin !== site);
  if (foreign.length > 0) throw new Error(`${foreign.length} 条 URL 不属于 ${site}，例如 ${foreign[0]}`);

  urls = [...new Set(urls)];
  if (Number.isFinite(opts.limit)) urls = urls.slice(0, opts.limit);

  console.log(`站点 ${site}`);
  console.log(`key  ${key}（${site}/${key}.txt）`);
  console.log(`范围 ${scope}${Number.isFinite(opts.limit) ? `，--limit 截到 ${urls.length} 条` : ""}`);

  if (urls.length === 0) {
    console.log("没有要推的 URL。");
    return;
  }

  // dry-run 也走 verify，否则预演看不到哪些会被筛掉；但只探一轮，不干等 3 分钟。
  if (opts.verify) {
    const { live, missing } = await waitLive(urls, opts.dryRun);
    if (missing.length > 0) console.warn(`${missing.length} 条${opts.dryRun ? "当前不可访问" : ` ${VERIFY_TIMEOUT_MS / 1000}s 内没等到 200`}，跳过：${missing.slice(0, 5).join(", ")}`);
    urls = live;
    console.log(`--verify 通过 ${urls.length} 条`);
    if (urls.length === 0 && !opts.dryRun) {
      console.error("没有已上线的 URL 可推。");
      process.exitCode = 1;
      return;
    }
  }

  if (opts.dryRun) {
    console.log(`\n--dry-run，以下 ${urls.length} 条不会发出：`);
    console.log(urls.slice(0, 20).join("\n"));
    if (urls.length > 20) console.log(`… 其余 ${urls.length - 20} 条略`);
    return;
  }

  let failed = 0;
  for (let i = 0; i < urls.length; i += BATCH) {
    const chunk = urls.slice(i, i + BATCH);
    const result = await submit(site, key, chunk);
    console.log(`推送 ${chunk.length} 条 → HTTP ${result.status} ${result.meaning}`);
    if (!result.ok) failed += chunk.length;
  }
  if (failed > 0) {
    console.error(`\n${failed} 条未被接收。`);
    process.exitCode = 1;
  } else {
    console.log(`\n完成，共 ${urls.length} 条。收录情况看 Bing Webmaster Tools 的 IndexNow 报告。`);
  }
}

main().catch((error) => {
  console.error(`失败：${error.message}`);
  process.exitCode = 1;
});
