// 把站点 URL 推给 IndexNow，一次提交同时喂 Bing / Yandex / Seznam / Naver。
//
// key 不是密钥：IndexNow 靠「public/<key>.txt 能被公开抓到」来验证站点所有权，
// 所以它必须进仓库、必须可匿名访问。脚本默认就从 public/ 里认出那个文件，
// key 只存一处，不会出现文件和参数两边不同步。
//
//   npm run push:indexnow                      # 推 sitemap 全量
//   npm run push:indexnow -- --since 2026-08-01  # 只推这天之后改过的
//   npm run push:indexnow -- --url /meme/wo-chovy --url /memes
//   npm run push:indexnow -- --dry-run         # 只打印，不发请求

import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const PUBLIC_DIR = "public";
const BATCH = 10000; // IndexNow 单请求 URL 上限

function parseArgs(argv) {
  const opts = { urls: [], dryRun: false, limit: Infinity, since: null, site: null, key: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("-")) throw new Error(`${arg} 缺少参数值`);
      i += 1;
      return value;
    };
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--url") opts.urls.push(next());
    else if (arg === "--since") opts.since = next();
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

  let urls;
  let scope;
  if (opts.urls.length > 0) {
    urls = opts.urls.map((raw) => (/^https?:\/\//.test(raw) ? raw : `${site}${raw.startsWith("/") ? "" : "/"}${raw}`));
    scope = "手动指定";
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
