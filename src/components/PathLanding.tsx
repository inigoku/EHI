import React from "react";
import { motion } from "motion/react";
import { BookOpen, Feather, Book, Layers, ArrowRight } from "lucide-react";
import { ReadingTheme } from "./ReadingSettings";
import { Language, uiStrings } from "../i18n";

// @ts-ignore
import essayLandingImg from "../assets/images/landing/essay_landing.jpg";
// @ts-ignore
import storiesLandingImg from "../assets/images/landing/stories_landing.png";
// @ts-ignore
import poemsLandingImg from "../assets/images/landing/poems_landing.png";
// @ts-ignore
import reconstructLandingImg from "../assets/images/landing/reconstruct_landing.png";

type ReadingMode = "essay" | "cuentos" | "poemas" | "reconstruccion";

interface PathLandingProps {
  mode: ReadingMode;
  theme: ReadingTheme;
  language: Language;
  onClose: () => void;
}

interface PathContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  btnText: string;
}

export const PathLanding: React.FC<PathLandingProps> = ({
  mode,
  theme,
  language,
  onClose,
}) => {
  const t = uiStrings[language].pathLanding;
  
  const content = React.useMemo<PathContent>(() => {
    switch (mode) {
      case "essay":
        return {
          title: t.essayTitle,
          subtitle: t.essaySubtitle,
          description: t.essayDescription,
          image: essayLandingImg,
          icon: <BookOpen className="w-5 h-5" />,
          btnText: t.essayBtn,
        };
      case "cuentos":
        return {
          title: t.cuentosTitle,
          subtitle: t.cuentosSubtitle,
          description: t.cuentosDescription,
          image: storiesLandingImg,
          icon: <Feather className="w-5 h-5" />,
          btnText: t.cuentosBtn,
        };
      case "poemas":
        return {
          title: t.poemasTitle,
          subtitle: t.poemasSubtitle,
          description: t.poemasDescription,
          image: poemsLandingImg,
          icon: <Book className="w-5 h-5" />,
          btnText: t.poemasBtn,
        };
      case "reconstruccion":
      default:
        return {
          title: t.reconTitle,
          subtitle: t.reconSubtitle,
          description: t.reconDescription,
          image: reconstructLandingImg,
          icon: <Layers className="w-5 h-5" />,
          btnText: t.reconBtn,
        };
    }
  }, [mode, t]);

  // Editorial styles mapping based on theme
  const sc = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          bg: "bg-[#F9F6F1]",
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/70",
          border: "border-[#1A1A1A]/10",
          cardBg: "bg-white border-[#1A1A1A]/15 shadow-sm",
          accentText: "text-amber-700",
          accentBg: "bg-amber-100/50",
          btnPrimary: "bg-[#1A1A1A] text-white hover:bg-black",
          imgShadow: "shadow-md shadow-[#1A1A1A]/5",
          accentBorder: "border-amber-700/25",
        };
      case "sepia":
        return {
          bg: "bg-[#FAF6EE]",
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/70",
          border: "border-[#2C1E11]/10",
          cardBg: "bg-[#F3EDE0] border-[#2C1E11]/15 shadow-sm",
          accentText: "text-amber-800",
          accentBg: "bg-amber-900/10",
          btnPrimary: "bg-[#2C1E11] text-amber-50 hover:bg-amber-950",
          imgShadow: "shadow-md shadow-[#2C1E11]/5",
          accentBorder: "border-amber-850/25",
        };
      case "cosmic":
      default:
        return {
          bg: "bg-[#0D0E12]",
          text: "text-[#E4E6EB]",
          textMuted: "text-[#E4E6EB]/70",
          border: "border-[#E4E6EB]/10",
          cardBg: "bg-[#15171F] border-[#E4E6EB]/5 shadow-xl",
          accentText: "text-amber-400",
          accentBg: "bg-amber-500/10",
          btnPrimary: "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/10",
          imgShadow: "shadow-2xl shadow-black/60 border-amber-500/10",
          accentBorder: "border-amber-500/25",
        };
    }
  }, [theme]);

  return (
    <div className={`w-full max-w-5xl mx-auto py-6 sm:py-10 transition-colors duration-300`}>
      {/* Presentación Grid (Standard Cover layout) */}
      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Text and CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="md:col-span-7 space-y-6 order-2 md:order-1"
        >
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${sc.accentBg} ${sc.accentText}`}>
              {content.icon}
            </span>
            <span className={`text-xs font-mono uppercase tracking-[0.2em] font-bold ${sc.accentText}`}>
              {t.explorationLine}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium italic leading-tight">
              {content.title}
            </h2>
            <h3 className={`text-sm sm:text-base font-sans tracking-wide font-medium ${sc.accentText}`}>
              {content.subtitle}
            </h3>
          </div>

          <div className={`h-px w-20 bg-amber-500/30`} />

          <p className={`text-sm sm:text-base leading-relaxed ${sc.textMuted} font-serif`}>
            {content.description}
          </p>

          <div className="pt-4">
            <button
              onClick={onClose}
              className={`flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-sans font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${sc.btnPrimary}`}
            >
              {content.btnText}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Right Column: Illustration Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5 order-1 md:order-2 flex justify-center"
        >
          <div className={`relative max-w-[320px] md:max-w-full w-full rounded-2xl overflow-hidden border ${sc.cardBg} ${sc.imgShadow} group`}>
            {/* Ambient background glow for cosmic theme */}
            {theme === "cosmic" && (
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none" />
            )}
            
            <div className="relative aspect-[4/5] sm:aspect-square md:aspect-[3/4] overflow-hidden bg-slate-950">
              <img
                src={content.image}
                alt={content.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
