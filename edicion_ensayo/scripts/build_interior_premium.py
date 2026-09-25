#!/usr/bin/env python3
"""Maqueta "chulo" (premium) del ensayo completo para tapa dura KDP, 6 x 9".

Sustituye a generate_book_pdf.py --trim 6x9 (que producía un PDF correcto
pero con la tipografía y el aire genéricos del motor compartido) por una
maquetación con la misma alma que edicion_poesia/scripts/build_interior.py:
tipografía Source Serif Pro, paleta propia, folios y cabeceras corridas,
índice con puntos guía, y una lámina a página completa antes de cada
capítulo (en la par, con el capítulo abriendo justo enfrente en la impar) —
igual que hace la edición de poesía con cada poema.

El cuerpo de cada capítulo (párrafos, tablas, citas, ilustraciones en
línea) reutiliza tal cual el parser markdown del motor genérico
(generate_book_pdf.markdown_to_flowables), así que solo hemos tenido que
escribir el "traje": aperturas, láminas, índice y cabeceras.

    python3 edicion_ensayo/scripts/build_interior_premium.py \
        ../toc_ensayo.json -o ../El_Horizonte_Interior_Ensayo_6x9.pdf
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab import rl_config
from reportlab.platypus.doctemplate import ActionFlowable
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    HRFlowable,
    PageTemplate,
    Paragraph,
    Spacer,
)
from reportlab.platypus.tableofcontents import TableOfContents

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))
import generate_book_pdf as gbp  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
FONTS = Path(__file__).resolve().parents[1] / "fonts"

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except AttributeError:
    pass

# --------------------------------------------------------------- tipografia
FAMILY = {
    "R": ("Eco", "SourceSerifPro-Regular.ttf"),
    "I": ("Eco-It", "SourceSerifPro-It.ttf"),
    "B": ("Eco-Sb", "SourceSerifPro-Semibold.ttf"),
    "BI": ("Eco-SbIt", "SourceSerifPro-SemiboldIt.ttf"),
    "H": ("Eco-Bd", "SourceSerifPro-Bold.ttf"),
}


FALLBACK_FONT = "EcoFallback"
FALLBACK_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]
# Second-tier fallback, tried only for characters the first fallback also
# lacks -- in practice this is CJK: the odd Chinese character glossing a
# term (e.g. "De (德)"), which DejaVu/Liberation/Arial don't cover either.
CJK_FALLBACK_FONT = "EcoFallbackCJK"
CJK_FALLBACK_CANDIDATES = [
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "C:/Windows/Fonts/msyh.ttc",
    "/System/Library/Fonts/PingFang.ttc",
]

_SAFE_CODEPOINTS: set = set()
_FALLBACK_CODEPOINTS: set = set()
_CJK_FALLBACK_AVAILABLE = False


def register_fonts() -> None:
    for _style, (name, fname) in FAMILY.items():
        pdfmetrics.registerFont(TTFont(name, str(FONTS / fname)))
    # Sin esto, reportlab referencia Helvetica en cada página aunque no se
    # use, y KDP marca esa fuente como no incrustada.
    rl_config.canvas_basefontname = FAMILY["R"][1]
    rl_config.canvas_basefontname = "Eco"

    global _SAFE_CODEPOINTS, _FALLBACK_CODEPOINTS, _CJK_FALLBACK_AVAILABLE
    from fontTools.ttLib import TTFont as _FTFont
    cmaps = [_FTFont(str(FONTS / fname)).getBestCmap().keys() for _style, (_name, fname) in FAMILY.items()]
    _SAFE_CODEPOINTS = set.intersection(*(set(c) for c in cmaps))

    for path in FALLBACK_CANDIDATES:
        if Path(path).exists():
            pdfmetrics.registerFont(TTFont(FALLBACK_FONT, path))
            _FALLBACK_CODEPOINTS = set(_FTFont(path).getBestCmap().keys())
            break
    else:
        print("warning: no fallback Unicode font found; symbols missing from "
              "Source Serif Pro (math notation, some diacritics) may render "
              "blank.", file=sys.stderr)

    for path in CJK_FALLBACK_CANDIDATES:
        if Path(path).exists():
            pdfmetrics.registerFont(TTFont(CJK_FALLBACK_FONT, path))
            _CJK_FALLBACK_AVAILABLE = True
            break


R, IT, SB, SBIT, BD = "Eco", "Eco-It", "Eco-Sb", "Eco-SbIt", "Eco-Bd"

# ------------------------------------------------------------------- paleta
INK = colors.HexColor("#22282c")
AMBER = colors.HexColor("#9a6b1e")
GOLD = colors.HexColor("#c9a227")
SAND = colors.HexColor("#c9c2b2")
GREY = colors.HexColor("#55504a")

# ---------------------------------------------------------------- geometria
PW, PH = 6 * inch, 9 * inch
# KDP exige 0.875" de medianil para 701-828 paginas, pero su comprobador
# automatico rechaza texto que llega exactamente a ese minimo (lo mide
# sobre el PDF rasterizado y no da margen de tolerancia) -- de ahi el
# colchon extra sobre el minimo publicado.
M_GUTTER = 0.95 * inch
M_OUTER = 0.625 * inch
M_TOP = 0.68 * inch
M_BOTTOM = 0.72 * inch
TEXT_W = PW - M_GUTTER - M_OUTER
TEXT_H = PH - M_TOP - M_BOTTOM

BOOK_TITLE = "EL HORIZONTE INTERIOR"


# ------------------------------------------------------------- utilidades
def fit_small_caps(text: str, font: str, size: float, spacing: float,
                    avail_w: float) -> tuple[float, float]:
    """Encoge interletrado y luego tamaño hasta que TEXT quepa en avail_w --
    algunos títulos de capítulo son demasiado largos para la cabecera
    corrida a su tamaño nominal y se saldrían del medianil."""
    text = text.upper()
    orig_size = size
    for _ in range(40):
        w = pdfmetrics.stringWidth(text, font, size) + spacing * max(0, len(text) - 1)
        if w <= avail_w or (spacing <= 0.2 and size <= orig_size * 0.6):
            break
        if spacing > 0.2:
            spacing -= 0.2
        else:
            size -= 0.4
    return size, spacing


def draw_small_caps(cv, x: float, y: float, text: str, font: str, size: float, color,
                     spacing: float = 1.6, align: str = "left", avail: float = 0.0) -> None:
    text = text.upper()
    w = pdfmetrics.stringWidth(text, font, size) + spacing * max(0, len(text) - 1)
    if align == "center":
        x = (avail - w) / 2
    elif align == "right":
        x = avail - w
    cv.saveState()
    cv.setFillColor(color)
    to = cv.beginText(x, y)
    to.setFont(font, size)
    to.setCharSpace(spacing)
    to.textOut(text)
    cv.drawText(to)
    cv.restoreState()


class SmallCapsFlowable(Flowable):
    """Un rótulo en versalitas fingidas (mayúsculas con letra separada),
    como los kickers de sección de la edición de poesía."""

    def __init__(self, text: str, font: str, size: float, color, spacing: float = 1.8,
                 align: str = "left", space_after: float = 4.0):
        super().__init__()
        self.text, self.font, self.size, self.color = text, font, size, color
        self.spacing, self.align, self.space_after = spacing, align, space_after

    def wrap(self, aw, ah):
        self._avail = aw
        # Shrink letter-spacing, then font size, until the label fits the
        # frame width -- titles/labels vary in length and this runs at
        # whatever width the recto/verso frame gives it.
        self._fit_size, self._fit_spacing = fit_small_caps(
            self.text, self.font, self.size, self.spacing, aw)
        return (aw, self.size * 1.25 + self.space_after)

    def draw(self):
        draw_small_caps(self.canv, 0, self.space_after, self.text, self.font, self._fit_size,
                         self.color, spacing=self._fit_spacing, align=self.align, avail=self._avail)

    def isIndexing(self):
        return 0


class WaveDivider(Flowable):
    """La onda a mano alzada que separa bloques, igual que en la poesía."""

    def __init__(self, width: float = 46, color=GOLD, height: float = 6.0,
                 space_before: float = 4.0, space_after: float = 4.0):
        super().__init__()
        self.width, self.color, self.height = width, color, height
        self.space_before, self.space_after = space_before, space_after

    def wrap(self, aw, ah):
        self._avail = aw
        return (aw, self.height * 2 + self.space_before + self.space_after)

    def draw(self):
        cv = self.canv
        cx, cy = self._avail / 2, self.space_after + self.height
        cv.saveState()
        cv.setStrokeColor(self.color)
        cv.setLineWidth(1.0)
        p = cv.beginPath()
        x0 = cx - self.width / 2
        seg = self.width / 3
        p.moveTo(x0, cy)
        for i in range(3):
            x1 = x0 + seg * i + seg * 0.5
            y1 = cy + (self.height if i % 2 == 0 else -self.height)
            p.curveTo(x1, y1, x1, y1, x0 + seg * (i + 1), cy)
        cv.drawPath(p, stroke=1, fill=0)
        cv.restoreState()

    def isIndexing(self):
        return 0


class ForceParity(Flowable):
    """Fuerza los saltos de página que hagan falta (cero, uno o dos) para
    que lo siguiente empiece en una página nueva de la paridad pedida
    (1 = impar/recto, 0 = par/verso). No dibuja nada.

    El truco: si `wrap` devuelve una altura mayor que el hueco disponible,
    Platypus salta de página y vuelve a preguntar con el marco ya limpio;
    como la paridad se alterna en cada salto, basta con seguir pidiendo
    "no cabe" hasta que la página en curso sea, a la vez, nueva del todo
    (alto disponible == alto del marco) y de la paridad correcta."""

    def __init__(self, target_parity: int, frame_h: float):
        super().__init__()
        self.target_parity = target_parity
        self.frame_h = frame_h

    def wrap(self, aw, ah):
        page = self.canv.getPageNumber()
        fresh = ah >= self.frame_h - 1
        if not fresh:
            # Not at the top of an empty frame yet: leave this page, however
            # much room is left on it.
            return (aw, ah + 1)
        if page % 2 != self.target_parity:
            # Already at a fresh, empty page, but the wrong parity: claiming
            # anything *larger* than an empty frame is a hard LayoutError in
            # reportlab (it assumes the flowable can never fit), so instead
            # we consume this whole blank page ourselves and let the next
            # flowable land on the following one, which has the parity we
            # were after.
            return (aw, ah)
        return (0, 0)

    def draw(self):
        pass

    def isIndexing(self):
        return 0


class FullFramePlate(Flowable):
    """Como ForceParity, pero además llena el marco entero con la
    ilustración (reescalada/recomprimida por generate_book_pdf.
    make_image_flowable, igual que las ilustraciones en línea del cuerpo),
    de modo que nada más comparte esa página."""

    def __init__(self, image_bytes: bytes, target_parity: int, frame_w: float, frame_h: float):
        super().__init__()
        self.image_bytes = image_bytes
        self.target_parity = target_parity
        self.frame_w, self.frame_h = frame_w, frame_h
        self._inner = None
        self._is_filler = False

    def wrap(self, aw, ah):
        page = self.canv.getPageNumber()
        fresh = ah >= self.frame_h - 1
        if not fresh:
            return (aw, ah + 1)
        if page % 2 != self.target_parity:
            # See ForceParity.wrap(): consume this blank page ourselves
            # rather than claiming an impossible height.
            self._is_filler = True
            return (aw, ah)
        self._is_filler = False
        self._w, self._h = aw, ah
        self._inner = gbp.make_image_flowable(self.image_bytes, aw, ah)
        return (aw, ah)

    def draw(self):
        if self._is_filler or not self._inner:
            return
        x = (self._w - self._inner.drawWidth) / 2
        y = (self._h - self._inner.drawHeight) / 2
        self._inner.drawOn(self.canv, x, y)

    def isIndexing(self):
        return 0


class ChapterMarker(Flowable):
    """Invisible: solo dispara el registro de marcador/TOC/cabecera corrida
    cuando el motor la dibuja, con la página real ya conocida."""

    def __init__(self, title: str, section: Optional[str], toc_text: str):
        super().__init__()
        self.title, self.section, self.toc_text = title, section, toc_text

    def wrap(self, aw, ah):
        # La lámina y el ForceParity de página equivocada consumen el marco
        # entero; sin este salto el marcador caería en esa página y el índice
        # apuntaría una antes del título.
        if ah < 1:
            return (aw, ah + 1)
        return (0, 0)

    def draw(self):
        pass

    def isIndexing(self):
        return 0


class SetFolio(Flowable):
    def __init__(self, value: bool):
        super().__init__()
        self.value = value

    def wrap(self, aw, ah):
        return (0, 0)

    def draw(self):
        pass

    def isIndexing(self):
        return 0


# ------------------------------------------------------------------ estilos
def build_styles() -> dict:
    styles = {
        "Body": ParagraphStyle(
            "Body", fontName=R, fontSize=11.0, leading=16.4, alignment=4,
            spaceAfter=8, textColor=INK,
        ),
        "Quote": ParagraphStyle(
            "Quote", fontName=IT, fontSize=10.4, leading=15.0, leftIndent=20,
            spaceBefore=8, spaceAfter=10, textColor=GREY,
        ),
        "H2": ParagraphStyle(
            "H2", fontName=BD, fontSize=13.5, leading=17, spaceBefore=14,
            spaceAfter=7, textColor=INK,
        ),
        "H3": ParagraphStyle(
            "H3", fontName=BD, fontSize=11.6, leading=15, spaceBefore=10,
            spaceAfter=5, textColor=INK,
        ),
        "Caption": ParagraphStyle(
            "Caption", fontName=IT, fontSize=8.6, leading=11.4, alignment=1,
            textColor=AMBER, spaceAfter=10,
        ),
        "ChapterTitle": ParagraphStyle(
            "ChapterTitle", fontName=BD, fontSize=21, leading=25, textColor=INK,
            spaceAfter=4,
        ),
        "ChapterSubtitle": ParagraphStyle(
            "ChapterSubtitle", fontName=IT, fontSize=11.2, leading=15,
            textColor=GREY, spaceAfter=4,
        ),
    }
    return styles


# rightIndent reserves room for the page number (+ dot leader) within the
# Paragraph's own wrap width. TableOfContents draws the number/dots via an
# onDraw callback positioned from the frame's right edge, independent of
# the Paragraph's wrapping -- without a matching rightIndent here, a title
# just long enough to fill the line leaves the number jammed against the
# last word with no dots and no gap. Keep this in sync with the
# rightColumnWidth passed to TableOfContents() below.
TOC_RIGHT_COLUMN = 36

TOC_LEVEL0 = ParagraphStyle("TOCPart", fontName=BD, fontSize=9.2, leading=13,
                             textColor=AMBER, spaceBefore=12, spaceAfter=3,
                             rightIndent=TOC_RIGHT_COLUMN)
TOC_LEVEL1 = ParagraphStyle("TOCChapter", fontName=R, fontSize=10.2, leading=15.4,
                             textColor=INK, leftIndent=14, rightIndent=TOC_RIGHT_COLUMN)


# ------------------------------------------------------------ doc template
class PremiumDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str, **kwargs):
        super().__init__(filename, **kwargs)
        recto_frame = Frame(M_GUTTER, M_BOTTOM, TEXT_W, TEXT_H, id="recto",
                             leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        verso_frame = Frame(M_OUTER, M_BOTTOM, TEXT_W, TEXT_H, id="verso",
                             leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="recto", frames=[recto_frame], onPageEnd=self._furniture),
            PageTemplate(id="verso", frames=[verso_frame], onPageEnd=self._furniture),
        ])
        self._show_folio = False
        self._chapter_opened_this_page = False
        self._current_chapter_title = ""
        self._last_section = None

    def beforeDocument(self):
        # multiBuild() re-runs build() several times on this SAME doc
        # instance (once per TOC-stabilization pass), each restarting the
        # page counter at 1 -- so this running-header/folio state has to be
        # reset here too, or a later pass starts already "inside" whatever
        # chapter/section the previous pass ended on.
        self._show_folio = False
        self._chapter_opened_this_page = False
        self._current_chapter_title = ""
        self._last_section = None

    def handle_pageBegin(self):
        next_id = "recto" if self.page % 2 == 1 else "verso"
        self.handle_nextPageTemplate(next_id)
        super().handle_pageBegin()
        self._chapter_opened_this_page = False
        self._page_has_content = False

    def afterFlowable(self, flowable):
        if isinstance(flowable, (ForceParity, ActionFlowable)):
            # ActionFlowable covers reportlab's own internal per-page marker
            # (LCActionFlowable's PageBegin singleton, notably) -- it isn't
            # real content and would otherwise make every blank filler page
            # look "occupied" and wrongly grow a folio.
            return
        if isinstance(flowable, FullFramePlate):
            if not flowable._is_filler:
                self._page_has_content = True
                # La lámina lleva folio pero no cabecera corrida.
                self._chapter_opened_this_page = True
            return
        if isinstance(flowable, SetFolio):
            self._show_folio = flowable.value
            return
        self._page_has_content = True
        if isinstance(flowable, ChapterMarker):
            self._chapter_opened_this_page = True
            self._current_chapter_title = flowable.title
            key = f"ch-{id(flowable)}"
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(flowable.title, key, level=0, closed=True)
            if flowable.section and flowable.section != self._last_section:
                self._last_section = flowable.section
                self.notify("TOCEntry", (0, gbp.escape_xml(flowable.section), self.page))
            self.notify("TOCEntry", (1, gbp.escape_xml(flowable.toc_text), self.page))

    def _furniture(self, canvas, doc):
        if not self._show_folio or not self._page_has_content:
            return
        canvas.saveState()
        page = doc.page
        recto = page % 2 == 1
        x0 = M_GUTTER if recto else M_OUTER
        x1 = PW - (M_OUTER if recto else M_GUTTER)
        y_head = PH - M_TOP + 20
        if not self._chapter_opened_this_page and self._current_chapter_title:
            if recto:
                # Los títulos de capítulo largos, a tamaño nominal, no caben
                # en el ancho de la cabecera y se saldrían por el medianil.
                fit_size, fit_spacing = fit_small_caps(
                    self._current_chapter_title, IT, 7.6, 1.1, x1 - x0)
                draw_small_caps(canvas, x1, y_head, self._current_chapter_title, IT, fit_size,
                                 AMBER, align="right", spacing=fit_spacing, avail=x1)
            else:
                draw_small_caps(canvas, x0, y_head, BOOK_TITLE, IT, 7.6, AMBER,
                                 align="left", spacing=1.1)
        canvas.setFont(R, 8.6)
        canvas.setFillColor(INK)
        canvas.drawCentredString(PW / 2, M_BOTTOM - 26, str(page))
        canvas.restoreState()


# --------------------------------------------------------------- paginas fijas
def half_title(story: list) -> None:
    story.append(ForceParity(1, TEXT_H))
    story.append(Spacer(1, TEXT_H * 0.42))
    story.append(SmallCapsFlowable(BOOK_TITLE, R, 17, INK, spacing=5.2, align="center"))
    story.append(WaveDivider(46, GOLD, space_before=10))


def title_page(story: list, toc: dict) -> None:
    story.append(ForceParity(1, TEXT_H))
    story.append(Spacer(1, TEXT_H * 0.30))
    story.append(SmallCapsFlowable(toc.get("title", BOOK_TITLE), R, 23, INK, spacing=6.5,
                                    align="center", space_after=10))
    story.append(Paragraph(
        f'<para alignment="center"><i>{gbp.escape_xml(toc.get("subtitle", ""))}</i></para>',
        ParagraphStyle("Sub", fontName=IT, fontSize=12.5, leading=17, textColor=AMBER)))
    story.append(WaveDivider(54, GOLD, space_before=18, space_after=18))
    story.append(Spacer(1, TEXT_H * 0.24))
    story.append(SmallCapsFlowable(toc.get("author", ""), R, 11, INK, spacing=2.6,
                                    align="center"))


def credits_page(story: list, toc: dict, sin_ilustraciones: bool = False) -> None:
    story.append(ForceParity(0, TEXT_H))
    story.append(Spacer(1, TEXT_H * 0.5))
    lines = [
        (toc.get("title", BOOK_TITLE), IT),
        (toc.get("subtitle", ""), R),
        ("© " + toc.get("author", "") + ". Todos los derechos reservados.", R),
        ("Los capítulos de ensayo proceden de la obra completa El Horizonte Interior "
         "y se reproducen aquí en su orden de lectura, junto con las lecturas "
         "topológicas y el aparato final.", R),
        (None if sin_ilustraciones else "Las ilustraciones proceden de la edición ilustrada de la misma obra.", R),
        ("Compuesto en Source Serif Pro.", R),
    ]
    for text, font in lines:
        if not text:
            continue
        story.append(Paragraph(gbp.escape_xml(text),
                                ParagraphStyle("Credit", fontName=font, fontSize=8.8,
                                               leading=12.6, textColor=INK, spaceAfter=8)))


def dedication_page(story: list) -> None:
    story.append(ForceParity(1, TEXT_H))
    story.append(Spacer(1, TEXT_H * 0.42))
    story.append(Paragraph(
        '<para alignment="center"><i>A quien se quedó en la orilla<br/>'
        'cuando el agua se retiró.</i></para>',
        ParagraphStyle("Dedic", fontName=IT, fontSize=11.6, leading=18, textColor=INK)))


def toc_page(story: list) -> None:
    story.append(SetFolio(False))
    story.append(ForceParity(1, TEXT_H))
    story.append(SmallCapsFlowable("Índice", R, 15, INK, spacing=4.0, space_after=16))
    toc = TableOfContents()
    toc.levelStyles = [TOC_LEVEL0, TOC_LEVEL1]
    toc.dotsMinLevel = 1
    toc.rightColumnWidth = TOC_RIGHT_COLUMN
    story.append(toc)


def colophon_page(story: list) -> None:
    story.append(SetFolio(False))
    story.append(ForceParity(0, TEXT_H))
    story.append(Spacer(1, TEXT_H * 0.4))
    story.append(WaveDivider(46, GOLD, space_after=14))
    story.append(Paragraph(
        '<para alignment="center"><i>Se acabó de componer este volumen<br/>'
        'sin haber demostrado nada,<br/>'
        'tal como estaba previsto desde la primera página.</i></para>',
        ParagraphStyle("Colo", fontName=IT, fontSize=10.4, leading=16, textColor=INK)))


# --------------------------------------------------------------------- build
def chapter_label(chapter_number: Optional[str]) -> Optional[str]:
    if chapter_number and str(chapter_number).strip().isdigit():
        return f"Capítulo {chapter_number.strip()}"
    return None


def _wrap_missing_glyphs_plain(text: str) -> str:
    """Wrap any run of characters absent from every Source Serif Pro weight
    -- math notation (⋃ ⊆ → ∅ ∈), Greek letters used outside Φ (α), sub/
    superscripts (ᵢ ₀), Sanskrit diacritics (ṣ) -- in a span set in the
    fallback Unicode font, so it renders instead of a blank .notdef box.
    Left untouched (and hence still in Source Serif Pro) is everything the
    font actually covers, which is nearly all running prose. Assumes
    `text` is plain (no XML tags in it yet) -- see _wrap_missing_glyphs_
    tagged for text that already has reportlab mini-markup in it."""
    if not _SAFE_CODEPOINTS:
        return text

    def font_for(ch: str) -> Optional[str]:
        if ch.isspace() or ord(ch) in _SAFE_CODEPOINTS:
            return None
        if ord(ch) in _FALLBACK_CODEPOINTS:
            return FALLBACK_FONT
        if _CJK_FALLBACK_AVAILABLE:
            return CJK_FALLBACK_FONT
        return FALLBACK_FONT

    out, buf = [], []
    current = None
    for ch in text:
        font = font_for(ch)
        if buf and font != current:
            out.append(("".join(buf), current))
            buf = []
        buf.append(ch)
        current = font
    if buf:
        out.append(("".join(buf), current))
    return "".join(
        f'<font name="{font}">{chunk}</font>' if font else chunk
        for chunk, font in out
    )


_TAG_RE = re.compile(r"(<[^>]+>)")


def _wrap_missing_glyphs_tagged(markup: str) -> str:
    """Same fallback-font wrapping, but for a string that may already
    contain reportlab mini-markup (<b>/<i> from inline_markdown_to_markup's
    own **/* conversion). Only touches the plain-text pieces between
    existing tags, so every <font> span it inserts nests cleanly inside
    whatever <b>/<i> span it falls in -- never straddles one."""
    parts = _TAG_RE.split(markup)
    return "".join(part if part.startswith("<") else _wrap_missing_glyphs_plain(part) for part in parts)


def _patch_glyph_fallback() -> None:
    """Two choke points cover every place text turns into reportlab markup
    in this book: generate_book_pdf.escape_xml (this script's own direct
    calls, for titles/kickers that never contain **/* emphasis) and
    generate_book_pdf.inline_markdown_to_markup (everything routed through
    markdown_to_flowables/build_table, which DOES apply **/* -> <b>/<i>
    after escaping).

    inline_markdown_to_markup's own body calls escape_xml by looking up
    that name in this module's globals *at call time* -- so simply patching
    gbp.escape_xml would make the original inline_markdown_to_markup pick
    up the patched version too, feed its own bold/italic regex a string
    that already has <font> tags in it, and corrupt the nesting. Capturing
    a direct reference to the pre-patch escape_xml and reimplementing
    inline_markdown_to_markup's two-line **/* conversion here (rather than
    calling through the mutable module global) avoids that entirely."""
    orig_escape_xml = gbp.escape_xml

    def escape_xml_with_fallback(text: str) -> str:
        return _wrap_missing_glyphs_plain(orig_escape_xml(text))

    def inline_with_fallback(text: str) -> str:
        # Keep in sync with generate_book_pdf.inline_markdown_to_markup --
        # duplicated rather than called through the module global, per the
        # docstring above.
        markup = orig_escape_xml(text)
        markup = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", markup)
        markup = re.sub(r"\*(.+?)\*", r"<i>\1</i>", markup)
        markup = re.sub(r"`([^`]+?)`", r"<i>\1</i>", markup)
        # Inline LaTeX math (\(E_t\), \(R = X \setminus \bigcup_i E_i\), ...)
        # in the topological-reading chapters -- render before the glyph
        # fallback pass so any math symbol Source Serif Pro lacks still
        # gets wrapped in the fallback font instead of printing a blank box.
        markup = gbp.render_math_spans(markup)
        return _wrap_missing_glyphs_tagged(markup)

    gbp.escape_xml = escape_xml_with_fallback
    gbp.inline_markdown_to_markup = inline_with_fallback


def build_pdf(toc_path: Path, output_path: Path, ca_bundle: Optional[str] = None,
              sin_ilustraciones: bool = False) -> None:
    register_fonts()
    _patch_glyph_fallback()
    with toc_path.open("r", encoding="utf-8") as fh:
        toc = json.load(fh)
    base_dir = toc_path.parent
    # Sin ilustraciones: ni láminas de capítulo ni ilustraciones en línea
    # (un diccionario vacío hace que markdown_to_flowables salte los marcadores).
    illustrations = {} if sin_ilustraciones else toc.get("illustrations", {})
    styles = build_styles()

    doc = PremiumDocTemplate(str(output_path), pagesize=(PW, PH),
                              title=toc.get("title", ""), author=toc.get("author", ""))

    story: list = []
    half_title(story)
    title_page(story, toc)
    credits_page(story, toc, sin_ilustraciones)
    dedication_page(story)
    toc_page(story)
    story.append(SetFolio(True))

    for chapter in toc["chapters"]:
        content_file = gbp.resolve_path(base_dir, chapter["content_file"])
        raw_text = content_file.read_text(encoding="utf-8")
        frontmatter, body = gbp.parse_frontmatter(raw_text)
        # Una raya "---" al final del capítulo no separa nada y, si cae justo
        # al pie, desborda sola a una página que sale en blanco con cabecera.
        body = re.sub(r"(?:\s*^---\s*)+\Z", "\n", body, flags=re.MULTILINE)

        title = chapter.get("title") or frontmatter.get("title") or chapter["id"]
        subtitle = chapter.get("subtitle") or frontmatter.get("subtitle")
        section = chapter.get("section") or frontmatter.get("section")
        chapter_number = frontmatter.get("chapterNumber")
        illustration_ref = chapter.get("illustration") or frontmatter.get("illustrationId")

        illustration_bytes = None
        if illustration_ref and not sin_ilustraciones:
            image_source = illustrations.get(illustration_ref, illustration_ref)
            illustration_bytes = gbp.load_image_bytes(image_source, base_dir, ca_bundle)

        if illustration_bytes:
            story.append(ForceParity(0, TEXT_H))
            story.append(FullFramePlate(illustration_bytes, 0, TEXT_W, TEXT_H))
        story.append(ForceParity(1, TEXT_H))

        if str(chapter_number).strip().isdigit():
            toc_text = f"{chapter_number.strip()}. {title}"
        else:
            toc_text = title
        story.append(ChapterMarker(title=title, section=section, toc_text=toc_text))

        story.append(Spacer(1, 2))
        if section:
            story.append(SmallCapsFlowable(section, IT, 8.6, AMBER, spacing=1.5, space_after=10))
        label = chapter_label(chapter_number)
        if label:
            story.append(SmallCapsFlowable(label, R, 8.6, AMBER, spacing=2.6, space_after=8))
        story.append(Paragraph(gbp.escape_xml(title), styles["ChapterTitle"]))
        if subtitle:
            story.append(Paragraph(gbp.escape_xml(subtitle), styles["ChapterSubtitle"]))
        story.append(HRFlowable(width=42, thickness=0.9, color=GOLD, hAlign="LEFT",
                                 spaceBefore=6, spaceAfter=16))
        flowables = gbp.markdown_to_flowables(body, styles, illustrations, base_dir,
                                              TEXT_W, ca_bundle)
        # Nada de espacio al final del capítulo: si cae al pie, desborda solo
        # a la página siguiente y deja páginas vacías de más.
        while flowables and isinstance(flowables[-1], Spacer):
            flowables.pop()
        story.extend(flowables)

    colophon_page(story)

    doc.multiBuild(story)
    print(f"Wrote {output_path}  —  {doc.page} páginas, 6 x 9 pulgadas")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("toc", type=Path, help="Ruta al toc_ensayo.json")
    parser.add_argument("-o", "--output", type=Path, required=True)
    parser.add_argument("--ca-bundle", type=str, default=None)
    parser.add_argument("--sin-ilustraciones", action="store_true",
                        help="Sin láminas ni ilustraciones en línea: tapa blanda en papel B/N.")
    args = parser.parse_args()
    build_pdf(args.toc, args.output, args.ca_bundle, args.sin_ilustraciones)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
