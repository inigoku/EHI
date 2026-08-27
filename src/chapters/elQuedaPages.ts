// @ts-ignore
import portada from "../assets/images/el_que_queda/portada.jpg";
// @ts-ignore
import p1 from "../assets/images/el_que_queda/pagina1.jpg";
// @ts-ignore
import p2 from "../assets/images/el_que_queda/pagina2.jpg";
// @ts-ignore
import p3 from "../assets/images/el_que_queda/pagina3.jpg";
// @ts-ignore
import p4 from "../assets/images/el_que_queda/pagina4.jpg";
// @ts-ignore
import p5 from "../assets/images/el_que_queda/pagina5.jpg";
// @ts-ignore
import p6 from "../assets/images/el_que_queda/pagina6.jpg";
// @ts-ignore
import p7 from "../assets/images/el_que_queda/pagina7.jpg";
// @ts-ignore
import p8 from "../assets/images/el_que_queda/pagina8.jpg";
// @ts-ignore
import p9 from "../assets/images/el_que_queda/pagina9.jpg";
// @ts-ignore
import p10 from "../assets/images/el_que_queda/pagina10.jpg";
// @ts-ignore
import p11 from "../assets/images/el_que_queda/pagina11.jpg";
// @ts-ignore
import p12 from "../assets/images/el_que_queda/pagina12.jpg";
// @ts-ignore
import p13 from "../assets/images/el_que_queda/pagina13.jpg";
// @ts-ignore
import p14 from "../assets/images/el_que_queda/pagina14.jpg";
// @ts-ignore
import p15 from "../assets/images/el_que_queda/pagina15.jpg";
// @ts-ignore
import p16 from "../assets/images/el_que_queda/pagina16.jpg";

import { MangaPage } from "./mangaPages";

// One-shot ilustrado de "El que queda" (content/cuentos/cuento16.es.md).
// Reutiliza la misma interfaz MangaPage y el mismo lector a página completa
// (MangaReader) que Edición Joven y "La costumbre del agua": portada +
// 16 láminas, tinta y acuarela en paleta fría índigo/gris.
export const elQuedaPages: MangaPage[] = [
  { id: "el_que_queda_portada", chapterId: "cuento16", pageNumber: 0, src: portada },
  { id: "el_que_queda_p1", chapterId: "cuento16", pageNumber: 1, src: p1 },
  { id: "el_que_queda_p2", chapterId: "cuento16", pageNumber: 2, src: p2 },
  { id: "el_que_queda_p3", chapterId: "cuento16", pageNumber: 3, src: p3 },
  { id: "el_que_queda_p4", chapterId: "cuento16", pageNumber: 4, src: p4 },
  { id: "el_que_queda_p5", chapterId: "cuento16", pageNumber: 5, src: p5 },
  { id: "el_que_queda_p6", chapterId: "cuento16", pageNumber: 6, src: p6 },
  { id: "el_que_queda_p7", chapterId: "cuento16", pageNumber: 7, src: p7 },
  { id: "el_que_queda_p8", chapterId: "cuento16", pageNumber: 8, src: p8 },
  { id: "el_que_queda_p9", chapterId: "cuento16", pageNumber: 9, src: p9 },
  { id: "el_que_queda_p10", chapterId: "cuento16", pageNumber: 10, src: p10 },
  { id: "el_que_queda_p11", chapterId: "cuento16", pageNumber: 11, src: p11 },
  { id: "el_que_queda_p12", chapterId: "cuento16", pageNumber: 12, src: p12 },
  { id: "el_que_queda_p13", chapterId: "cuento16", pageNumber: 13, src: p13 },
  { id: "el_que_queda_p14", chapterId: "cuento16", pageNumber: 14, src: p14 },
  { id: "el_que_queda_p15", chapterId: "cuento16", pageNumber: 15, src: p15 },
  { id: "el_que_queda_p16", chapterId: "cuento16", pageNumber: 16, src: p16 },
];
