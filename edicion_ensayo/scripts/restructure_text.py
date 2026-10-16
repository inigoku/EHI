#!/usr/bin/env python3
"""Cirugías de texto de la reestructuración del ensayo (es / ca / en).

Parte SIEMPRE del estado de la base (commit 9d21b5d), de modo que se puede
volver a ejecutar sin que las ediciones se acumulen. Escribe:

  · es / ca  →  edicion_ensayo/content_overrides/<id>.<lg>.md
               (copias solo de esta edición; content/* lo comparte la web)
  · en       →  edicion_ensayo/en/<id>.en.md

En el texto nuevo, las remisiones «capítulo N» llevan la numeración ANTIGUA
(la del volumen único anterior); scripts/restructure.py las convierte a la
nueva. Los capítulos que no existían antes se citan con {{n:id}}.

    python3 scripts/restructure_text.py        (desde edicion_ensayo/)
"""
import json, os, re, subprocess, sys
from pathlib import Path

BASE = "3a9c33a899e140d7bff16ebddcc26ac7ce450239"
ROOT = Path(__file__).resolve().parent.parent          # edicion_ensayo/
REPO = ROOT.parent
LG = ("es", "ca", "en")
TOCS = {"es": "toc_ensayo.json", "ca": "toc_ensayo_ca.json", "en": "toc_ensayo_en.json"}


def git_show(rel):
    return subprocess.check_output(["git", "show", f"{BASE}:{rel}"], cwd=REPO).decode("utf-8")


def toc_files(lg):
    toc = json.loads(git_show(f"edicion_ensayo/{TOCS[lg]}"))
    return {c["id"]: os.path.normpath(os.path.join("edicion_ensayo", c["content_file"])) for c in toc["chapters"]}


FILES = {lg: toc_files(lg) for lg in LG}
# Sustituciones que el TOC de la base ya aplica al texto impreso (p. ej. entradas del glosario que solo valen para la web)
REPL = {lg: {c["id"]: c["replace"] for c in json.loads(git_show(f"edicion_ensayo/{TOCS[lg]}"))["chapters"] if c.get("replace")} for lg in LG}


class Doc:
    def __init__(self, lg, cid):
        self.lg, self.cid = lg, cid
        s = git_show(FILES[lg][cid])
        _, self.fm, body = s.split("---", 2)
        for a, b in REPL[lg].get(cid, []):
            assert a in body, (lg, cid, a[:50])
            body = body.replace(a, b, 1)
        self.lead = body[: len(body) - len(body.lstrip("\n"))]
        self.trail = body[len(body.rstrip()):]
        self.p = body.strip().split("\n\n")

    def find(self, start):
        hits = [i for i, x in enumerate(self.p) if x.startswith(start)]
        assert len(hits) == 1, (self.lg, self.cid, start, hits)
        return hits[0]

    def sub(self, old, new, count=None):
        """Sustituye en todo el cuerpo (cada `old` debe existir)."""
        n = 0
        for i, x in enumerate(self.p):
            if old in x:
                n += x.count(old)
                self.p[i] = x.replace(old, new)
        assert n and (count is None or n == count), (self.lg, self.cid, old[:60], n)

    def setfm(self, key, value):
        pat = re.compile(rf"^{key}:.*$", re.M)
        line = f"{key}: {value}"
        if pat.search(self.fm):
            self.fm = pat.sub(lambda m: line, self.fm, count=1)
        else:
            self.fm = self.fm.rstrip("\n") + "\n" + line + "\n"

    def subfm(self, old, new):
        assert old in self.fm, (self.lg, self.cid, old)
        self.fm = self.fm.replace(old, new)

    def text(self):
        return "---" + self.fm + "---" + self.lead + "\n\n".join(self.p) + self.trail

    def target(self, cid=None):
        cid = cid or self.cid
        if self.lg == "en":
            return ROOT / "en" / f"{cid}.en.md"
        return ROOT / "content_overrides" / f"{cid}.{self.lg}.md"

    def save(self, cid=None):
        t = self.target(cid)
        t.write_text(self.text(), encoding="utf-8")
        print("  escrito", t.relative_to(ROOT))


def per_lang(fn):
    for lg in LG:
        fn(lg)


# ---------------------------------------------------------------------------
# 1. Las dos selecciones: del «espejo sin profundidad» al nacimiento
# ---------------------------------------------------------------------------
H_SEL = {"es": "### Las dos selecciones", "ca": "### Les dues seleccions", "en": "### The two selections"}
SEL_END = {
    "es": ("la pregunta por la conciencia de una máquina exige las tres a la vez.",
           "la pregunta de si hay alguien, en un feto, en una máquina o en un clon, exige las tres a la vez."),
    "ca": ("la pregunta per la consciència d'una màquina exigeix les tres alhora.",
           "la pregunta de si hi ha algú, en un fetus, en una màquina o en un clon, exigeix les tres alhora."),
    "en": ("the question of a machine's consciousness demands all three at once.",
           "the question of whether someone is there, in a fetus, a machine or a clone, demands all three at once."),
}
ESP_P8 = {
    "es": ("hubieran operado en él las dos selecciones.",
           "hubieran operado en él las dos selecciones que el capítulo 6 describió al hablar del nacimiento."),
    "ca": ("haguessin operat en ell les dues seleccions.",
           "haguessin operat en ell les dues seleccions que el capítol 6 va descriure en parlar del naixement."),
    "en": ("the two selections had operated in it.",
           "the two selections that Chapter 6 described in discussing birth had operated in it."),
}


def sel_nacimiento(lg, sel, comp):
    nac = Doc(lg, "cap5")
    heads = [k for k, x in enumerate(nac.p) if x.startswith("### ")]
    # tercer apartado tras «El río que se convierte en lago»: «El reservorio que condensa» + siguiente
    k_res = next(k for k in heads if re.match(r"### (El reservorio que condensa|El reservori que condensa|The reservoir that condenses)", nac.p[k]))
    k_next = next(k for k in heads if k > k_res)
    nac.p[k_next:k_next] = [H_SEL[lg], sel, comp]
    nac.save()


