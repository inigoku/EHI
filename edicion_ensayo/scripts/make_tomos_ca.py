#!/usr/bin/env python3
"""Generates the two hardcover-tomo TOCs from toc_ensayo_ca.json:

  toc_tomo1_ensayo_ca.json    L'Horitzó Interior. Assaig (tom I): capítols 0-36,
                               Quarta part (51-52 passen a 37-38), epíleg i apèndixs.
  toc_tomo2_lecturas_ca.json  Lectures topològiques (tom II): capítols 37-50
                               com «Lectura 1-14».

KDP no admet tapa dura de més de 550 pàgines i el volum únic passa de 700.
El text font ja porta la numeració del volum únic; aquí només es corregeixen,
amb el camp `replace` de cada capítol, les remissions que canvien en partir
el llibre. Les remissions «Capítol N» es detecten en el propi text, així que
no cal mantenir a mà cap taula de números.

Espill català de make_tomos_en.py (mateix algorisme, regex i cadenes en
català).

    python3 scripts/make_tomos_ca.py     (des de edicion_ensayo/)
"""
import copy, json, re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
toc = json.loads((BASE / "toc_ensayo_ca.json").read_text(encoding="utf-8"))

def fm(ch):
    s = (BASE / ch["content_file"]).read_text(encoding="utf-8")
    return dict(re.findall(r'^(\w+):\s*"?(.*?)"?\s*$', s.split("---")[1], re.M))

def body(ch):
    return (BASE / ch["content_file"]).read_text(encoding="utf-8")

def key(ch):
    return Path(ch["content_file"]).name

LECT = [c for c in toc["chapters"] if fm(c).get("section") == "LECTURES TOPOLÒGIQUES"]
ENS = [c for c in toc["chapters"] if fm(c).get("section") != "LECTURES TOPOLÒGIQUES"]
NUM_LECT = {int(fm(c)["chapterNumber"]): i + 1 for i, c in enumerate(LECT)}   # 37..50 -> 1..14
# La quarta part va darrere de les lectures en el volum únic i darrere de la
# tercera part en el tom I: 51-52 passen a ser els dos següents al darrer
# capítol de l'assaig que els precedeix.
_ens_nums = [int(fm(c)["chapterNumber"]) for c in ENS if fm(c).get("chapterNumber", "").isdigit()]
_last_before = max(n for n in _ens_nums if n < min(NUM_LECT))
CUARTA = {n: _last_before + 1 + i for i, n in enumerate(sorted(n for n in _ens_nums if n > max(NUM_LECT)))}

_REF = re.compile(r'\(?Cap[ií]tol (\d+)\)?')

def refs(text, tomo):
    """Parells (vell, nou) per a les remissions «Capítol N» que canvien a TOMO."""
    out = []
    for m in _REF.finditer(text):
        n = int(m.group(1))
        old = m.group(0)
        if n in NUM_LECT and text[max(0, m.start() - 8):m.start()] == "Nota al ":
            continue   # «Nota al Capítol N» es canvia a part, per «Nota a la lectura k»
        if n in CUARTA:
            new = re.sub(r'Cap[ií]tol \d+', f"Capítol {CUARTA[n]}", old)
        elif n in NUM_LECT:
            k = NUM_LECT[n]
            paren = old.startswith("(")
            new = f"lectura {k}"
            if tomo == 1:
                new += " del segon volum"
            if paren:
                new = f"({new})"
            if old.endswith(")") and not paren:
                new += ")"
        else:
            continue
        if (old, new) not in out:
            out.append((old, new))
    # Les cadenes més llargues primer, perquè «Capítol 41» no el pisi un
    # «Capítol 4» més curt; i només les que segueixin presents després
    # d'aplicar les anteriors, perquè el constructor exigeix que cadascuna
    # aparegui.
    kept = []
    for a, b in sorted(out, key=lambda p: -len(p[0])):
        if a in text:
            kept.append((a, b))
            text = text.replace(a, b)
    return kept

# ---- tom I ---------------------------------------------------------------
T1 = {
    "cap_nota_autor.ca.md": [
        ("Diverses de les lectures topològiques (",
         "Diverses lectures del segon volum, *Lectures topològiques* (")],
    "prologo.ca.md": [("Entre la tercera i la quarta, catorze lectures topològiques porten les mateixes idees a la ficció, el cinema, l'art, l'esport i la vida quotidiana.",
                       "Un segon volum, *Lectures topològiques*, porta les mateixes idees a la ficció, el cinema, l'art, l'esport i la vida quotidiana.")],
}

# ---- tom II ---------------------------------------------------------------
T2 = {}

# ---- volum únic: el text font ja porta la seva numeració ------------------
UNICO = {}

def with_replace(ch, table, extra=()):
    ch = copy.deepcopy(ch)
    r = list(table.get(key(ch), [])) + list(extra)
    if r:
        ch["replace"] = [list(x) for x in r]
    return ch

base = {k: v for k, v in toc.items() if k != "chapters"}

# body_leading: interlineat una mica més prieto per no passar de les 550
# pàgines que admet KDP en tapa dura.
t1 = dict(base, subtitle="Assaig · Volum I", running_title="L'HORITZÓ INTERIOR", gutter_in=0.82,
          body_leading=16.0,
          uid="urn:uuid:el-horizonte-interior-tomo1-ensayo-ca",
          cover_image="imagenes/El_Horitzo_Interior_Tom1_Assaig_cubierta_ebook.jpg",
          credits=["Primer volum de L'Horitzó Interior: l'assaig complet, de la primera a la quarta "
                   "part, amb l'epíleg, el glossari i les notes. Les lectures topològiques formen el "
                   "segon volum."])
t1["chapters"] = []
for c in ENS:
    c2 = with_replace(c, T1, refs(body(c), 1))
    n = fm(c).get("chapterNumber", "")
    if n.isdigit() and int(n) in CUARTA:
        c2["chapter_number"] = CUARTA[int(n)]
    t1["chapters"].append(c2)

t2 = dict(base, title="Lectures topològiques", subtitle="L'Horitzó Interior · Volum II",
          running_title="LECTURES TOPOLÒGIQUES", chapter_word="Lectura", gutter_in=0.62,
          uid="urn:uuid:el-horizonte-interior-tomo2-lecturas-ca",
          cover_image="imagenes/El_Horitzo_Interior_Tom2_Lectures_cubierta_ebook.jpg",
          credits=["Segon volum de L'Horitzó Interior: catorze lectures que porten les idees de "
                   "l'assaig a la ficció, el cinema, l'esport i la vida quotidiana. Les remissions a "
                   "capítols apunten al primer volum, L'Horitzó Interior. Assaig."])
t2["chapters"] = []
for c in LECT:
    n = int(fm(c)["chapterNumber"])
    nota = f"**Nota al Capítol {n}**"
    extra = [(nota, f"**Nota a la lectura {NUM_LECT[n]}**")] if nota in (BASE / c["content_file"]).read_text(encoding="utf-8") else []
    c2 = with_replace(c, T2, refs(body(c), 2) + extra)
    c2["chapter_number"] = NUM_LECT[n]
    c2["section"] = ""   # sense la capçalera «Lectures topològiques» repetida a cada lectura
    t2["chapters"].append(c2)

unico = dict(toc); unico["chapters"] = [with_replace(c, UNICO) for c in toc["chapters"]]

for name, data in (("toc_tomo1_ensayo_ca.json", t1), ("toc_tomo2_lecturas_ca.json", t2), ("toc_ensayo_ca.json", unico)):
    (BASE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(name, len(data["chapters"]), "capítols")
