# -*- coding: utf-8 -*-
"""EPUB de «Los Amantes de la Espiral» con la maqueta de la edición KDP de El Horizonte Interior.

Misma hoja de estilo (Lora, colores, márgenes), misma portada, misma estructura de
ficheros (title / capítulos / colofón) y mismo índice. Las fuentes se toman del
EPUB de edicion_kdp para que ambas ediciones sean idénticas tipográficamente.

Uso:  python3 ada_koch/libro_1/scripts/build_epub.py
"""
import os
import re
import subprocess
import zipfile

from ebooklib import epub

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC_MD = os.path.join(HERE, "..", "Los_Amantes_de_la_Espiral.md")
KDP_EPUB = os.path.join(ROOT, "edicion_kdp", "El_Horizonte_Interior.epub")
OUT = os.path.join(HERE, "..", "Los_Amantes_de_la_Espiral.epub")

TITLE = "Los Amantes de la Espiral"
SERIES = "El Cuaderno de Ada Koch · Libro I"
AUTHOR = "Íñigo Barrera Barceló"

# ---------- CSS: la de la edición KDP + separador de escena ----------
CSS = """
@font-face { font-family: "Lora"; src: url("../fonts/Lora-Regular.ttf"); font-weight: normal; font-style: normal; }
@font-face { font-family: "Lora"; src: url("../fonts/Lora-Bold.ttf"); font-weight: bold; font-style: normal; }
@font-face { font-family: "Lora"; src: url("../fonts/Lora-Italic.ttf"); font-weight: normal; font-style: italic; }
@font-face { font-family: "Lora"; src: url("../fonts/Lora-BoldItalic.ttf"); font-weight: bold; font-style: italic; }

body { font-family: "Lora", serif; color: #22282c; line-height: 1.5; }
h1 { font-size: 1.6em; color: #22282c; margin-top: 2em; margin-bottom: 0.6em; page-break-before: always; }
h2 { font-size: 1.15em; font-style: italic; color: #3c6e71; margin-top: 1.4em; margin-bottom: 0.6em; }
p { text-align: justify; margin: 0 0 0.9em 0; }
.titlepage { text-align: center; margin-top: 30%; }
.titlepage .kicker { color: #3c6e71; font-style: italic; }
.titlepage .maintitle { font-size: 2em; font-weight: bold; margin: 0.4em 0; }
.titlepage .edition { color: #3c6e71; font-style: italic; }
.dedication, .colophon { text-align: center; font-style: italic; margin-top: 40%; }
.parttitle { text-align: center; margin-top: 35%; page-break-before: always; }
.parttitle h1 { margin-top: 0; page-break-before: avoid; }
.titlepage p, .dedication p, .colophon p, .parttitle h1 { text-align: center; }
.scenebreak { text-align: center; color: #3c6e71; margin: 1.2em 0; text-indent: 0; }
.end { text-align: center; margin-top: 2em; }
"""

# ---------- fuente markdown -> actos y capítulos ----------
md = open(SRC_MD, encoding="utf-8").read()
md = re.sub(r"^---\n.*?\n---\n", "", md, flags=re.S)  # quitar YAML

acts = []  # [(titulo_acto, [(titulo_cap, md_cap)])]
for act_chunk in re.split(r"^# ", md, flags=re.M)[1:]:
    act_title, act_body = act_chunk.split("\n", 1)
    chapters = []
    for ch_chunk in re.split(r"^## ", act_body, flags=re.M)[1:]:
        ch_title, ch_body = ch_chunk.split("\n", 1)
        if "(continúa)" in ch_title and chapters:
            # continuación del mismo capítulo: no abre capítulo nuevo en el índice
            prev_title, prev_body = chapters[-1]
            chapters[-1] = (prev_title, prev_body + "\n\n### " + ch_title.strip() + "\n\n" + ch_body.strip())
            continue
        chapters.append((ch_title.strip(), ch_body.strip()))
    acts.append((act_title.strip(), chapters))


