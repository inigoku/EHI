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

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "edicion_poesia"
IMG = BASE / "imagenes"
FONTS = BASE / "fonts"
OUT = BASE / "Ecos_en_el_Borde_6x9_interior.pdf"

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

BOOK_TITLE = "Ecos en el borde"
AUTHOR = "Íñigo Barrera Barceló"

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
    hay que partir.
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
        if MARKER_RE.fullmatch(text):
            rows.append(("rotulo", text[2:-2].rstrip(".")))
            height += leading * 1.5
            continue
        for i, line in enumerate(wrap_runs(runs_of(text, R, SB, IT), size, limit)):
            rows.append(("verso", line, 16 if i else 0))
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
        self.cv.setTitle(f"{BOOK_TITLE} — Antología poética")
        self.cv.setAuthor(AUTHOR)
        self.cv.setSubject("Antología poética de El Horizonte Interior")
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
                small_caps(cv, M_OUTER, y_head, BOOK_TITLE, IT, 7.6, TEAL, spacing=1.2)
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
        small_caps(cv, 0, PH * 0.62, BOOK_TITLE, R, 17, INK, spacing=5.5,
                   align="center", center_x=PW / 2)
        wave(cv, PW / 2, PH * 0.62 - 26, 46)
        self.end_page()
        self.blank()

    def title_page(self) -> None:
        cv = self.cv
        self.show_folio = False
        y = PH * 0.70
        small_caps(cv, 0, y, BOOK_TITLE, R, 24, INK, spacing=7.0,
                   align="center", center_x=PW / 2)
        y -= 30
        cv.setFont(IT, 12.5)
        cv.setFillColor(TEAL)
        cv.drawCentredString(PW / 2, y, "Lírica del límite emocional")
        y -= 40
        wave(cv, PW / 2, y, 54)
        y -= 44
        cv.setFont(R, 10.4)
        cv.setFillColor(INK)
        for line in ("Antología poética de", "El Horizonte Interior"):
            cv.drawCentredString(PW / 2, y, line)
            y -= 15
        y = M_BOTTOM + 66
        small_caps(cv, 0, y, AUTHOR, R, 11, INK, spacing=2.6,
                   align="center", center_x=PW / 2)
        self.end_page()

    def credits(self, pages_note: str = "") -> None:
        cv = self.cv
        self.show_folio = False
        y = M_BOTTOM + 200
        lines = [
            (f"{BOOK_TITLE}. Lírica del límite emocional", IT),
            ("Antología poética de El Horizonte Interior", R),
            ("", R),
            (f"© {AUTHOR}", R),
            ("Todos los derechos reservados.", R),
            ("", R),
            ("Los veinte poemas y el glosario proceden de la sección", R),
            ("de poesía de El Horizonte Interior y se reproducen aquí en", R),
            ("el orden en que la obra los presenta.", R),
            ("", R),
            ("Las ilustraciones proceden de las ediciones ilustrada y de", R),
            ("cámara de la misma obra. Al final del volumen se relacionan", R),
            ("una a una.", R),
            ("", R),
            ("Primera edición en tapa dura.", R),
            ("Compuesto en Source Serif Pro.", R),
            ("", R),
            ("ISBN: pendiente de asignación", R),
        ]
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
        for line in ("A quien se quedó en la orilla", "cuando el agua se retiró."):
            cv.drawCentredString(PW / 2, y, line)
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
        small_caps(cv, x0, y, "Índice", R, 15, INK, spacing=4.0)
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
                      running: str = "") -> None:
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
        self.end_page()

    # ---- aperturas de libro
    def book_opener(self, book: Book) -> None:
        # Sin lámina enfrentada: la portadilla del libro va sola, en impar, y
        # la par anterior queda en blanco.
        self.to_recto()
        self.show_folio = False
        cv = self.cv
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
        title = "Índice de primeros versos"
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
        self.to_recto()
        self.show_folio = False
        cv = self.cv
        y = PH * 0.42
        wave(cv, PW / 2, y + 30, 46)
        cv.setFont(IT, 10.0)
        cv.setFillColor(INK)
        for line in (
            "Se acabó de componer este volumen",
            "el día en que el agua volvió a la orilla",
            "sin que nadie supiera",
            "si había traído algo consigo.",
        ):
            cv.drawCentredString(PW / 2, y, line)
            y -= 15
        self.end_page()

    def save(self) -> None:
        # KDP quiere un número par de páginas.
        if self.page % 2 == 0:
            self.blank()
        self.cv.save()


