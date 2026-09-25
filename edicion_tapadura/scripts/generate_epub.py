#!/usr/bin/env python3
"""
Generate the EPUB edition (Catalan / English / Spanish) of "El horizonte
interior" (edición de cámara ampliada) from the same markdown source used
for the hardcover interior, excluding the manga/comic adaptation.

Reuses generate_hardcover_pdf.py's markdown parser and language strings so
both editions always agree on content, chapter titles and front matter -
no separate content model to keep in sync by hand.

Usage:
    python3 edicion_tapadura/scripts/generate_epub.py --lang ca
    python3 edicion_tapadura/scripts/generate_epub.py --lang en
    python3 edicion_tapadura/scripts/generate_epub.py --lang es

Output:
    El_Horizonte_Interior_EPUB_<lang>.epub
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import pymupdf
from ebooklib import epub

SCRIPT_DIR = Path(__file__).resolve().parent
BASE = SCRIPT_DIR.parent
ROOT = BASE.parent
FONTS = BASE / "fonts"

sys.path.insert(0, str(SCRIPT_DIR))
import generate_hardcover_pdf as pdfgen  # reuses parse_markdown, LANG_STRINGS, get_movement_image

INPUT_MD = {
    "ca": BASE / "El_Horizonte_Interior_TAPADURA_ca.md",
    "en": BASE / "El_Horizonte_Interior_TAPADURA_en.md",
    "es": BASE / "El_Horizonte_Interior_TAPADURA_es.md",
}
COVER_PDF = {
    "ca": BASE / "El_Horizonte_Interior_TAPADURA_portada_ca.pdf",
    "en": BASE / "El_Horizonte_Interior_TAPADURA_portada_en.pdf",
    "es": BASE / "El_Horizonte_Interior_TAPADURA_portada_es.pdf",
}
EPUB_LANG = {"ca": "ca", "en": "en", "es": "es"}

BOOK_ID = {
    "ca": "el-horitzo-interior-ibb-2026-ca",
    "en": "the-inner-horizon-ibb-2026-en",
    "es": "el-horizonte-interior-ibb-2026-es",
}

FONT_FILES = {
    "SourceSerifPro-Regular.ttf": ("normal", "normal"),
    "SourceSerifPro-Bold.ttf": ("bold", "normal"),
    "SourceSerifPro-It.ttf": ("normal", "italic"),
}

CSS = """
@font-face { font-family: "Eco"; src: url("../fonts/SourceSerifPro-Regular.ttf"); font-weight: normal; font-style: normal; }
@font-face { font-family: "Eco"; src: url("../fonts/SourceSerifPro-Bold.ttf"); font-weight: bold; font-style: normal; }
@font-face { font-family: "Eco"; src: url("../fonts/SourceSerifPro-It.ttf"); font-weight: normal; font-style: italic; }

