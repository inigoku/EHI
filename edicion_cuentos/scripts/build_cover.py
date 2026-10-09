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
from PIL import Image, ImageChops, ImageFilter
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
            "Veintiocho relatos que encarnan en fábulas las mismas preguntas del "
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
        title="The Inner Horizon",
        subtitle="Volume III: Fables from Tarel",
        author="Íñigo Barrera Barceló",
        title_lines=["The Inner", "Horizon"],
        kicker="Thirty tales from the city of Tarel",
        ebook=BASE / "imagenes" / "Tales_of_Tarel_cubierta_ebook.jpg",
        blurb=(
            "Tarel is a city that learned to live with the water that leaves: each "
            "story in this book looks at that same boundary from a different angle: "
            "birth, memory, love, loss, grief, companionship."
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
            "Vint-i-vuit relats que encarnen en faules les mateixes preguntes de "
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
KICKER = ""
EBOOK = None
FRONT_PDF = LANGS["es"]["front_pdf"]
WRAP_PDF = LANGS["es"]["wrap_pdf"]
INTERIOR_PDF = LANGS["es"]["interior_pdf"]
BLURB = (
    "Tarel es una ciudad que aprendió a vivir con el agua que se va: cada "
    "cuento de este libro mira esa misma frontera desde un ángulo distinto "
    "-el nacimiento, la memoria, el amor, la pérdida, el duelo, la compañía."
)
BLURB2 = (
    "Veintiocho relatos que encarnan en fábulas las mismas preguntas del "
    "ensayo El Horizonte Interior, con el archivista de Tarel como guía: "
    "no hace falta leerlos en orden, cada uno funciona solo, como los "
    "nudos de una red que se puede leer desde cualquier punto."
)

# Paleta de la serie (la misma que la cubierta del poemario): rótulo crema y
# turquesa pálido sobre óleo azul verdoso oscuro.
SAND = colors.HexColor("#0a1016")    # fondo de seguridad detrás de la pintura
INK = colors.HexColor("#f2ede4")     # texto principal (crema)
RUST = colors.HexColor("#cfe3e2")    # filete, subtítulo, kicker (turquesa pálido)


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
    """Grano finísimo: ayuda a que la ampliación no se vea plana al imprimir."""
    noise = Image.effect_noise(im.size, strength).convert("L")
    noise = Image.merge("RGB", (noise, noise, noise))
    return ImageChops.overlay(im, noise.point(lambda v: 118 + (v - 128) // 3))


def vertical_veil(im: Image.Image, top_frac: float, bottom_frac: float,
                  top_alpha: float, bottom_alpha: float,
                  top_falloff: float = 0.85, bottom_falloff: float = 1.1) -> Image.Image:
    """Oscurece arriba y abajo para que el rótulo se lea."""
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


# Pulgadas de cielo que se añaden por arriba: en la pintura los tejados
# empiezan hacia el 18 % de la altura, justo donde van el título y el
# subtítulo, y así quedan un poco más abajo, sin tocar la escena.
SKY_PAD_IN = 0.9


def cover_field(width_in: float, height_in: float, flip: bool = False) -> Image.Image:
    """Encuadra la pintura al tamaño pedido sin deformarla, prolongando el
    cielo por arriba y recortando lo que sobre por abajo (barro oscuro)."""
    w_px, h_px = round(width_in * DPI), round(height_in * DPI)
    pad_px = round(SKY_PAD_IN * DPI)
    im = upscaled(h_px)
    scale = w_px / im.width
    im = im.resize((w_px, round(im.height * scale)), Image.LANCZOS)
    # el cielo nuevo sale de las primeras filas, estiradas y desenfocadas
    strip = im.crop((0, 0, w_px, 48)).resize((w_px, pad_px), Image.BICUBIC)
    strip = strip.filter(ImageFilter.GaussianBlur(6))
    field = Image.new("RGB", (w_px, pad_px + im.height))
    field.paste(strip, (0, 0))
    field.paste(im, (0, pad_px))
    # costura: un pequeño degradado entre el cielo nuevo y la pintura
    seam = 70
    blend = Image.new("L", (w_px, seam))
    for y in range(seam):
        blend.paste(int(255 * y / seam), (0, y, w_px, y + 1))
    top_part = field.crop((0, pad_px - seam, w_px, pad_px))
    under = im.crop((0, 0, w_px, seam))
    field.paste(Image.composite(under, top_part, blend), (0, pad_px - seam))
    field = field.crop((0, 0, w_px, h_px))
    return field.transpose(Image.FLIP_LEFT_RIGHT) if flip else field


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


def halo_caps(cv, cx: float, y: float, text: str, font: str, size: float,
              color, spacing: float) -> None:
    """Subtítulo con un velo oscuro y suave detrás: sobre las crestas claras de
    la pintura el texto crema se perdía."""
    t = text.upper()
    w = pdfmetrics.stringWidth(t, font, size) + spacing * max(0, len(t) - 1)
    cv.saveState()
    cv.setFillColor(colors.HexColor("#0a1016"))
    for pad_x, pad_y, alpha in ((26, 13, 0.10), (20, 10, 0.16), (14, 8, 0.24), (9, 6, 0.34)):
        cv.setFillAlpha(alpha)
        cv.roundRect(cx - w / 2 - pad_x, y - pad_y + size * 0.30,
                     w + 2 * pad_x, size + 2 * pad_y - 4, 8, stroke=0, fill=1)
    cv.restoreState()
    caps(cv, cx, y, text, font, size, color, spacing)


def front_text(cv, x0: float, y0: float, w: float, h: float) -> None:
    """Rotula la cubierta dentro del rectángulo de corte que se le pasa."""
    cx = x0 + w / 2
    y = y0 + h - 0.95 * inch
    for i, line in enumerate(TITLE_LINES):
        caps(cv, cx, y, line, R, 34, INK, 7.5)
        if i < len(TITLE_LINES) - 1:
            y -= 40
    y -= 26
    cv.setStrokeColor(RUST)
    cv.setLineWidth(1.0)
    cv.line(cx - 46, y, cx + 46, y)
    y -= 22
    halo_caps(cv, cx, y, SUBTITLE, R, 10.5, INK, 3.0)

    y = y0 + 0.78 * inch
    caps(cv, cx, y, AUTHOR, R, 14.5, INK, 4.2)
    if KICKER:
        y -= 22
        cv.setFont(IT, 9.8)
        cv.setFillColor(RUST)
        cv.drawCentredString(cx, y, KICKER)


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
    vol = SUBTITLE.split(":")[0].upper() if SUBTITLE.startswith("Volume ") else ""
    mid = f"   ·   {vol}" if vol else ""
    cv.drawCentredString(0, -4, f"{TITLE.upper()}{mid}   ·   {AUTHOR.upper()}")
    cv.restoreState()


def select_lang(lang: str) -> None:
    global TITLE, SUBTITLE, AUTHOR, TITLE_LINES, BLURB, BLURB2, KICKER, EBOOK
    global FRONT_PDF, WRAP_PDF, INTERIOR_PDF, COVER_LABEL, WRAP_LABEL
    cfg = LANGS[lang]
    TITLE = cfg["title"]
    SUBTITLE = cfg["subtitle"]
    AUTHOR = cfg["author"]
    TITLE_LINES = cfg["title_lines"]
    BLURB = cfg["blurb"]
    BLURB2 = cfg["blurb2"]
    KICKER = cfg.get("kicker", "")
    EBOOK = cfg.get("ebook")
    FRONT_PDF = cfg["front_pdf"]
    WRAP_PDF = cfg["wrap_pdf"]
    INTERIOR_PDF = cfg["interior_pdf"]
    COVER_LABEL = cfg["cover_label"]
    WRAP_LABEL = cfg["wrap_label"]


COVER_LABEL = LANGS["es"]["cover_label"]
WRAP_LABEL = LANGS["es"]["wrap_label"]


def build_front() -> None:
    w_in, h_in = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
    art = grain(vertical_veil(cover_field(w_in, h_in), 0.26, 0.22, 0.50, 0.62))
    tmp = IMG / "_portada_frontal.jpg"
    art.save(tmp, "JPEG", quality=94, subsampling=0, dpi=(DPI, DPI))
    cv = rl_canvas.Canvas(str(FRONT_PDF), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{TITLE} — {COVER_LABEL}")
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
    # Cubierta a la derecha; contra a la izquierda con la misma pintura
    # volteada bajo un lavado de tinta para que el texto se lea; lomo en tinta
    # plana, que es lo que mejor aguanta el doblez de la bisagra.
    half_in = (w_in - spine_in) / 2
    front = cover_field(half_in, h_in)
    back = cover_field(half_in, h_in, flip=True)
    field.paste(back, (0, 0))
    field.paste(front, (canvas_px[0] - front.width, 0))
    art = vertical_veil(field, 0.24, 0.20, 0.50, 0.60)
    wash = Image.new("RGB", (back.width, canvas_px[1]), (11, 18, 25))
    art.paste(Image.blend(art.crop((0, 0, back.width, canvas_px[1])), wash, 0.74), (0, 0))
    spine_x0 = round((w_in - spine_in) / 2 * DPI)
    spine_x1 = spine_x0 + round(spine_in * DPI)
    art.paste(Image.new("RGB", (spine_x1 - spine_x0, canvas_px[1]), (13, 21, 28)), (spine_x0, 0))
    art = grain(art)
    tmp = IMG / "_cubierta_wrap.jpg"
    art.save(tmp, "JPEG", quality=92, subsampling=0, dpi=(DPI, DPI))

    cv = rl_canvas.Canvas(str(WRAP_PDF), pagesize=(w_in * inch, h_in * inch))
    cv.setTitle(f"{TITLE} — {WRAP_LABEL}")
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


def build_ebook(out: Path) -> None:
    """Portada del EPUB (1600 x 2560, 1:1,6) a partir del frente sin sangre."""
    page = pymupdf.open(FRONT_PDF)[0]
    clip = pymupdf.Rect(BLEED * 72, BLEED * 72, (BLEED + TRIM_W) * 72, (BLEED + TRIM_H) * 72)
    zoom = 2560 / (TRIM_H * 72)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip)
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    left = (im.width - 1600) // 2
    im.crop((left, 0, left + 1600, 2560)).save(out, quality=92)
    print(f"{out.relative_to(ROOT)}  —  1600 x 2560 px")


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
        if EBOOK:
            build_ebook(EBOOK)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
