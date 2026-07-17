import React from "react";
import { SoundControl } from "./SoundControl";
import { useAudioPrefs } from "../hooks/useAudioPrefs";
import { Language, uiStrings } from "../i18n";

type ReadingMode = "essay" | "cuentos" | "poemas" | "reconstruccion";

const TRACK_BY_MODE: Record<ReadingMode, string> = {
  essay: "/tides-of-quiet.mp3",
  cuentos: "/anoche-cuando-dormia.mp3",
  poemas: "/cielo-de-vaso.mp3",
  reconstruccion: "/silent-aegean.mp3",
};

interface ChapterMusicPlayerProps {
  readingMode: ReadingMode;
  language: Language;
}

export const ChapterMusicPlayer: React.FC<ChapterMusicPlayerProps> = ({ readingMode, language }) => {
  const t = uiStrings[language];
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const { volume, setVolume, isMuted, toggleMute } = useAudioPrefs();
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

  return (
    <>
      <audio ref={audioRef} src={track} loop autoPlay />
      <SoundControl
        isMuted={isMuted}
        onToggleMute={toggleMute}
        volume={volume}
        onVolumeChange={setVolume}
        muteLabel={t.landing.muteOn}
        unmuteLabel={t.landing.muteOff}
      />
    </>
  );
};
