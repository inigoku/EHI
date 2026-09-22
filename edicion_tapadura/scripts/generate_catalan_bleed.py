#!/usr/bin/env python3
"""
Generate hardcover edition PDF in Catalan from markdown source.
Uses reportlab to create a KDP-compliant PDF with bleeds.
"""

import re
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    NextPageTemplate, PageBreak, Flowable, KeepTogether
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Use standard PDF fonts (available everywhere)
FONT_BODY = "Times-Roman"
FONT_BOLD = "Times-Bold"
FONT_ITALIC = "Times-Italic"
FONT_BOLDITALIC = "Times-BoldItalic"

# Colors
INK = colors.HexColor("#22282c")
TEAL = colors.HexColor("#3c6e71")
CREAM = colors.HexColor("#faf8f3")

# Page geometry (KDP bleed: trim 5x8 + 0.125" outer/top/bottom)
BLEED = 0.125 * inch
TRIM_W, TRIM_H = 5 * inch, 8 * inch
PW, PH = TRIM_W + BLEED, TRIM_H + 2 * BLEED
TRIM_Y0 = BLEED
MARGIN_GUTTER = 0.75 * inch
MARGIN_OUTER = 0.6 * inch
MARGIN_TOP = 0.75 * inch
MARGIN_BOTTOM = 0.75 * inch
TEXT_W = TRIM_W - MARGIN_GUTTER - MARGIN_OUTER
TEXT_H = TRIM_H - MARGIN_TOP - MARGIN_BOTTOM
FRAME_X = (MARGIN_GUTTER + (BLEED + MARGIN_OUTER)) / 2.0
FRAME_Y = TRIM_Y0 + MARGIN_BOTTOM

# Styles
styleN = ParagraphStyle(
    "body", fontName=FONT_BODY, fontSize=10.3, leading=15.2,
    alignment=TA_JUSTIFY, textColor=INK, spaceAfter=7.5
)
styleH1 = ParagraphStyle(
    "h1", fontName=FONT_BOLD, fontSize=20, leading=24,
    textColor=INK, spaceAfter=16, alignment=TA_LEFT
)
styleH2 = ParagraphStyle(
    "h2", fontName=FONT_BOLDITALIC, fontSize=12.5, leading=16,
    textColor=TEAL, spaceBefore=10, spaceAfter=8, alignment=TA_LEFT
)
styleH3 = ParagraphStyle(
    "h3", fontName=FONT_ITALIC, fontSize=11, leading=15,
    textColor=INK, spaceBefore=8, spaceAfter=6, alignment=TA_LEFT
)
stylePoem = ParagraphStyle(
    "poem", fontName=FONT_ITALIC, fontSize=10.3, leading=15,
    alignment=TA_CENTER, textColor=INK, spaceAfter=1
)
styleTitleMain = ParagraphStyle(
    "titlemain", fontName=FONT_BOLD, fontSize=26, leading=30,
    alignment=TA_CENTER, textColor=INK
)
styleTitleSub = ParagraphStyle(
    "titlesub", fontName=FONT_ITALIC, fontSize=11.5, leading=16,
    alignment=TA_CENTER, textColor=TEAL
)
styleTitleAuthor = ParagraphStyle(
    "titleauthor", fontName=FONT_BODY, fontSize=13, leading=18,
    alignment=TA_CENTER, textColor=INK
)

def parse_markdown(filepath):
    """Parse markdown file and return structured blocks."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip YAML frontmatter
    if content.startswith('---'):
        parts = content.split('---', 2)
        content = parts[2] if len(parts) > 2 else content

    blocks = []
    lines = content.split('\n')
    i = 0

    while i < len(lines):
        line = lines[i]

        # Skip empty lines
        if not line.strip():
            i += 1
            continue

        # H1
        if line.startswith('# '):
            blocks.append(('H1', line[2:].strip()))
            i += 1

        # H2
        elif line.startswith('## '):
            blocks.append(('H2', line[3:].strip()))
            i += 1

        # H3
        elif line.startswith('### '):
            blocks.append(('H3', line[4:].strip()))
            i += 1

        # Horizontal rule
        elif line.strip() in ('---', '***', '___'):
            blocks.append(('BREAK', None))
            i += 1

        # Paragraph (including emphasis)
        else:
            # Collect paragraph lines
            para_lines = []
            while i < len(lines) and lines[i].strip() and not lines[i].startswith(('#', '---', '***', '___')):
                para_lines.append(lines[i])
                i += 1

            if para_lines:
                text = ' '.join(l.strip() for l in para_lines)
                blocks.append(('PARA', text))

    return blocks

def build_story(blocks):
    """Build story elements from parsed blocks."""
    story = []

    # Title page
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("L'HORITZÓ INTERIOR", styleTitleMain))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("Un assaig literari", styleTitleSub))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("Edició de càmera ampliada — amb L'espill sense profunditat", styleTitleSub))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("Íñigo Barrera Barceló", styleTitleAuthor))
    story.append(Spacer(1, 1*inch))

    # Add content blocks
    for block_type, text in blocks:
        if block_type == 'H1':
            story.append(PageBreak())
            story.append(Paragraph(text, styleH1))
        elif block_type == 'H2':
            story.append(Paragraph(text, styleH2))
        elif block_type == 'H3':
            story.append(Paragraph(text, styleH3))
        elif block_type == 'PARA':
            # Check if it looks like poetry (short lines, centered)
            if len(text) < 60 and text.strip():
                story.append(Paragraph(text, stylePoem))
            else:
                story.append(Paragraph(text, styleN))
        elif block_type == 'BREAK':
            story.append(Spacer(1, 0.2*inch))

    # Ensure even page count for print
    story.append(PageBreak())

    return story

class MyDoc(BaseDocTemplate):
    """Custom document class for proper page templates."""
    def __init__(self, filename, **kw):
        BaseDocTemplate.__init__(self, filename, **kw)
        self.pageNum = 0

    def afterPage(self):
        self.pageNum += 1

def main():
    # Parse markdown
    md_file = "/home/user/EHI/edicion_tapadura/El_Horizonte_Interior_TAPADURA_ca.md"
    blocks = parse_markdown(md_file)

    # Create document
    out_path = "/home/user/EHI/edicion_tapadura/El_Horizonte_Interior_TAPADURA_ca.pdf"
    doc = MyDoc(
        out_path, pagesize=(PW, PH),
        leftMargin=MARGIN_GUTTER, rightMargin=MARGIN_OUTER,
        topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
        title="L'horitzó interior", author="Íñigo Barrera Barceló"
    )

    # Create page template
    def draw_page(canvas, doc):
        canvas.saveState()
        # Background
        canvas.setFillColor(CREAM)
        canvas.rect(0, 0, PW, PH, fill=1, stroke=0)
        canvas.restoreState()

    pt = PageTemplate(id='normal', frames=[
        Frame(FRAME_X, FRAME_Y, TEXT_W, TEXT_H, id='F1')
    ], onPage=draw_page)

    doc.addPageTemplates([pt])

    # Build and write
    story = build_story(blocks)
    doc.multiBuild(story)

    print(f"PDF generated: {out_path}")
    import os
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"File size: {size_mb:.1f} MB")

if __name__ == "__main__":
    main()