# ---------------------------------------------------------------------------
# 2. La muerte como retorno: el cuento desaparece y entra el tiempo de Page
# ---------------------------------------------------------------------------
CITY = {
    "es": "Había una ciudad junto a un agua que se retiró, y un archivista que guardó lo que el agua dejó.",
    "ca": "Hi havia una ciutat vora una aigua que es va retirar, i un arxivista que va guardar el que l'aigua va deixar.",
    "en": "There was a city beside a water that withdrew, and an archivist who kept what the water left behind.",
}
PAGE_ANCHOR = {"es": "La solución que hoy parece más probable", "ca": "La solució que avui sembla més probable",
               "en": "The solution that seems most likely today"}
PAGE = {
    "es": ["Esa conservación tiene calendario. Durante la primera mitad de la vida del agujero negro, la radiación de Hawking es térmica: lleva una entropía creciente y ninguna correlación recuperable con lo que cayó dentro. Pasado el llamado *tiempo de Page*, más o menos a la mitad de esa vida, la radiación deja de ser puro ruido: cada partícula que escapa queda entrelazada también con la que salió antes, y lo que emite el horizonte ya no es solo pérdida, sino correlación. Por eso la pregunta por lo que queda tiene dos respuestas según el momento: mientras el horizonte está en su primera mitad, nada cruza su frontera de vuelta; solo después empieza a haber, en principio, algo legible.",
           "> **En física esto se llama:** tiempo de Page, el punto de la evaporación a partir del cual la entropía de la radiación deja de crecer y empieza a disminuir."],
    "ca": ["Aquesta conservació té calendari. Durant la primera meitat de la vida del forat negre, la radiació de Hawking és tèrmica: porta una entropia creixent i cap correlació recuperable amb allò que hi va caure. Passat l'anomenat *temps de Page*, més o menys a la meitat d'aquesta vida, la radiació deixa de ser pur soroll: cada partícula que s'escapa queda entrellaçada també amb la que va sortir abans, i el que emet l'horitzó ja no és només pèrdua, sinó correlació. Per això la pregunta pel que queda té dues respostes segons el moment: mentre l'horitzó és en la seva primera meitat, res no creua la seva frontera de tornada; només després comença a haver-hi, en principi, alguna cosa llegible.",
           "> **En física, això s'anomena:** temps de Page, el punt de l'evaporació a partir del qual l'entropia de la radiació deixa de créixer i comença a disminuir."],
    "en": ["That conservation has a calendar. During the first half of the black hole's life, Hawking radiation is thermal: it carries growing entropy and no recoverable correlation with what fell in. After the so-called *Page time*, roughly halfway through that life, the radiation stops being pure noise: each escaping particle becomes entangled with the radiation that left before it, and what the horizon emits is no longer only loss but correlation. So the question of what remains has two answers depending on the moment: while the horizon is in its first half, nothing crosses its boundary back; only afterwards does there begin to be, in principle, something legible.",
           "> **In physics this is called:** Page time, the point in the evaporation after which the entropy of the radiation stops growing and begins to decrease."],
}
EPI_START = {"es": "> *El agua regresó de noche.", "ca": "> *L'aigua va tornar de nit.", "en": "> *The water came back at night."}


def muerte(lg):
    d = Doc(lg, "cap6")
    assert d.p[0].startswith(EPI_START[lg]), d.p[0][:40]
    d.p[0] = "> *" + CITY[lg] + " " + d.p[0][3:]
    i = d.find(PAGE_ANCHOR[lg])
    d.p[i + 1:i + 1] = PAGE[lg]
    d.save()


# ---------------------------------------------------------------------------
# 3. La teoría de la información se parte en dos
# ---------------------------------------------------------------------------
INFO_FM = {
    "es": ("QUÉ QUIERE DECIR «INFORMACIÓN»", "(La información como relación, y no como cosa)", "PRIMERA PARTE: EL CICLO DEL HORIZONTE"),
    "ca": ("QUÈ VOL DIR «INFORMACIÓ»", "(La informació com a relació, i no com a cosa)", "PRIMERA PART: EL CICLE DE L'HORITZÓ"),
    "en": ("WHAT “INFORMATION” MEANS", "(Information as a relation, not a thing)", "PART ONE: THE CYCLE OF THE HORIZON"),
}
INFO_18 = {
    "es": "Es la magnitud que, sin nombrarla, describirán el capítulo 10 al hablar del acoplamiento neuronal y el capítulo 12 al hablar del entrelazamiento.",
    "ca": "És la magnitud que, sense anomenar-la, descriuran el capítol 10 en parlar de l'acoblament neuronal i el capítol 12 en parlar de l'entrellaçament.",
    "en": "It is the quantity that Chapter 10, on neural coupling, and Chapter 12, on entanglement, will describe without naming it.",
}
INFO_21 = {
    "es": "El capítulo {{n:cap_teoria_informacion}} vuelve sobre esta magnitud con más detalle, y también sobre el punto en el que deja de bastar.",
    "ca": "El capítol {{n:cap_teoria_informacion}} torna sobre aquesta magnitud amb més detall, i també sobre el punt en què deixa de bastar.",
    "en": "Chapter {{n:cap_teoria_informacion}} returns to this quantity in more detail, and also to the point at which it stops being enough.",
}
CANAL_FM = {
    "es": "LA INFORMACIÓN Y EL CANAL CERRADO",
    "ca": "LA INFORMACIÓ I EL CANAL TANCAT",
    "en": "INFORMATION AND THE CLOSED CHANNEL",
}
CANAL_OPEN = {
    "es": "El capítulo {{n:cap_info_intro}} presentó la información como relación y la información mutua como primer esbozo del vínculo. Ahora que el amor, la adicción, el vínculo materno, la empatía y el duelo han mostrado ese vínculo en acción, queda preguntar por su límite: qué capacidad tiene un horizonte, qué ocurre cuando el canal es el propio sistema y dónde deja de bastar el vocabulario de Shannon.",
    "ca": "El capítol {{n:cap_info_intro}} va presentar la informació com a relació i la informació mútua com a primer esbós del vincle. Ara que l'amor, l'addicció, el vincle matern, l'empatia i el dol han mostrat aquest vincle en acció, queda preguntar pel seu límit: quina capacitat té un horitzó, què passa quan el canal és el propi sistema i on deixa de bastar el vocabulari de Shannon.",
    "en": "Chapter {{n:cap_info_intro}} presented information as a relation and mutual information as a first sketch of the bond. Now that love, addiction, the mother-child bond, empathy and grief have shown that bond in action, what remains is to ask about its limit: what capacity a horizon has, what happens when the channel is the system itself, and where Shannon's vocabulary stops being enough.",
}