def md_to_xhtml(text):
    """Convierte el cuerpo de un capítulo: ### -> h2 (como las secciones KDP), --- -> separador."""
    text = re.sub(r"^### ", "## ", text, flags=re.M)
    html = subprocess.run(["pandoc", "-f", "markdown", "-t", "html5", "--wrap=none"],
                          input=text, capture_output=True, text=True, check=True).stdout
    html = re.sub(r"<h2[^>]*>", "<h2>", html)
    html = html.replace("<hr />", '<p class="scenebreak">* * *</p>')
    html = html.replace("<p><strong>FIN DEL LIBRO I</strong></p>", '<p class="end"><strong>FIN DEL LIBRO I</strong></p>')
    html = re.sub(r"<p><em>(La historia de Ada Koch continúa[^<]*)</em></p>", r'<p class="end"><em>\1</em></p>', html)
    return html


# ---------- libro ----------
book = epub.EpubBook()
book.set_identifier("los-amantes-de-la-espiral-ibb-2026")
book.set_title(TITLE)
book.set_language("es")
book.add_author(AUTHOR)
book.add_metadata("DC", "description", "El Cuaderno de Ada Koch, Libro I.")

book.add_item(epub.EpubItem(uid="style", file_name="styles/style.css", media_type="text/css", content=CSS))


def link_css(item):
    item.add_link(href="../styles/style.css", rel="stylesheet", type="text/css")


with zipfile.ZipFile(KDP_EPUB) as z:
    for fname in ["Lora-Regular.ttf", "Lora-Bold.ttf", "Lora-Italic.ttf", "Lora-BoldItalic.ttf"]:
        book.add_item(epub.EpubItem(uid=fname, file_name=f"fonts/{fname}",
                                    media_type="application/x-font-ttf",
                                    content=z.read(f"EPUB/fonts/{fname}")))

spine = []

title_html = epub.EpubHtml(title="Portada", file_name="text/title.xhtml", lang="es")
title_html.set_content(
    '<div class="titlepage">'
    '<p class="kicker">Una novela</p>'
    f'<p class="maintitle">{TITLE}</p>'
    f'<p class="edition">{SERIES}</p>'
    f'<p>{AUTHOR}</p>'
    '</div>'
)
link_css(title_html)
book.add_item(title_html)
spine += [title_html, "nav"]

toc = []
n = 0
for a_idx, (act_title, chapters) in enumerate(acts):
    part = epub.EpubHtml(title=act_title, file_name=f"text/part_{a_idx + 1}.xhtml", lang="es")
    part.set_content(f'<div class="parttitle"><h1>{act_title}</h1></div>')
    link_css(part)
    book.add_item(part)
    spine.append(part)
    items = []
    for ch_title, ch_md in chapters:
        n += 1
        ch = epub.EpubHtml(title=ch_title, file_name=f"text/chap_{n:02d}.xhtml", lang="es")
        ch.set_content(f"<h1>{ch_title}</h1>\n" + md_to_xhtml(ch_md))
        link_css(ch)
        book.add_item(ch)
        spine.append(ch)
        items.append(ch)
    toc.append((epub.Section(act_title, href=part.file_name), items))

col_html = epub.EpubHtml(title="Colofón", file_name="text/colophon.xhtml", lang="es")
col_html.set_content(
    '<div class="colophon"><p>Se terminó de escribir el 10 de octubre de 2026,<br/>'
    "en L'Hospitalet de Llobregat.</p></div>"
)
link_css(col_html)
book.add_item(col_html)
spine.append(col_html)

book.toc = tuple(toc)
book.add_item(epub.EpubNcx())
nav = epub.EpubNav()
nav.add_link(href="styles/style.css", rel="stylesheet", type="text/css")
book.add_item(nav)
book.spine = spine

epub.write_epub(OUT, book)
print("EPUB:", os.path.abspath(OUT), "capítulos:", n)
