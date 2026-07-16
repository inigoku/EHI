import React from "react";
import { Chapter } from "../chapters";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, PenTool, Clipboard, Check, Trash2, Download, Compass } from "lucide-react";
import DialogosHorizonte from "./DialogosHorizonte";

interface JournalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  onChapterSelect: (id: string) => void;
  theme: string;
}

export const JournalViewer: React.FC<JournalViewerProps> = ({
  isOpen,
  onClose,
  chapters,
  onChapterSelect,
  theme,
}) => {
  const [tab, setTab] = React.useState<"reflexiones" | "dialogos">("reflexiones");
  const [reflections, setReflections] = React.useState<{ [key: string]: string }>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Load all reflections from localStorage
  const loadReflections = () => {
    const data: { [key: string]: string } = {};
    chapters.forEach((c) => {
      const saved = localStorage.getItem(`reflection_${c.id}`);
      if (saved) {
        data[c.id] = saved;
      }
    });
    setReflections(data);
  };

  React.useEffect(() => {
    if (isOpen) {
      loadReflections();
    }
  }, [isOpen, chapters]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteReflection = (id: string) => {
    if (confirm("¿Estás seguro de que deseas borrar esta reflexión permanente?")) {
      localStorage.removeItem(`reflection_${id}`);
      loadReflections();
    }
  };

  const copyAllReflections = () => {
    const text = Object.entries(reflections)
      .map(([id, content]) => {
        const chap = chapters.find((c) => c.id === id);
        return `[Capítulo ${chap?.chapterNumber || "Intro"}] ${chap?.title}\n${content}\n`;
      })
      .join("\n---\n\n");
    navigator.clipboard.writeText(text);
    alert("¡Todas tus reflexiones han sido copiadas al portapapeles!");
  };

  const exportAsTxt = () => {
    const text = Object.entries(reflections)
      .map(([id, content]) => {
        const chap = chapters.find((c) => c.id === id);
        return `[Capítulo ${chap?.chapterNumber || "Intro"}] ${chap?.title}\nReflexión:\n${content}\n`;
      })
      .join("\n---\n\n");
    
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bitacora_el_horizonte_interior.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalWritten = Object.keys(reflections).length;

  const sc = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          bg: "bg-[#F9F6F1]",
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/60",
          border: "border-[#1A1A1A]/10",
          icon: "text-[#1A1A1A]",
          card: "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]",
          button: "border-[#1A1A1A]/15 bg-white text-[#1A1A1A] hover:bg-[#1A1A1A]/5",
          buttonClose: "hover:bg-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:text-[#1A1A1A]",
          noteBox: "bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A] text-justify",
        };
      case "sepia":
        return {
          bg: "bg-[#FAF6EE]",
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/60",
          border: "border-[#2C1E11]/10",
          icon: "text-amber-800",
          card: "bg-amber-800/5 border border-[#2C1E11]/10 text-[#2C1E11]",
          button: "border-[#2C1E11]/15 bg-[#FAF6EE] text-[#2C1E11] hover:bg-[#2C1E11]/5",
          buttonClose: "hover:bg-[#2C1E11]/10 text-[#2C1E11]/60 hover:text-[#2C1E11]",
          noteBox: "bg-[#2C1E11]/5 border border-[#2C1E11]/10 text-[#2C1E11] text-justify",
        };
      case "cosmic":
      default:
        return {
          bg: "bg-[#14161D]",
          text: "text-[#E4E6EB]",
          textMuted: "text-[#E4E6EB]/60",
          border: "border-slate-800",
          icon: "text-amber-500",
          card: "bg-[#14161D]/40 border border-slate-800 text-[#E4E6EB]",
          button: "border-slate-800 bg-slate-950/20 text-slate-300 hover:border-slate-700",
          buttonClose: "hover:bg-slate-800 text-slate-400 hover:text-slate-200",
          noteBox: "bg-slate-900/40 border border-slate-800/40 text-slate-300 text-justify",
        };
    }
  }, [theme]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed inset-5 md:inset-x-12 md:inset-y-10 lg:max-w-4xl lg:mx-auto ${sc.bg} border ${sc.border} rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden ${sc.text}`}
          >
            {/* Header */}
            <div className={`p-6 border-b ${sc.border} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {tab === "reflexiones" ? (
                  <PenTool className={`w-5 h-5 ${sc.icon}`} />
                ) : (
                  <Compass className={`w-5 h-5 ${sc.icon}`} />
                )}
                <div>
                  <h3 className="font-display font-semibold text-lg">
                    {tab === "reflexiones" ? "Tu Bitácora de Lectura" : "Diálogos con el Horizonte"}
                  </h3>
                  <p className={`text-[10px] font-sans uppercase tracking-wider ${sc.textMuted}`}>
                    {tab === "reflexiones"
                      ? 'Compilación de reflexiones de "El Horizonte Interior"'
                      : "Pregúntale al Horizonte, queda anotado en la bitácora"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {tab === "reflexiones" && totalWritten > 0 && (
                  <>
                    <button
                      onClick={copyAllReflections}
                      className={`hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium cursor-pointer ${sc.button}`}
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      Copiar Todo
                    </button>
                    <button
                      onClick={exportAsTxt}
                      className={`hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium cursor-pointer ${sc.button}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar TXT
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${sc.buttonClose}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className={`px-6 pt-4 border-b ${sc.border} flex items-center gap-2`}>
              <button
                onClick={() => setTab("reflexiones")}
                className={`flex items-center gap-1.5 pb-3 px-1 text-xs font-sans font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  tab === "reflexiones"
                    ? `${sc.icon} border-current`
                    : `${sc.textMuted} border-transparent hover:${sc.text}`
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                Reflexiones
              </button>
              <button
                onClick={() => setTab("dialogos")}
                className={`flex items-center gap-1.5 pb-3 px-1 text-xs font-sans font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  tab === "dialogos"
                    ? `${sc.icon} border-current`
                    : `${sc.textMuted} border-transparent hover:${sc.text}`
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Diálogos con el Horizonte
              </button>
            </div>

            {/* Inner Content */}
            {tab === "dialogos" ? (
              <div className="flex-1 overflow-y-auto">
                <DialogosHorizonte />
              </div>
            ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {totalWritten === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-3">
                  <PenTool className="w-12 h-12 opacity-30" />
                  <h4 className={`font-display font-medium text-sm ${sc.textMuted}`}>
                    La bitácora está vacía
                  </h4>
                  <p className={`text-xs ${sc.textMuted} leading-relaxed font-sans`}>
                    Escribe tus apuntes y reflexiones en el bloque lateral que encontrarás al final de cada capítulo para verlos reunidos aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(Object.entries(reflections) as [string, string][]).map(([id, content]) => {
                    const chap = chapters.find((c) => c.id === id);
                    if (!chap) return null;

                    return (
                      <div
                        key={id}
                        className={`${sc.card} rounded-2xl p-5 space-y-3 relative overflow-hidden group`}
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              onChapterSelect(id);
                              onClose();
                            }}
                            className="text-left group/btn cursor-pointer"
                          >
                            <span className={`text-[10px] font-mono uppercase tracking-wider ${sc.icon}`}>
                              Capítulo {chap.chapterNumber !== "0" ? chap.chapterNumber : "Intro"}
                            </span>
                            <h4 className="font-display font-semibold text-sm hover:opacity-85 transition-opacity flex items-center gap-1">
                              {chap.title}
                              <BookOpen className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            </h4>
                          </button>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(content, id)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${sc.button}`}
                              title="Copiar"
                            >
                              {copiedId === id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Clipboard className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteReflection(id)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${sc.button} hover:text-red-500`}
                              title="Borrar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className={`text-xs sm:text-sm leading-relaxed font-serif p-4 rounded-xl whitespace-pre-wrap ${sc.noteBox}`}>
                          {content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            {/* Mobile Actions Footer */}
            {tab === "reflexiones" && totalWritten > 0 && (
              <div className={`sm:hidden p-4 border-t ${sc.border} grid grid-cols-2 gap-2`}>
                <button
                  onClick={copyAllReflections}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer ${sc.button}`}
                >
                  <Clipboard className="w-4 h-4" />
                  Copiar Todo
                </button>
                <button
                  onClick={exportAsTxt}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer ${sc.button}`}
                >
                  <Download className="w-4 h-4" />
                  Descargar TXT
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
