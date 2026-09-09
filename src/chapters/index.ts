import { group1, Chapter } from "./group1";
import { group2 } from "./group2";
import { group3 } from "./group3";
import { group4 } from "./group4";
import { group5 } from "./group5";
import { lecturasTopologicas } from "./lecturas";
import { group6 } from "./group6";
import { group7 } from "./group7";
import { apendices } from "./apendices";
import { cuentosList } from "./cuentos";
import { poemasList } from "./poemas";
import { jovenList } from "./joven";

// Orden del libro: los arrays de cada archivo ya están en orden de lectura.
// group7 son las cuatro Variaciones de cámara, tras el epílogo (group6); el
// aparato final consolidado (apendices) cierra el libro entero.
export const allChapters: Chapter[] = [
  ...group1,
  ...group2,
  ...group3,
  ...group4,
  ...group5,
  ...lecturasTopologicas,
  ...group6,
  ...group7,
  ...apendices
];

export { cuentosList, poemasList, lecturasTopologicas, jovenList };

// Las variaciones de cámara llevan como chapterNumber su numeral romano
// (VII, VIII, IX, X): no son capítulos numerados ("12") ni etiquetas de
// aparato ("Epílogo", "Glosario"), y la web las etiqueta como "Variación N".
export const isRomanNumeral = (n?: string): boolean => !!n && /^[IVXLC]+$/.test(n);
export type { Chapter, Illustration } from "./group1";
