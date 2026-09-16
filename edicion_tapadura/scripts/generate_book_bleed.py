import re
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                 NextPageTemplate, PageBreak, Flowable, Image, KeepTogether)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from build_blocks import blocks

pdfmetrics.registerFont(TTFont("GreekFallback", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"))

_GREEK_FIX_CHARS = ["Φ", "φ", "Δ", "δ", "Σ", "σ", "Ω", "ω", "π", "Π", "λ", "Λ", "θ", "Θ", "α", "β", "γ", "Γ"]


def fix_greek_glyphs(text):
    for ch in _GREEK_FIX_CHARS:
        if ch in text:
            text = text.replace(ch, f'<font name="GreekFallback">{ch}</font>')
    return text


def _patch_blocks_for_missing_glyphs(block_list):
    for b in block_list:
        if "text" in b:
            b["text"] = fix_greek_glyphs(b["text"])
        if b.get("type") == "POEM":
            for ln in b.get("lines", []):
                ln["text"] = fix_greek_glyphs(ln["text"])


_patch_blocks_for_missing_glyphs(blocks)

# ---------- palette ----------
INK = colors.HexColor("#22282c")
TEAL = colors.HexColor("#3c6e71")
CREAM = colors.HexColor("#faf8f3")
SAND = colors.HexColor("#c9c2b2")

# ---------- fonts ----------
FD = "/home/claude/fonts/"
pdfmetrics.registerFont(TTFont("Lora", FD + "Lora-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Lora-Bold", FD + "Lora-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Lora-Italic", FD + "Lora-Italic-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Lora-BoldItalic", FD + "Lora-BoldItalic.ttf"))
pdfmetrics.registerFontFamily("Lora", normal="Lora", bold="Lora-Bold",
                               italic="Lora-Italic", boldItalic="Lora-BoldItalic")

# ---------- page geometry (KDP bleed: trim 5x8 + 0.125" outer/top/bottom) ----------
BLEED = 0.125 * inch                      # 9 pt
TRIM_W, TRIM_H = 5 * inch, 8 * inch       # 360 x 576
PW, PH = TRIM_W + BLEED, TRIM_H + 2 * BLEED   # 369 x 594
TRIM_Y0 = BLEED                           # trim bottom edge inside the sheet
MARGIN_GUTTER = 0.75 * inch
MARGIN_OUTER = 0.6 * inch
MARGIN_TOP = 0.75 * inch
MARGIN_BOTTOM = 0.75 * inch
TEXT_W = TRIM_W - MARGIN_GUTTER - MARGIN_OUTER      # 262.8
TEXT_H = TRIM_H - MARGIN_TOP - MARGIN_BOTTOM        # 468
# recto puts the spine at x=0, verso at x=PW; the two text positions differ by
# less than 1pt, so a single frame position serves both.
FRAME_X = (MARGIN_GUTTER + (BLEED + MARGIN_OUTER)) / 2.0
FRAME_Y = TRIM_Y0 + MARGIN_BOTTOM
HEADER_Y = TRIM_Y0 + TRIM_H - MARGIN_TOP + 20
FOLIO_Y = TRIM_Y0 + MARGIN_BOTTOM - 22

# ---------- styles ----------
styleN = ParagraphStyle("body", fontName="Lora", fontSize=10.3, leading=15.2,
                         alignment=TA_JUSTIFY, textColor=INK, spaceAfter=7.5)
styleFirstPara = ParagraphStyle("bodyFirst", parent=styleN, autoLeading="max")
styleH1 = ParagraphStyle("h1", fontName="Lora-Bold", fontSize=20, leading=24,
                          textColor=INK, spaceAfter=16, alignment=TA_LEFT)
styleH2 = ParagraphStyle("h2", fontName="Lora-BoldItalic", fontSize=12.5, leading=16,
                          textColor=TEAL, spaceBefore=10, spaceAfter=8, alignment=TA_LEFT)
styleH2Center = ParagraphStyle("h2center", parent=styleH2, alignment=TA_CENTER, spaceAfter=18)
stylePoem = ParagraphStyle("poem", fontName="Lora-Italic", fontSize=10.3, leading=15,
                            alignment=TA_CENTER, textColor=INK, spaceAfter=1)
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

def draw_wave(cv, cx, cy, width, color=TEAL, height=7):
    """Small hand-drawn-style wave ornament centered at (cx, cy)."""
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


BOOK_TITLE = "El Horizonte Interior"


class DocState:
    chapter_marks = []  # list of (clean_title, page_number), filled during each pass


DOCSTATE = DocState()


def clean_markup(s):
    return re.sub(r"</?[a-zA-Z][^>]*>", "", s).strip()


def header_footer(cv, doc, page_kind):
    """page_kind: 'body' | 'opener' | 'manga' | 'front'"""
    page_no = doc.page
    cv.saveState()
    if page_kind == "body":
        is_recto = (page_no % 2 == 1)
        gutter_x = MARGIN_GUTTER if is_recto else MARGIN_OUTER
        outer_x = MARGIN_OUTER if is_recto else MARGIN_GUTTER
        left_x = gutter_x if not is_recto else (PW - MARGIN_GUTTER)
        # running header text
        current_chapter = BOOK_TITLE
        for title, pg in DOCSTATE.chapter_marks:
            if pg <= page_no:
                current_chapter = title
            else:
                break
        htext = BOOK_TITLE if not is_recto else current_chapter
        cv.setFont("Lora-Italic", 8)
        cv.setFillColor(TEAL)
        text_x0 = MARGIN_OUTER if not is_recto else MARGIN_GUTTER
        if is_recto:
            cv.drawRightString(FRAME_X + TEXT_W, HEADER_Y, htext)
        else:
            cv.drawString(FRAME_X, HEADER_Y, htext)
        # folio
        cv.setFont("Lora", 8.5)
        cv.setFillColor(INK)
        cv.drawCentredString(FRAME_X + TEXT_W / 2, FOLIO_Y, str(page_no))
    elif page_kind == "opener":
        cv.setFont("Lora", 8.5)
        cv.setFillColor(INK)
        cv.drawCentredString(FRAME_X + TEXT_W / 2, FOLIO_Y, str(page_no))
    elif page_kind == "manga":
        cv.setFont("Lora", 7.5)
        cv.setFillColor(SAND)
        cv.drawCentredString(FRAME_X + TEXT_W / 2, FOLIO_Y, str(page_no))
    cv.restoreState()


def onPage_body(cv, doc):
    header_footer(cv, doc, "body")


def onPage_opener(cv, doc):
    header_footer(cv, doc, "opener")


def onPage_manga(cv, doc):
    header_footer(cv, doc, "manga")


def onPage_front(cv, doc):
    pass


frame_body = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id="body",
                    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
frame_opener = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H - 0.5 * inch, id="opener",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
frame_full = Frame(0, 0, PW, PH, id="full", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
frame_manga = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id="mangaframe",
                     leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
frame_front = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id="front",
                     leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

pt_body = PageTemplate(id="Body", frames=[frame_body], onPage=onPage_body)
pt_opener = PageTemplate(id="Opener", frames=[frame_opener], onPage=onPage_opener)
pt_manga = PageTemplate(id="Manga", frames=[frame_full], onPage=onPage_manga)  # full-bleed
pt_front = PageTemplate(id="Front", frames=[frame_front], onPage=onPage_front)


class ChapterStart(Flowable):
    """Zero-height marker flowable: records the page a chapter begins on."""
    def __init__(self, clean_title):
        Flowable.__init__(self)
        self.clean_title = clean_title
        self.width = 0
        self.height = 0

    def draw(self):
        pass


class MyDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, ChapterStart):
            pg = self.canv.getPageNumber()
            DOCSTATE.chapter_marks.append((flowable.clean_title, pg))
            self.notify("TOCEntry", (0, flowable.clean_title, pg))

    def build(self, flowables, **kwargs):
        DOCSTATE.chapter_marks = []
        BaseDocTemplate.build(self, flowables, **kwargs)


def onPage_poem(cv, doc):
    header_footer(cv, doc, "opener")


frame_poem = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id="poem",
                    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
pt_poem = PageTemplate(id="Poem", frames=[frame_poem], onPage=onPage_poem)


def onPage_plate(cv, doc):
    pass


frame_plate = Frame(0, 0, PW, PH, id="plateframe",
                    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
pt_plate = PageTemplate(id="Plate", frames=[frame_plate], onPage=onPage_plate)

PLATE_DIR = "/home/claude/plates/"
PLATE_MAP = {
    "OBERTURA — La costumbre del agua": "obertura",
    "I — La forma del interior": "cap1",
    "II — El tiempo del vínculo": "cap2",
    "III — El taller del vínculo": "cap3",
    "INTERLUDIO — el borde que cruzamos cada noche": "interludio",
    "IV — El horizonte herido": "cap4",
    "V — La geografía de lo que falta": "cap5",
    "VI — El límite": "cap6",
    "CODA — Txiki": "coda",
    "EL ESPEJO SIN PROFUNDIDAD": "espejo",
    "EL DIAPASÓN INVISIBLE": "diapason",
    "EL OJO DE UN SOLO COLOR": "ojo",
    "LA REALIDAD FRACTAL": "fractal",
}

LONG_POEM_LINES = 26


def build_poem_page_flowables(heading_markup, poem_block):
    """Returns a list of flowables for a dedicated poem page (heading + stanzas)."""
    lines = poem_block["lines"]
    stanzas = []
    cur = []
    for ln in lines:
        if ln["stanza_break"] and cur:
            stanzas.append(cur)
            cur = []
        cur.append(ln["text"])
    if cur:
        stanzas.append(cur)

    is_long = len(lines) > LONG_POEM_LINES

    # build the actual flowables once, then measure their real wrapped heights
    heading_flow = Paragraph(heading_markup, styleH2Center)
    stanza_flows = []
    for st in stanzas:
        stanza_flows.append([Paragraph(t, stylePoem) for t in st])

    def measure(flowable):
        w, h = flowable.wrap(TEXT_W, TEXT_H)
        return h

    if not is_long:
        total_h = measure(heading_flow)
        total_h += getattr(styleH2Center, "spaceBefore", 0)
        total_h += getattr(styleH2Center, "spaceAfter", 0)
        for si, st in enumerate(stanza_flows):
            if si > 0:
                total_h += 8
            for pf in st:
                total_h += measure(pf)
        SAFETY = 16
        top_pad = max(6, (TEXT_H - total_h - SAFETY) / 2)
        ordered = [Spacer(1, top_pad), heading_flow]
        for si, st in enumerate(stanza_flows):
            if si > 0:
                ordered.append(Spacer(1, 8))
            ordered.extend(st)
        group = KeepTogether(ordered)
        return [group]
    else:
        flows = [heading_flow, Spacer(1, 10)]
        for si, st in enumerate(stanza_flows):
            if si > 0:
                flows.append(Spacer(1, 8))
            flows.append(KeepTogether(st))
        return flows


print("templates OK")

TEAL_HEX = "#3c6e71"


def strip_leading_tag(s):
    """Return (leading_tag, inner_rest) where inner_rest still contains its own closing tag if any."""
    m = re.match(r"^(<i>|<b>|<b><i>|<i><b>)", s)
    if not m:
        return "", s
    open_tag = m.group(1)
    inner = s[len(open_tag):]
    return open_tag, inner


def make_dropcap_markup(markup):
    open_tag, inner = strip_leading_tag(markup)
    if not inner:
        return markup
    first_char = inner[0]
    rest = inner[1:]
    cap = f'<font name="Lora-Bold" size="30" color="{TEAL_HEX}">{first_char}</font>'
    return open_tag + cap + rest


def para_flowable(markup, dropcap=False):
    if dropcap:
        return Paragraph(make_dropcap_markup(markup), styleFirstPara)
    return Paragraph(markup, styleN)


CHAPTER_KICKERS = {
    "OBERTURA": "obertura", "INTERLUDIO": "interludio", "CODA": "coda",
}


class ChapterOpener(Flowable):
    """Draws the wave ornament centered; the title Paragraph follows separately in the story."""
    def __init__(self, width):
        Flowable.__init__(self)
        self.width = width
        self.height = 26

    def draw(self):
        draw_wave(self.canv, self.width / 2, 10, 70)


def build_story(add_parity_blank=False, plate_blanks=frozenset()):
    story = []
    story.append(NextPageTemplate("Front"))
    # ---- title page ----
    story.append(Spacer(1, 1.6 * inch))
    story.append(Paragraph("<i>Un ensayo literario</i>", styleTitleSub))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(BOOK_TITLE, styleTitleMain))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("<i>Edición de Cámara</i>", styleTitleSub))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("Íñigo Barrera Barceló", styleTitleAuthor))
    story.append(PageBreak())
    # ---- dedication ----
    story.append(Spacer(1, 2.6 * inch))
    story.append(Paragraph("<i>A Montse y a Gerard,</i>", styleDedication))
    story.append(Paragraph("<i>por aguantarme todos los días con una sonrisa.</i>", styleDedication))
    story.append(PageBreak())
    # ---- TOC ----
    story.append(Paragraph("Índice", styleTOCHeading))
    toc = TableOfContents()
    toc.levelStyles = [styleTOCEntry]
    toc.dotsMinLevel = 0
    story.append(toc)

    manga_idx = 0
    just_after_h1 = False
    just_after_h2 = False
    pending_break = False  # True right after a poem page: next non-poem block must open a fresh Body page

    i = 0
    n = len(blocks)
    while i < n:
        b = blocks[i]
        t = b["type"]
        if t == "H2":
            nxt = blocks[i + 1] if i + 1 < n else None
            if nxt is not None and nxt["type"] == "POEM":
                story.append(NextPageTemplate("Poem"))
                story.append(PageBreak())
                story.extend(build_poem_page_flowables(b["text"], nxt))
                pending_break = True
                just_after_h2 = True
                i += 2
                continue
            if pending_break:
                story.append(NextPageTemplate("Body"))
                story.append(PageBreak())
                pending_break = False
            # keep the heading glued to whatever follows it (avoid orphaned headings)
            h2_flow = Paragraph(b["text"], styleH2)
            group = [h2_flow]
            if nxt is not None and nxt["type"] == "PARA":
                group.append(para_flowable(nxt["text"], dropcap=just_after_h1))
                just_after_h1 = False
                i += 1
            story.append(KeepTogether(group))
            just_after_h2 = True
            i += 1
            continue
        if t == "H1":
            clean = clean_markup(b["text"])
            plate = PLATE_MAP.get(clean)
            if plate:
                if plate in plate_blanks:
                    story.append(NextPageTemplate("Front"))
                    story.append(PageBreak())
                    story.append(Spacer(1, 1))
                story.append(NextPageTemplate("Plate"))
                story.append(PageBreak())
                pimg = Image(PLATE_DIR + plate + ".jpg", width=PW, height=PH)
                pimg.hAlign = "LEFT"
                story.append(pimg)
                pending_break = False
            story.append(NextPageTemplate("Opener"))
            story.append(PageBreak())
            pending_break = False
            story.append(ChapterStart(clean))
            story.append(ChapterOpener(TEXT_W))
            story.append(Spacer(1, 8))
            story.append(Paragraph(b["text"], styleH1))
            story.append(NextPageTemplate("Body"))
            just_after_h1 = True
            just_after_h2 = False
        elif t == "PARA":
            if pending_break:
                story.append(NextPageTemplate("Body"))
                story.append(PageBreak())
                pending_break = False
            plain_check = clean_markup(b["text"])
            if just_after_h1 and (plain_check.startswith("Índice de") or b["text"].strip().startswith("<i>")):
                story.append(para_flowable(b["text"], dropcap=False))
                # keep just_after_h1 pending: the real opening paragraph is still ahead
            else:
                dropcap = just_after_h1
                story.append(para_flowable(b["text"], dropcap=dropcap))
                just_after_h1 = False
            just_after_h2 = False
        elif t == "POEM":
            # standalone poem with no preceding H2 (not expected in this book, kept as a safe fallback)
            if pending_break:
                story.append(NextPageTemplate("Body"))
                story.append(PageBreak())
                pending_break = False
            story.append(Spacer(1, 4))
            plines = []
            for j, ln in enumerate(b["lines"]):
                if ln["stanza_break"] and j > 0:
                    plines.append(Spacer(1, 8))
                plines.append(Paragraph(ln["text"], stylePoem))
            story.append(KeepTogether(plines))
            story.append(Spacer(1, 4))
            just_after_h1 = False
            just_after_h2 = False
        elif t == "MANGA":
            story.append(NextPageTemplate("Manga"))
            story.append(PageBreak())
            pending_break = False
            img_path = f"/home/claude/manga/img-{manga_idx:03d}.png"
            manga_idx += 1
            from PIL import Image as PILImage
            with PILImage.open(img_path) as im:
                iw, ih = im.size
            # encajar entero (sin recortar): el comic trae su propia caja y
            # cabecera, asi que sangrarlo cortaria dibujo y texto
            scale = min(PW / iw, PH / ih)
            dw, dh = iw * scale, ih * scale
            img_flow = Image(img_path, width=dw, height=dh)
            img_flow.hAlign = "CENTER"
            story.append(Spacer(1, (PH - dh) / 2))
            story.append(img_flow)
            story.append(NextPageTemplate("Body"))
            just_after_h1 = False
            just_after_h2 = False
        i += 1
    # colophon page
    story.append(NextPageTemplate("Front"))
    story.append(PageBreak())
    story.append(Spacer(1, 2.8 * inch))
    story.append(Paragraph("<i>Se terminó de escribir el 8 de septiembre de 2026,</i>", styleDedication))
    story.append(Paragraph("<i>en L'Hospitalet de Llobregat.</i>", styleDedication))
    # ensure an even total page count for print (KDP requires even page counts)
    if add_parity_blank:
        story.append(NextPageTemplate("Front"))
        story.append(PageBreak())
        story.append(Spacer(1, 1))
    return story


print("story builder OK")

if __name__ == "__main__":
    import sys
    out_path = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/EHI_maquetado_test.pdf"
    doc = MyDoc(out_path, pagesize=(PW, PH),
                leftMargin=MARGIN_GUTTER, rightMargin=MARGIN_OUTER,
                topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
                title="El Horizonte Interior", author="Íñigo Barrera Barceló")
    doc.addPageTemplates([pt_front, pt_body, pt_opener, pt_manga, pt_poem])
    story = build_story()
    doc.multiBuild(story)
    print("Built:", out_path)
