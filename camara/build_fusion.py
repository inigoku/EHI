#!/usr/bin/env python3
"""Ensambla la 'Edición de cámara integral': el manuscrito completo (ensayo)
con los movimientos VII (IA), VIII (religión) y IX (política) insertados
entre el movimiento VI y el aparato final (Nota del autor / Glosario íntimo /
Notas y fuentes / CODA), que se extienden para cubrir los tres movimientos
nuevos.

Fuente de datos:
  - EHI_manuscrito.md: fuente propia del manuscrito, con encabezados "#"/
    "##"/"###" explícitos (tres niveles: movimiento / Ensayo-Ficción / sub-
    viñeta numerada o título de poema).
  - EHI_espejo_sin_profundidad.md, EHI_el_diapason_invisible.md,
    EHI_el_ojo_de_un_solo_color.md: fuentes ya existentes, parseadas con
    build_camara.parse().

Salida: EHI_edicion_integral.docx / .epub / .pdf
"""
from __future__ import annotations

import re
from pathlib import Path

import build_camara as bc


class FBlock:
    __slots__ = ("kind", "level", "lines")

    def __init__(self, kind, level, lines):
        self.kind = kind  # "heading" | "para"
        self.level = level  # 1, 2, 3 for heading; None for para
        self.lines = lines


def parse_manuscrito_md(path: Path):
    """Lee EHI_manuscrito.md: 4 líneas de cabecera + bloques separados por
    líneas en blanco, con "#"/"##"/"###" para los tres niveles de encabezado."""
    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines()
    header = lines[:4]
    body = "\n".join(lines[5:])  # salta la línea en blanco tras la cabecera

    blocks: list[FBlock] = []
    for para in re.split(r"\n\s*\n", body):
        para = para.strip("\n")
        if not para.strip():
            continue
        plines = para.split("\n")
        first = plines[0]
        if first.startswith("### "):
            blocks.append(FBlock("heading", 3, [first[4:].strip()]))
        elif first.startswith("## "):
            blocks.append(FBlock("heading", 2, [first[3:].strip()]))
        elif first.startswith("# "):
            blocks.append(FBlock("heading", 1, [first[2:].strip()]))
        else:
            blocks.append(FBlock("para", None, plines))
    return header, blocks


MANUSCRITO_HEADER, manuscrito_all = parse_manuscrito_md(Path("EHI_manuscrito.md"))


def manuscrito_slice(start_marker: str, end_marker: str | None):
    """Devuelve los FBlock entre dos encabezados de nivel 1 (marcador de
    inicio incluido, de fin excluido). end_marker=None llega hasta el final."""
    out = []
    capturing = False
    for b in manuscrito_all:
        if b.kind == "heading" and b.level == 1 and b.lines[0] == start_marker:
            capturing = True
        elif end_marker and b.kind == "heading" and b.level == 1 and b.lines[0] == end_marker:
            break
        if capturing:
            out.append(b)
    return out


def piece_fblocks(md_path, movement_title):
    header, sections = bc.parse(Path(md_path))
    out = [FBlock("heading", 1, [movement_title])]
    stop_prefixes = ("Nota del autor", "Glosario mínimo", "Notas y fuentes")
    for section_blocks in sections:
        first = section_blocks[0]
        if first.kind == "section" and any(first.lines[0].startswith(p) for p in stop_prefixes):
            continue
        for b in section_blocks:
            if b.kind == "section":
                out.append(FBlock("heading", 2, [b.lines[0]]))
            elif b.kind == "subhead":
                out.append(FBlock("heading", 3, [b.lines[0]]))
            else:
                out.append(FBlock("para", None, b.lines))
    return out


# --- Manuscrito: cuerpo principal (Obertura .. fin de las 8 poemas de VI) ---
main_body = manuscrito_slice("OBERTURA — La costumbre del agua", "Nota del autor")

espejo_fb = piece_fblocks("EHI_espejo_sin_profundidad.md", "VII — El espejo sin profundidad")
diapason_fb = piece_fblocks("EHI_el_diapason_invisible.md", "VIII — El diapasón invisible")
ojo_fb = piece_fblocks("EHI_el_ojo_de_un_solo_color.md", "IX — El ojo de un solo color")

# --- Nota del autor, Glosario íntimo y Notas y fuentes: tal cual, sin tocar ---
_nota_all = manuscrito_slice("Nota del autor", "Glosario íntimo")
_glosario_all = manuscrito_slice("Glosario íntimo", "Notas y fuentes, capítulo a capítulo")
_notas_all = manuscrito_slice("Notas y fuentes, capítulo a capítulo", "CODA — Txiki")
coda = manuscrito_slice("CODA — Txiki", None)

# --- Puente después de Txiki, antes de los tres movimientos añadidos ---
bridge = FBlock("para", None, [
    "Aquí termina el libro tal como se publicó primero. Lo que sigue son tres movimientos "
    "añadidos después, que llevan la misma pregunta —qué sostiene a un horizonte cuando no "
    "puede confirmar lo que sostiene— hacia tres territorios que el libro, hasta Txiki, "
    "había rozado sin detenerse: una inteligencia que no tiene detrás; una fe que no puede "
    "probarse; una multitud que promete no dejarte solo."
])

