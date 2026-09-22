#!/usr/bin/env python3
"""Concatenates the 6 translated chunks (per language) produced by the
translation agents into the final camera-edition markdown source files.

Usage:
    python3 assemble_translations.py ca
    python3 assemble_translations.py en
"""
import sys
from pathlib import Path

SCRATCH = Path("/tmp/claude-0/-home-user-EHI/351e8495-2ba5-51f8-9a1a-9e34dcfa52c9/scratchpad")
OUT_DIR = Path(__file__).resolve().parents[1]

TITLES = {
    "ca": "L'Horitzó Interior",
    "en": "The Inner Horizon",
}
OUT_NAMES = {
    "ca": "El_Horizonte_Interior_TAPADURA_ca.md",
    "en": "El_Horizonte_Interior_TAPADURA_en.md",
}


def main(lang: str):
    out = ["---", f"lang: {lang}", "---", "", f"# {TITLES[lang]}", ""]
    for i in range(1, 7):
        chunk_path = SCRATCH / f"{lang}_chunk{i}.md"
        text = chunk_path.read_text(encoding="utf-8").strip("\n")
        out.append(text)
        out.append("")
    out_path = OUT_DIR / OUT_NAMES[lang]
    out_path.write_text("\n".join(out), encoding="utf-8")
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main(sys.argv[1])
