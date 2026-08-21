#!/usr/bin/env python3
"""Generate a book-styled PDF from a table-of-contents JSON file.

Usage:
    python generate_book_pdf.py sample_toc.json -o book.pdf

The ToC JSON declares a title/author/cover, a map of illustration ids to
image paths (local files or http/https URLs), and an ordered list of
chapters. Each chapter points at a markdown file (optionally with YAML
frontmatter, in the same style used under content/ in this repo) and,
optionally, overrides for title/subtitle/section/illustration that would
otherwise be read from that frontmatter.

See sample_toc.json for the schema by example.
"""
from __future__ import annotations

import argparse
import io
import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional

import yaml
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    Image,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

try:  # Make Windows console output behave when text contains non-Latin-1 chars.
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except AttributeError:
    pass

FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n?(.*)\Z", re.DOTALL)
INLINE_ILLUS_RE = re.compile(r'^##\s*\[ILUSTRACI[ÓO]N\s*([\w.]*)?:?\s*"([^"]+)"\]', re.IGNORECASE)

FONT_NAME = "Book"
FONT_NAME_BOLD = "Book-Bold"
FONT_NAME_ITALIC = "Book-Italic"
FONT_NAME_BOLD_ITALIC = "Book-BoldItalic"

# Candidate Unicode-capable font families to look for on the host system,
# in priority order. Falls back to reportlab's built-in Helvetica (which
# only covers WinAnsi / Latin-1 and will drop glyphs like Greek letters)
# if none of these are found.
FONT_CANDIDATES = [
    (
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/ariali.ttf",
        "C:/Windows/Fonts/arialbi.ttf",
    ),
    (
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/segoeuii.ttf",
        "C:/Windows/Fonts/segoeuiz.ttf",
    ),
    (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf",
    ),
    (
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf",
    ),
    (
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Italic.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf",
    ),
]


def register_fonts() -> str:
    """Register a Unicode-capable font family; returns the base font name to use."""
    for regular, bold, italic, bold_italic in FONT_CANDIDATES:
        if all(Path(p).exists() for p in (regular, bold, italic, bold_italic)):
            pdfmetrics.registerFont(TTFont(FONT_NAME, regular))
            pdfmetrics.registerFont(TTFont(FONT_NAME_BOLD, bold))
            pdfmetrics.registerFont(TTFont(FONT_NAME_ITALIC, italic))
            pdfmetrics.registerFont(TTFont(FONT_NAME_BOLD_ITALIC, bold_italic))
            pdfmetrics.registerFontFamily(
                FONT_NAME,
                normal=FONT_NAME,
                bold=FONT_NAME_BOLD,
                italic=FONT_NAME_ITALIC,
                boldItalic=FONT_NAME_BOLD_ITALIC,
            )
            return FONT_NAME
    print(
        "warning: no Unicode TrueType font found on this system; falling back to "
        "Helvetica. Symbols outside Latin-1 (e.g. Greek letters like Φ) will be "
        "dropped from the PDF.",
        file=sys.stderr,
    )
    return "Helvetica"


def parse_frontmatter(raw_text: str) -> tuple[dict, str]:
    """Parse the flat "key: value" frontmatter block used throughout this
    repo's content/*.md files (see src/chapters/loadMarkdown.ts) — deliberately
    not real YAML, since some values (e.g. titles like "PRÓLOGO: EL EXPERIMENTO")
    contain a colon themselves and would otherwise need quoting."""
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


def resolve_path(base_dir: Path, path_str: str) -> Path:
    p = Path(path_str)
    if p.is_absolute():
        return p
    return (base_dir / p).resolve()


def is_url(path_str: str) -> bool:
    return path_str.startswith("http://") or path_str.startswith("https://")


_image_cache: dict = {}
_last_request_time = 0.0
_MIN_REQUEST_INTERVAL = 1.0  # seconds between outgoing requests, to avoid tripping rate limits
_MAX_RETRIES = 4


