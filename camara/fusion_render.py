"""Renderizadores docx/epub/pdf para la Edición de cámara integral.

Trabaja sobre listas de FBlock (build_fusion.FBlock): kind "heading" con
level 1/2/3, o kind "para" con líneas (una sola línea = párrafo normal que
se envuelve; varias líneas = verso, se preservan los saltos). Reutiliza
split_emphasis de build_camara.py para *cursiva* y **negrita** en línea.
"""
from __future__ import annotations

from pathlib import Path

from build_camara import split_emphasis


def esc_html(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ---------------------------------------------------------------------------
# DOCX
# ---------------------------------------------------------------------------

def build_docx(header, blocks, out_path: Path):
    from docx import Document
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.shared import Pt, Cm

    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Garamond"
    style.font.size = Pt(11)
    for section in doc.sections:
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)

    def add(text, *, size=11, bold=False, italic=False, align=None, space_before=0, space_after=8):
        p = doc.add_paragraph()
        if align is not None:
            p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(text)
        r.bold = bold
        r.italic = italic
        r.font.size = Pt(size)
        return p

    def add_multiline(lines, *, align=None, size=11):
        p = doc.add_paragraph()
        if align is not None:
            p.alignment = align
        p.paragraph_format.space_after = Pt(8)
        for i, line in enumerate(lines):
            if i > 0:
                p.add_run().add_break()
            for segment, is_bold, is_em in split_emphasis(line):
                if not segment:
                    continue
                r = p.add_run(segment)
                r.italic = is_em
                r.bold = is_bold
                r.font.size = Pt(size)

    HEADING_STYLE = {
        1: dict(size=17, bold=True, space_before=0, space_after=14),
        2: dict(size=13.5, bold=True, space_before=16, space_after=10),
        3: dict(size=11.5, bold=True, space_before=12, space_after=6),
    }

    # Portada
    add(header[0], size=13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
    add(header[1], size=11, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
    add(header[2], size=11, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16)
    add(header[3], size=13, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=20)
    add(header[4], size=10, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)
    add(header[5], size=10, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)
    doc.add_page_break()

    for b in blocks:
        if b.kind == "heading":
            if b.level == 1:
                doc.add_page_break()
            st = HEADING_STYLE[b.level]
            add(b.lines[0], **st)
        else:
            align = None if len(b.lines) > 1 else WD_ALIGN_PARAGRAPH.JUSTIFY
            add_multiline(b.lines, align=align)

    doc.save(out_path)


# ---------------------------------------------------------------------------
# EPUB
# ---------------------------------------------------------------------------

def build_epub(header, blocks, out_path: Path):
    from ebooklib import epub

    book = epub.EpubBook()
    book.set_identifier("ehi-camara-edicion-integral")
    book.set_title(header[2])
    book.set_language("es")
    book.add_author(header[3])

    css = epub.EpubItem(
        uid="style", file_name="style/main.css", media_type="text/css",
        content=(
            "body{font-family:Georgia,'Liberation Serif',serif;line-height:1.55;"
            "margin:1em 2em;color:#1a1a1a;}"
            "h1{font-size:1.5em;margin-top:2.2em;page-break-before:always;}"
            "h2{font-size:1.2em;margin-top:1.5em;}"
            "h3{font-size:1.05em;margin-top:1.2em;}"
            "p{margin:0 0 0.9em 0;text-align:justify;}"
            ".cover{text-align:center;}"
            ".cover .kicker{font-style:italic;}"
            ".cover .title{font-size:1.8em;font-weight:bold;margin:0.6em 0;}"
        ),
    )
    book.add_item(css)

    def inline_html(text: str) -> str:
        out = []
        for segment, is_bold, is_em in split_emphasis(text):
            escaped = esc_html(segment)
            if is_bold:
                escaped = f"<strong>{escaped}</strong>"
            if is_em:
                escaped = f"<em>{escaped}</em>"
            out.append(escaped)
        return "".join(out)

    html_parts = [
        '<div class="cover">',
        f'<p class="kicker">{esc_html(header[0])}<br/>{esc_html(header[1])}<br/>{esc_html(header[2])}</p>',
        f'<p>{esc_html(header[3])}</p>',
        f'<p class="kicker">{esc_html(header[4])}<br/>{esc_html(header[5])}</p>',
        "</div>",
    ]

    for b in blocks:
        if b.kind == "heading":
            tag = f"h{b.level}"
            html_parts.append(f"<{tag}>{esc_html(b.lines[0])}</{tag}>")
        else:
            html_parts.append("<p>" + "<br/>".join(inline_html(l) for l in b.lines) + "</p>")

    chapter = epub.EpubHtml(title=header[2], file_name="content.xhtml", lang="es")
    chapter.content = "<html><body>" + "\n".join(html_parts) + "</body></html>"
    chapter.add_item(css)
    book.add_item(chapter)
    book.toc = (epub.Link("content.xhtml", header[2], "content"),)
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = ["nav", chapter]
    epub.write_epub(str(out_path), book)


# ---------------------------------------------------------------------------
# PDF
# ---------------------------------------------------------------------------

def build_pdf(header, blocks, out_path: Path):
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak

    FONT_DIR = Path("/usr/share/fonts/truetype/liberation")
    try:
        pdfmetrics.registerFont(TTFont("Serif", str(FONT_DIR / "LiberationSerif-Regular.ttf")))
        pdfmetrics.registerFont(TTFont("Serif-Bold", str(FONT_DIR / "LiberationSerif-Bold.ttf")))
        pdfmetrics.registerFont(TTFont("Serif-Italic", str(FONT_DIR / "LiberationSerif-Italic.ttf")))
    except Exception:
        pass  # already registered by a prior call in the same process

    def render(text: str) -> str:
        out = []
        for segment, is_bold, is_em in split_emphasis(text):
            escaped = segment.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            if is_bold:
                escaped = f"<b>{escaped}</b>"
            if is_em:
                escaped = f"<i>{escaped}</i>"
            out.append(escaped)
        return "".join(out)

    kicker = ParagraphStyle("kicker", fontName="Serif-Italic", fontSize=11, alignment=TA_CENTER, leading=15)
    pdftitle = ParagraphStyle("pdftitle", fontName="Serif-Bold", fontSize=22, alignment=TA_CENTER, leading=28, spaceBefore=14, spaceAfter=14)
    author = ParagraphStyle("author", fontName="Serif", fontSize=13, alignment=TA_CENTER, spaceAfter=22)
    h1 = ParagraphStyle("h1", fontName="Serif-Bold", fontSize=17, spaceBefore=0, spaceAfter=16, leading=21)
    h2 = ParagraphStyle("h2", fontName="Serif-Bold", fontSize=13.5, spaceBefore=16, spaceAfter=10, leading=17)
    h3 = ParagraphStyle("h3", fontName="Serif-Bold", fontSize=11.5, spaceBefore=12, spaceAfter=6, leading=15)
    body = ParagraphStyle("body", fontName="Serif", fontSize=11, alignment=TA_JUSTIFY, leading=16, spaceAfter=10)
    poem = ParagraphStyle("poem", fontName="Serif-Italic", fontSize=11, alignment=TA_LEFT, leading=16, spaceAfter=10)

    doc = SimpleDocTemplate(
        str(out_path), pagesize=LETTER,
        leftMargin=2.8 * cm, rightMargin=2.8 * cm, topMargin=2.5 * cm, bottomMargin=2.5 * cm,
    )

    story = [Spacer(1, 3 * cm)]
    story.append(Paragraph(f"{header[0]}<br/>{header[1]}<br/>{header[2]}", kicker))
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph(header[3], author))
    story.append(Paragraph(f"{header[4]}<br/>{header[5]}", kicker))
    story.append(PageBreak())

    for b in blocks:
        if b.kind == "heading":
            if b.level == 1:
                story.append(PageBreak())
                story.append(Paragraph(render(b.lines[0]), h1))
            elif b.level == 2:
                story.append(Paragraph(render(b.lines[0]), h2))
            else:
                story.append(Paragraph(render(b.lines[0]), h3))
        else:
            st = poem if len(b.lines) > 1 else body
            story.append(Paragraph("<br/>".join(render(l) for l in b.lines), st))

    doc.build(story)
