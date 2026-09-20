#!/usr/bin/env python3
"""Monta el interior de "Ecos en el borde" para tapa dura de KDP, 6 x 9".

Toma los poemas de content/poemas (los mismos ficheros que lee la web) y las
ilustraciones ya recortadas por prepare_images.py, y escribe el PDF listo para
subir a KDP.

    python3 edicion_poesia/scripts/build_interior.py

La maquetacion sigue la de la edicion KDP de la obra completa (misma paleta,
mismo aire, cabeceras y folios en el mismo sitio) subida de 5 x 8" a 6 x 9" y
adaptada al verso: cada poema abre en pagina impar con su ilustracion a pagina
completa enfrente, en la par.
"""
from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab import rl_config
from reportlab.pdfgen import canvas as rl_canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
from poemas import Book, Poem, load_books  # noqa: E402
from texts import get_text  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "edicion_poesia"
IMG = BASE / "imagenes"
FONTS = BASE / "fonts"

def get_out_path(lang: str = "es") -> Path:
    if lang == "ca":
        return BASE / "Ecos_en_el_Borde_6x9_interior_ca.pdf"
    if lang == "en":
        return BASE / "Echoes_at_the_Edge_6x9_interior.pdf"
    return BASE / "Ecos_en_el_Borde_6x9_interior.pdf"

OUT = get_out_path()

# ---------------------------------------------------------------- tipografia
FAMILY = {
    "R": ("Eco", "SourceSerifPro-Regular.ttf"),
    "I": ("Eco-It", "SourceSerifPro-It.ttf"),
    "B": ("Eco-Sb", "SourceSerifPro-Semibold.ttf"),
    "BI": ("Eco-SbIt", "SourceSerifPro-SemiboldIt.ttf"),
    "H": ("Eco-Bd", "SourceSerifPro-Bold.ttf"),
}
for _style, (_name, _file) in FAMILY.items():
    pdfmetrics.registerFont(TTFont(_name, str(FONTS / _file)))
R, IT, SB, SBIT, BD = (FAMILY[k][0] for k in ("R", "I", "B", "BI", "H"))
# Sin esto, reportlab escribe una referencia a Helvetica en cada página aunque
# no se use ningún carácter con ella, y KDP la marca como fuente no incrustada.
rl_config.canvas_basefontname = R

# ------------------------------------------------------------------- paleta
# La misma de la edicion KDP de la obra completa.
INK = colors.HexColor("#22282c")
TEAL = colors.HexColor("#3c6e71")
SAND = colors.HexColor("#c9c2b2")

# ---------------------------------------------------------------- geometria
# Formato 6 x 9" sin sangre: las ilustraciones van encajadas dentro de la caja,
# no a corte, asi que KDP no pide demasia y el PDF mide el recorte exacto.
PW, PH = 6 * inch, 9 * inch
M_GUTTER = 0.875 * inch   # margen interior (lomo); KDP pide 0.375" minimo
M_OUTER = 0.625 * inch    # margen exterior; KDP pide 0.25" minimo
M_TOP = 0.68 * inch
M_BOTTOM = 0.72 * inch
TEXT_W = PW - M_GUTTER - M_OUTER
TEXT_H = PH - M_TOP - M_BOTTOM

CURRENT_LANG = "es"  # Variable global para el idioma actual

def get_title():
    return get_text(CURRENT_LANG, "title")

def get_subtitle():
    return get_text(CURRENT_LANG, "subtitle")

def get_author():
    return get_text(CURRENT_LANG, "author")

def get_dedication():
    return get_text(CURRENT_LANG, "dedication")

def get_colophon_title():
    return get_text(CURRENT_LANG, "colophon_title")

def get_kicker():
    return get_text(CURRENT_LANG, "kicker")

VERSE_SIZE, VERSE_LEAD = 11.4, 17.0
PROSE_SIZE, PROSE_LEAD = 11.0, 16.6


def frame_x(page: int) -> float:
    """Borde izquierdo de la caja de texto: el lomo cambia de lado."""
    return M_GUTTER if page % 2 == 1 else M_OUTER


# ------------------------------------------------------------ texto con estilo
TOKEN = re.compile(r"(\*\*[^*]+\*\*|\*[^*]+\*)")


