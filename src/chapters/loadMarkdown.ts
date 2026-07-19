// Loads chapter content from standalone, hand-editable .md files in /content
// instead of inline strings in the .ts source. Each chapter is two files,
// one per language: <id>.es.md (required) and <id>.en.md (optional — when
// absent, the reader falls back to the Spanish text with a pending-translation
// notice, same as before).
//
// Each file is a simple frontmatter block (flat "key: value" lines, one per
// line) followed by the Markdown body, e.g.:
//
//   ---
//   title: LA ARQUITECTURA CON UN HUECO — I: EL ARCHIVISTA
//   section: LA ARQUITECTURA CON UN HUECO
//   illustrationTitle: El archivista
//   illustrationDescription: Un cuaderno abierto sobre un muelle de madera...
//   ---
//
//   El agua se fue como se van...

export interface ParsedMarkdown {
  data: Record<string, string>;
  content: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// Like .trim(), but only strips leading/trailing blank *lines* — a poem line
// can legitimately end in a trailing "  " (Markdown hard break) that a plain
// .trim() would eat if it happens to be the very last line of a block.
function trimBlankLines(s: string): string {
  return s.replace(/^\n+/, "").replace(/\n[\s]*$/, "");
}

export function parseFrontmatter(raw: string): ParsedMarkdown {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { data: {}, content: trimBlankLines(raw) };
  }
  const [, frontmatter, body] = match;
  const data: Record<string, string> = {};
  for (const line of frontmatter.split("\n")) {
    const idx = line.indexOf(": ");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 2).trim();
    if (key) data[key] = value;
  }
  return { data, content: trimBlankLines(body) };
}

// Groups the raw glob-imported { path: rawText } map into { id: rawText },
// stripping the directory and the `.<lang>.md` suffix from the filename.
export function indexByChapterId(modules: Record<string, string>, suffix: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const [filePath, raw] of Object.entries(modules)) {
    const filename = filePath.split("/").pop() || filePath;
    if (!filename.endsWith(suffix)) continue;
    map.set(filename.slice(0, -suffix.length), raw);
  }
  return map;
}

// Splits a body marked up with "## SECTION" headers (used for Reconstrucción's
// Narrativa/Ensayo/Poema/Cierre tabs) into { section: text }. Section names are
// matched case-insensitively; the returned keys are lowercased.
export function parseSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = body.split(/^##\s+(\S+)\s*$/m);
  // parts[0] is any text before the first "## " header (should be empty/whitespace).
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].trim().toLowerCase();
    const text = trimBlankLines(parts[i + 1] || "");
    sections[name] = text;
  }
  return sections;
}
