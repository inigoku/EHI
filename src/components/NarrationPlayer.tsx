import React from "react";
import { Volume2 } from "lucide-react";

interface NarrationPlayerProps {
  chapterId: string;
  language: "es" | "en";
}

// Looks for /audio/{chapterId}.{lang}.mp3 (generated offline via the TTS script
// in scripts/generate_narration.py). If the file doesn't exist yet, renders
// nothing — so chapters without narration don't show a broken player.
export const NarrationPlayer: React.FC<NarrationPlayerProps> = ({ chapterId, language }) => {
  const [available, setAvailable] = React.useState<boolean | null>(null);
  const src = `/audio/${chapterId}.${language}.mp3`;

  React.useEffect(() => {
    let cancelled = false;
    setAvailable(null);
    fetch(src, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!available) return null;

  return (
    <div className="pt-3 flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-amber-500/80 font-sans uppercase tracking-wider">
        <Volume2 size={13} />
        <span>{language === "en" ? "Listen" : "Escuchar"}</span>
      </div>
      <audio controls preload="none" src={src} className="w-full max-w-sm h-9" />
    </div>
  );
};
