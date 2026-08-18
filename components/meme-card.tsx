import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MemeEntry } from "@/lib/types";

export function MemeCard({ meme, index, featured = false }: { meme: MemeEntry; index?: number; featured?: boolean }) {
  return (
    <Link href={`/meme/${meme.slug}`} className={featured ? "meme-card featured" : "meme-card"}>
      <div className="meme-card-top">
        <span className="meme-index">{String(index ?? 1).padStart(2, "0")}</span>
        <span className="meme-heat">{meme.heat ? `${meme.heat}° 热度` : "新收录"}</span>
      </div>
      <div>
        <h3>{meme.title}</h3>
        <p>{meme.summary}</p>
      </div>
      <div className="meme-card-bottom">
        <span>{meme.tags.slice(0, 2).join(" · ")}</span>
        <ArrowUpRight size={18} />
      </div>
    </Link>
  );
}
