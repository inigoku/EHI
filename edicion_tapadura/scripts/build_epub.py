# -*- coding: utf-8 -*-
import re
from ebooklib import epub

import build_blocks
import generate_book as gb
import fractal_chapter

blocks = build_blocks.blocks

# --- same content edits as the final PDF: drop "Lecturas compartidas", append the fractal chapter ---
del blocks[705:711]
before = blocks[662]["text"]
blocks[662]["text"] = before.replace(
    " · Lecturas</i> <i>compartidas — quince ficciones, una misma pregunta</i>", "</i>"
)
assert blocks[662]["text"] != before

blocks.extend(fractal_chapter.FRACTAL_BLOCKS)
print("total blocks:", len(blocks))

# ---------- markup conversion: reportlab-style tags -> XHTML ----------
def to_xhtml(text):
    # strip <font ...>...</font> wrappers (used only for PDF Greek-glyph fallback); keep inner text
    text = re.sub(r'<font[^>]*>', '', text)
    text = text.replace('</font>', '')
    text = text.replace('<b>', '<strong>').replace('</b>', '</strong>')
    text = text.replace('<i>', '<em>').replace('</i>', '</em>')
    return text


def clean_plain(text):
    return re.sub(r"</?[a-zA-Z][^>]*>", "", text).strip()


# ---------- group blocks into chapters (split at each H1) ----------
chapters = []  # list of (title, [blocks])
current_title = None
current_blocks = []
for b in blocks:
    if b["type"] == "H1":
        if current_title is not None:
            chapters.append((current_title, current_blocks))
        current_title = clean_plain(b["text"])
        current_blocks = []
    else:
        current_blocks.append(b)
if current_title is not None:
    chapters.append((current_title, current_blocks))

print("chapters:", [c[0] for c in chapters])

# ---------- render one chapter's blocks to an XHTML body ----------
def render_chapter_body(title, blist):
    parts = [f'<h1>{to_xhtml(title)}</h1>']
    manga_idx = 0
    i = 0
    n = len(blist)
    while i < n:
        b = blist[i]
        t = b["type"]
        if t == "H2":
            parts.append(f'<h2>{to_xhtml(b["text"])}</h2>')
        elif t == "PARA":
            parts.append(f'<p>{to_xhtml(b["text"])}</p>')
        elif t == "POEM":
            lines_html = []
            for ln in b["lines"]:
                if ln["stanza_break"] and lines_html:
                    lines_html.append('<br class="stanza"/>')
                lines_html.append(to_xhtml(ln["text"]) + '<br/>')
            parts.append(f'<div class="poem">{"".join(lines_html)}</div>')
        elif t == "MANGA":
            img_name = f"manga_{manga_idx:03d}.png"
            manga_idx += 1
            parts.append(f'<div class="mangapage"><img src="../images/{img_name}" alt="Página del cómic"/></div>')
        i += 1
    return "\n".join(parts)


print("render OK")

# ---------- CSS ----------
CSS = """
@font-face { font-family: "Lora"; src: url("../fonts/Lora-Regular.ttf"); font-weight: normal; font-style: normal; }
@font-face { font-family: "Lora"; src: url("../fonts/Lora-Bold.ttf"); font-weight: bold; font-style: normal; }
@font-face { font-family: "Lora"; src: url("../fonts/Lora-Italic.ttf"); font-weight: normal; font-style: italic; }
@font-face { font-family: "Lora"; src: url("../fonts/Lora-BoldItalic.ttf"); font-weight: bold; font-style: italic; }

body { font-family: "Lora", serif; color: #22282c; line-height: 1.5; }
h1 { font-size: 1.6em; color: #22282c; margin-top: 2em; margin-bottom: 0.6em; page-break-before: always; }
h2 { font-size: 1.15em; font-style: italic; color: #3c6e71; margin-top: 1.4em; margin-bottom: 0.6em; }
p { text-align: justify; margin: 0 0 0.9em 0; }
.poem { text-align: center; font-style: italic; margin: 1.5em 0; }
.poem br.stanza { display: block; margin-top: 0.8em; content: ""; }
.mangapage { text-align: center; page-break-before: always; }
.mangapage img { max-width: 100%; height: auto; }
.titlepage { text-align: center; margin-top: 30%; }
.titlepage .kicker { color: #3c6e71; font-style: italic; }
.titlepage .maintitle { font-size: 2em; font-weight: bold; margin: 0.4em 0; }
.titlepage .edition { color: #3c6e71; font-style: italic; }
.dedication, .colophon { text-align: center; font-style: italic; margin-top: 40%; }
"""

