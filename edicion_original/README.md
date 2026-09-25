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

## Versión accesible

`main_accesible.tex` + `cuerpo_accesible.tex` → `El_Horizonte_Interior_accesible.pdf`
(221 páginas). `cuerpo_accesible.tex` **no se edita a mano**: lo genera

    python3 scripts/build_accesible.py

a partir del original del autor (`cuerpo_autor.tex`, intacto):

1. Corrige erratas del original: «más rápido que la luz», «que su marido se
   disuelva» (×2), dos anglicismos («se scrambled» → «se desordena»,
   «scrambled» → «revueltas») y los asteriscos de «M87\*» y «Sagitario A\*»,
   que se habían convertido en cursiva.
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

Compilar: `xelatex main_accesible.tex` dos veces.
