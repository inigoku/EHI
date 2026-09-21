#!/usr/bin/env python3
"""Monta la cubierta de "El Horizonte Interior" a partir de una ilustración
original en imagenes/portada.jpg (o imagenes/portada_2k.jpg si existe, en
mayor resolución).

Reutiliza el planteamiento de edicion_poesia/scripts/build_cover.py (misma
física de tapa dura de KDP, mismo tratamiento de velo y grano) con la
paleta propia del ensayo (tinta/ámbar/oro/arena) en vez de la teal de
"Ecos en el Borde", y sin la línea "de <obra>" del pie de la contraportada,
que no aplica: este es el volumen origen, no una selección salida de él.

Saca dos ficheros:

  El_Horizonte_Interior_Ensayo_portada_frontal.pdf    solo la cubierta, con sangre
  El_Horizonte_Interior_Ensayo_cubierta_tapadura.pdf  la envolvente entera

El lomo se calcula solo sobre las páginas reales del interior ya compilado
(El_Horizonte_Interior_Ensayo_6x9.pdf), para no quedar desactualizado en
silencio si el interior cambia de tamaño. --paginas fuerza un valor a mano.

    python3 edicion_ensayo/scripts/build_interior_premium.py toc_ensayo.json \
      -o El_Horizonte_Interior_Ensayo_6x9.pdf   # antes, siempre
    python3 edicion_ensayo/scripts/build_cover.py
"""
from __future__ import annotations

import argparse
from pathlib import Path

import pymupdf
from PIL import Image, ImageChops, ImageFilter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab import rl_config
from reportlab.pdfgen import canvas as rl_canvas

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "edicion_ensayo"
IMG = BASE / "imagenes"
FONTS = BASE / "fonts"

FRONT_PDF = BASE / "El_Horizonte_Interior_Ensayo_portada_frontal.pdf"
WRAP_PDF = BASE / "El_Horizonte_Interior_Ensayo_cubierta_tapadura.pdf"
INTERIOR_PDF = BASE / "El_Horizonte_Interior_Ensayo_6x9.pdf"


def interior_page_count() -> int:
    if not INTERIOR_PDF.exists():
        raise SystemExit(
            f"No encuentro {INTERIOR_PDF.relative_to(ROOT)} para calcular el "
            f"lomo. Compila antes el interior o pasa --paginas a mano."
        )
    with pymupdf.open(INTERIOR_PDF) as doc:
        return doc.page_count


for name, filename in (
    ("Eco", "SourceSerifPro-Regular.ttf"),
    ("Eco-It", "SourceSerifPro-It.ttf"),
    ("Eco-Sb", "SourceSerifPro-Semibold.ttf"),
    ("Eco-Bd", "SourceSerifPro-Bold.ttf"),
):
    pdfmetrics.registerFont(TTFont(name, str(FONTS / filename)))
R, IT, SB, BD = "Eco", "Eco-It", "Eco-Sb", "Eco-Bd"
rl_config.canvas_basefontname = R

TRIM_W, TRIM_H = 6.0, 9.0
BLEED = 0.125
WRAP = 0.625
HINGE = 0.375
SPINE_PER_PAGE = 0.002252   # papel blanco
SPINE_BOARD = 0.06
DPI = 300

TITLE = "El Horizonte Interior"
SUBTITLE = "Ensayo completo, con las lecturas topológicas"
AUTHOR = "Íñigo Barrera Barceló"
KICKER = "Un ensayo sobre física, conciencia y los límites del yo"
TITLE_LINES = ["El Horizonte", "Interior"]
BLURB = (
    "Un ensayo que usa la física de los agujeros negros como lente para "
    "pensar la conciencia: el horizonte de sucesos como frontera entre lo "
    "que un yo deja escapar y lo que queda atrapado para siempre."
)
BLURB2 = (
    "Cincuenta y cuatro capítulos que cruzan neurociencia, teoría de la "
    "información y física teórica sin abandonar nunca la pregunta más "
    "simple: qué significa que haya alguien ahí dentro. Con las lecturas "
    "topológicas que llevan esas mismas ideas al arte y a la vida "
    "cotidiana, y el aparato completo de notas y referencias."
)

# Paleta propia del ensayo (la misma de build_interior_premium.py), en vez
# de la teal/crema de "Ecos en el Borde".
INK = colors.HexColor("#22282c")
SAND = colors.HexColor("#e8e2d4")    # texto principal sobre el velo oscuro
GOLD = colors.HexColor("#d9b94e")    # acento: filete, subtítulo, kicker


