"""Genera cuerpo_ilustrada.tex (versión ilustrada) a partir del
original del autor (cuerpo_autor.tex, que no se toca):

1. corrige erratas del original;
2. renumera los capítulos y las referencias «capítulo N» para hacer sitio
   a los capítulos nuevos;
3. inserta los capítulos de capitulos/*.tex en su sitio, cada uno con su
   lámina delante (la lámina de un capítulo va al final del anterior,
   como en el original).

Uso: python3 scripts/build_ilustrada.py   (desde edicion_original/)
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
    ("y atrofía la empatía", "y atrofia la empatía", 1),
    ("necesita más acelaración inicial", "necesita más aceleración inicial", 1),
    ("por la hiperstimulación artificial", "por la hiperestimulación artificial", 1),
    ("Tononi formalizó esto con \\emph{phi} (Φ)", "Tononi formalizó esto con \\emph{Phi} (Φ)", 1),
    ("\\emph{Incomplete} Nature\\emph{: How Mind Emerged from Matter}", "\\emph{Incomplete Nature: How Mind Emerged from Matter}", 1),
    # El prólogo hablaba de tres partes; el libro tiene cuatro
    ("El libro tiene tres partes. La primera: cómo emerge un horizonte (nacimiento), cómo se mantiene (vida), cómo se disuelve (muerte). La segunda: qué pasa cuando dos horizontes comparten geometría (vínculo, amor, pérdida). La tercera: qué pasa cuando la hipótesis se encuentra con preguntas que no puede responder.",
     "El libro tiene cuatro partes. La primera: cómo emerge un horizonte (nacimiento), cómo se mantiene (vida), cómo se disuelve (muerte). La segunda: qué pasa cuando dos horizontes comparten geometría (vínculo, amor, pérdida). La tercera: qué pasa cuando un horizonte se daña o tiene otra forma (el Alzheimer, el Parkinson, el trauma, los animales). La cuarta: qué pasa cuando la hipótesis se encuentra con preguntas que no puede responder: las máquinas, la fe, la imaginación y sus propios límites.", 1),
    # Rayas: en los incisos van pegadas al texto; sin inciso de cierre, dos puntos
    ("la cantidad de información que contiene — y encontró", "la cantidad de información que contiene— y encontró", 1),
    ("Este proceso — \\textbf{scrambling cuántico}— involucra", "Este proceso —\\textbf{scrambling cuántico}— involucra", 1),
    ("la individualidad no existe — existe, produce", "la individualidad no existe: existe, produce", 1),
    ("la Luz Clara primordial — la naturaleza del campo", "la Luz Clara primordial: la naturaleza del campo", 1),
    ("es una propiedad interna — no un parámetro externo", "es una propiedad interna: no un parámetro externo", 1),
    ("lo que el hablante dice — anticipa sus patrones", "lo que el hablante dice: anticipa sus patrones", 1),
    ("Conocer a alguien profundamente — amándolo u odiándolo—", "Conocer a alguien profundamente —amándolo u odiándolo—", 1),
    ("No el entrelazamiento en sí — que ya estaba—", "No el entrelazamiento en sí —que ya estaba—", 1),
    ("es también suyo — como si el sistema", "es también suyo, como si el sistema", 1),
    ("sea más intenso — es que la reorganización", "sea más intenso: es que la reorganización", 1),
    ("el córtex prefrontal — sede de la intención", "el córtex prefrontal —sede de la intención", 1),
    ("le ocurre al horizonte — recalibración producida", "le ocurre al horizonte: recalibración producida", 1),
    ("dopaminérgica potente — sustancia, patrón", "dopaminérgica potente —sustancia, patrón", 1),
    ("\\emph{continuing bonds} — vínculos que continúan—", "\\emph{continuing bonds} —vínculos que continúan—", 1),
    ("Su vocabulario — integración, información", "Su vocabulario —integración, información", 1),
    ("no es ausencia de sonido — está lleno", "no es ausencia de sonido: está lleno", 1),
    ("ninguna teoría pueda decir — es qué se siente", "ninguna teoría pueda decir— es qué se siente", 1),
    ("—eso es la muerte — pero se acerca", "—eso es la muerte— pero se acerca", 1),
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

# 4. Glosario y referencias de los capítulos nuevos
GLOSARIO_NUEVO = [
    ("Dharma", "en el budismo y el hinduismo, el tejido mismo del mundo, del que el comportamiento correcto no es más que consonancia, no obediencia."),
    ("Dualismo de acceso", "hay un solo tipo de cosas en el mundo, pero ciertas estructuras pueden conocerse de dos maneras que se excluyen: desde fuera, como objeto; desde dentro, como sujeto. Alternativa al dualismo de sustancias."),
    ("Encapsulación", "frontera que separa un estado interno privado de la interfaz pública que un sistema muestra al exterior; en el libro, condición necesaria (no suficiente) para que haya alguien dentro."),
    ("Entrelazamiento vertical", "correlación sostenida entre un horizonte y algo más allá de su frontera, sin canal de confirmación observable; nombre que el libro da a la oración, la meditación y la práctica contemplativa."),
    ("Fractal de interioridades", "un universo sin primer nivel ni último, en el que cada horizonte es criatura de lo que lo contiene y creador de lo que él mismo sostiene."),
    ("Heap", "en informática, la memoria común y sin estructura de la que un programa toma espacio para crear objetos y a la que lo devuelve; en el libro, imagen del reservorio."),
    ("Instanciación", "en informática, la creación de un objeto concreto: se reserva un trozo de memoria y se le traza una frontera; en el libro, imagen del nacimiento de un horizonte."),
    ("Interfaz pública y estado privado", "los dos niveles de acceso de un sistema encapsulado: lo que muestra hacia fuera (conducta, lenguaje, señales) y lo que solo existe desde dentro (la experiencia)."),
    ("Recolección de basura", "en informática, el proceso que devuelve a la memoria común el espacio de los objetos que ya nadie usa; en el libro, imagen de la muerte como disolución de la frontera."),
    ("Samadhi", "en las tradiciones de la India, el instante en que la conexión con el fondo se vuelve indistinguible de ser uno mismo con él."),
    ("Sesgo", "la huella que deja un horizonte ya formado sobre el que apenas empieza a formarse; lo que orienta hacia qué forma concreta se estabiliza."),
    ("Vecino de arriba", "la interioridad que sostiene la mía y a la que no tengo acceso; lo que, desde aquí, se llama Dios."),
    ("Zombi filosófico", "ser imaginario idéntico a una persona en todo lo que hace, pero sin nadie dentro que lo sienta (David Chalmers)."),
]
g0 = src.index("\\capitulo{}{GLOSARIO}"); g1 = src.index("\\capitulo{}{NOTAS}")
glos = src[g0:g1]
import unicodedata
def clave(s):
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
for term, defin in GLOSARIO_NUEVO:
    entrada = f"\\glos \\textbf{{{term}}}: {defin}\n\n"
    assert f"\\textbf{{{term}}}" not in glos, term
    pos = None
    for m in re.finditer(r"\\glos \\textbf\{([^}]*)\}", glos):
        if clave(m.group(1)) > clave(term):
            pos = m.start(); break
    glos = glos[:pos] + entrada + glos[pos:] if pos is not None else glos.rstrip() + "\n\n" + entrada
src = src[:g0] + glos + src[g1:]

REFERENCIAS_NUEVAS = [
    "Bekenstein, J.D. (1973). Black holes and entropy. \\emph{Physical Review D}, 7(8).",
    "Maldacena, J., \\& Susskind, L. (2013). Cool horizons for entangled black holes. \\emph{Fortschritte der Physik}, 61(9).",
    "Chalmers, D.J. (1995). Facing up to the problem of consciousness. \\emph{Journal of Consciousness Studies}, 2(3).",
    "Tononi, G., Boly, M., Massimini, M., \\& Koch, C. (2016). Integrated information theory: from consciousness to its physical substrate. \\emph{Nature Reviews Neuroscience}, 17(7).",
    "Parnas, D.L. (1972). On the criteria to be used in decomposing systems into modules. \\emph{Communications of the ACM}, 15(12).",
    "Dijkstra, E.W. (1968). Go To statement considered harmful. \\emph{Communications of the ACM}, 11(3).",
    "Knuth, D.E. (1997). \\emph{The Art of Computer Programming, vol. 1: Fundamental Algorithms} (3.ª ed.). Addison-Wesley.",
    "Hume, D. (1748). \\emph{Investigación sobre el entendimiento humano}.",
    "Tolkien, J.R.R. (1947). On Fairy-Stories. En \\emph{Essays Presented to Charles Williams}. Oxford University Press.",
    "Hesse, H. (1922). \\emph{Siddhartha}.",
    "Endō, S. (1966). \\emph{Silencio}.",
]
r0 = src.index("\\capitulo{}{REFERENCIAS}")
ultima = [m for m in re.finditer(r"\\refe [^\n]*\n", src[r0:])][-1]
fin = r0 + ultima.end()
src = src[:fin] + "".join("\n\\refe " + r + "\n" for r in REFERENCIAS_NUEVAS) + src[fin:]

# 5. Unificación de estilo en todo el libro
src = src.replace("Nota al Capítulo", "Nota al capítulo")
# Comillas: «» en primer nivel; “” solo dentro de otras comillas
def comillas(s):
    out, nivel = [], 0
    for ch in s:
        if ch == "«": nivel += 1
        elif ch == "»": nivel -= 1
        if ch == "“" and nivel == 0: out.append("«"); nivel_interno = True; continue
        if ch == "”" and nivel == 0: out.append("»"); continue
        out.append(ch)
    return "".join(out)
src = comillas(src)

(BASE / "cuerpo_ilustrada.tex").write_text(src, encoding="utf-8")
nums = re.findall(r"\\capitulo\{CAPÍTULO (\d+)\}", src)
assert nums == [str(i) for i in range(0, 26)], nums
print("cuerpo_ilustrada.tex:", len(nums), "capítulos numerados (0-25)")