def _sortkey(text: str) -> str:
    """Orden alfabético español: sin tildes y sin distinguir mayúsculas."""
    import unicodedata
    base = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in base if unicodedata.category(c) != "Mn")


def _plain(text: str) -> str:
    """Quita el marcado de una linea: para el indice de primeros versos."""
    return re.sub(r"\*+", "", text).strip()


def runs_of(text: str, base: str, bold: str, italic: str) -> list[tuple[str, str]]:
    """Parte una linea de markdown en tramos (texto, fuente)."""
    out: list[tuple[str, str]] = []
    for part in TOKEN.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            out.append((part[2:-2], bold))
        elif part.startswith("*") and part.endswith("*"):
            out.append((part[1:-1], italic))
        else:
            out.append((part, base))
    return out or [("", base)]


def runs_width(runs: list[tuple[str, str]], size: float) -> float:
    return sum(pdfmetrics.stringWidth(t, f, size) for t, f in runs)


def draw_runs(cv, x: float, y: float, runs: list[tuple[str, str]], size: float, color) -> None:
    cv.setFillColor(color)
    for text, font in runs:
        cv.setFont(font, size)
        cv.drawString(x, y, text)
        x += pdfmetrics.stringWidth(text, font, size)


def draw_runs_justified(cv, x: float, y: float, runs, size: float, color, width: float) -> None:
    """Dibuja una linea repartiendo el sobrante entre los espacios."""
    text_w = runs_width(runs, size)
    spaces = sum(t.count(" ") for t, _ in runs)
    extra = (width - text_w) / spaces if spaces and width > text_w else 0.0
    if extra <= 0:
        draw_runs(cv, x, y, runs, size, color)
        return
    cv.saveState()
    cv.setFillColor(color)
    to = cv.beginText(x, y)
    to.setWordSpace(extra)
    for text, font in runs:
        to.setFont(font, size)
        to.textOut(text)
    cv.drawText(to)
    cv.restoreState()


def wrap_runs(runs, size, width):
    """Parte unos tramos en varias lineas que quepan en 'width'.

    Devuelve una lista de lineas; cada linea es una lista de tramos. Se corta
    por espacios, como manda el verso largo, y quien llama sangra la segunda.
    """
    if runs_width(runs, size) <= width:
        return [runs]
    lines, current, used = [], [], 0.0
    for text, font in runs:
        for word in re.split(r"(\s+)", text):
            if not word:
                continue
            w = pdfmetrics.stringWidth(word, font, size)
            if used + w > width and current and word.strip():
                lines.append(current)
                current, used = [], 0.0
                if not word.strip():
                    continue
            if current and current[-1][1] == font:
                current[-1] = (current[-1][0] + word, font)
            else:
                current.append((word, font))
            used += w
    if current:
        lines.append(current)
    return lines


def small_caps(cv, x: float, y: float, text: str, font: str, size: float, color,
               spacing: float = 1.6, align: str = "left", center_x: float = 0.0) -> None:
    """Rotulo en versalitas fingidas: todo en caja alta y con letra separada."""
    text = text.upper()
    w = pdfmetrics.stringWidth(text, font, size) + spacing * max(0, len(text) - 1)
    if align == "center":
        x = center_x - w / 2
    elif align == "right":
        x = x - w
    cv.saveState()
    cv.setFillColor(color)
    to = cv.beginText(x, y)
    to.setFont(font, size)
    to.setCharSpace(spacing)
    to.textOut(text)
    cv.drawText(to)
    cv.restoreState()


def wave(cv, cx: float, cy: float, width: float, color=TEAL, height: float = 6.0) -> None:
    """La onda a mano alzada que separa los bloques en la edicion KDP."""
    cv.saveState()
    cv.setStrokeColor(color)
    cv.setLineWidth(1.0)
    p = cv.beginPath()
    x0 = cx - width / 2
    seg = width / 3
    p.moveTo(x0, cy)
    for i in range(3):
        x1 = x0 + seg * i + seg * 0.5
        y1 = cy + (height if i % 2 == 0 else -height)
        p.curveTo(x1, y1, x1, y1, x0 + seg * (i + 1), cy)
    cv.drawPath(p, stroke=1, fill=0)
    cv.restoreState()


