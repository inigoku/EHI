"""Genera cuerpo_accesible.tex (versión accesible de la tesis) a partir del
original del autor (cuerpo_autor.tex, que no se toca):

1. corrige erratas del original;
2. renumera los capítulos y las referencias «capítulo N» para hacer sitio
   a los capítulos nuevos;
3. inserta los capítulos de capitulos/*.tex en su sitio, cada uno con su
   lámina delante (la lámina de un capítulo va al final del anterior,
   como en el original).

Uso: python3 scripts/build_accesible.py   (desde edicion_original/)
"""
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
src = (BASE / "cuerpo_autor.tex").read_text(encoding="utf-8")

# 1. Erratas del original
FIXES = [
    ("enviar información más rápida que la luz", "enviar información más rápido que la luz", 1),
    ("que su marido se disuelve", "que su marido se disuelva", 2),
    ("su información se scrambled, pero", "su información se desordena, pero", 1),
    ("están ahí —scrambled, distribuidas, sin nombre—", "están ahí —revueltas, distribuidas, sin nombre—", 1),
    # los asteriscos de M87* y Sgr A* se habían convertido en cursiva
    ("M87\\emph{, el agujero negro supermasivo", "M87*, el agujero negro supermasivo", 1),
    ("publicó Sagitario A}, el agujero negro", "publicó Sagitario A*, el agujero negro", 1),
]
for a, b, n in FIXES:
    assert src.count(a) == n, (a, src.count(a))
    src = src.replace(a, b)

# 2. Renumeración: capítulos del original -> numeración nueva
NEW = {1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 7, 7: 10, 8: 11, 9: 12, 10: 13, 11: 14,
       12: 15, 13: 16, 14: 17, 15: 18, 16: 19, 17: 20, 18: 25}

def renum(m):
    word, num = m.group(1), int(m.group(2))
    ctx = src_ctx(m.start())
    if "Tao Te Ch" in ctx:        # «El capítulo 25 del Tao Te Ching»
        return m.group(0)
    return f"{word} {NEW.get(num, num)}"

def src_ctx(pos):
    return src[pos: pos + 40]

src = re.sub(r"(CAPÍTULO|[Cc]apítulo)\s+(\d+)\b", renum, src)

# 3. Inserción de capítulos nuevos: (anclaje, fichero) — se inserta justo
#    antes del anclaje, que es la lámina del capítulo siguiente.
CAP = BASE / "capitulos"
INSERT = [
    ("\\lamina{img/fig08_p30.jpg}", "03_encapsulacion.tex"),         # tras cap. 2
    ("\\lamina{img/fig13_p54.jpg}", "08_ciclo_instanciacion.tex"),   # tras «La muerte como retorno»
    ("\\lamina{img/fig13_p54.jpg}", "09_tabla_equivalencias.tex"),
    ("\\lamina{img/fig28_p131.jpg}", "21_espejo_sin_profundidad.tex"),  # inicio de la Cuarta parte
    ("\\lamina{img/fig28_p131.jpg}", "22_casos_limite.tex"),
    ("\\lamina{img/fig28_p131.jpg}", "23_entrelazamiento_vertical.tex"),
    ("\\lamina{img/fig28_p131.jpg}", "24_realidad_fractal.tex"),
]
for anchor, fname in INSERT:
    assert src.count(anchor) == 1, anchor
    chunk = (CAP / fname).read_text(encoding="utf-8").rstrip() + "\n"
    src = src.replace(anchor, chunk + anchor)

(BASE / "cuerpo_accesible.tex").write_text(src, encoding="utf-8")
nums = re.findall(r"\\capitulo\{CAPÍTULO (\d+)\}", src)
assert nums == [str(i) for i in range(0, 26)], nums
print("cuerpo_accesible.tex:", len(nums), "capítulos numerados (0-25)")
