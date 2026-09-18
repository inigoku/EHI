# Ecos en el borde — antología poética en tapa dura (6 × 9")

Los veintiún poemas y el glosario íntimo de la sección de poesía de la web
—*Antología Poética: Ecos en el Borde. Lírica del Límite Emocional*— montados
como libro independiente para tapa dura de Amazon KDP.

## Qué hay aquí

    Ecos_en_el_Borde_6x9_interior.pdf        el interior, 78 páginas, 6 × 9"
    Ecos_en_el_Borde_portada_frontal.pdf     solo la cubierta, 6,25 × 9,25"
    Ecos_en_el_Borde_cubierta_tapadura.pdf   la envolvente entera, 14,486 × 10,5"
    imagenes/                                las láminas ya recortadas y a 300 ppp
    imagenes/procedencia.json                de qué fichero sale cada lámina
    imagenes/portada_2k.jpg                  la portada regenerada, 1342 × 2000
    imagenes/portada.jpg                     la imagen de la web, como respaldo
    fonts/                                   Source Serif Pro (SIL OFL)
    scripts/                                 todo lo necesario para regenerar

## El contenido

El texto sale de `content/poemas/*.es.md`, los mismos ficheros que lee la web:
no hay copia del texto en esta carpeta. Cambiar un verso allí y volver a
generar es suficiente.

Los veintiún poemas van repartidos en los tres libros que ya formaban en la
obra, y el glosario cierra el volumen:

| Libro | Sección en la web | Poemas |
|---|---|---|
| Primero — *La arquitectura con un hueco* | `LA ARQUITECTURA CON UN HUECO` | 8 |
| Segundo — *La frialdad de una ciudad apagada* | `LA FRIALDAD DE UNA CIUDAD APAGADA` | 7 |
| Tercero — *Los últimos libros* | `LOS ÚLTIMOS LIBROS` | 6 |
| Cierre — *Glosario íntimo* | `GLOSARIO ÍNTIMO` | — |

El "Villancico cibernético" y "Montse XXI" van donde la web los pone, dentro
del libro segundo, y "El nudo de la mezcla" lo cierra como séptimo.

Además de los poemas, el volumen lleva índice, una introducción escrita para
esta edición (*Desde la orilla*), una relación de las láminas con la
descripción de cada una, un índice de primeros versos y una nota final sobre
la obra.

## La maquetación

Sigue la de `edicion_kdp/` —misma paleta (`#22282c`, `#3c6e71`, `#c9c2b2`),
mismas cabeceras y folios, la misma onda como adorno— subida de 5 × 8" a
6 × 9" y adaptada al verso:

- **Sin sangre.** Las láminas van encajadas dentro de la caja, no a corte, así
  que el PDF mide el recorte exacto (432 × 648 pt) y KDP no pide demasía. Es
  lo que más resolución deja a unas ilustraciones que no sobran de píxeles.
- **Cada poema abre en impar** con su lámina a página completa enfrente, en la
  par. Los poemas que no caben en una página siguen en la siguiente y se
  rellena con una página de cortesía para que la lámina siguiente vuelva a
  caer en par.
- **Márgenes espejados**: 0,875" de lomo, 0,625" exterior, 0,75" superior,
  0,8" inferior. KDP pide 0,375" y 0,25" respectivamente hasta 150 páginas.
- **El bloque de verso se centra ópticamente**: se mide el verso más largo del
  poema y se alinea todo a la izquierda a partir de ahí, con sangría francesa
  en los versos que hay que partir.
- **Tipografía**: Source Serif Pro, 11,4/17 pt en verso y 11/16,6 pt en prosa.

La edición KDP de la obra completa usa Lora, que no está en esta máquina y en
el PDF de origen solo aparece como subconjunto sin tabla de caracteres. Source
Serif Pro es un tipo de libro de proporciones parecidas y con el juego completo
de acentos y comillas españolas.

## Regenerar

    python3 edicion_poesia/scripts/prepare_images.py     # recorta y sube las láminas
    python3 edicion_poesia/scripts/build_interior.py     # monta el interior
    python3 edicion_poesia/scripts/build_cover.py --paginas 78
    python3 edicion_poesia/scripts/check_kdp.py          # repasa los requisitos

Hace falta `reportlab`, `Pillow` y, para el repaso, `pymupdf`. Las rutas son
relativas al repositorio: los scripts funcionan desde cualquier directorio.

`build_interior.py` hace dos pasadas —una para recoger los folios y otra para
imprimir el índice ya relleno— y avisa si la segunda mueve la paginación.

## Al subir a KDP

- Tapa dura, 6 × 9", papel blanco, **sin sangre**.
- 78 páginas: por encima del mínimo de 75 que pide la tapa dura y par.
- `check_kdp.py` comprueba tamaño de página, paridad, márgenes, fuentes
  incrustadas y resolución de las láminas. Sale sin problemas.

## Lo que conviene mirar antes de imprimir

