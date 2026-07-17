import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SoundControlProps {
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  muteLabel: string;
  unmuteLabel: string;
}

export const SoundControl: React.FC<SoundControlProps> = ({
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  muteLabel,
  unmuteLabel,
}) => {
  const isSilent = isMuted || volume <= 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 py-2.5 pl-2.5 pr-4 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md shadow-2xl">
      <button
        onClick={onToggleMute}
        className="p-1.5 rounded-full hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
        title={isMuted ? unmuteLabel : muteLabel}
      >
        {isSilent ? (
          <VolumeX className="w-5 h-5 text-slate-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-amber-400" />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="w-20 accent-amber-400 cursor-pointer"
        aria-label={isMuted ? unmuteLabel : muteLabel}
      />
    </div>
  );
};