def informacion(lg):
    d = Doc(lg, "cap_teoria_informacion")
    first = d.p[:22]          # 0-21: §I-II (Shannon, la información como relación, información mutua)
    rest = d.p[22:]
    assert first[2].startswith("## I. ") and rest[0].startswith("## III. "), (lg, first[2][:20], rest[0][:20])
    # -- capítulo nuevo
    intro = Doc(lg, "cap_teoria_informacion")
    t, st, sec = INFO_FM[lg]
    intro.setfm("title", t); intro.setfm("subtitle", st); intro.setfm("section", sec)
    intro.fm = re.sub(r"^(illustration\w*|chapterNumber|linkedCuentosId):.*\n", "", intro.fm, flags=re.M)
    first = list(first)
    m = re.match(r"^(.*?[.!?])(\s.*)$", first[18], re.S)
    first[18] = INFO_18[lg] + m.group(2)
    assert first[21].startswith(("El capítulo siguiente", "El capítol següent", "The next chapter")), first[21][:30]
    first[21] = INFO_21[lg]
    intro.p = first
    intro.save("cap_info_intro")
    # -- lo que queda
    d.setfm("title", CANAL_FM[lg])
    rest = [re.sub(r"^## (III|IV|V)\. ", lambda m: {"III": "## I. ", "IV": "## II. ", "V": "## III. "}[m.group(1)], x) for x in rest]
    d.p = [CANAL_OPEN[lg]] + rest
    d.save()


# ---------------------------------------------------------------------------
# 4. Entrelazamiento vertical → «Cinco mapas»; horizonte colectivo → «El horizonte herido»
# ---------------------------------------------------------------------------
VERT_CUT = {
    "es": ("El capítulo 29, «El entrelazamiento vertical», lo desarrolla en detalle: la misma técnica (repetición hasta que cesa el ruido, quietud, ritmo compartido) es estructuralmente idéntica",
           "La misma técnica es estructuralmente idéntica"),
    "ca": ("El capítol 29, «L'entrellaçament vertical», ho desenvolupa en detall: la mateixa tècnica (repetició fins que cessa el soroll, quietud, ritme compartit) és estructuralment idèntica",
           "La mateixa tècnica és estructuralment idèntica"),
    "en": ("Chapter 29, \"Vertical entanglement,\" develops this in detail: the same technique (repetition until the noise stops, stillness, shared rhythm) is structurally identical",
           "The same technique is structurally identical"),
}
VERT_TABLE = {
    "es": ("(véase el capítulo 29)", "(véase más abajo, «El entrelazamiento vertical»)"),
    "ca": ("(vegeu el capítol 29)", "(vegeu més avall, «L'entrellaçament vertical»)"),
    "en": ("(see Chapter 29)", "(see below, “Vertical entanglement”)"),
}
DIA_FRAME = {
    "es": "El capítulo 28 llamó entrelazamiento vertical a la resonancia sostenida que una persona orienta hacia algo más allá de su propia frontera, y mostró que la misma técnica conduce a cinco destinos distintos. Esta lectura no vuelve sobre la comparación: sigue esa técnica, desde dentro, en cinco obras.",
    "ca": "El capítol 28 va anomenar entrellaçament vertical la ressonància sostinguda que una persona orienta cap a alguna cosa més enllà de la seva pròpia frontera, i va mostrar que la mateixa tècnica porta a cinc destins diferents. Aquesta lectura no torna sobre la comparació: segueix aquesta tècnica, des de dins, en cinc obres.",
    "en": "Chapter 28 called vertical entanglement the sustained resonance a person directs toward something beyond their own boundary, and showed that the same technique leads to five different destinations. This reading does not return to the comparison: it follows that technique, from the inside, through five works.",
}
DIA_P6 = {
    "es": ("El capítulo anterior mostró", "El capítulo 28 mostró"),
    "ca": ("El capítol anterior va mostrar", "El capítol 28 va mostrar"),
    "en": ("The previous chapter showed", "Chapter 28 showed"),
}
DIA_TITLE = {"es": "CINCO MANERAS DE DUDAR EN VOZ ALTA", "ca": "CINC MANERES DE DUBTAR EN VEU ALTA",
             "en": "FIVE WAYS OF DOUBTING ALOUD"}
OJO_TITLE = {"es": "CINCO MANERAS DE PERDER EL BORDE PROPIO", "ca": "CINC MANERES DE PERDRE LA VORA PRÒPIA",
             "en": "FIVE WAYS OF LOSING YOUR OWN EDGE"}
COL_HEAD = {"es": "## El horizonte colectivo: cuando muchos se condensan en uno",
            "ca": "## L'horitzó col·lectiu: quan molts es condensen en un",
            "en": "## The collective horizon: when many condense into one"}
