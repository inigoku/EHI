#!/usr/bin/env python3
"""Build an EPUB3 from the same ToC JSON used by scripts/generate_book_pdf.py.

Adaptado de edicion_ensayo/scripts/build_epub_ensayo.py para Cuentos de Tarel.

Usage:
    python build_epub.py ../toc_cuentos.json -o ../Cuentos_de_Tarel.epub
    python build_epub.py ../toc_cuentos_en.json -o ../Tales_of_Tarel.epub
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from PIL import Image as PILImage

FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n?(.*)\Z", re.DOTALL)
INLINE_ILLUS_RE = re.compile(
    r'^##\s*\[(?:ILUSTRACI[ÓO]N|ILLUSTRATION)\s*([\w.]*)?:?\s*"([^"]+)"\]', re.IGNORECASE)

UI_STRINGS = {
    "es": {"toc": "Índice"},
    "en": {"toc": "Contents"},
    "ca": {"toc": "Índex"},
}


def title_fallback_illus_id(illus_title: str) -> Optional[str]:
    """Same title-based fallback generate_book_pdf.py now applies, for the
    one inline marker in cuento1 that has no id, just a quoted title --
    see build_interior_premium.py's matching fix for why."""
    lower_title = illus_title.lower()
    if ("agua" in lower_title and "retira" in lower_title) or \
            ("water" in lower_title and "recede" in lower_title):
        return "cuento_agua_retira"
    if "océano" in lower_title or "oceano" in lower_title or "ocean" in lower_title:
        return "il_oceano_olas"
    if "ladrón" in lower_title or "ladron" in lower_title or "thief" in lower_title:
        return "cuento_ladron"
    if "luthier" in lower_title:
        return "cuento_luthier"
    return None

# Illustration ids for real, copyrighted or public-domain works reproduced under
# quotation right (derecho de cita) — these are the only ones whose caption
# (artist/technique/year/collection) must be shown. The book's own original
# illustrations don't need a visible caption.
CREDIT_REQUIRED_ILLUSTRATION_IDS = {
    "cart_meninas", "cart_avignon", "cart_masia", "cart_eliot",
}
SEPARATOR_ROW_RE = re.compile(r"^\|[\s:|-]+\|$")


def parse_frontmatter(raw_text: str) -> tuple[dict, str]:
    match = FRONTMATTER_RE.match(raw_text)
    if not match:
        return {}, raw_text
    data: dict = {}
    for line in match.group(1).split("\n"):
        idx = line.find(": ")
        if idx == -1:
            continue
        key = line[:idx].strip()
        value = line[idx + 2:].strip()
        if key:
            data[key] = value
    return data, match.group(2)


def esc(text: str) -> str:
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def inline_markup(text: str) -> str:
    text = esc(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"`([^`]+?)`", r"<code>\1</code>", text)
    return text


SIMULATION_HEADING_RE = re.compile(r"^## \[SIMULACI[ÓO]N[^\]]*\]\s*$", re.MULTILINE)
SIMULATION_HEADING_EN_RE = re.compile(r"^## \[SIMULATION[^\]]*\]\s*$", re.MULTILINE)
SIDEBOX_RE = re.compile(r"\[CAJA LATERAL:\s*([^\]]+)\]")
SIDEBOX_EN_RE = re.compile(r"\[SIDEBOX:\s*([^\]]+)\]")


def strip_web_only_markers(body: str) -> str:
    """Same web-only markers generate_book_pdf.markdown_to_flowables
    handles -- a simulation heading with no static equivalent becomes a
    short note, and a sidebar's bracketed label becomes a plain caption."""
    body = SIMULATION_HEADING_RE.sub(
        "*(Simulación interactiva disponible en la edición web.)*", body)
    body = SIMULATION_HEADING_EN_RE.sub(
        "*(Interactive simulation available in the web edition.)*", body)
    body = SIDEBOX_RE.sub(r"\1", body)
    body = SIDEBOX_EN_RE.sub(r"\1", body)
    return body


def is_url(s: str) -> bool:
    return s.startswith("http://") or s.startswith("https://")