def source_image() -> Path:
    two_k = IMG / "portada_2k.jpg"
    return two_k if two_k.exists() else IMG / "portada.jpg"


def upscaled(target_h_px: int) -> Image.Image:
    im = Image.open(source_image()).convert("RGB")
    while im.height < target_h_px:
        factor = min(2.0, target_h_px / im.height)
        im = im.resize((round(im.width * factor), round(im.height * factor)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
    return im


def grain(im: Image.Image, strength: int = 7) -> Image.Image:
    noise = Image.effect_noise(im.size, strength).convert("L")
    noise = Image.merge("RGB", (noise, noise, noise))
    return ImageChops.overlay(im, noise.point(lambda v: 118 + (v - 128) // 3))


def vertical_veil(im: Image.Image, top_frac: float, bottom_frac: float,
                  top_alpha: float, bottom_alpha: float,
                  top_falloff: float = 0.85, bottom_falloff: float = 1.1) -> Image.Image:
    w, h = im.size
    veil = Image.new("L", (1, h), 0)
    px = veil.load()
    for y in range(h):
        a = 0.0
        if y < h * top_frac:
            a = top_alpha * (1 - y / (h * top_frac)) ** top_falloff
        tail = h * (1 - bottom_frac)
        if y > tail:
            a = max(a, bottom_alpha * ((y - tail) / (h * bottom_frac)) ** bottom_falloff)
        px[0, y] = int(255 * a)
    veil = veil.resize((w, h))
    dark = Image.new("RGB", (w, h), (18, 16, 12))
    return Image.composite(dark, im, veil)


def cover_field(width_in: float, height_in: float, flip: bool = False) -> Image.Image:
    w_px, h_px = round(width_in * DPI), round(height_in * DPI)
    im = upscaled(h_px)
    scale = max(w_px / im.width, h_px / im.height)
    if scale > 1:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = max(0, (im.width - w_px) // 2)
    top = max(0, (im.height - h_px) // 2)
    im = im.crop((left, top, left + w_px, top + h_px))
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im


def caps(cv, cx: float, y: float, text: str, font: str, size: float, color,
         spacing: float) -> None:
    text = text.upper()
    w = pdfmetrics.stringWidth(text, font, size) + spacing * max(0, len(text) - 1)
    cv.saveState()
    cv.setFillColor(color)
    to = cv.beginText(cx - w / 2, y)
    to.setFont(font, size)
    to.setCharSpace(spacing)
    to.textOut(text)
    cv.drawText(to)
    cv.restoreState()


def wrapped(text: str, font: str, size: float, width: float) -> list[str]:
    out, line = [], ""
    for word in text.split():
        probe = f"{line} {word}".strip()
        if pdfmetrics.stringWidth(probe, font, size) > width and line:
            out.append(line)
            line = word
        else:
            line = probe
    if line:
        out.append(line)
    return out


def front_text(cv, x0: float, y0: float, w: float, h: float) -> None:
    cx = x0 + w / 2
    y = y0 + h - 1.35 * inch
    for line in TITLE_LINES:
        caps(cv, cx, y, line, R, 40, SAND, 9.0)
        y -= 50
    y -= 14
    cv.setStrokeColor(GOLD)
    cv.setLineWidth(1.0)
    cv.line(cx - 46, y, cx + 46, y)
    y -= 26
    caps(cv, cx, y, SUBTITLE, R, 9.5, GOLD, 2.0)

    y = y0 + 1.30 * inch
    caps(cv, cx, y, AUTHOR, R, 14.5, SAND, 4.2)
    y -= 26
    cv.setFont(IT, 9.8)
    cv.setFillColor(GOLD)
    cv.drawCentredString(cx, y, KICKER)


def back_text(cv, x0: float, y0: float, w: float, h: float) -> None:
    cx = x0 + w / 2
    inner = w - 1.5 * inch
    y = y0 + h - 1.6 * inch
    caps(cv, cx, y, TITLE, R, 15, SAND, 5.0)
    y -= 22
    cv.setStrokeColor(GOLD)
    cv.setLineWidth(0.9)
    cv.line(cx - 34, y, cx + 34, y)
    y -= 34
    cv.setFillColor(SAND)
    for para in (BLURB, BLURB2):
        for line in wrapped(para, R, 11, inner):
            cv.setFont(R, 11)
            cv.drawCentredString(cx, y, line)
            y -= 16.5
        y -= 10
    # hueco reservado para el código de barras de KDP: 2 x 1,2" en la esquina
    cv.setFillColor(colors.white)
    cv.rect(x0 + w - 2.35 * inch, y0 + 0.40 * inch, 2.0 * inch, 1.2 * inch,
            stroke=0, fill=1)


def spine_text(cv, cx: float, y0: float, h: float, spine_w: float) -> None:
    if spine_w < 0.35 * inch:
        return
    cv.saveState()
    cv.translate(cx, y0 + h / 2)
    cv.rotate(-90)
    cv.setFillColor(SAND)
    cv.setFont(R, 12)
    cv.drawCentredString(0, -4, f"{TITLE.upper()}   ·   {AUTHOR.upper()}")
    cv.restoreState()


def build_front() -> None:
    w_in, h_in = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
    art = grain(vertical_veil(cover_field(w_in, h_in), 0.46, 0.30, 0.68, 0.72))
    tmp = IMG / "_portada_frontal.jpg"
    art.save(tmp, "JPEG", quality=94, subsampling=0, dpi=(DPI, DPI))

    cv = rl_canvas.Canvas(str(FRONT_PDF), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{TITLE} — cubierta")
    cv.drawImage(str(tmp), 0, 0, width=w_in * inch, height=h_in * inch, mask=None)
    front_text(cv, BLEED * inch, BLEED * inch, TRIM_W * inch, TRIM_H * inch)
    cv.save()
    print(f"{FRONT_PDF.relative_to(ROOT)}  —  {w_in} x {h_in} pulgadas")


def build_wrap(pages: int, force_w: float | None, force_h: float | None) -> None:
    spine_in = pages * SPINE_PER_PAGE + SPINE_BOARD
    side = WRAP + BLEED + TRIM_W + HINGE
    w_in = force_w or (2 * side + spine_in)
    h_in = force_h or (TRIM_H + 2 * (WRAP + BLEED))

    canvas_px = (round(w_in * DPI), round(h_in * DPI))
    field = Image.new("RGB", canvas_px, (18, 16, 12))

    half_in = (w_in - spine_in) / 2
    front = cover_field(half_in, h_in)
    back = cover_field(half_in, h_in, flip=True)
    field.paste(back, (0, 0))
    field.paste(front, (canvas_px[0] - front.width, 0))

    art = vertical_veil(field, 0.44, 0.28, 0.66, 0.70)
    wash = Image.new("RGB", (back.width, canvas_px[1]), (19, 17, 13))
    art.paste(Image.blend(art.crop((0, 0, back.width, canvas_px[1])), wash, 0.74), (0, 0))

    spine_x0 = round((w_in - spine_in) / 2 * DPI)
    spine_x1 = spine_x0 + round(spine_in * DPI)
    art.paste(Image.new("RGB", (spine_x1 - spine_x0, canvas_px[1]), (21, 19, 14)),
              (spine_x0, 0))
    art = grain(art)

    tmp = IMG / "_cubierta_wrap.jpg"
    art.save(tmp, "JPEG", quality=92, subsampling=0, dpi=(DPI, DPI))

    cv = rl_canvas.Canvas(str(WRAP_PDF), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{TITLE} — cubierta de tapa dura")
    cv.drawImage(str(tmp), 0, 0, width=w_in * inch, height=h_in * inch, mask=None)

    trim_y = (WRAP + BLEED) * inch
    trim_h = TRIM_H * inch
    back_x = (WRAP + BLEED) * inch
    front_x = (w_in - WRAP - BLEED - TRIM_W) * inch
    back_text(cv, back_x, trim_y, TRIM_W * inch, trim_h)
    front_text(cv, front_x, trim_y, TRIM_W * inch, trim_h)
    spine_text(cv, w_in * inch / 2, trim_y, trim_h, spine_in * inch)
    cv.save()
    print(f"{WRAP_PDF.relative_to(ROOT)}  —  {w_in:.3f} x {h_in:.3f} pulgadas "
          f"(lomo {spine_in:.3f}\" para {pages} páginas)")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--paginas", type=int, default=None)
    ap.add_argument("--ancho", type=float, default=None)
    ap.add_argument("--alto", type=float, default=None)
    args = ap.parse_args()
    src = source_image()
    if not src.exists():
        raise SystemExit(
            f"No encuentro {src.relative_to(ROOT)}. Genera la ilustración de "
            f"portada y guárdala ahí (o como portada_2k.jpg) antes de correr "
            f"este script."
        )
    with Image.open(src) as probe:
        print(f"Imagen de partida: {src.relative_to(ROOT)}  {probe.width} x {probe.height} px")
    build_front()
    pages = args.paginas or interior_page_count()
    if args.paginas is None:
        print(f"  (lomo calculado sobre {pages} páginas reales del interior)")
    build_wrap(pages, args.ancho, args.alto)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
