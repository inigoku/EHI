#!/usr/bin/env python3
"""Monta la cubierta de "Ecos en el borde" a partir de la imagen de la seccion
de poesia de la web (src/assets/images/landing/poems_landing.png).

Saca dos ficheros:

  Ecos_en_el_Borde_portada_frontal.pdf   solo la cubierta, 6 x 9" + sangre
  Ecos_en_el_Borde_cubierta_tapadura.pdf la envolvente entera: contra, lomo y
                                         cubierta, con solapas de arrastre

La envolvente se calcula con las medidas que publica KDP para tapa dura:
0,625" de arrastre, 0,125" de sangre, 0,375" de bisagra a cada lado del lomo y
un lomo de (paginas x 0,002252") + 0,06" en papel blanco. Las cifras que
circulan no coinciden del todo entre fuentes, asi que antes de subir conviene
contrastar el resultado con la plantilla que genera el propio KDP para el
numero de paginas final; --ancho y --alto permiten forzar esas medidas.

    python3 edicion_poesia/scripts/build_cover.py --paginas 78
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab import rl_config
from reportlab.pdfgen import canvas as rl_canvas

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "edicion_poesia"
IMG = BASE / "imagenes"
FONTS = BASE / "fonts"

FRONT_PDF = BASE / "Ecos_en_el_Borde_portada_frontal.pdf"
WRAP_PDF = BASE / "Ecos_en_el_Borde_cubierta_tapadura.pdf"

for name, filename in (
    ("Eco", "SourceSerifPro-Regular.ttf"),
    ("Eco-It", "SourceSerifPro-It.ttf"),
    ("Eco-Sb", "SourceSerifPro-Semibold.ttf"),
    ("Eco-Bd", "SourceSerifPro-Bold.ttf"),
):
    pdfmetrics.registerFont(TTFont(name, str(FONTS / filename)))
R, IT, SB, BD = "Eco", "Eco-It", "Eco-Sb", "Eco-Bd"
# Evita que reportlab deje una Helvetica sin incrustar en los recursos.
rl_config.canvas_basefontname = R

TRIM_W, TRIM_H = 6.0, 9.0
BLEED = 0.125
WRAP = 0.625
HINGE = 0.375
SPINE_PER_PAGE = 0.002252   # papel blanco
SPINE_BOARD = 0.06
DPI = 300

TITLE = "Ecos en el borde"
SUBTITLE = "Lírica del límite emocional"
AUTHOR = "Íñigo Barrera Barceló"
KICKER = "Antología poética de El Horizonte Interior"
BLURB = (
    "Versos libres y un glosario que traducen al lenguaje del sentimiento las "
    "implicaciones físicas de la frontera: el dolor de la asimetría, el duelo "
    "concebido como una arquitectura con un hueco y el amor como el "
    "entrelazamiento geométrico de dos mundos."
)
BLURB2 = (
    "Veintiún poemas y un glosario íntimo, repartidos en tres libros: la "
    "arquitectura con un hueco, la frialdad de una ciudad apagada y los "
    "últimos libros."
)

CREAM = colors.HexColor("#f2ede4")
PALE = colors.HexColor("#cfe3e2")


# ------------------------------------------------------------------ imagenes
def source_image() -> Path:
    """La version a 2K si esta, y si no la imagen de la seccion de la web.

    regen_portada_2k.py escribe portada_2k.jpg; en cuanto existe, la cubierta
    la usa sola.
    """
    two_k = IMG / "portada_2k.jpg"
    return two_k if two_k.exists() else IMG / "portada.jpg"


def upscaled(target_h_px: int) -> Image.Image:
    """Sube la imagen de partida hasta la altura pedida.

    Ni siquiera el 2K de Imagen 4 llega a los 2775 px de alto que pide una
    cubierta de 9,25" a 300 ppp, asi que casi siempre hay una ampliacion por
    delante. Se hace por pasos con Lanczos y una mascara de enfoque suave, que
    en una imagen pictorica como esta se lee como pincelada y no como
    interpolacion. Ver el README.
    """
    im = Image.open(source_image()).convert("RGB")
    while im.height < target_h_px:
        factor = min(2.0, target_h_px / im.height)
        im = im.resize((round(im.width * factor), round(im.height * factor)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
    return im


def grain(im: Image.Image, strength: int = 7) -> Image.Image:
    """Un grano finisimo: ayuda a que la ampliacion no se vea plana al imprimir."""
    noise = Image.effect_noise(im.size, strength).convert("L")
    noise = Image.merge("RGB", (noise, noise, noise))
    return ImageChops.overlay(im, noise.point(lambda v: 118 + (v - 128) // 3))


def vertical_veil(im: Image.Image, top_frac: float, bottom_frac: float,
                  top_alpha: float, bottom_alpha: float,
                  top_falloff: float = 0.85, bottom_falloff: float = 1.1) -> Image.Image:
    """Oscurece arriba y abajo para que el texto de cubierta se lea.

    Los exponentes gobiernan cuanto aguanta la sombra antes de abrirse: con
    valores bajos el velo llega entero hasta el subtitulo, que es donde la ola
    tiene sus crestas mas claras.
    """
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
    dark = Image.new("RGB", (w, h), (10, 16, 22))
    return Image.composite(dark, im, veil)


def cover_field(width_in: float, height_in: float, flip: bool = False) -> Image.Image:
    """Recorta la imagen al tamaño pedido, sin deformarla."""
    w_px, h_px = round(width_in * DPI), round(height_in * DPI)
    im = upscaled(h_px)
    scale = max(w_px / im.width, h_px / im.height)
    if scale > 1:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    # el rostro cae a la izquierda del encuadre: se desplaza el recorte para
    # no cortarlo al pasar de cuadrado a vertical
    left = max(0, int((im.width - w_px) * 0.42))
    top = max(0, (im.height - h_px) // 2)
    im = im.crop((left, top, left + w_px, top + h_px))
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im


# ------------------------------------------------------------------- rotulos
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
    """Rotula la cubierta dentro del rectangulo de corte que se le pasa."""
    cx = x0 + w / 2
    y = y0 + h - 1.35 * inch
    for line in ("Ecos en", "el borde"):
        caps(cv, cx, y, line, R, 40, CREAM, 9.0)
        y -= 50
    y -= 14
    cv.setStrokeColor(PALE)
    cv.setLineWidth(1.0)
    cv.line(cx - 46, y, cx + 46, y)
    y -= 26
    caps(cv, cx, y, SUBTITLE, R, 10.5, PALE, 3.2)

    y = y0 + 1.30 * inch
    caps(cv, cx, y, AUTHOR, R, 14.5, CREAM, 4.2)
    y -= 26
    cv.setFont(IT, 9.8)
    cv.setFillColor(PALE)
    cv.drawCentredString(cx, y, KICKER)


def back_text(cv, x0: float, y0: float, w: float, h: float) -> None:
    cx = x0 + w / 2
    inner = w - 1.5 * inch
    y = y0 + h - 1.6 * inch
    caps(cv, cx, y, "Ecos en el borde", R, 15, CREAM, 5.0)
    y -= 22
    cv.setStrokeColor(PALE)
    cv.setLineWidth(0.9)
    cv.line(cx - 34, y, cx + 34, y)
    y -= 34
    cv.setFillColor(CREAM)
    for para in (BLURB, BLURB2):
        for line in wrapped(para, R, 11, inner):
            cv.setFont(R, 11)
            cv.drawCentredString(cx, y, line)
            y -= 16.5
        y -= 10
    y -= 6
    cv.setFont(IT, 10.2)
    cv.setFillColor(PALE)
    cv.drawCentredString(cx, y, "de El Horizonte Interior")
    # hueco reservado para el codigo de barras de KDP: 2 x 1,2" en la esquina
    cv.setFillColor(colors.white)
    cv.rect(x0 + w - 2.35 * inch, y0 + 0.40 * inch, 2.0 * inch, 1.2 * inch,
            stroke=0, fill=1)


def spine_text(cv, cx: float, y0: float, h: float, spine_w: float) -> None:
    """Rotulo del lomo, solo si hay sitio: KDP no admite texto por debajo de 0,35"."""
    if spine_w < 0.35 * inch:
        return
    cv.saveState()
    cv.translate(cx, y0 + h / 2)
    cv.rotate(-90)
    cv.setFillColor(CREAM)
    cv.setFont(R, 12)
    cv.drawCentredString(0, -4, f"{TITLE.upper()}   ·   {AUTHOR.upper()}")
    cv.restoreState()