def _fetch_url(path_str: str, ca_bundle: Optional[str]) -> bytes:
    global _last_request_time
    ctx = ssl.create_default_context(cafile=ca_bundle) if ca_bundle else None
    # Wikimedia (and some other hosts) reject requests with no/blank
    # User-Agent, so identify ourselves as a real browser-ish client.
    request = urllib.request.Request(
        path_str, headers={"User-Agent": "Mozilla/5.0 (compatible; generate-book-pdf/1.0)"}
    )
    for attempt in range(1, _MAX_RETRIES + 1):
        wait = _MIN_REQUEST_INTERVAL - (time.monotonic() - _last_request_time)
        if wait > 0:
            time.sleep(wait)
        try:
            _last_request_time = time.monotonic()
            with urllib.request.urlopen(request, timeout=15, context=ctx) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:
            _last_request_time = time.monotonic()
            if exc.code == 429 and attempt < _MAX_RETRIES:
                retry_after = exc.headers.get("Retry-After") if exc.headers else None
                delay = float(retry_after) if retry_after and retry_after.isdigit() else 2 ** attempt
                print(f"  ({path_str}: rate-limited, retrying in {delay:.0f}s "
                      f"[{attempt}/{_MAX_RETRIES}])", file=sys.stderr)
                time.sleep(delay)
                continue
            raise
    raise RuntimeError("unreachable")  # loop always returns or raises


def load_image_bytes(path_str: str, base_dir: Path, ca_bundle: Optional[str]) -> Optional[bytes]:
    """Load image bytes from a local path or a remote URL. Returns None (and
    warns on stderr) rather than raising, so one bad illustration never
    aborts the whole book. Remote fetches are cached, throttled, and retried
    with backoff on HTTP 429 (Wikimedia rate-limits bursts of anonymous
    requests, which a multi-image chapter will otherwise trigger easily)."""
    if is_url(path_str):
        if path_str in _image_cache:
            return _image_cache[path_str]
        try:
            data = _fetch_url(path_str, ca_bundle)
            _image_cache[path_str] = data
            return data
        except Exception as exc:  # noqa: BLE001 - deliberately broad, this is a best-effort fetch
            print(f"warning: could not download illustration '{path_str}': {exc}", file=sys.stderr)
            return None
    resolved = resolve_path(base_dir, path_str)
    if not resolved.exists():
        print(f"warning: illustration file not found: {resolved}", file=sys.stderr)
        return None
    return resolved.read_bytes()


def make_image_flowable(image_bytes: bytes, max_width: float, max_height: float) -> Optional[Image]:
    try:
        with PILImage.open(io.BytesIO(image_bytes)) as im:
            width, height = im.size
    except Exception as exc:  # noqa: BLE001
        print(f"warning: could not read illustration image data: {exc}", file=sys.stderr)
        return None
    scale = min(max_width / width, max_height / height)
    return Image(io.BytesIO(image_bytes), width=width * scale, height=height * scale)


