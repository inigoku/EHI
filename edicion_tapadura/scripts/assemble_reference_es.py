#!/usr/bin/env python3
"""Assembles the clean Spanish reference source for the real KDP "Edición
de cámara": camara/EHI_manuscrito.md (Obertura, I-VI, apparatus, CODA)
plus the four loose-variation movement files (espejo, diapason, ojo,
fractal), each keeping its own inline Ensayo/Ficcion/Poema/Nota del
autor/Glosario/Notas structure exactly as in the canonical source -
EXCLUDING the "EDICIÓN JOVEN" manga section and its two-sentence bridge
(both are specifically about the manga and don't survive its removal).

Output is in generate_hardcover_pdf.py's markdown convention:
  "# "   book title (unused by the renderer, kept for documentation)
  "## "  movement-level heading (its own opener page + TOC entry)
  "### " everything inside a movement: Obertura/Epilogo-within-movement,
         Ensayo, Ficcion, poem titles, Nota del autor, Glosario, Notas,
         numbered sub-scenes, individual "Lecturas" entries - all
         flattened to the same level, matching how this project has
         handled nested subsections throughout.
  Poem verse lines are wrapped in single asterisks (one per line, under
  95 chars) so parse_markdown() classifies them as centered POEMLINE
  flowables instead of ordinary paragraphs.

This file is a TRANSLATION SOURCE, not a deliverable itself.
"""
from __future__ import annotations

import re
from pathlib import Path

CAMARA = Path(__file__).resolve().parents[2] / "camara"
OUT = Path(__file__).resolve().parents[1] / "El_Horizonte_Interior_REFERENCE_es.md"

SECTION_PREFIXES = (
    "OBERTURA",
    "EPÍLOGO",
    "Ensayo:",
    "Lecturas:",
    "Nota del autor",
    "Glosario mínimo",
    "Notas y fuentes",
)

# Bare "## " subheads in the movement files that are POEMS (verse), so
# their lines get *-wrapped. Everything else under "## " is a reading
# entry (Title — subtitle) and stays plain prose.
POEM_SUBHEADS = {
    "Lo que el espejo no tiene",
    "Manos",
    "Montse XXI",
    "Coro",
    "Vecinos",
    "Desde la cueva",
}

MOVEMENT_TITLES_NO_PREFIX = {
    "espejo": "El espejo sin profundidad",
    "diapason": "El diapasón invisible",
    "ojo": "El ojo de un solo color",
    "fractal": "La realidad fractal",
}


def is_section_heading(line: str) -> bool:
    return any(line.startswith(p) for p in SECTION_PREFIXES)


def wrap_poem_lines(lines: list[str]) -> list[str]:
    out = []
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        # some source poems (e.g. "Lo que el espejo no tiene") already wrap
        # each line in a single pair of asterisks - strip that first so we
        # don't double-wrap into **bold** instead of *italic*/POEMLINE.
        if s.startswith("*") and s.endswith("*") and len(s) > 1:
            s = s[1:-1].strip()
        assert len(s) + 2 <= 95, f"poem line too long for POEMLINE: {s!r}"
        out.append(f"*{s}*")
    return out


# ---------------------------------------------------------------------
# EHI_manuscrito.md: explicit "#"/"##"/"###" markdown headers
# ---------------------------------------------------------------------

def parse_manuscrito(path: Path):
    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines()
    body = "\n".join(lines[5:])  # skip 4 header lines + 1 blank
    blocks = []
    for para in re.split(r"\n\s*\n", body):
        para = para.strip("\n")
        if not para.strip():
            continue
        plines = para.split("\n")
        first = plines[0]
        if first.startswith("### "):
            blocks.append(("h3", [first[4:].strip()]))
        elif first.startswith("## "):
            blocks.append(("h3poem" if first[3:].strip().startswith("Poema:") else "h3",
                            [first[3:].strip()]))
        elif first.startswith("# "):
            blocks.append(("h2", [first[2:].strip()]))
        else:
            blocks.append(("para", plines))
    return blocks


def _render_manuscrito_block(kind, content, out: list[str], in_poem: bool) -> bool:
    """Appends one block's output lines. Returns the updated in_poem flag.
    A block is verse either because it's visually multi-line (a stanza with
    no blank line inside it) OR because we're still inside a Poema: heading's
    run of blank-line-separated single-line stanzas - the poem's LAST stanza
    can be just one line, and that line is still verse, not prose."""
    if kind == "h2":
        out.append(f"## {content[0]}")
        out.append("")
        return False
    if kind in ("h3", "h3poem"):
        out.append(f"### {content[0]}")
        out.append("")
        return kind == "h3poem"
    if kind == "para":
        if in_poem or len(content) > 1:
            out.extend(wrap_poem_lines(content))
        else:
            out.append(content[0])
        out.append("")
        return in_poem
    return in_poem


