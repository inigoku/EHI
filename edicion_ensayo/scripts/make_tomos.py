#!/usr/bin/env python3
"""Genera los TOC de los dos tomos de tapa dura a partir de toc_ensayo.json:

  toc_tomo1_ensayo.json    El Horizonte Interior. Ensayo (tomo I): capítulos 0-36,
                           Cuarta parte (51-52 pasan a 37-38), epílogo y apéndices.
  toc_tomo2_lecturas.json  Lecturas topológicas (tomo II): los capítulos 37-50
                           como «Lectura 1-14».

KDP no admite tapa dura de más de 550 páginas y el volumen único pasa de 770.
El texto fuente ya lleva la numeración del volumen único; aquí solo se corrigen,
con el campo `replace` de cada capítulo, las referencias que cambian al partir
el libro. Las remisiones «capítulo N» se detectan en el propio texto, así que
no hay que mantener a mano ninguna tabla de números.

    python3 scripts/make_tomos.py     (desde edicion_ensayo/)
"""
import copy, json, re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
toc = json.loads((BASE / "toc_ensayo.json").read_text(encoding="utf-8"))

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
SEC_MOVED = "RELECTURA Y HERENCIA"
def _is_lect(c): return fm(c).get("section") == "LECTURAS TOPOLÓGICAS"
def _is_moved(c): return fm(c).get("chapterNumber", "").isdigit() and int(fm(c)["chapterNumber"]) in MOVED
LECT = [c for c in toc["chapters"] if _is_lect(c)]
MOVED_CH = [c for c in toc["chapters"] if _is_moved(c)]
ENS = [c for c in toc["chapters"] if not _is_lect(c) and not _is_moved(c)]
_LECT_MAX = max(int(fm(c)["chapterNumber"]) for c in LECT)
NUM_LECT = {int(fm(c)["chapterNumber"]): i + 1 for i, c in enumerate(LECT + MOVED_CH)}   # 37..50 -> 1..14; 53..56 -> 15..18
# La cuarta parte va detrás de las lecturas en el volumen único y detrás de la
# tercera parte en el tomo I: 51-52 pasan a ser los dos siguientes al último
# capítulo del ensayo que las precede.
_ens_nums = [int(fm(c)["chapterNumber"]) for c in ENS if fm(c).get("chapterNumber", "").isdigit()]
_last_before = max(n for n in _ens_nums if n < min(NUM_LECT))
CUARTA = {n: _last_before + 1 + i for i, n in enumerate(sorted(n for n in _ens_nums if n > _LECT_MAX))}

_REF = re.compile(r'(?:\b([Ee]n el|[Dd]el|[Aa]l|[Ee]l) )?\(?[Cc]apítulo (\d+)\)?')
_ART = {"en el": "en la", "del": "de la", "al": "a la", "el": "la"}

def refs(text, tomo):
    """Pares (viejo, nuevo) para las remisiones «capítulo N» que cambian en TOMO."""
    out = []
    for m in _REF.finditer(text):
        n = int(m.group(2))
        old = m.group(0)
        if n in NUM_LECT and text[max(0, m.start() - 5):m.start()] == "Nota ":
            continue   # «Nota al Capítulo N» se cambia aparte, por «Nota a la lectura k»
        if n in CUARTA:
            new = old.replace(f"apítulo {n}", f"apítulo {CUARTA[n]}")
        elif n in NUM_LECT:
            k = NUM_LECT[n]
            art = m.group(1)
            paren = old.startswith("(")
            if art:
                a = _ART[art.lower()]
                a = a[0].upper() + a[1:] if art[0].isupper() else a
                new = f"{a} lectura {k}"
            else:
                new = f"lectura {k}"
            if tomo == 1:
                new += " del segundo tomo"
            if paren:
                new = f"({new})"
            if old.endswith(")") and not paren:
                new += ")"
        else:
            continue
        if (old, new) not in out:
            out.append((old, new))
    # Las cadenas largas primero, para que «el capítulo 41» no lo pise
    # «capítulo 41»; y solo las que sigan presentes tras aplicar las
    # anteriores, porque el constructor exige que cada una aparezca.
    kept = []
    for a, b in sorted(out, key=lambda p: -len(p[0])):
        if a in text:
            kept.append((a, b))
            text = text.replace(a, b)
    return kept

