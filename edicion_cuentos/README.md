# Cuentos de Tarel — antología de relatos en tapa dura (6 × 9")

Los veintiocho cuentos de la sección de relatos de la web —*Cuentos de Tarel.
Fábulas de la Frontera*— montados como libro independiente para tapa dura
de Amazon KDP, en español, inglés y catalán.

## Qué hay aquí

    Cuentos_de_Tarel_6x9.pdf     el interior en español, 212 páginas, 6 × 9"
    Tales_of_Tarel_6x9.pdf       el interior en inglés, 212 páginas, 6 × 9"
    Cuentos_de_Tarel.epub        el epub en español
    Tales_of_Tarel.epub          el epub en inglés
    toc_cuentos.json             tabla de contenidos + mapa de ilustraciones (es)
    toc_cuentos_en.json          lo mismo, en inglés
    imagenes/                    las 30 ilustraciones (29 láminas + 1 inline), copiadas
                                  de src/assets/images/ a resolución de impresión
    fonts/                       Source Serif Pro (SIL OFL), igual que las otras ediciones
    scripts/                     todo lo necesario para regenerar

## El contenido

El texto sale de `content/cuentos/*.es.md` y `*.en.md`, los mismos ficheros
que lee la web: no hay copia del texto en esta carpeta. El orden de lectura
es el mismo que usa `src/chapters/cuentos.ts` (la nota del archivista abre
el volumen, la coda "Txiki" lo cierra).

Las ilustraciones de la mayoría de cuentos viven solo en el frontmatter
español (`illustrationId`); el inglés no lo repite (es el comportamiento
establecido ya en la propia web: `cuentos.ts` solo lee `es.data.illustrationId`
sin importar el idioma de lectura). Los dos `toc_cuentos*.json` por eso
llevan el id de ilustración de cada capítulo explícito en la propia entrada
del capítulo (`"illustration": "..."`), no delegado al frontmatter de cada
idioma.

## Cómo se generó

`scripts/build_interior_premium.py` y `scripts/build_epub.py` son
adaptaciones directas de los de `edicion_ensayo/`: misma maqueta con alma
(tipografía Source Serif Pro, paleta propia, folios y cabeceras corridas,
índice con puntos guía, una lámina a página completa antes de cada cuento),
mismo motor genérico dirigido por TOC. Los cambios frente al ensayo:

- Sin rótulo "Capítulo N": es una antología de relatos, no un argumento
  numerado, y varios cuentos (la nota del archivista, los interludios, la
  coda) no lo llevan de todos modos.
- Textos de cubierta interior (portadilla, créditos, colofón) parametrizados
  por idioma (`STRINGS`/`tr()` en el script) en vez de fijos en español.
- El medianil parte de 0.55" (con colchón sobre el mínimo real de KDP para
  151-300 páginas, que es 0.5") en vez del 0.95" del ensayo (701-828
  páginas) — reajustar si el recuento final de páginas cambia de banda.

```
python3 scripts/build_interior_premium.py toc_cuentos.json \
  -o Cuentos_de_Tarel_6x9.pdf
python3 scripts/build_interior_premium.py toc_cuentos_en.json \
  -o Tales_of_Tarel_6x9.pdf

python3 scripts/build_epub.py toc_cuentos.json -o Cuentos_de_Tarel.epub
python3 scripts/build_epub.py toc_cuentos_en.json -o Tales_of_Tarel.epub
```

## Pendiente

- **Cubierta**: no hay ilustración de portada propia todavía
  (`imagenes/portada.jpg` no existe: `cover_image` en el TOC apunta ahí a
  la espera de ella). Los interiores y los epub no la necesitan para
  compilar; la cubierta de KDP (`scripts/build_cover.py`, a partir del de
  `edicion_ensayo/`) se añadirá en cuanto exista la ilustración.
- El frontmatter inglés de la mayoría de cuentos no lleva `chapterNumber`
  (sí el español) — gap preexistente en el contenido, no en este pipeline;
  solo afecta a si el índice muestra "N. Título" o solo "Título".