def render_manuscrito(blocks, out: list[str], stop_before: str):
    """Emits blocks up to (not including) the H1-equivalent heading whose
    text equals stop_before. Poema headings become H3 with 'Poema: ' kept
    (mirrors the source exactly); their following para block(s) get
    *-wrapped until the next heading, even if a stanza is just one line."""
    i, n = 0, len(blocks)
    in_poem = False
    while i < n:
        kind, content = blocks[i]
        if kind == "h2" and content[0] == stop_before:
            break
        in_poem = _render_manuscrito_block(kind, content, out, in_poem)
        i += 1
    return i


def render_manuscrito_from(blocks, start_idx: int, out: list[str]):
    i, n = start_idx, len(blocks)
    in_poem = False
    while i < n:
        kind, content = blocks[i]
        in_poem = _render_manuscrito_block(kind, content, out, in_poem)
        i += 1


# ---------------------------------------------------------------------
# Movement files: build_camara.py convention (SECTION_PREFIXES + "---"
# delimited chunks, "## " for subheads)
# ---------------------------------------------------------------------

def parse_movement(path: Path):
    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines()
    body = "\n".join(lines[7:])  # skip 6 header lines + 1 blank
    blocks = []
    for chunk in re.split(r"\n---\n", body):
        chunk = chunk.strip("\n")
        if not chunk.strip():
            continue
        for para in re.split(r"\n\s*\n", chunk):
            para = para.strip("\n")
            if not para.strip():
                continue
            plines = para.split("\n")
            first = plines[0].strip()
            if first.startswith("## "):
                blocks.append(("subhead", [first[3:].strip()]))
            elif is_section_heading(first):
                blocks.append(("section", plines))
            else:
                blocks.append(("para", plines))
    return blocks


def render_movement(key: str, out: list[str]):
    path = CAMARA / f"EHI_{key if key != 'diapason' else 'el_diapason_invisible'}.md"
    if key == "espejo":
        path = CAMARA / "EHI_espejo_sin_profundidad.md"
    elif key == "ojo":
        path = CAMARA / "EHI_el_ojo_de_un_solo_color.md"
    elif key == "fractal":
        path = CAMARA / "EHI_la_realidad_fractal.md"

    blocks = parse_movement(path)

    out.append(f"## {MOVEMENT_TITLES_NO_PREFIX[key]}")
    out.append("")

    current_is_poem = False
    in_notas_y_fuentes = False
    for kind, content in blocks:
        if kind == "subhead":
            out.append(f"### {content[0]}")
            out.append("")
            current_is_poem = content[0] in POEM_SUBHEADS
            in_notas_y_fuentes = False
        elif kind == "section":
            heading_text = content[0]
            # Inside "Notas y fuentes", the "Lecturas:" line is the closing
            # bibliography PARAGRAPH (the real KDP book typesets it as body
            # text with just the label italicized), not a new subsection -
            # unlike every other "Lecturas:" in this book, which DOES
            # introduce its own set of reading entries.
            if heading_text.startswith("Lecturas:") and in_notas_y_fuentes:
                out.append(f"*Lecturas:*{heading_text[len('Lecturas:'):]}")
                out.append("")
                current_is_poem = False
                continue
            out.append(f"### {heading_text}")
            out.append("")
            current_is_poem = False
            in_notas_y_fuentes = heading_text == "Notas y fuentes"
            if len(content) > 1:
                out.append(" ".join(content[1:]))
                out.append("")
        elif kind == "para":
            if current_is_poem:
                out.extend(wrap_poem_lines(content))
            elif len(content) > 1:
                out.extend(wrap_poem_lines(content))
            else:
                out.append(content[0])
            out.append("")


def main():
    manuscrito_blocks = parse_manuscrito(CAMARA / "EHI_manuscrito.md")

    out: list[str] = []
    out.append("---")
    out.append("lang: es")
    out.append("---")
    out.append("")
    out.append("# El Horizonte Interior")
    out.append("")

    # Obertura .. VI (stop before "Nota del autor", which follows VI)
    idx = render_manuscrito(manuscrito_blocks, out, stop_before="Nota del autor")
    # Nota del autor, Glosario íntimo, Notas y fuentes, CODA - all the way to EOF
    render_manuscrito_from(manuscrito_blocks, idx, out)

    # VII-X, no manga, no bridge text (it only makes sense with the manga present)
    for key in ("espejo", "diapason", "ojo", "fractal"):
        render_movement(key, out)

    text = "\n".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text)  # collapse accidental multi-blank runs
    OUT.write_text(text, encoding="utf-8")
    print(f"Wrote {OUT} ({len(out)} lines, {OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
