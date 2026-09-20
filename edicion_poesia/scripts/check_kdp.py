#!/usr/bin/env python3
"""Repasa el PDF del interior contra lo que pide KDP en tapa dura.

Comprueba el tamaño de página, los márgenes mínimos, el número de páginas, que
las fuentes vayan incrustadas y a cuántos puntos por pulgada queda cada
ilustración una vez colocada.

    python3 edicion_poesia/scripts/check_kdp.py
"""
from __future__ import annotations

from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
PDF = ROOT / "edicion_poesia" / "Ecos_en_el_Borde_6x9_interior.pdf"

TRIM_W_PT, TRIM_H_PT = 6 * 72, 9 * 72
MIN_GUTTER = 0.375 * 72     # margen de lomo que pide KDP hasta 150 páginas
MIN_OUTER = 0.25 * 72       # exterior, superior e inferior
MIN_PAGES, MAX_PAGES = 75, 550   # límites de tapa dura


def main() -> int:
    doc = pymupdf.open(PDF)
    problems: list[str] = []
    n = doc.page_count

    print(f"Páginas: {n}")
    if n < MIN_PAGES:
        problems.append(
            f"tapa dura pide {MIN_PAGES} páginas como mínimo, hay {n}. "
            "La rústica en color premium sí lo admite (mínimo 24); la rústica "
            "en color estándar pide 72"
        )
    if n > MAX_PAGES:
        problems.append(f"tapa dura admite {MAX_PAGES} páginas como máximo, hay {n}")
    if n % 2:
        problems.append("el número de páginas debe ser par")

    sizes = {(round(p.rect.width, 2), round(p.rect.height, 2)) for p in doc}
    print(f"Tamaño de página: {sorted(sizes)}")
    if sizes != {(TRIM_W_PT, TRIM_H_PT)}:
        problems.append(f"se esperaba una sola medida de {TRIM_W_PT} x {TRIM_H_PT} pt")

    fonts = {}
    for page in doc:
        for f in page.get_fonts(full=True):
            fonts[f[3]] = f[1]  # nombre -> extensión del fichero incrustado
    print("Fuentes:")
    for name, ext in sorted(fonts.items()):
        embedded = ext not in ("", "n/a")
        print(f"  {name:34s} {'incrustada' if embedded else 'NO INCRUSTADA'}")
        if not embedded:
            problems.append(f"la fuente {name} no va incrustada")

    # margenes: se mira la caja de todo lo dibujado en cada pagina
    worst_gutter = worst_outer = 1e9
    for i, page in enumerate(doc, start=1):
        box = None
        for blk in page.get_text("blocks"):
            r = pymupdf.Rect(blk[:4])
            box = r if box is None else box | r
        for info in page.get_image_info():
            r = pymupdf.Rect(info["bbox"])
            box = r if box is None else box | r
        if box is None or box.is_empty:
            continue
        recto = i % 2 == 1
        inner = box.x0 if recto else TRIM_W_PT - box.x1
        outer = TRIM_W_PT - box.x1 if recto else box.x0
        vert = min(box.y0, TRIM_H_PT - box.y1)
        worst_gutter = min(worst_gutter, inner)
        worst_outer = min(worst_outer, outer, vert)

    print(f"Margen de lomo más estrecho:     {worst_gutter / 72:.3f}\" "
          f"(mínimo {MIN_GUTTER / 72:.3f}\")")
    print(f"Margen exterior más estrecho:    {worst_outer / 72:.3f}\" "
          f"(mínimo {MIN_OUTER / 72:.3f}\")")
    if worst_gutter < MIN_GUTTER:
        problems.append("hay contenido dentro del margen mínimo de lomo")
    if worst_outer < MIN_OUTER:
        problems.append("hay contenido dentro del margen mínimo exterior")

    print("Resolución de las ilustraciones colocadas:")
    seen = {}
    for i, page in enumerate(doc, start=1):
        for info in page.get_image_info(xrefs=True):
            w_in = (info["bbox"][2] - info["bbox"][0]) / 72
            dpi = info["width"] / w_in if w_in else 0
            seen.setdefault(info["xref"], (i, info["width"], info["height"], dpi))
    for xref, (page_no, w, h, dpi) in sorted(seen.items(), key=lambda kv: kv[1][3]):
        print(f"  p.{page_no:<4d} {w:>5d} x {h:<5d} px   {dpi:6.0f} ppp")
    low = [v for v in seen.values() if v[3] < 299.5]
    if low:
        print(f"  ({len(low)} de {len(seen)} por debajo de 300 ppp: KDP avisa, "
              f"no bloquea; ver README)")

    print()
    if problems:
        print("PROBLEMAS:")
        for p in problems:
            print(f"  - {p}")
        return 1
    print("Sin problemas: el interior cumple lo que pide KDP.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
