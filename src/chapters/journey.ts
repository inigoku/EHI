import { Chapter } from "./group1";
import { allChapters } from "./index";
import { cuentosList } from "./cuentos";
import { poemasList } from "./poemas";

// ─────────────────────────────────────────────────────────────────────────────
// RECORRIDO GUIADO: ENSAYO → CUENTO → POEMA
//
// Este archivo define la correspondencia entre cada cuento y su poema dentro
// del recorrido temático de la obra. El enlace ensayo → cuento ya existe en el
// frontmatter de cada capítulo (`linkedCuentosId`) y el enlace cuento → ensayo
// en el de cada cuento (`linkedChapterId`); aquí se añade el tercer eslabón.
//
// Para cambiar una correspondencia, edita el id del poema junto al cuento.
// Para que un cuento no proponga poema, elimina su línea del mapa.
// ─────────────────────────────────────────────────────────────────────────────

export const cuentoToPoema: Record<string, string> = {
  cuento0: "poema_recon1",            // EL HORIZONTE INTERIOR → LA ARQUITECTURA QUE EMERGE
  cuento1: "poema_arq6",              // LA COSTUMBRE DEL AGUA → EL REMO
  cuento2: "poema_arq5",              // LA BURBUJA QUE NO ANUNCIÓ SU CIERRE → LA BURBUJA
  cuento3: "poema_recon3",            // EL NIÑO QUE APRENDIÓ A MEDIR EL TIEMPO → EL PESO DE LA LUZ
  cuento4: "poema_recon2",            // LA RED DE LOS NOMBRES → LA FORMA QUE VUELVE
  cuento5: "poema_recon4",            // LA CASA QUE RESPIRABA → LA TENSIÓN QUE SE ABRE
  cuento6: "poema_arq7",              // LA MÁQUINA QUE APRENDÍA A ESPERAR → EL TEMBLOR
  cuento7: "poema_recon6",            // EL HUÉSPED EN LA PIEL → EL RECONOCIMIENTO QUE UNE
  cuento8: "poema_frialdad5",         // LOS PUENTES SIN PASO → PROTOCOLO DE SALIDA
  cuento9: "poema_arq8",              // EL BORDE QUE CRUZAMOS CADA NOCHE → LA ORILLA
  cuento10: "poema_arq4",             // LA MÚSICA QUE QUEDÓ EN LA HABITACIÓN → LA CANCIÓN
  cuento11: "poema_frialdad6",        // EL QUE TOCA LA CUERDA DESDE LA OTRA CASA → MONTSE XXI
  cuento12: "poema_recon5",           // LA CIUDAD DE LAS PEQUEÑAS PÉRDIDAS → LA RUPTURA QUE INSISTE
  cuento12b: "poema_arq1",            // EL SEGUNDO CUADERNO → EL ARCHIVISTA
  cuento13: "poema_arq2",             // EL RELOJ DEL CUERPO → EL RELOJERO
  cuento14: "poema_frialdad3",        // LA SALA DONDE NADIE PREGUNTABA → QUEJIDO DE LA VUELTA
  cuento15: "poema_frialdad1",        // LA CASA DE LOS PERROS QUE HABLAN → CARTOGRAFÍA DEL ECO
  cuento16: "poema_frialdad2",        // EL QUE QUEDA → CANTO DE MUERTE
  cuento_ladron: "poema_glosario",    // EL LADRÓN DE INTERIORES → GLOSARIO ÍNTIMO
  cuento_luthier: "poema_arq3",       // LA TIENDA DEL LUTHIER → EL LUTHIER
  cuento_mussara: "poema_frialdad4",  // LA NIEBLA DE LA MUSSARA → VILLANCICO CIBERNÉTICO
  // cuento_sintonizadores y cuento_txiki quedan sin poema asignado (coda y caso especial).
};

// Mapa inverso: poema → cuento que lo propone en el recorrido.
export const poemaToCuento: Record<string, string> = Object.fromEntries(
  Object.entries(cuentoToPoema).map(([cuento, poema]) => [poema, cuento])
);

const localizedTitle = (chapter: Chapter | undefined, language: string): string => {
  if (!chapter) return "";
  return language === "en" && chapter.titleEn ? chapter.titleEn : chapter.title;
};

export interface JourneyDestination {
  mode: "essay" | "cuentos" | "poemas";
  id: string;
  title: string;
}

// Desde un capítulo del ensayo: el cuento que continúa el recorrido (si existe).
export function getCuentoForEssay(chapter: Chapter, language: string): JourneyDestination | null {
  if (!chapter.linkedCuentosId) return null;
  const cuento = cuentosList.find((c) => c.id === chapter.linkedCuentosId);
  if (!cuento) return null;
  return { mode: "cuentos", id: cuento.id, title: localizedTitle(cuento, language) };
}

// Desde un cuento: el poema que continúa el recorrido (si existe).
export function getPoemaForCuento(cuentoId: string, language: string): JourneyDestination | null {
  const poemaId = cuentoToPoema[cuentoId];
  if (!poemaId) return null;
  const poema = poemasList.find((p) => p.id === poemaId);
  if (!poema) return null;
  return { mode: "poemas", id: poema.id, title: localizedTitle(poema, language) };
}

// Desde un poema: el cuento del recorrido que lo originó (si existe).
export function getCuentoForPoema(poemaId: string, language: string): JourneyDestination | null {
  const cuentoId = poemaToCuento[poemaId];
  if (!cuentoId) return null;
  const cuento = cuentosList.find((c) => c.id === cuentoId);
  if (!cuento) return null;
  return { mode: "cuentos", id: cuento.id, title: localizedTitle(cuento, language) };
}

// Desde un poema: el capítulo del ensayo con el que retomar la lectura.
// Es el siguiente al capítulo vinculado al cuento que originó el poema.
export function getNextEssayForPoema(poemaId: string, language: string): JourneyDestination | null {
  const cuentoId = poemaToCuento[poemaId];
  if (!cuentoId) return null;
  const cuento = cuentosList.find((c) => c.id === cuentoId);
  if (!cuento?.linkedChapterId) return null;
  const essayIndex = allChapters.findIndex((c) => c.id === cuento.linkedChapterId);
  if (essayIndex < 0 || essayIndex >= allChapters.length - 1) return null;
  const next = allChapters[essayIndex + 1];
  return { mode: "essay", id: next.id, title: localizedTitle(next, language) };
}
