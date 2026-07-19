import { Chapter } from "./group1";
import { parseFrontmatter, parseSections, indexByChapterId } from "./loadMarkdown";

// The actual text lives in standalone .md files under /content/reconstruccion —
// edit those by hand. Each file holds the four Narrativa/Ensayo/Poema/Cierre
// tabs, split with "## NARRATIVA" / "## ENSAYO" / "## POEMA" / "## CIERRE"
// headers. This file only defines the reading order and assembles the
// Chapter objects at load time.

const esModules = import.meta.glob("/content/reconstruccion/*.es.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const enModules = import.meta.glob("/content/reconstruccion/*.en.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const esById = indexByChapterId(esModules, ".es.md");
const enById = indexByChapterId(enModules, ".en.md");

const ORDER = ["recon1", "recon2", "recon3", "recon4", "recon5", "recon6"];

export const reconstruccionChapters: Chapter[] = ORDER.map((id) => {
  const esRaw = esById.get(id);
  if (!esRaw) {
    throw new Error(`Missing content/reconstruccion/${id}.es.md`);
  }
  const es = parseFrontmatter(esRaw);
  const esSections = parseSections(es.content);
  const narrativa = esSections["narrativa"] || "";
  const ensayo = esSections["ensayo"] || "";
  const poema = esSections["poema"] || "";
  const cierre = esSections["cierre"] || "";

  const chapter: Chapter = {
    id,
    chapterNumber: es.data.chapterNumber,
    title: es.data.title,
    section: es.data.section,
    content: [narrativa, ensayo, poema, cierre].join("\n\n"),
    narrativa,
    ensayo,
    poema,
    cierre,
  };

  const enRaw = enById.get(id);
  if (enRaw) {
    const en = parseFrontmatter(enRaw);
    const enSections = parseSections(en.content);
    chapter.titleEn = en.data.title;
    chapter.sectionEn = en.data.section;
    chapter.narrativaEn = enSections["narrativa"] || "";
    chapter.ensayoEn = enSections["ensayo"] || "";
    chapter.poemaEn = enSections["poema"] || "";
    chapter.cierreEn = enSections["cierre"] || "";
    chapter.contentEn = [chapter.narrativaEn, chapter.ensayoEn, chapter.poemaEn, chapter.cierreEn].join("\n\n");
  }

  return chapter;
});