COL_LEAD = {
    "es": "La salvedad anterior no impide que existan horizontes colectivos de menor escala: movimientos, partidos, multitudes. No son la sociedad entera, que no nació ni cruzó ningún umbral; son lo que se condensa cuando miles de horizontes que no se conocen entre sí comparten, sin haberse visto nunca, una misma configuración.",
    "ca": "La salvetat anterior no impedeix que existeixin horitzons col·lectius de menor escala: moviments, partits, multituds. No són la societat sencera, que no va néixer ni va creuar cap llindar; són el que es condensa quan milers d'horitzons que no es coneixen entre ells comparteixen, sense haver-se vist mai, una mateixa configuració.",
    "en": "The caveat above does not rule out collective horizons on a smaller scale: movements, parties, crowds. They are not society as a whole, which was never born and crossed no threshold; they are what condenses when thousands of horizons that do not know one another share, without ever having met, the same configuration.",
}
COL_TAIL = {
    "es": "Qué ocurre cuando ese borde deja de ser algo que se sostiene y pasa a sostener a quien lo sostiene (el fanatismo) lo estudia la lectura «Cinco maneras de perder el borde propio» (capítulo 30).",
    "ca": "Què passa quan aquesta vora deixa de ser alguna cosa que se sosté i passa a sostenir qui la sosté (el fanatisme) ho estudia la lectura «Cinc maneres de perdre la vora pròpia» (capítol 30).",
    "en": "What happens when that edge stops being something one holds and starts holding the one who holds it (fanaticism) is studied in the reading “Five ways of losing one's own edge” (Chapter 30).",
}
OJO_FRAME = {
    "es": ("Lo que se pregunta este capítulo es qué ocurre cuando la idea que organiza el horizonte no apunta hacia arriba, hacia un reservorio o un horizonte de origen, sino hacia los lados: hacia miles de horizontes que no se conocen entre sí y comparten, sin haberse visto nunca, la misma configuración.",
           "El capítulo 25 llamó horizonte colectivo a lo que se condensa cuando miles de horizontes que no se conocen entre sí comparten, sin haberse visto nunca, la misma configuración. Lo que se pregunta esta lectura es qué ocurre cuando la idea que organiza el horizonte no apunta hacia arriba, hacia un reservorio o un horizonte de origen, sino hacia los lados, hacia ese horizonte colectivo."),
    "ca": ("El que es pregunta aquest capítol és què passa quan la idea que organitza l'horitzó no apunta cap amunt, cap a un reservori o un horitzó d'origen, sinó cap als costats: cap a milers d'horitzons que no es coneixen entre ells i comparteixen, sense haver-se vist mai, la mateixa configuració.",
           "El capítol 25 va anomenar horitzó col·lectiu allò que es condensa quan milers d'horitzons que no es coneixen entre ells comparteixen, sense haver-se vist mai, la mateixa configuració. El que es pregunta aquesta lectura és què passa quan la idea que organitza l'horitzó no apunta cap amunt, cap a un reservori o un horitzó d'origen, sinó cap als costats, cap a aquest horitzó col·lectiu."),
    "en": ("What this chapter asks is what happens when the idea that organizes the horizon points not upward, toward a reservoir or a horizon of origin, but sideways: toward thousands of horizons that do not know one another and share, without ever having met, the same configuration.",
           "Chapter 25 called collective horizon what condenses when thousands of horizons that do not know one another share, without ever having met, the same configuration. What this reading asks is what happens when the idea that organizes the horizon points not upward, toward a reservoir or a horizon of origin, but sideways, toward that collective horizon."),
}


def vertical_y_colectivo(lg):
    dia = Doc(lg, "cap_diapason_invisible")
    rel = Doc(lg, "cap_religiones_comparadas")
    c0, c1 = dia.p[0], dia.p[1]
    # religiones: la definición del concepto abre el apartado del entrelazamiento vertical
    k = next(i for i, x in enumerate(rel.p) if re.match(r"### (El entrelazamiento vertical|L'entrellaçament vertical|Vertical entanglement)", x))
    old, new = VERT_CUT[lg]
    p37 = rel.p[k + 1]
    assert old in p37, (lg, "p37")
    a, rest = p37.split(" " + old, 1)
    rel.p[k + 1:k + 2] = [a, c0, c1, new + rest]
    rel.sub(*VERT_TABLE[lg], count=1)
    rel.save()
    # diapasón: el concepto sale, queda un párrafo de enlace
    p6 = dia.p[6]
    assert DIA_P6[lg][0] in p6, (lg, "p6")
    dia.p[6] = p6.replace(*DIA_P6[lg])
    dia.p[0:6] = [DIA_FRAME[lg]]
    dia.setfm("title", DIA_TITLE[lg])
    dia.save()
    # horizonte herido: entra el horizonte colectivo
    ojo = Doc(lg, "cap_ojo_un_solo_color")
    her = Doc(lg, "cap16_real")
    p1, p2 = ojo.p[1], ojo.p[2]
    k = next(i for i, x in enumerate(her.p) if re.match(r"## (El trauma colectivo|El trauma col·lectiu|Collective trauma)", x))
    assert her.p[k - 1] == "---"
    her.p[k:k] = [COL_HEAD[lg], COL_LEAD[lg], p1, p2, COL_TAIL[lg], "---"]
    her.save()
    old, new = OJO_FRAME[lg]
    assert old in ojo.p[0], (lg, "ojo0")
    ojo.p[0] = ojo.p[0].replace(old, new)
    del ojo.p[1:3]
    ojo.setfm("title", OJO_TITLE[lg])
    ojo.save()


# ---------------------------------------------------------------------------
# 5. Epílogo, casos límite, hipótesis del autor, glosario…
# ---------------------------------------------------------------------------
EPI_FIRST = {"es": "*El agua regresó de noche.", "ca": "*L'aigua va tornar de nit.", "en": "*The water came back at night."}
EPI_DESC = {
    "es": [("La misma vista de Tarel que al principio, pero ahora el agua ha vuelto.", "La orilla de la ciudad, ahora con el agua de vuelta."),
           ("huellas de Tarel", "huellas de la ciudad")],
    "ca": [("La mateixa vista de Tarel que al principi, però ara l'aigua ha tornat.", "La vora de la ciutat, ara amb l'aigua de tornada."),
           ("petjades de Tarel", "petjades de la ciutat")],
    "en": [("The same view of Tarel as at the beginning, but now the water has returned.", "The shore of the city, now with the water returned."),
           ("traces of Tarel", "traces of the city")],
}


def epilogo(lg):
    d = Doc(lg, "cap_epilogo_real")
    assert d.p[0].startswith(EPI_FIRST[lg]), d.p[0][:30]
    d.p[0] = "*" + CITY[lg] + "*  \n" + d.p[0]
    for a, b in EPI_DESC[lg]:
        d.subfm(a, b)
    d.save()