def downsample_for_epub(image_bytes: bytes, max_dim: int = 1200, quality: int = 82) -> bytes:
    """Re-encodes an illustration to a screen-appropriate resolution and a
    JPEG before embedding it. Source illustrations are ~1024x1024 to
    ~1536x1536 PNGs at several hundred KB to ~2MB each -- copied in
    unmodified (as this used to do), 72 of them alone pushed the EPUB to
    ~80MB. E-reader screens don't need print resolution either."""
    try:
        with PILImage.open(io.BytesIO(image_bytes)) as im:
            width, height = im.size
            if im.mode in ("RGBA", "LA", "P"):
                rgba = im.convert("RGBA")
                background = PILImage.new("RGB", rgba.size, (255, 255, 255))
                background.paste(rgba, mask=rgba.split()[-1])
                im = background
            elif im.mode != "RGB":
                im = im.convert("RGB")
            scale = min(1.0, max_dim / max(width, height))
            if scale < 1.0:
                im = im.resize((round(width * scale), round(height * scale)), PILImage.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, format="JPEG", quality=quality, optimize=True)
            return buf.getvalue()
    except Exception as exc:  # noqa: BLE001
        print(f"warning: could not downsample illustration: {exc}", file=sys.stderr)
        return image_bytes


class ImageRegistry:
    """Copies each locally-resolvable illustration into OEBPS/images/ once,
    keyed by its illustration id, and hands back the in-EPUB relative path.
    Remote (http/https) illustrations are skipped -- see the PDF builder's
    README note on why those can't be fetched from this environment."""

    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.by_id: dict[str, str] = {}  # illustration id -> "images/il_x.ext"
        self.files: dict[str, bytes] = {}  # in-epub path -> bytes

    def register(self, illus_id: str, source: str) -> Optional[str]:
        if illus_id in self.by_id:
            return self.by_id[illus_id]
        if not source or is_url(source):
            return None
        path = (self.base_dir / source).resolve()
        if not path.exists():
            print(f"warning: illustration file not found: {path}", file=sys.stderr)
            return None
        epub_path = f"images/{illus_id}.jpg"
        self.files[epub_path] = downsample_for_epub(path.read_bytes())
        self.by_id[illus_id] = epub_path
        return epub_path


def markdown_to_xhtml(body: str, illustrations: dict, images: ImageRegistry) -> str:
    body = strip_web_only_markers(body)
    lines = body.split("\n")
    out: list[str] = []
    i = 0
    para_buf: list[str] = []
    list_buf: list[str] = []

    def flush_para():
        if para_buf:
            out.append(f"<p>{' '.join(para_buf)}</p>")
            para_buf.clear()

    def flush_list():
        if list_buf:
            out.append("<ul>" + "".join(f"<li>{item}</li>" for item in list_buf) + "</ul>")
            list_buf.clear()

    while i < len(lines):
        raw = lines[i]
        stripped = raw.strip()

        if not stripped:
            flush_para()
            flush_list()
            i += 1
            continue

        if stripped == "---":
            flush_para()
            flush_list()
            out.append("<hr/>")
            i += 1
            continue

        if stripped.startswith("|") and stripped.endswith("|"):
            flush_para()
            flush_list()
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            rows = [l for l in table_lines if not SEPARATOR_ROW_RE.match(l)]
            if rows:
                parsed = [[c.strip() for c in r.strip("|").split("|")] for r in rows]
                has_header = len(parsed) > 1
                out.append('<table class="cmp">')
                for ridx, row in enumerate(parsed):
                    tag = "th" if (has_header and ridx == 0) else "td"
                    out.append("<tr>" + "".join(f"<{tag}>{inline_markup(c)}</{tag}>" for c in row) + "</tr>")
                out.append("</table>")
            continue

        illus_match = INLINE_ILLUS_RE.match(stripped)
        if illus_match:
            flush_para()
            flush_list()
            illus_id, illus_title = illus_match.group(1), illus_match.group(2)
            if not illus_id:
                illus_id = title_fallback_illus_id(illus_title)
            caption = ""
            j = i + 1
            while j < len(lines) and lines[j].strip() == "":
                j += 1
            if j < len(lines) and lines[j].strip().startswith("*") and lines[j].strip().endswith("*"):
                caption = lines[j].strip()[1:-1]
                j += 1
            source = illustrations.get(illus_id) if illus_id else None
            epub_path = images.register(illus_id, source) if illus_id else None
            if epub_path:
                show_caption = caption and illus_id in CREDIT_REQUIRED_ILLUSTRATION_IDS
                figcaption = f"<figcaption>{esc(caption)}</figcaption>" if show_caption else ""
                out.append(f'<figure><img src="../{epub_path}" alt="{esc(illus_title)}"/>{figcaption}</figure>')
            i = j
            continue

        if stripped.startswith("### "):
            flush_para()
            flush_list()
            out.append(f"<h3>{inline_markup(stripped[4:])}</h3>")
            i += 1
            continue

        if stripped.startswith("## "):
            flush_para()
            flush_list()
            out.append(f"<h2>{inline_markup(stripped[3:])}</h2>")
            i += 1
            continue

        if stripped.startswith(">"):
            flush_para()
            flush_list()
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                content = lines[i].strip()[1:].strip()
                if content:
                    quote_lines.append(content)
                i += 1
            if quote_lines:
                out.append("<blockquote>" + "<br/>".join(inline_markup(q) for q in quote_lines) + "</blockquote>")
            continue

        if stripped.startswith("- ") or stripped.startswith("* "):
            flush_para()
            list_buf.append(inline_markup(stripped[2:]))
            i += 1
            continue

        flush_list()
        para_buf.append(inline_markup(stripped))
        i += 1

    flush_para()
    flush_list()
    return "\n".join(out)


