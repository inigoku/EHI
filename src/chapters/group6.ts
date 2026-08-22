import { Chapter, loadEssayChapters } from "./group1";

const ORDER = [
  "cap_calibracion",
  "cap19_real",
  "cap20_real",
  "cap20_5",
  "cap_epilogo_real",
  "cap_nota_autor",
  "cap_glosario",
  "cap_notas_referencias",
];

export const group6: Chapter[] = loadEssayChapters(ORDER);
