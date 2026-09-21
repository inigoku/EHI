#!/usr/bin/env python3
"""Monta el epub de "Ecos en el borde", conservando el ritmo de lámina y poema.

    python3 edicion_poesia/scripts/build_epub.py

Un epub es reflujable por naturaleza: no tiene páginas fijas, las hace el
lector según el tamaño de letra que elija. Lo que sí se puede conservar, y es
lo que de verdad define este libro, es el ritmo: cada lámina ocupa su propia
pantalla y cada poema la suya, uno detrás de otro, igual que en el papel van
en par e impar. Aquí cada lámina y cada poema son un documento aparte, así que
el lector pasa de la imagen al poema de un solo gesto y nunca los ve mezclados.

No se usa maquetación fija (fixed layout) a propósito: conserva la página
exacta, pero a 6 x 9 pulgadas en un móvil deja el verso ilegible, y en un libro
de poesía eso pesa más que la fidelidad al milímetro.
"""
from __future__ import annotations

import html
import io
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from poemas import Book, Poem, load_books  # noqa: E402
from texts import get_text  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "edicion_poesia"
IMG = BASE / "imagenes"
FONTS = BASE / "fonts"
def get_out_path(lang: str = "es") -> Path:
    if lang == "ca":
        return BASE / "Ecos_en_el_Borde_ca.epub"
    if lang == "en":
        return BASE / "Echoes_at_the_Edge.epub"
    return BASE / "Ecos_en_el_Borde.epub"

OUT = get_out_path()

# Las láminas del papel van a 1455 px porque las tiene que imprimir una
# máquina a 300 ppp. Una pantalla no da para tanto, y KDP cobra la entrega del
# ebook por megabyte, así que para el epub se reducen: a 1200 px de lado largo
# no se distingue la diferencia leyendo y el fichero baja a menos de la cuarta
# parte.
SCREEN_PX = 1200
SCREEN_QUALITY = 82

CURRENT_LANG = "es"

def get_uid() -> str:
    # Un UID distinto por idioma: si las tres ediciones compartieran uno,
    # el software de lectura (Calibre, Apple Books...) las trataría como el
    # mismo libro y podría confundir sus metadatos o su sincronización.
    return f"urn:uuid:ecos-en-el-borde-antologia-poetica-{CURRENT_LANG}"

def get_title():
    return get_text(CURRENT_LANG, "title")

def get_subtitle():
    return get_text(CURRENT_LANG, "subtitle")

def get_author():
    return get_text(CURRENT_LANG, "author")

def get_lang_code():
    return CURRENT_LANG

# Nombres de los documentos fijos (no compartidos con content/poemas ni con
# poemas.py), en el idioma de cada edición, para que el interior del epub no
# use palabras castellanas cuando el libro es catalán o inglés.
FIXED_NAMES = {
    "es": {"cover": "cubierta", "titulo": "titulo", "creditos": "creditos",
           "dedicatoria": "dedicatoria", "intro": "introduccion",
           "ilustraciones": "ilustraciones", "sobre": "sobre",
           "colofon": "colofon"},
    "ca": {"cover": "coberta", "titulo": "titol", "creditos": "credits",
           "dedicatoria": "dedicatoria", "intro": "introduccio",
           "ilustraciones": "il-lustracions", "sobre": "sobre",
           "colofon": "colofo"},
    "en": {"cover": "cover", "titulo": "title", "creditos": "credits",
           "dedicatoria": "dedication", "intro": "intro",
           "ilustraciones": "illustrations", "sobre": "about",
           "colofon": "colophon"},
}

def fname(key: str) -> str:
    return f"{FIXED_NAMES[CURRENT_LANG][key]}.xhtml"

TOKEN = re.compile(r"(\*\*[^*]+\*\*|\*[^*]+\*)")
MARKER = re.compile(r"\*\*[IVX]+\.\*\*")

