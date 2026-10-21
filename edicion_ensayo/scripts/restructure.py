#!/usr/bin/env python3
"""Genera los TOC del ensayo con la estructura de ocho partes (es / ca / en).

Sustituye a make_tomos.py / make_tomos_ca.py / make_tomos_en.py. Produce, por
idioma, tres tablas de contenido:

  toc_ensayo*.json           volumen único: ensayo + lecturas (capítulos 1-52)
  toc_tomo1_ensayo*.json     tomo I: ensayo (capítulos 1-39)
  toc_tomo2_lecturas*.json   tomo II: lecturas topológicas (lectura 1-13)

El texto fuente (content/, content_overrides/, en/) lleva todavía las
remisiones «capítulo N» con la numeración ANTIGUA del volumen único. Aquí se
traduce cada remisión a su destino nuevo, edición por edición, con el campo
`replace` de cada capítulo (en dos fases, con marcas intermedias, para que una
sustitución no pise a otra). Los capítulos que no existían se citan en el
texto con {{n:id}}.

    python3 scripts/restructure.py        (desde edicion_ensayo/)
"""
import copy, json, os, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent
BASE = "3a9c33a899e140d7bff16ebddcc26ac7ce450239"
LG = ("es", "ca", "en")
SFX = {"es": "", "ca": "_ca", "en": "_en"}
sys.path.insert(0, str(ROOT / "scripts"))

# ------------------------------------------------------------------ estructura
FRONT = ["cap0", "prologo", "tarel", "cap_nota_autor"]
I = ["cap1", "cap2", "cap_info_intro", "cap2_5", "cap3", "cap4", "cap5", "cap6", "cap6_5", "cap6_6"]
INTER = ["interludio"]
II = ["cap7", "cap7_5", "cap8", "cap9", "cap10", "cap11", "cap18_real", "cap12", "cap13",
      "cap_teoria_informacion", "cap_tres_puertas"]
III = ["cap13_5", "cap18_6", "cap18_7", "cap14_real", "cap15_real"]
IV = ["cap22_idempotencia", "cap23_experimentos_mentales"]
V = ["cap17_real", "cap17_5_real", "cap16_real", "cap_calibracion"]
VI = ["cap_religiones_comparadas", "cap_espejo_sin_profundidad", "cap17_7_alien"]
LECT = ["cap17_6_real", "cap_blade_runner", "cap_maquina_tiempo", "cap_horizonte_prestado", "cap_three_body",
        "cap17_8_cosmic", "cap_matrix", "cap_lenguaje_entrelazamiento", "cap_diapason_invisible",
        "cap_ojo_un_solo_color", "cap_cartografia_singularidades", "cap_traductor", "cap_historia_relevo"]
VII = ["cap_realidad_fractal", "cap_nave_de_barro"]
VIII = ["cap19_real", "cap20_real"]
EPI = ["cap_epilogo_real"]
BACK = ["cap_glosario", "cap_notas_cierre", "cap_notas_referencias"]
DROPPED = ["cap_el_que_queda"]

PART_OF = {}
for key, ids in (("I", I), ("II", II), ("III", III), ("IV", IV), ("V", V), ("VI", VI), ("LECT", LECT),
                 ("VII", VII), ("VIII", VIII + EPI)):
    for i in ids:
        PART_OF[i] = key

