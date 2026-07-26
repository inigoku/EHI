import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, BookOpen, FileText, Feather, Route } from "lucide-react";
import { Chapter } from "../chapters";
import {
  JourneyDestination,
  getCuentoForEssay,
  getPoemaForCuento,
  getNextEssayForPoema,
} from "../chapters/journey";
import { Language, uiStrings } from "../i18n";

interface JourneyNavProps {
  chapter: Chapter;
  readingMode: "essay" | "cuentos" | "poemas" | "reconstruccion";
  language: Language;
  theme: "cosmic" | "paper" | "sepia";
  onSwitchMode: (mode: "essay" | "cuentos" | "poemas" | "reconstruccion", targetId?: string) => void;
}

// Tarjeta de "recorrido guiado" que aparece al final de cada pieza y propone
// el siguiente eslabón del hilo temático: Ensayo → Cuento → Poema → (siguiente capítulo del ensayo).
export const JourneyNav: React.FC<JourneyNavProps> = ({
  chapter,
  readingMode,
  language,
  theme,
  onSwitchMode,
}) => {
  const t = uiStrings[language].chapterContent;

  const currentStep = readingMode === "essay" ? 0 : readingMode === "cuentos" ? 1 : readingMode === "poemas" ? 2 : -1;
  if (currentStep === -1) return null;

  let next: JourneyDestination | null = null;
  let ctaLabel = "";
  if (readingMode === "essay") {
    next = getCuentoForEssay(chapter, language);
    ctaLabel = t.journeyContinueCuento;
  } else if (readingMode === "cuentos") {
    next = getPoemaForCuento(chapter.id, language);
    ctaLabel = t.journeyContinuePoema;
  } else {
    next = getNextEssayForPoema(chapter.id, language);
    ctaLabel = t.journeyResumeEssay;
  }

  // Solo mostramos la tarjeta si el recorrido puede continuar desde aquí.
  if (!next) return null;

  const isDark = theme === "cosmic";
  const steps = [
    { label: t.journeyStepEssay, Icon: FileText },
    { label: t.journeyStepCuento, Icon: BookOpen },
    { label: t.journeyStepPoema, Icon: Feather },
  ];

  return (
    <motion.div
      key={`journey-${chapter.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={`max-w-2xl mx-auto mt-10 rounded-2xl border p-5 sm:p-6 relative overflow-hidden ${
        isDark
          ? "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] via-slate-900/40 to-slate-950/60"
          : "border-amber-600/20 bg-gradient-to-br from-amber-500/[0.06] via-white/40 to-white/60"
      }`}
    >
      {/* Etiqueta */}
      <div className="flex items-center gap-2 mb-4">
        <Route className="w-4 h-4 text-amber-500" />
        <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em] text-amber-500">
          {t.journeyLabel}
        </span>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-1 sm:gap-2 mb-5">
        {steps.map(({ label, Icon }, i) => {
          const done = i < currentStep;
          const current = i === currentStep;
          return (
            <React.Fragment key={label}>
              {i > 0 && (
                <div className={`flex-1 h-px ${done || current ? "bg-amber-500/50" : isDark ? "bg-slate-700/60" : "bg-slate-300"}`} />
              )}
              <div
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[10px] sm:text-xs font-sans font-semibold transition-all ${
                  current
                    ? "border-amber-500/60 bg-amber-500/15 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                    : done
                    ? "border-amber-500/30 text-amber-500/80"
                    : isDark
                    ? "border-slate-700/60 text-slate-500"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                <span className="hidden xs:inline sm:inline">{label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <p className={`text-[11px] sm:text-xs font-sans leading-relaxed mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {t.journeyHint}
      </p>

      {/* CTA al siguiente eslabón */}
      <button
        onClick={() => onSwitchMode(next.mode, next.id)}
        className="group w-full flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-3 transition-all cursor-pointer active:scale-[0.99]"
      >
        <span className="flex flex-col items-start text-left min-w-0">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-amber-500/80">
            {ctaLabel}
          </span>
          <span className={`font-display italic text-sm sm:text-base leading-snug break-words ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            “{next.title}”
          </span>
        </span>
        <ArrowRight className="w-5 h-5 shrink-0 text-amber-500 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
};
