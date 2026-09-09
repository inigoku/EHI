import { Chapter, loadEssayChapters } from "./group1";

// CUARTA PARTE: el límite del experimento. Tras "Cinco mapas del mismo
// horizonte" van los ensayos de los cuatro últimos libros (El espejo sin
// profundidad, El diapasón invisible, La realidad fractal —que continúa al
// anterior— y El ojo de un solo color); sus relatos están en cuentos.ts, sus
// poemas en poemas.ts y sus lecturas en lecturas.ts. El aparato final
// (nota del autor, glosario, notas y referencias) va en apendices.ts.
const ORDER = [
  "cap19_real",
  "cap_religiones_comparadas",
  "cap_espejo_sin_profundidad",
  "cap_diapason_invisible",
  "cap_realidad_fractal",
  "cap_ojo_un_solo_color",
  "cap20_real",
  "cap_epilogo_real",
];

export const group6: Chapter[] = loadEssayChapters(ORDER);