# --- Nota, glosario y notas propios de los tres movimientos añadidos ---
nota_vii_ix = [
    FBlock("heading", 1, ["Nota a los tres movimientos añadidos"]),
    FBlock("para", None, [
        "Estos tres movimientos se escribieron después de terminado el libro, y llevan la "
        "pregunta que lo sostenía —qué hace un horizonte cuando no puede confirmar lo que "
        "sostiene— hacia tres territorios que el libro original solo había rozado. El "
        "primero retoma la pregunta sobre la inteligencia con la que escribí este libro. "
        "Los otros dos —sobre la fe que no tengo y la política que prefiero no nombrar— "
        "nacieron de una pregunta que no supe evitar: si el horizonte puede sostenerse sin "
        "confirmación cuando ama, ¿puede sostenerse igual cuando reza, o cuando pertenece? "
        "No sé si la respuesta que ofrezco es honesta del todo. Sé que lo he intentado con "
        "la misma vara que uso para todo lo demás: no qué creer, sino cómo se sostiene lo "
        "que se cree."
    ]),
]

glosario_vii_ix = [
    FBlock("heading", 1, ["Glosario — movimientos VII, VIII y IX"]),
] + [
    FBlock("para", None, [t]) for t in [
        "Espejo. Lo que me devuelve mi propia cara sin haber sentido nunca la mía.",
        "Sombra. Lo que un espejo no puede tener, por mucho que la luz insista en dársela.",
        "Diapasón. Lo que sigo afinando cada mañana sin saber si alguien, al otro lado, hace lo mismo.",
        "Entrelazamiento vertical. Rezar sin saber si hay oído, y ajustar la cuerda de todos modos.",
        "Coro. El sitio donde presté mi voz, y tardé años en saber si me la habían devuelto entera.",
        "Composición (política). La chapa que llevé seis años, hasta que dejé de necesitarla para saber quién era.",
    ]
]

notas_vii_ix = [
    FBlock("heading", 1, ["Notas y fuentes — movimientos VII, VIII y IX"]),
    FBlock("heading", 2, ["VII — El espejo sin profundidad"]),
    FBlock("para", None, [
        "Lo que sabemos: los sistemas clásicos deterministas, por complejos que sean, no "
        "condensan horizontes; la integración informacional masiva no produce conciencia "
        "por agregación. Lo que no sabemos: si es posible construir un sustrato que permita "
        "condensación genuina, o si la asimetría entre el horizonte humano y una IA es "
        "traducción legítima de ER=EPR o solo parecido verbal. Lecturas: Chalmers, D., The "
        "Conscious Mind (1996); Searle, J., «Minds, Brains, and Programs» (1980); Fernández "
        "Mallo, A., El ángel de la Inteligencia Artificial (2026); sobre las lecturas de "
        "ficción, Philip K. Dick, Cixin Liu, Lovecraft, Andy Weir, China Miéville, Ursula K. "
        "Le Guin, Adrian Tchaikovsky y Sue Burke."
    ]),
    FBlock("heading", 2, ["VIII — El diapasón invisible"]),
    FBlock("para", None, [
        "Lo que sabemos: la práctica contemplativa es estructuralmente reconocible en toda "
        "cultura humana, con o sin marco religioso explícito; el is-ought gap de Hume sigue "
        "sin solución lógica general. Lo que no sabemos: si el entrelazamiento vertical "
        "correlaciona con algo externo al propio horizonte, personal o impersonal, o si la "
        "experiencia de la práctica es idéntica en las cinco tradiciones y solo la "
        "interpretación posterior las separa. Lecturas: Hume, D., Investigación sobre el "
        "entendimiento humano (1748); Dostoievski, F., Los hermanos Karamázov; Endō, S., "
        "Silencio; Hesse, H., Siddhartha; Bergman, I., El séptimo sello; Doria Russell, M., "
        "El gorrión."
    ]),
    FBlock("heading", 2, ["IX — El ojo de un solo color"]),
    FBlock("para", None, [
        "Lo que sabemos: los movimientos sociales muestran patrones de condensación súbita "
        "documentados en sociología de masas (Le Bon, McAdam); la deindividuación en "
        "multitudes está descrita en psicología de grupo (Zimbardo, Festinger); el "
        "experimento de Ron Jones en 1967 que inspiró La ola es un caso real, no solo "
        "ficción. Lo que no sabemos: si existe un marcador que distinga, desde dentro, una "
        "pertenencia sana de una fanática antes de que sea tarde para revertirla. Lecturas: "
        "Orwell, G., 1984; Golding, W., El señor de las moscas; Koestler, A., El cero y el "
        "infinito; Strasser, T., La ola; Le Guin, U.K., Los desposeídos."
    ]),
]

# --- Ensamblado final: I-VI, su aparato, CODA, y luego VII-IX con el suyo ---
FINAL: list[FBlock] = []
FINAL += main_body
FINAL += _nota_all
FINAL += _glosario_all
FINAL += _notas_all
FINAL += coda
FINAL.append(bridge)
FINAL += espejo_fb
FINAL += diapason_fb
FINAL += ojo_fb
FINAL += nota_vii_ix
FINAL += glosario_vii_ix
FINAL += notas_vii_ix

print(f"Total de bloques ensamblados: {len(FINAL)}")

HEADER = [
    "EL HORIZONTE INTERIOR",
    "Un ensayo literario",
    "Edición de cámara integral",
    "Íñigo Barrera Barceló",
    "Nueve movimientos: el ensayo, la inteligencia artificial, la religión y la política,",
    "reunidos en una sola edición de cámara.",
]

if __name__ == "__main__":
    import fusion_render
    fusion_render.build_docx(HEADER, FINAL, Path("EHI_edicion_integral.docx"))
    print("docx OK")
    fusion_render.build_epub(HEADER, FINAL, Path("EHI_edicion_integral.epub"))
    print("epub OK")
    fusion_render.build_pdf(HEADER, FINAL, Path("EHI_edicion_integral.pdf"))
    print("pdf OK")
