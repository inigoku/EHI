#!/usr/bin/env python3
"""Monta la cubierta de tapa dura de "El horizonte interior / L'horitzó
interior / The Inner Horizon" (edición de cámara ampliada, 5 x 8") a partir
de la ilustración en imagenes/portada.jpg.

Reutiliza el planteamiento de edicion_ensayo/scripts/build_cover.py (misma
física de tapa dura de KDP, mismo tratamiento de velo y grano), adaptado al
trim 5x8" de esta edición y parametrizado por idioma (es / ca / en), con el
lomo calculado sobre las páginas reales de cada PDF interior ya generado.

Uso:
    python3 edicion_tapadura/scripts/build_cover.py --lang ca
    python3 edicion_tapadura/scripts/build_cover.py --lang en
    python3 edicion_tapadura/scripts/build_cover.py --lang es

Salida (una por idioma):
    El_Horizonte_Interior_TAPADURA_portada_<lang>.pdf   solo cubierta frontal, con sangre
    El_Horizonte_Interior_TAPADURA_cubierta_<lang>.pdf  la envolvente completa (contra + lomo + frente)
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
BASE = ROOT / "edicion_tapadura"
IMG = BASE / "imagenes"
FONTS = BASE / "fonts"

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
SPINE_PER_PAGE = 0.002252   # papel blanco KDP
SPINE_BOARD = 0.06
DPI = 300

INK = colors.HexColor("#22282c")
SAND = colors.HexColor("#f2ede4")    # texto principal sobre el velo oscuro
GOLD = colors.HexColor("#cfe3e2")    # acento: filete, subtítulo, kicker

STRINGS = {
    "es": dict(
        title="El horizonte interior",
        title_lines=["El horizonte", "interior"],
        subtitle="Edición de cámara",
        author="Íñigo Barrera Barceló",
        kicker="Diez movimientos sobre la geometría de la conciencia",
        blurb1=(
            "Un ensayo que usa la física de los agujeros negros como lente para "
            "pensar la conciencia: el horizonte de sucesos como frontera entre lo "
            "que un yo deja escapar y lo que queda atrapado para siempre."
        ),
        blurb2=(
            "Diez movimientos que cruzan neurociencia, teoría de la información y "
            "física teórica sin abandonar nunca la pregunta más simple: qué "
            "significa que haya alguien ahí dentro. Con El espejo sin profundidad, "
            "El diapasón invisible, El ojo de un solo color y La realidad fractal."
        ),
        interior_pdf=BASE / "El_Horizonte_Interior_TAPADURA_es.pdf",
    ),
    "ca": dict(
        title="L'horitzó interior",
        title_lines=["L'horitzó", "interior"],
        subtitle="Edició de cambra",
        author="Íñigo Barrera Barceló",
        kicker="Deu moviments sobre la geometria de la consciència",
        blurb1=(
            "Un assaig que fa servir la física dels forats negres com a lent per "
            "pensar la consciència: l'horitzó de successos com a frontera entre "
            "allò que un jo deixa escapar i allò que queda atrapat per sempre."
        ),
        blurb2=(
            "Deu moviments que travessen neurociència, teoria de la informació i "
            "física teòrica sense abandonar mai la pregunta més senzilla: què "
            "significa que hi hagi algú a dins. Amb El mirall sense profunditat, "
            "El diapasó invisible, L'ull d'un sol color i La realitat fractal."
        ),
        interior_pdf=BASE / "El_Horizonte_Interior_TAPADURA_ca.pdf",
    ),
    "en": dict(
        title="The Inner Horizon",
        title_lines=["The Inner", "Horizon"],
        subtitle="Chamber Edition",
        author="Íñigo Barrera Barceló",
        kicker="Ten movements on the geometry of consciousness",
        blurb1=(
            "An essay that uses black hole physics as a lens for thinking about "
            "consciousness: the event horizon as the boundary between what a self "
            "lets escape and what stays trapped forever."
        ),
        blurb2=(
            "Ten movements crossing neuroscience, information theory, and "
            "theoretical physics without ever abandoning the simplest question: "
            "what it means for someone to be in there. With The Mirror Without "
            "Depth, The Invisible Tuning Fork, The Eye of a Single Color, and "
            "The Fractal Reality."
        ),
        interior_pdf=BASE / "El_Horizonte_Interior_TAPADURA_en.pdf",
    ),
}


def interior_page_count(interior_pdf: Path) -> int:
    if not interior_pdf.exists():
        raise SystemExit(
            f"No encuentro {interior_pdf.relative_to(ROOT)} para calcular el "
            f"lomo. Compila antes el interior o pasa --paginas a mano."
        )
    with pymupdf.open(interior_pdf) as doc:
        return doc.page_count


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
    dark = Image.new("RGB", (w, h), (8, 22, 26))
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


def front_text(cv, x0: float, y0: float, w: float, h: float, S: dict) -> None:
    cx = x0 + w / 2
    y = y0 + h - 1.15 * inch
    for line in S["title_lines"]:
        caps(cv, cx, y, line, R, 30, SAND, 7.0)
        y -= 38
    y -= 12
    cv.setStrokeColor(GOLD)
    cv.setLineWidth(1.0)
    cv.line(cx - 40, y, cx + 40, y)
    y -= 22
    caps(cv, cx, y, S["subtitle"], R, 8.2, GOLD, 1.6)

    y = y0 + 1.15 * inch
    caps(cv, cx, y, S["author"], R, 12, SAND, 3.4)
    y -= 20
    cv.setFont(IT, 8.3)
    cv.setFillColor(GOLD)
    for line in wrapped(S["kicker"], IT, 8.3, w - 0.7 * inch):
        cv.drawCentredString(cx, y, line)
        y -= 12


def back_text(cv, x0: float, y0: float, w: float, h: float, S: dict) -> None:
    cx = x0 + w / 2
    inner = w - 1.1 * inch
    y = y0 + h - 1.3 * inch
    caps(cv, cx, y, S["title"], R, 12.5, SAND, 3.6)
    y -= 18
    cv.setStrokeColor(GOLD)
    cv.setLineWidth(0.9)
    cv.line(cx - 30, y, cx + 30, y)
    y -= 26
    cv.setFillColor(SAND)
    for para in (S["blurb1"], S["blurb2"]):
        for line in wrapped(para, R, 8.6, inner):
            cv.setFont(R, 8.6)
            cv.drawCentredString(cx, y, line)
            y -= 12.6
        y -= 8
    # hueco reservado para el código de barras de KDP: 2 x 1,2" en la esquina
    cv.setFillColor(colors.white)
    cv.rect(x0 + w - 2.0 * inch, y0 + 0.35 * inch, 1.7 * inch, 1.0 * inch,
            stroke=0, fill=1)


def spine_text(cv, cx: float, y0: float, h: float, spine_w: float, S: dict) -> None:
    if spine_w < 0.30 * inch:
        return
    cv.saveState()
    cv.translate(cx, y0 + h / 2)
    cv.rotate(-90)
    cv.setFillColor(SAND)
    cv.setFont(R, 10)
    cv.drawCentredString(0, -3.5, f"{S['title'].upper()}   ·   {S['author'].upper()}")
    cv.restoreState()


def build_front(S: dict, front_pdf: Path) -> None:
    w_in, h_in = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
    art = grain(vertical_veil(cover_field(w_in, h_in), 0.46, 0.30, 0.68, 0.72))
    tmp = IMG / "_portada_frontal.jpg"
    art.save(tmp, "JPEG", quality=94, subsampling=0, dpi=(DPI, DPI))

    cv = rl_canvas.Canvas(str(front_pdf), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{S['title']} — cubierta")
    cv.drawImage(str(tmp), 0, 0, width=w_in * inch, height=h_in * inch, mask=None)
    front_text(cv, BLEED * inch, BLEED * inch, TRIM_W * inch, TRIM_H * inch, S)
    cv.save()
    print(f"{front_pdf.relative_to(ROOT)}  —  {w_in} x {h_in} pulgadas")


def build_wrap(S: dict, pages: int, wrap_pdf: Path,
               force_w: float | None, force_h: float | None) -> None:
    spine_in = pages * SPINE_PER_PAGE + SPINE_BOARD
    side = WRAP + BLEED + TRIM_W + HINGE
    w_in = force_w or (2 * side + spine_in)
    h_in = force_h or (TRIM_H + 2 * (WRAP + BLEED))

    canvas_px = (round(w_in * DPI), round(h_in * DPI))
    field = Image.new("RGB", canvas_px, (8, 22, 26))

    half_in = (w_in - spine_in) / 2
    front = cover_field(half_in, h_in)
    back = cover_field(half_in, h_in, flip=True)
    field.paste(back, (0, 0))
    field.paste(front, (canvas_px[0] - front.width, 0))

    art = vertical_veil(field, 0.44, 0.28, 0.66, 0.70)
    wash = Image.new("RGB", (back.width, canvas_px[1]), (9, 24, 28))
    art.paste(Image.blend(art.crop((0, 0, back.width, canvas_px[1])), wash, 0.74), (0, 0))

    spine_x0 = round((w_in - spine_in) / 2 * DPI)
    spine_x1 = spine_x0 + round(spine_in * DPI)
    art.paste(Image.new("RGB", (spine_x1 - spine_x0, canvas_px[1]), (10, 27, 31)),
              (spine_x0, 0))
    art = grain(art)

    tmp = IMG / "_cubierta_wrap.jpg"
    art.save(tmp, "JPEG", quality=92, subsampling=0, dpi=(DPI, DPI))

    cv = rl_canvas.Canvas(str(wrap_pdf), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{S['title']} — cubierta de tapa dura")
    cv.drawImage(str(tmp), 0, 0, width=w_in * inch, height=h_in * inch, mask=None)

    trim_y = (WRAP + BLEED) * inch
    trim_h = TRIM_H * inch
    back_x = (WRAP + BLEED) * inch
    front_x = (w_in - WRAP - BLEED - TRIM_W) * inch
    back_text(cv, back_x, trim_y, TRIM_W * inch, trim_h, S)
    front_text(cv, front_x, trim_y, TRIM_W * inch, trim_h, S)
    spine_text(cv, w_in * inch / 2, trim_y, trim_h, spine_in * inch, S)
    cv.save()
    print(f"{wrap_pdf.relative_to(ROOT)}  —  {w_in:.3f} x {h_in:.3f} pulgadas "
          f"(lomo {spine_in:.3f}\" para {pages} páginas)")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["es", "ca", "en"], default="ca")
    ap.add_argument("--paginas", type=int, default=None)
    ap.add_argument("--ancho", type=float, default=None)
    ap.add_argument("--alto", type=float, default=None)
    args = ap.parse_args()

    S = STRINGS[args.lang]
    src = source_image()
    if not src.exists():
        raise SystemExit(
            f"No encuentro {src.relative_to(ROOT)}. Copia la ilustración de "
            f"portada ahí (o como portada_2k.jpg) antes de correr este script."
        )
    with Image.open(src) as probe:
        print(f"Imagen de partida: {src.relative_to(ROOT)}  {probe.width} x {probe.height} px")

    front_pdf = BASE / f"El_Horizonte_Interior_TAPADURA_portada_{args.lang}.pdf"
    wrap_pdf = BASE / f"El_Horizonte_Interior_TAPADURA_cubierta_{args.lang}.pdf"

    build_front(S, front_pdf)
    pages = args.paginas or interior_page_count(S["interior_pdf"])
    if args.paginas is None:
        print(f"  (lomo calculado sobre {pages} páginas reales del interior)")
    build_wrap(S, pages, wrap_pdf, args.ancho, args.alto)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
