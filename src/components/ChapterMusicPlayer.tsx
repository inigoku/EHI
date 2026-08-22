import React from "react";

type ReadingMode = "essay" | "cuentos" | "poemas" | "reconstruccion" | "joven";

const TRACK_BY_MODE: Record<ReadingMode, string> = {
  essay: "/tides-of-quiet.mp3",
  cuentos: "/anoche-cuando-dormia.mp3",
  poemas: "/cielo-de-vaso.mp3",
  reconstruccion: "/silent-aegean.mp3",
  joven: "/anoche-cuando-dormia.mp3",
};

interface ChapterMusicPlayerProps {
  readingMode: ReadingMode;
  volume: number;
  isMuted: boolean;
}

// Renderless: just owns the <audio> element and swaps tracks per reading block.
// The visible sound control lives in HeaderControls.
export const ChapterMusicPlayer: React.FC<ChapterMusicPlayerProps> = ({ readingMode, volume, isMuted }) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const track = TRACK_BY_MODE[readingMode];

  // Keep the <audio> element's volume/muted state in sync with the shared prefs.
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Switch (and restart) the track whenever the reading block changes.
  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    el.load();
    if (!isMuted) {
      el.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // Retry playback on first user interaction if autoplay was blocked.
  React.useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused && !isMuted) {
        audioRef.current.play().catch(() => {});
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [isMuted]);

  return <audio ref={audioRef} src={track} loop autoPlay />;
};