def escape_xml(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def inline_markdown_to_markup(text: str) -> str:
    """Escape a line of markdown text and convert **bold**/*italic* to
    reportlab's mini-markup tags."""
    text = escape_xml(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    return text


def build_styles(base_font: str):
    styles = getSampleStyleSheet()

    def font(weight: str = "") -> str:
        if base_font == "Helvetica":
            return f"Helvetica{weight}"
        return {
            "": FONT_NAME,
            "-Bold": FONT_NAME_BOLD,
            "-Oblique": FONT_NAME_ITALIC,
            "-BoldOblique": FONT_NAME_BOLD_ITALIC,
        }[weight]

    custom = {
        "CoverTitle": ParagraphStyle(
            "CoverTitle", parent=styles["Title"], fontName=font("-Bold"),
            fontSize=30, leading=36, spaceAfter=12, alignment=1,
        ),
        "CoverSubtitle": ParagraphStyle(
            "CoverSubtitle", parent=styles["Normal"], fontName=font("-Oblique"),
            fontSize=14, leading=18, alignment=1, textColor=colors.HexColor("#444444"),
        ),
        "CoverAuthor": ParagraphStyle(
            "CoverAuthor", parent=styles["Normal"], fontName=font(),
            fontSize=13, leading=16, alignment=1, spaceBefore=18,
        ),
        "TOCHeading": ParagraphStyle(
            "TOCHeading", parent=styles["Title"], fontName=font("-Bold"),
            fontSize=20, spaceAfter=18,
        ),
        "ChapterKicker": ParagraphStyle(
            "ChapterKicker", parent=styles["Normal"], fontName=font("-Bold"),
            fontSize=9, leading=12, alignment=1, textColor=colors.HexColor("#9a6b1e"),
            spaceAfter=6,
        ),
        "ChapterTitle": ParagraphStyle(
            "ChapterTitle", parent=styles["Title"], fontName=font("-Bold"),
            fontSize=22, leading=27, alignment=1, spaceAfter=6,
        ),
        "ChapterSubtitle": ParagraphStyle(
            "ChapterSubtitle", parent=styles["Normal"], fontName=font("-Oblique"),
            fontSize=12, leading=16, alignment=1, textColor=colors.HexColor("#555555"),
            spaceAfter=16,
        ),
        "H2": ParagraphStyle(
            "H2", parent=styles["Heading2"], fontName=font("-Bold"),
            fontSize=14, leading=18, spaceBefore=14, spaceAfter=8,
        ),
        "H3": ParagraphStyle(
            "H3", parent=styles["Heading3"], fontName=font("-Bold"),
            fontSize=12.5, leading=16, spaceBefore=10, spaceAfter=6,
        ),
        "Body": ParagraphStyle(
            "Body", parent=styles["Normal"], fontName=font(),
            fontSize=10.5, leading=15.5, spaceAfter=8, alignment=4,  # 4 = justify
        ),
        "Quote": ParagraphStyle(
            "Quote", parent=styles["Normal"], fontName=font("-Oblique"),
            fontSize=10, leading=14, leftIndent=18, spaceBefore=6, spaceAfter=8,
            textColor=colors.HexColor("#333333"),
            borderColor=colors.HexColor("#c9a227"), borderWidth=0, borderPadding=0,
        ),
        "Caption": ParagraphStyle(
            "Caption", parent=styles["Normal"], fontName=font("-Oblique"),
            fontSize=8.5, leading=11, alignment=1, textColor=colors.HexColor("#666666"),
            spaceAfter=10,
        ),
        "TOCEntry": ParagraphStyle(
            "TOCEntry", parent=styles["Normal"], fontName=font(),
            fontSize=11, leading=16,
        ),
    }
    for style in custom.values():
        styles.add(style)
    return styles


SEPARATOR_ROW_RE = re.compile(r"^\|[\s:|-]+\|$")


def build_table(table_lines: list, styles, content_width: float) -> Optional[Table]:
    """Parse a block of consecutive "| cell | cell |" lines into a reportlab
    Table. The first data row is treated as a header if there is more than
    one row left after dropping any "|---|---|" separator row."""
    rows = [line for line in table_lines if not SEPARATOR_ROW_RE.match(line)]
    if not rows:
        return None

    def split_cells(line: str) -> list:
        return [cell.strip() for cell in line.strip("|").split("|")]

    parsed_rows = [split_cells(row) for row in rows]
    has_header = len(parsed_rows) > 1
    header_style = ParagraphStyle("TableHeader", parent=styles["Body"], fontName=styles["Body"].fontName,
                                  alignment=0)
    cell_style = ParagraphStyle("TableCell", parent=styles["Body"], alignment=0, spaceAfter=0)

    data = []
    for row_idx, row in enumerate(parsed_rows):
        is_header_row = has_header and row_idx == 0
        style = header_style if is_header_row else cell_style
        data.append([Paragraph(inline_markdown_to_markup(cell), style) for cell in row])

    if not data:
        return None
    num_cols = max(len(row) for row in data)
    col_width = content_width / num_cols
    table = Table(data, colWidths=[col_width] * num_cols, hAlign="LEFT")
    style_commands = [
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if has_header:
        style_commands.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0ece0")))
    table.setStyle(TableStyle(style_commands))
    return table


def markdown_to_flowables(body: str, styles, illustrations: dict, base_dir: Path,
                           content_width: float, ca_bundle: Optional[str]) -> list:
    flowables: list = []
    lines = body.split("\n")
    i = 0
    while i < len(lines):
        raw_line = lines[i]
        stripped = raw_line.strip()

        if not stripped:
            flowables.append(Spacer(1, 4))
            i += 1
            continue

        if stripped == "---":
            flowables.append(HRFlowable(width="100%", thickness=0.6,
                                         color=colors.HexColor("#bbbbbb"),
                                         spaceBefore=8, spaceAfter=8))
            i += 1
            continue

        if stripped.startswith("|") and stripped.endswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            table_flowable = build_table(table_lines, styles, content_width)
            if table_flowable:
                flowables.append(Spacer(1, 4))
                flowables.append(table_flowable)
                flowables.append(Spacer(1, 8))
            continue

        illus_match = INLINE_ILLUS_RE.match(stripped)
        if illus_match:
            illus_id, illus_title = illus_match.group(1), illus_match.group(2)
            caption = ""
            j = i + 1
            while j < len(lines) and lines[j].strip() == "":
                j += 1
            if j < len(lines) and lines[j].strip().startswith("*") and lines[j].strip().endswith("*"):
                caption = lines[j].strip()[1:-1]
                j += 1
            image_source = illustrations.get(illus_id) if illus_id else None
            if image_source:
                image_bytes = load_image_bytes(image_source, base_dir, ca_bundle)
                if image_bytes:
                    flowable = make_image_flowable(image_bytes, content_width * 0.85, 260)
                    if flowable:
                        flowables.append(Spacer(1, 8))
                        flowables.append(flowable)
                        flowables.append(Paragraph(
                            inline_markdown_to_markup(caption or illus_title), styles["Caption"],
                        ))
            else:
                print(f"warning: no illustration mapping for id '{illus_id}' "
                      f"(title: \"{illus_title}\")", file=sys.stderr)
            i = j
            continue

        if stripped.startswith("### "):
            flowables.append(Paragraph(inline_markdown_to_markup(stripped[4:]), styles["H3"]))
            i += 1
            continue

        if stripped.startswith("## "):
            flowables.append(Paragraph(inline_markdown_to_markup(stripped[3:]), styles["H2"]))
            i += 1
            continue

        if stripped.startswith(">"):
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                content = lines[i].strip()[1:].strip()
                if content:
                    quote_lines.append(content)
                i += 1
            joined = "<br/>".join(inline_markdown_to_markup(q) for q in quote_lines)
            if joined:
                flowables.append(Paragraph(joined, styles["Quote"]))
            continue

        if stripped.startswith("- ") or stripped.startswith("* "):
            flowables.append(Paragraph("&bull;&nbsp;&nbsp;" + inline_markdown_to_markup(stripped[2:]),
                                        styles["Body"]))
            i += 1
            continue

        flowables.append(Paragraph(inline_markdown_to_markup(stripped), styles["Body"]))
        i += 1

    return flowables


class BookDocTemplate(BaseDocTemplate):
    """A BaseDocTemplate that records chapter-title flowables into the
    TableOfContents and registers PDF outline/bookmark entries, and draws a
    centred page number in the footer of every content page."""

    def __init__(self, filename: str, **kwargs):
        super().__init__(filename, **kwargs)
        self.page_width, self.page_height = kwargs["pagesize"]
        margin = 2.2 * cm
        frame = Frame(margin, margin, self.page_width - 2 * margin,
                       self.page_height - 2 * margin, id="content")
        cover_frame = Frame(0, 0, self.page_width, self.page_height, id="cover")
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[cover_frame]),
            PageTemplate(id="normal", frames=[frame], onPage=self._draw_page_number),
        ])

    def _draw_page_number(self, canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(colors.HexColor("#888888"))
        canvas.drawCentredString(self.page_width / 2, 1.3 * cm, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "ChapterTitle":
            text = flowable.getPlainText()
            key = f"chapter-{id(flowable)}"
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=0, closed=False)
            self.notify("TOCEntry", (0, text, self.page))


def build_pdf(toc_path: Path, output_path: Path, ca_bundle: Optional[str]) -> None:
    with toc_path.open("r", encoding="utf-8") as fh:
        if toc_path.suffix in (".yml", ".yaml"):
            toc = yaml.safe_load(fh)
        else:
            toc = json.load(fh)

    base_dir = toc_path.parent
    illustrations = toc.get("illustrations", {})

    base_font = register_fonts()
    styles = build_styles(base_font)

    page_size = LETTER
    doc = BookDocTemplate(str(output_path), pagesize=page_size,
                          title=toc.get("title", ""), author=toc.get("author", ""))
    content_width = page_size[0] - 2 * 2.2 * cm

    story: list = []

    # --- Cover page -----------------------------------------------------
    story.append(NextPageTemplate("cover"))
    cover_image_source = toc.get("cover_image")
    if cover_image_source:
        image_bytes = load_image_bytes(cover_image_source, base_dir, ca_bundle)
        if image_bytes:
            flowable = make_image_flowable(image_bytes, page_size[0] - 6 * cm, page_size[1] - 10 * cm)
            if flowable:
                story.append(Spacer(1, 3 * cm))
                story.append(flowable)
    story.append(Spacer(1, 1.2 * cm))
    story.append(Paragraph(escape_xml(toc.get("title", "")), styles["CoverTitle"]))
    if toc.get("subtitle"):
        story.append(Paragraph(escape_xml(toc["subtitle"]), styles["CoverSubtitle"]))
    if toc.get("author"):
        story.append(Paragraph(escape_xml(toc["author"]), styles["CoverAuthor"]))
    story.append(PageBreak())

    # --- Table of contents ------------------------------------------------
    story.append(NextPageTemplate("normal"))
    story.append(Paragraph("Índice" if is_spanish(toc) else "Contents", styles["TOCHeading"]))
    table_of_contents = TableOfContents()
    table_of_contents.levelStyles = [styles["TOCEntry"]]
    story.append(table_of_contents)
    story.append(PageBreak())

    # --- Chapters ---------------------------------------------------------
    for chapter in toc["chapters"]:
        content_file = resolve_path(base_dir, chapter["content_file"])
        raw_text = content_file.read_text(encoding="utf-8")
        frontmatter, body = parse_frontmatter(raw_text)

        title = chapter.get("title") or frontmatter.get("title") or chapter["id"]
        subtitle = chapter.get("subtitle") or frontmatter.get("subtitle")
        section = chapter.get("section") or frontmatter.get("section")
        illustration_ref = chapter.get("illustration") or frontmatter.get("illustrationId")

        story.append(Spacer(1, 0.6 * cm))
        if section:
            story.append(Paragraph(escape_xml(section.upper()), styles["ChapterKicker"]))
        story.append(Paragraph(escape_xml(title), styles["ChapterTitle"]))
        if subtitle:
            story.append(Paragraph(escape_xml(subtitle), styles["ChapterSubtitle"]))

        if illustration_ref:
            image_source = illustrations.get(illustration_ref, illustration_ref)
            image_bytes = load_image_bytes(image_source, base_dir, ca_bundle)
            if image_bytes:
                flowable = make_image_flowable(image_bytes, content_width * 0.75, 260)
                if flowable:
                    story.append(flowable)
                    story.append(Spacer(1, 10))

        story.extend(markdown_to_flowables(body, styles, illustrations, base_dir,
                                            content_width, ca_bundle))
        story.append(PageBreak())

    if story and isinstance(story[-1], PageBreak):
        story.pop()

    doc.multiBuild(story)
    print(f"Wrote {output_path}")


def is_spanish(toc: dict) -> bool:
    """Decide whether to label the contents page "Índice" or "Contents".
    Honors an explicit top-level "language" field (e.g. "es"/"en") if
    present; otherwise guesses from accented characters in title/subtitle."""
    language = toc.get("language")
    if language:
        return language.lower().startswith("es")
    sample = " ".join([toc.get("title", ""), toc.get("subtitle", "")])
    return any(ch in sample for ch in "áéíóúñ¿¡ÁÉÍÓÚÑ")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                      formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("toc", type=Path, help="Path to the ToC JSON file")
    parser.add_argument("-o", "--output", type=Path, default=Path("book.pdf"),
                         help="Output PDF path (default: book.pdf)")
    parser.add_argument("--ca-bundle", type=str, default=None,
                         help="Optional CA bundle path for fetching https:// illustrations "
                              "from behind a corporate proxy/TLS-inspecting firewall")
    args = parser.parse_args()

    if not args.toc.exists():
        parser.error(f"ToC file not found: {args.toc}")

    build_pdf(args.toc, args.output, args.ca_bundle)


if __name__ == "__main__":
    main()
