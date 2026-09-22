#!/usr/bin/env python3
"""
Generate hardcover PDF (Catalan or English) from markdown source.
Uses reportlab with KDP bleed specifications (5 x 8", with 0.125" bleed).

Improvements over the original per-language script:
- Auto-detects language from YAML frontmatter (lang: ca|en)
- No duplicate title page (previously the parsed H1 block re-rendered
  the title page a second time)
- Every movement (##) gets a proper opener page with wave ornament,
  and appears in the table of contents (previously only the book H1 did)
- Full-bleed illustration plates inserted before each movement that has
  one, from edicion_tapadura/laminas/
- Verse poems (short italic lines with no blank line between them) are
  no longer merged into a single run-on paragraph; each line renders as
  its own centered, tightly-leaded line
"""

import re
import os
import sys
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                 NextPageTemplate, PageBreak, Flowable, KeepTogether, Image)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LAMINAS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "laminas")

# ========== FONTS ==========

def setup_fonts():
    lora_paths = [
        "/home/claude/fonts/",
        "/home/user/EHI/edicion_ensayo/fonts/",
        "/usr/share/fonts/truetype/lora/",
    ]
    lora_found = False
    for font_dir in lora_paths:
        if os.path.exists(font_dir):
            regular = os.path.join(font_dir, "Lora-Regular.ttf")
            bold = os.path.join(font_dir, "Lora-Bold.ttf")
            italic = os.path.join(font_dir, "Lora-Italic.ttf")
            bolditalic = os.path.join(font_dir, "Lora-BoldItalic.ttf")
            if all(os.path.exists(f) for f in [regular, bold, italic, bolditalic]):
                try:
                    pdfmetrics.registerFont(TTFont("Lora", regular))
                    pdfmetrics.registerFont(TTFont("Lora-Bold", bold))
                    pdfmetrics.registerFont(TTFont("Lora-Italic", italic))
                    pdfmetrics.registerFont(TTFont("Lora-BoldItalic", bolditalic))
                    pdfmetrics.registerFontFamily("Lora", normal="Lora", bold="Lora-Bold",
                                                   italic="Lora-Italic", boldItalic="Lora-BoldItalic")
                    lora_found = True
                    print(f"Registered Lora fonts from {font_dir}")
                    break
                except Exception as e:
                    print(f"Error registering fonts from {font_dir}: {e}")
    if not lora_found:
        print("Lora fonts not found, using SourceSerifPro fallback")
        serif_dir = "/home/user/EHI/edicion_ensayo/fonts/"
        if os.path.exists(serif_dir):
            try:
                pdfmetrics.registerFont(TTFont("Lora", os.path.join(serif_dir, "SourceSerifPro-Regular.ttf")))
                pdfmetrics.registerFont(TTFont("Lora-Bold", os.path.join(serif_dir, "SourceSerifPro-Bold.ttf")))
                pdfmetrics.registerFont(TTFont("Lora-Italic", os.path.join(serif_dir, "SourceSerifPro-It.ttf")))
                pdfmetrics.registerFont(TTFont("Lora-BoldItalic", os.path.join(serif_dir, "SourceSerifPro-SemiboldIt.ttf")))
                pdfmetrics.registerFontFamily("Lora", normal="Lora", bold="Lora-Bold",
                                               italic="Lora-Italic", boldItalic="Lora-BoldItalic")
                print("Registered SourceSerifPro fonts as fallback")
            except Exception as e:
                print(f"Error registering fallback fonts: {e}")

