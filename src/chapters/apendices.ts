import { Chapter, loadEssayChapters } from "./group1";

// APÉNDICES Y GLOSARIO: el aparato final de todo el libro, consolidado.
// - cap_nota_autor reúne la nota original y las notas del autor de los
//   cuatro últimos libros (la de El espejo sin profundidad era idéntica a
//   la original).
// - cap_glosario incorpora los términos de los glosarios de esos libros; el
//   glosario poético ("Glosario íntimo") vive en poemas.ts.
// - cap_notas_referencias es la bibliografía completa; las notas y lecturas
//   de cada capítulo van, como en el resto del ensayo, al final del propio
//   capítulo.
const ORDER = ["cap_nota_autor", "cap_glosario", "cap_notas_referencias"];

export const apendices: Chapter[] = loadEssayChapters(ORDER);