# Escalones a los que se compone el verso. El primero es el cuerpo normal del
# libro; los siguientes solo entran en juego cuando un poema no cabe entero en
# su página.
VERSE_STEPS = [(11.4, 17.0), (11.0, 16.4), (10.6, 15.8), (10.2, 15.2), (10.0, 14.9)]

MARKER_RE = re.compile(r"\*\*[IVX]+\.\*\*")


def verse_layout(poem, size: float, leading: float):
    """Mide un poema a un cuerpo dado.

    Devuelve (cuerpo, interlínea, filas, sangría, alto). Cada fila es
    ("verso", tramos, sangrado) | ("rotulo", texto) | ("blanco",).

    El bloque se centra ópticamente: se mide el verso más largo y se alinea
    todo a la izquierda a partir de ahí, con sangría francesa en los versos que
    hay que partir. Preserva la indentación visual de los versos.
    """
    widest = 0.0
    for raw in poem.lines:
        if raw.strip():
            widest = max(widest, runs_width(runs_of(raw.strip(), R, SB, IT), size))
    indent = max(0.0, min((TEXT_W - widest) / 2, 0.40 * inch))
    limit = TEXT_W - indent

    rows: list[tuple] = []
    height = 0.0
    prev_blank = False
    for raw in poem.lines:
        text = raw.strip()
        if not text:
            if not prev_blank:
                rows.append(("blanco",))
                height += leading * 0.62
            prev_blank = True
            continue
        prev_blank = False

        # Preservar indentación: contar espacios iniciales
        spaces = len(raw) - len(raw.lstrip())
        indent_offset = spaces * pdfmetrics.stringWidth(" ", R, size)

        if MARKER_RE.fullmatch(text):
            rows.append(("rotulo", text[2:-2].rstrip(".")))
            height += leading * 1.5
            continue
        for i, line in enumerate(wrap_runs(runs_of(text, R, SB, IT), size, limit)):
            # Sangrado: indentación visual + sangría francesa para líneas quebradas
            offset = indent_offset + (16 if i else 0)
            rows.append(("verso", line, offset))
            height += leading
    return size, leading, rows, indent, height


# ------------------------------------------------------------------ imagenes
def placed_image(cv, path: Path, box_w: float, box_h: float, cx: float, top_y: float) -> float:
    """Encaja una imagen dentro de la caja dada y la centra. Devuelve su alto."""
    with Image.open(path) as im:
        iw, ih = im.size
    scale = min(box_w / iw, box_h / ih)
    w, h = iw * scale, ih * scale
    cv.drawImage(str(path), cx - w / 2, top_y - h, width=w, height=h,
                 preserveAspectRatio=True, anchor="c", mask=None)
    return h


# Caja de las laminas a pagina completa: la de texto, un poco desbordada, y
# centrada en el alto de la pagina para que respire igual por arriba y abajo.
PLATE_W = TEXT_W + 0.35 * inch
PLATE_H = TEXT_H + 0.30 * inch


def full_plate(cv, path: Path) -> None:
    with Image.open(path) as im:
        iw, ih = im.size
    scale = min(PLATE_W / iw, PLATE_H / ih)
    w, h = iw * scale, ih * scale
    cv.drawImage(str(path), (PW - w) / 2, (PH - h) / 2, width=w, height=h,
                 preserveAspectRatio=True, anchor="c", mask=None)


# ------------------------------------------------------------------ el libro
@dataclass
class Entry:
    label: str
    title: str
    page: int
    level: int  # 0 libro, 1 poema, 2 seccion suelta