# ---------- fonts ----------
FONT_FILES = {
    "Lora-Regular.ttf": "/home/claude/fonts/Lora-Regular.ttf",
    "Lora-Bold.ttf": "/home/claude/fonts/Lora-Bold.ttf",
    "Lora-Italic.ttf": "/home/claude/fonts/Lora-Italic-Regular.ttf",
    "Lora-BoldItalic.ttf": "/home/claude/fonts/Lora-BoldItalic.ttf",
}

book = epub.EpubBook()
book.set_identifier("el-horizonte-interior-ibb-2026")
book.set_title("El Horizonte Interior")
book.set_language("es")
book.add_author("Íñigo Barrera Barceló")

css_item = epub.EpubItem(uid="style", file_name="styles/style.css", media_type="text/css", content=CSS)
book.add_item(css_item)


def link_css(html_item):
    html_item.add_link(href="../styles/style.css", rel="stylesheet", type="text/css")


for fname, path in FONT_FILES.items():
    with open(path, "rb") as f:
        data = f.read()
    book.add_item(epub.EpubItem(uid=fname, file_name=f"fonts/{fname}", media_type="application/x-font-ttf", content=data))

for i in range(15):
    src = f"/home/claude/manga/img-{i:03d}.png"
    with open(src, "rb") as f:
        data = f.read()
    book.add_item(epub.EpubImage(uid=f"manga{i:03d}", file_name=f"images/manga_{i:03d}.png", media_type="image/png", content=data))

spine = ["nav"]
toc_entries = []

# --- title page ---
title_html = epub.EpubHtml(title="Portada", file_name="text/title.xhtml", lang="es")
title_html.set_content(
    '<div class="titlepage">'
    '<p class="kicker">Un ensayo literario</p>'
    '<p class="maintitle">El Horizonte Interior</p>'
    '<p class="edition">Edición de Cámara</p>'
    '<p>Íñigo Barrera Barceló</p>'
    '</div>'
)
link_css(title_html)
book.add_item(title_html)
spine.append(title_html)

# --- dedication ---
ded_html = epub.EpubHtml(title="Dedicatoria", file_name="text/dedication.xhtml", lang="es")
ded_html.set_content(
    '<div class="dedication"><p>A Montse y a Gerard,<br/>por aguantarme todos los días con una sonrisa.</p></div>'
)
link_css(ded_html)
book.add_item(ded_html)
spine.append(ded_html)

# --- chapters ---
for idx, (title, blist) in enumerate(chapters):
    fname = f"text/chap_{idx:02d}.xhtml"
    body = render_chapter_body(title, blist)
    ch_html = epub.EpubHtml(title=title, file_name=fname, lang="es")
    ch_html.set_content(body)
    link_css(ch_html)
    book.add_item(ch_html)
    spine.append(ch_html)
    toc_entries.append(ch_html)

# --- colophon ---
col_html = epub.EpubHtml(title="Colofón", file_name="text/colophon.xhtml", lang="es")
col_html.set_content(
    '<div class="colophon"><p>Se terminó de escribir el 8 de septiembre de 2026,<br/>'
    "en L'Hospitalet de Llobregat.</p></div>"
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

out_path = "/home/claude/El_Horizonte_Interior.epub"
epub.write_epub(out_path, book)
print("EPUB written:", out_path)

