# Edición en tapa dura (5 × 8", con sangre)

Estado: **prototipo**. Sirve para ver el resultado, no para enviar a imprenta
todavía — ver *Pendiente* al final.

## Qué es

Misma edición de cámara de `edicion_kdp/`, pero maquetada para tapa dura y con
una lámina a página completa delante de cada movimiento.

- **220 páginas**, par.
- **Página de 5,125 × 8,25"** — trim de 5 × 8" más los 0,125" de demasía que pide
  KDP arriba, abajo y en el corte exterior. El lomo no lleva sangre.
- Las **13 láminas** van a sangre completa, sin folio ni cabecera, y todas en
  página par, de modo que quedan a la izquierda enfrentadas a la apertura del
  movimiento en la impar. Para cuadrar esa paridad hay nueve páginas en blanco
  de cortesía.
- El **cómic no sangra**: sus páginas traen cabecera y numeración propias dentro
  del dibujo, y recortarlas a proporción se comía el encabezado. Va encajado a
  página completa sin recorte.

## Contenido

    El_Horizonte_Interior_TAPADURA_sangre.pdf   el PDF montado
    laminas/                                    las 13 láminas, ya recortadas a proporción
    scripts/                                    todo lo necesario para regenerar

## Regenerar

Los scripts usan rutas absolutas de la máquina donde se montó (`/home/claude/...`);
hay que ajustarlas antes de correrlos fuera de allí.

    parse_blocks.py        extrae el texto del PDF de origen con metadatos de fuente
    build_blocks.py        lo clasifica en bloques (H1, H2, párrafo, poema, cómic)
    fractal_chapter.py     el movimiento «La realidad fractal», como bloques
    generate_book.py       maquetación sin sangre  -> edicion_kdp/
    generate_book_bleed.py maquetación con sangre y láminas -> esta carpeta
    build_final.py         monta el PDF de edicion_kdp/
    build_epub.py          monta el EPUB
    build_bleed2.py        monta este PDF; coloca las láminas en par iterando

## Pendiente

**La resolución.** Las láminas están a 159 ppp y el cómic a 124; KDP pide 300.
Para 5,125 × 8,25" a 300 ppp hacen falta 1538 × 2475 px por lámina.

`scripts/regen_laminas_2k.py` regenera las trece con Imagen 4 a 2K — lleva
dentro los prompts definitivos. Con relación 3:4 a 2K y el recorte quedan unos
1272 px de ancho, es decir 248 ppp: mejor, pero todavía por debajo de 300, y
con composiciones nuevas. Upscalar las actuales conserva las que ya están
aprobadas.

Otras dos cosas menores, por si se retoman:

- El PDF referencia una Helvetica no incrustada, residuo del generador. No se
  usa para ningún carácter real.
- Los márgenes no están espejados entre par e impar. Cumple los mínimos de KDP
  por ambos lados, pero el margen de lomo no es tan holgado como en una
  maquetación hecha página a página.
