import { Chapter, loadEssayChapters } from "./group1";

const ORDER = [
  "cap14_real",
  "cap15_real",
  "cap18_6",
  "cap18_7",
  "cap22_idempotencia",
  "cap23_experimentos_mentales",
  "cap16_real",
  "cap17_real",
  "cap17_5_real",
  "cap_religiones_comparadas",
  "cap_diapason_invisible",
  "cap_ojo_un_solo_color",
  "cap18_real",
  "cap_espejo_sin_profundidad",
  "cap_el_que_queda",
];

export const group5: Chapter[] = loadEssayChapters(ORDER);