CSS = """@font-face { font-family: "Eco"; font-weight: normal; font-style: normal;
  src: url("fonts/SourceSerifPro-Regular.ttf"); }
@font-face { font-family: "Eco"; font-weight: normal; font-style: italic;
  src: url("fonts/SourceSerifPro-It.ttf"); }
@font-face { font-family: "Eco"; font-weight: bold; font-style: normal;
  src: url("fonts/SourceSerifPro-Semibold.ttf"); }

html, body { margin: 0; padding: 0; }
body { font-family: "Eco", Georgia, "Times New Roman", serif;
       color: #22282c; line-height: 1.45; padding: 1.2em 1.1em;
       break-before: page; page-break-before: always; }

h1, h2, h3 { font-weight: normal; margin: 0; }

.numeral { font-size: 0.72em; letter-spacing: 0.28em; color: #3c6e71;
           text-transform: uppercase; margin-bottom: 0.7em; }
.titulo { font-size: 1.45em; font-weight: bold; margin-bottom: 0.25em; }
.fuente { font-style: italic; font-size: 0.86em; color: #3c6e71;
          margin-bottom: 0.9em; }
.filete { border: 0; border-top: 1px solid #3c6e71; width: 2.6em;
          margin: 0 0 1.5em 0; }

/* El verso: sin justificar, con sangría francesa en lo que el lector parta. */
.verso { margin: 0; text-indent: -1.1em; padding-left: 1.1em;
         text-align: left; orphans: 2; widows: 2; }
.estrofa { margin: 0 0 1.05em 0; }
.parte { font-size: 0.74em; letter-spacing: 0.24em; color: #3c6e71;
         text-transform: uppercase; margin: 1.4em 0 0.7em 0; }

/* Cada lámina, sola en su pantalla. */
.lamina { margin: 0; padding: 0; text-align: center; }
.lamina img { max-width: 100%; max-height: 96vh; }

.prosa p { text-align: justify; margin: 0 0 0.85em 0; }
.entrada { margin: 0 0 0.75em 0; }

.centro { text-align: center; }
.portadilla { margin-top: 30%; }
.creditos { font-size: 0.82em; margin-top: 18%; }
.creditos p { margin: 0 0 0.5em 0; }
.dedicatoria { margin-top: 35%; font-style: italic; text-align: center; }
.colofon { margin-top: 35%; font-style: italic; text-align: center;
           font-size: 0.9em; }
.cubierta { margin: 0; padding: 0; text-align: center; }
.cubierta img { max-width: 100%; max-height: 100vh; }
"""


def for_screen(path: Path, max_px: int = SCREEN_PX) -> bytes:
    """Devuelve la imagen reducida a tamaño de pantalla, en jpeg."""
    with Image.open(path) as im:
        im = im.convert("RGB")
        if max(im.size) > max_px:
            im.thumbnail((max_px, max_px), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=SCREEN_QUALITY, optimize=True,
                progressive=True)
    return buf.getvalue()


def esc(text: str) -> str:
    return html.escape(text, quote=False)


def inline(text: str) -> str:
    """Pasa el marcado de negrita y cursiva de los ficheros a html."""
    out = []
    for part in TOKEN.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            out.append(f"<strong>{esc(part[2:-2])}</strong>")
        elif part.startswith("*") and part.endswith("*"):
            out.append(f"<em>{esc(part[1:-1])}</em>")
        else:
            out.append(esc(part))
    return "".join(out)


def page(title: str, body: str, body_class: str = "") -> str:
    cls = f' class="{body_class}"' if body_class else ""
    return (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<!DOCTYPE html>\n'
        '<html xmlns="http://www.w3.org/1999/xhtml" '
        f'xmlns:epub="http://www.idpf.org/2007/ops" lang="{get_lang_code()}" xml:lang="{get_lang_code()}">\n'
        f'<head><meta charset="utf-8"/><title>{esc(title)}</title>'
        '<link rel="stylesheet" type="text/css" href="style.css"/></head>\n'
        f'<body{cls}>\n{body}\n</body>\n</html>\n'
    )


