import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Compass, Layers, ArrowDown, ArrowRight, ArrowLeft, Book, Feather, Waves, Network } from "lucide-react";
import { ReadingTheme } from "./ReadingSettings";
import { Language, uiStrings } from "../i18n";
import { LanguageToggle } from "./LanguageToggle";
import { SoundControl } from "./SoundControl";
import { FloatingWords } from "./FloatingWords";
import { useAudioPrefs } from "../hooks/useAudioPrefs";
import { RelationsGraph } from "./RelationsGraph";

interface LandingPageProps {
  theme: ReadingTheme;
  language: Language;
  setLanguage: (language: Language) => void;
  onStartReading: (mode: "essay" | "cuentos" | "poemas" | "reconstruccion", chapterId?: string) => void;
  openGlossary: () => void;
  initialPage?: number;
}

const TOTAL_PAGES = 5;

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  language,
  setLanguage,
  onStartReading,
  openGlossary,
  initialPage = 0,
}) => {
  const t = uiStrings[language];
  const INTRO_PHRASES = t.landing.introPhrases;
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [page, setPage] = React.useState(initialPage);

  React.useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const videoARef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const { volume, setVolume, isMuted, toggleMute } = useAudioPrefs();

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch((err) => {
        console.log("Autoplay blocked:", err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

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

  React.useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % INTRO_PHRASES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Vídeo de intro: código idéntico al de la landing original.
  React.useEffect(() => {
    if (videoARef.current) {
      videoARef.current.currentTime = 1.0;
    }
  }, []);

  const handleLoadedData = () => {
    if (videoARef.current) {
      videoARef.current.currentTime = 1.0;
    }
  };

  const handleEnded = () => {
    if (videoARef.current) {
      videoARef.current.currentTime = 1.0;
      videoARef.current.play().catch(() => {});
    }
  };

  // Navegación secuencial entre páginas
  const goNext = () => setPage((p) => Math.min(p + 1, TOTAL_PAGES - 1));
  const goPrev = () => setPage((p) => Math.max(p - 1, 0));

  // Al cambiar de página, empezar siempre desde el principio (ventana, el
  // contenedor de páginas y cualquier sección con scroll interno)
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const pagesEl = document.getElementById("landing-pages");
    if (pagesEl) pagesEl.scrollTop = 0;
    document.querySelectorAll("section.overflow-y-auto").forEach((el) => {
      (el as HTMLElement).scrollTop = 0;
    });
  }, [page]);

  // Flechas del teclado para navegar entre páginas de la landing
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Theme-based colors for the landing content
  const tc = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          bg: "bg-[#F9F6F1]",
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/70",
          border: "border-[#1A1A1A]/10",
          cardBg: "bg-white border-[#1A1A1A]/10 shadow-sm",
          cardHover: "hover:shadow-md hover:border-[#1A1A1A]/20 hover:bg-neutral-50",
          accentText: "text-amber-700",
          accentBg: "bg-amber-100/50",
          btnPrimary: "bg-[#1A1A1A] text-white hover:bg-black",
          btnSecondary: "border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/5",
          accentBorder: "border-amber-700/20",
        };
      case "sepia":
        return {
          bg: "bg-[#FAF6EE]",
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/70",
          border: "border-[#2C1E11]/10",
          cardBg: "bg-[#F3EDE0] border-[#2C1E11]/10 shadow-sm",
          cardHover: "hover:shadow-md hover:border-[#2C1E11]/20 hover:bg-[#EDE5D5]",
          accentText: "text-amber-800",
          accentBg: "bg-amber-900/10",
          btnPrimary: "bg-[#2C1E11] text-amber-50 hover:bg-amber-950",
          btnSecondary: "border-[#2C1E11]/25 text-[#2C1E11] hover:bg-[#2C1E11]/5",
          accentBorder: "border-amber-850/20",
        };
      case "cosmic":
      default:
        return {
          bg: "bg-[#0D0E12]",
          text: "text-[#E4E6EB]",
          textMuted: "text-[#E4E6EB]/70",
          border: "border-[#E4E6EB]/10",
          cardBg: "bg-[#15171F] border-[#E4E6EB]/5 shadow-lg",
          cardHover: "hover:shadow-xl hover:border-amber-500/20 hover:bg-[#1C1F2B]",
          accentText: "text-amber-400",
          accentBg: "bg-amber-500/10",
          btnPrimary: "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/10",
          btnSecondary: "border-white/10 text-[#E4E6EB] hover:bg-white/5",
          accentBorder: "border-amber-500/20",
        };
    }
  }, [theme]);

  const pageLabels = [
    t.nav.home,
    t.landing.floatingTitle,
    t.landing.sectionLabel,
    t.landing.pathsTitle,
    language === "es" ? "Mapa de Relaciones" : "Relations Map",
  ];

  return (
    <div className={`h-screen overflow-hidden ${tc.bg} ${tc.text} transition-colors duration-300`}>
      {/* Background Audio (persistente entre páginas) */}
      <audio
        ref={audioRef}
        src="/dream-in-orbit.mp3"
        loop
        autoPlay
      />

      {/* ══════════ PÁGINA 1: VÍDEO — siempre montada, igual que la landing
           original; las demás páginas se superponen encima al navegar ══════════ */}
      <section
        className="absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950"
        style={{ visibility: page === 0 ? "visible" : "hidden" }}
      >
        <video
          ref={videoARef}
          src="/eHI-intro.mp4#t=1.0"
          className="absolute inset-0 w-full h-full object-cover opacity-80 select-none pointer-events-none"
          autoPlay
          muted
          playsInline
          onLoadedData={handleLoadedData}
          onEnded={handleEnded}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.4))] pointer-events-none" />

        <header className="relative w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-20">
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.3em] font-sans">
              {t.landing.hypothesisLabel}
            </span>
            <span className="text-xl font-display italic text-white leading-none mt-1">
              {t.header.bookTitle}
            </span>
          </div>
          <div className="flex items-center gap-6 font-sans text-xs tracking-wider text-slate-300">
            <LanguageToggle language={language} setLanguage={setLanguage} variant="dark" />
          </div>
        </header>

        <div className="relative flex-1 flex items-center justify-center z-20 max-w-5xl mx-auto w-full px-6">
          <div className="flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={phraseIndex}
                initial={{ opacity: 0, y: 25, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -25, filter: "blur(5px)" }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-amber-50/95 italic font-medium leading-relaxed tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] min-h-[180px] md:min-h-[160px] flex items-center justify-center max-w-4xl"
              >
                {INTRO_PHRASES[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative pb-24 flex flex-col items-center z-20 gap-4">
          <button
            onClick={() => onStartReading("essay")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-sans font-semibold text-xs active:scale-95 transition-all cursor-pointer bg-slate-950/20 backdrop-blur-sm"
          >
            {t.landing.startReading}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Páginas 2-4: se superponen al vídeo con transición */}
      <AnimatePresence mode="wait">
        {page > 0 && (
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full overflow-y-auto"
            id="landing-pages"
          >
          {/* ══════════ PÁGINA 2: PALABRAS FLOTANTES ══════════ */}
          {page === 1 && (
            <FloatingWords
              language={language}
              theme={theme}
              fullHeight
              onSelect={(mode, targetId) => onStartReading(mode, targetId)}
            />
          )}

          {/* ══════════ PÁGINA 3: LAS CLAVES ══════════ */}
          {page === 2 && (
            <section className={`h-full overflow-y-auto px-6 sm:px-12 py-16 flex flex-col ${tc.bg}`}>
              <div className="my-auto w-full">
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <span className={`text-xs font-mono uppercase tracking-[0.2em] ${tc.accentText} bg-amber-500/10 px-3 py-1 rounded-full font-bold`}>
                  {t.landing.sectionLabel}
                </span>
                <h2 className="text-3xl md:text-5xl font-display italic mt-2">
                  {t.landing.bridgeTitle}
                </h2>
                <p className={`text-base md:text-lg leading-relaxed ${tc.textMuted} font-serif`}>
                  <em>{t.header.bookTitle}</em> {t.landing.synopsis}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-14 max-w-5xl mx-auto w-full">
                <div className={`p-8 rounded-2xl border ${tc.cardBg} space-y-4 transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.accentBg} ${tc.accentText}`}>
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-semibold">{t.landing.card1Title}</h3>
                  <p className={`text-sm leading-relaxed ${tc.textMuted} font-sans`}>
                    {t.landing.card1Desc}
                  </p>
                </div>
                <div className={`p-8 rounded-2xl border ${tc.cardBg} space-y-4 transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.accentBg} ${tc.accentText}`}>
                    <Waves className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-semibold">{t.landing.card2Title}</h3>
                  <p className={`text-sm leading-relaxed ${tc.textMuted} font-sans`}>
                    {t.landing.card2Desc}
                  </p>
                </div>
                <div className={`p-8 rounded-2xl border ${tc.cardBg} space-y-4 transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.accentBg} ${tc.accentText}`}>
                    <Network className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-semibold">{t.landing.card3Title}</h3>
                  <p className={`text-sm leading-relaxed ${tc.textMuted} font-sans`}>
                    {t.landing.card3Desc}
                  </p>
                </div>
              </div>
              </div>
            </section>
          )}

          {/* ══════════ PÁGINA 4: MODOS DE LECTURA ══════════ */}
          {page === 3 && (
            <section className={`h-full overflow-y-auto px-6 py-16 flex flex-col ${tc.bg}`}>
              <div className="my-auto w-full">
              <div className="max-w-6xl mx-auto w-full">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                  <h2 className="text-3xl md:text-4xl font-display italic">
                    {t.landing.pathsTitle}
                  </h2>
                  <p className={`text-sm ${tc.textMuted} font-sans`}>
                    {t.landing.pathsSubtitle}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    onClick={() => onStartReading("essay")}
                    className={`p-6 rounded-2xl border ${tc.cardBg} ${tc.cardHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[230px]`}
                  >
                    <div className="space-y-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tc.accentBg} ${tc.accentText} group-hover:scale-110 transition-transform`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-display font-bold">{t.landing.pathEssayTitle}</h4>
                        <p className={`text-xs ${tc.textMuted} font-sans mt-2 leading-relaxed`}>
                          {t.landing.pathEssayDesc}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${tc.accentText} mt-4`}>
                      <span>{t.landing.pathEssayBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div
                    onClick={() => onStartReading("cuentos")}
                    className={`p-6 rounded-2xl border ${tc.cardBg} ${tc.cardHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[230px]`}
                  >
                    <div className="space-y-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tc.accentBg} ${tc.accentText} group-hover:scale-110 transition-transform`}>
                        <Feather className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-display font-bold">{t.landing.pathCuentosTitle}</h4>
                        <p className={`text-xs ${tc.textMuted} font-sans mt-2 leading-relaxed`}>
                          {t.landing.pathCuentosDesc}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${tc.accentText} mt-4`}>
                      <span>{t.landing.pathCuentosBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div
                    onClick={() => onStartReading("poemas")}
                    className={`p-6 rounded-2xl border ${tc.cardBg} ${tc.cardHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[230px]`}
                  >
                    <div className="space-y-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tc.accentBg} ${tc.accentText} group-hover:scale-110 transition-transform`}>
                        <Book className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-display font-bold">{t.landing.pathPoemasTitle}</h4>
                        <p className={`text-xs ${tc.textMuted} font-sans mt-2 leading-relaxed`}>
                          {t.landing.pathPoemasDesc}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${tc.accentText} mt-4`}>
                      <span>{t.landing.pathPoemasBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div
                    onClick={() => onStartReading("reconstruccion")}
                    className={`p-6 rounded-2xl border ${tc.cardBg} ${tc.cardHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[230px]`}
                  >
                    <div className="space-y-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tc.accentBg} ${tc.accentText} group-hover:scale-110 transition-transform`}>
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-display font-bold">{t.landing.pathReconTitle}</h4>
                        <p className={`text-xs ${tc.textMuted} font-sans mt-2 leading-relaxed`}>
                          {t.landing.pathReconDesc}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${tc.accentText} mt-4`}>
                      <span>{t.landing.pathReconBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Footer dentro de la última página */}
                <div className="text-center mt-14 space-y-3">
                  <p className="font-display italic text-lg leading-none">
                    {t.header.bookTitle}
                  </p>
                  <p className={`text-xs ${tc.textMuted} font-sans`}>
                    {t.landing.footerTagline}
                  </p>
                  <div className="h-px w-16 bg-amber-500/30 mx-auto my-3" />
                  <p className={`text-[10px] font-mono ${tc.textMuted} uppercase tracking-widest`}>
                    © {new Date().getFullYear()} Íñigo Barrera Barceló. {t.landing.footerRights}
                  </p>
                </div>
              </div>
              </div>
            </section>
          )}

          {/* ══════════ PÁGINA 5: MAPA DE RELACIONES ══════════ */}
          {page === 4 && (
            <section className={`h-full overflow-y-auto px-6 py-16 flex flex-col ${tc.bg}`}>
              <div className="my-auto w-full">
                <div className="max-w-5xl mx-auto w-full">
                  <RelationsGraph
                    theme={theme}
                    language={language}
                    onSelectChapter={(id, mode) => onStartReading(mode, id)}
                  />
                </div>
              </div>
            </section>
          )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ NAVEGACIÓN SECUENCIAL (fija) ══════════ */}
      {/* Flecha anterior */}
      {page > 0 ? (
        <button
          onClick={goPrev}
          aria-label={t.landing.prevPage}
          className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => setPage(TOTAL_PAGES - 1)}
          aria-label={language === "es" ? "Ir al Mapa de Relaciones" : "Go to Relations Map"}
          className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Flecha siguiente */}
      {page < TOTAL_PAGES - 1 && (
        <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center">
          {page === 0 && (
            <motion.div
              className="absolute -inset-2.5 rounded-full bg-amber-500/20 blur-md pointer-events-none"
              animate={{
                scale: [0.95, 1.18, 0.95],
                opacity: [0.35, 0.75, 0.35],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          <button
            onClick={goNext}
            aria-label={t.landing.nextPage}
            className="p-4 sm:p-5 rounded-full border border-amber-500/40 bg-amber-500/15 backdrop-blur-md text-amber-400 hover:bg-amber-500/30 hover:border-amber-500/80 transition-all active:scale-90 cursor-pointer shadow-lg z-10"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Puntos de progreso + etiqueta */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-slate-400 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          {pageLabels[page]}
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={pageLabels[i]}
              className={`rounded-full transition-all cursor-pointer ${
                i === page
                  ? "w-6 h-2 bg-amber-400"
                  : "w-2 h-2 bg-slate-500/60 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>



      <SoundControl
        isMuted={isMuted}
        onToggleMute={toggleMute}
        volume={volume}
        onVolumeChange={setVolume}
        muteLabel={t.landing.muteOn}
        unmuteLabel={t.landing.muteOff}
      />
    </div>
  );
};