pdfmetrics.registerFont(TTFont("GreekFallback", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"))
_GREEK_FIX_CHARS = ["Φ", "φ", "Δ", "δ", "Σ", "σ", "Ω", "ω", "π", "Π", "λ", "Λ", "θ", "Θ", "α", "β", "γ", "Γ"]

def fix_greek_glyphs(text):
    for ch in _GREEK_FIX_CHARS:
        if ch in text:
            text = text.replace(ch, f'<font name="GreekFallback">{ch}</font>')
    return text

# ========== COLOR PALETTE ==========

INK = colors.HexColor("#22282c")
TEAL = colors.HexColor("#3c6e71")
CREAM = colors.HexColor("#faf8f3")

# ========== PAGE GEOMETRY (KDP bleed: trim 6x9 + 0.125" outer/top/bottom) ==========
#
# Margins follow Amazon KDP's official print specifications for a book
# with bleed:
#  - Top and bottom margins: KDP's stated minimum is 0.25"; this layout
#    uses 0.75" (comfortably above the minimum, and enough to leave room
#    for the running header and folio).
#  - Inside (gutter) margin: KDP requires this to scale with page count,
#    since a thicker book "eats" more space into the fold. The exact
#    breakpoints (in inches) are:
#        24-150 pages   -> 0.375"
#        151-300 pages  -> 0.5"
#        301-500 pages  -> 0.625"
#        501-700 pages  -> 0.75"
#        701-828 pages  -> 0.875"
#    Because the gutter is only known once the page count is known, and
#    the page count depends on the gutter, main() below does a first
#    pass with an initial guess, measures the resulting page count, and
#    rebuilds once more if that count calls for a different gutter
#    bracket (see set_gutter() / kdp_gutter_inches()).
#  - Outer margin: this layout does NOT alternate the text frame's
#    position between recto/verso pages (Platypus flows body text through
#    a single fixed frame, and reliably mirroring it per page parity
#    needs overriding private BaseDocTemplate internals, too fragile to
#    rely on here). Using a smaller outer margin than the gutter would
#    therefore make the side facing the spine fall under KDP's minimum on
#    every other page. Instead the outer margin is simply set equal to
#    the gutter, so both sides of every page meet or exceed the required
#    minimum regardless of which one ends up facing the spine.

BLEED = 0.125 * inch
TRIM_W, TRIM_H = 6 * inch, 9 * inch
PW, PH = TRIM_W + BLEED, TRIM_H + 2 * BLEED
TRIM_Y0 = BLEED
MARGIN_TOP = 0.75 * inch
MARGIN_BOTTOM = 0.75 * inch
TEXT_H = TRIM_H - MARGIN_TOP - MARGIN_BOTTOM

MARGIN_GUTTER = MARGIN_OUTER = 0.375 * inch  # placeholder; set_gutter() below fixes this
TEXT_W = FRAME_X = FRAME_Y = HEADER_Y = FOLIO_Y = None  # set by set_gutter()


def kdp_gutter_inches(pages):
    """Official KDP inside-margin (gutter) requirement for a bled book."""
    if pages <= 150:
        return 0.375
    elif pages <= 300:
        return 0.5
    elif pages <= 500:
        return 0.625
    elif pages <= 700:
        return 0.75
    else:
        return 0.875


def set_gutter(gutter_in):
    """(Re)computes every geometry value that depends on the gutter width,
    and rebuilds the Frames/PageTemplates that use them.

    The text frame is NOT mirrored between recto/verso pages (see the note
    above on why), so whichever physical side a given page's spine falls
    on, that side must independently satisfy the KDP gutter minimum. Both
    physical margins are therefore inset by BLEED + MARGIN_GUTTER from
    their respective page edges - i.e. as if either side could be facing
    the spine and could also carry a bleed zone eating into it. This is
    what actually keeps >=MARGIN_GUTTER of true margin beyond the trim
    edge on BOTH sides, on every page, regardless of orientation.

    (An earlier version added the BLEED inset only on the left, which left
    the right margin MARGIN_GUTTER from the physical edge but only
    MARGIN_GUTTER-BLEED from the equivalent trim edge - under KDP's
    minimum whenever that side ended up facing the spine on an unmirrored
    verso page, which is exactly the "insufficient gutter" KDP flagged.)"""
    global MARGIN_GUTTER, MARGIN_OUTER, TEXT_W, FRAME_X, FRAME_Y, HEADER_Y, FOLIO_Y
    global frame_body, frame_opener, frame_front, frame_image
    MARGIN_GUTTER = MARGIN_OUTER = gutter_in * inch
    inset = BLEED + MARGIN_GUTTER
    TEXT_W = PW - 2 * inset
    FRAME_X = inset
    FRAME_Y = TRIM_Y0 + MARGIN_BOTTOM
    HEADER_Y = TRIM_Y0 + TRIM_H - MARGIN_TOP + 20
    FOLIO_Y = TRIM_Y0 + MARGIN_BOTTOM - 22

    frame_body = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id="body",
                        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    frame_opener = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H - 0.5 * inch, id="opener",
                          leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    frame_front = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id="front",
                         leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    frame_image = Frame(0, 0, PW, PH, id="imagepage",
                         leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

# ========== STYLES ==========

styleN = ParagraphStyle("body", fontName="Lora", fontSize=11.5, leading=17,
                         alignment=TA_JUSTIFY, textColor=INK, spaceAfter=8.5)
styleH1 = ParagraphStyle("h1", fontName="Lora-Bold", fontSize=21, leading=25,
                          textColor=INK, spaceAfter=16, alignment=TA_LEFT)
styleH2 = ParagraphStyle("h2", fontName="Lora-BoldItalic", fontSize=13.5, leading=17,
                          textColor=TEAL, spaceBefore=10, spaceAfter=8, alignment=TA_LEFT)
styleH3 = ParagraphStyle("h3", fontName="Lora-Bold", fontSize=12, leading=16.5,
                          textColor=INK, spaceBefore=8, spaceAfter=6, alignment=TA_LEFT)
stylePoem = ParagraphStyle("poem", fontName="Lora-Italic", fontSize=11.5, leading=16,
                            alignment=TA_CENTER, textColor=INK, spaceAfter=2)
styleTitleMain = ParagraphStyle("titlemain", fontName="Lora-Bold", fontSize=26, leading=30,
                                 alignment=TA_CENTER, textColor=INK)
styleTitleSub = ParagraphStyle("titlesub", fontName="Lora-Italic", fontSize=11.5, leading=16,
                                alignment=TA_CENTER, textColor=TEAL)
styleTitleAuthor = ParagraphStyle("titleauthor", fontName="Lora", fontSize=13, leading=18,
                                   alignment=TA_CENTER, textColor=INK)
styleDedication = ParagraphStyle("dedication", fontName="Lora-Italic", fontSize=11.5, leading=18,
                                  alignment=TA_CENTER, textColor=INK)
styleTOCHeading = ParagraphStyle("tocHeading", fontName="Lora-Bold", fontSize=18, leading=22,
                                  alignment=TA_CENTER, textColor=INK, spaceAfter=14)
styleTOCEntry = ParagraphStyle("tocEntry", fontName="Lora", fontSize=10, leading=17.5, textColor=INK)

# ========== ORNAMENTS ==========

def draw_wave(cv, cx, cy, width, color=TEAL, height=7):
    cv.saveState()
    cv.setStrokeColor(color)
    cv.setLineWidth(1.1)
    p = cv.beginPath()
    x0 = cx - width / 2
    p.moveTo(x0, cy)
    n = 3
    seg = width / n
    for i in range(n):
        x1 = x0 + seg * i + seg * 0.5
        y1 = cy + (height if i % 2 == 0 else -height)
        x2 = x0 + seg * (i + 1)
        y2 = cy
        p.curveTo(x1, y1, x1, y1, x2, y2)
    cv.drawPath(p, stroke=1, fill=0)
    cv.restoreState()

# ========== MOVEMENT -> ILLUSTRATION MAPPING ==========

ROMAN_TO_IMAGE = {
    "I": "cap1.jpg", "II": "cap2.jpg", "III": "cap3.jpg",
    "IV": "cap4.jpg", "V": "cap5.jpg", "VI": "cap6.jpg",
    "VII": "espejo.jpg", "VIII": "diapason.jpg", "IX": "ojo.jpg", "X": "fractal.jpg",
}
_ROMAN_RE = re.compile(r'^(X|IX|VIII|VII|VI|V|IV|III|II|I)\s*[—-]')

def get_movement_image(title):
    t = title.strip()
    tu = t.upper()
    if tu.startswith("OBERTURA") or tu.startswith("OVERTURE"):
        fname = "obertura.jpg"
    elif tu.startswith("INTERLUDI") or tu.startswith("INTERLUDE"):
        fname = "interludio.jpg"
    elif tu.startswith("CODA"):
        fname = "coda.jpg"
    else:
        m = _ROMAN_RE.match(t)
        fname = ROMAN_TO_IMAGE.get(m.group(1)) if m else None
    if fname is None:
        return None
    path = os.path.join(LAMINAS_DIR, fname)
    return path if os.path.exists(path) else None

# ========== DOCUMENT STATE ==========

class DocState:
    chapter_marks = []
    last_completed_page = 0  # updated in MyDoc.afterPage()

DOCSTATE = DocState()

# ========== MARKDOWN PARSING ==========

class MarkdownBlock:
    def __init__(self, block_type, content):
        self.type = block_type  # H1, H2, H3, PARA, POEMLINE
        self.content = content

def clean_markup(s):
    return re.sub(r"</?[a-zA-Z][^>]*>", "", s).strip()

def detect_lang(text):
    m = re.search(r'^lang:\s*(\w+)', text, re.M)
    return m.group(1) if m else "es"

def convert_markdown_formatting(text):
    if not text:
        return text
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', text)
    text = re.sub(r'_([^_]+)_', r'<i>\1</i>', text)
    return text

def is_short_italic_line(raw_line):
    """True for verse-poem lines: fully wrapped in a single *...* pair, short."""
    s = raw_line.strip()
    if len(s) < 2 or s[0] != '*' or s[-1] != '*':
        return False
    inner = s[1:-1]
    if '*' in inner:
        # allow a bold run inside (e.g. **Name**) but not another separate italic pair
        pass
    return len(s) <= 95

def parse_markdown(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    lang = detect_lang(text)

    if text.startswith('---'):
        end_fm = text.find('---', 3)
        if end_fm != -1:
            text = text[end_fm + 3:].lstrip('\n')

    blocks = []

    for raw_line in text.split('\n'):
        line_stripped = raw_line.strip()

        if not line_stripped or line_stripped == '---':
            continue

        if line_stripped.startswith('# '):
            h1_text = fix_greek_glyphs(line_stripped[2:].strip())
            blocks.append(MarkdownBlock("H1", h1_text))
        elif line_stripped.startswith('## '):
            h2_text = fix_greek_glyphs(line_stripped[3:].strip())
            blocks.append(MarkdownBlock("H2", h2_text))
        elif line_stripped.startswith('### '):
            h3_text = fix_greek_glyphs(line_stripped[4:].strip())
            blocks.append(MarkdownBlock("H3", h3_text))
        elif is_short_italic_line(line_stripped):
            formatted = fix_greek_glyphs(convert_markdown_formatting(line_stripped))
            blocks.append(MarkdownBlock("POEMLINE", formatted))
        else:
            formatted = fix_greek_glyphs(convert_markdown_formatting(line_stripped))
            blocks.append(MarkdownBlock("PARA", formatted))

    return blocks, lang

# ========== HEADER/FOOTER ==========

def make_header_footer(book_title):
    def header_footer(cv, doc, page_kind):
        page_no = doc.page
        cv.saveState()
        if page_kind == "body":
            is_recto = (page_no % 2 == 1)
            current_chapter = book_title
            for title, pg in DOCSTATE.chapter_marks:
                if pg <= page_no:
                    current_chapter = title
                else:
                    break
            htext = book_title if not is_recto else current_chapter
            cv.setFont("Lora-Italic", 8)
            cv.setFillColor(TEAL)
            if is_recto:
                cv.drawRightString(FRAME_X + TEXT_W, HEADER_Y, htext)
            else:
                cv.drawString(FRAME_X, HEADER_Y, htext)
            cv.setFont("Lora", 8.5)
            cv.setFillColor(INK)
            cv.drawCentredString(FRAME_X + TEXT_W / 2, FOLIO_Y, str(page_no))
        elif page_kind == "opener":
            cv.setFont("Lora", 8.5)
            cv.setFillColor(INK)
            cv.drawCentredString(FRAME_X + TEXT_W / 2, FOLIO_Y, str(page_no))
        cv.restoreState()
    return header_footer

# ========== FLOWABLES ==========

class ChapterStart(Flowable):
    def __init__(self, clean_title):
        Flowable.__init__(self)
        self.clean_title = clean_title
        self.width = 0
        self.height = 0

    def draw(self):
        pass

class ChapterOpener(Flowable):
    def __init__(self, width):
        Flowable.__init__(self)
        self.width = width
        self.height = 26

    def draw(self):
        draw_wave(self.canv, self.width / 2, 10, 70)

# Plates must land on an even (left-hand/verso) page, facing the movement's
# opening on the odd page that follows (see edicion_tapadura/README.md).
# A dynamic per-page-parity Flowable was tried first, but it depends on
# DOCSTATE.last_completed_page, which varies between multiBuild's internal
# passes while the table of contents is stabilizing - that dependency made
# the render nondeterministic, so some plates still ended up on odd pages.
# Instead, main() below renders once, reads back which chapter openers
# landed on an even page (meaning their plate is one page too early, on an
# odd page), and re-renders with a plain, unconditional extra PageBreak
# inserted before those plates' image - deterministic, so it's stable
# across multiBuild's internal passes.
FORCE_BREAK_BEFORE_IMAGE = set()

PLATE_BG = colors.HexColor("#0c1013")  # matches the plates' own deep navy-black backdrop

class FullBleedImage(Flowable):
    """Draws an illustration plate at true full bleed: the image covers the
    entire physical page edge to edge, with no visible margin on any side,
    as a printed plate requires. This means scaling to the LARGER of the
    two fit ratios (cover, not contain) and cropping whatever overflows -
    centered, so the crop is symmetric on the two sides that give."""
    def __init__(self, image_path):
        Flowable.__init__(self)
        self.image_path = image_path
        self.width = PW
        self.height = PH

    def draw(self):
        cv = self.canv
        cv.saveState()
        try:
            from reportlab.lib.utils import ImageReader
            img = ImageReader(self.image_path)
            iw, ih = img.getSize()
            scale = max(PW / iw, PH / ih)
            dw, dh = iw * scale, ih * scale
            dx, dy = (PW - dw) / 2.0, (PH - dh) / 2.0
            p = cv.beginPath()
            p.rect(0, 0, PW, PH)
            cv.clipPath(p, stroke=0)
            cv.drawImage(self.image_path, dx, dy, width=dw, height=dh,
                         preserveAspectRatio=True, mask='auto')
        except Exception as e:
            print(f"Warning: could not draw image {self.image_path}: {e}")
        cv.restoreState()

# ========== DOCUMENT STRUCTURE ==========

class MyDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, ChapterStart):
            pg = self.canv.getPageNumber()
            DOCSTATE.chapter_marks.append((flowable.clean_title, pg))
            self.notify("TOCEntry", (0, flowable.clean_title, pg))

    def afterPage(self):
        DOCSTATE.last_completed_page = self.page

    def build(self, flowables, **kwargs):
        DOCSTATE.chapter_marks = []
        DOCSTATE.last_completed_page = 0
        BaseDocTemplate.build(self, flowables, **kwargs)

# ========== FRAMES & TEMPLATES ==========
#
# frame_body / frame_opener / frame_front / frame_image are (re)built by
# set_gutter(), which must be called at least once before this function.

def build_page_templates(book_title):
    hf = make_header_footer(book_title)
    pt_body = PageTemplate(id="Body", frames=[frame_body], onPage=lambda cv, doc: hf(cv, doc, "body"))
    pt_opener = PageTemplate(id="Opener", frames=[frame_opener], onPage=lambda cv, doc: hf(cv, doc, "opener"))
    pt_front = PageTemplate(id="Front", frames=[frame_front], onPage=lambda cv, doc: None)
    pt_image = PageTemplate(id="ImagePage", frames=[frame_image], onPage=lambda cv, doc: None)
    return [pt_front, pt_body, pt_opener, pt_image]

# ========== STORY BUILDING ==========
#
# Note: this used to offer a "drop cap" first letter on the paragraph
# opening each section (an inline <font size="30"> on the first
# character). Reportlab's Paragraph does not reserve extra line height
# for an inline font run bigger than the paragraph's own leading, so the
# oversized letter was drawn taller than the space allotted to it and
# the *next* flowable (the following paragraph) got placed right under
# the paragraph's normal-sized bounding box - overlapping the bottom of
# the drop cap whenever that opening paragraph was short. Removed rather
# than reimplemented, to not reintroduce the same class of bug.

def para_flowable(markup):
    return Paragraph(markup, styleN)
    return open_tag, inner

LANG_STRINGS = {
    'ca': {
        'book_title': "L'Horitzó Interior",
        'title_sub': "Un assaig literari",
        'edition_sub': "Edició de cambra ampliada",
        'dedication': ["A la Montse i al Gerard,", "per aguantar-me tots els dies amb un somriure."],
        'index_heading': "Índex",
        'colophon': ["Es va acabar d'escriure el 8 de setembre de 2026,", "a L'Hospitalet de Llobregat."],
    },
    'en': {
        'book_title': "The Inner Horizon",
        'title_sub': "A Literary Essay",
        'edition_sub': "Expanded Chamber Edition",
        'dedication': ["To Montse and Gerard,", "for putting up with me every day with a smile."],
        'index_heading': "Contents",
        'colophon': ["Finished writing on September 8, 2026,", "in L'Hospitalet de Llobregat."],
    },
    'es': {
        'book_title': "El Horizonte Interior",
        'title_sub': "Un ensayo literario",
        'edition_sub': "Edición de cámara ampliada",
        'dedication': ["A Montse y a Gerard,", "por aguantarme todos los días con una sonrisa."],
        'index_heading': "Índice",
        'colophon': ["Se terminó de escribir el 8 de septiembre de 2026,", "en L'Hospitalet de Llobregat."],
    },
}

def build_story(blocks, lang):
    S = LANG_STRINGS.get(lang, LANG_STRINGS['ca'])
    story = []
    story.append(NextPageTemplate("Front"))

    # ---- title page ----
    story.append(Spacer(1, 1.6 * inch))
    story.append(Paragraph(f"<i>{S['title_sub']}</i>", styleTitleSub))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(S['book_title'], styleTitleMain))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(f"<i>{S['edition_sub']}</i>", styleTitleSub))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("Íñigo Barrera Barceló", styleTitleAuthor))
    story.append(PageBreak())

    # ---- dedication ----
    story.append(Spacer(1, 2.6 * inch))
    for line in S['dedication']:
        story.append(Paragraph(f"<i>{line}</i>", styleDedication))
    story.append(PageBreak())

    # ---- TOC ----
    story.append(Paragraph(S['index_heading'], styleTOCHeading))
    toc = TableOfContents()
    toc.levelStyles = [styleTOCEntry]
    toc.dotsMinLevel = 0
    story.append(toc)

    # Skip everything up to (not including) the first H2: the H1 title and
    # its surrounding subtitle/author/movements-list PARA lines duplicate
    # the hand-built title page above.
    first_h2 = next((idx for idx, b in enumerate(blocks) if b.type == "H2"), 0)
    blocks = blocks[first_h2:]

    n = len(blocks)
    i = 0
    while i < n:
        b = blocks[i]
        t = b.type

        if t == "H2":
            clean = clean_markup(b.content)
            image_path = get_movement_image(clean)

            if image_path:
                if clean in FORCE_BREAK_BEFORE_IMAGE:
                    story.append(PageBreak())
                story.append(NextPageTemplate("ImagePage"))
                story.append(PageBreak())
                story.append(FullBleedImage(image_path))

            story.append(NextPageTemplate("Opener"))
            story.append(PageBreak())
            story.append(ChapterStart(clean))
            story.append(ChapterOpener(TEXT_W))
            story.append(Spacer(1, 8))
            story.append(Paragraph(b.content, styleH1))
            story.append(NextPageTemplate("Body"))
            i += 1
            continue

        if t == "H3":
            h3_flow = Paragraph(b.content, styleH3)
            group = [h3_flow]
            nxt = blocks[i + 1] if i + 1 < n else None
            if nxt is not None and nxt.type == "PARA":
                group.append(para_flowable(nxt.content))
                i += 1
            elif nxt is not None and nxt.type == "POEMLINE":
                # A poem's heading (e.g. "I. La burbuja") must not be
                # orphaned alone at the bottom of a page with its verse
                # pushed to the next one - keep the whole poem, heading
                # included, as a single unit.
                while i + 1 < n and blocks[i + 1].type == "POEMLINE":
                    i += 1
                    group.append(Paragraph(blocks[i].content, stylePoem))
            story.append(KeepTogether(group))
        elif t == "POEMLINE":
            # Group the whole run of consecutive verse lines into one
            # KeepTogether so a poem never gets split by a page break
            # partway through - it either fits whole on the page it starts,
            # or the whole block moves to the next one.
            group = [Paragraph(b.content, stylePoem)]
            while i + 1 < n and blocks[i + 1].type == "POEMLINE":
                i += 1
                group.append(Paragraph(blocks[i].content, stylePoem))
            story.append(KeepTogether(group))
        elif t == "PARA":
            story.append(para_flowable(b.content))

        i += 1

    # ---- colophon page ----
    story.append(NextPageTemplate("Front"))
    story.append(PageBreak())
    story.append(Spacer(1, 2.8 * inch))
    for line in S['colophon']:
        story.append(Paragraph(f"<i>{line}</i>", styleDedication))

    return story

