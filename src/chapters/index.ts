import { group1, Chapter } from "./group1";
import { group2 } from "./group2";
import { group3 } from "./group3";
import { group4 } from "./group4";
import { group5 } from "./group5";
import { group6 } from "./group6";
import { cuentosList } from "./cuentos";

export const allChapters: Chapter[] = [
  ...group1,
  ...group2,
  group3[1], // cap6
  group3[0], // interludio
  ...group3.slice(2), // cap7, cap7_5, cap8
  ...group4,
  ...group5,
  ...group6
];

export { cuentosList };
export type { Chapter, Illustration } from "./group1";
