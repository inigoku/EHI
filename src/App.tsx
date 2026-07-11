import React from "react";
import { allChapters, Chapter, cuentosList } from "./chapters";
import { Sidebar } from "./components/Sidebar";
import { ChapterContent } from "./components/ChapterContent";
import { GlossaryDrawer } from "./components/GlossaryDrawer";
import { JournalViewer } from "./components/JournalViewer";
import { ReadingSettings, ReadingTheme, FontSize } from "./components/ReadingSettings";
import { motion, AnimatePresence } from "motion/react";
import { Book, Compass, EyeOff, Layout } from "lucide-react";

export default function App() {
  // State for reading mode: essay or cuentos
  const [readingMode, setReadingMode] = React.useState<"essay" | "cuentos">(() => {
    return (localStorage.getItem("reading_mode") as "essay" | "cuentos") || "essay";
  });

  // State for active reading chapter/cuento
  const [activeChapterId, setActiveChapterId] = React.useState<string>(() => {
    const mode = localStorage.getItem("reading_mode") || "essay";
    if (mode === "cuentos") {
      return localStorage.getItem("last_read_cuento") || "cuento0";
    }
    return localStorage.getItem("last_read_chapter") || "cap0";
  });

  // Settings states
  const [theme, setTheme] = React.useState<ReadingTheme>(() => {
    return (localStorage.getItem("reading_theme") as ReadingTheme) || "cosmic";
  });
  const [fontSize, setFontSize] = React.useState<FontSize>(() => {
    return (localStorage.getItem("reading_font_size") as FontSize) || "base";
  });
  const [focusMode, setFocusMode] = React.useState<boolean>(() => {
    return localStorage.getItem("reading_focus_mode") === "true";
  });

  // Drawer states
  const [isGlossaryOpen, setIsGlossaryOpen] = React.useState<boolean>(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = React.useState<string | undefined>(undefined);
  const [isJournalOpen, setIsJournalOpen] = React.useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);

  // Save states to localStorage
  React.useEffect(() => {
    localStorage.setItem("reading_mode", readingMode);
  }, [readingMode]);

  React.useEffect(() => {
    if (readingMode === "cuentos") {
      localStorage.setItem("last_read_cuento", activeChapterId);
    } else {
      localStorage.setItem("last_read_chapter", activeChapterId);
    }
  }, [activeChapterId, readingMode]);

  React.useEffect(() => {
    localStorage.setItem("reading_theme", theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem("reading_font_size", fontSize);
  }, [fontSize]);

  React.useEffect(() => {
    localStorage.setItem("reading_focus_mode", String(focusMode));
  }, [focusMode]);

  // Current list of items to show in navigation and sidebar
  const currentChaptersList = React.useMemo(() => {
    return readingMode === "essay" ? allChapters : cuentosList;
  }, [readingMode]);

  // Find active chapter object
  const activeChapter = React.useMemo(() => {
    return currentChaptersList.find((c) => c.id === activeChapterId) || currentChaptersList[0];
  }, [activeChapterId, currentChaptersList]);

  // Next / Prev chapter navigation
  const activeIndex = React.useMemo(() => {
    return currentChaptersList.findIndex((c) => c.id === activeChapterId);
  }, [activeChapterId, currentChaptersList]);

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < currentChaptersList.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setActiveChapterId(currentChaptersList[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setActiveChapterId(currentChaptersList[activeIndex + 1].id);
    }
  };

  // Switch between Ensayo and Cuentos, trying to preserve position via links
  const handleModeChange = (newMode: "essay" | "cuentos") => {
    if (newMode === readingMode) return;
    
    const activeItem = currentChaptersList.find(c => c.id === activeChapterId);
    let targetId = newMode === "essay" ? "cap0" : "cuento0";
    
    if (activeItem) {
      if (newMode === "essay" && activeItem.linkedChapterId) {
        targetId = activeItem.linkedChapterId;
      } else if (newMode === "cuentos" && activeItem.linkedCuentosId) {
        targetId = activeItem.linkedCuentosId;
      }
    }
    
    setReadingMode(newMode);
    setActiveChapterId(targetId);
  };

  const handleSwitchMode = (newMode: "essay" | "cuentos", targetId?: string) => {
    setReadingMode(newMode);
    if (targetId) {
      setActiveChapterId(targetId);
    }
  };

  const handleTermClick = (termName: string) => {
    setSelectedGlossaryTerm(termName);
    setIsGlossaryOpen(true);
  };

  // Editorial colors mapping
  const themeColors = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          bg: "bg-[#F9F6F1]",
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/60",
          border: "border-[#1A1A1A]/10",
        };
      case "sepia":
        return {
          bg: "bg-[#FAF6EE]",
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/60",
          border: "border-[#2C1E11]/10",
        };
      case "cosmic":
      default:
        return {
          bg: "bg-[#0D0E12]",
          text: "text-[#E4E6EB]",
          textMuted: "text-[#E4E6EB]/60",
          border: "border-[#E4E6EB]/10",
        };
    }
  }, [theme]);

  // Get background classes for the entire page
  const getThemeBackgroundClass = () => {
    switch (theme) {
      case "paper":
        return "bg-[#F9F6F1] text-[#1A1A1A] font-serif";
      case "sepia":
        return "bg-[#FAF6EE] text-[#2C1E11] font-serif";
      case "cosmic":
      default:
        return "bg-[#0D0E12] text-[#E4E6EB] font-serif";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-serif transition-colors duration-300 ${getThemeBackgroundClass()}`}>
      {/* Top Banner (Header) - Hidden in Focus Mode or Mobile header is active */}
      <AnimatePresence>
        {!focusMode && (
          <motion.header
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`hidden lg:flex h-20 border-b ${themeColors.border} items-center justify-between px-12 z-30 shrink-0 transition-all duration-300`}
          >
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase tracking-[0.2em] font-sans font-bold ${themeColors.textMuted}`}>
                {readingMode === "essay" ? "Ensayo Interactivo" : "Antología de Cuentos"}
              </span>
              <span className="text-xl italic font-display leading-tight">
                El Horizonte Interior
              </span>
            </div>

            <div className={`flex items-center gap-6 font-sans text-xs uppercase tracking-widest ${themeColors.textMuted}`}>
              <span>Autor: <strong className={`font-semibold ${themeColors.text}`}>Í. Barrera Barceló</strong></span>
              <span className="opacity-30">|</span>
              <span>
                {readingMode === "essay" 
                  ? <>Parte: <strong className={`font-semibold ${themeColors.text}`}>{activeChapter.chapterNumber} de 20</strong></>
                  : <>Relato: <strong className={`font-semibold ${themeColors.text}`}>{activeChapter.chapterNumber || "Prólogo"} de 16</strong></>
                }
              </span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main split layout container */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Navigation Sidebar */}
        <Sidebar
          chapters={currentChaptersList}
          activeChapterId={activeChapterId}
          onChapterSelect={setActiveChapterId}
          openGlossary={() => {
            setSelectedGlossaryTerm(undefined);
            setIsGlossaryOpen(true);
          }}
          openJournal={() => setIsJournalOpen(true)}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          theme={theme}
          mode={readingMode}
          onModeChange={handleModeChange}
        />

        {/* Content reader frame */}
        <main className="flex-1 p-5 sm:p-8 lg:p-12 overflow-y-auto mt-16 lg:mt-0 max-w-5xl mx-auto w-full">
          {/* Active indicator bar */}
          {focusMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bottom-6 right-6 z-40"
            >
              <button
                onClick={() => setFocusMode(false)}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Layout className="w-4 h-4" />
                Mostrar Menú
              </button>
            </motion.div>
          )}

          {/* Book Content view */}
          <ChapterContent
            chapter={activeChapter}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onTermClick={handleTermClick}
            theme={theme}
            fontSize={fontSize}
            readingMode={readingMode}
            onSwitchMode={handleSwitchMode}
          />

          {/* Reader config floating side box - Hidden in focus mode */}
          <AnimatePresence>
            {!focusMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-12 max-w-sm mx-auto"
              >
                <ReadingSettings
                  theme={theme}
                  setTheme={setTheme}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  focusMode={focusMode}
                  setFocusMode={setFocusMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Drawers and modals */}
      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        selectedTermName={selectedGlossaryTerm}
        theme={theme}
      />

      <JournalViewer
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        chapters={currentChaptersList}
        onChapterSelect={setActiveChapterId}
        theme={theme}
      />
    </div>
  );
}
