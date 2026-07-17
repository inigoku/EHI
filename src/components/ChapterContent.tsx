import React from "react";
import { Chapter, Illustration, allChapters, cuentosList } from "../chapters";
import { IllustrationViewer } from "./IllustrationViewer";
import { ChevronLeft, ChevronRight, PenTool, Save, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, uiStrings } from "../i18n";
// @ts-ignore
import part1Bg from "../assets/images/part1_bg.png";
// @ts-ignore
import part2Bg from "../assets/images/part2_bg.jpg";
// @ts-ignore
import part3Bg from "../assets/images/part3_bg.jpg";
// @ts-ignore
import part4Bg from "../assets/images/part4_bg.png";

interface ChapterContentProps {
  chapter: Chapter;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onTermClick: (termName: string) => void;
  theme: "cosmic" | "paper" | "sepia";
  fontSize: "sm" | "base" | "lg" | "xl" | "2xl";
  readingMode: "essay" | "cuentos" | "poemas" | "reconstruccion";
  onSwitchMode: (mode: "essay" | "cuentos" | "poemas" | "reconstruccion", targetId?: string) => void;
  language: Language;
}
// Helper to detect if the main chapter illustration is already embedded inline in the text
const isIllustrationDuplicate = (chapter: Chapter, readingMode: string): boolean => {
  if (!chapter.illustration) return false;
  
  const lines = chapter.content.split("\n");
  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## [ILUSTRACIÓN")) {
      const match = trimmed.match(/##\s*\[ILUSTRACIÓN\s*([\w.]+)?:?\s*"([^"]+)"\]/i) || trimmed.match(/##\s*\[ILUSTRACIÓN:\s*"([^"]+)"\]/i);
      if (match) {
        const rawId = match[1] || "";
        const title = match[2] || match[1] || "Ilustración";
        
        let illusId = "il_notas";
        if (rawId) {
          const cleanId = rawId.trim().toLowerCase().replace(".", "_");
          if (readingMode === "cuentos") {
            if (cleanId === "1" || cleanId === "01") illusId = "cuento_01";
            else if (cleanId === "2" || cleanId === "02") illusId = "cuento_02";
            else if (cleanId === "3" || cleanId === "03") illusId = "cuento_03";
            else if (cleanId === "4" || cleanId === "04") illusId = "cuento_04";
            else if (cleanId === "5" || cleanId === "05") illusId = "cuento_05";
            else if (cleanId === "6" || cleanId === "06") illusId = "cuento_06";
            else if (cleanId === "7" || cleanId === "07") illusId = "cuento_07";
            else if (cleanId === "8" || cleanId === "08") illusId = "cuento_08";
            else if (cleanId === "9" || cleanId === "09") illusId = "cuento_09";
            else if (cleanId === "10") illusId = "cuento_10";
            else if (cleanId === "11") illusId = "cuento_11";
            else if (cleanId === "12") illusId = "cuento_12";
            else if (cleanId === "13") illusId = "cuento_13";
            else if (cleanId === "14") illusId = "cuento_14";
            else if (cleanId === "eq") illusId = "cuento_eq";
            else if (cleanId === "int") illusId = "cuento_int";
            else if (cleanId === "txiki") illusId = "cuento_txiki";
            else if (cleanId === "m87") illusId = "cuento_m87";
          } else {
            if (!isNaN(Number(cleanId))) {
              const num = Number(cleanId);
              if (num === 1) illusId = "il01";
              else if (num === 2) illusId = "il02";
              else if (num === 3) illusId = "il_prologo";
              else if (num === 12.5 || rawId.trim() === "12.5") illusId = "il12_5";
              else if (num === 17.5 || rawId.trim() === "17.5") illusId = "il_inanimado";
              else if (num === 17.6 || rawId.trim() === "17.6") illusId = "il_clon";
              else if (num === 24) illusId = "il_alzheimer";
              else if (num === 25) illusId = "il_parkinson";
              else if (num === 26) illusId = "il_herido";
              else if (num === 27) illusId = "il_mascotas";
              else if (num === 28) illusId = "il_ia";
              else {
                illusId = cleanId.length === 1 ? `il0${cleanId}` : `il${cleanId}`;
              }
            } else {
              if (cleanId === "txiki") illusId = "il_txiki";
              else if (cleanId === "m87") illusId = "il_m87";
              else if (cleanId === "tp") illusId = "il_tp";
              else if (cleanId === "eq") illusId = "il_el_que_queda";
              else if (cleanId === "int") illusId = "il_int";
            }
          }
        } else {
          const lowerTitle = title.toLowerCase();
          if (readingMode === "cuentos") {
            if (lowerTitle.includes("agua") && lowerTitle.includes("retira")) illusId = "cuento_agua_retira";
            else if (lowerTitle.includes("océano") || lowerTitle.includes("oceano")) illusId = "il_oceano_olas";
            else if (lowerTitle.includes("ladrón") || lowerTitle.includes("ladron")) illusId = "cuento_ladron";
            else if (lowerTitle.includes("luthier")) illusId = "cuento_luthier";
          } else {
            if (lowerTitle.includes("agua") && lowerTitle.includes("retira")) illusId = "cuento_agua_retira";
            else if (lowerTitle.includes("océano") || lowerTitle.includes("oceano")) illusId = "il_oceano_olas";
            else if (lowerTitle.includes("ladrón") || lowerTitle.includes("ladron")) illusId = "il_ladron";
            else if (lowerTitle.includes("luthier")) illusId = "il_luthier";
          }
        }
        if (illusId === chapter.illustration.id) {
          return true;
        }
      }
    }
  }
  return false;
};