def verse_html(poem: Poem) -> str:
    """El poema, estrofa a estrofa, conservando los rótulos de parte."""
    chunks: list[str] = []
    stanza: list[str] = []

    def flush() -> None:
        if stanza:
            chunks.append('<div class="estrofa">' + "".join(stanza) + "</div>")
            stanza.clear()

    for raw in poem.lines:
        text = raw.strip()
        if not text:
            flush()
            continue
        if MARKER.fullmatch(text):
            flush()
            chunks.append(f'<p class="parte">{esc(text[2:-2].rstrip("."))}</p>')
            continue
        chunks.append("") if False else None
        stanza.append(f'<p class="verso">{inline(text)}</p>')
    flush()
    return "\n".join(chunks)


def glossary_html(poem: Poem) -> str:
    chunks = []
    for raw in poem.lines:
        text = raw.strip()
        if not text:
            continue
        if re.fullmatch(r"\*[^*]+\*", text):
            chunks.append(f'<p class="centro"><em>{esc(text[1:-1])}</em></p>')
            continue
        chunks.append(f'<p class="entrada">{inline(text)}</p>')
    return "\n".join(chunks)


def plate_page(pid: str, caption: str, description: str = "") -> str:
    alt = description or caption
    return page(caption, f'<div class="lamina"><img src="images/{pid}.jpg" '
                         f'alt="{esc(alt)}"/></div>', "")


def poem_page(poem: Poem) -> str:
    head = ""
    if poem.numeral:
        head += f'<p class="numeral">{esc(poem.numeral)}</p>'
    head += f'<h1 class="titulo">{esc(poem.title)}</h1>'
    if poem.source:
        from_label = get_text(CURRENT_LANG, "source_from_label")
        head += f'<p class="fuente">{esc(from_label)} {esc(poem.source)}</p>'
    head += '<hr class="filete"/>'
    return page(poem.title, head + verse_html(poem))


