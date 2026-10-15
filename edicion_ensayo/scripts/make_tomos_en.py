#!/usr/bin/env python3
"""Generates the two hardcover-tomo TOCs from toc_ensayo_en.json:

  toc_tomo1_ensayo_en.json    The Inner Horizon. Essay (tomo I): chapters 0-36,
                               Part Four (51-52 become 37-38), epilogue and appendices.
  toc_tomo2_lecturas_en.json  Topological Readings (tomo II): chapters 37-50
                               as "Reading 1-14".

KDP does not allow hardcover over 550 pages and the single volume runs to 754.
The source text already carries the single-volume numbering; here only the
cross-references that change when the book is split get corrected, via each
chapter's `replace` field. The "Chapter N" references are detected in the
text itself, so there is no table of numbers to keep by hand.

English mirror of make_tomos.py (same algorithm, English regex and strings).

    python3 scripts/make_tomos_en.py     (from edicion_ensayo/)
"""
import copy, json, re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
toc = json.loads((BASE / "toc_ensayo_en.json").read_text(encoding="utf-8"))

def fm(ch):
    s = (BASE / ch["content_file"]).read_text(encoding="utf-8")
    return dict(re.findall(r'^(\w+):\s*"?(.*?)"?\s*$', s.split("---")[1], re.M))

def body(ch):
    return (BASE / ch["content_file"]).read_text(encoding="utf-8")

def key(ch):
    return Path(ch["content_file"]).name

# Capítulos de cierre (relectura formal y herencia) que, para no pasar de las 550
# páginas de la tapa dura, viajan al final del tomo II como lecturas 15-18.
MOVED = (53, 54, 55, 56)
SEC_MOVED = "REREADING AND INHERITANCE"
def _is_lect(c): return fm(c).get("section") == "TOPOLOGICAL READINGS"
def _is_moved(c): return fm(c).get("chapterNumber", "").isdigit() and int(fm(c)["chapterNumber"]) in MOVED
LECT = [c for c in toc["chapters"] if _is_lect(c)]
MOVED_CH = [c for c in toc["chapters"] if _is_moved(c)]
ENS = [c for c in toc["chapters"] if not _is_lect(c) and not _is_moved(c)]
_LECT_MAX = max(int(fm(c)["chapterNumber"]) for c in LECT)
NUM_LECT = {int(fm(c)["chapterNumber"]): i + 1 for i, c in enumerate(LECT + MOVED_CH)}   # 37..50 -> 1..14; 53..56 -> 15..18
# Part Four goes after the readings in the single volume and after Part Three
# in tomo I: 51-52 become the two numbers right after the last essay chapter
# that precedes them.
_ens_nums = [int(fm(c)["chapterNumber"]) for c in ENS if fm(c).get("chapterNumber", "").isdigit()]
_last_before = max(n for n in _ens_nums if n < min(NUM_LECT))
CUARTA = {n: _last_before + 1 + i for i, n in enumerate(sorted(n for n in _ens_nums if n > _LECT_MAX))}

_REF = re.compile(r'\(?[Cc]hapter (\d+)\)?')

def refs(text, tomo):
    """(old, new) pairs for the "Chapter N" references that change in TOMO."""
    out = []
    for m in _REF.finditer(text):
        n = int(m.group(1))
        old = m.group(0)
        if n in NUM_LECT and text[max(0, m.start() - 8):m.start()] == "Note to ":
            continue   # "Note to Chapter N" is changed separately, to "Note to Reading k"
        if n in CUARTA:
            new = re.sub(r'([Cc])hapter \d+', lambda mm: f"{mm.group(1)}hapter {CUARTA[n]}", old)
        elif n in NUM_LECT:
            k = NUM_LECT[n]
            paren = old.startswith("(")
            new = ("Reading" if re.search(r'C(?=hapter)', old) else "reading") + f" {k}"
            if tomo == 1:
                new += " in the second volume"
            if paren:
                new = f"({new})"
            if old.endswith(")") and not paren:
                new += ")"
        else:
            continue
        if (old, new) not in out:
            out.append((old, new))
    # Longest strings first, so "Chapter 41" isn't clobbered by a shorter
    # overlapping match; and only those still present after applying the
    # previous ones, since the builder requires each one to appear.
    kept = []
    for a, b in sorted(out, key=lambda p: -len(p[0])):
        if a in text:
            kept.append((a, b))
            text = text.replace(a, b)
    return kept