class Builder:
    def __init__(self, toc: list[Entry] | None = None):
        self.cv = rl_canvas.Canvas(str(OUT), pagesize=(PW, PH))
        self.cv.setTitle(f"{get_title()} — Antología poética")
        self.cv.setAuthor(get_author())
        self.cv.setSubject(get_text(CURRENT_LANG, "kicker"))
        self.page = 1
        self.toc_in = toc or []
        self.toc_out: list[Entry] = []
        self.running = ""       # que va en la cabecera de la impar
        self.show_folio = False
        self.no_head = False    # la pagina que abre una pieza no lleva cabecera
        self.first_lines: list[tuple[str, int]] = []

    # ---- mecanica de pagina
    def furniture(self) -> None:
        if not self.show_folio:
            return
        cv = self.cv
        recto = self.page % 2 == 1
        y_head = PH - M_TOP + 22
        if self.running and not self.no_head:
            if recto:
                small_caps(cv, PW - M_OUTER, y_head, self.running, IT, 7.6, TEAL,
                           align="right", spacing=1.2)
            else:
                small_caps(cv, M_OUTER, y_head, get_title(), IT, 7.6, TEAL, spacing=1.2)
        cv.setFont(R, 8.6)
        cv.setFillColor(INK)
        cv.drawCentredString(PW / 2, M_BOTTOM - 26, str(self.page))

    def end_page(self) -> None:
        self.furniture()
        self.no_head = False
        self.cv.showPage()
        self.page += 1

    def blank(self, count: int = 1) -> None:
        for _ in range(count):
            keep, self.show_folio = self.show_folio, False
            self.end_page()
            self.show_folio = keep

    def to_recto(self) -> None:
        if self.page % 2 == 0:
            self.blank()

    def to_verso(self) -> None:
        if self.page % 2 == 1:
            self.blank()

    def mark(self, label: str, title: str, level: int) -> None:
        self.toc_out.append(Entry(label, title, self.page, level))

    # ---- paginas de principio
    def half_title(self) -> None:
        cv = self.cv
        self.show_folio = False
        small_caps(cv, 0, PH * 0.62, get_title(), R, 17, INK, spacing=5.5,
                   align="center", center_x=PW / 2)
        wave(cv, PW / 2, PH * 0.62 - 26, 46)
        self.end_page()
        self.blank()

    def title_page(self) -> None:
        cv = self.cv
        self.show_folio = False
        y = PH * 0.70
        small_caps(cv, 0, y, get_title(), R, 24, INK, spacing=7.0,
                   align="center", center_x=PW / 2)
        y -= 30
        cv.setFont(IT, 12.5)
        cv.setFillColor(TEAL)
        cv.drawCentredString(PW / 2, y, get_subtitle())
        y -= 40
        wave(cv, PW / 2, y, 54)
        y -= 44
        cv.setFont(R, 10.4)
        cv.setFillColor(INK)
        for line in (get_text(CURRENT_LANG, "anthology_label"), get_text(CURRENT_LANG, "essay_title")):
            cv.drawCentredString(PW / 2, y, line)
            y -= 15
        y = M_BOTTOM + 66
        small_caps(cv, 0, y, get_author(), R, 11, INK, spacing=2.6,
                   align="center", center_x=PW / 2)
        self.end_page()

    def credits(self, pages_note: str = "") -> None:
        cv = self.cv
        self.show_folio = False
        y = M_BOTTOM + 200
        credits_text = get_text(CURRENT_LANG, "credits_text")
        # Parse HTML-like credits text into lines
        import re as _re
        lines = []
        for line in credits_text.split("</p>"):
            line = line.replace("<p>", "").replace("<em>", "").replace("</em>", "").replace("<br/>", " ")
            line = _re.sub(r"<[^>]+>", "", line).strip()
            if line:
                # Determine font based on content
                if line.startswith("©"):
                    lines.append((line, R))
                elif "Antología" in line or "Antologia" in line:
                    lines.append((line, R))
                else:
                    lines.append((line, R))
            else:
                lines.append(("", R))

        for text, font in lines:
            if text:
                cv.setFont(font, 8.8)
                cv.setFillColor(INK)
                cv.drawString(frame_x(self.page), y, text)
            y -= 12.4
        self.end_page()

    def dedication(self) -> None:
        cv = self.cv
        self.show_folio = False
        cv.setFont(IT, 11.6)
        cv.setFillColor(INK)
        y = PH * 0.58
        dedication_text = get_dedication()
        for line in dedication_text.split("<br/>"):
            cv.drawCentredString(PW / 2, y, line.strip())
            y -= 18
        self.end_page()
        self.blank()

    # ---- indice
    def table_of_contents(self, reserved: int = 2) -> None:
        cv = self.cv
        self.show_folio = False
        start = self.page
        x0 = frame_x(self.page)
        x1 = x0 + TEXT_W
        y = PH - M_TOP - 16
        toc_title = get_text(CURRENT_LANG, "toc_title")
        small_caps(cv, x0, y, toc_title, R, 15, INK, spacing=4.0)
        y -= 34
        for e in self.toc_in:
            if y < M_BOTTOM - 6:
                self.end_page()
                x0 = frame_x(self.page)
                x1 = x0 + TEXT_W
                y = PH - M_TOP - 16
            if e.level == 0:
                y -= 8
                small_caps(cv, x0, y, e.label, R, 8.0, TEAL, spacing=1.8)
                y -= 15
                cv.setFont(SB, 11.2)
                cv.setFillColor(INK)
                cv.drawString(x0, y, e.title)
                cv.setFont(R, 9.6)
                cv.drawRightString(x1, y, str(e.page))
                y -= 15
            elif e.level == 1:
                cv.setFont(R, 10.0)
                cv.setFillColor(INK)
                num = f"{e.label}. " if e.label else ""
                cv.drawString(x0 + 16, y, f"{num}{e.title}")
                cv.setFont(R, 9.2)
                cv.setFillColor(SAND)
                dot_from = x0 + 16 + pdfmetrics.stringWidth(f"{num}{e.title}", R, 10.0) + 6
                dot_to = x1 - pdfmetrics.stringWidth(str(e.page), R, 9.6) - 6
                if dot_to > dot_from:
                    cv.setDash(0.6, 3.2)
                    cv.setStrokeColor(SAND)
                    cv.setLineWidth(0.6)
                    cv.line(dot_from, y + 3, dot_to, y + 3)
                    cv.setDash()
                cv.setFont(R, 9.6)
                cv.setFillColor(INK)
                cv.drawRightString(x1, y, str(e.page))
                y -= 14.6
            else:
                y -= 3
                cv.setFont(IT, 10.4)
                cv.setFillColor(INK)
                cv.drawString(x0, y, e.title)
                cv.setFont(R, 9.6)
                cv.drawRightString(x1, y, str(e.page))
                y -= 14.5
        self.end_page()
        while self.page - start < reserved:
            self.blank()
        if self.page - start > reserved:
            raise SystemExit(
                f"El índice ocupa {self.page - start} páginas y hay {reserved} reservadas."
            )

    # ---- prosa corrida (introduccion y notas finales)
    def prose_section(self, title: str, paragraphs: list[str], level: int = 2,
                      running: str = "", with_qr: bool = False) -> None:
        self.to_recto()
        self.mark("", title, level)
        self.running = running or title
        self.show_folio = True
        self.no_head = True
        cv = self.cv
        x0 = frame_x(self.page)
        y = PH - M_TOP - 18
        small_caps(cv, x0, y, title, R, 14, INK, spacing=3.6)
        y -= 12
        cv.setStrokeColor(TEAL)
        cv.setLineWidth(0.8)
        cv.line(x0, y, x0 + 42, y)
        y -= 26
        for para in paragraphs:
            runs = runs_of(para, R, SB, IT)
            wrapped = wrap_runs(runs, PROSE_SIZE, TEXT_W)
            for i, line in enumerate(wrapped):
                if y < M_BOTTOM:
                    self.end_page()
                    x0 = frame_x(self.page)
                    y = PH - M_TOP - 18
                if i == len(wrapped) - 1:
                    draw_runs(cv, x0, y, line, PROSE_SIZE, INK)
                else:
                    draw_runs_justified(cv, x0, y, line, PROSE_SIZE, INK, TEXT_W)
                y -= PROSE_LEAD
            y -= 7

        # Append QR code and URL if requested
        if with_qr:
            y -= 20  # Extra space after paragraphs

            # Interactive-version label (localized)
            cv.setFont(IT, 10.0)
            cv.setFillColor(INK)
            cv.drawString(x0, y, get_text(CURRENT_LANG, "interactive_version_label"))
            y -= 20

            # QR code
            qr_path = IMG / "qr_url.png"
            if qr_path.exists():
                qr_size = 100  # puntos
                cv.drawImage(str(qr_path), x0, y - qr_size, width=qr_size, height=qr_size,
                            preserveAspectRatio=True, anchor="lb")
                y -= qr_size + 10

            # URL below QR
            cv.setFont(R, 9.0)
            cv.drawString(x0, y, "ehi-pi.vercel.app")

        self.end_page()

    # ---- aperturas de libro
    def book_opener(self, book: Book) -> None:
        # Lámina enfrentada a la portadilla: la lámina en par, la portadilla en impar.
        self.to_verso()
        self.show_folio = False
        cv = self.cv
        full_plate(cv, IMG / f"{book.key}.jpg")
        self.end_page()
        self.mark(book.ordinal, book.title, 0)
        x0 = frame_x(self.page)
        y = PH * 0.60
        small_caps(cv, x0, y, book.ordinal, R, 9.0, TEAL, spacing=3.2)
        y -= 34
        cv.setFillColor(INK)
        for line in wrap_runs([(book.title, BD)], 21, TEXT_W):
            draw_runs(cv, x0, y, line, 21, INK)
            y -= 27
        y -= 8
        cv.setStrokeColor(TEAL)
        cv.setLineWidth(0.9)
        cv.line(x0, y, x0 + 54, y)
        y -= 26
        for line in wrap_runs([(book.epigraph, IT)], 10.4, TEXT_W - 30):
            draw_runs(cv, x0, y, line, 10.4, INK)
            y -= 15.6
        self.end_page()
        self.running = book.title

    # ---- poemas
    def plate(self, pid: str) -> None:
        self.to_verso()
        self.show_folio = False
        full_plate(self.cv, IMG / f"{pid}.jpg")
        self.end_page()

    def poem(self, poem: Poem) -> None:
        self.plate(poem.pid)
        self.mark(poem.numeral, poem.title, 1)
        self.show_folio = True
        self.no_head = True
        for raw in poem.lines:
            text = raw.strip()
            if text and not re.fullmatch(r"\*\*[IVX]+\.\*\*", text):
                self.first_lines.append((_plain(text), self.page))
                break
        cv = self.cv
        x0 = frame_x(self.page)
        y = PH - M_TOP - 14

        if poem.numeral:
            small_caps(cv, x0, y, poem.numeral, R, 9.0, TEAL, spacing=3.0)
            y -= 22
        for line in wrap_runs([(poem.title, BD)], 15.5, TEXT_W):
            draw_runs(cv, x0, y, line, 15.5, INK)
            y -= 21
        if poem.source:
            y -= 2
            cv.setFont(IT, 9.4)
            cv.setFillColor(TEAL)
            cv.drawString(x0, y, f"de {poem.source}")
            y -= 14
        y -= 6
        cv.setStrokeColor(TEAL)
        cv.setLineWidth(0.8)
        cv.line(x0, y, x0 + 42, y)
        y -= 22

        if poem.kind == "glosario":
            self._glossary_body(poem, y)
        else:
            self._verse_body(poem, y)
        self.end_page()

    def _new_verse_page(self) -> tuple[float, float]:
        self.end_page()
        self.show_folio = True
        return frame_x(self.page), PH - M_TOP - 14

    def _verse_body(self, poem: Poem, y: float) -> None:
        """Compone el poema entero en la página, encogiendo el cuerpo si hace falta.

        Ningún poema del libro pasa de página. Los que no caben al cuerpo normal
        bajan por los escalones de VERSE_STEPS hasta que entran: es lo que se
        hace en cualquier libro de verso con un poema largo, y se nota mucho
        menos que partirlo en dos.
        """
        cv = self.cv
        x0 = frame_x(self.page)
        available = y - M_BOTTOM

        size, leading, rows, indent, height = verse_layout(poem, *VERSE_STEPS[0])
        for step in VERSE_STEPS[1:]:
            if height <= available:
                break
            size, leading, rows, indent, height = verse_layout(poem, *step)

        x = x0 + indent
        for row in rows:
            if row[0] == "blanco":
                y -= leading * 0.62
                continue
            if y < M_BOTTOM:                 # red de seguridad: no debería pasar
                x0, y = self._new_verse_page()
                x = x0 + indent
            if row[0] == "rotulo":
                y -= leading * 0.45
                small_caps(cv, x, y, row[1], R, size * 0.76, TEAL, spacing=2.4)
                y -= leading * 1.05
                continue
            draw_runs(cv, x + row[2], y, row[1], size, INK)
            y -= leading

    def _glossary_body(self, poem: Poem, y: float) -> None:
        cv = self.cv
        x0 = frame_x(self.page)
        for raw in poem.lines:
            text = raw.strip()
            if not text:
                continue
            if re.fullmatch(r"\*[^*]+\*", text):  # divisoria: *Los últimos libros*
                y -= 10
                if y < M_BOTTOM + 26:
                    self.end_page()
                    x0, y = frame_x(self.page), PH - M_TOP - 14
                wave(cv, x0 + TEXT_W / 2, y + 4, 40)
                y -= 16
                cv.setFont(IT, 10.0)
                cv.setFillColor(TEAL)
                cv.drawCentredString(x0 + TEXT_W / 2, y, text[1:-1])
                y -= 24
                continue
            runs = runs_of(text, R, SB, IT)
            wrapped = wrap_runs(runs, PROSE_SIZE, TEXT_W)
            for i, line in enumerate(wrapped):
                if y < M_BOTTOM:
                    self.end_page()
                    self.show_folio = True
                    x0, y = frame_x(self.page), PH - M_TOP - 14
                sx = x0 + (14 if i else 0)
                if i == len(wrapped) - 1:
                    draw_runs(cv, sx, y, line, PROSE_SIZE, INK)
                else:
                    draw_runs_justified(cv, sx, y, line, PROSE_SIZE, INK,
                                        TEXT_W - (14 if i else 0))
                y -= PROSE_LEAD
            y -= 6

    # ---- indice de primeros versos
    def first_line_index(self) -> None:
        self.to_recto()
        title = get_text(CURRENT_LANG, "first_line_index_title")
        self.mark("", title, 2)
        self.running = title
        self.show_folio = True
        self.no_head = True
        cv = self.cv
        x0 = frame_x(self.page)
        y = PH - M_TOP - 18
        small_caps(cv, x0, y, title, R, 14, INK, spacing=3.6)
        y -= 12
        cv.setStrokeColor(TEAL)
        cv.setLineWidth(0.8)
        cv.line(x0, y, x0 + 42, y)
        y -= 28

        entries = sorted(self.first_lines, key=lambda e: _sortkey(e[0]))
        for text, page in entries:
            if y < M_BOTTOM:
                self.end_page()
                self.show_folio = True
                x0 = frame_x(self.page)
                y = PH - M_TOP - 18
            num = str(page)
            room = TEXT_W - pdfmetrics.stringWidth(num, R, 9.6) - 14
            line = text
            while pdfmetrics.stringWidth(line, IT, 10.0) > room and len(line) > 12:
                line = line[:-2]
            if line != text:
                line = line.rstrip(" ,;:.") + "…"
            cv.setFont(IT, 10.0)
            cv.setFillColor(INK)
            cv.drawString(x0, y, line)
            cv.setFont(R, 9.6)
            cv.drawRightString(x0 + TEXT_W, y, num)
            y -= 15.2
        self.end_page()

    # ---- final
    def colophon(self) -> None:
        self.show_folio = False
        cv = self.cv
        y = PH * 0.42
        wave(cv, PW / 2, y + 30, 46)
        cv.setFont(IT, 10.0)
        cv.setFillColor(INK)
        colophon_text = get_text(CURRENT_LANG, "colophon_text")
        for line in colophon_text.split("<br/>"):
            cv.drawCentredString(PW / 2, y, line.strip())
            y -= 15
        self.end_page()

    def save(self) -> None:
        # KDP quiere un número par de páginas.
        # Hardcover mínimo 75 páginas; si llegamos con 74, añadir una.
        current_page_count = self.page - 1
        if current_page_count < 75:
            self.blank()
        if self.page % 2 == 0:
            self.blank()
        self.cv.save()