PARTS = {
    "I": ("PRIMERA PARTE: EL CICLO DEL HORIZONTE", "PRIMERA PART: EL CICLE DE L'HORITZÓ", "PART ONE: THE CYCLE OF THE HORIZON"),
    "II": ("SEGUNDA PARTE: EL HORIZONTE EN VÍNCULO", "SEGONA PART: L'HORITZÓ EN VINCLE", "PART TWO: THE BONDED HORIZON"),
    "III": ("TERCERA PARTE: EL HORIZONTE QUE SE ROMPE Y EL SUJETO", "TERCERA PART: L'HORITZÓ QUE ES TRENCA I EL SUBJECTE",
            "PART THREE: THE HORIZON THAT BREAKS, AND THE SELF"),
    "IV": ("CUARTA PARTE: LA FORMA Y SU PRUEBA", "QUARTA PART: LA FORMA I LA SEVA PROVA", "PART FOUR: THE FORM AND ITS TEST"),
    "V": ("QUINTA PARTE: EL HORIZONTE MÁS ALLÁ DE LA PERSONA", "CINQUENA PART: L'HORITZÓ MÉS ENLLÀ DE LA PERSONA",
          "PART FIVE: THE HORIZON BEYOND THE PERSON"),
    "VI": ("SEXTA PARTE: HORIZONTES DE OTRA ESCALA", "SISENA PART: HORITZONS D'UNA ALTRA ESCALA", "PART SIX: HORIZONS OF ANOTHER SCALE"),
    "LECT": ("LECTURAS TOPOLÓGICAS", "LECTURES TOPOLÒGIQUES", "TOPOLOGICAL READINGS"),
    "VII": ("SÉPTIMA PARTE: DOS HIPÓTESIS DEL AUTOR", "SETENA PART: DUES HIPÒTESIS DE L'AUTOR", "PART SEVEN: TWO HYPOTHESES OF THE AUTHOR"),
    "VIII": ("OCTAVA PARTE: EL LÍMITE DEL EXPERIMENTO", "VUITENA PART: EL LÍMIT DE L'EXPERIMENT", "PART EIGHT: THE LIMIT OF THE EXPERIMENT"),
}
LI = {"es": 0, "ca": 1, "en": 2}

ORDER = {
    "unico": FRONT + I + INTER + II + III + IV + V + VI + LECT + VII + VIII + EPI + BACK,
    "t1": FRONT + I + INTER + II + III + IV + V + VI + VII + VIII + EPI + BACK,
    "t2": LECT,
}
NUMBERED = I + II + III + IV + V + VI + LECT + VII + VIII


def numbering():
    nums = {}
    for e in ("unico", "t1"):
        n = 0
        nums[e] = {}
        for cid in ORDER[e]:
            if cid in NUMBERED:
                n += 1
                nums[e][cid] = n
    nums["t2"] = {cid: k + 1 for k, cid in enumerate(LECT)}
    return nums


NUM = numbering()

# ------------------------------------------------------------------ fuentes
def git_show(rel):
    return subprocess.check_output(["git", "show", f"{BASE}:{rel}"], cwd=REPO).decode("utf-8")


BASE_TOC = {lg: json.loads(git_show(f"edicion_ensayo/toc_ensayo{SFX[lg]}.json")) for lg in LG}
BASE_T1 = {lg: json.loads(git_show(f"edicion_ensayo/toc_tomo1_ensayo{SFX[lg]}.json")) for lg in LG}
BASE_T2 = {lg: json.loads(git_show(f"edicion_ensayo/toc_tomo2_lecturas{SFX[lg]}.json")) for lg in LG}
BASE_FILES = {lg: {c["id"]: c["content_file"] for c in BASE_TOC[lg]["chapters"]} for lg in LG}

FM_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n?(.*)\Z", re.DOTALL)


def content_file(lg, cid):
    if lg == "en":
        return f"en/{cid}.en.md"
    ov = ROOT / "content_overrides" / f"{cid}.{lg}.md"
    if ov.exists():
        return f"content_overrides/{cid}.{lg}.md"
    return BASE_FILES[lg][cid]


def read_chapter(lg, cid):
    raw = (ROOT / content_file(lg, cid)).read_text(encoding="utf-8")
    m = FM_RE.match(raw)
    fm = dict(re.findall(r"^(\w+):\s*(.*?)\s*$", m.group(1), re.M))
    return fm, m.group(2)


# numeración antigua (la del volumen único anterior)
OLD = {}
for _cid, _cf in BASE_FILES["es"].items():
    _m = FM_RE.match(git_show(os.path.normpath("edicion_ensayo/" + _cf)))
    _n = dict(re.findall(r"^(\w+):\s*(.*?)\s*$", _m.group(1), re.M)).get("chapterNumber", "")
    if _n.isdigit():
        OLD[_cid] = int(_n)
OLD2ID = {n: cid for cid, n in OLD.items()}
assert len(OLD2ID) == len(OLD)

