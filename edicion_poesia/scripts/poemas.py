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


ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]

# id -> titulo en esta edicion. Los ficheros traen el titulo con el nombre del
# ciclo delante ("LA ARQUITECTURA CON UN HUECO - I: EL ARCHIVISTA"); aqui se
# compone solo, con el numeral aparte.
TITLES = {
    "poema_arq1": "El archivista",
    "poema_arq2": "El relojero",
    "poema_arq3": "El luthier",
    "poema_arq4": "La canción",
    "poema_arq5": "La burbuja",
    "poema_arq6": "El remo",
    "poema_arq7": "El temblor",
    "poema_arq8": "La orilla",
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

# Movimiento de "El Horizonte Interior" del que sale cada poema del libro tercero.
SOURCES = {
    "poema_camara_reloj": "El tiempo que no pasa",
    "poema_camara_espejo": "El espejo sin profundidad",
    "poema_camara_manos": "El diapasón invisible",
    "poema_camara_coro": "El ojo de un solo color",
    "poema_camara_vecinos": "La realidad fractal",
    "poema_camara_cueva": "La realidad fractal",
}

BOOK_DEFS = [
    (
        "libro1",
        "Libro primero",
        "La arquitectura con un hueco",
        "Ocho oficios para un duelo: lo que queda cuando el agua se retira "
        "y hay que seguir midiendo la orilla.",
        ["poema_arq1", "poema_arq2", "poema_arq3", "poema_arq4",
         "poema_arq5", "poema_arq6", "poema_arq7", "poema_arq8"],
    ),
    (
        "libro2",
        "Libro segundo",
        "La frialdad de una ciudad apagada",
        "Un invierno que no termina de llegar y, aun así, hace frío: "
        "seis estaciones del cuerpo en una ciudad que no responde.",
        ["poema_frialdad1", "poema_frialdad2", "poema_frialdad3",
         "poema_frialdad4", "poema_frialdad5", "poema_frialdad6"],
    ),
    (
        "libro3",
        "Libro tercero",
        "Los últimos libros",
        "Seis historias que ya venían contadas en prosa y aquí vuelven "
        "en verso, una por cada movimiento del final de la obra.",
        ["poema_camara_reloj", "poema_camara_espejo", "poema_camara_manos",
         "poema_camara_coro", "poema_camara_vecinos", "poema_camara_cueva"],
    ),
]

CLOSING_ID = "poema_glosario"


def _read(pid: str) -> list[str]:
    raw = (CONTENT / f"{pid}.es.md").read_text(encoding="utf-8")
    m = FRONTMATTER.match(raw)
    body = m.group(2) if m else raw
    return body.strip("\n").split("\n")


def load_books() -> tuple[list[Book], Poem]:
    books: list[Book] = []
    for key, ordinal, title, epigraph, ids in BOOK_DEFS:
        book = Book(key=key, ordinal=ordinal, title=title, epigraph=epigraph)
        for i, pid in enumerate(ids):
            book.poems.append(
                Poem(
                    pid=pid,
                    numeral=ROMAN[i],
                    title=TITLES[pid],
                    source=SOURCES.get(pid, ""),
                    lines=_read(pid),
                )
            )
        books.append(book)
    closing = Poem(
        pid=CLOSING_ID,
        numeral="",
        title=TITLES[CLOSING_ID],
        lines=_read(CLOSING_ID),
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
