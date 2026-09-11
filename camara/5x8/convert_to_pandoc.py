#!/usr/bin/env python3
"""Convierte una pieza de camara/ (formato custom de build_camara.py) a
markdown pandoc, para maquetarla con pandoc+weasyprint a tamaño 5x8in."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import build_camara as bc


def to_pandoc(src: Path) -> str:
    header, sections = bc.parse(src)
    out = []
    out.append("---")
    out.append(f'title: "{header[2].title()}"')
    out.append(f'author: "{header[3]}"')
    out.append("lang: es")
    out.append("---")
    out.append("")
    out.append(f"# {header[2].title()}")
    out.append("")
    out.append("::: {.titlepage}")
    out.append("")
    out.append(f"*{header[0]}*")
    out.append("")
    out.append(f"*{header[1]}*")
    out.append("")
    out.append(f"**{header[3]}**")
    out.append("")
    out.append(f"*{header[4]}*  ")
    out.append(f"*{header[5]}*")
    out.append("")
    out.append(":::")
    out.append("")

    for si, blocks in enumerate(sections):
        if si > 0:
            out.append("::: {.sep}")
            out.append("· · ·")
            out.append(":::")
            out.append("")
        i = 0
        while i < len(blocks):
            block = blocks[i]
            if block.kind == "section":
                out.append(f"## {block.lines[0].strip()}")
                out.append("")
                i += 1
            elif block.kind == "subhead":
                title = block.lines[0]
                nxt = blocks[i + 1] if i + 1 < len(blocks) else None
                if nxt and nxt.kind == "para" and len(nxt.lines) > 1:
                    out.append("::: {.poem}")
                    out.append("")
                    out.append(f"### {title}")
                    out.append("")
                    j = i + 1
                    while j < len(blocks) and blocks[j].kind == "para" and len(blocks[j].lines) > 1:
                        out.append("  \n".join(l.strip() for l in blocks[j].lines))
                        out.append("")
                        j += 1
                    out.append(":::")
                    out.append("")
                    i = j
                else:
                    out.append(f"### {title}")
                    out.append("")
                    i += 1
            else:
                if len(block.lines) > 1:
                    out.append("::: {.poem}")
                    out.append("")
                    j = i
                    while j < len(blocks) and blocks[j].kind == "para" and len(blocks[j].lines) > 1:
                        out.append("  \n".join(l.strip() for l in blocks[j].lines))
                        out.append("")
                        j += 1
                    out.append(":::")
                    out.append("")
                    i = j
                else:
                    out.append(block.lines[0])
                    out.append("")
                    i += 1
    return "\n".join(out)


if __name__ == "__main__":
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    dst.write_text(to_pandoc(src), encoding="utf-8")
    print("Escrito:", dst)