# remisiones cuyo número antiguo no apunta al destino por defecto
S, E_, R, V_ = "cap5", "cap_espejo_sin_profundidad", "cap_religiones_comparadas", None
AMBIG = {
    ("cap_nota_autor", 31): E_,
    ("cap3", 31): [S, E_],
    ("cap_calibracion", 31): S,
    ("cap17_6_real", 31): S,
    ("cap_blade_runner", 31): S,
    ("cap_lenguaje_entrelazamiento", 31): E_,
    ("cap_glosario", 31): S,
    ("cap_nave_de_barro", 29): R,
}
# capítulos donde un número suelto («y el 12») es una remisión
BARE_IN = {"cap11", "cap_teoria_informacion", "cap_tres_puertas"}

# ------------------------------------------------------------------ idioma
class Lang:
    pass


def mk_lang(lg):
    L = Lang()
    L.lg = lg
    if lg == "es":
        L.ref = re.compile(r"(?P<art>\b(?:[Ee]n el|[Dd]el|[Aa]l|[Ee]l) )?(?P<open>\()?(?P<word>[Cc]apítulo)(?P<pl>s)? (?P<n1>\d+)(?: (?P<conj>y) (?P<n2>\d+))?")
        L.host = re.compile(r"\*\*Nota al Capítulo (\d+)\*\*")
        L.host_fmt = "**Nota al Capítulo {n}**"
        L.host_read = "**Nota a la lectura {n}**"
        L.bare = re.compile(r"\b([Yy]) el (\d+)\b")
        L.art = {"en el": "en la", "del": "de la", "al": "a la", "el": "la"}
        L.read_word = "lectura"
        L.read_suffix = " del segundo tomo"
    elif lg == "ca":
        L.ref = re.compile(r"(?P<art>\b(?:[Ee]n el|[Dd]el|[Aa]l|[Ee]l) )?(?P<open>\()?(?P<word>[Cc]apítol)(?P<pl>s)? (?P<n1>\d+)(?: (?P<conj>i) (?P<n2>\d+))?")
        L.host = re.compile(r"\*\*Nota al Capítol (\d+)\*\*")
        L.host_fmt = "**Nota al Capítol {n}**"
        L.host_read = "**Nota a la lectura {n}**"
        L.bare = re.compile(r"\b([Ii]) el (\d+)\b")
        L.art = {"en el": "en la", "del": "de la", "al": "a la", "el": "la"}
        L.read_word = "lectura"
        L.read_suffix = " del segon volum"
    else:
        L.ref = re.compile(r"(?P<art>)(?P<open>\()?(?P<word>[Cc]hapter)(?P<pl>s)? (?P<n1>\d+)(?: (?P<conj>and) (?P<n2>\d+))?")
        L.host = re.compile(r"\*\*Note to Chapter (\d+)\*\*")
        L.host_fmt = "**Note to Chapter {n}**"
        L.host_read = "**Note to Reading {n}**"
        L.bare = None
        L.art = {}
        L.read_word = "Reading"
        L.read_suffix = " in the second volume"
    L.ph = re.compile(r"\{\{n:(\w+)\}\}")
    return L


LANG = {lg: mk_lang(lg) for lg in LG}

# ------------------------------------------------------------------ textos propios de cada edición
ESSAY_WORDS = {   # tomo II: «este libro» es, ahí, el ensayo
    "es": [("de este libro", "del ensayo"), ("De este libro", "Del ensayo"), ("A lo largo del libro", "A lo largo del ensayo"),
           ("En la tercera parte del libro", "En la tercera parte del ensayo"), ("en la geometría del libro", "en la geometría del ensayo"),
           ("el resto del libro", "el resto del ensayo"), ("este libro", "el ensayo"), ("Este libro", "El ensayo")],
    "ca": [("d'aquest llibre", "de l'assaig"), ("D'aquest llibre", "De l'assaig"), ("Al llarg del llibre", "Al llarg de l'assaig"),
           ("A la tercera part del llibre", "A la tercera part de l'assaig"), ("en la geometria del llibre", "en la geometria de l'assaig"),
           ("la resta del llibre", "la resta de l'assaig"), ("aquest llibre", "l'assaig"), ("Aquest llibre", "L'assaig")],
    "en": [("this book's", "the essay's"), ("This book's", "The essay's"), ("Throughout the book", "Throughout the essay"),
           ("the rest of the book", "the rest of the essay"), ("this book", "the essay"), ("This book", "The essay")],
}

