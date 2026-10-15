#!/usr/bin/env python3
"""Cubierta de tapa blanda (rústica, color premium) de "Ecos en el borde".

Reutiliza el arte, los rótulos y los textos de build_cover.py (la cubierta de
tapa dura) y cambia solo la geometría: en rústica no hay arrastre de tapa ni
bisagra, la cubierta mide

    2 x (6" + 0,125" de sangre) + lomo  de ancho,   9" + 2 x 0,125" de alto,

y el lomo es páginas x 0,002347" (papel premium a color, que es lo que pide el
interior con láminas; el blanco estándar sería 0,002252").

El interior es el mismo PDF de tapa dura (6 x 9", sin sangre, láminas dentro
de la caja): KDP admite rústica en color premium desde 24 páginas.

KDP no admite texto en el lomo por debajo de 79 páginas; con 76 el lomo va en
tinta plana y sin rótulo (spine_text ya lo omite por debajo de 0,35").

    python3 edicion_poesia/scripts/build_cover_paperback.py --lang en
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_cover as bc  # noqa: E402
from reportlab.lib.units import inch  # noqa: E402

SPINE_PER_PAGE = 0.002347   # papel premium a color

OUT = {
    "es": bc.BASE / "Ecos_en_el_Borde_cubierta_tapablanda.pdf",
    "ca": bc.BASE / "Ecos_en_el_Borde_cubierta_tapablanda_ca.pdf",
    "en": bc.BASE / "Echoes_at_the_Edge_paperback_cover.pdf",
}
LABEL = {"es": "cubierta de tapa blanda", "ca": "coberta de tapa blana",
         "en": "paperback cover"}


def build(lang: str, paginas: int | None = None) -> None:
    bc.CURRENT_LANG = lang
    pages = paginas or bc.interior_page_count(lang)
    spine_in = pages * SPINE_PER_PAGE
    w_in = 2 * (bc.BLEED + bc.TRIM_W) + spine_in
    h_in = bc.TRIM_H + 2 * bc.BLEED
    canvas_px = (round(w_in * bc.DPI), round(h_in * bc.DPI))

    # Cubierta a la derecha con la ola entera; contra a la izquierda con la
    # misma ola volteada bajo un lavado de tinta; lomo en tinta plana.
    field = bc.Image.new("RGB", canvas_px, (10, 16, 22))
    half_in = (w_in - spine_in) / 2
    front = bc.cover_field(half_in, h_in)
    back = bc.cover_field(half_in, h_in, flip=True)
    field.paste(back, (0, 0))
    field.paste(front, (canvas_px[0] - front.width, 0))
    art = bc.vertical_veil(field, 0.44, 0.28, 0.66, 0.70)
    wash = bc.Image.new("RGB", (back.width, canvas_px[1]), (11, 18, 25))
    art.paste(bc.Image.blend(art.crop((0, 0, back.width, canvas_px[1])), wash, 0.74), (0, 0))
    sx0 = round((w_in - spine_in) / 2 * bc.DPI)
    sx1 = sx0 + round(spine_in * bc.DPI)
    art.paste(bc.Image.new("RGB", (sx1 - sx0, canvas_px[1]), (13, 21, 28)), (sx0, 0))
    art = bc.grain(art)
    tmp = bc.IMG / "_cubierta_paperback.jpg"
    art.save(tmp, "JPEG", quality=92, subsampling=0, dpi=(bc.DPI, bc.DPI))

    out = OUT[lang]
    cv = bc.rl_canvas.Canvas(str(out), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{bc.get_title()} — {LABEL[lang]}")
    cv.drawImage(str(tmp), 0, 0, width=w_in * inch, height=h_in * inch, mask=None)
    trim_y = bc.BLEED * inch
    trim_h = bc.TRIM_H * inch
    bc.back_text(cv, bc.BLEED * inch, trim_y, bc.TRIM_W * inch, trim_h)
    bc.front_text(cv, (w_in - bc.BLEED - bc.TRIM_W) * inch, trim_y, bc.TRIM_W * inch, trim_h)
    bc.spine_text(cv, w_in * inch / 2, trim_y, trim_h, spine_in * inch)
    cv.save()
    print(f"{out.relative_to(bc.ROOT)}  —  {w_in:.3f} x {h_in:.3f} pulgadas "
          f"(lomo {spine_in:.3f}\" para {pages} páginas, tapa blanda color premium)")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["es", "ca", "en", "all"], default="all")
    ap.add_argument("--paginas", type=int, default=None)
    args = ap.parse_args()
    for lang in (["es", "ca", "en"] if args.lang == "all" else [args.lang]):
        build(lang, args.paginas)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
