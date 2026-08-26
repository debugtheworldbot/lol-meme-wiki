#!/usr/bin/env python3
"""Dump meme/player/team/event slugs for gap-checking."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
CONTENT = ROOT / "content"


def field(text: str, name: str) -> str:
    m = re.search(rf'^{name}:\s*"(.*)"', text, re.M)
    return m.group(1) if m else ""


def list_field(text: str, name: str) -> list[str]:
    m = re.search(rf"^{name}:\s*\[(.*?)\]", text, re.M)
    return re.findall(r'"([^"]*)"', m.group(1)) if m else []


def load(kind: str) -> list[dict]:
    rows = []
    for path in sorted((CONTENT / kind).glob("*.mdx")):
        text = path.read_text(encoding="utf-8")
        rows.append(
            {
                "file": path.name,
                "slug": field(text, "slug") or path.stem,
                "title": field(text, "title"),
                "aliases": list_field(text, "aliases"),
                "first_seen": field(text, "first_seen"),
                "tags": list_field(text, "tags"),
            }
        )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kind", choices=["memes", "players", "teams", "events"], default="memes")
    parser.add_argument("--recent", action="store_true", help="only 2025/2026 tags or first_seen")
    args = parser.parse_args()
    rows = load(args.kind)
    if args.recent:
        rows = [
            r
            for r in rows
            if any(y in (r["first_seen"] + " ".join(r["tags"]) + r["title"]) for y in ("2025", "2026", "S15", "S16"))
        ]
    for r in rows:
        aliases = " | " + ", ".join(r["aliases"]) if r["aliases"] else ""
        seen = r["first_seen"] or "-"
        print(f"{r['slug']}\t{r['title']}\t{seen}{aliases}")
    print(f"# {args.kind} {len(rows)}", flush=True)


if __name__ == "__main__":
    main()
