import React from "react";

const VOLUME_KEY = "site_audio_volume";
const MUTED_KEY = "site_audio_muted";
const DEFAULT_VOLUME = 0.18;

// Shared, persisted audio preferences (volume + mute) so the ambient
// music feels continuous as the reader moves between the landing page
// and the different reading modes, even though each mounts its own
// <audio> element.
export function useAudioPrefs() {
  const [volume, setVolumeState] = React.useState<number>(() => {
    const stored = localStorage.getItem(VOLUME_KEY);
    const parsed = stored !== null ? parseFloat(stored) : NaN;
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : DEFAULT_VOLUME;
  });
  const [isMuted, setIsMutedState] = React.useState<boolean>(() => {
    return localStorage.getItem(MUTED_KEY) === "true";
  });

  const setVolume = React.useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeState(clamped);
    localStorage.setItem(VOLUME_KEY, String(clamped));
    if (clamped > 0 && isMuted) {
      setIsMutedState(false);
      localStorage.setItem(MUTED_KEY, "false");
    }
  }, [isMuted]);

  const setIsMuted = React.useCallback((next: boolean) => {
    setIsMutedState(next);
    localStorage.setItem(MUTED_KEY, String(next));
  }, []);

  const toggleMute = React.useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted, setIsMuted]);

  return { volume, setVolume, isMuted, setIsMuted, toggleMute };
}
