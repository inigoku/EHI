import React from "react";
import { allChapters, Chapter, cuentosList, poemasList, reconstruccionChapters } from "./chapters";
import { Sidebar } from "./components/Sidebar";
import { ChapterContent } from "./components/ChapterContent";
import { GlossaryDrawer } from "./components/GlossaryDrawer";
import { JournalViewer } from "./components/JournalViewer";
import { LandingPage } from "./components/LandingPage";
import { ChapterMusicPlayer } from "./components/ChapterMusicPlayer";
import { PathLanding } from "./components/PathLanding";
import { ReadingTheme, FontSize } from "./components/ReadingSettings";
import { Language, uiStrings, getInitialLanguage, persistLanguage } from "./i18n";
import { LanguageToggle } from "./components/LanguageToggle";
import { HeaderControls } from "./components/HeaderControls";
import { useAudioPrefs } from "./hooks/useAudioPrefs";

export default function App() {
  // Language state: defaults to browser language, remembers manual choice
  const [language, setLanguage] = React.useState<Language>(() => getInitialLanguage());
  const t = uiStrings[language];

  React.useEffect(() => {
    persistLanguage(language);
  }, [language]);

  // State for reading mode: home, essay, cuentos, poemas or reconstruccion
  const [readingMode, setReadingMode] = React.useState<"home" | "essay" | "cuentos" | "poemas" | "reconstruccion">(() => {
    return (localStorage.getItem("reading_mode") as "home" | "essay" | "cuentos" | "poemas" | "reconstruccion") || "home";
  });

  // State for active reading chapter/cuento/poema/reconstruccion
  const [activeChapterId, setActiveChapterId] = React.useState<string>(() => {
    const mode = localStorage.getItem("reading_mode") || "home";
    if (mode === "cuentos") {
      return localStorage.getItem("last_read_cuento") || "cuento0";
    }
    if (mode === "poemas") {
      return localStorage.getItem("last_read_poema") || "poema0";
    }
    if (mode === "reconstruccion") {
      return localStorage.getItem("last_read_reconstruccion") || "recon1";
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
  const { volume, setVolume, isMuted, toggleMute } = useAudioPrefs();

  // Drawer states
  const [isGlossaryOpen, setIsGlossaryOpen] = React.useState<boolean>(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = React.useState<string | undefined>(undefined);
  const [isJournalOpen, setIsJournalOpen] = React.useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);

  // Path Landing states
  const [visitedModes, setVisitedModes] = React.useState<Record<string, boolean>>({});
  const [activePathLanding, setActivePathLanding] = React.useState<"essay" | "cuentos" | "poemas" | "reconstruccion" | null>(null);
  const [landingPageNum, setLandingPageNum] = React.useState<number>(0);

  // Save states to localStorage
  React.useEffect(() => {
    localStorage.setItem("reading_mode", readingMode);
  }, [readingMode]);

  React.useEffect(() => {
    if (readingMode === "cuentos") {
      localStorage.setItem("last_read_cuento", activeChapterId);
    } else if (readingMode === "poemas") {
      localStorage.setItem("last_read_poema", activeChapterId);
    } else if (readingMode === "reconstruccion") {
      localStorage.setItem("last_read_reconstruccion", activeChapterId);
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

  // Current list of items to show in navigation and sidebar
  const currentChaptersList = React.useMemo(() => {
    if (readingMode === "essay" || readingMode === "home") return allChapters;
    if (readingMode === "cuentos") return cuentosList;
    if (readingMode === "poemas") return poemasList;
    return reconstruccionChapters;
  }, [readingMode]);

  // Count of essay/lecturas chapters with a purely numeric chapterNumber, for
  // the "PART: N of TOTAL" header — computed instead of hardcoded so it never
  // goes stale as chapters are added, moved, or renumbered.
  const numberedEssayChapterCount = React.useMemo(() => {
    return allChapters.filter((c) => c.chapterNumber && !isNaN(Number(c.chapterNumber))).length;
  }, []);

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

  // Switch between Ensayo, Cuentos, Poemas and Reconstrucción, trying to preserve position via links
  const handleModeChange = (newMode: "home" | "essay" | "cuentos" | "poemas" | "reconstruccion") => {
    if (newMode === readingMode) return;
    
    let targetId = "cap0";
    if (newMode === "cuentos") targetId = "cuento0";
    if (newMode === "poemas") targetId = "poema0";
    if (newMode === "reconstruccion") targetId = "recon1";
    if (newMode === "home") targetId = "cap0";
    
    const activeItem = currentChaptersList.find(c => c.id === activeChapterId);
    if (activeItem) {
      if (newMode === "essay" && activeItem.linkedChapterId) {
        targetId = activeItem.linkedChapterId;
      } else if (newMode === "cuentos" && activeItem.linkedCuentosId) {
        targetId = activeItem.linkedCuentosId;
      }
    }
    
    setReadingMode(newMode);
    setActiveChapterId(targetId);

    // Activación desde menú: siempre va a la landing correspondiente
    if (newMode !== "home") {
      setActivePathLanding(newMode);
      setVisitedModes(prev => ({ ...prev, [newMode]: true }));
    } else {
      setActivePathLanding(null);
      setLandingPageNum(0);
    }
  };

  const handleSwitchMode = (newMode: "home" | "essay" | "cuentos" | "poemas" | "reconstruccion", targetId?: string) => {
    setReadingMode(newMode);
    if (newMode !== "home") {
      setVisitedModes(prev => ({ ...prev, [newMode]: true }));
      setActivePathLanding(null); // Omitir Landing al usar enlaces directos dentro del texto
    } else {
      setActivePathLanding(null);
    }
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

  if (readingMode === "home") {
    return (
      <LandingPage
        theme={theme}
        language={language}
        setLanguage={setLanguage}
        initialPage={landingPageNum}
        onStartReading={(mode, chapterId) => {
          setReadingMode(mode);
          setVisitedModes(prev => ({ ...prev, [mode]: true }));
          if (chapterId) {
            // Enlace directo a una pieza concreta (p. ej. palabras flotantes):
            // ir directamente al texto, sin pasar por el landing del camino.
            setActiveChapterId(chapterId);
            setActivePathLanding(null);
          } else {
            setActivePathLanding(mode); // Activar landing al entrar solo al modo
            if (mode === "essay") setActiveChapterId("cap0");
            else if (mode === "cuentos") setActiveChapterId("cuento0");
            else if (mode === "poemas") setActiveChapterId("poema0");
            else if (mode === "reconstruccion") setActiveChapterId("recon1");
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        openGlossary={() => {
          setReadingMode("essay");
          setSelectedGlossaryTerm(undefined);
          setIsGlossaryOpen(true);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-serif transition-colors duration-300 ${getThemeBackgroundClass()}`}>
      {/* Top Banner (Header) - fixed, always visible (doesn't scroll with the text) */}
      <header
        className={`hidden lg:flex fixed top-0 left-0 lg:left-80 right-0 h-20 border-b ${themeColors.border} ${themeColors.bg} items-center justify-between px-12 z-30 shrink-0 transition-colors duration-300`}
      >
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase tracking-[0.2em] font-sans font-bold ${themeColors.textMuted}`}>
            {readingMode === "essay" ? t.header.sectionEssay : readingMode === "cuentos" ? t.header.sectionCuentos : readingMode === "poemas" ? t.header.sectionPoemas : t.header.sectionReconstruccion}
          </span>
          <span className="text-xl italic font-display leading-tight">
            {t.header.bookTitle}
          </span>
        </div>

        <div className={`flex items-center gap-6 font-sans text-xs uppercase tracking-widest ${themeColors.textMuted}`}>
          <span>{t.header.author}: <strong className={`font-semibold ${themeColors.text}`}>Í. Barrera Barceló</strong></span>
          <span className="opacity-30">|</span>
          <span>
            {readingMode === "essay" ? (
              activeChapter.chapterNumber ? (
                !isNaN(Number(activeChapter.chapterNumber)) ? (
                  <>{t.header.part}: <strong className={`font-semibold ${themeColors.text}`}>{activeChapter.chapterNumber} {t.header.of} {numberedEssayChapterCount}</strong></>
                ) : (
                  <><strong className={`font-semibold ${themeColors.text}`}>{activeChapter.chapterNumber}</strong></>
                )
              ) : (
                <><strong className={`font-semibold ${themeColors.text}`}>{t.header.interludio}</strong></>
              )
            ) : readingMode === "cuentos" ? (
              activeChapter.chapterNumber ? (
                !isNaN(Number(activeChapter.chapterNumber)) ? (
                  <>{t.header.story}: <strong className={`font-semibold ${themeColors.text}`}>{activeChapter.chapterNumber} {t.header.of} 18</strong></>
                ) : (
                  <><strong className={`font-semibold ${themeColors.text}`}>{activeChapter.chapterNumber}</strong></>
                )
              ) : (
                <>{t.header.story}: <strong className={`font-semibold ${themeColors.text}`}>{t.header.prologue}</strong></>
              )
            ) : readingMode === "poemas" ? (
              <>{t.header.poem}: <strong className={`font-semibold ${themeColors.text}`}>{
                activeChapterId === "poema_glosario"
                  ? t.header.glossary
                  : activeChapterId.startsWith("poema_arq")
                  ? `${t.header.link} ${activeChapterId.replace("poema_arq", "")} ${t.header.of} 8`
                  : activeChapterId.startsWith("poema_frialdad")
                  ? `${activeChapterId.replace("poema_frialdad", "")} ${t.header.of} 6`
                  : `${t.header.sectionReconstruccion} ${activeChapterId.replace("poema_recon", "")} ${t.header.of} 6`
              }</strong></>
            ) : (
              activeChapter.chapterNumber && (
                <>{t.header.sectionReconstruccion}: <strong className={`font-semibold ${themeColors.text}`}>{activeChapter.chapterNumber.replace("R", "")} {t.header.of} 6</strong></>
              )
            )}
          </span>
          <span className="opacity-30">|</span>
          <LanguageToggle language={language} setLanguage={setLanguage} variant={theme === "cosmic" ? "dark" : "light"} />
          <HeaderControls
            theme={theme}
            setTheme={setTheme}
            fontSize={fontSize}
            setFontSize={setFontSize}
            language={language}
            isMuted={isMuted}
            toggleMute={toggleMute}
            volume={volume}
            setVolume={setVolume}
            variant={theme === "cosmic" ? "dark" : "light"}
          />
        </div>
      </header>

      {/* Main split layout container */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Navigation Sidebar */}
        <Sidebar
          chapters={currentChaptersList}
          activeChapterId={activeChapterId}
          onChapterSelect={(id) => {
            setActiveChapterId(id);
            setActivePathLanding(null); // Omitir Landing al pulsar capítulo específico en Sidebar
          }}
          openGlossary={() => {
            setSelectedGlossaryTerm(undefined);
            setIsGlossaryOpen(true);
          }}
          openJournal={() => setIsJournalOpen(true)}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          theme={theme}
          setTheme={setTheme}
          fontSize={fontSize}
          setFontSize={setFontSize}
          isMuted={isMuted}
          toggleMute={toggleMute}
          volume={volume}
          setVolume={setVolume}
          mode={readingMode}
          onModeChange={handleModeChange}
          language={language}
          setLanguage={setLanguage}
        />

        {/* Content reader frame */}
        <main className="flex-1 p-5 sm:p-8 lg:p-12 pb-24 overflow-y-auto mt-16 lg:mt-20 max-w-5xl mx-auto w-full">

          {/* Book Content view or Path Landing */}
          {activePathLanding ? (
            <PathLanding
              mode={activePathLanding}
              theme={theme}
              language={language}
              onClose={() => setActivePathLanding(null)}
            />
          ) : (
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
              language={language}
            />
          )}
        </main>
      </div>

      {/* Drawers and modals */}
      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        selectedTermName={selectedGlossaryTerm}
        theme={theme}
        language={language}
      />

      <JournalViewer
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        chapters={currentChaptersList}
        onChapterSelect={setActiveChapterId}
        theme={theme}
        language={language}
      />

      <ChapterMusicPlayer readingMode={readingMode} volume={volume} isMuted={isMuted} />
    </div>
  );
}
