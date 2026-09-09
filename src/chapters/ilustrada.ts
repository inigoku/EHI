import { Chapter } from "./group1";
import { parseIlustradaMarkdown } from "./ilustradaParse";

// EDICIÓN ILUSTRADA: la versión condensada e ilustrada del libro, publicada
// como epub/docx/pdf desde edicion_ilustrada/. La web la lee directamente de
// ese mismo markdown para que las dos no puedan desincronizarse: editar
// edicion_ilustrada/El_Horizonte_Interior_Edicion_Ilustrada.md actualiza a la
// vez el libro y la app.

const modules = import.meta.glob("/edicion_ilustrada/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const raw = Object.values(modules)[0];
if (!raw) {
  throw new Error("Missing edicion_ilustrada/*.md");
}

export const ilustradaList: Chapter[] = parseIlustradaMarkdown(raw);
