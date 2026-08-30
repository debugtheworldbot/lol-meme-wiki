import type Fuse from "fuse.js";
import type { SearchRecord } from "@/lib/types";

export interface ClientSearchIndex {
  records: SearchRecord[];
  fuse: Fuse<SearchRecord>;
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
  ]).then(async ([{ default: FuseConstructor }, response]) => {
    if (!response.ok) throw new Error("搜索索引加载失败");
    const records = await response.json() as SearchRecord[];
    if (!Array.isArray(records)) throw new Error("搜索索引格式错误");

    cachedIndex = {
      records,
      fuse: new FuseConstructor(records, fuseOptions),
    };
    return cachedIndex;
  }).catch((error: unknown) => {
    pendingIndex = null;
    throw error;
  });

  return pendingIndex;
}