T1_REQ = {   # obligatorias en el tomo I: (capítulo, [(viejo, nuevo)])
    "es": {
        "cap_nota_autor": [("Varias de las lecturas topológicas (", "Varias lecturas del segundo tomo, *Lecturas topológicas* (")],
        "prologo": [("Entre la sexta y la séptima, trece lecturas topológicas llevan las mismas ideas a la ficción, el cine, el arte, el deporte y la vida cotidiana.",
                     "Un segundo tomo, *Lecturas topológicas*, lleva las mismas ideas a la ficción, el cine, el arte, el deporte y la vida cotidiana.")],
        "cap_calibracion": [("La lectura «El traductor», más adelante, estudia", "La lectura «El traductor», en el segundo tomo, estudia")],
        "cap13_5": [("(a la que volveremos en las lecturas topológicas)", "(a la que volveremos en el segundo tomo, *Lecturas topológicas*)")],
        "cap_notas_cierre": [
            ("(*El espejo sin profundidad*, *Cinco maneras de dudar en voz alta*, *Cinco maneras de perder el borde propio* y *La realidad fractal*)",
             "(*El espejo sin profundidad*, *La realidad fractal* y, en el segundo tomo, *Cinco maneras de dudar en voz alta* y *Cinco maneras de perder el borde propio*)"),
            ("*Escrita al cierre de* Cinco maneras de dudar en voz alta.", "*Escrita al cierre de* Cinco maneras de dudar en voz alta (tomo II)."),
            ("*Escrita al cierre de* Cinco maneras de perder el borde propio.", "*Escrita al cierre de* Cinco maneras de perder el borde propio (tomo II).")],
    },
    "ca": {
        "cap_nota_autor": [("Diverses de les lectures topològiques (", "Diverses lectures del segon volum, *Lectures topològiques* (")],
        "prologo": [("Entre la sisena i la setena, tretze lectures topològiques porten les mateixes idees a la ficció, el cinema, l'art, l'esport i la vida quotidiana.",
                     "Un segon volum, *Lectures topològiques*, porta les mateixes idees a la ficció, el cinema, l'art, l'esport i la vida quotidiana.")],
        "cap_calibracion": [("La lectura «El traductor», més endavant, estudia", "La lectura «El traductor», al segon volum, estudia")],
        "cap13_5": [("(a la qual tornarem a les lectures topològiques)", "(a la qual tornarem al segon volum, *Lectures topològiques*)")],
        "cap_notas_cierre": [
            ("(*El mirall sense profunditat*, *Cinc maneres de dubtar en veu alta*, *Cinc maneres de perdre la vora pròpia* i *La realitat fractal*)",
             "(*El mirall sense profunditat*, *La realitat fractal* i, al segon volum, *Cinc maneres de dubtar en veu alta* i *Cinc maneres de perdre la vora pròpia*)"),
            ("*Escrita en tancar* Cinc maneres de dubtar en veu alta.", "*Escrita en tancar* Cinc maneres de dubtar en veu alta (volum II)."),
            ("*Escrita en tancar* Cinc maneres de perdre la vora pròpia.", "*Escrita en tancar* Cinc maneres de perdre la vora pròpia (volum II).")],
    },
    "en": {
        "cap_nota_autor": [("Several of the topological readings (", "Several readings from the second volume, *Topological Readings* (")],
        "prologo": [("Between the sixth and the seventh, thirteen topological readings carry the same ideas into fiction, film, art, sport and everyday life.",
                     "A second volume, *Topological Readings*, carries the same ideas into fiction, film, art, sport and everyday life.")],
        "cap_calibracion": [('The reading "The translator," later on, studies', 'The reading "The translator," in the second volume, studies')],
        "cap13_5": [("(to whom we will return in the topological readings)", "(to whom we will return in the second volume, *Topological Readings*)")],
        "cap_notas_cierre": [
            ("(*The Mirror Without Depth*, *Five Ways of Doubting Aloud*, *Five Ways of Losing Your Own Edge* and *Fractal Reality*)",
             "(*The Mirror Without Depth*, *Fractal Reality* and, in the second volume, *Five Ways of Doubting Aloud* and *Five Ways of Losing Your Own Edge*)"),
            ("*Written on finishing* Five Ways of Doubting Aloud.", "*Written on finishing* Five Ways of Doubting Aloud (Vol. II)."),
            ("*Written on finishing* Five Ways of Losing Your Own Edge.", "*Written on finishing* Five Ways of Losing Your Own Edge (Vol. II).")],
    },
}
# en el glosario las lecturas del tomo II llevan marca; solo se aplican las que estén
T1_GLOS = {
    "es": [("(*El traductor*)", "(*El traductor*, tomo II)"), ("(*El protocolo y el puente*)", "(*El protocolo y el puente*, tomo II)"),
           ("(*La playa al final del tiempo*)", "(*La playa al final del tiempo*, tomo II)"),
           ("(*Cinco maneras de dudar en voz alta*, *Cinco maneras de perder el borde propio*)",
            "(*Cinco maneras de dudar en voz alta*, *Cinco maneras de perder el borde propio*, tomo II)"),
           ("(*Cinco maneras de dudar en voz alta*)", "(*Cinco maneras de dudar en voz alta*, tomo II)"),
           ("(*Cinco maneras de perder el borde propio*)", "(*Cinco maneras de perder el borde propio*, tomo II)")],
    "ca": [("(*El traductor*)", "(*El traductor*, volum II)"), ("(*El protocol i el pont*)", "(*El protocol i el pont*, volum II)"),
           ("(*La platja al final del temps*)", "(*La platja al final del temps*, volum II)"),
           ("(*Cinc maneres de dubtar en veu alta*, *Cinc maneres de perdre la vora pròpia*)",
            "(*Cinc maneres de dubtar en veu alta*, *Cinc maneres de perdre la vora pròpia*, volum II)"),
           ("(*Cinc maneres de dubtar en veu alta*)", "(*Cinc maneres de dubtar en veu alta*, volum II)"),
           ("(*Cinc maneres de perdre la vora pròpia*)", "(*Cinc maneres de perdre la vora pròpia*, volum II)")],
    "en": [("(*The Translator*)", "(*The Translator*, Vol. II)"), ("(*The Protocol and the Bridge*)", "(*The Protocol and the Bridge*, Vol. II)"),
           ("(*The Beach at the End of Time*)", "(*The Beach at the End of Time*, Vol. II)"),
           ("(*Five Ways of Doubting Aloud*, *Five Ways of Losing Your Own Edge*)",
            "(*Five Ways of Doubting Aloud*, *Five Ways of Losing Your Own Edge*, Vol. II)"),
           ("(*Five Ways of Doubting Aloud*)", "(*Five Ways of Doubting Aloud*, Vol. II)"),
           ("(*Five Ways of Losing Your Own Edge*)", "(*Five Ways of Losing Your Own Edge*, Vol. II)")],
}
T1_NAVE = {   # la «lectura sobre el terror cósmico» ya no se cita con número en el tomo I
    "es": ("la lectura sobre el terror cósmico, en el capítulo 41,", "la lectura sobre el terror cósmico (en el segundo tomo),"),
    "ca": ("la lectura sobre el terror còsmic, al capítol 41,", "la lectura sobre el terror còsmic (al segon volum),"),
    "en": ("the reading on cosmic horror, in Chapter 41,", "the reading on cosmic horror (in the second volume),"),
}