PAGE_TEMPLATE = """<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="{lang}" xml:lang="{lang}">
<head>
<title>{title}</title>
<link rel="stylesheet" type="text/css" href="{css_prefix}css/style.css"/>
</head>
<body>
{body}
</body>
</html>
"""


def page(title: str, body_html: str, css_prefix: str = "../", lang: str = "es") -> str:
    return PAGE_TEMPLATE.format(title=esc(title), body=body_html, css_prefix=css_prefix, lang=lang)


CSS = """
body { font-family: Georgia, "Times New Roman", serif; line-height: 1.5; margin: 1em; }
h1.chapter-title { font-size: 1.4em; text-align: center; margin-bottom: 0.1em; }
p.kicker { text-align: center; text-transform: uppercase; letter-spacing: 0.08em;
           font-size: 0.8em; color: #9a6b1e; margin-bottom: 0.6em; }
p.subtitle { text-align: center; font-style: italic; color: #555; margin-top: 0; }
p { text-align: justify; margin: 0 0 0.8em 0; }
h2 { font-size: 1.15em; margin-top: 1.4em; }
h3 { font-size: 1.05em; margin-top: 1.2em; }
blockquote { margin: 1em 1.5em; font-style: italic; color: #333;
             border-left: 3px solid #c9a227; padding-left: 0.8em; }
figure { text-align: center; margin: 1.2em 0; }
figure img { max-width: 100%; }
figcaption { font-size: 0.8em; color: #666; font-style: italic; margin-top: 0.4em; }
table.cmp { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.85em; }
table.cmp th, table.cmp td { border: 1px solid #ccc; padding: 0.3em 0.5em; text-align: left;
                              vertical-align: top; }
table.cmp th { background: #f0ece0; }
hr { border: none; border-top: 1px solid #bbb; margin: 1.5em 0; }
code { font-family: "Courier New", monospace; font-size: 0.92em; }
nav#toc ol { list-style: none; padding-left: 0; }
nav#toc li { margin: 0.3em 0; }
"""


def resolve_path(base_dir: Path, path_str: str) -> Path:
    p = Path(path_str)
    return p if p.is_absolute() else (base_dir / p).resolve()