**La resolución de origen.** Las ilustraciones de la web rondan los mil píxeles
de lado: a página completa se quedaban entre 115 y 285 ppp. `prepare_images.py`
las sube a los 300 ppp del tamaño en que se colocan con Lanczos, una máscara de
enfoque suave y un grano muy fino. Eso no inventa detalle —la nitidez es la del
original— pero deja la interpolación en nuestras manos en vez de en las del RIP
de la imprenta, y evita que el revisor de KDP marque las páginas. Si en algún
momento se regeneran las ilustraciones a 2K, basta con volver a correr el
script.

**La portada.** Ya está regenerada: `imagenes/portada_2k.jpg`, 1342 × 2000 px,
pintada con Nano Banana Pro (`gemini-3-pro-image-preview`) a partir del encargo
que lleva dentro `scripts/regen_portada_2k.py`. Son 215 ppp nativos a tamaño
cubierta, que `build_cover.py` sube a 300 con una ampliación de 1,4. La imagen
original de la sección de poesía de la web sigue en `imagenes/portada.jpg`
como respaldo: medía 364 × 392 px, o sea 58 ppp nativos y siete aumentos, y era
el punto flojo del montaje.

Si se quiere apurar hasta un nativo de 300 ppp harían falta unos 1875 × 2775,
que es lo que da el mismo modelo pidiéndole 4K en lugar de 2K.

Para rehacerla está `scripts/regen_portada_2k.py`, que pide la misma escena a
los modelos de imagen de Gemini, en vertical 2:3 —la proporción de la
cubierta— y al mayor tamaño que dé la cuenta. El encargo va escrito dentro, con
el rostro colocado en el tercio central para que no se lo coman los velos de
tinta del título y del autor.

    pip install google-genai
    export GEMINI_API_KEY="tu_clave"          # de aistudio.google.com
    python3 edicion_poesia/scripts/regen_portada_2k.py --variantes 4
    cp edicion_poesia/imagenes/portada_2k_opciones/portada_2k_01.jpg \
       edicion_poesia/imagenes/portada_2k.jpg
    python3 edicion_poesia/scripts/build_cover.py --paginas 78

`build_cover.py` busca `imagenes/portada_2k.jpg` antes que la imagen de la web,
así que en cuanto ese fichero existe la cubierta lo usa solo, y al arrancar
dice de cuál de las dos está tirando. Sin `--variantes` sustituye directamente
la que esté en uso.

El script baja por una escalera de modelos y se queda en el primero que la
cuenta le deje usar:

| Modelo | Tamaño | Píxeles | A tamaño cubierta |
|---|---|---|---|
| `gemini-3-pro-image-preview` | 4K | ~2730 × 4096 | 437 ppp, **nativa** |
| `gemini-3-pro-image-preview` | 2K | ~1365 × 2048 | 218 ppp |
| `gemini-2.5-flash-image` | 1K | ~682 × 1024 | 109 ppp |
| `imagen-4.0-generate-001` | 2K | 1536 × 2048 | 221 ppp, solo Vertex |

Con 4K la cubierta queda por fin nativa a 300 ppp, sin ampliar nada. Los demás
escalones siguen siendo bastantes más píxeles reales que los 364 de ahora, y
`build_cover.py` completa lo que falte con la misma ampliación de siempre.

Imagen 4 solo se intenta si hay un proyecto de Google Cloud con Vertex AI
(`GOOGLE_CLOUD_PROJECT`, y `GOOGLE_CLOUD_LOCATION` si no vale `us-central1`):
el SDK no deja llamarlo con una clave de desarrollador suelta, y además está
marcado como obsoleto a favor de los modelos de arriba. Para forzar un modelo
concreto: `GEMINI_IMAGE_MODEL`, y `GEMINI_IMAGE_SIZE` para el tamaño.

**Las medidas de la envolvente.** `build_cover.py` calcula la cubierta de tapa
dura con lo que publica KDP: 0,625" de arrastre, 0,125" de sangre, 0,375" de
bisagra a cada lado del lomo y un lomo de páginas × 0,002252" + 0,06" en papel
blanco. Para 78 páginas salen 14,486 × 10,5". **Las cifras que circulan no
coinciden entre fuentes**, así que antes de subir conviene descargar la
plantilla que genera el propio KDP para 6 × 9", tapa dura y el número de
páginas final, y contrastar. Si no cuadra:

    python3 edicion_poesia/scripts/build_cover.py --paginas 78 --ancho 14.5 --alto 10.5

El lomo de 0,236" no admite texto —KDP pide 0,35" como mínimo— y el script lo
omite solo. La contra reserva el hueco blanco de 2 × 1,2" para el código de
barras.

**El ISBN.** La página de créditos dice "pendiente de asignación". Si se usa el
ISBN gratuito de KDP no hay nada que cambiar; si se compra uno, hay que
ponerlo en `build_interior.py` y volver a generar.