CASOS = {
    "es": [("ante las dos selecciones del capítulo anterior", "ante las dos selecciones del capítulo 6"),
           ("(el capítulo anterior lo desarrolló a propósito de la inteligencia artificial)", "(el capítulo 6 lo desarrolló a propósito del nacimiento)")],
    "ca": [("davant les dues seleccions del capítol anterior", "davant les dues seleccions del capítol 6"),
           ("(el capítol anterior ho va desenvolupar a propòsit de la intel·ligència artificial)", "(el capítol 6 ho va desenvolupar a propòsit del naixement)")],
    "en": [("in light of the previous chapter's two selections", "in light of Chapter 6's two selections"),
           ("(the previous chapter developed it in connection with artificial intelligence)", "(Chapter 6 developed it in connection with birth)")],
}


def casos(lg):
    d = Doc(lg, "cap18_real")
    d.subfm(*CASOS[lg][0])
    d.sub(*CASOS[lg][1], count=1)
    d.save()


HIP = {   # los dos capítulos de la séptima parte dejan de ser «lecturas»
    "cap_nave_de_barro": {
        "es": [("La lectura anterior terminó", "El capítulo anterior terminó"), ("Esta lectura intenta responder", "Este capítulo intenta responder"),
               ("lo mismo que dijo la lectura anterior", "lo mismo que dijo el capítulo anterior"), ("La lectura anterior lo mostraba", "El capítulo anterior lo mostraba"),
               ("La tesis de esta lectura es", "La tesis de este capítulo es"), ("proposición más atrevida de esta lectura", "proposición más atrevida de este capítulo"),
               ("condensar esta lectura en pocas líneas", "condensar este capítulo en pocas líneas")],
        "ca": [("La lectura anterior va acabar", "El capítol anterior va acabar"), ("Aquesta lectura intenta respondre", "Aquest capítol intenta respondre"),
               ("el mateix que va dir la lectura anterior", "el mateix que va dir el capítol anterior"), ("La lectura anterior ho mostrava", "El capítol anterior ho mostrava"),
               ("La tesi d'aquesta lectura és", "La tesi d'aquest capítol és"), ("proposició més agosarada d'aquesta lectura", "proposició més agosarada d'aquest capítol"),
               ("condensar aquesta lectura en poques línies", "condensar aquest capítol en poques línies")],
        "en": [("The previous reading ended", "The previous chapter ended"), ("This reading tries to answer", "This chapter tries to answer"),
               ("what the previous reading said", "what the previous chapter said"), ("The previous reading showed", "The previous chapter showed"),
               ("This reading's thesis", "This chapter's thesis"), ("this reading's boldest proposition", "this chapter's boldest proposition"),
               ("If this reading had to be condensed", "If this chapter had to be condensed")],
    },
    "cap_realidad_fractal": {
        "es": [("hay algo que esa lectura no explica", "hay algo que ese capítulo no explica")],
        "ca": [("hi ha alguna cosa que aquesta lectura no explica", "hi ha alguna cosa que aquest capítol no explica")],
        "en": [("there is something that reading does not explain", "there is something that this chapter does not explain")],
    },
    "cap_notas_cierre": {
        "es": [("Esta lectura no la busqué.", "Este capítulo no lo busqué."), ("esta lectura me ha hecho notar", "este capítulo me ha hecho notar")],
        "ca": [("Aquesta lectura no la vaig buscar.", "Aquest capítol no el vaig buscar."), ("aquesta lectura m'ha fet notar", "aquest capítol m'ha fet notar")],
        "en": [("I did not go looking for this reading.", "I did not go looking for this chapter."), ("this reading has made me notice", "this chapter has made me notice")],
    },
    "cap_glosario": {
        "es": [("la lectura *La realidad fractal* concede", "el capítulo *La realidad fractal* concede")],
        "ca": [("la lectura *La realitat fractal* concedeix", "el capítol *La realitat fractal* concedeix")],
        "en": [("the reading *Fractal Reality* grants", "the chapter *Fractal Reality* grants")],
    },
}



T_ = {"mapas": ("Cinco mapas del mismo horizonte", "Cinc mapes del mateix horitzó", "Five Maps of the Same Horizon"),
      "herido": ("El horizonte herido", "L'horitzó ferit", "The Wounded Horizon"),
      "dudar": ("Cinco maneras de dudar en voz alta", "Cinc maneres de dubtar en veu alta", "Five Ways of Doubting Aloud"),
      "borde": ("Cinco maneras de perder el borde propio", "Cinc maneres de perdre la vora pròpia", "Five Ways of Losing Your Own Edge")}
