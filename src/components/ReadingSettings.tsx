import React from "react";
import { Settings, ZoomIn, ZoomOut, Sun, Moon, Coffee, Compass, MessagesSquare } from "lucide-react";
import { Language, uiStrings } from "../i18n";
import { DialogosSettings } from "./DialogosSettings";

export type ReadingTheme = "cosmic" | "paper" | "sepia" | "campo";
export type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";

interface ReadingSettingsProps {
  theme: ReadingTheme;
  setTheme: (theme: ReadingTheme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  language: Language;
}

export const ReadingSettings: React.FC<ReadingSettingsProps> = ({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  language,
}) => {
  const t = uiStrings[language];

  const increaseFontSize = () => {
    const sizes: FontSize[] = ["sm", "base", "lg", "xl", "2xl"];
    const index = sizes.indexOf(fontSize);
    if (index < sizes.length - 1) {
      setFontSize(sizes[index + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes: FontSize[] = ["sm", "base", "lg", "xl", "2xl"];
    const index = sizes.indexOf(fontSize);
    if (index > 0) {
      setFontSize(sizes[index - 1]);
    }
  };

  const rs = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          bg: "bg-[#F9F6F1]/50 border-[#1A1A1A]/10 text-[#1A1A1A]",
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/60",
          border: "border-[#1A1A1A]/10",
          icon: "text-[#1A1A1A]/80",
          buttonActive: "bg-[#1A1A1A] border-[#1A1A1A] text-[#F9F6F1] shadow-sm",
          buttonInactive: "bg-[#1A1A1A]/5 border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
          buttonZoom: "border-[#1A1A1A]/10 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] disabled:opacity-35",
        };
      case "sepia":
        return {
          bg: "bg-amber-800/5 border-[#2C1E11]/10 text-[#2C1E11]",
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/60",
          border: "border-[#2C1E11]/10",
          icon: "text-amber-800",
          buttonActive: "bg-[#2C1E11] border-[#2C1E11] text-[#FAF6EE] shadow-sm",
          buttonInactive: "bg-[#2C1E11]/5 border-[#2C1E11]/10 hover:bg-[#2C1E11]/10 text-[#2C1E11]",
          buttonZoom: "border-[#2C1E11]/10 bg-[#2C1E11]/5 hover:bg-[#2C1E11]/10 text-[#2C1E11] disabled:opacity-35",
        };
      case "campo":
        return {
          bg: "bg-[#B4472A]/5 border-[#1B2430]/15 text-[#1B2430]",
          text: "text-[#1B2430]",
          textMuted: "text-[#1B2430]/60",
          border: "border-[#1B2430]/15",
          icon: "text-[#B4472A]",
          buttonActive: "bg-[#1B2430] border-[#1B2430] text-[#F3EEE2] shadow-sm",
          buttonInactive: "bg-[#1B2430]/5 border-[#1B2430]/15 hover:bg-[#1B2430]/10 text-[#1B2430]",
          buttonZoom: "border-[#1B2430]/15 bg-[#1B2430]/5 hover:bg-[#1B2430]/10 text-[#1B2430] disabled:opacity-35",
        };
      case "cosmic":
      default:
        return {
          bg: "bg-[#14161D]/40 border border-slate-800 text-slate-300",
          text: "text-slate-300",
          textMuted: "text-slate-500",
          border: "border-slate-800/60",
          icon: "text-amber-500",
          buttonActive: "bg-slate-900 border-indigo-500/50 text-indigo-400 shadow-md shadow-indigo-500/5",
          buttonInactive: "bg-slate-950/20 border-slate-800 hover:border-slate-700 text-slate-400",
          buttonZoom: "border-slate-800 bg-slate-950/20 hover:border-slate-700 text-slate-400 disabled:opacity-40",
        };
    }
  }, [theme]);

  return (
    <div className={`${rs.bg} border rounded-2xl p-4 space-y-4 transition-all duration-300 shadow-sm`}>
      <div className={`flex items-center gap-2 border-b ${rs.border} pb-2 mb-2`}>
        <Settings className={`w-4 h-4 ${rs.icon}`} />
        <span className={`font-display text-xs font-semibold uppercase tracking-wider ${rs.text}`}>
          {t.settings.title}
        </span>
      </div>

      {/* Themes */}
      <div className="space-y-1.5">
        <span className={`text-[10px] font-mono uppercase ${rs.textMuted}`}>{t.settings.colorScheme}</span>
        <div className="grid grid-cols-2 gap-1.5 font-sans">
          <button
            onClick={() => setTheme("cosmic")}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              theme === "cosmic" ? rs.buttonActive : rs.buttonInactive
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            {t.settings.cosmos}
          </button>
          <button
            onClick={() => setTheme("paper")}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              theme === "paper" ? rs.buttonActive : rs.buttonInactive
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            {t.settings.paper}
          </button>
          <button
            onClick={() => setTheme("sepia")}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              theme === "sepia" ? rs.buttonActive : rs.buttonInactive
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            {t.settings.amber}
          </button>
          <button
            onClick={() => setTheme("campo")}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              theme === "campo" ? rs.buttonActive : rs.buttonInactive
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {t.settings.campo}
          </button>
        </div>
      </div>

      {/* Font sizes */}
      <div className="space-y-1.5">
        <span className={`text-[10px] font-mono uppercase ${rs.textMuted}`}>{t.settings.textSize}</span>
        <div className="flex items-center justify-between gap-2 font-sans">
          <button
            onClick={decreaseFontSize}
            disabled={fontSize === "sm"}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${rs.buttonZoom}`}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className={`text-xs ${rs.text} font-medium`}>
            {fontSize === "sm" && t.settings.small}
            {fontSize === "base" && t.settings.normal}
            {fontSize === "lg" && t.settings.large}
            {fontSize === "xl" && t.settings.veryLarge}
            {fontSize === "2xl" && t.settings.extraLarge}
          </span>
          <button
            onClick={increaseFontSize}
            disabled={fontSize === "2xl"}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${rs.buttonZoom}`}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Diálogos con el Horizonte: API key, modelo y exportación */}
      <div className={`space-y-1.5 border-t ${rs.border} pt-3`}>
        <span className={`flex items-center gap-1.5 text-[10px] font-mono uppercase ${rs.textMuted}`}>
          <MessagesSquare className="w-3 h-3" />
          Diálogos con el Horizonte
        </span>
        <div className={`${rs.text} text-xs`}>
          <DialogosSettings />
        </div>
      </div>
    </div>
  );
};
