#!/usr/bin/env python3
"""Genera los TOC de los dos tomos de tapa dura a partir de toc_ensayo.json:

  toc_tomo1_ensayo.json    El Horizonte Interior. Ensayo (tomo I): capítulos 0-35,
                           Cuarta parte (55-56 pasan a 36-37), epílogo y apéndices.
  toc_tomo2_lecturas.json  Lecturas topológicas (tomo II): los capítulos 36-54
                           como «Lectura 1-19».

KDP no admite tapa dura de más de 550 páginas y el volumen único pasa de 770.
El texto fuente ya lleva la numeración del volumen único; aquí solo se corrigen,
con el campo `replace` de cada capítulo, las referencias que cambian al partir
el libro.

    python3 scripts/make_tomos.py     (desde edicion_ensayo/)
"""
import copy, json, re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
toc = json.loads((BASE / "toc_ensayo.json").read_text(encoding="utf-8"))

def fm(ch):
    s = (BASE / ch["content_file"]).read_text(encoding="utf-8")
    return dict(re.findall(r'^(\w+):\s*"?(.*?)"?\s*$', s.split("---")[1], re.M))

def key(ch):
    return Path(ch["content_file"]).name

LECT = [c for c in toc["chapters"] if fm(c).get("section") == "LECTURAS TOPOLÓGICAS"]
ENS = [c for c in toc["chapters"] if fm(c).get("section") != "LECTURAS TOPOLÓGICAS"]
NUM_LECT = {int(fm(c)["chapterNumber"]): i + 1 for i, c in enumerate(LECT)}   # 36..54 -> 1..19

# ---- tomo I ---------------------------------------------------------------
# El texto fuente usa la numeración del volumen único (0-56); aquí solo se
# corrige lo que cambia al partir el libro: la cuarta parte (55-56) pasa a
# 36-37 y las remisiones a las lecturas apuntan al segundo tomo.
def t1(pares):
    return [(a, a.replace("capítulo 55", "capítulo 36").replace("capítulo 56", "capítulo 37")) for a in pares]

T1 = {
    "cap_nota_autor.es.md": [
        ("El capítulo 49 lleva esa pregunta a la ficción",
         "La lectura «Cinco espejos de ficción», en el tomo de *Lecturas topológicas*, lleva esa pregunta a la ficción")],
    "cap17_5_real.es.md": t1(["como veremos en el capítulo 55,"]),
    "cap_religiones_comparadas.es.md": t1([
        "El capítulo 55 lo dirá con claridad: la ética",
        "como se verá en el capítulo 55), cada",
        "De las tres opciones que el capítulo 55 dejará abiertas",
        "lo que este mismo libro hará explícitamente en el capítulo 55",
        "leer el mapa del capítulo 55",
        "como mostrará el capítulo 56, sobre la práctica,",
        "No puede: como establece el capítulo 55,",
        "como dirá el capítulo 55,",
    ]),
    "cap_tres_puertas.es.md": t1(["Es la pregunta que el capítulo 55 retomará"]),
    "prologo.es.md": [("Entre la tercera y la cuarta, diecinueve lecturas topológicas llevan las mismas ideas a la ficción, el cine, el arte, el deporte y la vida cotidiana.",
                       "Un segundo tomo, *Lecturas topológicas*, lleva las mismas ideas a la ficción, el cine, el arte, el deporte y la vida cotidiana.")],
    "cap19_real.es.md": [("**Nota al Capítulo 55**", "**Nota al Capítulo 36**")],
    "cap20_real.es.md": [("**Nota al Capítulo 56**", "**Nota al Capítulo 37**")],
}
NUM_T1 = {"cap19_real.es.md": 36, "cap20_real.es.md": 37}

# ---- tomo II --------------------------------------------------------------
T2 = {
    "cap_blade_runner.es.md": [("En el capítulo 36, al hablar", "En la lectura 1, al hablar"),
                               ("(Capítulo 36)", "(lectura 1)")],
    "cap_lenguaje_entrelazamiento.es.md": [("(capítulo 38)", "(lectura 3)"),
                                           ("ya citado en el capítulo 44", "ya citado en la lectura 9")],
    "cap_calibracion.es.md": [("El capítulo 44 describió la traducción", "La lectura 9 describió la traducción")],
    "cap_nave_de_barro.es.md": [("la lectura sobre el terror cósmico, en el capítulo 40,", "la lectura sobre el terror cósmico, la 5,"),
                                ("la misma conclusión a la que llegó el capítulo 47", "la misma conclusión a la que llegó la lectura 12"),
                                ("lo que el capítulo 40 llamaba gafas de eclipse", "lo que la lectura 5 llamaba gafas de eclipse")],
}

# ---- volumen único: el texto fuente ya lleva su numeración --------------------
UNICO = {}

def with_replace(ch, table, extra=()):
    ch = copy.deepcopy(ch)
    r = list(table.get(key(ch), [])) + list(extra)
    if r:
        ch["replace"] = [list(x) for x in r]
    return ch

base = {k: v for k, v in toc.items() if k != "chapters"}

t1 = dict(base, subtitle="Ensayo · Tomo I", running_title="EL HORIZONTE INTERIOR", gutter_in=0.82,
          body_leading=15.8,
          uid="urn:uuid:el-horizonte-interior-tomo1-ensayo-es",
          cover_image="imagenes/El_Horizonte_Interior_Tomo1_Ensayo_cubierta_ebook.jpg",
          credits=["Primer tomo de El Horizonte Interior: el ensayo completo, de la primera a la cuarta "
                   "parte, con el epílogo, el glosario y las notas. Las lecturas topológicas forman el "
                   "segundo tomo."])
t1["chapters"] = []
for c in ENS:
    c2 = with_replace(c, T1)
    if key(c) in NUM_T1:
        c2["chapter_number"] = NUM_T1[key(c)]
    t1["chapters"].append(c2)

t2 = dict(base, title="Lecturas topológicas", subtitle="El Horizonte Interior · Tomo II",
          running_title="LECTURAS TOPOLÓGICAS", chapter_word="Lectura", gutter_in=0.62,
          uid="urn:uuid:el-horizonte-interior-tomo2-lecturas-es",
          cover_image="imagenes/El_Horizonte_Interior_Tomo2_Lecturas_cubierta_ebook.jpg",
          credits=["Segundo tomo de El Horizonte Interior: diecinueve lecturas que llevan las ideas del "
                   "ensayo a la ficción, el cine, el deporte y la vida cotidiana. Las referencias a "
                   "capítulos remiten al primer tomo, El Horizonte Interior. Ensayo."])
t2["chapters"] = []
for c in LECT:
    n = int(fm(c)["chapterNumber"])
    nota = f"**Nota al Capítulo {n}**"
    extra = [(nota, f"**Nota a la lectura {NUM_LECT[n]}**")] if nota in (BASE / c["content_file"]).read_text(encoding="utf-8") else []
    c2 = with_replace(c, T2, extra)
    c2["chapter_number"] = NUM_LECT[n]
    c2["section"] = ""   # sin la cabecera «Lecturas topológicas» repetida en cada lectura
    t2["chapters"].append(c2)

unico = dict(toc); unico["chapters"] = [with_replace(c, UNICO) for c in toc["chapters"]]

for name, data in (("toc_tomo1_ensayo.json", t1), ("toc_tomo2_lecturas.json", t2), ("toc_ensayo.json", unico)):
    (BASE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(name, len(data["chapters"]), "capítulos")