export const ChapterContent: React.FC<ChapterContentProps> = ({
  chapter,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onTermClick,
  theme,
  fontSize,
  readingMode,
  onSwitchMode,
  language,
}) => {
  const t = uiStrings[language].chapterContent;
  const displayTitle = language === "en" && chapter.titleEn ? chapter.titleEn : chapter.title;
  const displaySubtitle = language === "en" && chapter.subtitleEn ? chapter.subtitleEn : chapter.subtitle;
  const displaySection = language === "en" && chapter.sectionEn ? chapter.sectionEn : chapter.section;
  const displayContent = language === "en" && chapter.contentEn ? chapter.contentEn : chapter.content;
  const showPendingBanner = language === "en" && !chapter.contentEn;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [reflection, setReflection] = React.useState<string>("");
  const [isSaved, setIsSaved] = React.useState<boolean>(false);

  // Tab state for Reconstrucción mode: narrativa, ensayo, or poema
  const [reconstructTab, setReconstructTab] = React.useState<"narrativa" | "ensayo" | "poema">("narrativa");

  // Scroll to top on chapter change
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // Load saved reflection
    const saved = localStorage.getItem(`reflection_${chapter.id}`);
    setReflection(saved || "");
    setIsSaved(false);
    
    // Reset tab to default
    setReconstructTab("narrativa");
  }, [chapter.id]);

  const saveReflection = () => {
    localStorage.setItem(`reflection_${chapter.id}`, reflection);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const clearReflection = () => {
    if (confirm(t.confirmClearReflection)) {
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

  const getLinkedChapterTitle = (id?: string) => {
    if (!id) return "";
    const chap = allChapters.find((c) => c.id === id);
    if (!chap) return "";
    return language === "en" && chap.titleEn ? chap.titleEn : chap.title;
  };

  const getLinkedCuentoTitle = (id?: string) => {
    if (!id) return "";
    const cuento = cuentosList.find((c) => c.id === id);
    if (!cuento) return "";
    return language === "en" && cuento.titleEn ? cuento.titleEn : cuento.title;
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
    { key: "huella", label: "huella" },
    { key: "scrambling cuántico", label: "scrambling cuántico" },
    { key: "vacío cuántico", label: "vacío cuántico" },
    { key: "información integrada", label: "información integrada" },
    { key: "horizonte de sucesos", label: "horizonte de sucesos" },
    { key: "radiación de Hawking", label: "radiación de Hawking" },
    { key: "ER=EPR", label: "ER=EPR" },
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
          // Always treat the first row as a header row if there are multiple rows
          const hasHeader = rows.length > 1;
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
      // Handle inline illustrations
      if (trimmed.startsWith("## [ILUSTRACIÓN")) {
        const match = trimmed.match(/##\s*\[ILUSTRACIÓN\s*([\w.]+)?:?\s*"([^"]+)"\]/i) || trimmed.match(/##\s*\[ILUSTRACIÓN:\s*"([^"]+)"\]/i);
        if (match) {
          const rawId = match[1] || "";
          const title = match[2] || match[1] || "Ilustración";
          
          let illusId = "il_notas";
          if (rawId) {
            const cleanId = rawId.trim().toLowerCase().replace(".", "_");
            if (readingMode === "cuentos") {
              if (cleanId === "1" || cleanId === "01") illusId = "cuento_01";
              else if (cleanId === "2" || cleanId === "02") illusId = "cuento_02";
              else if (cleanId === "3" || cleanId === "03") illusId = "cuento_03";
              else if (cleanId === "4" || cleanId === "04") illusId = "cuento_04";
              else if (cleanId === "5" || cleanId === "05") illusId = "cuento_05";
              else if (cleanId === "6" || cleanId === "06") illusId = "cuento_06";
              else if (cleanId === "7" || cleanId === "07") illusId = "cuento_07";
              else if (cleanId === "8" || cleanId === "08") illusId = "cuento_08";
              else if (cleanId === "9" || cleanId === "09") illusId = "cuento_09";
              else if (cleanId === "10") illusId = "cuento_10";
              else if (cleanId === "11") illusId = "cuento_11";
              else if (cleanId === "12") illusId = "cuento_12";
              else if (cleanId === "13") illusId = "cuento_13";
              else if (cleanId === "14") illusId = "cuento_14";
              else if (cleanId === "eq") illusId = "cuento_eq";
              else if (cleanId === "int") illusId = "cuento_int";
              else if (cleanId === "txiki") illusId = "cuento_txiki";
              else if (cleanId === "m87") illusId = "cuento_m87";
            } else {
              if (!isNaN(Number(cleanId))) {
                const num = Number(cleanId);
                if (num === 1) illusId = "il01";
                else if (num === 2) illusId = "il02";
                else if (num === 3) illusId = "il_prologo";
                else if (num === 12.5 || rawId.trim() === "12.5") illusId = "il12_5";
                else if (num === 17.5 || rawId.trim() === "17.5") illusId = "il_inanimado";
                else if (num === 17.6 || rawId.trim() === "17.6") illusId = "il_clon";
                else if (num === 24) illusId = "il_alzheimer";
                else if (num === 25) illusId = "il_parkinson";
                else if (num === 26) illusId = "il_herido";
                else if (num === 27) illusId = "il_mascotas";
                else if (num === 28) illusId = "il_ia";
                else {
                  illusId = cleanId.length === 1 ? `il0${cleanId}` : `il${cleanId}`;
                }
              } else {
                if (cleanId === "txiki") illusId = "il_txiki";
                else if (cleanId === "m87") illusId = "il_m87";
                else if (cleanId === "tp") illusId = "il_tp";
                else if (cleanId === "eq") illusId = "il_el_que_queda";
                else if (cleanId === "int") illusId = "il_int";
                else if (cleanId === "epilogo") illusId = "il_epilogo";
              }
            }
          } else {
            const lowerTitle = title.toLowerCase();
            if (readingMode === "cuentos") {
              if (lowerTitle.includes("agua") && lowerTitle.includes("retira")) illusId = "cuento_agua_retira";
              else if (lowerTitle.includes("océano") || lowerTitle.includes("oceano")) illusId = "il_oceano_olas";
              else if (lowerTitle.includes("ladrón") || lowerTitle.includes("ladron")) illusId = "cuento_ladron";
              else if (lowerTitle.includes("luthier")) illusId = "cuento_luthier";
            } else {
              if (lowerTitle.includes("agua") && lowerTitle.includes("retira")) illusId = "cuento_agua_retira";
              else if (lowerTitle.includes("océano") || lowerTitle.includes("oceano")) illusId = "il_oceano_olas";
              else if (lowerTitle.includes("ladrón") || lowerTitle.includes("ladron")) illusId = "il_ladron";
              else if (lowerTitle.includes("luthier")) illusId = "il_luthier";
            }
          }

          let description = "";
          let nextIdx = i + 1;
          while (nextIdx < lines.length && lines[nextIdx].trim() === "") {
            nextIdx++;
          }
          if (nextIdx < lines.length && lines[nextIdx].trim().startsWith("*") && lines[nextIdx].trim().endsWith("*")) {
            description = lines[nextIdx].trim().slice(1, -1);
            i = nextIdx;
          }

          const inlineIllus: Illustration = {
            id: illusId,
            title: title,
            description: description
          };

          processedBlocks.push(
            <div key={`inline-illus-${i}`} className="my-10 flex justify-center select-none">
              <IllustrationViewer illustration={inlineIllus} language={language} />
            </div>
          );

          i++;
          continue;
        }
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

      // Horizontal rule
      if (trimmed === "---") {
        processedBlocks.push(
          <hr key={i} className="my-6 border-0 border-t border-amber-500/20" />
        );
        i++;
        continue;
      }

      // Lone > (empty blockquote line) — skip
      if (trimmed === ">") {
        i++;
        continue;
      }

      // Regular blockquote — group consecutive > lines into one block
      if (trimmed.startsWith("> ") || trimmed === ">") {
        const blockLines: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith("> ") || lines[i].trim() === ">")) {
          const content = lines[i].trim();
          blockLines.push(content === ">" ? "" : content.replace(/^> /, ""));
          i++;
        }
        processedBlocks.push(
          <blockquote key={`bq-${i}`} className={`${tc.blockquote} space-y-1`}>
            {blockLines.map((bl, bi) =>
              bl === "" ? <div key={bi} className="h-1" /> : <p key={bi} className="leading-relaxed">{parseInlineStyles(bl)}</p>
            )}
          </blockquote>
        );
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

    // Parse single asterisks as bold (*text*)
    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return part;
      const regex = /\*(.*?)\*/g;
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
            className={`inline cursor-pointer transition-all duration-150 ${tc.termLink}`}
            style={{ background: "none", border: "none", padding: 0, margin: 0, font: "inherit", lineHeight: "inherit" }}
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
          termLink: "text-[#1A1A1A] underline decoration-dotted decoration-[#1A1A1A]/50 underline-offset-[3px] hover:decoration-[#1A1A1A] hover:text-[#1A1A1A]",
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
          termLink: "text-amber-800 underline decoration-dotted decoration-amber-800/50 underline-offset-[3px] hover:decoration-amber-800 hover:text-amber-900",
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
          termLink: "text-amber-400 underline decoration-dotted decoration-amber-500/50 underline-offset-[3px] hover:decoration-amber-400 hover:text-amber-300",
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
        className={`text-center py-6 sm:py-10 border-b ${tc.border} space-y-4`}
      >
        {readingMode === "essay" && displaySection && (
          <span className={`text-[10px] sm:text-xs font-sans uppercase tracking-[0.25em] ${tc.accent} font-bold block`}>
            {displaySection}
          </span>
        )}
        {readingMode === "cuentos" && (
          <span className={`text-[10px] sm:text-xs font-sans uppercase tracking-[0.25em] ${tc.accent} font-bold block`}>
            {uiStrings[language].header.sectionCuentos}
          </span>
        )}
        {readingMode === "poemas" && displaySection && (
          <span className={`text-[10px] sm:text-xs font-sans uppercase tracking-[0.25em] ${tc.accent} font-bold block`}>
            {displaySection}
          </span>
        )}
        {readingMode === "reconstruccion" && (
          <span className={`text-[10px] sm:text-xs font-sans uppercase tracking-[0.25em] ${tc.accent} font-bold block`}>
            {uiStrings[language].header.sectionReconstruccion.toUpperCase()}
          </span>
        )}
        <h1 className={`font-display font-semibold text-2xl sm:text-5xl ${theme === "paper" ? "text-[#1A1A1A]" : theme === "sepia" ? "text-[#2C1E11]" : "text-slate-100"} tracking-tight max-w-3xl mx-auto leading-tight`}>
          {readingMode === "essay"
            ? (chapter.chapterNumber && chapter.chapterNumber !== "0" && chapter.id !== "prologo" && chapter.id !== "interludio" && t.chapterPrefix(chapter.chapterNumber))
            : readingMode === "cuentos"
            ? (chapter.chapterNumber ? t.storyPrefix(chapter.chapterNumber) : "")
            : readingMode === "reconstruccion"
            ? (chapter.chapterNumber ? t.partPrefix(chapter.chapterNumber.replace("R", "")) : "")
            : ""}
          {displayTitle.replace(/^(I|II|III|IV|V|VI)\.\s*/i, "")}
        </h1>
        {displaySubtitle && (
          <p className={`font-serif text-sm sm:text-base ${tc.textMuted} italic max-w-2xl mx-auto`}>
            {displaySubtitle}
          </p>
        )}

        {/* Links between Ensayo and Cuentos */}
        {readingMode === "cuentos" && chapter.linkedChapterId && (
          <div className="pt-2">
            <button
              onClick={() => onSwitchMode("essay", chapter.linkedChapterId)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-sans border border-amber-500/20 rounded-lg py-1 px-3 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer"
            >
              📖 {t.readRelatedEssay}: "{getLinkedChapterTitle(chapter.linkedChapterId)}"
            </button>
          </div>
        )}
        {readingMode === "essay" && chapter.linkedCuentosId && (
          <div className="pt-2">
            <button
              onClick={() => onSwitchMode("cuentos", chapter.linkedCuentosId)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-sans border border-amber-500/20 rounded-lg py-1 px-3 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer"
            >
              📖 {t.readRelatedStory}: "{getLinkedCuentoTitle(chapter.linkedCuentosId)}"
            </button>
          </div>
        )}
        {showPendingBanner && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-500/80 font-sans border border-amber-500/20 rounded-lg py-1 px-3 bg-amber-500/5">
              {t.pendingTranslation}
            </span>
          </div>
        )}
      </motion.div>

      {/* Grid or Centered layout depending on readingMode */}
      {readingMode === "reconstruccion" ? (
        <div className="max-w-4xl mx-auto space-y-6 select-text">
          {/* Sub-tabs for Reconstrucción: Ensayo, Narrativa, Poema */}
          <div className="flex justify-center border-b border-amber-500/10 pb-2 mb-6">
            <div className="flex bg-slate-950/40 p-1 rounded-xl border border-amber-500/10">
              <button
                onClick={() => setReconstructTab("narrativa")}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  reconstructTab === "narrativa"
                    ? "bg-amber-500/20 text-amber-400 shadow-md border border-amber-500/20"
                    : `${tc.textMuted} hover:text-amber-300`
                }`}
              >
                Narrativa
              </button>
              <button
                onClick={() => setReconstructTab("ensayo")}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  reconstructTab === "ensayo"
                    ? "bg-amber-500/20 text-amber-400 shadow-md border border-amber-500/20"
                    : `${tc.textMuted} hover:text-amber-300`
                }`}
              >
                Ensayo
              </button>
              <button
                onClick={() => setReconstructTab("poema")}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  reconstructTab === "poema"
                    ? "bg-amber-500/20 text-amber-400 shadow-md border border-amber-500/20"
                    : `${tc.textMuted} hover:text-amber-300`
                }`}
              >
                Poema
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${chapter.id}-${reconstructTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {reconstructTab === "poema" ? (
                /* Poema tab: Same background as Narrativa and Ensayo */
                <div className={`p-6 sm:p-10 rounded-2xl border ${getThemeClasses()} ${getFontSizeClass()} transition-all duration-300 flex flex-col items-center justify-center`}>
                  <div className="w-full text-center py-4">
                    <div
                      className={`max-w-2xl mx-auto space-y-2 font-serif italic leading-relaxed sm:leading-loose text-base sm:text-lg tracking-wide ${
                        theme === "cosmic" ? "text-amber-100/90" : theme === "sepia" ? "text-[#2C1E11]" : "text-[#1A1A1A]"
                      }`}
                    >
                      {(chapter.poema || "").split("\n").map((line, lineIdx) => (
                        <div key={lineIdx}>
                          {parseInlineStyles(line)}
                        </div>
                      ))}
                    </div>

                    {/* Cierre section inside Poem tab */}
                    {chapter.cierre && (
                      <div className={`mt-10 pt-8 border-t border-amber-500/10 max-w-xl mx-auto text-left leading-relaxed text-sm opacity-90 ${
                        theme === "cosmic" ? "text-slate-300" : theme === "sepia" ? "text-[#2C1E11]" : "text-[#1A1A1A]"
                      }`}>
                        <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-amber-500 block mb-3 text-center">Cierre</span>
                        <div className="space-y-4">
                          {chapter.cierre.split('\n\n').map((paragraph, pIdx) => (
                            <p key={pIdx} className="indent-4 text-justify">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Narrativa or Ensayo tab: Regular reading text */
                <div className={`p-6 sm:p-10 rounded-2xl border ${getThemeClasses()} ${getFontSizeClass()} transition-all duration-300`}>
                  <div className="space-y-4 prose prose-invert max-w-none text-justify leading-relaxed text-base">
                    {reconstructTab === "narrativa" ? (
                      highlightTerms(chapter.narrativa || "")
                    ) : (
                      highlightTerms(chapter.ensayo || "")
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Reflection Journal Bitácora (Centered under the story) */}
          <div className="max-w-xl mx-auto pt-4">
            <div className={`${tc.subtleCard} rounded-2xl p-5 shadow-lg space-y-4`}>
              <div className={`flex items-center justify-between border-b ${tc.border} pb-2`}>
                <div className="flex items-center gap-2">
                  <PenTool className={`w-4 h-4 ${tc.accent}`} />
                  <h4 className={`font-display font-medium text-xs uppercase tracking-wider ${tc.text}`}>
                    {t.reflectionBoxTitleRecon(reconstructTab.toUpperCase())}
                  </h4>
                </div>
                {reflection && (
                  <button
                    onClick={clearReflection}
                    className={`text-[10px] ${tc.textMuted} hover:text-red-400 transition-colors cursor-pointer`}
                  >
                    {t.delete}
                  </button>
                )}
              </div>

              <textarea
                value={reflection}
                onChange={(e) => {
                  setReflection(e.target.value);
                  setIsSaved(false);
                }}
                placeholder={t.placeholderRecon(reconstructTab)}
                className={`w-full h-28 bg-transparent border ${tc.border} rounded-xl p-3 text-xs ${tc.text} placeholder:opacity-30 focus:outline-none focus:border-amber-500/40 font-sans resize-none transition-all`}
              />

              <button
                onClick={saveReflection}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isSaved
                    ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500"
                    : `${tc.accentBg} cursor-pointer`
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t.savedNote}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t.saveButton}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : readingMode === "poemas" ? (
        <div className="max-w-4xl mx-auto space-y-8 select-text">
          {/* Poemas mode: Full page background illustration layout */}
          <div className={`w-full relative rounded-3xl overflow-hidden shadow-2xl border ${tc.border} ${tc.subtleCard} min-h-[60vh] flex flex-col justify-between`}>
            {/* Background Illustration Container */}
            {chapter.illustration && (
              <div className="absolute inset-0 z-0">
                <div className={`w-full h-full pointer-events-none select-none transition-all duration-1000 ${
                  theme === "cosmic"
                    ? "opacity-[0.55] mix-blend-screen"
                    : theme === "sepia"
                    ? "opacity-[0.45] mix-blend-multiply"
                    : "opacity-[0.45] mix-blend-multiply"
                }`}>
                  <IllustrationViewer illustration={chapter.illustration} variant="background" language={language} />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-1000 ${
                  theme === "cosmic"
                    ? "from-[#0D0E12]/95 via-[#0D0E12]/60 to-[#0D0E12]/15"
                    : theme === "sepia"
                    ? "from-[#FAF6EE]/95 via-[#FAF6EE]/60 to-[#FAF6EE]/15"
                    : "from-[#F9F6F1]/95 via-[#F9F6F1]/60 to-[#F9F6F1]/15"
                }`} />
              </div>
            )}

            {/* Poem Text Panel */}
            <div className="relative z-10 p-8 sm:p-20 flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                key={`content-${chapter.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`max-w-2xl mx-auto space-y-2 font-serif italic leading-relaxed sm:leading-loose text-base sm:text-xl tracking-wide select-text ${
                  theme === "cosmic" ? "text-amber-100/90" : theme === "sepia" ? "text-[#2C1E11]" : "text-[#1A1A1A]"
                }`}
              >
                {displayContent.split("\n").map((line, lineIdx) => (
                  <div key={lineIdx}>
                    {parseInlineStyles(line)}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Reflection Journal Bitácora (Collapsible inside the poem view) */}
            <div className="relative z-10 max-w-xl mx-auto w-full px-6 pb-6">
              <details className={`group rounded-2xl border ${tc.border} bg-slate-950/20 backdrop-blur-sm p-4 transition-all duration-300`}>
                <summary className={`flex items-center justify-between cursor-pointer select-none text-[10px] sm:text-xs font-semibold ${tc.text} tracking-wider font-display uppercase`}>
                  <div className="flex items-center gap-2">
                    <PenTool className={`w-3.5 h-3.5 ${tc.accent}`} />
                    <span>{t.reflectionBoxTitlePoetic}</span>
                  </div>
                  <span className="text-[10px] text-amber-500/70 group-open:hidden">{t.expand}</span>
                  <span className="text-[10px] text-amber-500/70 hidden group-open:inline">{t.collapse}</span>
                </summary>
                <div className="mt-4 space-y-4">
                  <p className={`text-[10px] ${tc.textMuted} leading-relaxed font-sans`}>
                    {t.hintPoem}
                  </p>
                  <textarea
                    value={reflection}
                    onChange={(e) => {
                      setReflection(e.target.value);
                      setIsSaved(false);
                    }}
                    placeholder={t.placeholderPoem}
                    className={`w-full h-20 bg-transparent border ${tc.border} rounded-xl p-3 text-xs ${tc.text} focus:outline-none focus:border-amber-500/40 font-sans resize-none transition-all`}
                  />
                  <button
                    onClick={saveReflection}
                    className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isSaved
                        ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500"
                        : `${tc.accentBg} cursor-pointer`
                    }`}
                  >
                    {isSaved ? t.savedNote : t.saveNote}
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      ) : readingMode === "cuentos" ? (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Cuentos mode: Illustration is at the beginning, centered and large */}
          {chapter.illustration && (
            <div className="flex justify-center my-8 select-none">
              <IllustrationViewer illustration={chapter.illustration} language={language} />
            </div>
          )}

          {/* Main Story Content */}
          <div className={`p-6 sm:p-12 rounded-2xl border ${getThemeClasses()} ${getFontSizeClass()} shadow-md transition-all duration-300`}>
            <motion.div
              key={`content-${chapter.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-2 prose prose-invert max-w-none font-serif text-justify leading-relaxed text-base sm:text-lg"
            >
              {highlightTerms(displayContent)}
            </motion.div>
          </div>

          {/* Reflection Journal Bitácora (Centered under the story) */}
          <div className="max-w-xl mx-auto pt-4">
            <div className={`${tc.subtleCard} rounded-2xl p-5 shadow-lg space-y-4`}>
              <div className={`flex items-center justify-between border-b ${tc.border} pb-2`}>
                <div className="flex items-center gap-2">
                  <PenTool className={`w-4 h-4 ${tc.accent}`} />
                  <h4 className={`font-display font-medium text-xs uppercase tracking-wider ${tc.text}`}>
                    {t.reflectionBoxTitle}
                  </h4>
                </div>
                {reflection && (
                  <button
                    onClick={clearReflection}
                    className={`text-[10px] ${tc.textMuted} hover:text-red-400 transition-colors cursor-pointer`}
                  >
                    {t.delete}
                  </button>
                )}
              </div>

              <p className={`text-[11px] ${tc.textMuted} leading-relaxed font-sans`}>
                {t.hintCuento}
              </p>

              <textarea
                value={reflection}
                onChange={(e) => {
                  setReflection(e.target.value);
                  setIsSaved(false);
                }}
                placeholder={t.placeholderCuento}
                className={`w-full h-28 bg-transparent border ${tc.border} rounded-xl p-3 text-xs ${tc.text} placeholder:opacity-30 focus:outline-none focus:border-amber-500/40 font-sans resize-none transition-all`}
              />

              <button
                onClick={saveReflection}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isSaved
                    ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500"
                    : `${tc.accentBg} cursor-pointer`
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t.savedButton}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t.saveButton}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Links at bottom of story */}
          {chapter.linkedChapterId && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => onSwitchMode("essay", chapter.linkedChapterId)}
                className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-sans border border-amber-500/20 rounded-lg py-1.5 px-4 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer shadow-sm"
              >
                📖 {t.backToEssay}: "{getLinkedChapterTitle(chapter.linkedChapterId)}"
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Centered Essay Layout */
        <div className="max-w-3xl mx-auto space-y-8 select-text">
          {/* Main Text Content */}
          <div className={`p-6 sm:p-10 rounded-2xl border ${getThemeClasses()} ${getFontSizeClass()} transition-all duration-300 relative overflow-hidden`}>
            {/* Background Image for Part 1, Part 2, Part 3 & Part 4 */}
            {readingMode === "essay" && (
              chapter.section?.includes("PRIMERA PARTE") ||
              chapter.section?.includes("SEGUNDA PARTE") || 
              chapter.section?.includes("TERCERA PARTE") || 
              chapter.section?.includes("CUARTA PARTE")
            ) && (
              <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <img
                  src={
                    chapter.section?.includes("PRIMERA PARTE")
                      ? part1Bg
                      : chapter.section?.includes("SEGUNDA PARTE") 
                      ? part2Bg 
                      : chapter.section?.includes("TERCERA PARTE") 
                      ? part3Bg 
                      : part4Bg
                  }
                  alt="Fondo de la Sección"
                  className={`w-full h-full object-cover transition-opacity duration-1000 ${
                    theme === "cosmic"
                      ? "opacity-[0.14] mix-blend-screen"
                      : "opacity-[0.08] mix-blend-multiply"
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 bg-gradient-to-b transition-all duration-1000 ${
                  theme === "cosmic"
                    ? "from-[#14161D]/80 via-transparent to-[#14161D]/90"
                    : theme === "sepia"
                    ? "from-[#FAF6EE]/80 via-transparent to-[#FAF6EE]/90"
                    : "from-white/80 via-transparent to-white/90"
                }`} />
              </div>
            )}
            
            {chapter.illustration && !isIllustrationDuplicate(chapter, readingMode) && (
              <div className="flex justify-center mb-8 select-none relative z-10">
                <IllustrationViewer illustration={chapter.illustration} language={language} />
              </div>
            )}
            <motion.div
              key={`content-${chapter.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-2 prose prose-invert max-w-none relative z-10"
            >
              {highlightTerms(displayContent)}
            </motion.div>
            {readingMode === "essay" && chapter.id === "cap20_5" && (
              <div className="mt-8 flex justify-center border-t border-amber-500/10 pt-6 relative z-10">
                <button
                  onClick={() => onSwitchMode("reconstruccion")}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-sans border border-amber-500/20 rounded-lg py-1.5 px-4 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer shadow-sm"
                >
                  🔧 Ir a la Reconstrucción del Límite correspondiente
                </button>
              </div>
            )}
          </div>

          {/* Reflection Journal Bitácora (Centered below the text) */}
          <div className="max-w-xl mx-auto pt-4">
            <div className={`${tc.subtleCard} rounded-2xl p-5 shadow-lg space-y-4`}>
              <div className={`flex items-center justify-between border-b ${tc.border} pb-2`}>
                <div className="flex items-center gap-2">
                  <PenTool className={`w-4 h-4 ${tc.accent}`} />
                  <h4 className={`font-display font-medium text-xs uppercase tracking-wider ${tc.text}`}>
                    {t.reflectionBoxTitle}
                  </h4>
                </div>
                {reflection && (
                  <button
                    onClick={clearReflection}
                    className={`text-[10px] ${tc.textMuted} hover:text-red-400 transition-colors cursor-pointer`}
                  >
                    {t.delete}
                  </button>
                )}
              </div>

              <p className={`text-[11px] ${tc.textMuted} leading-relaxed font-sans`}>
                {t.hintEssay}
              </p>

              <textarea
                value={reflection}
                onChange={(e) => {
                  setReflection(e.target.value);
                  setIsSaved(false);
                }}
                placeholder={t.placeholderEssay}
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
                    {t.savedButton}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t.saveButton}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
          {t.prev}
        </button>

        <span className={`text-[11px] sm:text-xs font-mono ${tc.textMuted}`}>
          {readingMode === "essay"
            ? t.partOf(chapter.chapterNumber || uiStrings[language].header.interludio, 33)
            : readingMode === "cuentos"
            ? (chapter.chapterNumber ? t.storyOf(chapter.chapterNumber, cuentosList.length - 1) : t.prologueOf(cuentosList.length - 1))
            : readingMode === "reconstruccion"
            ? t.reconOf(chapter.chapterNumber.replace("R", ""))
            : chapter.id === "poema_glosario"
            ? t.poemGlossaryLabel
            : chapter.id.startsWith("poema_arq")
            ? t.poemLinkOf(chapter.id.replace("poema_arq", ""))
            : t.poemReconOf(chapter.id.replace("poema_recon", ""))}
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
          {t.next}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
