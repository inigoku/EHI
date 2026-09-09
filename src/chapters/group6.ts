import { Chapter, loadEssayChapters } from "./group1";

// CUARTA PARTE: el límite del experimento, hasta el epílogo. El aparato
// final (nota del autor, glosario, notas y referencias) va en apendices.ts,
// después de las variaciones de cámara, porque cubre también a estas.
const ORDER = ["cap19_real", "cap_religiones_comparadas", "cap20_real", "cap_epilogo_real"];

export const group6: Chapter[] = loadEssayChapters(ORDER);