CREDITS = {
    "t1": {"es": ("de la primera a la cuarta", "de la primera a la octava"), "ca": ("de la primera a la quarta", "de la primera a la vuitena"),
           "en": ("Part One through Part Four", "Part One through Part Eight")},
    "t2": {"es": ("catorce lecturas", "trece lecturas"), "ca": ("catorze lectures", "tretze lectures"), "en": ("fourteen readings", "thirteen readings")},
}

# ------------------------------------------------------------------ motor de remisiones
def target_text(L, E, host, tid, word, art, caps_first):
    """Texto de una remisión al capítulo `tid`, citado desde `host` en la edición E."""
    in_t2 = tid in LECT and E in ("t1", "t2")
    if E == "unico":
        return f"{word} {NUM['unico'][tid]}", "chapter"
    if E == "t1":
        if tid in LECT:
            return None, "reading_other"
        return f"{word} {NUM['t1'][tid]}", "chapter"
    # t2
    if tid in LECT:
        return None, "reading_here"
    return f"{word} {NUM['t1'][tid]}", "chapter"


def resolve_ref(L, E, host, n, occ):
    amb = AMBIG.get((host, n))
    if isinstance(amb, list):
        tid = amb[occ.get((host, n), 0)]
    elif amb:
        tid = amb
    else:
        tid = OLD2ID.get(n)
    occ[(host, n)] = occ.get((host, n), 0) + 1
    if tid is None or tid in DROPPED:
        raise SystemExit(f"remisión sin destino: {host} capítulo {n} ({tid})")
    return tid


