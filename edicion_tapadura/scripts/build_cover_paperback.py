#!/usr/bin/env python3
"""Monta la cubierta de tapa blanda (paperback) de "El horizonte interior /
L'horitzó interior / The Inner Horizon" (edición de cámara ampliada, 6x9").

Reutiliza toda la parte artística de build_cover.py (misma ilustración,
mismo velo, mismo grano, misma paleta y textos, ya parametrizados por
idioma) pero con la física de KDP para tapa blanda en vez de tapa dura:
sin envolvente de tablero (WRAP/HINGE) ni grosor de cartón (SPINE_BOARD)
en el lomo - una sola pieza plana, como cualquier tapa blanda de KDP.

El interior lleva láminas a color, así que el lomo se calcula con la
constante de KDP para papel a color (0.002347"/página), no con la de
papel blanco B/N que usa build_cover.py para tapa dura.

Uso:
    python3 edicion_tapadura/scripts/build_cover_paperback.py --lang ca
    python3 edicion_tapadura/scripts/build_cover_paperback.py --lang en
    python3 edicion_tapadura/scripts/build_cover_paperback.py --lang es

Salida (una por idioma):
    El_Horizonte_Interior_BLANDA_cubierta_<lang>.pdf   envolvente completa (contra + lomo + frente)
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

import build_cover as hc  # reutiliza arte, tipografía, paleta y textos

ROOT = hc.ROOT
BASE = hc.BASE
IMG = hc.IMG

TRIM_W, TRIM_H = hc.TRIM_W, hc.TRIM_H
BLEED = hc.BLEED
DPI = hc.DPI
SPINE_PER_PAGE = 0.002347  # KDP, papel a color (el interior lleva láminas en color)

INTERIOR_PDF = {
    "es": BASE / "El_Horizonte_Interior_BLANDA_es.pdf",
    "ca": BASE / "El_Horizonte_Interior_BLANDA_ca.pdf",
    "en": BASE / "El_Horizonte_Interior_BLANDA_en.pdf",
}


def build_wrap(S: dict, pages: int, wrap_pdf: Path,
                force_w: float | None, force_h: float | None) -> None:
    spine_in = pages * SPINE_PER_PAGE
    side = BLEED + TRIM_W
    w_in = force_w or (2 * side + spine_in)
    h_in = force_h or (TRIM_H + 2 * BLEED)

    canvas_px = (round(w_in * DPI), round(h_in * DPI))
    field = Image.new("RGB", canvas_px, (8, 22, 26))

    half_in = (w_in - spine_in) / 2
    front = hc.cover_field(half_in, h_in)
    back = hc.cover_field(half_in, h_in, flip=True)
    field.paste(back, (0, 0))
    field.paste(front, (canvas_px[0] - front.width, 0))

    art = hc.vertical_veil(field, 0.44, 0.28, 0.66, 0.70)
    wash = Image.new("RGB", (back.width, canvas_px[1]), (9, 24, 28))
    art.paste(Image.blend(art.crop((0, 0, back.width, canvas_px[1])), wash, 0.74), (0, 0))

    spine_x0 = round((w_in - spine_in) / 2 * DPI)
    spine_x1 = spine_x0 + round(spine_in * DPI)
    art.paste(Image.new("RGB", (spine_x1 - spine_x0, canvas_px[1]), (10, 27, 31)),
              (spine_x0, 0))
    art = hc.grain(art)

    tmp = IMG / "_cubierta_tapablanda.jpg"
    art.save(tmp, "JPEG", quality=92, subsampling=0, dpi=(DPI, DPI))

    cv = hc.rl_canvas.Canvas(str(wrap_pdf), pagesize=(w_in * hc.inch, h_in * hc.inch))
    cv.setTitle(f"{S['title']} — cubierta de tapa blanda")
    cv.drawImage(str(tmp), 0, 0, width=w_in * hc.inch, height=h_in * hc.inch, mask=None)

    trim_y = BLEED * hc.inch
    trim_h = TRIM_H * hc.inch
    back_x = BLEED * hc.inch
    front_x = (w_in - BLEED - TRIM_W) * hc.inch
    hc.back_text(cv, back_x, trim_y, TRIM_W * hc.inch, trim_h, S)
    hc.front_text(cv, front_x, trim_y, TRIM_W * hc.inch, trim_h, S)
    hc.spine_text(cv, w_in * hc.inch / 2, trim_y, trim_h, spine_in * hc.inch, S)
    cv.save()
    print(f"{wrap_pdf.relative_to(ROOT)}  —  {w_in:.3f} x {h_in:.3f} pulgadas "
          f"(lomo {spine_in:.3f}\" para {pages} páginas, tapa blanda)")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["es", "ca", "en"], default="ca")
    ap.add_argument("--paginas", type=int, default=None)
    ap.add_argument("--ancho", type=float, default=None)
    ap.add_argument("--alto", type=float, default=None)
    args = ap.parse_args()

    S = hc.STRINGS[args.lang]
    src = hc.source_image()
    if not src.exists():
        raise SystemExit(
            f"No encuentro {src.relative_to(ROOT)}. Genera la ilustración de "
            f"portada antes de correr este script."
        )

    wrap_pdf = BASE / f"El_Horizonte_Interior_BLANDA_cubierta_{args.lang}.pdf"
    pages = args.paginas or hc.interior_page_count(INTERIOR_PDF[args.lang])
    if args.paginas is None:
        print(f"(lomo calculado sobre {pages} páginas reales del interior)")
    build_wrap(S, pages, wrap_pdf, args.ancho, args.alto)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