IDX = {"es": 0, "ca": 1, "en": 2}
GLOS = {   # (ancla, clave de título nueva)
    "es": [("contrapuesta a la composición (*El horizonte colectivo*)", "borde"), ("cuando captura la frontera propia (*El horizonte colectivo*)", "borde"),
           ("frontera colectiva con nombre (*El horizonte colectivo*)", "herido"), ("como principio organizador (*El horizonte colectivo*)", "herido"),
           ("incuestionable (*El horizonte colectivo*)", "borde"),
           ("preguntas (*El entrelazamiento vertical*, *El horizonte colectivo*)", ("dudar", "borde"))],
    "ca": [("contraposada a la composició (*L'horitzó col·lectiu*)", "borde"), ("quan captura la frontera pròpia (*L'horitzó col·lectiu*)", "borde"),
           ("frontera col·lectiva amb nom (*L'horitzó col·lectiu*)", "herido"), ("com a principi organitzador (*L'horitzó col·lectiu*)", "herido"),
           ("incontestable (*L'horitzó col·lectiu*)", "borde"),
           ("preguntes (*L'entrellaçament vertical*, *L'horitzó col·lectiu*)", ("dudar", "borde"))],
    "en": [("contrasted with composition (*The Collective Horizon*)", "borde"), ("when it captures one's own boundary (*The Collective Horizon*)", "borde"),
           ("into a named collective boundary (*The Collective Horizon*)", "herido"), ("as an organizing principle (*The Collective Horizon*)", "herido"),
           ("unquestionable (*The Collective Horizon*)", "borde"),
           ("no longer tolerates questions (*Vertical Entanglement*, *The Collective Horizon*)", ("dudar", "borde"))],
}
VERT_T = ("El entrelazamiento vertical", "L'entrellaçament vertical", "Vertical Entanglement")
NOTAS = {
    "es": [("Cuatro capítulos de este ensayo (*El espejo sin profundidad*, *El entrelazamiento vertical*, *El horizonte colectivo* y *La realidad fractal*) se escribieron",
            "Cuatro piezas de este libro (*El espejo sin profundidad*, *Cinco maneras de dudar en voz alta*, *Cinco maneras de perder el borde propio* y *La realidad fractal*) se escribieron"),
           ("*Escrita al cierre de* El entrelazamiento vertical.", "*Escrita al cierre de* Cinco maneras de dudar en voz alta."),
           ("*Escrita al cierre de* El horizonte colectivo.", "*Escrita al cierre de* Cinco maneras de perder el borde propio.")],
    "ca": [("Quatre capítols d'aquest assaig (*El mirall sense profunditat*, *L'entrellaçament vertical*, *L'horitzó col·lectiu* i *La realitat fractal*) es van escriure",
            "Quatre peces d'aquest llibre (*El mirall sense profunditat*, *Cinc maneres de dubtar en veu alta*, *Cinc maneres de perdre la vora pròpia* i *La realitat fractal*) es van escriure"),
           ("*Escrita en tancar* L'entrellaçament vertical.", "*Escrita en tancar* Cinc maneres de dubtar en veu alta."),
           ("*Escrita en tancar* L'horitzó col·lectiu.", "*Escrita en tancar* Cinc maneres de perdre la vora pròpia.")],
    "en": [("Four chapters of this essay (*The Mirror Without Depth*, *Vertical Entanglement*, *The Collective Horizon* and *Fractal Reality*) were written",
            "Four pieces of this book (*The Mirror Without Depth*, *Five Ways of Doubting Aloud*, *Five Ways of Losing Your Own Edge* and *Fractal Reality*) were written"),
           ("*Written on finishing* Vertical Entanglement.", "*Written on finishing* Five Ways of Doubting Aloud."),
           ("*Written on finishing* The Collective Horizon.", "*Written on finishing* Five Ways of Losing Your Own Edge.")],
}


def titulos_citados(lg):
    i = IDX[lg]
    g = Doc(lg, "cap_glosario")
    for a, k in GLOS[lg]:
        if isinstance(k, tuple):
            new = a.replace("*" + VERT_T[i] + "*", "*" + T_[k[0]][i] + "*")
            new = re.sub(r"\*(El horizonte colectivo|L'horitzó col·lectiu|The Collective Horizon)\*", "*" + T_[k[1]][i] + "*", new)
        else:
            new = re.sub(r"\(\*(El horizonte colectivo|L'horitzó col·lectiu|The Collective Horizon)\*\)", "(*" + T_[k][i] + "*)", a)
        g.sub(a, new)
    g.sub("(*" + VERT_T[i] + "*)", "(*" + T_["mapas"][i] + "*)")
    assert not re.search(r"\*(El horizonte colectivo|L'horitzó col·lectiu|The Collective Horizon)\*", "\n".join(g.p)), lg
    for a, b in HIP["cap_glosario"][lg]:
        g.sub(a, b)
    g.save()
    n = Doc(lg, "cap_notas_cierre")
    for a, b in NOTAS[lg] + HIP["cap_notas_cierre"][lg]:
        n.sub(a, b)
    n.save()


def hipotesis(lg):
    for cid, per in HIP.items():
        if cid in ("cap_glosario", "cap_notas_cierre"):
            continue
        d = Doc(lg, cid)
        for a, b in per[lg]:
            d.sub(a, b)
        d.save()


# prólogo: de cuatro partes a ocho
PRO_OLD = {
    "es": re.compile(r"El libro tiene cuatro partes\..*?vida cotidiana\.", re.S),
    "ca": re.compile(r"El llibre té quatre parts\..*?vida quotidiana\.", re.S),
    "en": re.compile(r"The book has four parts\..*?everyday life\.", re.S),
}
PRO_NEW = {
    "es": "El libro tiene ocho partes. La primera cuenta cómo surge un horizonte (nacimiento), cómo se mantiene (vida) y cómo se disuelve (muerte), y fija las herramientas con que se lee el resto: la información, la encapsulación, las dos selecciones. La segunda, qué pasa cuando dos horizontes comparten geometría (vínculo, amor, pérdida). La tercera, qué ocurre cuando el horizonte se rompe (enfermedad, trauma) y qué es el sujeto que lo habita. La cuarta es la parte formal: la topología que sostiene todo lo anterior y los experimentos mentales que la ponen a prueba; quien lo prefiera puede saltársela sin perder el hilo. La quinta saca el horizonte de la persona: los animales, los lugares y las ideas, la injusticia, la manera en que cada uno se calibra. La sexta lo cambia de escala: las religiones, la inteligencia artificial, la vida alienígena. La séptima recoge dos hipótesis del autor, declaradas como tales. La octava, al límite: lo que la hipótesis no puede decir y para qué sirve aun así. Entre la sexta y la séptima, trece lecturas topológicas llevan las mismas ideas a la ficción, el cine, el arte, el deporte y la vida cotidiana.",
    "ca": "El llibre té vuit parts. La primera explica com sorgeix un horitzó (naixement), com es manté (vida) i com es dissol (mort), i fixa les eines amb què es llegeix la resta: la informació, l'encapsulació, les dues seleccions. La segona, què passa quan dos horitzons comparteixen geometria (vincle, amor, pèrdua). La tercera, què passa quan l'horitzó es trenca (malaltia, trauma) i què és el subjecte que l'habita. La quarta és la part formal: la topologia que sosté tot l'anterior i els experiments mentals que la posen a prova; qui ho prefereixi pot saltar-se-la sense perdre el fil. La cinquena treu l'horitzó de la persona: els animals, els llocs i les idees, la injustícia, la manera com cadascú es calibra. La sisena el canvia d'escala: les religions, la intel·ligència artificial, la vida alienígena. La setena recull dues hipòtesis de l'autor, declarades com a tals. La vuitena, al límit: allò que la hipòtesi no pot dir i per a què serveix tot i així. Entre la sisena i la setena, tretze lectures topològiques porten les mateixes idees a la ficció, el cinema, l'art, l'esport i la vida quotidiana.",
    "en": "The book has eight parts. The first tells how a horizon arises (birth), how it is sustained (life) and how it dissolves (death), and sets the tools with which the rest is read: information, encapsulation, the two selections. The second, what happens when two horizons share geometry (bond, love, loss). The third, what happens when the horizon breaks (illness, trauma) and what the self that inhabits it is. The fourth is the formal part: the topology that underlies everything before it and the thought experiments that test it; whoever prefers may skip it without losing the thread. The fifth takes the horizon beyond the person: animals, places and ideas, injustice, the way each of us is calibrated. The sixth changes its scale: the religions, artificial intelligence, alien life. The seventh gathers two hypotheses of the author, declared as such. The eighth, to the limit: what the hypothesis cannot say and what it is good for all the same. Between the sixth and the seventh, thirteen topological readings carry the same ideas into fiction, film, art, sport and everyday life.",
}