def build_epub(toc_path: Path, output_path: Path, sin_ilustraciones: bool = False) -> None:
    toc = json.loads(toc_path.read_text(encoding="utf-8"))
    base_dir = toc_path.parent
    illustrations = toc.get("illustrations", {})
    images = ImageRegistry(base_dir)

    title = toc.get("title", "")
    subtitle = toc.get("subtitle", "")
    author = toc.get("author", "")
    lang = toc.get("language", "es")
    ui = UI_STRINGS.get(lang, UI_STRINGS["es"])
    uid = f"urn:uuid:cuentos-de-tarel-{lang}"

    files: dict[str, str] = {}
    manifest_items: list[tuple[str, str, str]] = []  # id, href, media-type
    spine_ids: list[str] = []
    nav_entries: list[tuple[str, str]] = []

    def add_xhtml(item_id: str, href: str, html: str, nav_title: Optional[str] = None):
        files[f"OEBPS/text/{href}"] = html
        manifest_items.append((item_id, f"text/{href}", "application/xhtml+xml"))
        spine_ids.append(item_id)
        if nav_title:
            nav_entries.append((f"text/{href}", nav_title))

    # --- cover -----------------------------------------------------------
    cover_source = toc.get("cover_image")
    cover_img_path = images.register("cover", cover_source) if cover_source else None
    cover_body = "<section epub:type=\"cover\" style=\"text-align:center;\">"
    if cover_img_path:
        cover_body += f'<img src="../{cover_img_path}" alt="{esc(title)}" style="max-width:100%;"/>'
    cover_body += (f'<h1 class="chapter-title">{esc(title)}</h1>'
                   f'<p class="subtitle">{esc(subtitle)}</p><p>{esc(author)}</p></section>')
    add_xhtml("cover", "cover.xhtml", page(title, cover_body, lang=lang))

    # --- chapters ----------------------------------------------------------
    for chapter in toc["chapters"]:
        content_file = resolve_path(base_dir, chapter["content_file"])
        raw_text = content_file.read_text(encoding="utf-8")
        frontmatter, body = parse_frontmatter(raw_text)

        ctitle = chapter.get("title") or frontmatter.get("title") or chapter["id"]
        csubtitle = chapter.get("subtitle") or frontmatter.get("subtitle")
        section = chapter.get("section") or frontmatter.get("section")
        illustration_ref = chapter.get("illustration") or frontmatter.get("illustrationId")

        head_html = ""
        if section:
            head_html += f'<p class="kicker">{esc(section)}</p>'
        head_html += f'<h1 class="chapter-title">{inline_markup(ctitle)}</h1>'
        if csubtitle:
            head_html += f'<p class="subtitle">{inline_markup(csubtitle)}</p>'

        if illustration_ref and not sin_ilustraciones:
            source = illustrations.get(illustration_ref, illustration_ref)
            epub_path = images.register(illustration_ref, source)
            if epub_path:
                head_html += f'<figure><img src="../{epub_path}" alt="{esc(ctitle)}"/></figure>'

        body_html = markdown_to_xhtml(body, illustrations, images)
        add_xhtml(chapter["id"], f"{chapter['id']}.xhtml",
                  page(ctitle, head_html + body_html, lang=lang), nav_title=ctitle)

    # --- images --------------------------------------------------------
    for epub_path, data in images.files.items():
        files[f"OEBPS/{epub_path}"] = data  # bytes, written as-is below

    # --- nav.xhtml (EPUB3 TOC) -------------------------------------------
    nav_items = "".join(f'<li><a href="{href}">{esc(t)}</a></li>' for href, t in nav_entries)
    nav_html = (f'<nav epub:type="toc" id="toc"><h1>{esc(ui["toc"])}</h1><ol>{nav_items}</ol></nav>')
    files["OEBPS/nav.xhtml"] = page(ui["toc"], nav_html, css_prefix="", lang=lang)
    manifest_items.append(("nav", "nav.xhtml", "application/xhtml+xml"))

    # --- content.opf -------------------------------------------------------
    manifest_xml = "\n".join(
        f'<item id="{iid}" href="{href}" media-type="{mt}"'
        + (' properties="nav"' if iid == "nav" else "")
        + "/>"
        for iid, href, mt in manifest_items
    )
    for epub_path in images.files:
        iid = "img-" + re.sub(r"[^a-zA-Z0-9]", "-", epub_path)
        ext = epub_path.rsplit(".", 1)[-1]
        mt = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg"}.get(ext, "application/octet-stream")
        manifest_xml += f'\n<item id="{iid}" href="{epub_path}" media-type="{mt}"/>'
    spine_xml = "\n".join(f'<itemref idref="{sid}"/>' for sid in spine_ids)

    opf = f"""<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">{uid}</dc:identifier>
    <dc:title>{esc(title)}</dc:title>
    <dc:creator>{esc(author)}</dc:creator>
    <dc:language>{toc.get("language", "es")}</dc:language>
    <dc:description>{esc(subtitle)}</dc:description>
    <meta property="dcterms:modified">{datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}</meta>
  </metadata>
  <manifest>
{manifest_xml}
<item id="css" href="css/style.css" media-type="text/css"/>
  </manifest>
  <spine>
{spine_xml}
  </spine>
</package>
"""
    files["OEBPS/content.opf"] = opf
    files["OEBPS/css/style.css"] = CSS
    files["META-INF/container.xml"] = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">\n'
        '  <rootfiles><rootfile full-path="OEBPS/content.opf" '
        'media-type="application/oebps-package+xml"/></rootfiles>\n'
        "</container>\n"
    )

    with zipfile.ZipFile(output_path, "w") as z:
        z.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        for path, content in files.items():
            data = content if isinstance(content, bytes) else content.encode("utf-8")
            z.writestr(path, data, compress_type=zipfile.ZIP_DEFLATED)

    n_screens = len(spine_ids)
    n_images = len(images.files)
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"{output_path}  —  {n_screens} pantallas, {n_images} imágenes, {size_mb:.1f} MB")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("toc", type=Path)
    parser.add_argument("-o", "--output", type=Path, default=Path("book.epub"))
    parser.add_argument("--sin-ilustraciones", action="store_true",
                         help="Omite las ilustraciones de cada cuento -- para la "
                              "edición sin dibujos. La portada del epub se conserva.")
    args = parser.parse_args()
    build_epub(args.toc, args.output, args.sin_ilustraciones)


if __name__ == "__main__":
    main()
