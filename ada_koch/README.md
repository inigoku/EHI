# El Cuaderno de Ada Koch

Saga romántica en cuatro libros para Kindle.

- `libro_1/` — *El hombre que esperaba* (Libro I), manuscrito completo en tres actos, 30 capítulos con los fragmentos de Maruxa. Unas 57.000 palabras.
  - `El_hombre_que_esperaba.md` — texto fuente.
  - `El_hombre_que_esperaba.docx` — versión para revisar en Word.
  - `El_hombre_que_esperaba.epub` — versión para Kindle.
  - `scripts/build_epub.py` — genera el EPUB con la maqueta de `edicion_kdp` (Lora, mismos colores y portada). `python3 ada_koch/libro_1/scripts/build_epub.py`
  - `en_us/` — edición estadounidense (traducción fiel, ambientada en Galicia), *The Man Who Waited* (*The Sketchbook of Ada Koch · Book I*), unas 63.000 palabras, párrafo a párrafo con el original.
    - `en_us/The_Man_Who_Waited_US.md`, `.docx`, `.epub`.
    - `en_us/TRANSLATION_GUIDE.md` — criterios y glosario (rayas → comillas, gallego sin traducir, *el de las pinzas* → *the jumper-cables man*…).
    - `scripts/build_epub_us.py` — misma maqueta que la edición española. `python3 ada_koch/libro_1/scripts/build_epub_us.py`
  - `en_gb/` — edición británica de Orkney, sin rastro de España: Ada creció en Edimburgo y vive en el faro (ficticio) de Breckness, junto a Stromness; Maisie, su abuela, es de Stromness y trabajó de 1966 a 1971 en una fábrica alemana de Glasgow, donde conoció a Klaus. Presente narrativo para Ada e Iter/Julian, comillas simples, orcadiano con mesura, Storm Ailsa y Storm Brodie, glosario final.
    - `en_gb/The_Man_Who_Waited_GB.md`, `.docx`, `.epub`; `en_gb/ORKNEY_BIBLE.md` y `en_gb/TRANSPOSITION.md` — biblia de adaptación (la segunda manda).
    - `scripts/build_epub_gb.py` — `python3 ada_koch/libro_1/scripts/build_epub_gb.py`
- `libro_2/desde_libro_1/` — el resto del antiguo capítulo 30 (Julian dice su nombre once veces, la comida en casa de la abuela, la vuelta al faro), en `es.md`, `us.md` y `gb.md`. El libro I termina ahora con «Me llamo Ada.».
- `libro_3/desde_libro_1/` — la noche en que Julian enciende el faro y el último fragmento de la abuela, que lo ve y canta en el espigón.
