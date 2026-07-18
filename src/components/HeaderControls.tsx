import React from "react";
import { Settings, Volume2, VolumeX } from "lucide-react";
import { ReadingSettings, ReadingTheme, FontSize } from "./ReadingSettings";
import { SoundControl } from "./SoundControl";
import { Language, uiStrings } from "../i18n";

interface HeaderControlsProps {
  theme: ReadingTheme;
  setTheme: (theme: ReadingTheme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  language: Language;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  variant?: "dark" | "light";
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  language,
  isMuted,
  toggleMute,
  volume,
  setVolume,
  variant = "dark",
}) => {
  const t = uiStrings[language];
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [soundOpen, setSoundOpen] = React.useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const soundRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
      if (soundRef.current && !soundRef.current.contains(e.target as Node)) {
        setSoundOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSilent = isMuted || volume <= 0;
  const iconBtnClass =
    variant === "dark"
      ? "p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer flex items-center justify-center"
      : "p-2 rounded-xl border border-black/10 bg-black/5 hover:bg-black/10 text-[#1A1A1A] transition-all cursor-pointer flex items-center justify-center";
  const popoverBgClass = variant === "dark" ? "bg-slate-950/95" : "bg-white/95";

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={soundRef}>
        <button
          onClick={() => {
            setSoundOpen((o) => !o);
            setSettingsOpen(false);
          }}
          className={iconBtnClass}
          title={isMuted ? t.landing.muteOff : t.landing.muteOn}
        >
          {isSilent ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        {soundOpen && (
          <div className="absolute top-full right-0 mt-2 z-50">
            <SoundControl
              isMuted={isMuted}
              onToggleMute={toggleMute}
              volume={volume}
              onVolumeChange={setVolume}
              muteLabel={t.landing.muteOn}
              unmuteLabel={t.landing.muteOff}
              positionClassName=""
            />
          </div>
        )}
      </div>

      <div className="relative" ref={settingsRef}>
        <button
          onClick={() => {
            setSettingsOpen((o) => !o);
            setSoundOpen(false);
          }}
          className={iconBtnClass}
          title={t.settings.title}
        >
          <Settings className="w-4 h-4" />
        </button>
        {settingsOpen && (
          <div className={`absolute top-full right-0 mt-2 z-50 w-72 rounded-2xl ${popoverBgClass} backdrop-blur-md shadow-2xl`}>
            <ReadingSettings
              theme={theme}
              setTheme={setTheme}
              fontSize={fontSize}
              setFontSize={setFontSize}
              language={language}
            />
          </div>
        )}
      </div>
    </div>
  );
};