def prologo(lg):
    d = Doc(lg, "prologo")
    n = 0
    for i, x in enumerate(d.p):
        if PRO_OLD[lg].search(x):
            d.p[i] = PRO_OLD[lg].sub(lambda m: PRO_NEW[lg], x); n += 1
    assert n == 1, (lg, n)
    d.save()


# remisiones sueltas
SUELTAS = {
    "cap17_5_real": {
        "es": [("el 28 compara cinco tradiciones punto por punto y el 29 desarrolla en detalle la técnica común a la oración y la meditación",
                "el capítulo 28 compara cinco tradiciones punto por punto y desarrolla en detalle la técnica común a la oración y la meditación")],
        "ca": [("el 28 compara cinc tradicions punt per punt i el 29 desenvolupa en detall la tècnica comuna a l'oració i la meditació",
                "el capítol 28 compara cinc tradicions punt per punt i desenvolupa en detall la tècnica comuna a l'oració i la meditació")],
        "en": [("Chapter 28 compares five traditions point by point and Chapter 29 develops in detail the technique common to prayer and meditation",
                "Chapter 28 compares five traditions point by point and develops in detail the technique common to prayer and meditation")],
    },
}


def sueltas(lg):
    for cid, per in SUELTAS.items():
        if per[lg] is None:
            continue
        d = Doc(lg, cid)
        for a, b in per[lg]:
            d.sub(a, b)
        d.save()



# ---------------------------------------------------------------------------
# 6. Ajustes de orden: lo que ahora viene antes o después de lo que era
# ---------------------------------------------------------------------------
AJ = {
    "cap_info_intro": {
        "es": [("Es lo que el capítulo 12 describía como", "Es lo que el capítulo 12 describirá como")],
        "ca": [("És el que el capítol 12 descrivia com", "És el que el capítol 12 descriurà com")],
        "en": [("It is what Chapter 12 described as", "It is what Chapter 12 will describe as")],
    },
    "cap18_6": {
        "es": [("En el capítulo 19 vimos que el trauma es información", "Más adelante, en el capítulo 19, veremos que el trauma es información")],
        "ca": [("Al capítol 19 vam veure que el trauma és informació", "Més endavant, al capítol 19, veurem que el trauma és informació")],
        "en": [("In Chapter 19 we saw that trauma is information", "Later, in Chapter 19, we will see that trauma is information")],
    },
    "cap13_5": {
        "es": [("funciona en el vacío, y en los dos anteriores, cómo el horizonte se deshace o se desacopla de su cuerpo.", "funciona en el vacío.")],
        "ca": [("funciona en el buit, i en els dos anteriors, com l'horitzó es desfà o es desacobla del seu cos.", "funciona en el buit.")],
        "en": [("running in a vacuum, and in the two chapters before this one, how the horizon comes apart or decouples from its body.", "running in a vacuum.")],
    },
    "cap_tres_puertas": {
        "es": [("El relato que sigue, «El que queda», pone en escena la pregunta que este teorema deja planteada:", "La pregunta que este teorema deja planteada es esta:")],
        "ca": [("El relat que segueix, «El que queda», posa en escena la pregunta que aquest teorema deixa plantejada:", "La pregunta que aquest teorema deixa plantejada és aquesta:")],
        "en": [(None, "The question this theorem leaves open is this:")],
    },
    "cap_lenguaje_entrelazamiento": {
        "es": [("ya citado en el capítulo 45", "citado también en el capítulo 45")],
        "ca": [("ja citat en el capítol 45", "citat també en el capítol 45")],
        "en": [("already cited in Chapter 45", "also cited in Chapter 45")],
    },
    "cap14_real": {
        "es": [('"Los límites del horizonte"', '"El horizonte que se desdibuja"')],
        "ca": [('"Els límits de l\'horitzó"', '"L\'horitzó que es desdibuixa"')],
        "en": [('"The limits of the horizon"', '"The horizon that blurs"')],
    },
}
FORMAL = {
    "es": "*Este capítulo y el siguiente forman la parte formal del libro: la topología que sostiene todo lo anterior y los experimentos mentales que la ponen a prueba. Quien prefiera seguir el hilo sin los detalles técnicos puede pasar directamente a la quinta parte.*",
    "ca": "*Aquest capítol i el següent formen la part formal del llibre: la topologia que sosté tot l'anterior i els experiments mentals que la posen a prova. Qui prefereixi seguir el fil sense els detalls tècnics pot passar directament a la cinquena part.*",
    "en": "*This chapter and the next make up the formal part of the book: the topology that underlies everything before it and the thought experiments that test it. Whoever prefers to follow the thread without the technical detail can go straight to the fifth part.*",
}


