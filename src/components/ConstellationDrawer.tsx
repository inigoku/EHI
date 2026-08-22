import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Compass } from "lucide-react";
import { Language, uiStrings } from "../i18n";
import { ReadingTheme } from "./ReadingSettings";
import { RelationsGraph } from "./RelationsGraph";

interface ConstellationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ReadingTheme;
  language: Language;
  currentChapterId?: string;
  onSelectChapter: (chapterId: string, mode: "essay" | "cuentos" | "poemas" | "reconstruccion") => void;
}

export const ConstellationDrawer: React.FC<ConstellationDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  language,
  currentChapterId,
  onSelectChapter,
}) => {
  const t = uiStrings[language];

  const sc = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return { bg: "bg-[#F9F6F1]", border: "border-[#1A1A1A]/10", text: "text-[#1A1A1A]", icon: "text-[#1A1A1A]/80", buttonClose: "hover:bg-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A]" };
      case "sepia":
        return { bg: "bg-[#FAF6EE]", border: "border-[#2C1E11]/10", text: "text-[#2C1E11]", icon: "text-amber-800", buttonClose: "hover:bg-[#2C1E11]/10 text-[#2C1E11]/70 hover:text-[#2C1E11]" };
      case "campo":
        return { bg: "bg-[#F3EEE2]", border: "border-[#1B2430]/20", text: "text-[#1B2430]", icon: "text-[#B4472A]", buttonClose: "hover:bg-[#1B2430]/10 text-[#1B2430]/70 hover:text-[#1B2430]" };
      case "cosmic":
      default:
        return { bg: "bg-[#0D0E12]", border: "border-slate-800", text: "text-[#E4E6EB]", icon: "text-amber-500", buttonClose: "hover:bg-slate-800 text-slate-400 hover:text-slate-200" };
    }
  }, [theme]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className={`fixed inset-4 sm:inset-8 lg:inset-x-16 lg:inset-y-10 z-50 rounded-2xl border ${sc.border} ${sc.bg} ${sc.text} shadow-2xl flex flex-col overflow-hidden`}
          >
            <div className={`px-5 py-4 border-b ${sc.border} flex items-center justify-between flex-shrink-0`}>
              <div className="flex items-center gap-2">
                <Compass className={`w-5 h-5 ${sc.icon}`} />
                <h3 className="font-display font-medium text-base sm:text-lg tracking-wide">
                  {t.sidebar.relationsMap}
                </h3>
              </div>
              <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${sc.buttonClose}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="max-w-6xl mx-auto w-full">
                <RelationsGraph
                  theme={theme}
                  language={language}
                  initialSelectedId={currentChapterId}
                  onSelectChapter={(id, mode) => {
                    onSelectChapter(id, mode);
                    onClose();
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
