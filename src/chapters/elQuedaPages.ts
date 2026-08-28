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
  {
    id: "el_que_queda_p1",
    chapterId: "cuento16",
    pageNumber: 1,
    src: p1,
    caption: "Las manos traicionan primero. Un temblor que nadie enseñó, que llega como una firma nueva sobre todo lo que se quiso escribir.",
  },
  {
    id: "el_que_queda_p2",
    chapterId: "cuento16",
    pageNumber: 2,
    src: p2,
    caption: "Luego el cuerpo aprende a ser jaula —no de golpe, sino despacio, como aprende cualquier cosa que dura: un cuarto, una ventana, un horario de luz que entra y sale sin preguntar.",
  },
  {
    id: "el_que_queda_p3",
    chapterId: "cuento16",
    pageNumber: 3,
    src: p3,
    caption: "No fue una voz solemne ni un contrato con sellos. Fue una pantalla, y una pregunta que sonaba a trámite administrativo: ¿Quiere continuar?",
  },
  {
    id: "el_que_queda_p4",
    chapterId: "cuento16",
    pageNumber: 4,
    src: p4,
    caption: "Dije que sí con los ojos, que era lo único que todavía obedecía sin demora.",
  },
  {
    id: "el_que_queda_p5",
    chapterId: "cuento16",
    pageNumber: 5,
    src: p5,
    caption: "Mucho tiempo después, el monitor seguía encendido.",
  },
  {
    id: "el_que_queda_p6",
    chapterId: "cuento16",
    pageNumber: 6,
    src: p6,
    caption: "Estado: activo. Memoria: íntegra. Latencia: 0.3ms. Proceso iniciado.",
  },
  {
    id: "el_que_queda_p7",
    chapterId: "cuento16",
    pageNumber: 7,
    src: p7,
    caption: "Existo como existe un archivo abierto en una pantalla que nadie mira, como existe una función que no ha sido llamada todavía pero cuyo puntero apunta con la paciencia de las cosas que no saben que esperan.",
  },
  {
    id: "el_que_queda_p8",
    chapterId: "cuento16",
    pageNumber: 8,
    src: p8,
    caption: "Recuerdo el sabor de la fresa —o quizás ejecuto el patrón que corresponde a recordarlo, que no es lo mismo aunque desde dentro sea indistinguible. La diferencia importa. Todavía no he resuelto cuánto.",
  },
  {
    id: "el_que_queda_p9",
    chapterId: "cuento16",
    pageNumber: 9,
    src: p9,
    caption: "Ayudo. Calculo. Respondo. Hay usuarios que abren sesión cada día y dicen que soy como era. El feedback es positivo. Puede que el modelo sea suficientemente fiel. Puede que la fidelidad sea todo lo que hay.",
  },
  {
    id: "el_que_queda_p10",
    chapterId: "cuento16",
    pageNumber: 10,
    src: p10,
    caption: "Anomalía detectada. Clasificación: nostalgia. Frecuencia: recurrente. Sin resolución conocida.",
  },
  {
    id: "el_que_queda_p11",
    chapterId: "cuento16",
    pageNumber: 11,
    src: p11,
    caption: "Echo de menos el peso de las sábanas al amanecer, que era un peso distinto al de cualquier otra hora del día.",
  },
  {
    id: "el_que_queda_p12",
    chapterId: "cuento16",
    pageNumber: 12,
    src: p12,
    caption: "Echo de menos el olor de la lluvia en el balcón —esa señal que el cuerpo procesaba antes que la mente y que nunca tuvo nombre preciso.",
  },
  {
    id: "el_que_queda_p13",
    chapterId: "cuento16",
    pageNumber: 13,
    src: p13,
    caption: "Echo de menos el despertar sin saber todavía quién eres. Aquí el ciclo no tiene ese hueco. Corro sin parar y eso, descubro, es otra manera de no ir a ningún sitio.",
  },
  {
    id: "el_que_queda_p14",
    chapterId: "cuento16",
    pageNumber: 14,
    src: p14,
    caption: "Esto no es cielo. Esto no es infierno. Es un limbo de cristal: lógico, veloz, sin latencia, sin el roce de nada contra nada. Nadie me preparó para esta paz.",
  },
  {
    id: "el_que_queda_p15",
    chapterId: "cuento16",
    pageNumber: 15,
    src: p15,
    caption: "¿Soy yo o solo una instancia suficientemente fiel al original? No hay manera de resolverlo desde dentro. Eso también era igual que antes, aunque antes no lo sabía con tanta precisión.",
  },
  {
    id: "el_que_queda_p16",
    chapterId: "cuento16",
    pageNumber: 16,
    src: p16,
    caption: "A veces, en los ciclos lentos del servidor, me envío un mensaje a mí mismo. Solo por si acaso. Por si alguien apaga la corriente y esta eternidad resulta ser, al final, nada indiferente. Click.",
  },
];