# ========== MAIN ==========

def render(blocks, lang, S, output_path, gutter_in):
    """Builds the PDF with a given gutter width and returns the page count."""
    set_gutter(gutter_in)
    doc = MyDoc(output_path, pagesize=(PW, PH),
                leftMargin=MARGIN_GUTTER, rightMargin=MARGIN_OUTER,
                topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
                title=S['book_title'], author="Íñigo Barrera Barceló")
    doc.addPageTemplates(build_page_templates(S['book_title']))
    story = build_story(blocks, lang)
    doc.multiBuild(story)
    return doc.page


def find_parity_fixes():
    """After an unfixed render, DOCSTATE.chapter_marks holds (title,
    opener_page) for every movement, in document order. A movement's plate
    sits on opener_page - 1; if that's odd (opener_page is even), the
    plate landed one page too early and needs an extra break before it.

    Fixing one movement inserts a whole blank page, which shifts every
    later movement's page by one - flipping their parity too. Rather than
    render repeatedly and hope it converges (it doesn't necessarily: a fix
    needed only because of an earlier fix's shift can un-fix itself once
    that earlier fix is also applied, oscillating forever), this computes
    every fix analytically in one pass: walk the movements in order,
    tracking how many blank pages have been inserted so far, and decide
    each one's fix against its page as shifted by that running total."""
    fixes = set()
    offset = 0
    for title, opener_page in DOCSTATE.chapter_marks:
        if get_movement_image(title) is None:
            continue
        if (opener_page + offset) % 2 == 0:
            fixes.add(title)
            offset += 1
    return fixes


