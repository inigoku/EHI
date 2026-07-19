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
  "poema_glosario",
  "poema_frialdad1",
  "poema_frialdad2",
  "poema_frialdad3",
  "poema_frialdad4",
  "poema_frialdad5",
  "poema_frialdad6",
  "poema_recon1",
  "poema_recon2",
  "poema_recon3",
  "poema_recon4",
  "poema_recon5",
  "poema_recon6",
];

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
