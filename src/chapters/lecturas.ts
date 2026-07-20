import { Chapter } from "./group1";
import { parseFrontmatter, indexByChapterId } from "./loadMarkdown";

// The actual text lives in standalone .md files under /content/lecturas —
// edit those by hand. This file only defines the reading order and assembles
// the Chapter objects at load time.

const esModules = import.meta.glob("/content/lecturas/*.es.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const enModules = import.meta.glob("/content/lecturas/*.en.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const esById = indexByChapterId(esModules, ".es.md");
const enById = indexByChapterId(enModules, ".en.md");

const ORDER = [
  "cap17_6_real",
  "cap_blade_runner",
  "cap17_7_alien",
  "cap_three_body",
  "cap17_8_cosmic",
  "cap_matrix",
  "cap_cartografia_singularidades",
];

export const lecturasTopologicas: Chapter[] = ORDER.map((id) => {
  const esRaw = esById.get(id);
  if (!esRaw) {
    throw new Error(`Missing content/lecturas/${id}.es.md`);
  }
  const es = parseFrontmatter(esRaw);

  const chapter: Chapter = {
    id,
    title: es.data.title,
    content: es.content,
  };

  if (es.data.subtitle) chapter.subtitle = es.data.subtitle;
  if (es.data.section) chapter.section = es.data.section;
  if (es.data.chapterNumber) chapter.chapterNumber = es.data.chapterNumber;
  if (es.data.linkedCuentosId) chapter.linkedCuentosId = es.data.linkedCuentosId;

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
    if (en.data.subtitle) chapter.subtitleEn = en.data.subtitle;
    if (en.data.section) chapter.sectionEn = en.data.section;
    chapter.contentEn = en.content;
  }

  return chapter;
});
