import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, BookOpen, Home } from "lucide-react";
import { MangaPage } from "../chapters/mangaPages";

interface MangaReaderProps {
  pages: MangaPage[];
  initialPageId: string;
  eyebrow: string;
  coverTitle: string;
  resolveChapterTitle: (chapterId: string) => string | undefined;
  storageKey: string;
  onSwitchToText: (chapterId: string) => void;
  onExitHome: () => void;
}

// Full-screen, page-by-page reader shared by every illustrated one-shot in
// the app (Edición Joven's manga, and any other page-by-page story): no
// sidebar, no chapter prose — just the pages, flipped one at a time like a
// real comic. The caller supplies the pages, the labels, and where "last
// read page" is remembered, so this component has no knowledge of any
// specific story.
export const MangaReader: React.FC<MangaReaderProps> = ({
  pages,
  initialPageId,
  eyebrow,
  coverTitle,
  resolveChapterTitle,
  storageKey,
  onSwitchToText,
  onExitHome,
}) => {
  const initialIndex = Math.max(
    0,
    pages.findIndex((p) => p.id === initialPageId)
  );
  const [index, setIndex] = React.useState<number>(initialIndex);
  const page = pages[index];
  const isCover = page.pageNumber === 0;
  const chapterTitle = resolveChapterTitle(page.chapterId);
  const totalNumberedPages = pages.filter((p) => p.pageNumber > 0).length;

  React.useEffect(() => {
    localStorage.setItem(storageKey, page.id);
  }, [page.id, storageKey]);

  const hasPrev = index > 0;
  const hasNext = index < pages.length - 1;
  const goPrev = React.useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = React.useCallback(() => setIndex((i) => Math.min(pages.length - 1, i + 1)), [pages.length]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col select-none">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 h-16 border-b border-white/10">
        <button
          onClick={onExitHome}
          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Inicio"
        >
          <Home className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-amber-500 font-bold">
            {eyebrow}
          </span>
          <span className="text-xs sm:text-sm font-display italic text-slate-200 truncate max-w-[50vw]">
            {isCover ? coverTitle : chapterTitle || ""}
          </span>
        </div>

        <button
          onClick={() => onSwitchToText(page.chapterId)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer text-[11px] font-sans font-semibold"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Modo Texto</span>
        </button>
      </header>

      {/* Page */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden px-2 py-3">
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          className="absolute left-1 sm:left-4 z-10 p-2.5 sm:p-3 rounded-full bg-slate-950/60 border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 cursor-pointer"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <AnimatePresence mode="wait">
          <motion.img
            key={page.id}
            src={page.src}
            alt={isCover ? "Portada" : `Página ${page.pageNumber}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="max-h-full max-w-full sm:max-w-[70vh] w-auto h-auto object-contain rounded-lg border border-white/10 shadow-2xl shadow-black/60"
          />
        </AnimatePresence>

        <button
          onClick={goNext}
          disabled={!hasNext}
          className="absolute right-1 sm:right-4 z-10 p-2.5 sm:p-3 rounded-full bg-slate-950/60 border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 cursor-pointer"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Footer: progress + page counter */}
      <footer className="shrink-0 flex flex-col items-center gap-2 px-6 pb-4 pt-1">
        <span className="text-[11px] font-mono text-slate-400">
          {isCover ? "Portada" : `Página ${page.pageNumber} de ${totalNumberedPages}`}
        </span>
        <div className="w-full max-w-xs h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((index + 1) / pages.length) * 100}%` }}
          />
        </div>
      </footer>
    </div>
  );
};
