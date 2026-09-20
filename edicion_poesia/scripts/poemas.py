#!/usr/bin/env python3
"""Lectura de los poemas de content/poemas y definicion de los tres libros.

El texto vive en content/poemas/*.es.md, que es tambien lo que lee la web.
Aqui solo se ordena, se agrupa en los tres libros y se le pone el titulo y el
numero con que aparece en esta edicion.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "content" / "poemas"

FRONTMATTER = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n?(.*)\Z", re.DOTALL)


@dataclass
class Poem:
    pid: str
    numeral: str            # I, II, III... vacio en el glosario
    title: str              # como se compone en esta edicion
    source: str = ""        # movimiento de origen, solo en el libro tercero
    lines: list[str] = field(default_factory=list)
    kind: str = "verso"     # "verso" o "glosario"


@dataclass
class Book:
    key: str
    ordinal: str
    title: str
    epigraph: str
    poems: list[Poem] = field(default_factory=list)


ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]

# id -> titulo en esta edicion. Los ficheros traen el titulo con el nombre del
# ciclo delante ("LA ARQUITECTURA CON UN HUECO - I: EL ARCHIVISTA"); aqui se
# compone solo, con el numeral aparte.
TITLES_ES = {
    "poema_arq1": "El archivista",
    "poema_arq2": "El relojero",
    "poema_arq3": "El luthier",
    "poema_arq4": "La canción",
    "poema_arq5": "Montse XX",
    "poema_arq6": "El remo",
    "poema_arq7": "El temblor",
    "poema_arq8": "La orilla",
    "poema_burbuja": "La burbuja",
    "poema_frialdad1": "Cartografía del eco",
    "poema_frialdad2": "Canto de muerte",
    "poema_frialdad3": "Quejido de la vuelta",
    "poema_frialdad4": "Villancico cibernético para un solsticio templado",
    "poema_frialdad5": "Protocolo de salida",
    "poema_frialdad6": "Montse XXI",
    "poema_camara_reloj": "Lo que no cabe en un reloj",
    "poema_camara_espejo": "Lo que el espejo no tiene",
    "poema_camara_manos": "Manos",
    "poema_camara_coro": "Coro",
    "poema_camara_vecinos": "Vecinos",
    "poema_camara_cueva": "Desde la cueva",
    "poema_glosario": "Glosario íntimo",
}

TITLES_CA = {
    "poema_arq1": "L'arxivista",
    "poema_arq2": "El rellotger",
    "poema_arq3": "El lutier",
    "poema_arq4": "La cançó",
    "poema_arq5": "Montse XX",
    "poema_arq6": "El rem",
    "poema_arq7": "El tremolor",
    "poema_arq8": "La vora",
    "poema_burbuja": "La bombolla",
    "poema_frialdad1": "Cartografia de l'eco",
    "poema_frialdad2": "Cant de Mort",
    "poema_frialdad3": "Lament de la Volta",
    "poema_frialdad4": "Vilançó Cibernètic per a un solstici temperat",
    "poema_frialdad5": "Protocol de Sortida",
    "poema_frialdad6": "Montse XXI",
    "poema_camara_reloj": "Allò que no cap en un rellotge",
    "poema_camara_espejo": "Allò que l'espill no té",
    "poema_camara_manos": "Mans",
    "poema_camara_coro": "Cor",
    "poema_camara_vecinos": "Veïns",
    "poema_camara_cueva": "Des de la cova",
    "poema_glosario": "Glossari Íntim",
}

TITLES_EN = {
    "poema_arq1": "The Archivist",
    "poema_arq2": "The Watchmaker",
    "poema_arq3": "The Luthier",
    "poema_arq4": "The Song",
    "poema_arq5": "Montse XX",
    "poema_arq6": "The Oar",
    "poema_arq7": "The Tremor",
    "poema_arq8": "The Shore",
    "poema_burbuja": "The Bubble",
    "poema_frialdad1": "Cartography of the Echo",
    "poema_frialdad2": "Song of Death",
    "poema_frialdad3": "Lament of the Return",
    "poema_frialdad4": "Cybernetic Carol for a Mild Solstice",
    "poema_frialdad5": "Exit Protocol",
    "poema_frialdad6": "Montse XXI",
    "poema_camara_reloj": "What Does Not Fit in a Clock",
    "poema_camara_espejo": "What the Mirror Does Not Have",
    "poema_camara_manos": "Hands",
    "poema_camara_coro": "Choir",
    "poema_camara_vecinos": "Neighbors",
    "poema_camara_cueva": "From the Cave",
    "poema_glosario": "Intimate Glossary",
}

TITLES = {"es": TITLES_ES, "ca": TITLES_CA, "en": TITLES_EN}

# Movimiento de "El Horizonte Interior" del que sale cada poema del libro tercero.
SOURCES_ES = {
    "poema_camara_reloj": "El tiempo que no pasa",
    "poema_camara_espejo": "El espejo sin profundidad",
    "poema_camara_manos": "El diapasón invisible",
    "poema_camara_coro": "El ojo de un solo color",
    "poema_camara_vecinos": "La realidad fractal",
    "poema_camara_cueva": "La realidad fractal",
}

SOURCES_CA = {
    "poema_camara_reloj": "El temps que no passa",
    "poema_camara_espejo": "L'espill sense profunditat",
    "poema_camara_manos": "El diapasó invisible",
    "poema_camara_coro": "L'ull d'un sol color",
    "poema_camara_vecinos": "La realitat fractal",
    "poema_camara_cueva": "La realitat fractal",
}

SOURCES_EN = {
    "poema_camara_reloj": "The Time That Does Not Pass",
    "poema_camara_espejo": "The Mirror Without Depth",
    "poema_camara_manos": "The Invisible Tuning Fork",
    "poema_camara_coro": "The Eye of a Single Color",
    "poema_camara_vecinos": "Fractal Reality",
    "poema_camara_cueva": "Fractal Reality",
}

SOURCES = {"es": SOURCES_ES, "ca": SOURCES_CA, "en": SOURCES_EN}

BOOK_DEFS_ES = [
    (
        "libro1",
        "Libro primero",
        "La arquitectura con un hueco",
        "Nueve maneras de un duelo: lo que queda cuando el agua se retira "
        "y hay que seguir midiendo la orilla.",
        ["poema_burbuja", "poema_arq1", "poema_arq2", "poema_arq3",
         "poema_arq5", "poema_arq6", "poema_arq7", "poema_arq8",
         "poema_arq4"],
    ),
    (
        "libro2",
        "Libro segundo",
        "La frialdad de una ciudad apagada",
        "Un invierno que no termina de llegar y, aun así, hace frío: "
        "seis estaciones del cuerpo en una ciudad que no responde.",
        ["poema_frialdad3", "poema_frialdad1", "poema_frialdad4",
         "poema_frialdad5", "poema_frialdad6", "poema_frialdad2"],
    ),
    (
        "libro3",
        "Libro tercero",
        "Los últimos libros",
        "Seis historias que ya venían contadas en prosa y aquí vuelven "
        "en verso, una por cada movimiento del final de la obra.",
        ["poema_camara_reloj", "poema_camara_espejo", "poema_camara_manos",
         "poema_camara_coro", "poema_camara_cueva", "poema_camara_vecinos"],
    ),
]

BOOK_DEFS_CA = [
    (
        "libro1",
        "Primer llibre",
        "L'arquitectura amb un forat",
        "Nou maneres d'un dol: el que queda quan l'aigua es retira "
        "i cal seguir mesurant la vora.",
        ["poema_burbuja", "poema_arq1", "poema_arq2", "poema_arq3",
         "poema_arq5", "poema_arq6", "poema_arq7", "poema_arq8",
         "poema_arq4"],
    ),
    (
        "libro2",
        "Segon llibre",
        "La frisor d'una ciutat apagada",
        "Un hivern que no acaba d'arribar i, tot i així, fa fred: "
        "sis estacions del cos en una ciutat que no respon.",
        ["poema_frialdad3", "poema_frialdad1", "poema_frialdad4",
         "poema_frialdad5", "poema_frialdad6", "poema_frialdad2"],
    ),
    (
        "libro3",
        "Tercer llibre",
        "Els últims llibres",
        "Sis històries que ja venien contades en prosa i aquí tornen "
        "en vers, una per cada moviment del final de l'obra.",
        ["poema_camara_reloj", "poema_camara_espejo", "poema_camara_manos",
         "poema_camara_coro", "poema_camara_cueva", "poema_camara_vecinos"],
    ),
]

BOOK_DEFS_EN = [
    (
        "libro1",
        "Book One",
        "The Architecture with a Hollow",
        "Nine ways into a mourning: what remains when the water recedes "
        "and you have to keep measuring the shore.",
        ["poema_burbuja", "poema_arq1", "poema_arq2", "poema_arq3",
         "poema_arq5", "poema_arq6", "poema_arq7", "poema_arq8",
         "poema_arq4"],
    ),
    (
        "libro2",
        "Book Two",
        "The Coldness of a Darkened City",
        "A winter that never quite arrives and, even so, it's cold: "
        "six seasons of the body in a city that does not respond.",
        ["poema_frialdad3", "poema_frialdad1", "poema_frialdad4",
         "poema_frialdad5", "poema_frialdad6", "poema_frialdad2"],
    ),
    (
        "libro3",
        "Book Three",
        "The Last Books",
        "Six stories already told in prose that here return to verse, "
        "one for each of the work's final movements.",
        ["poema_camara_reloj", "poema_camara_espejo", "poema_camara_manos",
         "poema_camara_coro", "poema_camara_cueva", "poema_camara_vecinos"],
    ),
]

BOOK_DEFS = {"es": BOOK_DEFS_ES, "ca": BOOK_DEFS_CA, "en": BOOK_DEFS_EN}

CLOSING_ID = "poema_glosario"


def _read(pid: str, lang: str = "es") -> list[str]:
    raw = (CONTENT / f"{pid}.{lang}.md").read_text(encoding="utf-8")
    m = FRONTMATTER.match(raw)
    body = m.group(2) if m else raw
    return body.strip("\n").split("\n")


def load_books(lang: str = "es") -> tuple[list[Book], Poem]:
    books: list[Book] = []
    titles = TITLES.get(lang, TITLES["es"])
    sources = SOURCES.get(lang, SOURCES["es"])
    book_defs = BOOK_DEFS.get(lang, BOOK_DEFS["es"])

    for key, ordinal, title, epigraph, ids in book_defs:
        book = Book(key=key, ordinal=ordinal, title=title, epigraph=epigraph)
        for i, pid in enumerate(ids):
            book.poems.append(
                Poem(
                    pid=pid,
                    numeral=ROMAN[i],
                    title=titles[pid],
                    source=sources.get(pid, ""),
                    lines=_read(pid, lang),
                )
            )
        books.append(book)
    closing = Poem(
        pid=CLOSING_ID,
        numeral="",
        title=titles[CLOSING_ID],
        lines=_read(CLOSING_ID, lang),
        kind="glosario",
    )
    return books, closing


if __name__ == "__main__":
    bs, cl = load_books()
    for b in bs:
        print(f"{b.ordinal}: {b.title} ({len(b.poems)} poemas)")
        for p in b.poems:
            print(f"   {p.numeral:>4}. {p.title}  ({len(p.lines)} lineas)")
    print(f"Cierre: {cl.title} ({len(cl.lines)} lineas)")
