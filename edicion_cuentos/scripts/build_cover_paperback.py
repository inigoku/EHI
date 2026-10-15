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
# Interior en blanco y negro sobre papel blanco: 0,002252"/página. (La
# constante de hc, 0,002347, es la del papel premium a color de la tapa dura.)
SPINE_PER_PAGE = 0.002252
inch = hc.inch


def build_wrap(wrap_pdf: Path, wrap_label: str, pages: int,
                force_w: float | None, force_h: float | None) -> None:
    spine_in = pages * SPINE_PER_PAGE
    side = BLEED + TRIM_W
    w_in = force_w or (2 * side + spine_in)
    h_in = force_h or (TRIM_H + 2 * BLEED)

    # Pintura a sangre: cubierta a la derecha; contra a la izquierda con la
    # misma pintura volteada bajo un lavado de tinta; lomo en tinta plana.
    canvas_px = (round(w_in * hc.DPI), round(h_in * hc.DPI))
    field = hc.Image.new("RGB", canvas_px, (10, 16, 22))
    half_in = (w_in - spine_in) / 2
    front = hc.cover_field(half_in, h_in)
    back = hc.cover_field(half_in, h_in, flip=True)
    field.paste(back, (0, 0))
    field.paste(front, (canvas_px[0] - front.width, 0))
    art = hc.vertical_veil(field, 0.24, 0.20, 0.50, 0.60)
    wash = hc.Image.new("RGB", (back.width, canvas_px[1]), (11, 18, 25))
    art.paste(hc.Image.blend(art.crop((0, 0, back.width, canvas_px[1])), wash, 0.74), (0, 0))
    sx0 = round((w_in - spine_in) / 2 * hc.DPI)
    sx1 = sx0 + round(spine_in * hc.DPI)
    art.paste(hc.Image.new("RGB", (sx1 - sx0, canvas_px[1]), (13, 21, 28)), (sx0, 0))
    art = hc.grain(art)
    tmp = hc.IMG / "_cubierta_paperback.jpg"
    art.save(tmp, "JPEG", quality=92, subsampling=0, dpi=(hc.DPI, hc.DPI))

    cv = hc.rl_canvas.Canvas(str(wrap_pdf), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{hc.TITLE} — {wrap_label}")
    cv.drawImage(str(tmp), 0, 0, width=w_in * inch, height=h_in * inch, mask=None)

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
