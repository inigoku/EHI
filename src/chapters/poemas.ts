import { Chapter } from "./group1";
import { parseFrontmatter, indexByChapterId } from "./loadMarkdown";

// The actual poem text lives in standalone .md files under /content/poemas —
// edit those by hand. This file only defines the reading order and assembles
// the Chapter objects at load time.

const esModules = import.meta.glob("/content/poemas/*.es.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const enModules = import.meta.glob("/content/poemas/*.en.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const esById = indexByChapterId(esModules, ".es.md");
const enById = indexByChapterId(enModules, ".en.md");

const ORDER = [
  "poema_arq1",
  "poema_arq2",
  "poema_arq3",
  "poema_arq4",
  "poema_arq5",
  "poema_arq6",
  "poema_arq7",
  "poema_arq8",
  "poema_frialdad1",
  "poema_frialdad2",
  "poema_frialdad3",
  "poema_frialdad4",
  "poema_frialdad5",
  "poema_frialdad6",
  "poema_sintonizadores",
  // Poemas de las variaciones de cámara (El tiempo que no pasa, VII, VIII,
  // IX y X). "Montse XXI" (VIII) ya figura como VI de "La frialdad de una
  // ciudad apagada" y no se repite aquí.
  "poema_camara_reloj",
  "poema_camara_espejo",
  "poema_camara_manos",
  "poema_camara_coro",
  "poema_camara_vecinos",
  "poema_camara_cueva",
  // El Glosario íntimo cierra la antología: glosa todos los ciclos, no solo
  // "La arquitectura con un hueco".
  "poema_glosario",
];

// Posición de un poema dentro de su ciclo ("Enlace 3 de 8", "Frialdad 7 de
// 7", "Cámara 2 de 6") para las etiquetas de cabecera y de pie de página.
// Derivada de ORDER para que no se desactualice al añadir o mover poemas.
export type PoemGroup = "arq" | "frialdad" | "camara" | "glosario";
export interface PoemPosition {
  group: PoemGroup;
  n: number;
  total: number;
}

function poemGroupOf(id: string): PoemGroup {
  if (id === "poema_glosario") return "glosario";
  if (id.startsWith("poema_arq")) return "arq";
  if (id.startsWith("poema_camara")) return "camara";
  return "frialdad"; // poema_frialdad1..6 y poema_sintonizadores (VII)
}

export function getPoemPosition(id: string): PoemPosition {
  const group = poemGroupOf(id);
  const members = ORDER.filter((x) => poemGroupOf(x) === group);
  return { group, n: members.indexOf(id) + 1, total: members.length };
}

export const poemasList: Chapter[] = ORDER.map((id) => {
  const esRaw = esById.get(id);
  if (!esRaw) {
    throw new Error(`Missing content/poemas/${id}.es.md`);
  }
  const es = parseFrontmatter(esRaw);

  const chapter: Chapter = {
    id,
    title: es.data.title,
    section: es.data.section,
    content: es.content,
  };

  if (es.data.illustrationTitle) {
    chapter.illustration = {
      id,
      title: es.data.illustrationTitle,
      description: es.data.illustrationDescription || "",
    };
  }

  const enRaw = enById.get(id);
  if (enRaw) {
    const en = parseFrontmatter(enRaw);
    chapter.titleEn = en.data.title;
    chapter.sectionEn = en.data.section;
    chapter.contentEn = en.content;
  }

  return chapter;
});
