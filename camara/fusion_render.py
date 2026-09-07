"""Renderizadores docx/epub/pdf para las variaciones de cámara y la
Edición de cámara integral.

Trabaja sobre listas de FBlock (build_fusion.FBlock): kind "heading" con
level 1/2/3, o kind "para" con líneas (una sola línea = párrafo normal que
se envuelve; varias líneas = verso, se preservan los saltos). Reutiliza
split_emphasis de build_camara.py para *cursiva* y **negrita** en línea.

Los encabezados de nivel 1 (movimientos / partes) alimentan un índice real
en las tres salidas: estilos de título de Word (navegables en el panel de
Word), tabla de contenidos paginada en el pdf (reportlab TableOfContents),
y navegación multi-entrada en el epub.
Los versos (bloques de varias líneas) admiten sangría espacial: cada línea
de origen puede empezar con espacios en pares (2 espacios = 1 nivel), que
split_verse_line() traduce a indentación tipográfica real en cada formato
en vez de dejarlos como espacios literales.
"""
from __future__ import annotations

from pathlib import Path

from build_camara import split_emphasis


def esc_html(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def level1_titles(blocks) -> list[str]:
    return [b.lines[0] for b in blocks if b.kind == "heading" and b.level == 1]


def split_verse_line(line: str) -> tuple[int, str]:
    """('  texto' -> (1, 'texto')); 2 espacios de cabecera = 1 nivel de sangría."""
    stripped = line.lstrip(" ")
    spaces = len(line) - len(stripped)
    return spaces // 2, stripped


def split_heading(text: str) -> tuple[str, str | None]:
    """"OBERTURA — La costumbre del agua" -> ("OBERTURA", "La costumbre del
    agua"). Sin em-dash (títulos de libro tipo "EL ESPEJO SIN PROFUNDIDAD"),
    devuelve el texto entero como kicker y sin subtítulo."""
    if " — " in text:
        kicker, subtitle = text.split(" — ", 1)
        return kicker.strip(), subtitle.strip()
    return text, None


def _tracked_title_class():
    """Fábrica de la clase TrackedTitle: reportlab se importa aquí (de forma
    perezosa, como el resto de imports de reportlab en este módulo) en vez
    de a nivel de módulo, para no exigir la dependencia a quien solo use
    build_docx/build_epub."""
    from reportlab.platypus import Flowable
    from reportlab.pdfbase.pdfmetrics import stringWidth

    class TrackedTitle(Flowable):
        """Título centrado con espaciado entre letras real, dibujado
        carácter a carácter con canvas.drawString. Insertar espacios en un
        Paragraph para simular tracking resultó no ser fiable: reportlab,
        con estas fuentes TTF, a veces funde todo el texto sin previo
        aviso —no solo con letras acentuadas, también con "Nota del
        autor"—, dependiendo del ancho disponible y de qué se haya dibujado
        antes en el mismo documento. Dibujar los glifos a mano evita ese
        motor por completo."""

        def __init__(self, text, fontName, fontSize, color, tracking=2.2,
                     spaceBefore=0, spaceAfter=0):
            Flowable.__init__(self)
            self.text = text
            self.fontName = fontName
            self.fontSize = fontSize
            self.color = color
            self.tracking = tracking
            self.spaceBefore = spaceBefore
            self.spaceAfter = spaceAfter
            self._avail_width = 0
            self._height = fontSize * 1.25
            self._char_widths = []
            self._text_width = 0
            self._draw_font_size = fontSize
            self._draw_tracking = tracking

        def wrap(self, availWidth, availHeight):
            self._avail_width = availWidth
            n_gaps = max(0, len(self.text) - 1)
            target = max(1, availWidth - 2)  # 2pt de margen de seguridad

            font_size = self.fontSize
            tracking = self.tracking
            raw_width = sum(stringWidth(ch, self.fontName, font_size) for ch in self.text)
            total = raw_width + tracking * n_gaps

            # Si con el tracking pedido no cabe, se reduce el tracking...
            if total > target and n_gaps:
                tracking = max(0, (target - raw_width) / n_gaps)
                total = raw_width + tracking * n_gaps
            # ...y si ni sin tracking cabe (título largo en columna estrecha,
            # p. ej. "Notas y fuentes, capítulo a capítulo" en el 5x8), se
            # encoge la letra para que no se salga del margen.
            if total > target and raw_width > 0:
                scale = target / raw_width
                font_size = font_size * scale
                tracking = 0
                raw_width = sum(stringWidth(ch, self.fontName, font_size) for ch in self.text)
                total = raw_width

            self._draw_font_size = font_size
            self._draw_tracking = tracking
            self._char_widths = [stringWidth(ch, self.fontName, font_size) for ch in self.text]
            self._text_width = total
            self._height = max(self._height, font_size * 1.25)
            return availWidth, self._height

        def drawOn(self, canv, x, y, _sW=0):
            canv.saveState()
            canv.setFont(self.fontName, self._draw_font_size)
            canv.setFillColor(self.color)
            cx = x + (self._avail_width - self._text_width) / 2.0
            cy = y + self._height * 0.22
            for ch, w in zip(self.text, self._char_widths):
                canv.drawString(cx, cy, ch)
                cx += w + self._draw_tracking
            canv.restoreState()

        def getPlainText(self):
            return self.text

        def split(self, availWidth, availHeight):
            return [self]

    return TrackedTitle


# ---------------------------------------------------------------------------
# DOCX
# ---------------------------------------------------------------------------

def build_docx(header, blocks, out_path: Path, index_pages=None):
    from docx import Document
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.shared import Pt, Cm, RGBColor
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement

    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Garamond"
    style.font.size = Pt(11)
    for section in doc.sections:
        section.left_margin = Cm(2.8)
        section.right_margin = Cm(2.8)
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)

    INK = RGBColor(0x2A, 0x24, 0x1C)
    RULE = RGBColor(0x9C, 0x8A, 0x6A)
    CREAM = "FAF7F0"

    # Fondo de página cálido (Word lo muestra en pantalla; la impresión de
    # fondos de página es una opción del usuario en Word, no del documento).
    bg = OxmlElement("w:background")
    bg.set(qn("w:color"), CREAM)
    doc.element.insert(0, bg)

    def add(text, *, size=11, bold=False, italic=False, align=None,
            space_before=0, space_after=8, color=None, style_name=None,
            tracking=None):
        p = doc.add_paragraph()
        if style_name is not None:
            p.style = doc.styles[style_name]
        if align is not None:
            p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(text)
        r.bold = bold
        r.italic = italic
        r.font.size = Pt(size)
        if color is not None:
            r.font.color.rgb = color
        if tracking is not None:
            rPr = r._element.get_or_add_rPr()
            spacing = OxmlElement("w:spacing")
            spacing.set(qn("w:val"), str(tracking))
            rPr.append(spacing)
        return p

    def add_rule(p, color=RULE, size_eighths=4, space_pt=6):
        """Añade un filete horizontal bajo el párrafo p (borde inferior)."""
        pPr = p._p.get_or_add_pPr()
        pBdr = OxmlElement("w:pBdr")
        bottom = OxmlElement("w:bottom")
        bottom.set(qn("w:val"), "single")
        bottom.set(qn("w:sz"), str(size_eighths))
        bottom.set(qn("w:space"), str(space_pt))
        bottom.set(qn("w:color"), "%02X%02X%02X" % (color[0], color[1], color[2]))
        pBdr.append(bottom)
        pPr.append(pBdr)

    def add_multiline(lines, *, align=None, size=11, first_line_indent=None):
        p = doc.add_paragraph()
        if align is not None:
            p.alignment = align
        p.paragraph_format.space_after = Pt(0)
        if first_line_indent is not None:
            p.paragraph_format.first_line_indent = Cm(first_line_indent)
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

    def add_verse(lines, *, size=11, unit_cm=0.55, align=None):
        """Un párrafo por verso, con sangría real según split_verse_line()."""
        n = len(lines)
        for i, raw in enumerate(lines):
            level, text = split_verse_line(raw)
            p = doc.add_paragraph()
            if align is not None:
                p.alignment = align
            p.paragraph_format.left_indent = Cm(unit_cm * level)
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0 if i < n - 1 else 8)
            for segment, is_bold, is_em in split_emphasis(text):
                if not segment:
                    continue
                r = p.add_run(segment)
                r.italic = is_em
                r.bold = is_bold
                r.font.size = Pt(size)

    HEADING_STYLE = {
        1: dict(size=17, bold=True, space_before=0, space_after=8, align=WD_ALIGN_PARAGRAPH.CENTER),
        2: dict(size=13.5, bold=True, italic=True, space_before=20, space_after=14,
                align=WD_ALIGN_PARAGRAPH.CENTER),
        3: dict(size=11.5, bold=True, space_before=14, space_after=8, align=WD_ALIGN_PARAGRAPH.CENTER),
    }
    WORD_STYLE = {1: "Heading 1", 2: "Heading 2", 3: "Heading 3"}

    # --- Portada ---------------------------------------------------------
    doc.add_paragraph().paragraph_format.space_after = Pt(70)  # empuja hacia el centro vertical
    add(header[0], size=12, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.CENTER,
        space_after=4, color=RULE)
    rule_p = add("", size=1, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=18)
    add_rule(rule_p, space_pt=1)
    add(header[2], size=27, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER,
        space_after=8, color=INK)
    add(header[1], size=12.5, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=26)
    add(header[3], size=13, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=10)
    if header[4]:
        add(header[4], size=10, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER,
            space_after=0, color=RULE)
    if header[5]:
        add(header[5], size=10, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER,
            space_after=0, color=RULE)
    doc.add_page_break()

    # --- Índice --------------------------------------------------------
    # index_pages: lista de (título_de_página, [entradas]); por defecto una
    # sola página con todos los encabezados de nivel 1 (comportamiento previo).
    pages = index_pages if index_pages is not None else [("Índice", level1_titles(blocks))]
    for page_title, entries in pages:
        if not entries:
            continue
        add(page_title, size=16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=22)
        for t in entries:
            add(t, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=9, color=INK)
        doc.add_page_break()

    # --- Cuerpo ------------------------------------------------------------
    seen_heading = False
    first_para = True
    for b in blocks:
        if b.kind == "heading":
            seen_heading = True
            first_para = True
            if b.level == 1:
                doc.add_page_break()
                doc.add_paragraph().paragraph_format.space_after = Pt(90)  # aire antes del título
                kicker_text, subtitle_text = split_heading(b.lines[0])
                st = HEADING_STYLE[1]
                # Word soporta espaciado entre letras real (w:spacing) sin
                # necesidad del truco de insertar espacios que usa el pdf.
                add(kicker_text, style_name=WORD_STYLE[1], tracking=30, **st)
                if subtitle_text:
                    add(subtitle_text, size=13, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER,
                        space_after=0, color=INK)
                doc.add_paragraph().paragraph_format.space_after = Pt(18)  # aire antes del cuerpo
            else:
                st = HEADING_STYLE[b.level]
                add(b.lines[0], style_name=WORD_STYLE[b.level], **st)
        elif b.kind == "image":
            doc.add_page_break()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.add_run().add_picture(b.lines[0], height=Cm(20))
        elif len(b.lines) > 1:
            is_dedication = not seen_heading
            if is_dedication:
                doc.add_paragraph().paragraph_format.space_after = Pt(220)
                add_verse(b.lines, align=WD_ALIGN_PARAGRAPH.RIGHT)
            else:
                add_verse(b.lines)
        else:
            add_multiline(b.lines, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
                          first_line_indent=None if first_para else 0.5)
            first_para = False

    doc.save(out_path)


