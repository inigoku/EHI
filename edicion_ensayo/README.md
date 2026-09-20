# El Horizonte Interior — edición íntegra del ensayo (6 × 9", tapa dura)

Los 54 capítulos numerados del ensayo (Primera a Cuarta Parte, incluidas las
lecturas topológicas y los capítulos de los cuatro últimos libros) más el
prólogo, el interludio y el aparato final (epílogo, glosario, nota del autor,
notas y referencias), montados como libro independiente para tapa dura de
Amazon KDP. No incluye los cuentos ni los poemas: es el ensayo solo, completo.

## Qué hay aquí

    El_Horizonte_Interior_Ensayo_6x9.pdf   el interior, 695 páginas, 6 × 9" (~10 MB)
    El_Horizonte_Interior_Ensayo.epub      el epub, 61 pantallas, 72 imágenes
    toc_ensayo.json                        la tabla de contenidos + mapa de ilustraciones
    scripts/build_epub_ensayo.py           genera el epub a partir del TOC

El interior se genera con `scripts/generate_book_pdf.py` (en la raíz del
repo, compartido con otras ediciones), al que se le añadió soporte de
tamaño de página y márgenes espejo de tapa dura:

    python3 ../scripts/generate_book_pdf.py toc_ensayo.json \
      -o El_Horizonte_Interior_Ensayo_6x9.pdf \
      --trim 6x9 --gutter 0.875 --outer 0.625 --top 0.75 --bottom 0.75

    python3 scripts/build_epub_ensayo.py toc_ensayo.json \
      -o El_Horizonte_Interior_Ensayo.epub

## El contenido

El texto sale de `content/ensayo/*.es.md` y `content/lecturas/*.es.md`, los
mismos ficheros que lee la web: no hay copia del texto en esta carpeta.
Cambiar un capítulo allí y volver a generar es suficiente — salvo que se
añada o quite un capítulo, en cuyo caso `toc_ensayo.json` también hay que
tocarlo (su lista `chapters` es el orden de lectura).

Se excluyen deliberadamente `tarel.es.md` ("La costumbre del agua", un
cuento) y los propios cuentos y poemas: este volumen es solo el ensayo.

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
  de `edicion_poesia/`: no se han generado todavía.
- Edición en inglés: todos los capítulos ya existen en `.en.md`. Se puede
  repetir el mismo proceso con un `toc_ensayo_en.json` que apunte a esos
  ficheros y las mismas opciones de `--trim`.