body { font-family: "Eco", serif; color: #22282c; line-height: 1.55; }
h1 { font-size: 1.55em; color: #22282c; margin-top: 1.6em; margin-bottom: 0.6em; page-break-before: always; }
h3 { font-size: 1.05em; color: #22282c; margin-top: 1.3em; margin-bottom: 0.5em; }
p { text-align: justify; margin: 0 0 0.9em 0; }
.poem { text-align: center; font-style: italic; margin: 1.6em 0; }
.plate { text-align: center; margin: 0 0 1.4em 0; page-break-before: always; }
.plate img { max-width: 100%; height: auto; }
.titlepage { text-align: center; margin-top: 30%; }
.titlepage .kicker { color: #3c6e71; font-style: italic; }
.titlepage .maintitle { font-size: 2em; font-weight: bold; margin: 0.4em 0; }
.titlepage .edition { color: #3c6e71; font-style: italic; }
.dedication, .colophon { text-align: center; font-style: italic; margin-top: 40%; }
"""


def to_xhtml(text: str) -> str:
    """reportlab-style markup -> XHTML: drop the Greek-glyph <font> fallback
    wrapper (keeping the character itself) and swap <b>/<i> for <strong>/<em>."""
    text = re.sub(r"<font[^>]*>", "", text)
    text = text.replace("</font>", "")
    text = text.replace("<b>", "<strong>").replace("</b>", "</strong>")
    text = text.replace("<i>", "<em>").replace("</i>", "</em>")
    return text


def group_chapters(blocks):
    """Splits the block list at each H2 (movement), the same boundary
    generate_hardcover_pdf.py uses for its chapter openers/TOC entries.
    Blocks before the first H2 (H1 title + its subtitle/author lines) are
    dropped, since the hand-built title page below covers them already."""
    first_h2 = next((idx for idx, b in enumerate(blocks) if b.type == "H2"), 0)
    blocks = blocks[first_h2:]

    chapters = []
    current_title, current_blocks = None, []
    for b in blocks:
        if b.type == "H2":
            if current_title is not None:
                chapters.append((current_title, current_blocks))
            current_title = pdfgen.clean_markup(b.content)
            current_blocks = []
        else:
            current_blocks.append(b)
    if current_title is not None:
        chapters.append((current_title, current_blocks))
    return chapters


def render_chapter_body(book, title: str, blist, img_uid_counter: list) -> str:
    parts = []

    image_path = pdfgen.get_movement_image(title)
    if image_path:
        img_name = f"plate_{img_uid_counter[0]:02d}.jpg"
        img_uid_counter[0] += 1
        with open(image_path, "rb") as f:
            data = f.read()
        book.add_item(epub.EpubImage(uid=img_name, file_name=f"images/{img_name}",
                                      media_type="image/jpeg", content=data))
        parts.append(f'<div class="plate"><img src="../images/{img_name}" alt=""/></div>')
        parts.append(f'<h1 style="page-break-before: avoid;">{to_xhtml(title)}</h1>')
    else:
        parts.append(f'<h1>{to_xhtml(title)}</h1>')

    i, n = 0, len(blist)
    while i < n:
        b = blist[i]
        if b.type == "H3":
            parts.append(f'<h3>{to_xhtml(b.content)}</h3>')
        elif b.type == "PARA":
            parts.append(f"<p>{to_xhtml(b.content)}</p>")
        elif b.type == "POEMLINE":
            lines = [to_xhtml(b.content)]
            while i + 1 < n and blist[i + 1].type == "POEMLINE":
                i += 1
                lines.append(to_xhtml(blist[i].content))
            parts.append('<div class="poem">' + "<br/>".join(lines) + "</div>")
        i += 1
    return "\n".join(parts)


def build_epub(lang: str) -> Path:
    S = pdfgen.LANG_STRINGS[lang]
    input_md = INPUT_MD[lang]
    if not input_md.exists():
        raise SystemExit(f"No encuentro {input_md}")

    blocks, detected_lang = pdfgen.parse_markdown(str(input_md))
    if detected_lang != lang:
        print(f"Aviso: frontmatter dice lang={detected_lang}, se esperaba {lang}")
    chapters = group_chapters(blocks)
    print(f"[{lang}] {len(chapters)} movimientos: {[c[0] for c in chapters]}")

    book = epub.EpubBook()
    book.set_identifier(BOOK_ID[lang])
    book.set_title(S["book_title"])
    book.set_language(EPUB_LANG[lang])
    book.add_author("Íñigo Barrera Barceló")

    css_item = epub.EpubItem(uid="style", file_name="styles/style.css",
                              media_type="text/css", content=CSS)
    book.add_item(css_item)

    def link_css(html_item):
        html_item.add_link(href="../styles/style.css", rel="stylesheet", type="text/css")

    for fname in FONT_FILES:
        with open(FONTS / fname, "rb") as f:
            data = f.read()
        book.add_item(epub.EpubItem(uid=fname, file_name=f"fonts/{fname}",
                                     media_type="application/x-font-ttf", content=data))

    # ---- cover image: rasterize the already-typeset front-cover PDF (with
    # title/author baked in as vector text) rather than the bare illustration ----
    cover_pdf = COVER_PDF[lang]
    if cover_pdf.exists():
        with pymupdf.open(cover_pdf) as doc:
            pix = doc[0].get_pixmap(dpi=300)
            cover_bytes = pix.tobytes("jpg")
        book.set_cover("images/cover.jpg", cover_bytes)
    else:
        print(f"Aviso: no encuentro {cover_pdf}, EPUB sin portada")

    # Mismo orden que el impreso: título, dedicatoria, índice.
    spine = []

    # ---- title page ----
    title_html = epub.EpubHtml(title=S["book_title"], file_name="text/title.xhtml",
                                lang=EPUB_LANG[lang])
    title_html.set_content(
        '<div class="titlepage">'
        f'<p class="kicker">{to_xhtml(S["title_sub"])}</p>'
        f'<p class="maintitle">{to_xhtml(S["book_title"])}</p>'
        f'<p class="edition">{to_xhtml(S["edition_sub"])}</p>'
        "<p>Íñigo Barrera Barceló</p>"
        "</div>"
    )
    link_css(title_html)
    book.add_item(title_html)
    spine.append(title_html)

    # ---- dedication ----
    ded_html = epub.EpubHtml(title="—", file_name="text/dedication.xhtml", lang=EPUB_LANG[lang])
    ded_html.set_content(
        '<div class="dedication"><p>' + "<br/>".join(to_xhtml(l) for l in S["dedication"]) + "</p></div>"
    )
    link_css(ded_html)
    book.add_item(ded_html)
    spine.append(ded_html)
    spine.append("nav")

    # ---- chapters ----
    toc_entries = []
    img_uid_counter = [0]
    for idx, (title, blist) in enumerate(chapters):
        fname = f"text/chap_{idx:02d}.xhtml"
        body = render_chapter_body(book, title, blist, img_uid_counter)
        ch_html = epub.EpubHtml(title=title, file_name=fname, lang=EPUB_LANG[lang])
        ch_html.set_content(body)
        link_css(ch_html)
        book.add_item(ch_html)
        spine.append(ch_html)
        toc_entries.append(ch_html)

    # ---- colophon ----
    col_html = epub.EpubHtml(title="—", file_name="text/colophon.xhtml", lang=EPUB_LANG[lang])
    col_html.set_content(
        '<div class="colophon"><p>' + "<br/>".join(to_xhtml(l) for l in S["colophon"]) + "</p></div>"
    )
    link_css(col_html)
    book.add_item(col_html)
    spine.append(col_html)

    book.toc = tuple(toc_entries)
    book.add_item(epub.EpubNcx())
    nav = epub.EpubNav()
    nav.add_link(href="styles/style.css", rel="stylesheet", type="text/css")
    book.add_item(nav)
    book.spine = spine

    out_path = BASE / f"El_Horizonte_Interior_EPUB_{lang}.epub"
    epub.write_epub(str(out_path), book)
    print(f"{out_path.relative_to(ROOT)}  —  {out_path.stat().st_size / 1024:.0f} KB")
    return out_path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["es", "ca", "en"], default=None,
                     help="Si se omite, genera los tres idiomas.")
    args = ap.parse_args()
    langs = [args.lang] if args.lang else ["ca", "en", "es"]
    for lang in langs:
        build_epub(lang)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
