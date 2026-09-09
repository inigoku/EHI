import { Chapter, loadEssayChapters } from "./group1";

// VARIACIONES DE CÁMARA: cuatro piezas de un solo movimiento, escritas
// después del libro y publicadas antes por separado (ver camara/*.md y
// camara/build_camara.py). Cada .md fuente se parte aquí en sus capítulos
// naturales (obertura, ensayo, poema(s), epílogo, lecturas) reutilizando el
// mismo pool /content/ensayo que el resto del libro. El aparato de cada
// variación no va aquí: sus notas y lecturas cierran su capítulo de ensayo
// (como en el resto del libro), y su nota del autor y su glosario están
// fundidos en apendices.ts. Sus poemas aparecen además en poemas.ts.

const ORDER = [
  "camara_intro",

  // VII — El espejo sin profundidad
  "camara_espejo_obertura",
  "camara_espejo_ensayo",
  "camara_espejo_poema_lo_que_el_espejo_no_tiene",
  "camara_espejo_epilogo",
  "camara_espejo_lecturas",
  "camara_espejo_lecturas2",

  // VIII — El diapasón invisible
  "camara_diapason_obertura",
  "camara_diapason_ensayo",
  "camara_diapason_poema_manos",
  "camara_diapason_epilogo",
  "camara_diapason_poema_montse_xxi",
  "camara_diapason_lecturas",

  // IX — El ojo de un solo color
  "camara_ojo_obertura",
  "camara_ojo_ensayo",
  "camara_ojo_poema_coro",
  "camara_ojo_epilogo",
  "camara_ojo_lecturas",

  // X — La realidad fractal (continuación de El diapasón invisible)
  "camara_fractal_obertura",
  "camara_fractal_ensayo",
  "camara_fractal_poema_vecinos",
  "camara_fractal_epilogo",
  "camara_fractal_poema_desde_la_cueva",
  "camara_fractal_lecturas",
];

export const group7: Chapter[] = loadEssayChapters(ORDER);
