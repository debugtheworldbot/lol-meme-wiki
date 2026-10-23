export type ChineseConverter = (text: string) => string;

let simplified: Promise<ChineseConverter> | null = null;

export function loadSimplifiedConverter(): Promise<ChineseConverter> {
  simplified ??= import("opencc-js/t2cn")
    .then(({ Converter }) => Converter({ from: "tw", to: "cn" }))
    .catch((error: unknown) => { simplified = null; throw error; });
  return simplified;
}
