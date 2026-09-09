import { Chapter, loadEssayChapters } from "./group1";

// APÉNDICES Y GLOSARIO: el aparato final de todo el libro, consolidado.
// - cap_nota_autor reúne la nota original y las notas del autor de las
//   variaciones de cámara (la de VII era idéntica a la original).
// - cap_glosario incorpora los términos de los "Glosario mínimo" de cada
//   variación; el glosario poético ("Glosario íntimo") vive en poemas.ts.
// - cap_notas_referencias es la bibliografía completa; las notas y lecturas
//   de cada variación van, como en el resto del ensayo, al final de su
//   propio capítulo de ensayo (camara_*_ensayo).
const ORDER = ["cap_nota_autor", "cap_glosario", "cap_notas_referencias"];

export const apendices: Chapter[] = loadEssayChapters(ORDER);