# ---------------------------------------------------------------------------
# EPUB
# ---------------------------------------------------------------------------

def build_epub(header, blocks, out_path: Path):
    from ebooklib import epub

    book = epub.EpubBook()
    book.set_identifier("ehi-camara-" + header[2].lower().replace(" ", "-"))
    book.set_title(header[2])
    book.set_language("es")
    book.add_author(header[3])

    css = epub.EpubItem(
        uid="style", file_name="style/main.css", media_type="text/css",
        content=(
            "body{font-family:Georgia,'Liberation Serif',serif;line-height:1.55;"
            "margin:1em 2em;color:#1a1a1a;background:#faf7f0;}"
            "h1{font-size:1.15em;font-weight:bold;letter-spacing:.14em;text-transform:uppercase;"
            "text-align:center;margin-top:3em;margin-bottom:0.3em;page-break-before:always;}"
            "p.h1-subtitle{font-style:italic;text-align:center;font-size:1.05em;"
            "margin:0 0 2em 0;}"
            "h2{font-size:1.15em;font-style:italic;text-align:center;margin-top:2em;margin-bottom:1.2em;}"
            "h3{font-size:1.05em;text-align:center;margin-top:1.4em;margin-bottom:0.8em;}"
            "p{margin:0;text-indent:1.3em;text-align:justify;}"
            "p.noindent{text-indent:0;}"
            ".cover{text-align:center;padding-top:3em;}"
            ".cover .kicker{font-style:italic;letter-spacing:.08em;"
            "text-transform:uppercase;font-size:.85em;color:#6b5d3f;}"
            ".cover .rule{border:none;border-top:1px solid #9c8a6a;"
            "width:5em;margin:0.9em auto;}"
            ".cover .title{font-size:2em;font-weight:bold;margin:0.3em 0 0.2em;}"
            ".cover .subtitle{font-style:italic;margin:0 0 1.2em;}"
            ".cover .author{font-size:1.05em;margin-top:0.6em;}"
            ".dedication{text-align:right;margin-top:8em;font-style:italic;}"
            ".dedication p{text-indent:0;text-align:right;margin:0;}"
            "nav#toc ol{list-style:none;padding-left:0;}"
            "nav#toc li{margin:0.5em 0;text-align:center;}"
            "nav#toc a{text-decoration:none;color:#1a1a1a;}"
            ".verse{margin:0 0 0.9em 0;font-style:italic;}"
            ".verse p{margin:0;text-indent:0;text-align:left;}"
            ".v0{margin-left:0}.v1{margin-left:1.3em}.v2{margin-left:2.6em}"
            ".v3{margin-left:3.9em}.v4{margin-left:5.2em}.v5{margin-left:6.5em}"
            ".v6{margin-left:7.8em}"
            ".mangapage{text-align:center;page-break-before:always;margin:0;}"
            ".mangapage img{max-width:100%;max-height:95vh;}"
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
        f'<p class="kicker">{esc_html(header[0])}</p>',
        '<hr class="rule"/>',
        f'<p class="title">{esc_html(header[2])}</p>',
        f'<p class="subtitle">{esc_html(header[1])}</p>',
        f'<p class="author">{esc_html(header[3])}</p>',
    ]
    if header[4]:
        html_parts.append(f'<p class="kicker">{esc_html(header[4])}</p>')
    if header[5]:
        html_parts.append(f'<p class="kicker">{esc_html(header[5])}</p>')
    html_parts.append("</div>")

    # Anclas por encabezado de nivel 1, para un índice navegable de verdad.
    toc_links: list = []
    h1_seen = 0
    img_seen = 0
    seen_heading = False
    first_para = True
    for b in blocks:
        if b.kind == "heading":
            seen_heading = True
            first_para = True
            if b.level == 1:
                h1_seen += 1
                anchor = f"h1-{h1_seen}"
                kicker_text, subtitle_text = split_heading(b.lines[0])
                html_parts.append(f'<h1 id="{anchor}">{esc_html(kicker_text)}</h1>')
                if subtitle_text:
                    html_parts.append(f'<p class="h1-subtitle">{esc_html(subtitle_text)}</p>')
                toc_links.append(epub.Link(f"content.xhtml#{anchor}", b.lines[0], anchor))
            else:
                tag = f"h{b.level}"
                html_parts.append(f"<{tag}>{esc_html(b.lines[0])}</{tag}>")
        elif b.kind == "image":
            img_seen += 1
            src_path = Path(b.lines[0])
            item_name = f"images/{img_seen:02d}_{src_path.name}"
            img_item = epub.EpubImage(
                uid=f"img{img_seen}", file_name=item_name,
                media_type="image/jpeg", content=src_path.read_bytes(),
            )
            book.add_item(img_item)
            html_parts.append(f'<div class="mangapage"><img src="{item_name}" alt="Página de manga"/></div>')
        elif len(b.lines) > 1:
            is_dedication = not seen_heading
            div_class = "dedication" if is_dedication else "verse"
            html_parts.append(f'<div class="{div_class}">')
            for raw in b.lines:
                level, text = split_verse_line(raw)
                cls = "" if is_dedication else f' class="v{min(level, 6)}"'
                html_parts.append(f'<p{cls}>{inline_html(text)}</p>')
            html_parts.append("</div>")
        else:
            cls = ' class="noindent"' if first_para else ""
            html_parts.append(f"<p{cls}>" + inline_html(b.lines[0]) + "</p>")
            first_para = False

    chapter = epub.EpubHtml(title=header[2], file_name="content.xhtml", lang="es")
    chapter.content = "<html><body>" + "\n".join(html_parts) + "</body></html>"
    chapter.add_item(css)
    book.add_item(chapter)
    book.toc = tuple(toc_links) if toc_links else (epub.Link("content.xhtml", header[2], "content"),)
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = ["nav", chapter]
    epub.write_epub(str(out_path), book)


# ---------------------------------------------------------------------------
# PDF
# ---------------------------------------------------------------------------

def build_pdf(header, blocks, out_path: Path, pagesize=None, margins_in=None, extra_index_pages=None,
              poem_own_page=False, manga_margin_in=None, mirror_margins_in=None):
    """pagesize: (width, height) en puntos reportlab (usa reportlab.lib.units.inch
    para pasar pulgadas), por defecto carta. margins_in: pulgadas de margen
    uniforme (izq/dcha/arriba/abajo), por defecto 1.1cm/2.5cm según el original.
    poem_own_page: si True, cada "## Poema: ..." abre página propia, centrado
    horizontal y verticalmente. manga_margin_in: margen (pulgadas) específico
    para las páginas de imagen (cómic), más ajustado que el del texto para
    aprovechar mejor la página; None = usa el mismo margen que el resto.
    mirror_margins_in: (gutter_in, outside_in) en pulgadas — si se da, cada
    página usa márgenes reflejados según sea impar (recto) o par (verso),
    con el margen mayor (gutter) siempre hacia el lomo, en vez del margen
    simétrico de margins_in. Necesario para que un servicio de impresión
    como KDP no marque las páginas pares como fuera de margen: el margen
    interior mínimo que exigen crece con el número de páginas del libro."""
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.colors import HexColor
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import cm, inch
    from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import (
        BaseDocTemplate, PageTemplate, Frame, NextPageTemplate,
        Paragraph, Spacer, PageBreak, HRFlowable,
    )
    from reportlab.platypus.tableofcontents import TableOfContents

    FONT_DIR = Path("/usr/share/fonts/truetype/liberation")
    try:
        pdfmetrics.registerFont(TTFont("Serif", str(FONT_DIR / "LiberationSerif-Regular.ttf")))
        pdfmetrics.registerFont(TTFont("Serif-Bold", str(FONT_DIR / "LiberationSerif-Bold.ttf")))
        pdfmetrics.registerFont(TTFont("Serif-Italic", str(FONT_DIR / "LiberationSerif-Italic.ttf")))
        pdfmetrics.registerFont(TTFont("Serif-BoldItalic", str(FONT_DIR / "LiberationSerif-BoldItalic.ttf")))
    except Exception:
        pass  # already registered by a prior call in the same process
    # Sin esto, las marcas <i>/<b> dentro de un Paragraph cuyo estilo base es
    # "Serif" no saben a qué fuente cambiar y se quedan en redonda: el
    # glosario (y cualquier *cursiva* dentro de un párrafo normal) no se
    # distinguía por esto, no por faltar la marca en el texto fuente.
    pdfmetrics.registerFontFamily(
        "Serif", normal="Serif", bold="Serif-Bold",
        italic="Serif-Italic", boldItalic="Serif-BoldItalic",
    )

    INK = HexColor("#2a241c")
    RULE = HexColor("#9c8a6a")
    CREAM = HexColor("#faf7f0")

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

    kicker = ParagraphStyle("kicker", fontName="Serif-Italic", fontSize=11, alignment=TA_CENTER,
                             leading=15, textColor=RULE)
    pdftitle = ParagraphStyle("pdftitle", fontName="Serif-Bold", fontSize=25, alignment=TA_CENTER,
                               leading=30, spaceBefore=10, spaceAfter=10, textColor=INK)
    author = ParagraphStyle("author", fontName="Serif", fontSize=13, alignment=TA_CENTER, spaceAfter=22)
    idx_title = ParagraphStyle("idx_title", fontName="Serif-Bold", fontSize=16, alignment=TA_CENTER,
                                spaceBefore=0, spaceAfter=20)
    TrackedTitle = _tracked_title_class()
    h1_subtitle = ParagraphStyle("h1_subtitle", fontName="Serif-Italic", fontSize=13.5, alignment=TA_CENTER,
                                  spaceBefore=0, spaceAfter=0, leading=18, textColor=INK)
    h2 = ParagraphStyle("h2", fontName="Serif-BoldItalic", fontSize=13.5, alignment=TA_CENTER,
                         spaceBefore=22, spaceAfter=16, leading=17, textColor=INK)
    h3 = ParagraphStyle("h3", fontName="Serif-Bold", fontSize=11.5, alignment=TA_CENTER,
                         spaceBefore=16, spaceAfter=10, leading=15, textColor=INK)
    body = ParagraphStyle("body", fontName="Serif", fontSize=11, alignment=TA_JUSTIFY, leading=16, spaceAfter=0)
    body_indent = ParagraphStyle("body_indent", parent=body, firstLineIndent=16)
    poem = ParagraphStyle("poem", fontName="Serif-Italic", fontSize=11, alignment=TA_LEFT, leading=16, spaceAfter=10)
    poem_center = ParagraphStyle("poem_center", parent=poem, alignment=TA_CENTER)
    dedication = ParagraphStyle("dedication", parent=poem, alignment=TA_RIGHT)
    # Título de poema en su propia página: en negrita redonda (no cursiva),
    # deliberadamente independiente de "h2" para no heredar su cursiva.
    h2_center = ParagraphStyle("h2_center", fontName="Serif-Bold", fontSize=13.5, alignment=TA_CENTER,
                                spaceBefore=0, spaceAfter=10, leading=17, textColor=INK)

    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle("tocH1", fontName="Serif", fontSize=12.5, leading=20,
                        alignment=TA_CENTER, textColor=INK),
    ]
    toc.dotsMinLevel = -1  # sin puntos guía: entradas centradas, más limpio

    mirror = mirror_margins_in is not None

    class BookDocTemplate(BaseDocTemplate):
        _pending_template = None

        def handle_nextPageTemplate(self, pt):
            # "Normal"/"Manga" son nombres lógicos que siempre se resuelven
            # en _setPageTemplate según la paridad real de la página en el
            # momento de renderizarla, no aquí: entre dos "NextPageTemplate"
            # puede haber muchas páginas de texto corrido sin ningún
            # flowable que lo vuelva a pedir. Sin mirror_margins_in, "-Odd"
            # y "-Even" apuntan al mismo frame, así que resolverlo siempre
            # así no cambia nada visualmente.
            if pt in ("Normal", "Manga"):
                self._pending_template = pt
            else:
                BaseDocTemplate.handle_nextPageTemplate(self, pt)

        def _setPageTemplate(self):
            base = self._pending_template or "Normal"
            suffix = "Even" if (self.page + 1) % 2 == 0 else "Odd"
            tid = f"{base}-{suffix}"
            for t in self.pageTemplates:
                if t.id == tid:
                    self.pageTemplate = t
                    return
            raise ValueError(f"No existe la plantilla de página {tid!r}")

        def afterFlowable(self, flowable):
            if getattr(flowable, "_toc_entry", False):
                # _toc_text: título completo para el índice, cuando el
                # flowable visible solo pinta el kicker (p. ej. "OBERTURA"
                # sin su subtítulo "La costumbre del agua").
                text = getattr(flowable, "_toc_text", None) or flowable.getPlainText()
                key = getattr(flowable, "_toc_key")
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(text, key, level=0, closed=False)
                self.notify("TOCEntry", (0, text, self.page, key))

    page = pagesize or LETTER

    def draw_bg(canvas, _doc):
        canvas.saveState()
        canvas.setFillColor(CREAM)
        canvas.rect(0, 0, page[0], page[1], stroke=0, fill=1)
        canvas.restoreState()

    if margins_in is not None:
        side_margin = margins_in * inch
    else:
        side_margin = 2.8 * cm
    top_margin = 2.5 * cm if margins_in is None else margins_in * inch

    doc = BookDocTemplate(str(out_path), pagesize=page)

    if mirror:
        # mirror_margins_in = (gutter, outside), en pulgadas. El margen
        # grande (gutter) va siempre hacia el lomo: a la izquierda en
        # páginas impares (recto), a la derecha en las pares (verso). Sin
        # esto, un servicio de impresión como KDP marca todas las páginas
        # pares como fuera de margen, porque el margen interior no crece
        # con el número de páginas del libro.
        gutter_in, outside_in = mirror_margins_in
        gutter, outside = gutter_in * inch, outside_in * inch
        text_avail_w = page[0] - gutter - outside
        odd_frame = Frame(gutter, top_margin, text_avail_w, page[1] - 2 * top_margin, id="normal-odd")
        even_frame = Frame(outside, top_margin, text_avail_w, page[1] - 2 * top_margin, id="normal-even")

        manga_outside = manga_margin_in * inch if manga_margin_in is not None else outside
        manga_top = manga_margin_in * inch if manga_margin_in is not None else top_margin
        manga_avail_w = page[0] - gutter - manga_outside
        manga_avail_h = page[1] - 2 * manga_top
        manga_odd = Frame(gutter, manga_top, manga_avail_w, manga_avail_h, id="manga-odd",
                          leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        manga_even = Frame(manga_outside, manga_top, manga_avail_w, manga_avail_h, id="manga-even",
                           leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        doc.addPageTemplates([
            PageTemplate(id="Normal-Odd", frames=[odd_frame], onPage=draw_bg),
            PageTemplate(id="Normal-Even", frames=[even_frame], onPage=draw_bg),
            PageTemplate(id="Manga-Odd", frames=[manga_odd], onPage=draw_bg),
            PageTemplate(id="Manga-Even", frames=[manga_even], onPage=draw_bg),
        ])
    else:
        text_avail_w = page[0] - 2 * side_margin
        normal_frame = Frame(side_margin, top_margin, text_avail_w,
                             page[1] - 2 * top_margin, id="normal")
        manga_side = manga_margin_in * inch if manga_margin_in is not None else side_margin
        manga_top = manga_margin_in * inch if manga_margin_in is not None else top_margin
        manga_avail_w = page[0] - 2 * manga_side
        manga_avail_h = page[1] - 2 * manga_top
        manga_frame = Frame(manga_side, manga_top, manga_avail_w, manga_avail_h, id="manga",
                            leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        doc.addPageTemplates([
            PageTemplate(id="Normal-Odd", frames=[normal_frame], onPage=draw_bg),
            PageTemplate(id="Normal-Even", frames=[normal_frame], onPage=draw_bg),
            PageTemplate(id="Manga-Odd", frames=[manga_frame], onPage=draw_bg),
            PageTemplate(id="Manga-Even", frames=[manga_frame], onPage=draw_bg),
        ])

    story = [Spacer(1, page[1] * 0.16)]
    story.append(Paragraph(header[0], kicker))
    story.append(HRFlowable(width="15%", thickness=0.75, color=RULE, spaceBefore=10, spaceAfter=14,
                             hAlign="CENTER"))
    story.append(Paragraph(header[2], pdftitle))
    story.append(Paragraph(f"<i>{header[1]}</i>", kicker))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(header[3], author))
    if header[4] or header[5]:
        story.append(Paragraph(f"{header[4]}<br/>{header[5]}", kicker))
    story.append(PageBreak())

    # Páginas de índice estáticas (sin numeración propia, p. ej. un índice
    # general a nivel de "libro" que precede al índice detallado y paginado).
    plain_entry = ParagraphStyle("plain_entry", fontName="Serif", fontSize=12,
                                  alignment=TA_CENTER, spaceAfter=9, textColor=INK)
    for page_title, entries in (extra_index_pages or []):
        if not entries:
            continue
        story.append(Paragraph(page_title, idx_title))
        for t in entries:
            story.append(Paragraph(render(t), plain_entry))
        story.append(PageBreak())

    titles = level1_titles(blocks)
    if titles:
        story.append(Paragraph("Índice", idx_title))
        story.append(toc)
        story.append(PageBreak())

    text_avail_h = page[1] - 2 * top_margin

    def is_poem_heading(h):
        # "## Poema: ..." en el manuscrito, o "### Poema: ..." en los libros
        # empalmados (poemas engastados dentro de un Ensayo/EPÍLOGO).
        return h.kind == "heading" and h.level in (2, 3) and h.lines[0].startswith("Poema:")

    h1_seen = 0
    skip_to = -1
    seen_heading = False
    first_para = True
    for bi, b in enumerate(blocks):
        if bi <= skip_to:
            continue
        if b.kind == "heading":
            seen_heading = True
            first_para = True
            is_poem = poem_own_page and is_poem_heading(b)
            if b.level == 1:
                h1_seen += 1
                story.append(NextPageTemplate("Normal"))
                story.append(PageBreak())
                story.append(Spacer(1, text_avail_h * 0.15))
                kicker_text, subtitle_text = split_heading(b.lines[0])
                p = TrackedTitle(kicker_text, "Serif-Bold", 15.5, INK, spaceAfter=8)
                p._toc_entry = True
                p._toc_key = f"h1-{h1_seen}"
                p._toc_text = b.lines[0]
                story.append(p)
                if subtitle_text:
                    story.append(Paragraph(f"<i>{render(subtitle_text)}</i>", h1_subtitle))
                story.append(Spacer(1, 26))
            elif is_poem:
                # Recoge el/los bloques de verso que siguen, hasta el próximo
                # encabezado, para centrar el poema entero (título + versos)
                # vertical y horizontalmente en su propia página.
                verse_blocks = []
                j = bi + 1
                while j < len(blocks) and blocks[j].kind != "heading":
                    verse_blocks.append(blocks[j])
                    j += 1
                skip_to = j - 1
                # El "· · ·" que separa viñetas dentro de un Ensayo/EPÍLOGO no
                # pinta nada en una página propia ya delimitada por el salto:
                # se sigue saltando (skip_to no cambia) pero no se renderiza.
                if verse_blocks and verse_blocks[-1].lines == ["· · ·"]:
                    verse_blocks = verse_blocks[:-1]

                title_p = Paragraph(render(b.lines[0]), h2_center)
                line_ps = []
                for vb in verse_blocks:
                    m = len(vb.lines)
                    for i, raw in enumerate(vb.lines):
                        level, text = split_verse_line(raw)
                        line_style = ParagraphStyle(
                            f"versec_{id(vb)}_{i}", parent=poem_center,
                            leftIndent=level * 16, spaceAfter=(0 if i < m - 1 else 10),
                        )
                        line_ps.append(Paragraph(render(text), line_style))

                # Altura real (no una estimación de nº de líneas de origen):
                # un verso largo puede ajustarse a dos líneas visuales, y con
                # la estimación anterior el poema se centraba de más y la
                # última línea se salía a una página en blanco.
                content_h = title_p.wrap(text_avail_w, 10000)[1] + h2_center.spaceAfter
                for lp in line_ps:
                    content_h += lp.wrap(text_avail_w, 10000)[1] + lp.style.spaceAfter
                top_space = max(18, (text_avail_h - content_h) / 2)

                story.append(NextPageTemplate("Normal"))
                story.append(PageBreak())
                story.append(Spacer(1, top_space))
                story.append(title_p)
                story.extend(line_ps)
                # Salto de página tras el poema, salvo que lo que sigue ya
                # fuerce su propio salto (otro poema, o un encabezado de
                # nivel 1): si no, se duplicaría en una página en blanco.
                next_heading = blocks[j] if j < len(blocks) and blocks[j].kind == "heading" else None
                next_forces_break = next_heading is not None and (
                    next_heading.level == 1 or (poem_own_page and is_poem_heading(next_heading))
                )
                if not next_forces_break:
                    story.append(PageBreak())
            elif b.level == 2:
                story.append(Paragraph(render(b.lines[0]), h2))
            else:
                story.append(Paragraph(render(b.lines[0]), h3))
        elif b.kind == "image":
            from reportlab.platypus import Image
            from PIL import Image as PILImage
            story.append(NextPageTemplate("Manga"))
            story.append(PageBreak())
            img_w, img_h = PILImage.open(b.lines[0]).size
            scale = min(manga_avail_w / img_w, manga_avail_h / img_h)
            im = Image(b.lines[0], width=img_w * scale, height=img_h * scale)
            im.hAlign = "CENTER"
            story.append(im)
            story.append(NextPageTemplate("Normal"))
        elif len(b.lines) > 1:
            n = len(b.lines)
            is_dedication = not seen_heading
            if is_dedication:
                story.append(Spacer(1, text_avail_h * 0.38))
            for i, raw in enumerate(b.lines):
                level, text = split_verse_line(raw)
                parent_style = dedication if is_dedication else poem
                line_style = ParagraphStyle(
                    f"verse_{id(b)}_{i}", parent=parent_style,
                    leftIndent=level * 16, spaceAfter=(0 if i < n - 1 else 10),
                )
                story.append(Paragraph(render(text), line_style))
        else:
            style = body if first_para else body_indent
            story.append(Paragraph(render(b.lines[0]), style))
            first_para = False

    doc.multiBuild(story)
