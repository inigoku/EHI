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

# Mecanismo para mandar capítulos del ensayo al final del tomo II (como lecturas
# 15 en adelante). Hoy está vacío.
MOVED = ()   # vacío: los borradores de la sección «Work in progress» no entran en los libros
SEC_MOVED = "RELECTURA I HERÈNCIA"
def _is_lect(c): return fm(c).get("section") == "LECTURES TOPOLÒGIQUES"
def _is_moved(c): return fm(c).get("chapterNumber", "").isdigit() and int(fm(c)["chapterNumber"]) in MOVED
LECT = [c for c in toc["chapters"] if _is_lect(c)]
MOVED_CH = [c for c in toc["chapters"] if _is_moved(c)]
ENS = [c for c in toc["chapters"] if not _is_lect(c) and not _is_moved(c)]
_LECT_MAX = max(int(fm(c)["chapterNumber"]) for c in LECT)
NUM_LECT = {int(fm(c)["chapterNumber"]): i + 1 for i, c in enumerate(LECT + MOVED_CH)}   # 37..50 -> 1..14; 53..56 -> 15..18
# La quarta part va darrere de les lectures en el volum únic i darrere de la
# tercera part en el tom I: 51-52 passen a ser els dos següents al darrer
# capítol de l'assaig que els precedeix.
_ens_nums = [int(fm(c)["chapterNumber"]) for c in ENS if fm(c).get("chapterNumber", "").isdigit()]
_last_before = max(n for n in _ens_nums if n < min(NUM_LECT))
CUARTA = {n: _last_before + 1 + i for i, n in enumerate(sorted(n for n in _ens_nums if n > _LECT_MAX))}

_REF = re.compile(r'\(?[Cc]ap[ií]tol (\d+)\)?')

def refs(text, tomo):
    """Parells (vell, nou) per a les remissions «Capítol N» que canvien a TOMO."""
    out = []
    for m in _REF.finditer(text):
        n = int(m.group(1))
        old = m.group(0)
        if n in NUM_LECT and text[max(0, m.start() - 8):m.start()] == "Nota al ":
            continue   # «Nota al Capítol N» es canvia a part, per «Nota a la lectura k»
        if n in CUARTA:
            new = re.sub(r'([Cc])ap[ií]tol \d+', lambda mm: f"{mm.group(1)}apítol {CUARTA[n]}", old)
        elif n in NUM_LECT:
            k = NUM_LECT[n]
            paren = old.startswith("(")
            new = ("Lectura" if re.search(r'C(?=ap[ií]tol)', old) else "lectura") + f" {k}"
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

# ---- el glosario impreso no incluye la sección «Work in progress» ------------
_GLOS_KEY = 'cap_glosario.ca.md'
_WIP_HEADS = ['Acció entròpica', 'Autosemblança causal', 'Energia lliure', "Tríada de l'horitzó", 'Entropia de la vora', 'Manta de Markov']
_GLOS_SUBS = [('\\(capítols 22 i 31 i secció «Work in progress»\\)', '(capítols 22 i 31)'), (' A la secció «Work in progress»[^\\n]*', '')]

def _glossary_fixes():
    """Quita del glosario impreso las entradas que solo describen los borradores
    y las remisiones a ellos en las demás."""
    ch = next(c for c in toc["chapters"] if key(c) == _GLOS_KEY)
    text = body(ch)
    out = []
    for line in text.split("\n"):
        if any(line.startswith("**" + h) for h in _WIP_HEADS):
            out.append((line + "\n\n", ""))
    for pat, rep in _GLOS_SUBS:
        for m in re.finditer(pat, text):
            out.append((m.group(0), rep))
    return out

def _apply(text, pairs):
    for a, b in pairs:
        text = text.replace(a, b)
    return text

T1[_GLOS_KEY] = _glossary_fixes()
UNICO[_GLOS_KEY] = _glossary_fixes()

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
    c2 = with_replace(c, T1, refs(_apply(body(c), T1.get(key(c), [])), 1))
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
for c in LECT + MOVED_CH:
    n = int(fm(c)["chapterNumber"])
    nota = f"**Nota al Capítol {n}**"
    extra = [(nota, f"**Nota a la lectura {NUM_LECT[n]}**")] if nota in (BASE / c["content_file"]).read_text(encoding="utf-8") else []
    c2 = with_replace(c, T2, refs(body(c), 2) + extra)
    c2["chapter_number"] = NUM_LECT[n]
    c2["section"] = (SEC_MOVED if _is_moved(c) else "")   # sense la capçalera «Lectures topològiques» repetida a cada lectura
    t2["chapters"].append(c2)

t1["chapters"].insert(0, {"id": "intro_vol1", "content_file": "intros/intro_vol1.ca.md"})
t2["chapters"].insert(0, {"id": "intro_vol2", "content_file": "intros/intro_vol2.ca.md"})

unico = dict(toc); unico["chapters"] = [with_replace(c, UNICO) for c in toc["chapters"]]

for name, data in (("toc_tomo1_ensayo_ca.json", t1), ("toc_tomo2_lecturas_ca.json", t2), ("toc_ensayo_ca.json", unico)):
    (BASE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(name, len(data["chapters"]), "capítols")
