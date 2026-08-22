import React from "react";
import { Chapter } from "../chapters";
import { Search, Book, PenTool, CheckCircle, Flame, Star, Menu, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ReadingSettings, ReadingTheme, FontSize } from "./ReadingSettings";
import { Language, uiStrings } from "../i18n";
import { LanguageToggle } from "./LanguageToggle";
import { HeaderControls } from "./HeaderControls";
import { findConceptualLink } from "../chapters/conceptualLinks";
// @ts-ignore
import portadaImg from "../assets/images/portada.png";

interface SidebarProps {
  chapters: Chapter[];
  activeChapterId: string;
  onChapterSelect: (id: string) => void;
  openGlossary: () => void;
  openJournal: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  theme: ReadingTheme;
  setTheme: (theme: ReadingTheme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  mode: "home" | "essay" | "cuentos" | "poemas" | "reconstruccion" | "joven";
  onModeChange: (mode: "home" | "essay" | "cuentos" | "poemas" | "reconstruccion" | "joven") => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chapters,
  activeChapterId,
  onChapterSelect,
  openGlossary,
  openJournal,
  isOpen,
  setIsOpen,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  isMuted,
  toggleMute,
  volume,
  setVolume,
  mode,
  onModeChange,
  language,
  setLanguage,
}) => {
  const t = uiStrings[language];
  const getTitle = (c: Chapter) => (language === "en" && c.titleEn ? c.titleEn : c.title);
  const getSection = (c: Chapter) => (language === "en" && c.sectionEn ? c.sectionEn : c.section);
  const getSubtitle = (c: Chapter) => (language === "en" && c.subtitleEn ? c.subtitleEn : c.subtitle);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [completedChapters, setCompletedChapters] = React.useState<string[]>([]);

  // Load completed chapters
  React.useEffect(() => {
    const handleStorageChange = () => {
      const keys = Object.keys(localStorage);
      const reflections = keys
        .filter((k) => k.startsWith("reflection_"))
        .map((k) => k.replace("reflection_", ""));
      setCompletedChapters(reflections);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    
    // Custom trigger event
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredChapters = chapters.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.titleEn?.toLowerCase().includes(q) ||
      c.subtitle?.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      c.contentEn?.toLowerCase().includes(q)
    );
  });

  const getProgressPercentage = () => {
    if (chapters.length === 0) return 0;
    return Math.round((completedChapters.length / chapters.length) * 100);
  };

  // Group chapters by section for beautiful table of contents.
  // Grouped by *contiguous run*, not by section name: if a section label
  // reappears later after another section interrupts it (e.g. an essay
  // chapter placed after the Lecturas Topológicas block but still labeled
  // with an earlier essay part), it starts a new visual group in its real
  // reading-order position instead of being merged back into the earlier
  // occurrence of that same label.
  const groupedChapters = React.useMemo(() => {
    // 1. Map every chapter ID to its resolved section name using the full, unfiltered list
    const chapterSectionMap: { [id: string]: string } = {};
    let currentSection = t.sidebar.introSection;
    chapters.forEach((c) => {
      if (getSection(c)) {
        currentSection = getSection(c)!;
      }
      chapterSectionMap[c.id] = currentSection;
    });

    // 2. Group the filtered chapters using the pre-resolved sections, starting
    // a new group whenever the section changes from the previous chapter's.
    const groups: { key: string; section: string; items: Chapter[] }[] = [];
    filteredChapters.forEach((c) => {
      const sec = chapterSectionMap[c.id] || t.sidebar.introSection;
      const last = groups[groups.length - 1];
      if (last && last.section === sec) {
        last.items.push(c);
      } else {
        groups.push({ key: `${sec}-${groups.length}`, section: sec, items: [c] });
      }
    });
    return groups;
  }, [chapters, filteredChapters, language]);

  // Progress broken down by section ("Parte"), so the reader sees which part
  // of the book they're in rather than a single undifferentiated percentage.
  const progressSegments = React.useMemo(() => {
    return groupedChapters.map((g) => ({
      key: g.key,
      section: g.section,
      done: g.items.filter((c) => completedChapters.includes(c.id)).length,
      total: g.items.length,
      isCurrent: g.items.some((c) => c.id === activeChapterId),
    }));
  }, [groupedChapters, completedChapters, activeChapterId]);

  // The active chapter's cross-referenced chapter, if any, resolved to its title.
  const seeAlsoChapter = React.useMemo(() => {
    const linkedId = findConceptualLink(activeChapterId);
    if (!linkedId) return null;
    return chapters.find((c) => c.id === linkedId) || null;
  }, [activeChapterId, chapters]);

  const handleSelectChapter = (id: string) => {
    onChapterSelect(id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  // Editorial styles mapping based on theme
  const sc = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          bg: "bg-[#F9F6F1]",
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/60",
          border: "border-[#1A1A1A]/10",
          borderBottom: "border-[#1A1A1A]/10",
          itemActive: "font-semibold bg-[#1A1A1A]/5 border-[#1A1A1A]/10 text-[#1A1A1A]",
          itemHover: "hover:bg-[#1A1A1A]/5 text-[#1A1A1A]/60 hover:text-[#1A1A1A]",
          lineActive: "bg-[#1A1A1A]",
          seeAlsoBorder: "border-[#1A1A1A]/40",
          progressBg: "bg-[#1A1A1A]/10",
          progressBar: "bg-[#1A1A1A]",
          progressBarCurrent: "bg-[#1A1A1A]/45",
          button: "bg-[#1A1A1A]/5 border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#1A1A1A]/10",
          input: "bg-[#1A1A1A]/5 border-[#1A1A1A]/10 text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:border-[#1A1A1A]/40",
          icon: "text-[#1A1A1A]/80",
        };
      case "sepia":
        return {
          bg: "bg-[#FAF6EE]",
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/60",
          border: "border-[#2C1E11]/10",
          borderBottom: "border-[#2C1E11]/10",
          itemActive: "font-semibold bg-[#2C1E11]/5 border-[#2C1E11]/10 text-[#2C1E11]",
          itemHover: "hover:bg-[#2C1E11]/5 text-[#2C1E11]/60 hover:text-[#2C1E11]",
          lineActive: "bg-[#2C1E11]",
          seeAlsoBorder: "border-[#2C1E11]/40",
          progressBg: "bg-[#2C1E11]/10",
          progressBar: "bg-amber-800",
          progressBarCurrent: "bg-amber-800/45",
          button: "bg-[#2C1E11]/5 border-[#2C1E11]/10 text-[#2C1E11] hover:bg-[#2C1E11]/10",
          input: "bg-[#2C1E11]/5 border-[#2C1E11]/10 text-[#2C1E11] placeholder-[#2C1E11]/40 focus:border-[#2C1E11]/40",
          icon: "text-amber-800",
        };
      case "campo":
        return {
          bg: "bg-[#EDE6D6]",
          text: "text-[#1B2430]",
          textMuted: "text-[#1B2430]/60",
          border: "border-[#1B2430]/20",
          borderBottom: "border-[#1B2430]/20",
          itemActive: "font-semibold bg-[#B4472A]/8 border-[#B4472A]/25 text-[#1B2430]",
          itemHover: "hover:bg-[#1B2430]/5 text-[#1B2430]/60 hover:text-[#1B2430]",
          lineActive: "bg-[#B4472A]",
          seeAlsoBorder: "border-[#B4472A]/40",
          progressBg: "bg-[#1B2430]/10",
          progressBar: "bg-[#2F6B4F]",
          progressBarCurrent: "bg-[#B4472A]",
          button: "bg-[#1B2430]/5 border-[#1B2430]/20 text-[#1B2430] hover:bg-[#1B2430]/10",
          input: "bg-[#1B2430]/5 border-[#1B2430]/20 text-[#1B2430] placeholder-[#1B2430]/40 focus:border-[#1B2430]/40",
          icon: "text-[#B4472A]",
        };
      case "cosmic":
      default:
        return {
          bg: "bg-[#0D0E12]",
          text: "text-[#E4E6EB]",
          textMuted: "text-[#E4E6EB]/60",
          border: "border-[#E4E6EB]/10",
          borderBottom: "border-[#E4E6EB]/10",
          itemActive: "font-semibold bg-[#E4E6EB]/5 border-[#E4E6EB]/10 text-[#E4E6EB]",
          itemHover: "hover:bg-[#E4E6EB]/5 text-[#E4E6EB]/60 hover:text-[#E4E6EB]",
          lineActive: "bg-amber-500",
          seeAlsoBorder: "border-amber-500/40",
          progressBg: "bg-[#E4E6EB]/10",
          progressBar: "bg-amber-500",
          progressBarCurrent: "bg-amber-500/45",
          button: "bg-[#E4E6EB]/5 border-[#E4E6EB]/10 text-[#E4E6EB] hover:bg-[#E4E6EB]/10",
          input: "bg-[#E4E6EB]/5 border-[#E4E6EB]/10 text-[#E4E6EB] placeholder-[#E4E6EB]/40 focus:border-amber-500/30",
          icon: "text-amber-500",
        };
    }
  }, [theme]);

  return (
    <>
      {/* Mobile Menu Trigger Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 ${sc.bg} border-b ${sc.border} z-40 px-5 flex items-center justify-between transition-colors duration-300`}>
        <button
          onClick={() => {
            onModeChange("home");
            setIsOpen(false);
          }}
          className="flex items-center gap-2 cursor-pointer group text-left border-0 bg-transparent p-0 outline-none"
        >
          <Book className={`w-5 h-5 ${sc.icon} group-hover:scale-110 transition-transform`} />
          <span className={`font-display font-bold text-sm tracking-wide ${sc.text} uppercase group-hover:text-amber-500 transition-colors`}>
            {t.header.bookTitle}
          </span>
        </button>
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl ${sc.button} border transition-colors cursor-pointer`}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:sticky top-16 lg:top-0 left-0 bottom-0 lg:h-screen w-full lg:w-80 ${sc.bg} border-r ${sc.border} z-40 flex flex-col transition-all duration-300 lg:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Book Header & Title (Desktop Only) */}
        <div className={`hidden lg:flex flex-col p-6 border-b ${sc.border} space-y-3`}>
          <button
            onClick={() => onModeChange("home")}
            className="flex items-center gap-3 cursor-pointer group text-left border-0 bg-transparent p-0 outline-none w-full"
          >
            <div className="w-12 h-16 rounded-md overflow-hidden border border-amber-500/20 shadow-md flex-shrink-0 bg-slate-900 group-hover:scale-105 transition-transform">
              <img src={portadaImg} alt="Portada" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <Book className={`w-3.5 h-3.5 ${sc.icon} group-hover:text-amber-500 transition-colors`} />
                <h1 className={`font-display font-bold text-sm tracking-wide ${sc.text} uppercase group-hover:text-amber-500 transition-colors`}>
                  {t.header.bookTitle}
                </h1>
              </div>
              <p className={`text-[9px] font-mono ${sc.textMuted} uppercase tracking-widest mt-0.5`}>
                {t.sidebar.byAuthor}
              </p>
            </div>
          </button>
        </div>

        {/* Progress Card */}
        <div className={`p-5 border-b ${sc.border} space-y-3`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${sc.textMuted}`}>
              {t.sidebar.readingProgress}
            </span>
            <span className={`text-xs font-mono font-bold ${sc.text}`}>{getProgressPercentage()}%</span>
          </div>
          {progressSegments.length > 1 ? (
            <div className="flex items-center gap-[3px]" title={progressSegments.map((s) => s.section).join(" · ")}>
              {progressSegments.map((seg) => (
                <div
                  key={seg.key}
                  title={`${seg.section} — ${seg.done}/${seg.total}`}
                  className={`flex-1 h-1.5 ${sc.progressBg} rounded-full overflow-hidden`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${seg.total > 0 ? (seg.done / seg.total) * 100 : 0}%` }}
                    className={`h-full rounded-full ${seg.isCurrent ? sc.progressBarCurrent : sc.progressBar}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={`w-full h-1.5 ${sc.progressBg} rounded-full overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                className={`h-full ${sc.progressBar} rounded-full`}
              />
            </div>
          )}
          <div className={`flex items-center justify-between text-[10px] ${sc.textMuted} font-sans`}>
            <span>{t.sidebar.chaptersExplored(completedChapters.length, chapters.length)}</span>
            <div className={`flex items-center gap-0.5 ${theme === "cosmic" ? "text-amber-500" : ""}`}>
              <Flame className="w-3 h-3" />
              <span className="font-semibold">{t.sidebar.activeReader}</span>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className={`px-5 py-3 border-b ${sc.border} flex items-center justify-between`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider ${sc.textMuted}`}>
            {t.sidebar.readingMode}
          </span>
          <div className="flex bg-slate-950/40 p-0.5 rounded-lg border border-amber-500/10 flex-wrap gap-0.5 max-w-[210px] justify-center">
            <button
              onClick={() => onModeChange("home")}
              className={`text-[9px] font-sans font-bold px-1.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === "home"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/15 shadow-sm"
                  : `${sc.textMuted} hover:${sc.text}`
              }`}
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => onModeChange("essay")}
              className={`text-[9px] font-sans font-bold px-1.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === "essay"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/15 shadow-sm"
                  : `${sc.textMuted} hover:${sc.text}`
              }`}
            >
              {t.nav.essay}
            </button>
            <button
              onClick={() => onModeChange("cuentos")}
              className={`text-[9px] font-sans font-bold px-1.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === "cuentos"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/15 shadow-sm"
                  : `${sc.textMuted} hover:${sc.text}`
              }`}
            >
              {t.nav.cuentos}
            </button>
            <button
              onClick={() => onModeChange("poemas")}
              className={`text-[9px] font-sans font-bold px-1.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === "poemas"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/15 shadow-sm"
                  : `${sc.textMuted} hover:${sc.text}`
              }`}
            >
              {t.nav.poemas}
            </button>
            <button
              onClick={() => onModeChange("reconstruccion")}
              className={`text-[9px] font-sans font-bold px-1.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === "reconstruccion"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/15 shadow-sm"
                  : `${sc.textMuted} hover:${sc.text}`
              }`}
            >
              {t.nav.reconstruccion}
            </button>
            <button
              onClick={() => onModeChange("joven")}
              className={`text-[9px] font-sans font-bold px-1.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === "joven"
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/15 shadow-sm"
                  : `${sc.textMuted} hover:${sc.text}`
              }`}
            >
              {t.nav.joven}
            </button>
          </div>
        </div>

        {/* Tools and triggers */}
        <div className={`px-5 py-3 border-b ${sc.border} grid grid-cols-2 gap-2`}>
          <button
            onClick={openGlossary}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border ${sc.button} active:scale-95 transition-all text-xs font-semibold cursor-pointer`}
          >
            {t.sidebar.glossary}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={openJournal}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border ${sc.button} active:scale-95 transition-all text-xs font-semibold cursor-pointer`}
          >
            <PenTool className="w-3.5 h-3.5" />
            {t.sidebar.reflections}
          </button>
        </div>

        {/* Search Bar */}
        <div className={`p-4 border-b ${sc.border}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${sc.textMuted}`} />
            <input
              type="text"
              placeholder={t.sidebar.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl py-1.5 pl-9 pr-3 text-xs ${sc.input} font-sans transition-colors outline-none`}
            />
          </div>
        </div>

        {/* Scrollable Table of Contents grouped by sections */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">

          {groupedChapters.map(({ key, section, items }) => (
            <div key={key} className="space-y-2">
              <h3 className={`text-[10px] font-sans tracking-[0.2em] ${sc.textMuted} font-bold uppercase px-2 mb-1.5 border-l ${sc.lineActive} border-l-2 pl-2`}>
                {section}
              </h3>
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = item.id === activeChapterId;
                  const isDone = completedChapters.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectChapter(item.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2 group border ${
                        isActive ? sc.itemActive : `bg-transparent border-transparent ${sc.itemHover}`
                      }`}
                    >
                      {/* Chapter completed status */}
                      {isDone ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Star
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors ${
                            isActive ? "text-amber-500/50" : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0 flex items-start gap-1.5">
                        {item.chapterNumber && item.chapterNumber !== "0" && item.id !== "prologo" && item.id !== "interludio" && (
                          <span className="shrink-0 font-display font-medium text-xs leading-normal">{item.chapterNumber}.</span>
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-display font-medium text-xs leading-normal text-left">
                            {getTitle(item)}
                          </div>
                          {isActive && (
                            <div className={`h-px w-8 ${sc.lineActive} mt-1.5`} />
                          )}
                          {item.subtitle && (
                            <div className={`text-[10px] ${sc.textMuted} font-sans mt-0.5 truncate leading-tight`}>
                              {getSubtitle(item)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {seeAlsoChapter && items.some((item) => item.id === activeChapterId) && (
                  <button
                    onClick={() => handleSelectChapter(seeAlsoChapter.id)}
                    className={`w-full text-left ml-3 pl-3 py-1.5 border-l-2 ${sc.seeAlsoBorder} flex flex-col gap-0 cursor-pointer group`}
                  >
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${sc.icon}`}>
                      {t.sidebar.seeAlso}
                    </span>
                    <span className={`text-[11px] font-display ${sc.textMuted} group-hover:opacity-80 truncate`}>
                      {getTitle(seeAlsoChapter)}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredChapters.length === 0 && (
            <div className={`text-center py-8 ${sc.textMuted} font-sans text-xs`}>
              {t.sidebar.noChaptersFound}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};
