import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SoundControlProps {
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  muteLabel: string;
  unmuteLabel: string;
  /** Full positioning classes for standalone use. Pass "" to render as a plain
   * flex item instead, so a parent can place it next to other controls. */
  positionClassName?: string;
}

export const SoundControl: React.FC<SoundControlProps> = ({
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  muteLabel,
  unmuteLabel,
  positionClassName = "fixed bottom-6 right-6 z-50",
}) => {
  const isSilent = isMuted || volume <= 0;

  return (
    <div className={`${positionClassName} flex items-center gap-2 py-1 pl-1 pr-3 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md shadow-2xl`}>
      <button
        onClick={onToggleMute}
        className="p-1 rounded-full hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
        title={isMuted ? unmuteLabel : muteLabel}
      >
        {isSilent ? (
          <VolumeX className="w-4 h-4 text-slate-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-amber-400" />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="w-20 h-3 accent-amber-400 cursor-pointer"
        aria-label={isMuted ? unmuteLabel : muteLabel}
      />
    </div>
  );
};
