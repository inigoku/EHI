import { Chapter, loadEssayChapters } from "./group1";

// WORK IN PROGRESS: borradores del ensayo que no forman parte de los libros
// impresos. Van sin numerar, al final de todo (después del aparato final),
// y no entran en los índices de las ediciones de tapa dura ni de tapa blanda
// (edicion_ensayo/toc_*.json). Cada capítulo lleva en su frontmatter
// `section: WORK IN PROGRESS` y ningún `chapterNumber`.
//   - cap_triada_horizonte: el borde, la energía libre y la acción.
//   - cap_ensayo_releido: el libro releído con esa lente.
//   - cap20_5: la arquitectura cosmoteándrica (Panikkar).
//   - cap_herencia_geometria: la herencia de la geometría.
const ORDER = [
  "cap_triada_horizonte",
  "cap_ensayo_releido",
  "cap20_5",
  "cap_herencia_geometria",
];

export const workInProgress: Chapter[] = loadEssayChapters(ORDER);
