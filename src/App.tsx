import React from "react";
import { allChapters, Chapter, cuentosList, poemasList, jovenList } from "./chapters";
import { Sidebar } from "./components/Sidebar";
import { ChapterContent } from "./components/ChapterContent";
import { GlossaryDrawer } from "./components/GlossaryDrawer";
import { JournalViewer } from "./components/JournalViewer";
import { ConstellationDrawer } from "./components/ConstellationDrawer";
import { LandingPage } from "./components/LandingPage";
import { ChapterMusicPlayer } from "./components/ChapterMusicPlayer";
import { PathLanding } from "./components/PathLanding";
import { MangaReader } from "./components/MangaReader";
import { mangaPages } from "./chapters/mangaPages";
import { tarelAguaPages } from "./chapters/tarelAguaPages";
import { elQuedaPages } from "./chapters/elQuedaPages";
import { phiTrampaInterruptorPages } from "./chapters/phiTrampaInterruptorPages";
import { sintonizadoresComicPages } from "./chapters/sintonizadoresComicPages";
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

  // State for reading mode: home, essay, cuentos, poemas or joven
  const [readingMode, setReadingMode] = React.useState<"home" | "essay" | "cuentos" | "poemas" | "joven">(() => {
    return (localStorage.getItem("reading_mode") as "home" | "essay" | "cuentos" | "poemas" | "joven") || "home";
  });

  // State for active reading chapter/cuento/poema/joven
  const [activeChapterId, setActiveChapterId] = React.useState<string>(() => {
    const mode = localStorage.getItem("reading_mode") || "home";
    if (mode === "cuentos") {
      return localStorage.getItem("last_read_cuento") || "cuento0";
    }
    if (mode === "poemas") {
      return localStorage.getItem("last_read_poema") || "poema0";
    }
    if (mode === "joven") {
      return localStorage.getItem("last_read_joven") || "joven1";
    }
    return localStorage.getItem("last_read_chapter") || "cap0";
  });

  // Edición Joven: manga mode (full-screen page flip through the manga art)
  // vs. texto mode (the usual sidebar + prose chapter view). Defaults to
  // manga so the book opens "como un manga de verdad" the first time.
  const [jovenViewMode, setJovenViewMode] = React.useState<"manga" | "texto">(() => {
    return (localStorage.getItem("joven_view_mode") as "manga" | "texto") || "manga";
  });

  React.useEffect(() => {
    localStorage.setItem("joven_view_mode", jovenViewMode);
  }, [jovenViewMode]);

  // One-shot ilustrado de "La costumbre del agua": una experiencia de
  // lectura completa (como el manga), pero independiente de cualquier
  // reading mode existente — se abre y se cierra con su propio flag.
  const [showTarelAguaReader, setShowTarelAguaReader] = React.useState<boolean>(false);

  // One-shot ilustrado de "El que queda": mismo patrón que el de arriba,
  // otra experiencia de lectura independiente con su propio flag.
  const [showElQueQuedaReader, setShowElQueQuedaReader] = React.useState<boolean>(false);

  // One-shot ilustrado divulgativo de "La trampa del interruptor" (cap1 del
  // ensayo): mismo patrón que los dos anteriores, flag independiente.
  const [showPhiTrampaInterruptorReader, setShowPhiTrampaInterruptorReader] = React.useState<boolean>(false);

  // One-shot ilustrado (línea clara, cómic de varias viñetas) de "Los
  // sintonizadores": mismo patrón que los tres anteriores, flag independiente.
  const [showSintonizadoresComicReader, setShowSintonizadoresComicReader] = React.useState<boolean>(false);

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
  const [isConstellationOpen, setIsConstellationOpen] = React.useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);

  // Path Landing states
  const [visitedModes, setVisitedModes] = React.useState<Record<string, boolean>>({});
  const [activePathLanding, setActivePathLanding] = React.useState<"essay" | "cuentos" | "poemas" | "joven" | null>(null);
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
    } else if (readingMode === "joven") {
      localStorage.setItem("last_read_joven", activeChapterId);
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
    return jovenList;
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

  // Switch between Ensayo, Cuentos, Poemas y Joven, trying to preserve position via links
  const handleModeChange = (newMode: "home" | "essay" | "cuentos" | "poemas" | "joven") => {
    if (newMode === readingMode) return;

    let targetId = "cap0";
    if (newMode === "cuentos") targetId = "cuento0";
    if (newMode === "poemas") targetId = "poema0";
    if (newMode === "joven") targetId = "joven1";
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

  const handleSwitchMode = (newMode: "home" | "essay" | "cuentos" | "poemas" | "joven", targetId?: string) => {
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
      case "campo":
        return {
          bg: "bg-[#F3EEE2]",
          text: "text-[#1B2430]",
          textMuted: "text-[#1B2430]/60",
          border: "border-[#1B2430]/15",
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
      case "campo":
        return "bg-[#F3EEE2] text-[#1B2430] font-serif theme-campo-grid";
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
            else if (mode === "joven") setActiveChapterId("joven1");
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

  if (readingMode === "joven" && jovenViewMode === "manga") {
    // El modo manga es una experiencia completa en sí misma (incluida su
    // propia portada): nunca pasa por la pantalla de presentación (Path
    // Landing) de los demás modos, ni al entrar ni al volver a él desde
    // otra parte de la web.
    const storedPageId = localStorage.getItem("joven_manga_page_id");
    const storedPage = storedPageId ? mangaPages.find((p) => p.id === storedPageId) : undefined;
    const initialPageId =
      (storedPage && storedPage.chapterId === activeChapterId ? storedPage.id : undefined) ||
      mangaPages.find((p) => p.chapterId === activeChapterId)?.id ||
      mangaPages[0].id;

    return (
      <MangaReader
        pages={mangaPages}
        initialPageId={initialPageId}
        eyebrow="Edición Joven · Modo Manga"
        coverTitle="El Horizonte Interior"
        resolveChapterTitle={(chapterId) => jovenList.find((c) => c.id === chapterId)?.title}
        storageKey="joven_manga_page_id"
        onSwitchToText={(chapterId) => {
          setJovenViewMode("texto");
          setActiveChapterId(chapterId);
          setActivePathLanding(null); // Ir directo al capítulo, sin pantalla de presentación
        }}
        onExitHome={() => setReadingMode("home")}
      />
    );
  }

  if (showTarelAguaReader) {
    // One-shot ilustrado independiente: no forma parte de ningún reading
    // mode existente, así que se resuelve con su propio flag en vez de
    // sumarse a la unión de readingMode.
    const storedPageId = localStorage.getItem("tarel_agua_page_id");
    const initialPageId =
      (storedPageId && tarelAguaPages.some((p) => p.id === storedPageId) ? storedPageId : undefined) ||
      tarelAguaPages[0].id;

    return (
      <MangaReader
        pages={tarelAguaPages}
        initialPageId={initialPageId}
        eyebrow="Lecturas Ilustradas · One-shot"
        coverTitle="La costumbre del agua"
        resolveChapterTitle={() => "La costumbre del agua"}
        storageKey="tarel_agua_page_id"
        onSwitchToText={() => {
          setShowTarelAguaReader(false);
          setReadingMode("cuentos");
          setActiveChapterId("cuento1");
          setActivePathLanding(null);
        }}
        onExitHome={() => {
          setShowTarelAguaReader(false);
          setReadingMode("home");
        }}
      />
    );
  }

  if (showElQueQuedaReader) {
    // One-shot ilustrado independiente: no forma parte de ningún reading
    // mode existente, así que se resuelve con su propio flag en vez de
    // sumarse a la unión de readingMode.
    const storedPageId = localStorage.getItem("el_que_queda_page_id");
    const initialPageId =
      (storedPageId && elQuedaPages.some((p) => p.id === storedPageId) ? storedPageId : undefined) ||
      elQuedaPages[0].id;

    return (
      <MangaReader
        pages={elQuedaPages}
        initialPageId={initialPageId}
        eyebrow="Lecturas Ilustradas · One-shot"
        coverTitle="El que queda"
        resolveChapterTitle={() => "El que queda"}
        storageKey="el_que_queda_page_id"
        onSwitchToText={() => {
          setShowElQueQuedaReader(false);
          setReadingMode("cuentos");
          setActiveChapterId("cuento16");
          setActivePathLanding(null);
        }}
        onExitHome={() => {
          setShowElQueQuedaReader(false);
          setReadingMode("home");
        }}
      />
    );
  }

  if (showPhiTrampaInterruptorReader) {
    // One-shot ilustrado independiente: no forma parte de ningún reading
    // mode existente, así que se resuelve con su propio flag en vez de
    // sumarse a la unión de readingMode.
    const storedPageId = localStorage.getItem("phi_ti_page_id");
    const initialPageId =
      (storedPageId && phiTrampaInterruptorPages.some((p) => p.id === storedPageId) ? storedPageId : undefined) ||
      phiTrampaInterruptorPages[0].id;

    return (
      <MangaReader
        pages={phiTrampaInterruptorPages}
        initialPageId={initialPageId}
        eyebrow="Lecturas Ilustradas · One-shot"
        coverTitle="La trampa del interruptor"
        resolveChapterTitle={() => "La trampa del interruptor"}
        storageKey="phi_ti_page_id"
        onSwitchToText={() => {
          setShowPhiTrampaInterruptorReader(false);
          setReadingMode("essay");
          setActiveChapterId("cap1");
          setActivePathLanding(null);
        }}
        onExitHome={() => {
          setShowPhiTrampaInterruptorReader(false);
          setReadingMode("home");
        }}
      />
    );
  }

  if (showSintonizadoresComicReader) {
    // One-shot ilustrado independiente: no forma parte de ningún reading
    // mode existente, así que se resuelve con su propio flag en vez de
    // sumarse a la unión de readingMode.
    const storedPageId = localStorage.getItem("sint_comic_page_id");
    const initialPageId =
      (storedPageId && sintonizadoresComicPages.some((p) => p.id === storedPageId) ? storedPageId : undefined) ||
      sintonizadoresComicPages[0].id;

    return (
      <MangaReader
        pages={sintonizadoresComicPages}
        initialPageId={initialPageId}
        eyebrow="Lecturas Ilustradas · One-shot"
        coverTitle="Los sintonizadores"
        resolveChapterTitle={() => "Los sintonizadores"}
        storageKey="sint_comic_page_id"
        onSwitchToText={() => {
          setShowSintonizadoresComicReader(false);
          setReadingMode("cuentos");
          setActiveChapterId("cuento_sintonizadores");
          setActivePathLanding(null);
        }}
        onExitHome={() => {
          setShowSintonizadoresComicReader(false);
          setReadingMode("home");
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
            {readingMode === "essay" ? t.header.sectionEssay : readingMode === "cuentos" ? t.header.sectionCuentos : readingMode === "poemas" ? t.header.sectionPoemas : t.header.sectionJoven}
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
                  : ""
              }</strong></>
            ) : (
              <>{t.header.part}: <strong className={`font-semibold ${themeColors.text}`}>{activeChapter.chapterNumber} {t.header.of} {jovenList.length}</strong></>
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
          jovenViewMode={jovenViewMode}
          onJovenViewModeChange={setJovenViewMode}
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
              onOpenConstellation={() => setIsConstellationOpen(true)}
              onOpenIllustratedOneShot={() => setShowTarelAguaReader(true)}
              onOpenElQueQuedaOneShot={() => setShowElQueQuedaReader(true)}
              onOpenPhiTrampaInterruptorOneShot={() => setShowPhiTrampaInterruptorReader(true)}
              onOpenSintonizadoresComicOneShot={() => setShowSintonizadoresComicReader(true)}
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

      <ConstellationDrawer
        isOpen={isConstellationOpen}
        onClose={() => setIsConstellationOpen(false)}
        theme={theme}
        language={language}
        currentChapterId={activeChapterId}
        onSelectChapter={(id, mode) => handleSwitchMode(mode, id)}
      />

      <ChapterMusicPlayer readingMode={readingMode} volume={volume} isMuted={isMuted} />
    </div>
  );
}
