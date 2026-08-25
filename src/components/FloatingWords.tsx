import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Language, uiStrings } from "../i18n";
// @ts-ignore
import tarelBg from "../assets/images/ilustracion_02.png";

interface FloatingWord {
  term: string;
  termEn: string;
  mode: "essay" | "cuentos" | "poemas";
  targetId: string;
  x: number; // posición horizontal en %
  y: number; // posición vertical en %
  duration: number; // duración del ciclo de aparición (s)
  delay: number; // desfase de inicio (s)
  drift: number; // amplitud de la deriva vertical (px)
  size: "sm" | "md" | "lg";
}

// Palabras clave de la obra que flotan sobre el fondo de Tarel. Cada una lleva
// al capítulo, cuento o poema donde el término aparece (allí ya se muestra
// resaltado y enlaza con el glosario).
const WORDS: FloatingWord[] = [
  { term: "Horizonte de sucesos", termEn: "Event horizon", mode: "essay", targetId: "cap0", x: 10, y: 20, duration: 11, delay: 0, drift: 14, size: "lg" },
  { term: "Reservorio", termEn: "Reservoir", mode: "essay", targetId: "cap2", x: 70, y: 14, duration: 13, delay: 2.5, drift: 10, size: "md" },
  { term: "Entrelazamiento", termEn: "Entanglement", mode: "essay", targetId: "cap11", x: 38, y: 30, duration: 12, delay: 5, drift: 12, size: "md" },
  { term: "Información integrada", termEn: "Integrated information", mode: "essay", targetId: "cap1", x: 78, y: 42, duration: 14, delay: 1, drift: 16, size: "sm" },
  { term: "La burbuja", termEn: "The bubble", mode: "poemas", targetId: "poema_arq5", x: 16, y: 52, duration: 10, delay: 4, drift: 12, size: "lg" },
  { term: "El remo", termEn: "The oar", mode: "poemas", targetId: "poema_arq6", x: 58, y: 60, duration: 12, delay: 7, drift: 10, size: "md" },
  { term: "El luthier", termEn: "The luthier", mode: "cuentos", targetId: "cuento_luthier", x: 84, y: 68, duration: 11, delay: 3, drift: 14, size: "md" },
  { term: "La red de los nombres", termEn: "The web of names", mode: "cuentos", targetId: "cuento4", x: 8, y: 76, duration: 15, delay: 6, drift: 12, size: "sm" },
  { term: "El borde", termEn: "The edge", mode: "cuentos", targetId: "cuento9", x: 42, y: 84, duration: 12, delay: 8, drift: 10, size: "md" },
  { term: "Radiación de Hawking", termEn: "Hawking radiation", mode: "essay", targetId: "cap6", x: 70, y: 86, duration: 13, delay: 5.5, drift: 16, size: "sm" },
  { term: "La orilla", termEn: "The shore", mode: "poemas", targetId: "poema_arq8", x: 30, y: 64, duration: 11, delay: 9, drift: 12, size: "md" },
  { term: "El vacío cuántico", termEn: "The quantum vacuum", mode: "essay", targetId: "cap0", x: 56, y: 36, duration: 14, delay: 2, drift: 14, size: "sm" },
];

interface FloatingWordsProps {
  language: Language;
  theme: "cosmic" | "paper" | "sepia";
  fullHeight?: boolean;
  onSelect: (mode: "essay" | "cuentos" | "poemas", targetId: string) => void;
}

export const FloatingWords: React.FC<FloatingWordsProps> = ({ language, theme, fullHeight, onSelect }) => {
  const t = uiStrings[language].landing;
  const isDark = theme === "cosmic";

  const sizeClass = (s: FloatingWord["size"]) =>
    s === "lg"
      ? "text-lg sm:text-2xl md:text-3xl"
      : s === "md"
      ? "text-base sm:text-xl md:text-2xl"
      : "text-sm sm:text-base md:text-lg";

  return (
    <section
      className={`relative w-full overflow-hidden bg-slate-950 select-none ${
        fullHeight ? "h-full" : "h-[70vh] min-h-[480px]"
      }`}
    >
      {/* Fondo: la ciudad de Tarel sobre el agua estrellada */}
      <img
        src={tarelBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/20 to-slate-950/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.5))] pointer-events-none" />

      {/* Encabezado de la sección */}
      <div className="absolute top-12 left-0 right-0 flex flex-col items-center gap-2 z-20 px-6 pointer-events-none">
        <span className="flex items-center gap-2 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.3em] text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          {t.floatingTitle}
        </span>
        <span className="text-xs sm:text-sm font-serif italic text-slate-300/80 text-center max-w-md">
          {t.floatingHint}
        </span>
      </div>

      {/* Palabras flotantes */}
      {WORDS.map((w) => (
        <motion.button
          key={w.term}
          onClick={() => onSelect(w.mode, w.targetId)}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.9, 0.9, 0],
            y: [0, -w.drift, -w.drift * 0.4, 0],
          }}
          transition={{
            duration: w.duration,
            delay: w.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.12, opacity: 1 }}
          whileTap={{ scale: 0.96 }}
          className={`absolute z-10 font-display italic font-medium cursor-pointer transition-colors ${sizeClass(w.size)} ${
            isDark
              ? "text-amber-100/90 hover:text-amber-300"
              : "text-amber-50 hover:text-amber-300"
          } drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] hover:drop-shadow-[0_0_16px_rgba(245,158,11,0.5)]`}
          style={{ left: `${w.x}%`, top: `${w.y}%` }}
        >
          {language === "en" ? w.termEn : w.term}
        </motion.button>
      ))}
    </section>
  );
};