# ---- tomo I ---------------------------------------------------------------
T1 = {
    "cap_nota_autor.es.md": [
        ("Varias de las lecturas topológicas (",
         "Varias lecturas del segundo tomo, *Lecturas topológicas* (")],
    "prologo.es.md": [("Entre la tercera y la cuarta, catorce lecturas topológicas llevan las mismas ideas a la ficción, el cine, el arte, el deporte y la vida cotidiana.",
                       "Un segundo tomo, *Lecturas topológicas*, lleva las mismas ideas a la ficción, el cine, el arte, el deporte y la vida cotidiana.")],
}

# ---- tomo II --------------------------------------------------------------
T2 = {}

# ---- volumen único: el texto fuente ya lleva su numeración --------------------
UNICO = {}

# ---- el glosario impreso no incluye la sección «Work in progress» ------------
_GLOS_KEY = 'cap_glosario.es.md'
_WIP_HEADS = ['Acción entrópica', 'Autosemejanza causal', 'Energía libre', 'Tríada del horizonte', 'Entropía del borde', 'Manta de Markov']
_GLOS_SUBS = [('\\(capítulos 22 y 31 y sección «Work in progress»\\)', '(capítulos 22 y 31)'), (' En la sección «Work in progress»[^\\n]*', '')]

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

# body_leading: interlineado algo más prieto para no pasar de las 550 páginas
# que admite KDP en tapa dura.
t1 = dict(base, subtitle="Ensayo · Tomo I", running_title="EL HORIZONTE INTERIOR", gutter_in=0.82,
          body_leading=16.0,
          uid="urn:uuid:el-horizonte-interior-tomo1-ensayo-es",
          cover_image="imagenes/El_Horizonte_Interior_Tomo1_Ensayo_cubierta_ebook.jpg",
          credits=["Primer tomo de El Horizonte Interior: el ensayo completo, de la primera a la cuarta "
                   "parte, con el epílogo, el glosario y las notas. Las lecturas topológicas forman el "
                   "segundo tomo."])
t1["chapters"] = []
for c in ENS:
    c2 = with_replace(c, T1, refs(_apply(body(c), T1.get(key(c), [])), 1))
    n = fm(c).get("chapterNumber", "")
    if n.isdigit() and int(n) in CUARTA:
        c2["chapter_number"] = CUARTA[int(n)]
    t1["chapters"].append(c2)

t2 = dict(base, title="Lecturas topológicas", subtitle="El Horizonte Interior · Tomo II",
          running_title="LECTURAS TOPOLÓGICAS", chapter_word="Lectura", gutter_in=0.62,
          uid="urn:uuid:el-horizonte-interior-tomo2-lecturas-es",
          cover_image="imagenes/El_Horizonte_Interior_Tomo2_Lecturas_cubierta_ebook.jpg",
          credits=["Segundo tomo de El Horizonte Interior: catorce lecturas que llevan las ideas del "
                   "ensayo a la ficción, el cine, el deporte y la vida cotidiana. Las referencias a "
                   "capítulos remiten al primer tomo, El Horizonte Interior. Ensayo."])
t2["chapters"] = []
for c in LECT + MOVED_CH:
    n = int(fm(c)["chapterNumber"])
    nota = f"**Nota al Capítulo {n}**"
    extra = [(nota, f"**Nota a la lectura {NUM_LECT[n]}**")] if nota in (BASE / c["content_file"]).read_text(encoding="utf-8") else []
    c2 = with_replace(c, T2, refs(body(c), 2) + extra)
    c2["chapter_number"] = NUM_LECT[n]
    c2["section"] = (SEC_MOVED if _is_moved(c) else "")   # sin la cabecera «Lecturas topológicas» repetida en cada lectura
    t2["chapters"].append(c2)

t1["chapters"].insert(0, {"id": "intro_vol1", "content_file": "intros/intro_vol1.es.md"})
t2["chapters"].insert(0, {"id": "intro_vol2", "content_file": "intros/intro_vol2.es.md"})

unico = dict(toc); unico["chapters"] = [with_replace(c, UNICO) for c in toc["chapters"]]

for name, data in (("toc_tomo1_ensayo.json", t1), ("toc_tomo2_lecturas.json", t2), ("toc_ensayo.json", unico)):
    (BASE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(name, len(data["chapters"]), "capítulos")
