#!/usr/bin/env python3
"""Recorta al area de dibujo las ilustraciones que acompañan a los poemas.

Muchas de las imagenes de partida son capturas de pagina de otras ediciones:
llevan un marco blanco y, a menudo, la cabecera y el folio impresos dentro del
propio archivo ("EL HORIZONTE INTERIOR   EL RELOJERO   2"). Este script
localiza el rectangulo de dibujo y lo extrae, de modo que al libro solo entre
la ilustracion.

El detector estima el color de fondo de la pagina mirando los cuatro bordes y
marca como "dibujo" las filas y columnas en las que casi todos los pixeles se
apartan de ese fondo. Una linea de texto de cabecera no llega a esa densidad y
queda fuera; el bloque de dibujo, que es macizo, si la alcanza.
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "edicion_poesia" / "imagenes"

# id logico -> fichero de origen.
#
# Para cada poema se usa la ilustracion que muestra la web en la seccion de
# poesia (src/assets/images/poemas/, segun el mapa de IllustrationViewer.tsx).
# Los seis poemas de "Los ultimos libros" no tienen imagen propia en la web y
# se toman de la edicion ilustrada; el de "Lo que no cabe en un reloj" no tiene
# ilustracion en ninguna edicion y toma una lamina de la edicion en tapa dura.
SOURCES = {
    # la portada es la imagen de la seccion de poesia de la web
    "portada": "src/assets/images/landing/poems_landing.png",
    # aperturas de libro
    "libro1": "edicion_ilustrada/images/poema_arq1.jpg",
    "libro2": "edicion_tapadura/laminas/cap5.jpg",
    "libro3": "edicion_tapadura/laminas/espejo.jpg",
    # libro primero: La arquitectura con un hueco
    "poema_arq1": "src/assets/images/poemas/el_archivista.png",
    "poema_arq2": "src/assets/images/poemas/el_relojero.png",
    "poema_arq3": "src/assets/images/poemas/el_luthier.png",
    "poema_arq4": "src/assets/images/poemas/la_cancion.png",
    "poema_arq5": "src/assets/images/poemas/clean_poema_arq1.png",
    "poema_arq6": "src/assets/images/poemas/clean_poema_arq2.png",
    "poema_arq7": "src/assets/images/poemas/clean_poema_arq3.png",
    "poema_arq8": "src/assets/images/poemas/clean_poema_arq4.png",
    # libro segundo: La frialdad de una ciudad apagada
    "poema_frialdad1": "src/assets/images/poemas/clean_frialdad_eco.jpg",
    "poema_frialdad2": "src/assets/images/poemas/clean_frialdad_muerte.jpg",
    "poema_frialdad3": "src/assets/images/poemas/clean_frialdad_vuelta.jpg",
    "poema_frialdad4": "src/assets/images/poemas/clean_frialdad_ciber.jpg",
    "poema_frialdad5": "src/assets/images/poemas/clean_frialdad_salida.jpg",
    "poema_frialdad6": "src/assets/images/poemas/clean_frialdad_montse.jpg",
    "poema_sintonizadores": "src/assets/images/ilustracion_poema_sintonizadores.jpg",
    # libro tercero: Los ultimos libros
    "poema_camara_reloj": "edicion_tapadura/laminas/cap2.jpg",
    "poema_camara_espejo": "edicion_ilustrada/images/poema_espejo.jpg",
    "poema_camara_manos": "edicion_ilustrada/images/poema_manos.jpg",
    "poema_camara_coro": "edicion_ilustrada/images/poema_coro.jpg",
    "poema_camara_vecinos": "edicion_ilustrada/images/poema_vecinos.jpg",
    "poema_camara_cueva": "edicion_ilustrada/images/poema_cueva.jpg",
    # cierre
    "poema_glosario": "src/assets/images/poemas/clean_poema_glosario.png",
}

# Imagenes que ya son solo dibujo: no se les busca recuadro.
NO_CROP = {
    "portada",
    "libro2",
    "libro3",
    "poema_camara_reloj",
    "poema_sintonizadores",
    "poema_frialdad1",
    "poema_frialdad2",
    "poema_frialdad3",
    "poema_frialdad4",
    "poema_frialdad5",
    "poema_frialdad6",
}

# Recortes fijos, en fraccion del lado, para las paginas cuyo dibujo ocupa todo
# el papel y lleva la cabecera impresa encima: ahi no hay margen que detectar.
MANUAL = {
    # el glosario es una pagina crema entera; se le quita la banda del titulo
    "poema_glosario": (0.0, 0.095, 1.0, 1.0),
}

# Cuanto debe apartarse un pixel del fondo para contar como dibujo. Las
# capturas que traen sombra de maqueta necesitan mas margen: la sombra es un
# gris claro que, con la tolerancia normal, se cuela dentro del recorte.
TOL = 8
TOL_OVERRIDE = {"libro1": 46}

# Caja en la que build_interior.py coloca las laminas a pagina completa, en
# pulgadas, y resolucion a la que se quiere que queden una vez colocadas.
PLATE_W_IN = 4.85
PLATE_H_IN = 7.80
TARGET_DPI = 300
DENSITY = 0.80  # fraccion de la fila o columna que debe ser dibujo


def _longest_true_run(flags: list[bool]) -> tuple[int, int]:
    best, best_len, i = (0, len(flags)), -1, 0
    while i < len(flags):
        if not flags[i]:
            i += 1
            continue
        j = i
        while j < len(flags) and flags[j]:
            j += 1
        if j - i > best_len:
            best_len, best = j - i, (i, j)
        i = j
    return best


def content_box(im: Image.Image, tol: int = TOL) -> tuple[int, int, int, int]:
    g = im.convert("L")
    w, h = g.size
    scale = max(1, max(w, h) // 700)
    small = g.resize((max(1, w // scale), max(1, h // scale)), Image.BILINEAR)
    sw, sh = small.size
    px = small.load()

    border = [px[x, y] for x in range(sw) for y in (0, sh - 1)]
    border += [px[x, y] for y in range(sh) for x in (0, sw - 1)]
    bg = Counter(border).most_common(1)[0][0]

    rows = [sum(abs(px[x, y] - bg) > tol for x in range(sw)) >= sw * DENSITY for y in range(sh)]
    cols = [sum(abs(px[x, y] - bg) > tol for y in range(sh)) >= sh * DENSITY for x in range(sw)]
    y0, y1 = _longest_true_run(rows)
    x0, x1 = _longest_true_run(cols)
    if (y1 - y0) < sh * 0.3 or (x1 - x0) < sw * 0.3:
        return (0, 0, w, h)  # no se reconoce un recuadro: se deja entera
    return (x0 * scale, y0 * scale, min(w, x1 * scale), min(h, y1 * scale))


def to_print_size(im: Image.Image) -> Image.Image:
    """Sube la imagen hasta los 300 ppp que pide KDP al tamaño en que se coloca.

    Los originales rondan los mil pixeles de lado, asi que a pagina completa se
    quedan entre 115 y 285 ppp. Ampliar no inventa detalle, pero evita que el
    revisor de KDP marque la pagina y, sobre todo, deja la interpolacion en
    nuestras manos —Lanczos con una mascara de enfoque suave y un grano muy
    fino— en lugar de en las del RIP de la imprenta.
    """
    w, h = im.size
    fit = min(PLATE_W_IN / w, PLATE_H_IN / h)   # pulgadas por pixel al colocarla
    factor = fit * TARGET_DPI
    if factor <= 1.01:
        return im
    target_h = round(h * factor)
    while im.height < target_h:
        step = min(2.0, target_h / im.height)
        im = im.resize((round(im.width * step), round(im.height * step)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.5, percent=50, threshold=3))
    noise = Image.effect_noise(im.size, 6).convert("L")
    noise = Image.merge("RGB", (noise, noise, noise)).point(lambda v: 120 + (v - 128) // 4)
    return ImageChops.overlay(im, noise)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}
    for key, rel in SOURCES.items():
        src = ROOT / rel
        if not src.exists():
            print(f"FALTA {rel}", file=sys.stderr)
            return 1
        im = Image.open(src).convert("RGB")
        before = im.size
        if key in MANUAL:
            fx0, fy0, fx1, fy1 = MANUAL[key]
            box = (
                int(before[0] * fx0),
                int(before[1] * fy0),
                int(before[0] * fx1),
                int(before[1] * fy1),
            )
            im = im.crop(box)
        elif key in NO_CROP:
            box = (0, 0, *before)
        else:
            box = content_box(im, TOL_OVERRIDE.get(key, TOL))
            im = im.crop(box)
        cropped = im.size
        if key != "portada":   # la portada la amplía build_cover.py a su medida
            im = to_print_size(im)
        dst = OUT / f"{key}.jpg"
        im.save(dst, "JPEG", quality=90, subsampling=0, dpi=(300, 300))
        report[key] = {
            "origen": rel,
            "original": list(before),
            "recorte": list(box),
            "recortada": list(cropped),
            "final": list(im.size),
        }
        print(f"{key:24s} {before[0]}x{before[1]} -> recorte {cropped[0]}x{cropped[1]}"
              f" -> {im.size[0]}x{im.size[1]}  {rel}")
    (OUT / "procedencia.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
