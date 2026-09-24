#!/usr/bin/env python3
"""Monta la cubierta de tapa dura de "Cuentos de Tarel" a partir de la
ilustración en imagenes/portada.jpg.

Misma física de tapa dura de KDP que edicion_poesia/scripts/build_cover.py
y edicion_ensayo/scripts/build_cover.py (bleed/wrap/hinge/spine-board), pero
un tratamiento de arte distinto: la ilustración de portada es una acuarela
con su propia cartulina/paspartú de color crema ya compuesta en la imagen
(un plate, no una pintura a sangre completa), así que en vez del velo
oscuro + tipografía clara sobre pintura a sangre que usan poesía y ensayo,
aquí el plate va enmarcado sobre un campo liso del mismo crema, con la
tipografía en tinta/óxido -- como una lámina de libro ilustrado clásico.

Saca dos ficheros:

  Cuentos_de_Tarel_portada_frontal.pdf    solo la cubierta, con sangre
  Cuentos_de_Tarel_cubierta_tapadura.pdf  la envolvente entera

El lomo se calcula sobre las páginas reales del interior ya compilado
(Cuentos_de_Tarel_6x9.pdf). --paginas fuerza un valor a mano.

    python3 edicion_cuentos/scripts/build_interior_premium.py \
      toc_cuentos.json -o Cuentos_de_Tarel_6x9.pdf   # antes, siempre
    python3 edicion_cuentos/scripts/build_cover.py
"""
from __future__ import annotations

import argparse
from pathlib import Path

import pymupdf
from PIL import Image, ImageFilter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab import rl_config
from reportlab.pdfgen import canvas as rl_canvas

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "edicion_cuentos"
IMG = BASE / "imagenes"
FONTS = BASE / "fonts"

