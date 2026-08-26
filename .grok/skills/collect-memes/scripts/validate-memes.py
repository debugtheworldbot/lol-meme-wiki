#!/usr/bin/env python3
"""Validate meme front matter: required fields, slug=filename, FK slugs exist."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
CONTENT = ROOT / "content"
REQUIRED = ("title", "slug", "summary", "players", "teams", "events", "related", "tags", "sources")


def slugs(kind: str) -> set[str]:
    out: set[str] = set()
    for path in (CONTENT / kind).glob("*.mdx"):
        text = path.read_text(encoding="utf-8")
        m = re.search(r'^slug:\s*"([^"]+)"', text, re.M)
        out.add(m.group(1) if m else path.stem)
    return out


def list_field(text: str, name: str) -> list[str]:
    m = re.search(rf"^{name}:\s*\[(.*?)\]", text, re.M)
    return re.findall(r'"([^"]*)"', m.group(1)) if m else []


def main() -> int:
    names = sys.argv[1:]
    paths = [CONTENT / "memes" / n for n in names] if names else sorted((CONTENT / "memes").glob("*.mdx"))
    memes, players, teams, events = slugs("memes"), slugs("players"), slugs("teams"), slugs("events")
    errors: list[str] = []
    for path in paths:
        if not path.exists():
            errors.append(f"missing {path.name}")
            continue
        text = path.read_text(encoding="utf-8")
        slug_m = re.search(r'^slug:\s*"([^"]+)"', text, re.M)
        slug = slug_m.group(1) if slug_m else ""
        if slug != path.stem:
            errors.append(f"{path.name} slug {slug!r} != filename")
        for name in REQUIRED:
            if not re.search(rf"^{name}:", text, re.M):
                errors.append(f"{path.name} missing {name}")
        if re.search(r"^# ", text, re.M):
            errors.append(f"{path.name} has markdown h1")
        for s in list_field(text, "players"):
            if s not in players:
                errors.append(f"{path.name} unknown player {s}")
        for s in list_field(text, "teams"):
            if s not in teams:
                errors.append(f"{path.name} unknown team {s}")
        for s in list_field(text, "events"):
            if s not in events:
                errors.append(f"{path.name} unknown event {s}")
        for s in list_field(text, "related"):
            if s not in memes:
                errors.append(f"{path.name} unknown related {s}")
    if errors:
        print("\n".join(errors))
        return 1
    print(f"ok {len(paths)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