# ---- tomo I -----------------------------------------------------------
T1 = {
    "cap_glosario.en.md": [
        ('(chapters 22, 31, 53 and 54)', '(chapters 22 and 31, and Readings 15 and 16 in the second volume)'),
        ('(chapters 53 and 54)', '(Readings 15 and 16 in the second volume)'),
        ('In chapters 53 and 54 it is', 'In Readings 15 and 16 of the second volume it is'),
    ],
    "cap_nota_autor.en.md": [
        ("Several of the topological readings (",
         "Several readings from the second volume, *Topological Readings* (")],
    "prologo.en.md": [("Between the third and the fourth, fourteen topological readings carry the same ideas into fiction, film, art, sport and everyday life.",
                       "A second volume, *Topological Readings*, carries the same ideas into fiction, film, art, sport and everyday life.")],
}

# ---- tomo II ------------------------------------------------------------
T2 = {}

# ---- single volume: the source text already carries its numbering ------
UNICO = {}

def with_replace(ch, table, extra=()):
    ch = copy.deepcopy(ch)
    r = list(table.get(key(ch), [])) + list(extra)
    if r:
        ch["replace"] = [list(x) for x in r]
    return ch

base = {k: v for k, v in toc.items() if k != "chapters"}

# body_leading: slightly tighter leading to stay under the 550 pages KDP
# allows for hardcover.
t1 = dict(base, title="The Inner Horizon", subtitle="Volume I: Essay", running_title="THE INNER HORIZON", gutter_in=0.82,
          body_leading=16.0,
          uid="urn:uuid:el-horizonte-interior-tomo1-ensayo-en",
          cover_image="imagenes/The_Inner_Horizon_Tomo1_Essay_cubierta_ebook.jpg",
          credits=["First volume of The Inner Horizon: the complete essay, from Part One through "
                   "Part Four, with the epilogue, the glossary and the notes. The topological "
                   "readings form the second volume."])
t1["chapters"] = []
for c in ENS:
    c2 = with_replace(c, T1, refs(body(c), 1))
    n = fm(c).get("chapterNumber", "")
    if n.isdigit() and int(n) in CUARTA:
        c2["chapter_number"] = CUARTA[int(n)]
    t1["chapters"].append(c2)

t2 = dict(base, title="The Inner Horizon", subtitle="Volume II: Topological Readings",
          running_title="TOPOLOGICAL READINGS", chapter_word="Reading", gutter_in=0.62,
          uid="urn:uuid:el-horizonte-interior-tomo2-lecturas-en",
          cover_image="imagenes/The_Inner_Horizon_Tomo2_Readings_cubierta_ebook.jpg",
          credits=["Second volume of The Inner Horizon: fourteen readings that carry the essay's "
                   "ideas into fiction, film, sport and everyday life. References to chapters point "
                   "to the first volume, The Inner Horizon. Essay. The volume closes with the section "
                   "\"Rereading and Inheritance\": four chapters that reread the book through the triad of the "
                   "edge, free energy and action, and that treat the inheritance of geometry."])
t2["chapters"] = []
for c in LECT + MOVED_CH:
    n = int(fm(c)["chapterNumber"])
    nota = f"**Note to Chapter {n}**"
    extra = [(nota, f"**Note to Reading {NUM_LECT[n]}**")] if nota in (BASE / c["content_file"]).read_text(encoding="utf-8") else []
    c2 = with_replace(c, T2, refs(body(c), 2) + extra)
    c2["chapter_number"] = NUM_LECT[n]
    c2["section"] = (SEC_MOVED if _is_moved(c) else "")   # no repeated "Topological Readings" header on every reading
    t2["chapters"].append(c2)

t1["chapters"].insert(0, {"id": "intro_vol1", "content_file": "en/intro_vol1.en.md"})
t2["chapters"].insert(0, {"id": "intro_vol2", "content_file": "en/intro_vol2.en.md"})

unico = dict(toc); unico["chapters"] = [with_replace(c, UNICO) for c in toc["chapters"]]

for name, data in (("toc_tomo1_ensayo_en.json", t1), ("toc_tomo2_lecturas_en.json", t2), ("toc_ensayo_en.json", unico)):
    (BASE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(name, len(data["chapters"]), "chapters")