def build(lang: str = "es") -> None:
    global OUT, CURRENT_LANG
    CURRENT_LANG = lang
    OUT = get_out_path(lang)
    import build_interior
    build_interior.CURRENT_LANG = lang  # _description() reads its own module's global
    from build_interior import _description, plate_notes

    fm = re.compile(r"\A---\r?\n(.*?)\r?\n---", re.DOTALL)

    books, closing = load_books(lang)
    files: dict[str, str] = {}
    spine: list[str] = []
    # cada nodo es ("item", href, titulo) o ("book", href, titulo, [subitems])
    nav: list[tuple] = []

    def add(name: str, content: str, nav_title: str | None = None) -> None:
        files[name] = content
        spine.append(name)
        if nav_title:
            nav.append(("item", name, nav_title))

    cover_title = get_text(CURRENT_LANG, "cover_page_title")
    add(fname("cover"), page(cover_title,
        f'<div class="cubierta"><img src="images/cubierta.jpg" alt="{esc(cover_title)}"/></div>'))
    add(fname("titulo"), page(get_text(CURRENT_LANG, "title_page_title"),
        f'<div class="centro portadilla"><h1 class="titulo">{esc(get_title())}</h1>'
        f'<p><em>{esc(get_subtitle())}</em></p><p>&#160;</p>'
        f'<p>{esc(get_text(CURRENT_LANG, "kicker"))}</p><p>&#160;</p>'
        f'<p>{esc(get_author())}</p></div>'))
    add(fname("creditos"), page(get_text(CURRENT_LANG, "credits_title"),
        f'<div class="creditos">{get_text(CURRENT_LANG, "credits_text")}</div>'))
    add(fname("dedicatoria"), page(get_text(CURRENT_LANG, "dedication_page_title"),
        f'<div class="dedicatoria"><p>{get_text(CURRENT_LANG, "dedication")}</p></div>'))

    intro_title = get_text(CURRENT_LANG, "intro_title")
    intro_paragraphs = get_text(CURRENT_LANG, "intro")
    intro_body = (f'<h1 class="titulo">{esc(intro_title)}</h1><hr class="filete"/>'
                  '<div class="prosa">'
                  + "".join(f"<p>{inline(p)}</p>" for p in intro_paragraphs) + "</div>")
    add(fname("intro"), page(intro_title, intro_body), intro_title)

    for book in books:
        name = f"{book.key}.xhtml"
        add(name, page(book.title,
            f'<div class="portadilla"><p class="numeral">{esc(book.ordinal)}</p>'
            f'<h1 class="titulo">{esc(book.title)}</h1><hr class="filete"/>'
            f'<p><em>{esc(book.epigraph)}</em></p></div>'))
        sub_items: list[tuple[str, str]] = []
        for poem in book.poems:
            desc = _description(poem.pid, fm)
            add(f"lam_{poem.pid}.xhtml", plate_page(poem.pid, poem.title, desc))
            add(f"{poem.pid}.xhtml", poem_page(poem))
            sub_items.append((f"{poem.pid}.xhtml", f"{poem.numeral}. {poem.title}"))
        nav.append(("book", name, book.title, sub_items))

    closing_desc = _description(closing.pid, fm)
    add(f"lam_{closing.pid}.xhtml", plate_page(closing.pid, closing.title, closing_desc))
    add(f"{closing.pid}.xhtml", page(closing.title,
        f'<h1 class="titulo">{esc(closing.title)}</h1><hr class="filete"/>'
        + glossary_html(closing)), closing.title)

    laminas = "".join(
        f'<p class="entrada"><strong>{esc(title)}.</strong> {esc(_description(pid, fm))}</p>'
        for _, pid, title, _d in plate_notes(books, closing)
        if _description(pid, fm))
    illustrations_title = get_text(CURRENT_LANG, "illustrations_title")
    add(fname("ilustraciones"), page(illustrations_title,
        f'<h1 class="titulo">{esc(illustrations_title)}</h1><hr class="filete"/>' + laminas),
        illustrations_title)
    about_title = get_text(CURRENT_LANG, "about_title")
    about_paragraphs = get_text(CURRENT_LANG, "about")
    add(fname("sobre"), page(about_title,
        f'<h1 class="titulo">{esc(about_title)}</h1><hr class="filete"/>'
        '<div class="prosa">' + "".join(f"<p>{inline(p)}</p>" for p in about_paragraphs) + "</div>"),
        about_title)
    add(fname("colofon"), page(get_text(CURRENT_LANG, "colophon_title"),
        f'<div class="colofon"><p>{get_text(CURRENT_LANG, "colophon_text")}</p></div>'))

    # ---- índice de navegación
    toc_title = get_text(CURRENT_LANG, "toc_title")

    def nav_li(node: tuple) -> str:
        if node[0] == "book":
            _, href, title, sub_items = node
            children = "".join(
                f'<li><a href="{n}">{esc(t)}</a></li>' for n, t in sub_items)
            return (f'<li><a href="{href}">{esc(title)}</a>'
                    f'<ol>{children}</ol></li>')
        _, href, title = node
        return f'<li><a href="{href}">{esc(title)}</a></li>'

    nav_items = "".join(nav_li(node) for node in nav)
    files["nav.xhtml"] = page(toc_title,
        f'<nav epub:type="toc" id="toc"><h1 class="titulo">{esc(toc_title)}</h1>'
        f'<ol>{nav_items}</ol></nav>')

    # ---- imágenes y fuentes
    plates = [p.pid for b in books for p in b.poems] + [closing.pid]
    media = {"images/cubierta.jpg": IMG / "_portada_frontal.jpg"}
    if not media["images/cubierta.jpg"].exists():
        media["images/cubierta.jpg"] = IMG / "portada_2k.jpg"
    for pid in plates:
        media[f"images/{pid}.jpg"] = IMG / f"{pid}.jpg"
    for f in ("SourceSerifPro-Regular.ttf", "SourceSerifPro-It.ttf",
              "SourceSerifPro-Semibold.ttf"):
        media[f"fonts/{f}"] = FONTS / f

    manifest = ['<item id="css" href="style.css" media-type="text/css"/>',
                '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" '
                'properties="nav"/>']
    for i, name in enumerate(spine):
        props = ' properties="cover-image"' if False else ''
        manifest.append(f'<item id="p{i}" href="{name}" '
                        f'media-type="application/xhtml+xml"{props}/>')
    for i, (path, _src) in enumerate(media.items()):
        mt = ("image/jpeg" if path.endswith(".jpg")
              else "application/vnd.ms-opentype")
        extra = ' properties="cover-image"' if path.endswith("cubierta.jpg") else ''
        manifest.append(f'<item id="m{i}" href="{path}" media-type="{mt}"{extra}/>')

    spine_items = "".join(f'<itemref idref="p{i}"/>' for i in range(len(spine)))
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    isbn = get_text(CURRENT_LANG, "isbn")
    isbn_meta = (f'<dc:identifier id="isbn">urn:isbn:{esc(isbn)}</dc:identifier>'
                 if isbn else '')
    subjects = "".join(f'<dc:subject>{esc(k.strip())}</dc:subject>'
                        for k in get_text(CURRENT_LANG, "keywords").split(","))
    opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">{get_uid()}</dc:identifier>
    {isbn_meta}
    <dc:title>{esc(get_title())}</dc:title>
    <dc:creator>{esc(get_author())}</dc:creator>
    <dc:publisher>{esc(get_text(CURRENT_LANG, "publisher"))}</dc:publisher>
    <dc:rights>{esc(get_text(CURRENT_LANG, "rights"))}</dc:rights>
    <dc:date>{today}</dc:date>
    <dc:language>{get_lang_code()}</dc:language>
    <dc:description>{esc(get_subtitle())}. {esc(get_text(CURRENT_LANG, "kicker"))}.</dc:description>
    {subjects}
    <meta property="dcterms:modified">{now}</meta>
  </metadata>
  <manifest>{"".join(manifest)}</manifest>
  <spine>{spine_items}</spine>
