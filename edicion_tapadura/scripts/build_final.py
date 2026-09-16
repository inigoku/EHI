import build_blocks
import generate_book as gb
import fractal_chapter

blocks = build_blocks.blocks

# --- remove "Lecturas compartidas" entirely (indices 705-710: H2 + 5 paragraphs) ---
del blocks[705:711]

# remove its mention from "El ojo de un solo color"'s own internal "Índice de..." blurb
before = blocks[662]["text"]
blocks[662]["text"] = before.replace(
    " · Lecturas</i> <i>compartidas — quince ficciones, una misma pregunta</i>", "</i>"
)
assert blocks[662]["text"] != before, "Índice blurb replacement did not match"

# --- append the fractal chapter as the closing content of the book ---
gb._patch_blocks_for_missing_glyphs(fractal_chapter.FRACTAL_BLOCKS)
blocks.extend(fractal_chapter.FRACTAL_BLOCKS)
print("total blocks:", len(blocks))


def make_doc(path):
    doc = gb.MyDoc(path, pagesize=(gb.PW, gb.PH),
                leftMargin=gb.MARGIN_GUTTER, rightMargin=gb.MARGIN_OUTER,
                topMargin=gb.MARGIN_TOP, bottomMargin=gb.MARGIN_BOTTOM,
                title="El Horizonte Interior", author="Íñigo Barrera Barceló")
    doc.addPageTemplates([gb.pt_front, gb.pt_body, gb.pt_opener, gb.pt_manga, gb.pt_poem])
    return doc


doc = make_doc("/home/claude/EHI_dryrun.pdf")
story = gb.build_story(add_parity_blank=False)
doc.multiBuild(story)
import pypdf
n = len(pypdf.PdfReader("/home/claude/EHI_dryrun.pdf").pages)
print("dry run pages:", n)
need_blank = (n % 2 != 0)

doc2 = make_doc("/home/claude/EHI_maquetado_full.pdf")
story2 = gb.build_story(add_parity_blank=need_blank)
doc2.multiBuild(story2)
n2 = len(pypdf.PdfReader("/home/claude/EHI_maquetado_full.pdf").pages)
print("final pages:", n2)
