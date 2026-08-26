// @ts-ignore
import portada from "../assets/images/tarel_agua/portada.jpg";
// @ts-ignore
import p1 from "../assets/images/tarel_agua/pagina1.jpg";
// @ts-ignore
import p2 from "../assets/images/tarel_agua/pagina2.jpg";
// @ts-ignore
import p3 from "../assets/images/tarel_agua/pagina3.jpg";
// @ts-ignore
import p4 from "../assets/images/tarel_agua/pagina4.jpg";
// @ts-ignore
import p5 from "../assets/images/tarel_agua/pagina5.jpg";
// @ts-ignore
import p6 from "../assets/images/tarel_agua/pagina6.jpg";
// @ts-ignore
import p7 from "../assets/images/tarel_agua/pagina7.jpg";

import { MangaPage } from "./mangaPages";

// One-shot ilustrado de "La costumbre del agua" (content/cuentos/cuento1.es.md).
// Reutiliza la misma interfaz MangaPage y el mismo lector a página completa
// (MangaReader) que Edición Joven, aunque es una historia independiente sin
// relación con Gerard.
export const tarelAguaPages: MangaPage[] = [
  { id: "tarel_agua_portada", chapterId: "cuento1", pageNumber: 0, src: portada },
  { id: "tarel_agua_p1", chapterId: "cuento1", pageNumber: 1, src: p1 },
  { id: "tarel_agua_p2", chapterId: "cuento1", pageNumber: 2, src: p2 },
  { id: "tarel_agua_p3", chapterId: "cuento1", pageNumber: 3, src: p3 },
  { id: "tarel_agua_p4", chapterId: "cuento1", pageNumber: 4, src: p4 },
  { id: "tarel_agua_p5", chapterId: "cuento1", pageNumber: 5, src: p5 },
  { id: "tarel_agua_p6", chapterId: "cuento1", pageNumber: 6, src: p6 },
  { id: "tarel_agua_p7", chapterId: "cuento1", pageNumber: 7, src: p7 },
];