</package>
'''

    container = ('<?xml version="1.0" encoding="utf-8"?>\n'
                 '<container version="1.0" '
                 'xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
                 '<rootfiles><rootfile full-path="OEBPS/content.opf" '
                 'media-type="application/oebps-package+xml"/></rootfiles></container>')

    OUT.unlink(missing_ok=True)
    with zipfile.ZipFile(OUT, "w") as z:
        # el mimetype va primero y sin comprimir: lo pide la norma
        z.writestr(zipfile.ZipInfo("mimetype"), "application/epub+zip",
                   compress_type=zipfile.ZIP_STORED)
        z.writestr("META-INF/container.xml", container, zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/content.opf", opf, zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/style.css", CSS, zipfile.ZIP_DEFLATED)
        for name, content in files.items():
            z.writestr(f"OEBPS/{name}", content, zipfile.ZIP_DEFLATED)
        for path, src in media.items():
            if path.endswith(".jpg"):
                # la cubierta puede permitirse algo más de lado
                limit = 1600 if path.endswith("cubierta.jpg") else SCREEN_PX
                z.writestr(f"OEBPS/{path}", for_screen(src, limit),
                           zipfile.ZIP_STORED)   # el jpeg ya está comprimido
            else:
                z.write(src, f"OEBPS/{path}", zipfile.ZIP_DEFLATED)

    kb = OUT.stat().st_size / 1024
    print(f"{OUT.relative_to(ROOT)}  —  {len(spine)} pantallas, "
          f"{len(plates)} láminas, {kb/1024:.1f} MB")


if __name__ == "__main__":
    for lang in ["es", "ca", "en"]:
        build(lang)
