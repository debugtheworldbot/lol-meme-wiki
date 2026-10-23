"use client";

import { LocalizedContent } from "@/components/localized-content";

import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";
import { track } from "@/lib/analytics";
import { useLocale } from "@/components/locale-provider";
import { withLocalePath } from "@/lib/locale-path";

export function RandomMemeButton({ slugs, compact = false }: { slugs: string[]; compact?: boolean }) {
  const router = useRouter();
  const { locale } = useLocale();
  return <LocalizedContent>{(
    <button className={compact ? "random-button compact" : "random-button"} onClick={() => {
      const slug = slugs[Math.floor(Math.random() * slugs.length)];
      if (!slug) return;
      track("Random Meme Click", { slug });
      router.push(withLocalePath(`/meme/${slug}`, locale));
    }}>
      <Dices size={compact ? 17 : 20} />
      <span>随机一个梗</span>
      <b>↗</b>
    </button>
  )}</LocalizedContent>;
}
