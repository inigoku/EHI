#!/usr/bin/env python3
"""Monta la cubierta de tapa blanda (paperback), sin dibujos, de "Cuentos
de Tarel" en las tres lenguas.

Reutiliza toda la parte artística y tipográfica de build_cover.py (misma
paleta, mismo marco de página en blanco -sin lámina de portada, ya que el
interior de esta edición no lleva ilustraciones-, mismos textos por
idioma) pero con la física de KDP para tapa blanda en vez de tapa dura:
sin envolvente de tablero (WRAP/HINGE) ni grosor de cartón (SPINE_BOARD)
en el lomo -- una sola pieza plana, como cualquier tapa blanda de KDP.

El lomo se calcula sobre las páginas reales del interior sin
ilustraciones ya compilado (Cuentos_de_Tarel_tapablanda_6x9.pdf y
equivalentes), no sobre el de tapa dura -- son dos libros con distinta
paginación. --paginas fuerza un valor a mano.

    python3 edicion_cuentos/scripts/build_interior_premium.py \
        toc_cuentos.json -o Cuentos_de_Tarel_tapablanda_6x9.pdf \
        --sin-ilustraciones   # antes, siempre, por idioma
    python3 edicion_cuentos/scripts/build_cover_paperback.py
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_cover as hc  # reutiliza arte, tipografía, paleta y textos

ROOT = hc.ROOT
BASE = hc.BASE

PAPERBACK = {
    "es": dict(
        interior_pdf=BASE / "Cuentos_de_Tarel_tapablanda_6x9.pdf",
        wrap_pdf=BASE / "Cuentos_de_Tarel_cubierta_tapablanda.pdf",
        wrap_label="cubierta de tapa blanda",
    ),
    "en": dict(
        interior_pdf=BASE / "Tales_of_Tarel_paperback_6x9.pdf",
        wrap_pdf=BASE / "Tales_of_Tarel_paperback_cover.pdf",
        wrap_label="paperback cover",
    ),
    "ca": dict(
        interior_pdf=BASE / "Cuentos_de_Tarel_tapablanda_6x9_ca.pdf",
        wrap_pdf=BASE / "Cuentos_de_Tarel_cubierta_tapablanda_ca.pdf",
        wrap_label="coberta de tapa blana",
    ),
}

TRIM_W, TRIM_H = hc.TRIM_W, hc.TRIM_H
BLEED = hc.BLEED
SPINE_PER_PAGE = hc.SPINE_PER_PAGE
inch = hc.inch


def build_wrap(wrap_pdf: Path, wrap_label: str, pages: int,
                force_w: float | None, force_h: float | None) -> None:
    spine_in = pages * SPINE_PER_PAGE
    side = BLEED + TRIM_W
    w_in = force_w or (2 * side + spine_in)
    h_in = force_h or (TRIM_H + 2 * BLEED)

    cv = hc.rl_canvas.Canvas(str(wrap_pdf), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{hc.TITLE} — {wrap_label}")
    cv.setFillColor(hc.SAND)
    cv.rect(0, 0, w_in * inch, h_in * inch, stroke=0, fill=1)

    trim_y = BLEED * inch
    trim_h = TRIM_H * inch
    back_x = BLEED * inch
    front_x = (w_in - BLEED - TRIM_W) * inch
    hc.back_text(cv, back_x, trim_y, TRIM_W * inch, trim_h)
    hc.front_text(cv, front_x, trim_y, TRIM_W * inch, trim_h)
    hc.spine_text(cv, w_in * inch / 2, trim_y, trim_h, spine_in * inch)
    cv.save()
    print(f"{wrap_pdf.relative_to(ROOT)}  —  {w_in:.3f} x {h_in:.3f} pulgadas "
          f"(lomo {spine_in:.3f}\" para {pages} páginas, tapa blanda)")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["es", "en", "ca", "all"], default="all")
    ap.add_argument("--paginas", type=int, default=None)
    ap.add_argument("--ancho", type=float, default=None)
    ap.add_argument("--alto", type=float, default=None)
    args = ap.parse_args()

    langs = ["es", "en", "ca"] if args.lang == "all" else [args.lang]
    for lang in langs:
        hc.select_lang(lang)
        cfg = PAPERBACK[lang]
        pages = args.paginas or hc.interior_page_count(cfg["interior_pdf"])
        if args.paginas is None:
            print(f"  (lomo calculado sobre {pages} páginas reales del interior sin "
                  f"ilustraciones)")
        build_wrap(cfg["wrap_pdf"], cfg["wrap_label"], pages, args.ancho, args.alto)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
