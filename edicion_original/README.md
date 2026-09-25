# El horizonte interior — edición original (LaTeX, tapa dura 6 × 9")

Fuente LaTeX del libro original *El horizonte interior. Un experimento de
pensamiento* (ISBN 9798172477270), proporcionada por el autor. Tipografía
EB Garamond, clase `memoir`, compilada con XeLaTeX.

## Dos versiones

| PDF | Fuente | Contenido |
|---|---|---|
| `El_Horizonte_Interior_original_autor.pdf` (179 págs.) | `main_autor.tex` + `cuerpo_autor.tex` | El manuscrito tal como lo entregó el autor: capítulos 0–17 (hasta *Las mascotas y el horizonte*), Cuarta parte con el capítulo 18 *Lo que la hipótesis no puede decir*, epílogo *La orilla*, glosario, notas y referencias. |
| `El_Horizonte_Interior.pdf` (209 págs.) | `main.tex` + `cuerpo.tex` | La versión ampliada: añade en la Cuarta parte tres capítulos de la web (*El espejo sin profundidad*, *El entrelazamiento vertical*, *La realidad fractal*), con sus láminas, y reordena el capítulo 18 al final (queda como 21). |

`cuerpo_autor.tex` es el `cuerpo.tex` del primer commit de esta carpeta
(f603185) sin los tres capítulos que ese mismo commit insertó.

## Compilar

    xelatex main.tex && xelatex main.tex              # versión ampliada
    xelatex main_autor.tex && xelatex main_autor.tex  # original del autor

Dos pasadas para que el índice tenga los números de página. Necesita
`texlive-xetex`, `texlive-latex-extra`, `texlive-lang-spanish` y
`texlive-pictures` (memoir, polyglossia, tcolorbox, lettrine, tikz).

## Edición ilustrada

Versión divulgativa de la tesis: el original del autor más siete capítulos,
con una lámina por capítulo. Mismo interior para tapa dura y tapa blanda.

| Fichero | Qué es |
|---|---|
| `El_Horizonte_Interior_ilustrada_6x9.pdf` | interior 6 × 9" (230 págs., par), tapa dura y tapa blanda |
| `El_Horizonte_Interior_ilustrada_cubierta_tapadura.pdf` | envolvente de tapa dura KDP (lomo 0,600") |
| `El_Horizonte_Interior_ilustrada_cubierta_tapablanda.pdf` | envolvente de tapa blanda KDP (lomo 0,540") |
| `El_Horizonte_Interior_ilustrada_portada_frontal.pdf` | frente suelto con sangre |
| `El_Horizonte_Interior_ilustrada_cubierta_ebook.jpg` | portada del EPUB, 1600 × 2560 px |
| `El_Horizonte_Interior_ilustrada.epub` | EPUB con las láminas |

Lomos calculados para papel a color (0,002347"/página). Sin ISBN en créditos:
KDP asigna uno por formato (el 9798172477270 es de la edición original).

Regenerar, desde `edicion_original/`:

    python3 scripts/build_ilustrada.py        # cuerpo_ilustrada.tex desde cuerpo_autor.tex
    xelatex main_ilustrada.tex; xelatex main_ilustrada.tex
    mv main_ilustrada.pdf El_Horizonte_Interior_ilustrada_6x9.pdf
    python3 scripts/build_cover.py            # cubiertas y portada del ebook
    python3 scripts/build_epub.py             # EPUB

`cuerpo_ilustrada.tex` no se edita a mano. `build_ilustrada.py`:

1. Corrige erratas del original (y la puntuación: rayas de inciso, comillas «»).
2. Renumera los capítulos y las referencias «capítulo N».
3. Inserta los capítulos nuevos de `capitulos/`, cada uno con su lámina:

| Nº | Capítulo | Procedencia |
|---|---|---|
| 3 | La encapsulación | web (`content/ensayo/cap2_5`), convertido con `scripts/md2tex.py` |
| 8 | El ciclo de la instanciación | web (`cap6_5`) |
| 9 | La tabla de las equivalencias | web (`cap6_6`); la tabla va en página apaisada |
| 21 | El espejo sin profundidad | `cuerpo.tex` (versión en tono sencillo) |
| 22 | Los casos límite | web (`cap18_real`), referencias adaptadas |
| 23 | El entrelazamiento vertical | `cuerpo.tex` |
| 24 | La realidad fractal | `cuerpo.tex` |

4. Añade al glosario y a las referencias los términos y obras de esos capítulos.
