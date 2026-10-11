# El Cuaderno de Ada Koch

Saga romántica en cuatro libros para Kindle.

- `libro_1/` — *Los Amantes de la Espiral* (Libro I), manuscrito completo en tres actos, 30 capítulos con los fragmentos de Maruxa. Unas 59.000 palabras.
  - `Los_Amantes_de_la_Espiral.md` — texto fuente.
  - `Los_Amantes_de_la_Espiral.docx` — versión para revisar en Word.
  - `Los_Amantes_de_la_Espiral.epub` — versión para Kindle.
  - `scripts/build_epub.py` — genera el EPUB con la maqueta de `edicion_kdp` (Lora, mismos colores y portada). `python3 ada_koch/libro_1/scripts/build_epub.py`
  - `en/` — traducción al inglés estadounidense, *The Lovers of the Spiral* (*The Sketchbook of Ada Koch · Book I*), unas 63.000 palabras, párrafo a párrafo con el original.
    - `en/The_Lovers_of_the_Spiral.md`, `.docx`, `.epub`.
    - `en/TRANSLATION_GUIDE.md` — criterios y glosario (rayas → comillas, gallego sin traducir, *el de las pinzas* → *the jumper-cables man*…).
    - `scripts/build_epub_en.py` — misma maqueta que la edición española. `python3 ada_koch/libro_1/scripts/build_epub_en.py`
  - `en_gb/` — edición británica de Orkney, sin rastro de España: Ada creció en Edimburgo y vive en el faro (ficticio) de Breckness, junto a Stromness; Maisie, su abuela, es de Stromness y trabajó de 1966 a 1971 en una fábrica alemana de Glasgow, donde conoció a Klaus. Presente narrativo para Ada e Iter/Julian, comillas simples, orcadiano con mesura, Storm Ailsa y Storm Brodie, glosario final.
    - `en_gb/The_Lovers_of_the_Spiral.md`, `.docx`, `.epub`; `en_gb/ORKNEY_BIBLE.md` y `en_gb/TRANSPOSITION.md` — biblia de adaptación (la segunda manda).
    - `scripts/build_epub_gb.py` — `python3 ada_koch/libro_1/scripts/build_epub_gb.py`
