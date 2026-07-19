import { parseFrontmatter, indexByChapterId } from "./loadMarkdown";

export interface Illustration {
  id: string;
  title: string;
  description: string;
}

export interface Chapter {
  id: string;
  chapterNumber?: string;
  title: string;
  subtitle?: string;
  section?: string;
  content: string; // Keep text as a string to preserve structure and formatting
  illustration?: Illustration;
  linkedChapterId?: string;
  linkedCuentosId?: string;
  featured?: boolean;
  // English translations (optional; when absent, the Spanish original is shown with a pending-translation notice)
  titleEn?: string;
  subtitleEn?: string;
  sectionEn?: string;
  contentEn?: string;
  // Extra fields for Reconstrucción tabbed content
  narrativa?: string;
  ensayo?: string;
  poema?: string;
  cierre?: string;
  narrativaEn?: string;
  ensayoEn?: string;
  poemaEn?: string;
  cierreEn?: string;
}

// The actual essay text lives in standalone .md files under /content/ensayo —
// edit those by hand. Each groupN.ts file only defines its slice of the
// reading order and assembles the Chapter objects at load time. All group
// files share the same /content/ensayo pool since the split into
// group1..group6 is purely a code-organization artifact, not a content one.

const esModules = import.meta.glob("/content/ensayo/*.es.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const enModules = import.meta.glob("/content/ensayo/*.en.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const esById = indexByChapterId(esModules, ".es.md");
const enById = indexByChapterId(enModules, ".en.md");

export function loadEssayChapters(order: string[]): Chapter[] {
  return order.map((id) => {
    const esRaw = esById.get(id);
    if (!esRaw) {
      throw new Error(`Missing content/ensayo/${id}.es.md`);
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
}

const ORDER = ["cap0", "prologo", "tarel", "cap1"];

export const group1: Chapter[] = loadEssayChapters(ORDER);