# --------------------------------------------------------------- textos fijos
INTRO_TITLE = "Desde la orilla"
INTRO = [
    "Este volumen reúne los veinte poemas y el glosario que cierran "
    "*El Horizonte Interior*. En la obra completa aparecen intercalados entre "
    "el ensayo y los cuentos, cada uno en el punto donde una idea deja de "
    "poder explicarse y solo puede decirse. Aquí van juntos, por primera vez, "
    "y leídos de corrido cuentan otra cosa.",

    "El argumento del libro del que vienen cabe en una frase: la conciencia "
    "podría tener la forma de un horizonte, una frontera que separa un dentro "
    "de un fuera y que emerge del mismo material del que está hecho todo lo "
    "demás. Es una hipótesis, y el ensayo la defiende con el aparato que le "
    "corresponde. Los poemas no la defienden. Hacen otra cosa: la habitan. "
    "Preguntan qué se siente estando dentro de una frontera así, qué duele "
    "cuando se agrieta y qué queda cuando el agua del otro lado se retira.",

    "Van repartidos en tres libros, y el reparto no es cronológico sino de "
    "temperatura.",

    "**El libro primero**, *La arquitectura con un hueco*, es un duelo en ocho "
    "oficios. Un archivista, un relojero, un luthier, una canción que alguien "
    "tarareaba en la cocina. Ninguno de los ocho habla de la pérdida "
    "directamente: hablan de lo que siguen haciendo con las manos mientras la "
    "pérdida ocurre. El hueco del título no es una metáfora del vacío. Es lo "
    "que hace sonar una caja de violín.",

    "**El libro segundo**, *La frialdad de una ciudad apagada*, baja la "
    "temperatura. Seis poemas de invierno urbano, escritos desde dentro de un "
    "cuerpo que no acaba de entrar en calor: el metro, la pastilla sobre la "
    "mesa, un villancico que no engaña a nadie, una ventana empañada con "
    "Barcelona detrás. Es la parte más áspera del conjunto y la que menos "
    "consuela.",

    "**El libro tercero**, *Los últimos libros*, recoge seis poemas que ya "
    "venían contados en prosa en los movimientos finales de la obra —el tiempo "
    "que no pasa, el espejo sin profundidad, el diapasón invisible, el ojo de "
    "un solo color, la realidad fractal— y los devuelve al verso, que era "
    "seguramente su idioma de origen.",

    "Cierra el volumen un *Glosario íntimo*: las palabras técnicas del ensayo "
    "—horizonte, interfaz, entrelazamiento, reservorio— redefinidas como lo que "
    "en realidad significaban todo el tiempo.",

    "Cada poema abre en página impar, con su ilustración enfrente. Las láminas "
    "vienen de las ediciones ilustrada y de cámara de la obra, y al final se "
    "relacionan una a una, por si alguien quiere saber qué estaba mirando.",

    "No hace falta haber leído *El Horizonte Interior* para leer esto. Hace "
    "falta, como mucho, haberse quedado alguna vez en una orilla mirando el "
    "agua irse, sin saber si volvería y sin saber qué traería de vuelta.",
]

ABOUT = [
    "*El Horizonte Interior* es un experimento de pensamiento: qué pasaría si "
    "la conciencia tuviera la estructura de un microagujero negro de Hawking. "
    "La obra lo desarrolla por tres caminos a la vez. Un ensayo de veintiséis "
    "capítulos que va de la termodinámica de agujeros negros y el vacío "
    "cuántico a la Teoría de la Información Integrada, pasando por la sabiduría "
    "taoísta antigua. Dieciséis cuentos que encarnan esos conceptos en la "
    "ciudad de Tarel, suspendida sobre un agua que un día se retira. Y esta "
    "antología, que traduce lo mismo al idioma del sentimiento.",

    "Los tres caminos son independientes y llevan al mismo sitio. Se puede "
    "entrar por cualquiera de ellos.",

    "**Íñigo Barrera Barceló** escribió *El Horizonte Interior* durante varios "
    "años, en los ratos que deja una vida que también sucedía. El libro está "
    "dedicado a Montse y a Gerard, por aguantarle todos los días con una "
    "sonrisa. Varios de los poemas de este volumen llevan sus nombres, o los "
    "llevan sin decirlo.",

    "La obra completa —ensayo, cuentos, poemas, edición joven y las "
    "ilustraciones de las que salen estas láminas— puede leerse también en su "
    "versión interactiva.",
]

# Pie de cada lámina para la relación final. Los que no traen descripción
# propia en content/poemas llevan una escrita aquí.
PLATE_NOTES_OVERRIDE = {
    "poema_camara_reloj":
        "Un reloj de arena desdoblado en una hélice de luz: la misma arena "
        "cayendo por dos gargantas que no marcan la misma hora.",
    "poema_glosario":
        "La página del glosario en la edición ilustrada: un abecedario de "
        "objetos —la ola, la casa, el diapasón, el cuenco— dibujados sobre "
        "papel cuadriculado.",
}

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
    if pid in PLATE_NOTES_OVERRIDE:
        return PLATE_NOTES_OVERRIDE[pid]
    raw = (ROOT / "content" / "poemas" / f"{pid}.es.md").read_text(encoding="utf-8")
    m = fm.match(raw)
    if not m:
        return ""
    for line in m.group(1).split("\n"):
        if line.startswith("illustrationDescription:"):
            return line.split(":", 1)[1].strip()
    return ""


def run(toc: list[Entry] | None) -> Builder:
    books, closing = load_books()
    b = Builder(toc)
    b.half_title()
    b.title_page()
    b.credits()
    b.dedication()
    b.table_of_contents()
    b.prose_section(INTRO_TITLE, INTRO, level=2, running=INTRO_TITLE)

    for book in books:
        b.book_opener(book)
        for poem in book.poems:
            b.poem(poem)

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
    b.prose_section("Las ilustraciones", paras, level=2, running="Las ilustraciones")
    b.first_line_index()
    b.prose_section("Sobre esta antología", ABOUT, level=2, running="Sobre esta antología")

    b.colophon()
    b.save()
    return b


def main() -> int:
    first = run(None)                 # primera pasada: recoger los folios
    second = run(first.toc_out)       # segunda: con el índice ya relleno
    if [(e.title, e.page) for e in first.toc_out] != \
       [(e.title, e.page) for e in second.toc_out]:
        print("AVISO: el índice movió la paginación; revisar.", file=sys.stderr)
    print(f"{OUT.relative_to(ROOT)}  —  {second.page - 1} páginas, 6 × 9 pulgadas")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