def ref_phrase(L, E, tid, word, art, sentence_start):
    """Cadena nueva para una remisión (sin el paréntesis de apertura)."""
    kind_text, kind = target_text(L, E, None, tid, word, art, False)
    if kind == "chapter":
        return (art or "") + kind_text
    k = NUM["t2"][tid]
    if kind == "reading_here":
        phrase = f"{L.read_word} {k}"
    else:
        phrase = f"{L.read_word} {k}{L.read_suffix}"
    if L.lg == "en":
        if word[0].islower():
            phrase = phrase[0].lower() + phrase[1:]
        return phrase
    if art:
        a = L.art[art.strip().lower()]
        if art[0].isupper():
            a = a[0].upper() + a[1:]
        return a + " " + phrase
    if word[0].isupper():
        phrase = phrase[0].upper() + phrase[1:]
    return phrase


def edits_for(lg, E, host, text):
    """Lista (inicio, fin, texto nuevo) con todas las remisiones del texto."""
    L = LANG[lg]
    occ = {}
    edits = []
    spans = []
    # «Nota al Capítulo N»: siempre el propio capítulo
    for m in L.host.finditer(text):
        n = int(m.group(1))
        if OLD.get(host) != n:
            print(f"  aviso: {lg} {host}: la nota dice capítulo {n} y el capítulo era el {OLD.get(host)}")
        if E == "t2":
            new = L.host_read.format(n=NUM["t2"][host])
        else:
            new = L.host_fmt.format(n=NUM[E][host])
        edits.append((m.start(), m.end(), new))
        spans.append((m.start(), m.end()))

    def inside(a, b):
        return any(s <= a and b <= e for s, e in spans)

    for m in L.ref.finditer(text):
        if inside(m.start(), m.end()):
            continue
        if re.match(r" (?:del|de|of the) \*?(?:Tao|Zhuangzi)", text[m.end():m.end() + 16]):
            continue   # «capítulo 25 del *Tao Te Ching*»: es el libro de Laozi, no una remisión
        n1 = int(m.group("n1"))
        art = m.group("art")
        word = m.group("word") + (m.group("pl") or "")
        sentence_start = False
        t1 = resolve_ref(L, E, host, n1, occ)
        if m.group("n2"):
            n2 = int(m.group("n2"))
            t2_ = resolve_ref(L, E, host, n2, occ)
            for t in (t1, t2_):
                if (E == "t1" and t in LECT) or (E == "t2" and t in LECT) :
                    raise SystemExit(f"lista de capítulos con lectura: {lg} {host} {m.group(0)}")
            num = lambda t: NUM["t1" if E == "t2" else E][t]
            new = f"{art or ''}{m.group('open') or ''}{word} {num(t1)} {m.group('conj')} {num(t2_)}"
        else:
            body = ref_phrase(L, E, t1, word, art, False)
            if not art and m.group("art") is None:
                pass
            new = (m.group("open") or "") + body
        edits.append((m.start(), m.end(), new))
        spans.append((m.start(), m.end()))
    for m in L.ph.finditer(text):
        tid = m.group(1)
        if E == "t2":
            num = NUM["t1"][tid]
        elif E == "t1":
            num = NUM["t1"][tid]
        else:
            num = NUM["unico"][tid]
        edits.append((m.start(), m.end(), str(num)))
        spans.append((m.start(), m.end()))
    if L.bare and host in BARE_IN:
        for m in L.bare.finditer(text):
            if inside(m.start(), m.end()):
                continue
            n = int(m.group(2))
            tid = resolve_ref(L, E, host, n, occ)
            if tid in LECT:
                raise SystemExit(f"número suelto hacia una lectura: {lg} {host} {m.group(0)}")
            num = NUM["t1" if E == "t2" else E][tid]
            edits.append((m.start(), m.end(), f"{m.group(1)} el {num}"))
    edits.sort()
    for a, b in zip(edits, edits[1:]):
        assert a[1] <= b[0], (host, text[a[0]:a[1]], text[b[0]:b[1]])
    return edits


