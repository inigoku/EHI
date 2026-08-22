import { Chapter } from "./group1";
import { parseFrontmatter, indexByChapterId } from "./loadMarkdown";

// "Edición Joven": a standalone, simplified retelling of the book's core
// ideas for ~13-year-old readers. The actual text lives in standalone .md
// files under /content/joven — edit those by hand. This file only defines
// the reading order and assembles the Chapter objects at load time, mirroring
// cuentos.ts. Spanish-only for now (no .en.md counterparts yet); the reader
// falls back to the Spanish text with a pending-translation notice, same as
// any other chapter without an English version.

const esModules = import.meta.glob("/content/joven/*.es.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const esById = indexByChapterId(esModules, ".es.md");

const ORDER = ["joven1", "joven2", "joven3", "joven4", "joven5", "joven6", "joven7"];

export const jovenList: Chapter[] = ORDER.map((id) => {
  const esRaw = esById.get(id);
  if (!esRaw) {
    throw new Error(`Missing content/joven/${id}.es.md`);
  }
  const es = parseFrontmatter(esRaw);

  const chapter: Chapter = {
    id,
    title: es.data.title,
    content: es.content,
  };

  if (es.data.subtitle) chapter.subtitle = es.data.subtitle;
  if (es.data.chapterNumber) chapter.chapterNumber = es.data.chapterNumber;

  if (es.data.illustrationId) {
    chapter.illustration = {
      id: es.data.illustrationId,
      title: es.data.illustrationTitle || "",
      description: es.data.illustrationDescription || "",
    };
  }

  return chapter;
});
