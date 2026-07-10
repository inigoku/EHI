import React from "react";
import { Chapter, Illustration } from "../chapters";
import { IllustrationViewer } from "./IllustrationViewer";
import { ChevronLeft, ChevronRight, PenTool, Save, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChapterContentProps {
  chapter: Chapter;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onTermClick: (termName: string) => void;
  theme: "cosmic" | "paper" | "sepia";
  fontSize: "sm" | "base" | "lg" | "xl" | "2xl";
}

export const ChapterContent: React.FC<ChapterContentProps> = ({
  chapter,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onTermClick,
  theme,
  fontSize,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [reflection, setReflection] = React.useState<string>("");
  const [isSaved, setIsSaved] = React.useState<boolean>(false);

  // Scroll to top on chapter change
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // Load saved reflection
    const saved = localStorage.getItem(`reflection_${chapter.id}`);
    setReflection(saved || "");
    setIsSaved(false);
  }, [chapter.id]);

  const saveReflection = () => {
    localStorage.setItem(`reflection_${chapter.id}`, reflection);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const clearReflection = () => {
    if (confirm("¿Estás seguro de que quieres borrar tu reflexión para este capítulo?")) {
      localStorage.removeItem(`reflection_${chapter.id}`);
      setReflection("");
    }
  };

  // Font size mapper
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm":
        return "text-xs sm:text-sm";
      case "base":
        return "text-sm sm:text-base";
      case "lg":
        return "text-base sm:text-lg";
      case "xl":
        return "text-lg sm:text-xl";
      case "2xl":
        return "text-xl sm:text-2xl";
      default:
        return "text-base";
    }
  };

  // Highlight words of interest in the glossary
  const termsToHighlight = [
    { key: "Horizonte", label: "Horizonte" },
    { key: "Reservorio", label: "Reservorio" },
    { key: "Phi (Φ)", label: "Phi (Φ)" },
    { key: "Phi", label: "Phi" },
    { key: "Scrambling", label: "Scrambling" },
    { key: "Entrelazamiento", label: "Entrelazamiento" },
    { key: "Transición de fase", label: "Transición de fase" },
    { key: "Soft hair / huella", label: "Soft hair / huella" },
    { key: "soft hair", label: "soft hair" },
  ];

  const highlightTerms = (text: string) => {
    if (!text) return [];
    
    // Simple custom markdown to html line formatter
    const lines = text.split("\n");
    let isFirstParagraph = true;
    const processedBlocks: React.ReactNode[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle Markdown Tables
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines: string[] = [];
        // Consume all contiguous lines of the table
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }

        // Process the collected table lines
        // Check if there is at least one line (excluding separators)
        const rows = tableLines.filter(l => !l.match(/^\|[\s:-|]+\|$/));

        if (rows.length > 0) {
          // Detect if we have a header separator line (e.g. |---|) as the second element
          const hasHeader = tableLines.length > 1 && tableLines[1].match(/^\|[\s:-|]+\|$/);
          let headerRow: string[] = [];
          let bodyRows: string[][] = [];

          if (hasHeader) {
            headerRow = rows[0]
              .split("|")
              .map(cell => cell.trim())
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            
            bodyRows = rows.slice(1).map(row => 
              row
                .split("|")
                .map(cell => cell.trim())
                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            );
          } else {
            bodyRows = rows.map(row => 
              row
                .split("|")
                .map(cell => cell.trim())
                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            );
          }

          processedBlocks.push(
            <div key={`table-${i}`} className={`overflow-x-auto my-8 rounded-xl border ${tc.border} shadow-lg transition-all duration-300`}>
              <table className="min-w-full divide-y divide-amber-500/10 font-sans text-sm">
                {headerRow.length > 0 && (
                  <thead className={theme === "cosmic" ? "bg-slate-900/60" : theme === "sepia" ? "bg-amber-100/60" : "bg-slate-100/80"}>
                    <tr>
                      {headerRow.map((cell, cellIdx) => (
                        <th
                          key={cellIdx}
                          scope="col"
                          className={`px-5 py-3.5 text-left font-display font-semibold text-xs uppercase tracking-wider ${
                            theme === "cosmic" ? "text-amber-400" : theme === "sepia" ? "text-amber-900" : "text-slate-800"
                          }`}
                        >
                          {parseInlineStyles(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className={`divide-y ${tc.border} ${theme === "cosmic" ? "bg-slate-950/20" : theme === "sepia" ? "bg-[#FAF6EE]/30" : "bg-white/50"}`}>
                  {bodyRows.map((rowCells, rowIdx) => (
                    <tr 
                      key={rowIdx} 
                      className="transition-colors duration-200 hover:bg-amber-500/5"
                    >
                      {rowCells.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`px-5 py-4 text-sm leading-relaxed ${
                            cellIdx === 0 
                              ? (theme === "cosmic" ? "text-amber-400 font-semibold font-display" : theme === "sepia" ? "text-amber-900 font-semibold font-display" : "text-slate-900 font-semibold font-display") 
                              : "opacity-90 font-serif"
                          } ${
                            theme === "cosmic" ? "text-slate-200" : theme === "sepia" ? "text-amber-950" : "text-slate-700"
                          }`}
                        >
                          {parseInlineStyles(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // Handle Headers
      if (trimmed.startsWith("### ")) {
        processedBlocks.push(
          <h3 key={i} className={`font-display font-semibold text-lg sm:text-xl ${tc.accent} mt-8 mb-4 border-b ${tc.border} pb-2`}>
            {trimmed.replace("### ", "")}
          </h3>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith("## ")) {
        processedBlocks.push(
          <h2 key={i} className={`font-display font-bold text-xl sm:text-2xl ${tc.accent} mt-10 mb-6 border-b ${tc.border} pb-2`}>
            {trimmed.replace("## ", "")}
          </h2>
        );
        i++;
        continue;
      }

      // Handle custom comparison bento blocks
      // Format: > **En física esto se llama:**... or > **En la vida diaria es como:**...
      if (trimmed.startsWith("> **En física esto se llama:**")) {
        const value = trimmed.replace("> **En física esto se llama:**", "").trim();
        processedBlocks.push(
          <div key={i} className={`${tc.bentoPhys} rounded-xl p-4 my-4 font-mono text-xs sm:text-sm shadow-sm relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 px-2 py-0.5 ${tc.bentoPhysTag} text-[9px] uppercase tracking-widest font-sans rounded-bl-lg`}>
              Física
            </div>
            <strong className={`${tc.bentoPhysTitle} block mb-1`}>En física esto se llama:</strong>
            <span>{value}</span>
          </div>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith("> **En la vida diaria es como:**")) {
        const value = trimmed.replace("> **En la vida diaria es como:**", "").trim();
        processedBlocks.push(
          <div key={i} className={`${tc.bentoMeta} rounded-xl p-4 my-4 font-sans text-xs sm:text-sm shadow-sm relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 px-2 py-0.5 ${tc.bentoMetaTag} text-[9px] uppercase tracking-widest font-mono rounded-bl-lg`}>
              Metáfora
            </div>
            <strong className={`${tc.bentoMetaTitle} block mb-1`}>En la vida diaria es como:</strong>
            <span className="italic">{value}</span>
          </div>
        );
        i++;
        continue;
      }

      // Regular blockquote
      if (trimmed.startsWith("> ")) {
        processedBlocks.push(
          <blockquote key={i} className={tc.blockquote}>
            {trimmed.replace("> ", "")}
          </blockquote>
        );
        i++;
        continue;
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const rawContent = trimmed.substring(2);
        processedBlocks.push(
          <li key={i} className="ml-6 list-disc mb-2 leading-relaxed font-serif">
            {parseInlineStyles(rawContent)}
          </li>
        );
        i++;
        continue;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)/);
        if (match) {
          processedBlocks.push(
            <li key={i} className="ml-6 list-decimal mb-2 leading-relaxed font-serif">
              {parseInlineStyles(match[2])}
            </li>
          );
          i++;
          continue;
        }
      }

      // Empty lines
      if (trimmed === "") {
        processedBlocks.push(<div key={i} className="h-4" />);
        i++;
        continue;
      }

      // First paragraph drop cap formatting
      if (isFirstParagraph && trimmed.length > 10 && !trimmed.startsWith("#") && !trimmed.startsWith("-") && !trimmed.startsWith("*") && !trimmed.startsWith(">") && !trimmed.startsWith("|")) {
        isFirstParagraph = false;
        const firstLetter = trimmed.charAt(0);
        const restOfText = trimmed.slice(1);
        processedBlocks.push(
          <p key={i} className="mb-6 leading-relaxed tracking-wide font-serif text-justify text-base sm:text-lg opacity-90">
            <span className={`float-left text-7xl font-display font-bold leading-[0.8] mr-3 mt-1.5 ${theme === "cosmic" ? "text-amber-500" : theme === "sepia" ? "text-amber-800" : "text-[#1A1A1A]"}`}>
              {firstLetter}
            </span>
            {parseInlineStyles(restOfText)}
          </p>
        );
        i++;
        continue;
      }

      // Default paragraph
      processedBlocks.push(
        <p key={i} className="mb-6 leading-relaxed tracking-wide font-serif text-justify text-base sm:text-lg opacity-90">
          {parseInlineStyles(line)}
        </p>
      );
      i++;
    }

    return processedBlocks;
  };

  // Helper to parse bold, italics, and glossary buttons in paragraph text
  const parseInlineStyles = (text: string) => {
    let parts: (string | React.ReactNode)[] = [text];

    // Parse bold markdown (**text**)
    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return part;
      const regex = /\*\*(.*?)\*\*/g;
      const result = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          result.push(part.substring(lastIndex, match.index));
        }
        result.push(<strong key={match.index} className={`font-semibold ${theme === "paper" ? "text-[#1A1A1A]" : theme === "sepia" ? "text-[#2C1E11]" : "text-white"}`}>{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.length) {
        result.push(part.substring(lastIndex));
      }
      return result;
    });

    // Parse glossary term highlights (interactive buttons)
    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return part;
      
      const wordsToMatch = termsToHighlight.map(t => t.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const regex = new RegExp(`\\b(${wordsToMatch})\\b`, "gi");
      
      const result = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          result.push(part.substring(lastIndex, match.index));
        }
        const matchedTerm = match[1];
        result.push(
          <button
            key={match.index}
            onClick={() => onTermClick(matchedTerm)}
            className={`px-1.5 py-0.5 rounded-md ${tc.highlight} font-medium transition-all text-xs sm:text-sm inline-flex items-center gap-0.5 cursor-pointer`}
          >
            {matchedTerm}
          </button>
        );
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.length) {
        result.push(part.substring(lastIndex));
      }
      return result;
    });

    return parts;
  };

  // Theme styles mapping
  const tc = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/60",
          border: "border-[#1A1A1A]/10",
          accent: "text-[#1A1A1A]",
          accentMuted: "text-[#1A1A1A]/75",
          accentBg: "bg-[#1A1A1A]/5 border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#1A1A1A]/10",
          bentoPhys: "bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A]",
          bentoPhysTag: "bg-[#1A1A1A]/10 text-[#1A1A1A]/80",
          bentoPhysTitle: "text-[#1A1A1A] font-semibold",
          bentoMeta: "bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A]",
          bentoMetaTag: "bg-[#1A1A1A]/10 text-[#1A1A1A]/80",
          bentoMetaTitle: "text-[#1A1A1A] font-semibold",
          cardBg: "bg-white",
          subtleCard: "bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A]",
          inputBg: "bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A]",
          inputText: "text-[#1A1A1A]",
          highlight: "bg-[#1A1A1A]/5 border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#1A1A1A]/10",
          blockquote: "border-l-2 border-[#1A1A1A]/40 pl-4 py-1 italic text-[#1A1A1A]/80",
        };
      case "sepia":
        return {
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/60",
          border: "border-[#2C1E11]/10",
          accent: "text-amber-800",
          accentMuted: "text-amber-750",
          accentBg: "bg-amber-800/5 border-amber-800/10 text-amber-800 hover:bg-amber-800/10",
          bentoPhys: "bg-amber-950/5 border border-amber-900/10 text-[#2C1E11]",
          bentoPhysTag: "bg-amber-900/10 text-amber-900",
          bentoPhysTitle: "text-amber-900 font-semibold",
          bentoMeta: "bg-amber-800/5 border border-amber-800/10 text-[#2C1E11]",
          bentoMetaTag: "bg-amber-800/10 text-amber-800",
          bentoMetaTitle: "text-amber-800 font-semibold",
          cardBg: "bg-[#FAF6EE]",
          subtleCard: "bg-amber-800/5 border border-amber-800/10 text-[#2C1E11]",
          inputBg: "bg-[#2C1E11]/5 border-amber-850/10 text-[#2C1E11]",
          inputText: "text-[#2C1E11]",
          highlight: "bg-amber-800/5 border border-amber-800/15 text-amber-800 hover:bg-amber-800/10",
          blockquote: "border-l-2 border-amber-800/40 pl-4 py-1 italic text-amber-900/80",
        };
      case "cosmic":
      default:
        return {
          text: "text-[#E4E6EB]",
          textMuted: "text-[#E4E6EB]/60",
          border: "border-[#E4E6EB]/10",
          accent: "text-amber-500",
          accentMuted: "text-amber-400",
          accentBg: "bg-amber-500/5 border-amber-500/10 text-amber-400 hover:bg-amber-500/10",
          bentoPhys: "bg-indigo-950/20 border border-indigo-500/20 text-indigo-300",
          bentoPhysTag: "bg-indigo-500/10 text-indigo-400",
          bentoPhysTitle: "text-indigo-400 font-semibold",
          bentoMeta: "bg-amber-950/20 border border-amber-500/20 text-amber-200",
          bentoMetaTag: "bg-amber-500/10 text-amber-400",
          bentoMetaTitle: "text-amber-400 font-semibold",
          cardBg: "bg-[#14161D]",
          subtleCard: "bg-[#14161D]/40 border border-slate-800 text-slate-300",
          inputBg: "bg-slate-950/60 border border-slate-800 text-slate-300",
          inputText: "text-slate-300",
          highlight: "bg-amber-500/5 border border-amber-500/15 text-amber-400 hover:bg-amber-500/10",
          blockquote: "border-l-2 border-amber-500 pl-4 py-1 italic text-slate-400",
        };
    }
  }, [theme]);

  // Set reader classes based on Theme
  const getThemeClasses = () => {
    switch (theme) {
      case "paper":
        return "bg-white text-[#1A1A1A] border-[#1A1A1A]/10 select-text";
      case "sepia":
        return "bg-amber-50/5 text-[#2C1E11] border-amber-800/10 select-text";
      case "cosmic":
      default:
        return "bg-[#14161D]/50 text-slate-300 border-slate-800/60 select-text";
    }
  };

  return (
    <div ref={containerRef} className="space-y-8 pb-12">
      {/* Chapter Title Card */}
      <motion.div
        key={`header-${chapter.id}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center py-6 sm:py-10 border-b ${tc.border} space-y-3`}
      >
        {chapter.section && (
          <span className={`text-[10px] sm:text-xs font-sans uppercase tracking-[0.25em] ${tc.accent} font-bold block`}>
            {chapter.section}
          </span>
        )}
        <h1 className={`font-display font-semibold text-2xl sm:text-5xl ${theme === "paper" ? "text-[#1A1A1A]" : theme === "sepia" ? "text-[#2C1E11]" : "text-slate-100"} tracking-tight max-w-3xl mx-auto leading-tight`}>
          {chapter.chapterNumber !== "0" && chapter.id !== "prologo" && chapter.id !== "interludio" && `Capítulo ${chapter.chapterNumber}: `}
          {chapter.title}
        </h1>
        {chapter.subtitle && (
          <p className={`font-serif text-sm sm:text-base ${tc.textMuted} italic max-w-2xl mx-auto`}>
            {chapter.subtitle}
          </p>
        )}
      </motion.div>

      {/* Grid layout for Chapter reading and Illustration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Text Content */}
        <div className={`lg:col-span-8 p-6 sm:p-10 rounded-2xl border ${getThemeClasses()} ${getFontSizeClass()} transition-all duration-300`}>
          <motion.div
            key={`content-${chapter.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-2 prose prose-invert max-w-none"
          >
            {highlightTerms(chapter.content)}
          </motion.div>
        </div>

        {/* Right Panel: Illustration & Notes */}
        <div className="lg:col-span-4 space-y-6">
          {chapter.illustration && (
            <div className={`space-y-3 ${tc.subtleCard} rounded-2xl p-5 shadow-lg`}>
              <span className={`text-[10px] font-sans uppercase tracking-widest ${tc.textMuted} block mb-1 text-center`}>
                Visualización de Concepto
              </span>
              <IllustrationViewer illustration={chapter.illustration} />
              <div className="text-center pt-2">
                <h4 className={`font-display font-semibold text-sm ${tc.accent}`}>
                  {chapter.illustration.title}
                </h4>
                <p className={`text-xs ${tc.textMuted} font-sans mt-1 leading-relaxed`}>
                  {chapter.illustration.description}
                </p>
              </div>
            </div>
          )}

          {/* Reflection Journal Bitácora */}
          <div className={`${tc.subtleCard} rounded-2xl p-5 shadow-lg space-y-4`}>
            <div className={`flex items-center justify-between border-b ${tc.border} pb-2`}>
              <div className="flex items-center gap-2">
                <PenTool className={`w-4 h-4 ${tc.accent}`} />
                <h4 className={`font-display font-medium text-xs uppercase tracking-wider ${tc.text}`}>
                  Bitácora de Reflexión
                </h4>
              </div>
              {reflection && (
                <button
                  onClick={clearReflection}
                  className={`text-[10px] ${tc.textMuted} hover:text-red-400 transition-colors cursor-pointer`}
                >
                  Borrar
                </button>
              )}
            </div>

            <p className={`text-[11px] ${tc.textMuted} leading-relaxed font-sans`}>
              Escribe tus reflexiones, apuntes de física, o pensamientos que te despierte este capítulo. Se guardarán automáticamente en tu navegador.
            </p>

            <textarea
              value={reflection}
              onChange={(e) => {
                setReflection(e.target.value);
                setIsSaved(false);
              }}
              placeholder="¿Qué ecos resuenan en tu horizonte interno tras leer este capítulo?..."
              className={`w-full h-32 bg-transparent border ${tc.border} rounded-xl p-3 text-xs ${tc.text} placeholder:opacity-30 focus:outline-none focus:border-amber-500/40 font-sans resize-none transition-all`}
            />

            <button
              onClick={saveReflection}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isSaved
                  ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500"
                  : `${tc.accentBg} cursor-pointer`
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Guardado en Bitácora!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar en Bitácora
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className={`flex items-center justify-between pt-6 border-t ${tc.border}`}>
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${
            theme === "paper" || theme === "sepia"
              ? `border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#1A1A1A]/5`
              : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
          } disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all active:scale-95 text-xs sm:text-sm font-semibold cursor-pointer`}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <span className={`text-[11px] sm:text-xs font-mono ${tc.textMuted}`}>
          Parte {chapter.chapterNumber} de 20
        </span>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${
            theme === "paper" || theme === "sepia"
              ? `border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#1A1A1A]/5`
              : "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10"
          } disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all active:scale-95 text-xs sm:text-sm font-semibold cursor-pointer`}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
