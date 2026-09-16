import build_blocks
import generate_book_bleed as gb
import fractal_chapter
import pypdf
import fitz

blocks = build_blocks.blocks

# --- same content edits as the final PDF ---
del blocks[705:711]
before = blocks[662]["text"]
blocks[662]["text"] = before.replace(
    " · Lecturas</i> <i>compartidas — quince ficciones, una misma pregunta</i>", "</i>"
)
assert blocks[662]["text"] != before

gb._patch_blocks_for_missing_glyphs(fractal_chapter.FRACTAL_BLOCKS)
blocks.extend(fractal_chapter.FRACTAL_BLOCKS)

# order in which plates appear in the book
plate_order = []
for b in blocks:
    if b["type"] == "H1":
        c = gb.clean_markup(b["text"])
        if c in gb.PLATE_MAP:
            plate_order.append(gb.PLATE_MAP[c])
print("plates in order:", plate_order)


def make_doc(path):
    doc = gb.MyDoc(path, pagesize=(gb.PW, gb.PH),
                   leftMargin=gb.FRAME_X, rightMargin=gb.FRAME_X,
                   topMargin=gb.MARGIN_TOP, bottomMargin=gb.MARGIN_BOTTOM,
                   title="El Horizonte Interior", author="Íñigo Barrera Barceló")
    doc.addPageTemplates([gb.pt_front, gb.pt_body, gb.pt_opener,
                          gb.pt_manga, gb.pt_poem, gb.pt_plate])
    return doc


def build(path, blanks, parity):
    doc = make_doc(path)
    doc.multiBuild(gb.build_story(add_parity_blank=parity, plate_blanks=blanks))
    return len(pypdf.PdfReader(path).pages)


def plate_pages(path):
    d = fitz.open(path)
    pages = []
    for i in range(d.page_count):
        if d[i].get_images() and not d[i].get_text().strip():
            pages.append(i + 1)
    d.close()
    return pages


blanks = set()
TMP = "/home/claude/EHI_iter.pdf"

# Greedy izquierda->derecha: arreglar la lámina i no altera las anteriores,
# así que en una pasada por lámina quedan todas en par.
build(TMP, blanks, False)
for i, pid in enumerate(plate_order):
    pp = plate_pages(TMP)
    assert len(pp) == len(plate_order)
    if pp[i] % 2 == 1:
        blanks ^= {pid}
        build(TMP, blanks, False)
        pp = plate_pages(TMP)
        assert pp[i] % 2 == 0, f"{pid} sigue en impar ({pp[i]})"
    print(f"  {pid}: pág. {plate_pages(TMP)[i]}")

pp = plate_pages(TMP)
odd = [plate_order[i] for i, pg in enumerate(pp) if pg % 2 == 1]
print("en impar tras la pasada:", odd or "ninguna")

# final pass with even-page parity for the whole book
n = build("/home/claude/EHI_bleed_dry.pdf", blanks, False)
need = (n % 2 != 0)
n2 = build("/home/claude/EHI_tapadura.pdf", blanks, need)
print("final pages:", n2, "| blanks antes de lámina:", sorted(blanks))
print("plate pages:", plate_pages("/home/claude/EHI_tapadura.pdf"))