LANGS = {
    "es": dict(
        interior_pdf=BASE / "Cuentos_de_Tarel_6x9.pdf",
        front_pdf=BASE / "Cuentos_de_Tarel_portada_frontal.pdf",
        wrap_pdf=BASE / "Cuentos_de_Tarel_cubierta_tapadura.pdf",
        title="Cuentos de Tarel",
        subtitle="Fábulas de la Frontera",
        author="Íñigo Barrera Barceló",
        title_lines=["Cuentos de Tarel"],
        blurb=(
            "Tarel es una ciudad que aprendió a vivir con el agua que se va: cada "
            "cuento de este libro mira esa misma frontera desde un ángulo distinto "
            "-el nacimiento, la memoria, el amor, la pérdida, el duelo, la compañía."
        ),
        blurb2=(
            "Treinta relatos que encarnan en fábulas las mismas preguntas del "
            "ensayo El Horizonte Interior, con el archivista de Tarel como guía: "
            "no hace falta leerlos en orden, cada uno funciona solo, como los "
            "nudos de una red que se puede leer desde cualquier punto."
        ),
        cover_label="cubierta",
        wrap_label="cubierta de tapa dura",
    ),
    "en": dict(
        interior_pdf=BASE / "Tales_of_Tarel_6x9.pdf",
        front_pdf=BASE / "Tales_of_Tarel_front_cover.pdf",
        wrap_pdf=BASE / "Tales_of_Tarel_hardcover_wrap.pdf",
        title="Fables of Tarel",
        subtitle="Tales of the Boundary",
        author="Íñigo Barrera Barceló",
        title_lines=["Fables of Tarel"],
        blurb=(
            "Tarel is a city that learned to live with the water that leaves: each "
            "story in this book looks at that same boundary from a different angle "
            "-birth, memory, love, loss, grief, companionship."
        ),
        blurb2=(
            "Thirty tales that embody, as fables, the same questions as the essay "
            "The Inner Horizon, with the archivist of Tarel as guide: they need not "
            "be read in order, each one stands alone, like the knots of a net that "
            "can be read from any point."
        ),
        cover_label="cover",
        wrap_label="hardcover wrap",
    ),
    "ca": dict(
        interior_pdf=BASE / "Cuentos_de_Tarel_6x9_ca.pdf",
        front_pdf=BASE / "Cuentos_de_Tarel_portada_frontal_ca.pdf",
        wrap_pdf=BASE / "Cuentos_de_Tarel_cubierta_tapadura_ca.pdf",
        title="Contes de Tarel",
        subtitle="Faules de la Frontera",
        author="Íñigo Barrera Barceló",
        title_lines=["Contes de Tarel"],
        blurb=(
            "Tarel és una ciutat que va aprendre a viure amb l'aigua que se'n va: "
            "cada conte d'aquest llibre mira aquesta mateixa frontera des d'un "
            "angle diferent -el naixement, la memòria, l'amor, la pèrdua, el dol, "
            "la companyia."
        ),
        blurb2=(
            "Trenta relats que encarnen en faules les mateixes preguntes de "
            "l'assaig L'Horitzó Interior, amb l'arxivista de Tarel com a guia: "
            "no cal llegir-los en ordre, cadascun funciona sol, com els nusos "
            "d'una xarxa que es pot llegir des de qualsevol punt."
        ),
        cover_label="coberta",
        wrap_label="coberta de tapa dura",
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
# El interior lleva láminas a color (RGB, igual que el ensayo), así que en
# KDP corresponde papel a color: su constante de lomo es 0.002347"/página,
# no la de papel blanco B/N (0.002252") -- ver la cubierta de tapa blanda
# del ensayo, que KDP rechazó hasta corregir justo esto.
SPINE_PER_PAGE = 0.002347
SPINE_BOARD = 0.06
DPI = 300

# Rellenados por select_lang() antes de dibujar nada; los valores de aquí
# son solo el default (español) para que el módulo importe sin errores.
TITLE = "Cuentos de Tarel"
SUBTITLE = "Fábulas de la Frontera"
AUTHOR = "Íñigo Barrera Barceló"
TITLE_LINES = ["Cuentos de Tarel"]
FRONT_PDF = LANGS["es"]["front_pdf"]
WRAP_PDF = LANGS["es"]["wrap_pdf"]
INTERIOR_PDF = LANGS["es"]["interior_pdf"]
BLURB = (
    "Tarel es una ciudad que aprendió a vivir con el agua que se va: cada "
    "cuento de este libro mira esa misma frontera desde un ángulo distinto "
    "-el nacimiento, la memoria, el amor, la pérdida, el duelo, la compañía."
)
BLURB2 = (
    "Treinta relatos que encarnan en fábulas las mismas preguntas del "
    "ensayo El Horizonte Interior, con el archivista de Tarel como guía: "
    "no hace falta leerlos en orden, cada uno funciona solo, como los "
    "nudos de una red que se puede leer desde cualquier punto."
)

# Paleta muestreada de la propia ilustración de portada: el crema del
# paspartú de la acuarela (que además coincide casi exacto con el crema ya
# usado en el resto de la trilogía), la tinta-teal del cielo y el sepia
# cálido de los aros oxidados de amarre.
SAND = colors.HexColor("#f7efe2")    # campo de fondo, igual que el paspartú
INK = colors.HexColor("#2b4a52")     # título, texto principal
RUST = colors.HexColor("#8a6a4a")    # filete, kicker, subtítulo


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


def draw_plate(cv, cx: float, top_y: float, plate_w: float, plate_h: float) -> float:
    """Dibuja la ilustración centrada en cx, con el borde superior en
    top_y, escalada para caber en plate_w x plate_h sin recortar (la
    imagen ya trae su propio paspartú y borde, así que se muestra entera,
    no a sangre). cx/top_y/plate_w/plate_h van en puntos, como el resto de
    esta función de texto. Devuelve el borde inferior real tras el
    escalado, también en puntos."""
    plate_w_in, plate_h_in = plate_w / inch, plate_h / inch
    im = upscaled(round(plate_h_in * DPI))
    src_w_in, src_h_in = im.width / DPI, im.height / DPI
    scale = min(plate_w_in / src_w_in, plate_h_in / src_h_in)
    draw_w, draw_h = src_w_in * scale * inch, src_h_in * scale * inch
    tmp = IMG / "_portada_plate.jpg"
    im.save(tmp, "JPEG", quality=95, subsampling=0, dpi=(DPI, DPI))
    x0 = cx - draw_w / 2
    y0 = top_y - draw_h
    cv.drawImage(str(tmp), x0, y0, width=draw_w, height=draw_h, mask=None)
    return y0


def front_text(cv, x0: float, y0: float, w: float, h: float) -> None:
    cx = x0 + w / 2
    y = y0 + h - 1.0 * inch
    for line in TITLE_LINES:
        caps(cv, cx, y, line, R, 28, INK, 4.0)
        y -= 36

    plate_top = y - 0.18 * inch
    plate_bottom = draw_plate(cv, cx, plate_top, w - 1.3 * inch, h - 3.05 * inch)

    y = plate_bottom - 0.34 * inch
    cv.setStrokeColor(RUST)
    cv.setLineWidth(1.0)
    cv.line(cx - 46, y, cx + 46, y)
    y -= 22
    caps(cv, cx, y, SUBTITLE, R, 9.5, RUST, 2.0)
    y -= 26
    caps(cv, cx, y, AUTHOR, R, 12.5, INK, 3.6)


def back_text(cv, x0: float, y0: float, w: float, h: float) -> None:
    cx = x0 + w / 2
    inner = w - 1.5 * inch
    y = y0 + h - 1.5 * inch
    caps(cv, cx, y, TITLE, R, 15, INK, 4.2)
    y -= 20
    cv.setStrokeColor(RUST)
    cv.setLineWidth(0.9)
    cv.line(cx - 34, y, cx + 34, y)
    y -= 32
    cv.setFillColor(INK)
    for para in (BLURB, BLURB2):
        for line in wrapped(para, R, 10.6, inner):
            cv.setFont(R, 10.6)
            cv.drawCentredString(cx, y, line)
            y -= 15.6
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
    cv.setFillColor(INK)
    cv.setFont(R, 12)
    cv.drawCentredString(0, -4, f"{TITLE.upper()}   ·   {AUTHOR.upper()}")
    cv.restoreState()


def select_lang(lang: str) -> None:
    global TITLE, SUBTITLE, AUTHOR, TITLE_LINES, BLURB, BLURB2
    global FRONT_PDF, WRAP_PDF, INTERIOR_PDF, COVER_LABEL, WRAP_LABEL
    cfg = LANGS[lang]
    TITLE = cfg["title"]
    SUBTITLE = cfg["subtitle"]
    AUTHOR = cfg["author"]
    TITLE_LINES = cfg["title_lines"]
    BLURB = cfg["blurb"]
    BLURB2 = cfg["blurb2"]
    FRONT_PDF = cfg["front_pdf"]
    WRAP_PDF = cfg["wrap_pdf"]
    INTERIOR_PDF = cfg["interior_pdf"]
    COVER_LABEL = cfg["cover_label"]
    WRAP_LABEL = cfg["wrap_label"]


COVER_LABEL = LANGS["es"]["cover_label"]
WRAP_LABEL = LANGS["es"]["wrap_label"]


def build_front() -> None:
    w_in, h_in = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
    cv = rl_canvas.Canvas(str(FRONT_PDF), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{TITLE} — {COVER_LABEL}")
    cv.setFillColor(SAND)
    cv.rect(0, 0, w_in * inch, h_in * inch, stroke=0, fill=1)
    front_text(cv, BLEED * inch, BLEED * inch, TRIM_W * inch, TRIM_H * inch)
    cv.save()
    print(f"{FRONT_PDF.relative_to(ROOT)}  —  {w_in} x {h_in} pulgadas")


def build_wrap(pages: int, force_w: float | None, force_h: float | None) -> None:
    spine_in = pages * SPINE_PER_PAGE + SPINE_BOARD
    side = WRAP + BLEED + TRIM_W + HINGE
    w_in = force_w or (2 * side + spine_in)
    h_in = force_h or (TRIM_H + 2 * (WRAP + BLEED))

    cv = rl_canvas.Canvas(str(WRAP_PDF), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{TITLE} — {WRAP_LABEL}")
    cv.setFillColor(SAND)
    cv.rect(0, 0, w_in * inch, h_in * inch, stroke=0, fill=1)

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
    ap.add_argument("--lang", choices=["es", "en", "ca", "all"], default="all")
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

    langs = ["es", "en", "ca"] if args.lang == "all" else [args.lang]
    for lang in langs:
        select_lang(lang)
        build_front()
        pages = args.paginas or interior_page_count(INTERIOR_PDF)
        if args.paginas is None:
            print(f"  (lomo calculado sobre {pages} páginas reales del interior)")
        build_wrap(pages, args.ancho, args.alto)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