# --------------------------------------------------------------- textos fijos
def get_intro_title():
    return get_text(CURRENT_LANG, "intro_title")

def get_intro():
    return get_text(CURRENT_LANG, "intro")

def get_about():
    return get_text(CURRENT_LANG, "about")

def get_illustrations_title():
    return get_text(CURRENT_LANG, "illustrations_title")

def get_about_title():
    return get_text(CURRENT_LANG, "about_title")

def get_plate_notes_override():
    return get_text(CURRENT_LANG, "plate_notes_override")

def plate_notes(books, closing):
    """Lee de content/poemas la descripción de cada ilustración."""
    import re as _re
    notes = []
    fm = _re.compile(r"\A---\r?\n(.*?)\r?\n---", _re.DOTALL)
    for book in books:
        for p in book.poems:
            notes.append(("poem", p.pid, p.title, _description(p.pid, fm)))
    notes.append(("poem", closing.pid, closing.title, _description(closing.pid, fm)))
    return notes


def _description(pid: str, fm) -> str:
    override = get_plate_notes_override()
    if pid in override:
        return override[pid]
    lang_suffix = CURRENT_LANG
    raw = (ROOT / "content" / "poemas" / f"{pid}.{lang_suffix}.md").read_text(encoding="utf-8")
    m = fm.match(raw)
    if not m:
        return ""
    for line in m.group(1).split("\n"):
        if line.startswith("illustrationDescription:"):
            return line.split(":", 1)[1].strip()
    return ""


