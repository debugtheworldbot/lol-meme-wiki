"use client";

import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";
import { track } from "@/lib/analytics";

export function RandomMemeButton({ slugs, compact = false }: { slugs: string[]; compact?: boolean }) {
  const router = useRouter();
  return (
    <button className={compact ? "random-button compact" : "random-button"} onClick={() => {
      const slug = slugs[Math.floor(Math.random() * slugs.length)];
      if (!slug) return;
      track("Random Meme Click", { slug });
      router.push(`/meme/${slug}`);
    }}>
      <Dices size={compact ? 17 : 20} />
      <span>随机一个梗</span>
      <b>↗</b>
    </button>
  );
}
