import { Chapter, loadEssayChapters } from "./group1";

// CUARTA PARTE: el límite del experimento. Tras "Cinco mapas del mismo
// horizonte" van los ensayos de tres de los cuatro últimos libros (El espejo
// sin profundidad, El diapasón invisible y El ojo de un solo color); "La
// realidad fractal" —que continúa al diapasón— se trasladó a lecturas.ts
// dentro de las lecturas topológicas. Sus relatos están en cuentos.ts, sus
// poemas en poemas.ts. El aparato final (nota del autor, glosario, notas y
// referencias) va en apendices.ts.
const ORDER = [
  "cap19_real",
  "cap_religiones_comparadas",
  "cap_espejo_sin_profundidad",
  "cap_diapason_invisible",
  "cap_ojo_un_solo_color",
  "cap20_real",
  "cap_epilogo_real",
];

export const group6: Chapter[] = loadEssayChapters(ORDER);
