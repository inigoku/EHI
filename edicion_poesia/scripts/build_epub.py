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
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from poemas import Book, Poem, load_books  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "edicion_poesia"
IMG = BASE / "imagenes"
FONTS = BASE / "fonts"
OUT = BASE / "Ecos_en_el_Borde.epub"

# Las láminas del papel van a 1455 px porque las tiene que imprimir una
# máquina a 300 ppp. Una pantalla no da para tanto, y KDP cobra la entrega del
# ebook por megabyte, así que para el epub se reducen: a 1200 px de lado largo
# no se distingue la diferencia leyendo y el fichero baja a menos de la cuarta
# parte.
SCREEN_PX = 1200
SCREEN_QUALITY = 82

TITLE = "Ecos en el borde"
SUBTITLE = "Lírica del límite emocional"
AUTHOR = "Íñigo Barrera Barceló"
LANG = "es"
UID = "urn:uuid:ecos-en-el-borde-antologia-poetica"

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
       color: #22282c; line-height: 1.45; padding: 1.2em 1.1em; }

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
        f'xmlns:epub="http://www.idpf.org/2007/ops" lang="{LANG}" xml:lang="{LANG}">\n'
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


def plate_page(pid: str, caption: str) -> str:
    return page(caption, f'<div class="lamina"><img src="images/{pid}.jpg" '
                         f'alt="{esc(caption)}"/></div>', "")


def poem_page(poem: Poem) -> str:
    head = ""
    if poem.numeral:
        head += f'<p class="numeral">{esc(poem.numeral)}</p>'
    head += f'<h2 class="titulo">{esc(poem.title)}</h2>'
    if poem.source:
        head += f'<p class="fuente">de {esc(poem.source)}</p>'
    head += '<hr class="filete"/>'
    return page(poem.title, head + verse_html(poem))


def build() -> None:
    from build_interior import (ABOUT, AUTHOR as _A, INTRO, INTRO_TITLE,
                                _description, plate_notes)

    books, closing = load_books()
    files: dict[str, str] = {}
    spine: list[str] = []
    nav: list[tuple[str, str]] = []

    def add(name: str, content: str, nav_title: str | None = None) -> None:
        files[name] = content
        spine.append(name)
        if nav_title:
            nav.append((name, nav_title))

    add("cover.xhtml", page("Cubierta",
        '<div class="cubierta"><img src="images/cubierta.jpg" alt="Cubierta"/></div>'))
    add("titulo.xhtml", page("Portada",
        f'<div class="centro portadilla"><h1 class="titulo">{esc(TITLE)}</h1>'
        f'<p><em>{esc(SUBTITLE)}</em></p><p>&#160;</p>'
        f'<p>Antología poética de<br/>El Horizonte Interior</p><p>&#160;</p>'
        f'<p>{esc(AUTHOR)}</p></div>'))
    add("creditos.xhtml", page("Créditos",
        '<div class="creditos">'
        f'<p><em>{esc(TITLE)}. {esc(SUBTITLE)}</em></p>'
        '<p>Antología poética de El Horizonte Interior</p>'
        f'<p>© {esc(AUTHOR)}. Todos los derechos reservados.</p>'
        '<p>Los veinte poemas y el glosario proceden de la sección de poesía '
        'de El Horizonte Interior y se reproducen aquí en el orden en que la '
        'obra los presenta.</p>'
        '<p>Las ilustraciones proceden de las ediciones ilustrada y de cámara '
        'de la misma obra. Al final del volumen se relacionan una a una.</p>'
        '<p>Compuesto en Source Serif Pro.</p>'
        '<p>ISBN: 9798175383530</p>'
        '<p><a href="https://ehi-pi.vercel.app/">https://ehi-pi.vercel.app/</a></p></div>'))
    add("dedicatoria.xhtml", page("Dedicatoria",
        '<div class="dedicatoria"><p>A quien se quedó en la orilla<br/>'
        'cuando el agua se retiró.</p></div>'))

    intro_body = (f'<h2 class="titulo">{esc(INTRO_TITLE)}</h2><hr class="filete"/>'
                  '<div class="prosa">'
                  + "".join(f"<p>{inline(p)}</p>" for p in INTRO) + "</div>")
    add("intro.xhtml", page(INTRO_TITLE, intro_body), INTRO_TITLE)

    for book in books:
        name = f"{book.key}.xhtml"
        add(name, page(book.title,
            f'<div class="portadilla"><p class="numeral">{esc(book.ordinal)}</p>'
            f'<h1 class="titulo">{esc(book.title)}</h1><hr class="filete"/>'
            f'<p><em>{esc(book.epigraph)}</em></p></div>'), book.title)
        for poem in book.poems:
            add(f"lam_{poem.pid}.xhtml", plate_page(poem.pid, poem.title))
            add(f"{poem.pid}.xhtml", poem_page(poem), f"   {poem.numeral}. {poem.title}")

    add(f"lam_{closing.pid}.xhtml", plate_page(closing.pid, closing.title))
    add(f"{closing.pid}.xhtml", page(closing.title,
        f'<h2 class="titulo">{esc(closing.title)}</h2><hr class="filete"/>'
        + glossary_html(closing)), closing.title)

    fm = re.compile(r"\A---\r?\n(.*?)\r?\n---", re.DOTALL)
    laminas = "".join(
        f'<p class="entrada"><strong>{esc(title)}.</strong> {esc(_description(pid, fm))}</p>'
        for _, pid, title, _d in plate_notes(books, closing)
        if _description(pid, fm))
    add("ilustraciones.xhtml", page("Las ilustraciones",
        '<h2 class="titulo">Las ilustraciones</h2><hr class="filete"/>' + laminas),
        "Las ilustraciones")
    add("sobre.xhtml", page("Sobre esta antología",
        '<h2 class="titulo">Sobre esta antología</h2><hr class="filete"/>'
        '<div class="prosa">' + "".join(f"<p>{inline(p)}</p>" for p in ABOUT) + "</div>"),
        "Sobre esta antología")
    add("colofon.xhtml", page("Colofón",
        '<div class="colofon"><p>Se acabó de componer este volumen<br/>'
        'el día en que el agua volvió a la orilla<br/>sin que nadie supiera<br/>'
        'si había traído algo consigo.</p></div>'))

    # ---- índice de navegación
    nav_items = "".join(f'<li><a href="{n}">{esc(t)}</a></li>' for n, t in nav)
    files["nav.xhtml"] = page("Índice",
        f'<nav epub:type="toc" id="toc"><h2 class="titulo">Índice</h2>'
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
    opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">{UID}</dc:identifier>
    <dc:title>{esc(TITLE)}</dc:title>
    <dc:creator>{esc(AUTHOR)}</dc:creator>
    <dc:language>{LANG}</dc:language>
    <dc:description>{esc(SUBTITLE)}. Antología poética de El Horizonte Interior.</dc:description>
    <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
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
    build()