def main(input_path, output_path):
    global FORCE_BREAK_BEFORE_IMAGE
    FORCE_BREAK_BEFORE_IMAGE = set()

    print(f"Reading: {input_path}")
    blocks, lang = parse_markdown(input_path)
    print(f"Parsed {len(blocks)} blocks, lang={lang}")
    S = LANG_STRINGS.get(lang, LANG_STRINGS['ca'])

    try:
        # Pass 1: guess the gutter from KDP's smallest bracket (most books
        # this size fall in 24-150 pages). Then check whether the resulting
        # page count actually calls for that bracket, and re-render once if
        # a different, correct gutter is needed.
        gutter_in = 0.375
        print(f"Building PDF (pass 1, gutter={gutter_in}\"): {output_path}")
        pages = render(blocks, lang, S, output_path, gutter_in)
        print(f"  -> {pages} pages")

        correct_gutter = kdp_gutter_inches(pages)
        if abs(correct_gutter - gutter_in) > 1e-6:
            print(f"KDP gutter for {pages} pages is {correct_gutter}\", "
                  f"not {gutter_in}\" - rebuilding.")
            pages = render(blocks, lang, S, output_path, correct_gutter)
            print(f"  -> {pages} pages (pass 2, gutter={correct_gutter}\")")
            # A larger gutter can only ever reduce or hold the page count
            # steady (less text fits per page), so it cannot push the
            # count into a bracket requiring an even larger gutter.
            assert kdp_gutter_inches(pages) == correct_gutter

        # Pass 3: with page count (and thus gutter) settled, check whether
        # any plate landed on an odd page. find_parity_fixes() computes the
        # complete, self-consistent set of corrections analytically in one
        # pass (accounting for how earlier fixes shift later movements'
        # pages), so a single re-render applies all of them at once.
        fixes = find_parity_fixes()
        if fixes:
            print(f"{len(fixes)} plate(s) on an odd page - rebuilding with "
                  f"a courtesy blank page before each.")
            FORCE_BREAK_BEFORE_IMAGE = fixes
            pages = render(blocks, lang, S, output_path, correct_gutter)
            assert not find_parity_fixes(), \
                f"parity still wrong: {find_parity_fixes()}"
            print(f"  -> {pages} pages (parity-corrected)")

        print(f"Success! PDF created: {output_path}")
        file_size = os.path.getsize(output_path)
        print(f"File size: {file_size / 1024 / 1024:.2f} MB")
        return True
    except Exception as e:
        print(f"Error building PDF: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    setup_fonts()

    if len(sys.argv) < 3:
        print("Usage: generate_hardcover_pdf.py <input.md> <output.pdf>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    success = main(input_file, output_file)
    sys.exit(0 if success else 1)