def apply_edits(text, edits):
    out, pos = [], 0
    for s, e, new in edits:
        out.append(text[pos:s]); out.append(new); pos = e
    out.append(text[pos:])
    return "".join(out)


def make_pairs(text, edits):
    """Pares `replace` en dos fases con el mismo resultado que apply_edits."""
    edits = [e for e in edits if text[e[0]:e[1]] != e[2]]
    if not edits:
        return []
    # grupos: cada edición se amplía hasta ser única en el texto; se funden las que se solapan
    groups = [[e[0], e[1], [e]] for e in edits]
    changed = True
    while changed:
        changed = False
        for g in groups:
            s, e = g[0], g[1]
            step = 0
            while text.count(text[s:e]) != 1:
                step += 12
                s2, e2 = max(0, g[0] - step), min(len(text), g[1] + step)
                s, e = s2, e2
                if step > 4000:
                    raise SystemExit("contexto inabarcable")
            if (s, e) != (g[0], g[1]):
                g[0], g[1] = s, e
        groups.sort(key=lambda g: g[0])
        merged = []
        for g in groups:
            if merged and g[0] < merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], g[1])
                merged[-1][2] += g[2]
                changed = True
            else:
                merged.append(g)
        groups = merged
    pairs1, pairs2 = [], []
    for gi, (s, e, es) in enumerate(groups):
        es = sorted(es)
        old = text[s:e]
        tok_new, fin_new, pos = [], [], s
        for k, (a, b, new) in enumerate(es):
            tok = f"⟦{gi}.{k}⟧"
            tok_new.append(text[pos:a]); tok_new.append(tok)
            fin_new.append(text[pos:a]); fin_new.append(new)
            pairs2.append([tok, new])
            pos = b
        tok_new.append(text[pos:e]); fin_new.append(text[pos:e])
        pairs1.append([old, "".join(tok_new)])
    return pairs1 + pairs2


def simulate(text, pairs):
    for old, new in pairs:
        assert old in text, old[:80]
        text = text.replace(old, new)
    return text


# ------------------------------------------------------------------ TOC
def pre_pairs(lg, E, cid, text):
    """Correcciones de texto propias de la edición, anteriores a las remisiones."""
    out = []
    if E == "t1":
        for a, b in T1_REQ[lg].get(cid, []):
            out.append((a, b, True))
        if cid == "cap_glosario":
            for a, b in T1_GLOS[lg]:
                out.append((a, b, False))
        if cid == "cap_nave_de_barro":
            out.append((*T1_NAVE[lg], True))
    if E == "t2":
        for a, b in ESSAY_WORDS[lg]:
            out.append((a, b, False))
    kept = []
    for a, b, req in out:
        if a in text:
            kept.append([a, b]); text = text.replace(a, b)
        elif req:
            raise SystemExit(f"texto esperado no encontrado ({lg} {E} {cid}): {a[:70]}")
    return kept, text


