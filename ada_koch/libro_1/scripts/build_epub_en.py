# -*- coding: utf-8 -*-
"""EPUB en inglés («The Lovers of the Spiral») de «Los Amantes de la Espiral» con la maqueta de la edición KDP de El Horizonte Interior.

Misma hoja de estilo (Lora, colores, márgenes), misma portada, misma estructura de
ficheros (title / capítulos / colofón) y mismo índice. Las fuentes se toman del
EPUB de edicion_kdp para que ambas ediciones sean idénticas tipográficamente.

Uso:  python3 ada_koch/libro_1/scripts/build_epub_en.py
"""
import os
import re
import subprocess
import uuid
import zipfile

from ebooklib import epub

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC_MD = os.path.join(HERE, "..", "en", "The_Lovers_of_the_Spiral.md")
KDP_EPUB = os.path.join(ROOT, "edicion_kdp", "El_Horizonte_Interior.epub")
OUT = os.path.join(HERE, "..", "en", "The_Lovers_of_the_Spiral.epub")

TITLE = "The Lovers of the Spiral"
SERIES = "The Notebook of Ada Koch · Book I"
AUTHOR = "Íñigo Barrera Barceló"
AUTHOR_SORT = "Barrera Barceló, Íñigo"
SERIES_NAME = "The Notebook of Ada Koch"
SERIES_INDEX = 1
PUB_DATE = "2026-10-10"
SUBJECTS = ["Romance fiction", "Magical realism", "Galicia (Spain)"]
DESCRIPTION = ("Ada Koch, a meteorologist, lives alone in a lighthouse on Galicia's Costa da Morte "
               "and has spent twenty-three years drawing the same man. One stormy night, he knocks "
               "on her door. Book One of The Notebook of Ada Koch.")

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
nav ol { list-style-type: none; padding-left: 1.2em; margin: 0.2em 0; }
nav > ol { padding-left: 0; }
nav li { margin: 0.25em 0; }
nav a { color: #22282c; text-decoration: none; }
nav > ol > li > a { font-weight: bold; color: #3c6e71; }
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
        if "(continued)" in ch_title and chapters:
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
    html = html.replace("<p><strong>END OF BOOK I</strong></p>", '<p class="end"><strong>END OF BOOK I</strong></p>')
    html = re.sub(r"<p><em>(Ada Koch(?:'|’)s story continues[^<]*)</em></p>", r'<p class="end"><em>\1</em></p>', html)
    return html


# ---------- libro ----------
book = epub.EpubBook()
BOOK_UUID = "urn:uuid:" + str(uuid.uuid5(uuid.NAMESPACE_URL, "ehi/ada_koch/the-lovers-of-the-spiral"))
book.set_identifier(BOOK_UUID)
book.set_title(TITLE)
book.set_language("en")
book.add_author(AUTHOR)
book.add_metadata("DC", "description", DESCRIPTION)
book.add_metadata("DC", "date", PUB_DATE)
book.add_metadata("DC", "rights", f"© 2026 {AUTHOR}")
for subj in SUBJECTS:
    book.add_metadata("DC", "subject", subj)

book.add_item(epub.EpubItem(uid="style", file_name="styles/style.css", media_type="text/css", content=CSS))


def link_css(item):
    item.add_link(href="../styles/style.css", rel="stylesheet", type="text/css")


with zipfile.ZipFile(KDP_EPUB) as z:
    for fname in ["Lora-Regular.ttf", "Lora-Bold.ttf", "Lora-Italic.ttf", "Lora-BoldItalic.ttf"]:
        book.add_item(epub.EpubItem(uid=fname, file_name=f"fonts/{fname}",
                                    media_type="application/x-font-ttf",
                                    content=z.read(f"EPUB/fonts/{fname}")))

spine = []

title_html = epub.EpubHtml(title="Title Page", file_name="text/title.xhtml", lang="en")
title_html.set_content(
    '<div class="titlepage">'
    '<p class="kicker">A Novel</p>'
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
    part = epub.EpubHtml(title=act_title, file_name=f"text/part_{a_idx + 1}.xhtml", lang="en")
    part.set_content(f'<div class="parttitle"><h1>{act_title}</h1></div>')
    link_css(part)
    book.add_item(part)
    spine.append(part)
    items = []
    for ch_title, ch_md in chapters:
        n += 1
        ch = epub.EpubHtml(title=ch_title, file_name=f"text/chap_{n:02d}.xhtml", lang="en")
        ch.set_content(f"<h1>{ch_title}</h1>\n" + md_to_xhtml(ch_md))
        link_css(ch)
        book.add_item(ch)
        spine.append(ch)
        items.append(ch)
    toc.append((epub.Section(act_title, href=part.file_name), items))

col_html = epub.EpubHtml(title="Colophon", file_name="text/colophon.xhtml", lang="en")
col_html.set_content(
    '<div class="colophon"><p>Finished on October 10, 2026,<br/>'
    "in L'Hospitalet de Llobregat.</p><p>Translated from the Spanish.</p></div>"
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


# ---------- retoques de metadatos e índice que ebooklib no expone ----------
def postprocess(path):
    with zipfile.ZipFile(path) as z:
        files = {n: z.read(n) for n in z.namelist()}

    opf = files["EPUB/content.opf"].decode("utf-8")
    # autor con orden de catálogo y rol; serie (EPUB 3 + calibre, que Kindle también lee)
    opf = opf.replace(
        '<dc:creator id="creator">' + AUTHOR + '</dc:creator>',
        '<dc:creator id="creator">' + AUTHOR + '</dc:creator>\n'
        '    <meta refines="#creator" property="file-as">' + AUTHOR_SORT + '</meta>\n'
        '    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>\n'
        '    <meta property="belongs-to-collection" id="serie">' + SERIES_NAME + '</meta>\n'
        '    <meta refines="#serie" property="collection-type">series</meta>\n'
        '    <meta refines="#serie" property="group-position">' + str(SERIES_INDEX) + '</meta>\n'
        '    <meta name="calibre:series" content="' + SERIES_NAME + '"/>\n'
        '    <meta name="calibre:series_index" content="' + str(SERIES_INDEX) + '"/>')
    opf = opf.replace("<dc:language>en</dc:language>", "<dc:language>en-US</dc:language>")
    # tipo MIME de fuentes según EPUB 3.3
    opf = opf.replace('media-type="application/x-font-ttf"', 'media-type="font/ttf"')
    # guía EPUB 2 (Kindle la usa para «Ir al principio»)
    opf = opf.replace("</package>",
                      '  <guide>\n'
                      '    <reference type="title-page" title="Title Page" href="text/title.xhtml"/>\n'
                      '    <reference type="toc" title="Contents" href="nav.xhtml"/>\n'
                      '    <reference type="text" title="Start" href="text/chap_01.xhtml"/>\n'
                      '  </guide>\n</package>')
    files["EPUB/content.opf"] = opf.encode("utf-8")

    ncx = files["EPUB/toc.ncx"].decode("utf-8")
    ncx = ncx.replace('content="0" name="dtb:depth"', 'content="2" name="dtb:depth"')
    files["EPUB/toc.ncx"] = ncx.encode("utf-8")

    nav = files["EPUB/nav.xhtml"].decode("utf-8")
    nav = nav.replace("<title>" + TITLE + "</title>", "<title>Contents</title>")
    nav = re.sub(r'(<nav epub:type="toc"[^>]*>\s*)<h2>[^<]*</h2>', r"\1<h2>Contents</h2>", nav)
    nav = nav.replace("</body>",
                      '    <nav epub:type="landmarks" id="landmarks" hidden="">\n'
                      '      <h2>Landmarks</h2>\n'
                      '      <ol>\n'
                      '        <li><a epub:type="titlepage" href="text/title.xhtml">Title Page</a></li>\n'
                      '        <li><a epub:type="toc" href="nav.xhtml">Contents</a></li>\n'
                      '        <li><a epub:type="bodymatter" href="text/chap_01.xhtml">Start</a></li>\n'
                      '      </ol>\n'
                      '    </nav>\n  </body>')
    files["EPUB/nav.xhtml"] = nav.encode("utf-8")

    tmp = path + ".tmp"
    with zipfile.ZipFile(tmp, "w") as z:
        z.writestr(zipfile.ZipInfo("mimetype"), files.pop("mimetype"), compress_type=zipfile.ZIP_STORED)
        for name, data in files.items():
            z.writestr(name, data, compress_type=zipfile.ZIP_DEFLATED)
    os.replace(tmp, path)


postprocess(OUT)
print("EPUB:", os.path.abspath(OUT), "chapters:", n)
