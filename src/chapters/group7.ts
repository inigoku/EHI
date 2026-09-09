import { Chapter, loadEssayChapters } from "./group1";

// VARIACIONES DE CÁMARA: cuatro piezas de un solo movimiento, escritas
// después del libro y publicadas antes por separado (ver camara/*.md y
// camara/build_camara.py). Cada .md fuente se parte aquí en sus capítulos
// naturales (obertura, ensayo, poema(s), epílogo, lecturas, nota del autor,
// glosario, notas) reutilizando el mismo pool /content/ensayo que el resto
// del libro — ver la nota en group5.ts sobre por qué eso es correcto.

const ORDER = [
  "camara_intro",

  // VII — El espejo sin profundidad
  "camara_espejo_obertura",
  "camara_espejo_ensayo",
  "camara_espejo_poema_lo_que_el_espejo_no_tiene",
  "camara_espejo_epilogo",
  "camara_espejo_lecturas",
  "camara_espejo_lecturas2",
  "camara_espejo_nota",
  "camara_espejo_glosario",
  "camara_espejo_notas",

  // VIII — El diapasón invisible
  "camara_diapason_obertura",
  "camara_diapason_ensayo",
  "camara_diapason_poema_manos",
  "camara_diapason_epilogo",
  "camara_diapason_poema_montse_xxi",
  "camara_diapason_lecturas",
  "camara_diapason_nota",
  "camara_diapason_glosario",
  "camara_diapason_notas",

  // IX — El ojo de un solo color
  "camara_ojo_obertura",
  "camara_ojo_ensayo",
  "camara_ojo_poema_coro",
  "camara_ojo_epilogo",
  "camara_ojo_lecturas",
  "camara_ojo_nota",
  "camara_ojo_glosario",
  "camara_ojo_notas",

  // X — La realidad fractal (continuación de El diapasón invisible)
  "camara_fractal_obertura",
  "camara_fractal_ensayo",
  "camara_fractal_poema_vecinos",
  "camara_fractal_epilogo",
  "camara_fractal_poema_desde_la_cueva",
  "camara_fractal_lecturas",
  "camara_fractal_nota",
  "camara_fractal_glosario",
  "camara_fractal_notas",
];

export const group7: Chapter[] = loadEssayChapters(ORDER);
