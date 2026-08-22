import { group1, Chapter } from "./group1";
import { group2 } from "./group2";
import { group3 } from "./group3";
import { group4 } from "./group4";
import { group5 } from "./group5";
import { lecturasTopologicas } from "./lecturas";
import { group6 } from "./group6";
import { reconstruccionChapters } from "./reconstruccion";
import { cuentosList } from "./cuentos";
import { poemasList } from "./poemas";
import { jovenList } from "./joven";

// Orden del libro: los arrays de cada archivo ya están en orden de lectura.
export const allChapters: Chapter[] = [
  ...group1,
  ...group2,
  ...group3,
  ...group4,
  ...group5,
  ...lecturasTopologicas,
  ...group6
];

export { cuentosList, poemasList, reconstruccionChapters, lecturasTopologicas, jovenList };
export type { Chapter, Illustration } from "./group1";