def run(toc: list[Entry] | None, lang: str = "es") -> Builder:
    global OUT, CURRENT_LANG
    CURRENT_LANG = lang
    OUT = get_out_path(lang)
    books, closing = load_books(lang)
    b = Builder(toc)
    b.half_title()
    b.title_page()
    b.credits()
    b.dedication()
    b.table_of_contents()
    b.prose_section(get_intro_title(), get_intro(), level=2, running=get_intro_title())

    for i, book in enumerate(books):
        b.book_opener(book)
        for poem in book.poems:
            b.poem(poem)
        # Divisoria ilustrada después de cada libro (excepto el último)
        if i < len(books) - 1:
            b.to_verso()
            b.show_folio = False
            divisor_imgs = ["cuento_estanque.jpg", "cuento_amanezca.jpg"]
            full_plate(b.cv, IMG / divisor_imgs[i])
            b.end_page()

    # divisoria: página ilustrada de transición antes del glosario
    b.to_verso()
    b.show_folio = False
    full_plate(b.cv, IMG / "cuento_dragon.jpg")
    b.end_page()

    # cierre: el glosario, como libro aparte
    b.to_verso()
    b.show_folio = False
    full_plate(b.cv, IMG / f"{closing.pid}.jpg")
    b.end_page()
    b.mark("", closing.title, 2)
    b.running = closing.title
    b.show_folio = True
    b.no_head = True
    cv = b.cv
    x0 = frame_x(b.page)
    y = PH - M_TOP - 14
    for line in wrap_runs([(closing.title, BD)], 15.5, TEXT_W):
        draw_runs(cv, x0, y, line, 15.5, INK)
        y -= 21
    y -= 6
    cv.setStrokeColor(TEAL)
    cv.setLineWidth(0.8)
    cv.line(x0, y, x0 + 42, y)
    y -= 28
    b._glossary_body(closing, y)
    b.end_page()

    # relación de láminas
    paras = []
    for kind, pid, title, desc in plate_notes(books, closing):
        if not desc:
            continue
        paras.append(f"**{title}.** {desc}")
    illus_title = get_illustrations_title()
    b.prose_section(illus_title, paras, level=2, running=illus_title)
    b.first_line_index()
    about_title = get_about_title()
    b.prose_section(about_title, get_about(), level=2, running=about_title, with_qr=True)

    b.colophon()
    b.save()
    return b


def main() -> int:
    for lang in ["es", "ca", "en"]:
        first = run(None, lang)                 # primera pasada: recoger los folios
        second = run(first.toc_out, lang)       # segunda: con el índice ya relleno
        if [(e.title, e.page) for e in first.toc_out] != \
           [(e.title, e.page) for e in second.toc_out]:
            print(f"AVISO: el índice movió la paginación ({lang}); revisar.", file=sys.stderr)
        print(f"{OUT.relative_to(ROOT)}  —  {second.page - 1} páginas, 6 × 9 pulgadas")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