# -------------------------------------------------------------------- montaje
def build_front() -> None:
    w_in, h_in = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
    art = grain(vertical_veil(cover_field(w_in, h_in), 0.50, 0.32, 0.90, 0.88))
    tmp = BASE / "imagenes" / "_portada_frontal.jpg"
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
    field = Image.new("RGB", canvas_px, (10, 16, 22))

    # La cubierta, a la derecha, con la ola entera; la contra, a la izquierda,
    # con la misma ola volteada y bajo un lavado de tinta para que el texto se
    # lea. El lomo va en tinta plana: en tapa dura es lo que mejor aguanta el
    # doblez de la bisagra.
    half_in = (w_in - spine_in) / 2
    front = cover_field(half_in, h_in)
    back = cover_field(half_in, h_in, flip=True)
    field.paste(back, (0, 0))
    field.paste(front, (canvas_px[0] - front.width, 0))

    art = vertical_veil(field, 0.46, 0.30, 0.86, 0.86)
    wash = Image.new("RGB", (back.width, canvas_px[1]), (11, 18, 25))
    art.paste(Image.blend(art.crop((0, 0, back.width, canvas_px[1])), wash, 0.74), (0, 0))

    spine_x0 = round((w_in - spine_in) / 2 * DPI)
    spine_x1 = spine_x0 + round(spine_in * DPI)
    art.paste(Image.new("RGB", (spine_x1 - spine_x0, canvas_px[1]), (13, 21, 28)),
              (spine_x0, 0))
    art = grain(art)

    tmp = BASE / "imagenes" / "_cubierta_wrap.jpg"
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
    ap.add_argument("--paginas", type=int, default=78,
                    help="páginas del interior; fija el ancho del lomo")
    ap.add_argument("--ancho", type=float, default=None,
                    help="ancho total de la envolvente en pulgadas (plantilla de KDP)")
    ap.add_argument("--alto", type=float, default=None,
                    help="alto total de la envolvente en pulgadas (plantilla de KDP)")
    args = ap.parse_args()
    src = source_image()
    with Image.open(src) as probe:
        print(f"Imagen de partida: {src.relative_to(ROOT)}  {probe.width} x {probe.height} px")
    build_front()
    build_wrap(args.paginas, args.ancho, args.alto)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
