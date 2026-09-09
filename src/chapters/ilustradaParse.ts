import { Chapter } from "./group1";

// Trocea el markdown de la Edición Ilustrada (edicion_ilustrada/*.md, la
// misma fuente de la que salen su epub, docx y pdf) en capítulos para la web:
// cada "# Parte" es una sección del índice y cada "## Título" un capítulo;
// los "### Subtítulos" (cuentos y poemas intercalados) se quedan dentro del
// capítulo que los contiene, como en el libro impreso.
//
// Las láminas (`![Pie](images/archivo.jpg)`) se traducen al marcador de
// ilustración que ya entiende ChapterContent (`## [ILUSTRACIÓN id: "Pie"]`),
// con id `ilu_<archivo>`; IllustrationViewer resuelve esos ids contra
// edicion_ilustrada/images. La lámina de apertura de cada parte se adjunta al
// primer capítulo de esa parte.

const IMG_RE = /^!\[([^\]]*)\]\(images\/([^)]+?)\.(?:jpe?g|png)\)(\{[^}]*\})?\s*$/;

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function imageMarker(caption: string, file: string): string {
  const safeCaption = caption.replace(/"/g, "'").trim() || file;
  return `## [ILUSTRACIÓN ilu_${file.replace(/[^\w]/g, "_")}: "${safeCaption}"]`;
}

export function parseIlustradaMarkdown(raw: string): Chapter[] {
  // Salta la cabecera YAML del documento.
  let body = raw;
  const fm = body.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (fm) body = body.slice(fm[0].length);

  const chapters: Chapter[] = [];
  let section: string | undefined;
  let pendingPartLines: string[] = []; // lámina/portadilla de la parte, antes del primer ##
  let current: { title: string; lines: string[] } | null = null;
  const usedIds = new Set<string>();

  const flush = () => {
    if (!current) return;
    let id = `ilustrada_${slugify(current.title)}`;
    let n = 2;
    while (usedIds.has(id)) id = `ilustrada_${slugify(current.title)}_${n++}`;
    usedIds.add(id);
    const content = current.lines.join("\n").replace(/^\n+/, "").replace(/\n+$/, "");
    chapters.push({
      id,
      chapterNumber: String(chapters.length + 1),
      title: current.title.toUpperCase(),
      section,
      content,
    });
    current = null;
  };

  for (const rawLine of body.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (line.startsWith("# ")) {
      flush();
      section = line.slice(2).trim();
      pendingPartLines = [];
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      current = { title: line.slice(3).trim(), lines: [...pendingPartLines] };
      pendingPartLines = [];
      continue;
    }
    const img = line.match(IMG_RE);
    const out = img ? imageMarker(img[1], img[2]) : line;
    if (current) current.lines.push(out);
    else if (section) {
      // Antes del primer capítulo de una parte: lámina de apertura y filetes.
      // La portada y la portadilla del libro (sin sección) no se muestran.
      if (img || line.trim() === "---" || line.trim() === "") pendingPartLines.push(out);
    }
  }
  flush();
  return chapters;
}
