// @ts-ignore
import p1 from "../assets/images/el_que_queda/pagina1.jpg";
// @ts-ignore
import p2 from "../assets/images/el_que_queda/pagina2.jpg";

import { MangaPage } from "./mangaPages";

// One-shot ilustrado de "El que queda" (content/cuentos/cuento16.es.md).
// Reutiliza la misma interfaz MangaPage y el mismo lector a página completa
// (MangaReader) que Edición Joven y "La costumbre del agua": dos láminas,
// sin portada separada.
export const elQuedaPages: MangaPage[] = [
  { id: "el_que_queda_p1", chapterId: "cuento16", pageNumber: 1, src: p1 },
  { id: "el_que_queda_p2", chapterId: "cuento16", pageNumber: 2, src: p2 },
];
