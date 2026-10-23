export type ChineseConverter = (text: string) => string;

let traditional: Promise<ChineseConverter> | null = null;
let simplified: Promise<ChineseConverter> | null = null;

export function loadTraditionalConverter(): Promise<ChineseConverter> {
  traditional ??= import("opencc-js/cn2t")
    // tw 只转换字形；不使用会替换地区用语的 twp，保留梗的原有说法。
    .then(({ Converter }) => Converter({ from: "cn", to: "tw" }))
    .catch((error: unknown) => { traditional = null; throw error; });
  return traditional;
}

export function loadSimplifiedConverter(): Promise<ChineseConverter> {
  simplified ??= import("opencc-js/t2cn")
    .then(({ Converter }) => Converter({ from: "tw", to: "cn" }))
    .catch((error: unknown) => { simplified = null; throw error; });
  return simplified;
}
