import { Chapter } from "./group1";
import { parseFrontmatter, indexByChapterId } from "./loadMarkdown";

// The actual story text lives in standalone .md files under /content/cuentos —
// edit those by hand. This file only defines the reading order and assembles
// the Chapter objects at load time.

const esModules = import.meta.glob("/content/cuentos/*.es.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const enModules = import.meta.glob("/content/cuentos/*.en.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const esById = indexByChapterId(esModules, ".es.md");
const enById = indexByChapterId(enModules, ".en.md");

const ORDER = [
  "cuento0",
  "cuento1",
  "cuento_ladron",
  "cuento2",
  "cuento3",
  "cuento_luthier",
  "cuento4",
  "cuento5",
  "cuento6",
  "cuento7",
  "cuento9",
  "cuento11",
  "cuento8",
  "cuento10",
  "cuento12",
  "cuento12b",
  "cuento13",
  "cuento14",
  "cuento15",
  "cuento_mussara",
  "cuento_sintonizadores",
  "cuento16",
  "cuento_txiki",
];

export const cuentosList: Chapter[] = ORDER.map((id) => {
  const esRaw = esById.get(id);
  if (!esRaw) {
    throw new Error(`Missing content/cuentos/${id}.es.md`);
  }
  const es = parseFrontmatter(esRaw);

  const chapter: Chapter = {
    id,
    title: es.data.title,
    content: es.content,
  };

  if (es.data.subtitle) chapter.subtitle = es.data.subtitle;
  if (es.data.chapterNumber) chapter.chapterNumber = es.data.chapterNumber;
  if (es.data.linkedChapterId) chapter.linkedChapterId = es.data.linkedChapterId;
  if (es.data.featured === "true") chapter.featured = true;

  if (es.data.illustrationId) {
    chapter.illustration = {
      id: es.data.illustrationId,
      title: es.data.illustrationTitle || "",
      description: es.data.illustrationDescription || "",
    };
  }

  const enRaw = enById.get(id);
  if (enRaw) {
    const en = parseFrontmatter(enRaw);
    chapter.titleEn = en.data.title;
    chapter.contentEn = en.content;
  }

  return chapter;
});
