import React from "react";
import { Language } from "../i18n";

interface LanguageToggleProps {
  language: Language;
  setLanguage: (language: Language) => void;
  variant?: "dark" | "light";
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, setLanguage, variant = "dark", className = "" }) => {
  const isDark = variant === "dark";
  return (
    <div
      className={`flex items-center rounded-lg border overflow-hidden font-sans text-[10px] font-bold tracking-wider ${
        isDark ? "border-white/15 bg-white/5" : "border-current/15"
      } ${className}`}
    >
      <button
        onClick={() => setLanguage("es")}
        className={`px-2 py-1 transition-colors cursor-pointer ${
          language === "es"
            ? "bg-amber-500 text-slate-950"
            : isDark
            ? "text-white/60 hover:text-white"
            : "opacity-60 hover:opacity-100"
        }`}
        aria-pressed={language === "es"}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 transition-colors cursor-pointer ${
          language === "en"
            ? "bg-amber-500 text-slate-950"
            : isDark
            ? "text-white/60 hover:text-white"
            : "opacity-60 hover:opacity-100"
        }`}
        aria-pressed={language === "en"}
      >
        EN
      </button>
    </div>
  );
};