def ajustes(lg):
    for cid, per in AJ.items():
        if cid == "cap_info_intro":
            d = Doc.__new__(Doc)
            src = (ROOT / ("en" if lg == "en" else "content_overrides") / f"cap_info_intro.{lg}.md").read_text(encoding="utf-8")
            _, d.fm, body = src.split("---", 2)
            d.lg, d.cid = lg, cid
            d.lead = body[: len(body) - len(body.lstrip("\n"))]
            d.trail = body[len(body.rstrip()):]
            d.p = body.strip().split("\n\n")
        else:
            d = Doc(lg, cid)
        for a, b in per[lg]:
            if a is None:
                i = next(k for k, x in enumerate(d.p) if "stages the question this theorem leaves open:" in x)
                d.p[i] = re.sub(r'The story that follows, .{0,60}? stages the question this theorem leaves open:', b, d.p[i])
                assert b in d.p[i]
            else:
                d.sub(a, b)
        d.save()
    d = Doc(lg, "cap22_idempotencia")
    d.p.insert(0, FORMAL[lg])
    d.save()


# ---------------------------------------------------------------------------
# 9. ER=EPR sale del capítulo 2 y se queda en el del entrelazamiento (antes 11)
# ---------------------------------------------------------------------------
EREPR = {
    "es": dict(
        pre="El mecanismo más elegante es ER=EPR:",
        post="El mecanismo más elegante es ER=EPR (la conjetura que el capítulo 11 presenta con más calma):",
        quitar=["Si ER=EPR opera en escalas biológicas. ",
                "¿Es el entrelazamiento, de verdad, geometría? ¿Puede un cerebro estar «entrelazado» con otro de manera físicamente significativa? ",
                "Maldacena & Susskind (2013), «Cool horizons for entangled black holes» (la conjetura ER=EPR); "],
        n_no="Si los puentes de Einstein-Rosen existen físicamente.", n_no2="Si los puentes de Einstein-Rosen existen físicamente. Si ER=EPR opera en escalas biológicas.",
        n_preg="**Preguntas que quedan:** ¿Es el vínculo", n_preg2="**Preguntas que quedan:** ¿Es el entrelazamiento, de verdad, geometría? ¿Es el vínculo"),
    "ca": dict(
        pre="El mecanisme més elegant és ER=EPR:",
        post="El mecanisme més elegant és ER=EPR (la conjectura que el capítol 11 presenta amb més calma):",
        quitar=["Si ER=EPR opera en escales biològiques. ",
                "És l'entrellaçament, de debò, geometria? Pot un cervell estar «entrellaçat» amb un altre de manera físicament significativa? ",
                "Maldacena & Susskind (2013), «Cool horizons for entangled black holes» (la conjectura ER=EPR); "],
        n_no="Si els ponts d'Einstein-Rosen existeixen físicament.", n_no2="Si els ponts d'Einstein-Rosen existeixen físicament. Si ER=EPR opera en escales biològiques.",
        n_preg="**Preguntes que queden:** És el vincle", n_preg2="**Preguntes que queden:** És l'entrellaçament, de debò, geometria? És el vincle"),
    "en": dict(
        pre="The most elegant mechanism is ER=EPR:",
        post="The most elegant mechanism is ER=EPR (the conjecture that Chapter 11 presents at more leisure):",
        quitar=["Whether ER=EPR operates at biological scales. ",
                "Is entanglement really geometry? Can one brain be \"entangled\" with another in a physically meaningful way? ",
                "Maldacena & Susskind (2013), \"Cool horizons for entangled black holes\" (the ER=EPR conjecture); "],
        n_no="Whether Einstein-Rosen bridges exist physically.", n_no2="Whether Einstein-Rosen bridges exist physically. Whether ER=EPR operates at biological scales.",
        n_preg="**Open questions:** Is the human bond", n_preg2="**Open questions:** Is entanglement really geometry? Is the human bond"),
}


def load_saved(lg, cid):
    d = Doc.__new__(Doc)
    t = Doc.target(type("T", (), {"lg": lg, "cid": cid})(), cid)
    _, d.fm, body = t.read_text(encoding="utf-8").split("---", 2)
    d.lg, d.cid = lg, cid
    d.lead = body[: len(body) - len(body.lstrip("\n"))]
    d.trail = body[len(body.rstrip()):]
    d.p = body.strip().split("\n\n")
    return d


def erepr(lg):
    E = EREPR[lg]
    c2 = Doc(lg, "cap2")
    i = c2.find("### ER=EPR")
    assert c2.p[i - 1] == "---" and c2.p[i + 7] == "---", (lg, c2.p[i + 7][:40])
    especul = c2.p[i + 5:i + 7]
    assert "ER=EPR" not in especul[0].split("\n")[0] or True
    del c2.p[i - 1:i + 7]          # «---», encabezado, 3 párrafos, cita, 2 párrafos de especulación
    for q in E["quitar"]:
        c2.sub(q, "", count=1)
    c2.save()
    c7 = Doc(lg, "cap7_5")
    j = next(k for k, x in enumerate(c7.p) if x.startswith(("Si és així", "Si es así", "If so, entanglement")))
    c7.p[j + 1:j + 1] = especul
    c7.sub(E["n_no"], E["n_no2"], count=1)
    c7.sub(E["n_preg"], E["n_preg2"], count=1)
    c7.save()
    c6 = load_saved(lg, "cap6")
    c6.sub(E["pre"], E["post"], count=1)
    c6.save()


def main():
    for lg in LG:
        print(lg)
        esp = Doc(lg, "cap_espejo_sin_profundidad")
        sel, comp = esp.p[6], esp.p[7]
        assert SEL_END[lg][0] in comp, (lg, "comp")
        comp = comp.replace(*SEL_END[lg])
        assert ESP_P8[lg][0] in esp.p[8], (lg, "esp8")
        esp.p[8] = esp.p[8].replace(*ESP_P8[lg])
        del esp.p[6:8]
        esp.save()
        sel_nacimiento(lg, sel, comp)
        muerte(lg)
        informacion(lg)
        vertical_y_colectivo(lg)
        epilogo(lg)
        casos(lg)
        hipotesis(lg)
        titulos_citados(lg)
        prologo(lg)
        sueltas(lg)
        ajustes(lg)
        erepr(lg)


if __name__ == "__main__":
    main()
