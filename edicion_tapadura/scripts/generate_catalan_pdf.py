#!/usr/bin/env python3
"""
Generate PDF for Catalan hardcover edition from markdown.
Uses reportlab with KDP bleed specifications (5 × 8", with 0.125" bleed).
"""

import re
import os
import sys
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                 NextPageTemplate, PageBreak, Flowable, KeepTogether)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ========== FONTS ==========

def setup_fonts():
    """Register fonts, downloading Lora if needed."""
    # Try to use Lora fonts if available
    lora_paths = [
        "/home/claude/fonts/",
        "/home/user/EHI/edicion_ensayo/fonts/",
        "/usr/share/fonts/truetype/lora/",
    ]

    # Try to find and register Lora fonts
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

    # Fallback to SourceSerifPro if Lora not found
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

# Register Greek fallback
pdfmetrics.registerFont(TTFont("GreekFallback", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"))

_GREEK_FIX_CHARS = ["Φ", "φ", "Δ", "δ", "Σ", "σ", "Ω", "ω", "π", "Π", "λ", "Λ", "θ", "Θ", "α", "β", "γ", "Γ"]

def fix_greek_glyphs(text):
    """Fix Greek characters by using fallback font."""
    for ch in _GREEK_FIX_CHARS:
        if ch in text:
            text = text.replace(ch, f'<font name="GreekFallback">{ch}</font>')
    return text

# ========== COLOR PALETTE ==========

INK = colors.HexColor("#22282c")
TEAL = colors.HexColor("#3c6e71")
CREAM = colors.HexColor("#faf8f3")
SAND = colors.HexColor("#c9c2b2")

# ========== PAGE GEOMETRY (KDP bleed: trim 5x8 + 0.125" outer/top/bottom) ==========

BLEED = 0.125 * inch                      # 9 pt
TRIM_W, TRIM_H = 5 * inch, 8 * inch       # 360 x 576
PW, PH = TRIM_W + BLEED, TRIM_H + 2 * BLEED   # 369 x 594
TRIM_Y0 = BLEED                           # trim bottom edge inside the sheet
MARGIN_GUTTER = 0.75 * inch
MARGIN_OUTER = 0.6 * inch
MARGIN_TOP = 0.75 * inch
MARGIN_BOTTOM = 0.75 * inch
TEXT_W = TRIM_W - MARGIN_GUTTER - MARGIN_OUTER
TEXT_H = TRIM_H - MARGIN_TOP - MARGIN_BOTTOM
FRAME_X = (MARGIN_GUTTER + (BLEED + MARGIN_OUTER)) / 2.0
FRAME_Y = TRIM_Y0 + MARGIN_BOTTOM
HEADER_Y = TRIM_Y0 + TRIM_H - MARGIN_TOP + 20
FOLIO_Y = TRIM_Y0 + MARGIN_BOTTOM - 22

# ========== STYLES ==========

styleN = ParagraphStyle("body", fontName="Lora", fontSize=10.3, leading=15.2,
                         alignment=TA_JUSTIFY, textColor=INK, spaceAfter=7.5)
styleFirstPara = ParagraphStyle("bodyFirst", parent=styleN, autoLeading="max")
styleH1 = ParagraphStyle("h1", fontName="Lora-Bold", fontSize=20, leading=24,
                          textColor=INK, spaceAfter=16, alignment=TA_LEFT)
styleH2 = ParagraphStyle("h2", fontName="Lora-BoldItalic", fontSize=12.5, leading=16,
                          textColor=TEAL, spaceBefore=10, spaceAfter=8, alignment=TA_LEFT)
styleH2Center = ParagraphStyle("h2center", parent=styleH2, alignment=TA_CENTER, spaceAfter=18)
styleH3 = ParagraphStyle("h3", fontName="Lora-Bold", fontSize=11, leading=15,
                          textColor=INK, spaceBefore=8, spaceAfter=6, alignment=TA_LEFT)
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

# ========== ORNAMENTS ==========

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

# ========== DOCUMENT STATE ==========

BOOK_TITLE = "L'Horitzó Interior"

class DocState:
    chapter_marks = []

DOCSTATE = DocState()

# ========== MARKDOWN PARSING ==========

class MarkdownBlock:
    """Represents a block in the markdown."""
    def __init__(self, block_type, content):
        self.type = block_type  # H1, H2, H3, PARA, ITALIC_BLOCK
        self.content = content

def clean_markup(s):
    """Remove HTML tags from text."""
    return re.sub(r"</?[a-zA-Z][^>]*>", "", s).strip()

def parse_markdown(filepath):
    """Parse markdown file into blocks."""
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Remove YAML frontmatter
    if text.startswith('---'):
        end_fm = text.find('---', 3)
        if end_fm != -1:
            text = text[end_fm+3:].lstrip('\n')

    blocks = []
    current_para = []

    for line in text.split('\n'):
        line_stripped = line.strip()

        # Skip empty lines and horizontal rules
        if not line_stripped or line_stripped == '---':
            if current_para:
                para_text = ' '.join(current_para).strip()
                if para_text:
                    para_text = fix_greek_glyphs(para_text)
                    blocks.append(MarkdownBlock("PARA", para_text))
                current_para = []
            continue

        # Headings
        if line_stripped.startswith('# '):
            if current_para:
                para_text = ' '.join(current_para).strip()
                if para_text:
                    para_text = fix_greek_glyphs(para_text)
                    blocks.append(MarkdownBlock("PARA", para_text))
                current_para = []
            h1_text = line_stripped[2:].strip()
            h1_text = fix_greek_glyphs(h1_text)
            blocks.append(MarkdownBlock("H1", h1_text))
        elif line_stripped.startswith('## '):
            if current_para:
                para_text = ' '.join(current_para).strip()
                if para_text:
                    para_text = fix_greek_glyphs(para_text)
                    blocks.append(MarkdownBlock("PARA", para_text))
                current_para = []
            h2_text = line_stripped[3:].strip()
            h2_text = fix_greek_glyphs(h2_text)
            blocks.append(MarkdownBlock("H2", h2_text))
        elif line_stripped.startswith('### '):
            if current_para:
                para_text = ' '.join(current_para).strip()
                if para_text:
                    para_text = fix_greek_glyphs(para_text)
                    blocks.append(MarkdownBlock("PARA", para_text))
                current_para = []
            h3_text = line_stripped[4:].strip()
            h3_text = fix_greek_glyphs(h3_text)
            blocks.append(MarkdownBlock("H3", h3_text))
        else:
            # Regular paragraph text, convert markdown formatting
            line_formatted = convert_markdown_formatting(line_stripped)
            if line_formatted:
                current_para.append(line_formatted)

    # Flush remaining paragraph
    if current_para:
        para_text = ' '.join(current_para).strip()
        if para_text:
            para_text = fix_greek_glyphs(para_text)
            blocks.append(MarkdownBlock("PARA", para_text))

    return blocks

def convert_markdown_formatting(text):
    """Convert markdown formatting to HTML for reportlab."""
    if not text:
        return text

    # Handle bold (**text**)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    # Handle italic (*text* or _text_)
    text = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', text)
    text = re.sub(r'_([^_]+)_', r'<i>\1</i>', text)

    return text

# ========== HEADER/FOOTER ==========

def header_footer(cv, doc, page_kind):
    """page_kind: 'body' | 'opener' | 'front'"""
    page_no = doc.page
    cv.saveState()
    if page_kind == "body":
        is_recto = (page_no % 2 == 1)
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
    cv.restoreState()

def onPage_body(cv, doc):
    header_footer(cv, doc, "body")

def onPage_opener(cv, doc):
    header_footer(cv, doc, "opener")

def onPage_front(cv, doc):
    pass

# ========== FLOWABLES ==========

class ChapterStart(Flowable):
    """Zero-height marker flowable: records the page a chapter begins on."""
    def __init__(self, clean_title):
        Flowable.__init__(self)
        self.clean_title = clean_title
        self.width = 0
        self.height = 0

    def draw(self):
        pass

class ChapterOpener(Flowable):
    """Draws the wave ornament centered."""
    def __init__(self, width):
        Flowable.__init__(self)
        self.width = width
        self.height = 26

    def draw(self):
        draw_wave(self.canv, self.width / 2, 10, 70)

# ========== DOCUMENT STRUCTURE ==========

class MyDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, ChapterStart):
            pg = self.canv.getPageNumber()
            DOCSTATE.chapter_marks.append((flowable.clean_title, pg))
            self.notify("TOCEntry", (0, flowable.clean_title, pg))

    def build(self, flowables, **kwargs):
        DOCSTATE.chapter_marks = []
        BaseDocTemplate.build(self, flowables, **kwargs)

# ========== FRAMES & TEMPLATES ==========

frame_body = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id="body",
                    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
frame_opener = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H - 0.5 * inch, id="opener",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
frame_front = Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id="front",
                     leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

pt_body = PageTemplate(id="Body", frames=[frame_body], onPage=onPage_body)
pt_opener = PageTemplate(id="Opener", frames=[frame_opener], onPage=onPage_opener)
pt_front = PageTemplate(id="Front", frames=[frame_front], onPage=onPage_front)

# ========== STORY BUILDING ==========

def para_flowable(markup, dropcap=False):
    """Create a paragraph flowable."""
    if dropcap:
        markup = make_dropcap_markup(markup)
    return Paragraph(markup, styleN)

def make_dropcap_markup(markup):
    """Add drop cap to beginning of paragraph."""
    open_tag, inner = strip_leading_tag(markup)
    if not inner:
        return markup
    first_char = inner[0]
    rest = inner[1:]
    cap = f'<font name="Lora-Bold" size="30" color="#3c6e71">{first_char}</font>'
    return open_tag + cap + rest

def strip_leading_tag(s):
    """Return (leading_tag, inner_rest)."""
    m = re.match(r"^(<i>|<b>|<b><i>|<i><b>)", s)
    if not m:
        return "", s
    open_tag = m.group(1)
    inner = s[len(open_tag):]
    return open_tag, inner

def build_story(blocks):
    """Build story flowables from parsed blocks."""
    story = []
    story.append(NextPageTemplate("Front"))

    # ---- title page ----
    story.append(Spacer(1, 1.6 * inch))
    story.append(Paragraph("<i>Un assaig literari</i>", styleTitleSub))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(BOOK_TITLE, styleTitleMain))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("<i>Edició de càmera ampliada</i>", styleTitleSub))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("Íñigo Barrera Barceló", styleTitleAuthor))
    story.append(PageBreak())

    # ---- dedication ----
    story.append(Spacer(1, 2.6 * inch))
    story.append(Paragraph("<i>A Montse i a Gerard,</i>", styleDedication))
    story.append(Paragraph("<i>per aguantarme tots els dies amb una sonrisa.</i>", styleDedication))
    story.append(PageBreak())

    # ---- TOC ----
    story.append(Paragraph("Índex", styleTOCHeading))
    toc = TableOfContents()
    toc.levelStyles = [styleTOCEntry]
    toc.dotsMinLevel = 0
    story.append(toc)

    just_after_h1 = False
    just_after_h2 = False
    pending_break = False

    i = 0
    n = len(blocks)
    while i < n:
        b = blocks[i]
        t = b.type

        if t == "H2":
            if pending_break:
                story.append(NextPageTemplate("Body"))
                story.append(PageBreak())
                pending_break = False
            # Keep heading glued to following paragraph
            h2_flow = Paragraph(b.content, styleH2)
            group = [h2_flow]
            nxt = blocks[i + 1] if i + 1 < n else None
            if nxt is not None and nxt.type == "PARA":
                group.append(para_flowable(nxt.content, dropcap=just_after_h1))
                just_after_h1 = False
                i += 1
            story.append(KeepTogether(group))
            just_after_h2 = True
            i += 1
            continue

        if t == "H1":
            clean = clean_markup(b.content)
            story.append(NextPageTemplate("Opener"))
            story.append(PageBreak())
            pending_break = False
            story.append(ChapterStart(clean))
            story.append(ChapterOpener(TEXT_W))
            story.append(Spacer(1, 8))
            story.append(Paragraph(b.content, styleH1))
            story.append(NextPageTemplate("Body"))
            just_after_h1 = True
            just_after_h2 = False
        elif t == "H3":
            if pending_break:
                story.append(NextPageTemplate("Body"))
                story.append(PageBreak())
                pending_break = False
            h3_flow = Paragraph(b.content, styleH3)
            group = [h3_flow]
            nxt = blocks[i + 1] if i + 1 < n else None
            if nxt is not None and nxt.type == "PARA":
                group.append(para_flowable(nxt.content, dropcap=False))
                i += 1
            story.append(KeepTogether(group))
            just_after_h1 = False
            just_after_h2 = False
        elif t == "PARA":
            if pending_break:
                story.append(NextPageTemplate("Body"))
                story.append(PageBreak())
                pending_break = False
            plain_check = clean_markup(b.content)
            if just_after_h1 and (plain_check.startswith("Índex de") or b.content.strip().startswith("<i>")):
                story.append(para_flowable(b.content, dropcap=False))
            else:
                dropcap = just_after_h1
                story.append(para_flowable(b.content, dropcap=dropcap))
                just_after_h1 = False
            just_after_h2 = False

        i += 1

    # ---- colophon page ----
    story.append(NextPageTemplate("Front"))
    story.append(PageBreak())
    story.append(Spacer(1, 2.8 * inch))
    story.append(Paragraph("<i>Se terminà d'escriure el 8 de setembre de 2026,</i>", styleDedication))
    story.append(Paragraph("<i>a L'Hospitalet de Llobregat.</i>", styleDedication))

    return story

# ========== MAIN ==========

def main(input_path, output_path):
    """Generate PDF from markdown."""
    print(f"Reading: {input_path}")
    blocks = parse_markdown(input_path)
    print(f"Parsed {len(blocks)} blocks")

    print(f"Building PDF: {output_path}")
    doc = MyDoc(output_path, pagesize=(PW, PH),
                leftMargin=MARGIN_GUTTER, rightMargin=MARGIN_OUTER,
                topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
                title=BOOK_TITLE, author="Íñigo Barrera Barceló")

    doc.addPageTemplates([pt_front, pt_body, pt_opener])

    story = build_story(blocks)

    try:
        doc.multiBuild(story)
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
    # Setup fonts first
    setup_fonts()

    # Input and output paths
    input_file = "/home/user/EHI/edicion_tapadura/El_Horizonte_Interior_TAPADURA_ca.md"
    output_file = "/home/user/EHI/edicion_tapadura/El_Horizonte_Interior_TAPADURA_ca.pdf"

    # Allow override via command line
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]

    success = main(input_file, output_file)
    sys.exit(0 if success else 1)