def chapter_entry(lg, E, cid, report):
    entry = {"id": cid, "content_file": content_file(lg, cid)}
    fm, body = read_chapter(lg, cid)
    body_pdf = re.sub(r"(?:\s*^---\s*)+\Z", "\n", body, flags=re.M)
    pre, text = pre_pairs(lg, E, cid, body_pdf)
    edits = edits_for(lg, E, cid, text)
    pairs = make_pairs(text, edits)
    # comprobación: las parejas dan lo mismo que la sustitución directa, y valen también para el EPUB (sin recorte final)
    final = apply_edits(text, edits)
    assert simulate(text, pairs) == final
    t = body
    for x, y in pre:
        t = t.replace(x, y)
    simulate(t, pairs)
    allp = pre + pairs
    if allp:
        entry["replace"] = allp
    for e in edits:
        report.append((cid, text[e[0]:e[1]], e[2]))
    # subtítulo con remisiones
    sub = fm.get("subtitle")
    if sub:
        se = edits_for(lg, E, cid, sub) if L_has_ref(lg, sub) else []
        if se:
            entry["subtitle"] = apply_edits(sub, se)
    if cid in NUMBERED:
        if E == "t2":
            entry["chapter_number"] = NUM["t2"][cid]
            entry["section"] = ""
        else:
            entry["chapter_number"] = NUM[E][cid]
            entry["section"] = PARTS[PART_OF[cid]][LI[lg]]
    elif cid in EPI:
        entry["section"] = PARTS["VIII"][LI[lg]]
    return entry


def L_has_ref(lg, s):
    L = LANG[lg]
    return bool(L.ref.search(s) or L.ph.search(s))


def prune(cfg):
    """Fuera las láminas de los cuentos: este volumen no los lleva."""
    cfg = dict(cfg)
    cfg["illustrations"] = {k: v for k, v in cfg.get("illustrations", {}).items()
                            if (not k.startswith("cuento_") or k == "cuento_01") and k != "il_el_que_queda"}
    return cfg


def build(lg):
    report = {}
    base_unico = prune({k: v for k, v in BASE_TOC[lg].items() if k != "chapters"})
    cfgs = {"unico": base_unico,
            "t1": dict(prune({k: v for k, v in BASE_T1[lg].items() if k != "chapters"}), body_leading={"es": 14.4, "ca": 14.8, "en": 15.0}[lg]),
            "t2": prune({k: v for k, v in BASE_T2[lg].items() if k != "chapters"})}
    a, b = CREDITS["t1"][lg]
    c = cfgs["t1"]["credits"]; assert any(a in x for x in c), (lg, a)
    cfgs["t1"]["credits"] = [x.replace(a, b) for x in c]
    a, b = CREDITS["t2"][lg]
    c = cfgs["t2"]["credits"]; assert any(a in x for x in c), (lg, a)
    cfgs["t2"]["credits"] = [x.replace(a, b) for x in c]
    names = {"unico": f"toc_ensayo{SFX[lg]}.json", "t1": f"toc_tomo1_ensayo{SFX[lg]}.json", "t2": f"toc_tomo2_lecturas{SFX[lg]}.json"}
    for E in ("unico", "t1", "t2"):
        rep = []
        toc = dict(cfgs[E])
        toc["chapters"] = [chapter_entry(lg, E, cid, rep) for cid in ORDER[E]]
        if E in ("t1", "t2"):
            src = (BASE_T1 if E == "t1" else BASE_T2)[lg]["chapters"][0]
            assert src["id"] == ("intro_vol1" if E == "t1" else "intro_vol2"), (lg, E, src["id"])
            toc["chapters"].insert(0, dict(src))
        (ROOT / names[E]).write_text(json.dumps(toc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report[E] = rep
        print(f"{names[E]}: {len(toc['chapters'])} capítulos, {len(rep)} remisiones")
    return report


def main():
    allrep = {lg: build(lg) for lg in LG}
    (ROOT / "revision").mkdir(exist_ok=True)
    lines = ["# Remisiones renumeradas (generado por scripts/restructure.py)", "",
             "Edición · idioma · capítulo · antes → después", ""]
    for lg in LG:
        for E in ("unico", "t1", "t2"):
            for cid, old, new in allrep[lg][E]:
                lines.append(f"{E} · {lg} · {cid} · {old} → {new}")
    (ROOT / "revision" / "remisiones_renumeradas.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
