# El Horizonte Interior — edición íntegra del ensayo (6 × 9", tapa dura)

Los 54 capítulos numerados del ensayo (Primera a Cuarta Parte, incluidas las
lecturas topológicas y los capítulos de los cuatro últimos libros) más el
prólogo, el interludio y el aparato final (epílogo, glosario, nota del autor,
notas y referencias), montados como libro independiente para tapa dura de
Amazon KDP. No incluye los cuentos ni los poemas: es el ensayo solo, completo.

## Qué hay aquí

    El_Horizonte_Interior_Ensayo_6x9.pdf   el interior, 776 páginas, 6 × 9" (~15 MB)
    El_Horizonte_Interior_Ensayo.epub      el epub, 61 pantallas, 72 imágenes
    toc_ensayo.json                        la tabla de contenidos + mapa de ilustraciones
    scripts/build_interior_premium.py      genera el interior (maqueta "chulo")
    scripts/build_epub_ensayo.py           genera el epub a partir del TOC
    fonts/                                 Source Serif Pro (misma familia que edicion_poesia)

El interior se genera con `scripts/build_interior_premium.py`, con la
misma maquetación con alma que `edicion_poesia/scripts/build_interior.py`
en vez del aspecto genérico de `scripts/generate_book_pdf.py`: tipografía
Source Serif Pro, paleta propia (tinta/ámbar/oro), índice con puntos guía,
cabeceras corridas (título del libro en la par, del capítulo en la impar)
y una lámina a página completa antes de cada capítulo ilustrado, con el
capítulo abriendo justo enfrente en la impar — igual que hace la poesía
con cada poema. El cuerpo de cada capítulo (párrafos, tablas, citas,
ilustraciones en línea) reutiliza el parser markdown de
`scripts/generate_book_pdf.py` tal cual.

    python3 scripts/build_interior_premium.py toc_ensayo.json \
      -o El_Horizonte_Interior_Ensayo_6x9.pdf

    python3 scripts/build_epub_ensayo.py toc_ensayo.json \
      -o El_Horizonte_Interior_Ensayo.epub

(`scripts/generate_book_pdf.py --trim 6x9 --gutter ...` sigue existiendo
en la raíz del repo, compartido con otras ediciones, y produce un interior
correcto pero con el aspecto genérico del motor común — es la maqueta que
llevaba este volumen antes de pedir la versión "chulo".)

## El contenido

El texto sale de `content/ensayo/*.es.md` y `content/lecturas/*.es.md`, los
mismos ficheros que lee la web: no hay copia del texto en esta carpeta.
Cambiar un capítulo allí y volver a generar es suficiente — salvo que se
añada o quite un capítulo, en cuyo caso `toc_ensayo.json` también hay que
tocarlo (su lista `chapters` es el orden de lectura).

Se excluyen deliberadamente `tarel.es.md` ("La costumbre del agua", un
cuento) y los propios cuentos y poemas: este volumen es solo el ensayo.

### `content_overrides/`

Como el cuento de Tarel y el de La tienda del Luthier no están en este
volumen, sus referencias en cinco capítulos de ensayo (el archivista de
Tarel en el epílogo y en "La muerte como retorno", el Luthier en
"Horizontes alienígenas", y dos dedicatorias sueltas en "Cartografía de
tres singularidades") quedaban como remisiones a algo que el lector no
tiene delante. Por decisión editorial, esas cinco entradas de
`toc_ensayo.json` apuntan a `content_overrides/*.es.md` — copias de esos
capítulos con esas referencias reescritas o retiradas — en vez de a
`content/ensayo/` o `content/lecturas/` directamente. La web y el resto
de ediciones (poesía, cámara...) siguen usando el texto original sin
tocar: este es el único volumen donde diverge. Si se edita alguno de esos
cinco capítulos en su origen, hay que trasladar el cambio a mano a su
copia en `content_overrides/`.

## Ilustraciones

`toc_ensayo.json` trae un mapa id → fichero para las 162 ilustraciones que
usa el ensayo, extraído de `src/components/IllustrationViewer.tsx` (la
misma fuente que usa la web). Catorce de ellas son reproducciones de obras
reales o fotos de prensa alojadas en Wikimedia/otros medios (los capítulos
"Cartografía de tres singularidades", "Historia de un relevo" y "El
traductor"); el proxy de red de este entorno de desarrollo las bloquea
(403 en el túnel HTTPS a esos dominios), así que en esta compilación esos
capítulos concretos se quedan sin esa lámina en particular. Todo lo demás
—las 148 ilustraciones propias del libro— está incluido. Para una
compilación final habría que volver a generar el PDF y el EPUB desde un
entorno con acceso a esos dominios, o descargar esas 14 imágenes a mano y
apuntar `toc_ensayo.json` a copias locales.

## Pendiente / siguiente paso natural

- Portada y cubierta de tapa dura (frontal + envolvente con lomo), al estilo
  de `edicion_poesia/scripts/build_cover.py` (que calcula el ancho de lomo a
  partir del número de páginas): no se han generado todavía para esta
  edición.
- **776 páginas** es un libro largo. Antes de subirlo a KDP conviene
  comprobar el límite de páginas vigente para tapa dura a 6×9" con el tipo
  de papel elegido (blanco o crema) — puede exigir papel más fino, o
  plantear partir el volumen en dos tomos si el límite queda por debajo.
- Edición en inglés: todos los capítulos ya existen en `.en.md`. Se puede
  repetir el mismo proceso con un `toc_ensayo_en.json` que apunte a esos
  ficheros.

## Versión sin ilustraciones (tapa blanda B/N y EPUB)

    El_Horizonte_Interior_Ensayo_sin_ilustraciones_6x9.pdf          interior, 706 páginas, sin láminas ni ilustraciones en línea
    El_Horizonte_Interior_Ensayo_cubierta_tapablanda_sin_ilustraciones.pdf  cubierta de tapa blanda (papel blanco B/N, lomo 1,590")
    El_Horizonte_Interior_Ensayo_sin_ilustraciones.epub             EPUB solo con la portada

    python3 scripts/build_interior_premium.py toc_ensayo.json \
      -o El_Horizonte_Interior_Ensayo_sin_ilustraciones_6x9.pdf --sin-ilustraciones
    python3 scripts/build_epub_ensayo.py toc_ensayo.json \
      -o El_Horizonte_Interior_Ensayo_sin_ilustraciones.epub --sin-ilustraciones
    python3 scripts/build_cover_paperback.py --sin-ilustraciones

El maquetador corrige además dos fallos heredados (los mismos de Cuentos de
Tarel): los marcadores del índice caían una página antes del título cuando
el capítulo empezaba tras una página de cortesía, y la raya o el espacio
final de un capítulo podían dejar sola una página en blanco con cabecera.
El interior ilustrado también está regenerado con ellos: 790 páginas (antes 792), mismo texto, y sus cubiertas de tapa dura y tapa blanda recalculadas.
