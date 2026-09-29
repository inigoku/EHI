import { Chapter, loadEssayChapters } from "./group1";

// CUARTA PARTE: el límite del experimento. "Cinco mapas del mismo
// horizonte", "El espejo sin profundidad", "El entrelazamiento vertical" y
// "El horizonte colectivo" se trasladaron a group5.ts, justo después de los
// capítulos que los originaron (17_5_real y 18_real); "La realidad fractal"
// se trasladó a lecturas.ts. Aquí solo queda el cierre: los límites del
// experimento y el experimento como práctica, más los dos capítulos que
// reformulan el modelo con la tríada (borde, energía libre, acción) y lo
// releen entero. Sus relatos están en
// cuentos.ts, sus poemas en poemas.ts. El aparato final (nota del autor,
// glosario, notas y referencias) va en apendices.ts.
const ORDER = [
  "cap19_real",
  "cap20_real",
  "cap_triada_horizonte",
  "cap_ensayo_releido",
  "cap_epilogo_real",
];

export const group6: Chapter[] = loadEssayChapters(ORDER);
