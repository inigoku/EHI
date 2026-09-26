#!/usr/bin/env python3
"""Genera los TOC de los dos tomos de tapa dura a partir de toc_ensayo.json:

  toc_tomo1_ensayo.json    El Horizonte Interior. Ensayo (tomo I): capítulos 0-33,
                           Cuarta parte (52-53 pasan a 34-35), epílogo y apéndices.
  toc_tomo2_lecturas.json  Lecturas topológicas (tomo II): los capítulos 34-51
                           como «Lectura 1-18».

KDP no admite tapa dura de más de 550 páginas y el volumen único tiene 790.
Además corrige las referencias cruzadas heredadas de la numeración de la web,
que ya estaban mal en el volumen único (FIXES_COMUNES) y las que cambian al
partir el libro (por tomo).

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
NUM_LECT = {int(fm(c)["chapterNumber"]): i + 1 for i, c in enumerate(LECT)}   # 34..51 -> 1..18

# ---- tomo I ---------------------------------------------------------------
T1 = {
    "cap_nota_autor.es.md": [
        ("El capítulo 47 lleva esa pregunta a la ficción",
         "La lectura «Cinco espejos de ficción», en el tomo de *Lecturas topológicas*, lleva esa pregunta a la ficción")],
    "cap17_5_real.es.md": [("como vimos en el capítulo 40,", "como veremos en el capítulo 34,")],
    "cap_religiones_comparadas.es.md": [
        ("El experimento ya dijo, en el capítulo 43, que la ética", "El capítulo 34 lo dirá con claridad: la ética"),
        ("Cuando el capítulo 43 señaló el *is-ought gap* de Hume —que ningún \"es\" produce por sí solo un \"debería\"—",
         "Ante el *is-ought gap* de Hume —que ningún \"es\" produce por sí solo un \"debería\", como se verá en el capítulo 34—"),
        ("De las tres opciones que el capítulo 43 dejó abiertas", "De las tres opciones que el capítulo 34 dejará abiertas"),
        ("lo que este mismo libro hizo explícitamente en el capítulo 43", "lo que este mismo libro hará explícitamente en el capítulo 34"),
        ("leer el mapa del capítulo 43", "leer el mapa del capítulo 34"),
        ("como mostró el capítulo 44 anterior sobre la práctica,", "como mostrará el capítulo 35, sobre la práctica,"),
        ("El capítulo 51, \"El entrelazamiento vertical\", lo desarrolla", "El capítulo 29, \"El entrelazamiento vertical\", lo desarrolla"),
        ("No puede: el capítulo 43 ya estableció que", "No puede: como establece el capítulo 34,"),
        ("como dijo el capítulo 43,", "como dirá el capítulo 34,"),
    ],
    "cap19_real.es.md": [("**Nota al Capítulo 52**", "**Nota al Capítulo 34**")],
    "cap20_real.es.md": [("**Nota al Capítulo 53**", "**Nota al Capítulo 35**")],
}
NUM_T1 = {"cap19_real.es.md": 34, "cap20_real.es.md": 35}

# ---- tomo II --------------------------------------------------------------
T2 = {
    "cap_blade_runner.es.md": [("En el capítulo 34, al hablar", "En la lectura 1, al hablar"),
                               ("(Capítulo 34)", "(lectura 1)")],
    "cap_lenguaje_entrelazamiento.es.md": [("(capítulo 36)", "(lectura 3)"),
                                           ("ya citado en el capítulo 42", "ya citado en la lectura 9")],
    "cap_calibracion.es.md": [("El capítulo 23 describió la encapsulación", "El capítulo 3 describió la encapsulación"),
                              ("El capítulo 38 describió la traducción", "La lectura 9 describió la traducción"),
                              ("lo que el capítulo 11 describió como vínculo madre-hijo", "lo que el capítulo 15 describió como vínculo madre-hijo")],
}

# ---- volumen único: mismas correcciones con la numeración de 54 capítulos ----
UNICO = {
    "cap17_5_real.es.md": [("como vimos en el capítulo 40,", "como veremos en el capítulo 52,")],
    "cap_religiones_comparadas.es.md": [(a, b.replace("capítulo 34", "capítulo 52").replace("capítulo 35", "capítulo 53"))
                                        for a, b in T1["cap_religiones_comparadas.es.md"]],
    "cap_calibracion.es.md": [(a, b.replace("La lectura 9", "El capítulo 42")) for a, b in T2["cap_calibracion.es.md"]],
}

def with_replace(ch, table, extra=()):
    ch = copy.deepcopy(ch)
    r = list(table.get(key(ch), [])) + list(extra)
    if r:
        ch["replace"] = [list(x) for x in r]
    return ch

base = {k: v for k, v in toc.items() if k != "chapters"}

t1 = dict(base, subtitle="Ensayo · Tomo I", running_title="EL HORIZONTE INTERIOR", gutter_in=0.82,
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
          credits=["Segundo tomo de El Horizonte Interior: dieciocho lecturas que llevan las ideas del "
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
