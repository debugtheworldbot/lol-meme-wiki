import type Fuse from "fuse.js";
import type { SearchRecord } from "@/lib/types";
import { loadSimplifiedConverter, type ChineseConverter } from "@/lib/chinese-converter";

export interface ClientSearchIndex {
  records: SearchRecord[];
  fuse: Fuse<SearchRecord>;
  normalizeQuery: ChineseConverter;
}

const fuseOptions = {
  keys: [
    { name: "title", weight: 0.45 },
    { name: "aliases", weight: 0.28 },
    { name: "keywords", weight: 0.17 },
    { name: "subtitle", weight: 0.1 },
  ],
  threshold: 0.36,
  ignoreLocation: true,
  minMatchCharLength: 1,
};

let cachedIndex: ClientSearchIndex | null = null;
let pendingIndex: Promise<ClientSearchIndex> | null = null;

export function loadClientSearchIndex(): Promise<ClientSearchIndex> {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  if (pendingIndex) return pendingIndex;

  pendingIndex = Promise.all([
    import("fuse.js"),
    fetch("/api/search-index"),
    loadSimplifiedConverter(),
  ]).then(async ([{ default: FuseConstructor }, response, normalizeQuery]) => {
    if (!response.ok) throw new Error("搜索索引加载失败");
    const records = await response.json() as SearchRecord[];
    if (!Array.isArray(records)) throw new Error("搜索索引格式错误");

    cachedIndex = {
      records,
      fuse: new FuseConstructor(records, {
        ...fuseOptions,
        getFn: (record, path) => {
          const value = FuseConstructor.config.getFn(record, path);
          return typeof value === "string" ? normalizeQuery(value) : value.map(normalizeQuery);
        },
      }),
      normalizeQuery,
    };
    return cachedIndex;
  }).catch((error: unknown) => {
    pendingIndex = null;
    throw error;
  });

  return pendingIndex;
}
