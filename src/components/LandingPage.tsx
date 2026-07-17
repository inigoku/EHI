import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Compass, Heart, Layers, ArrowDown, ArrowRight, Book, Feather, Waves, Network } from "lucide-react";
import { ReadingTheme } from "./ReadingSettings";
import { Language, uiStrings } from "../i18n";
import { LanguageToggle } from "./LanguageToggle";
import { SoundControl } from "./SoundControl";
import { useAudioPrefs } from "../hooks/useAudioPrefs";

interface LandingPageProps {
  theme: ReadingTheme;
  language: Language;
  setLanguage: (language: Language) => void;
  onStartReading: (mode: "essay" | "cuentos" | "poemas" | "reconstruccion", chapterId?: string) => void;
  openGlossary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  language,
  setLanguage,
  onStartReading,
  openGlossary,
}) => {
  const t = uiStrings[language];
  const INTRO_PHRASES = t.landing.introPhrases;
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const infoSectionRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
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

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 1.0;
    }
  }, []);

  const handleLoadedData = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 1.0;
    }
  };

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 1.0;
      videoRef.current.play().catch(() => {});
    }
  };

  const scrollToInfo = () => {
    infoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  return (
    <div className={`min-h-screen ${tc.bg} ${tc.text} transition-colors duration-300 overflow-x-hidden`}>
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative w-full h-[90vh] flex flex-col justify-between overflow-hidden bg-slate-950 z-10">
        {/* Background Video */}
        <video
          ref={videoRef}
          src="/eHI-intro.mp4#t=1.0"
          className="absolute inset-0 w-full h-full object-cover opacity-80 select-none pointer-events-none"
          autoPlay
          muted
          playsInline
          onLoadedData={handleLoadedData}
          onEnded={handleEnded}
        />

        {/* Background Audio */}
        <audio
          ref={audioRef}
          src="/dream-in-orbit.mp3"
          loop
          autoPlay
        />

        {/* Ambient Dark Gradients (Softer to let the video shine) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.4))] pointer-events-none" />

        {/* Floating Top Header inside Hero */}
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
            <button
              onClick={() => onStartReading("essay")}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              {t.nav.essay}
            </button>
            <button
              onClick={() => onStartReading("cuentos")}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              {t.nav.cuentos}
            </button>
            <button
              onClick={() => onStartReading("poemas")}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              {t.nav.poemas}
            </button>
            <button
              onClick={() => onStartReading("reconstruccion")}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              {t.nav.reconstruccion}
            </button>
            <button
              onClick={openGlossary}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              {t.sidebar.glossary}
            </button>
            <LanguageToggle language={language} setLanguage={setLanguage} variant="dark" />
            <button
              onClick={() => onStartReading("essay")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl border border-white/10 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              {t.landing.start}
            </button>
          </div>
        </header>

        {/* Center: Large Trailer-style Phrases */}
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

        {/* Bottom Hero Controls */}
        <div className="relative pb-10 flex flex-col items-center z-20 gap-4">
          <button
            onClick={() => onStartReading("essay")}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 text-slate-950 font-sans font-bold hover:bg-amber-400 active:scale-95 transition-all shadow-xl shadow-amber-500/10 cursor-pointer"
          >
            {t.landing.startReading}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={scrollToInfo}
            className="text-slate-400 hover:text-white flex flex-col items-center text-xs tracking-widest font-sans transition-colors cursor-pointer mt-4"
          >
            <span>{t.landing.discoverMore}</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-1"
            >
              <ArrowDown className="w-4 h-4 text-amber-500" />
            </motion.div>
          </button>
        </div>
      </section>

      {/* 2. Synopsis Section */}
      <section ref={infoSectionRef} className="py-24 px-6 sm:px-12 max-w-5xl mx-auto relative z-20">
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

        {/* The 3 Core Ideas Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {/* Card 1 */}
          <div className={`p-8 rounded-2xl border ${tc.cardBg} space-y-4 transition-all duration-300`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.accentBg} ${tc.accentText}`}>
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-semibold">{t.landing.card1Title}</h3>
            <p className={`text-sm leading-relaxed ${tc.textMuted} font-sans`}>
              {t.landing.card1Desc}
            </p>
          </div>

          {/* Card 2 */}
          <div className={`p-8 rounded-2xl border ${tc.cardBg} space-y-4 transition-all duration-300`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.accentBg} ${tc.accentText}`}>
              <Waves className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-semibold">{t.landing.card2Title}</h3>
            <p className={`text-sm leading-relaxed ${tc.textMuted} font-sans`}>
              {t.landing.card2Desc}
            </p>
          </div>

          {/* Card 3 */}
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
      </section>

      {/* 3. The 4 Reading Paths Section */}
      <section className={`py-24 ${theme === "cosmic" ? "bg-slate-950/40" : theme === "sepia" ? "bg-[#FAF6EE]/50" : "bg-neutral-50"} border-t border-b ${tc.border} relative z-20`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-display italic">
              {t.landing.pathsTitle}
            </h2>
            <p className={`text-sm ${tc.textMuted} font-sans`}>
              {t.landing.pathsSubtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Path 1: Ensayo */}
            <div
              onClick={() => onStartReading("essay")}
              className={`p-6 rounded-2xl border ${tc.cardBg} ${tc.cardHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[250px]`}
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

            {/* Path 2: Cuentos */}
            <div
              onClick={() => onStartReading("cuentos")}
              className={`p-6 rounded-2xl border ${tc.cardBg} ${tc.cardHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[250px]`}
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

            {/* Path 3: Poemas */}
            <div
              onClick={() => onStartReading("poemas")}
              className={`p-6 rounded-2xl border ${tc.cardBg} ${tc.cardHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[250px]`}
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

            {/* Path 4: Reconstrucción */}
            <div
              onClick={() => onStartReading("reconstruccion")}
              className={`p-6 rounded-2xl border ${tc.cardBg} ${tc.cardHover} transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[250px]`}
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
        </div>
      </section>

      {/* 4. Footer */}
      <footer className={`py-12 border-t ${tc.border} text-center relative z-20`}>
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <p className="font-display italic text-lg leading-none">
            {t.header.bookTitle}
          </p>
          <p className={`text-xs ${tc.textMuted} font-sans`}>
            {t.landing.footerTagline}
          </p>
          <div className={`h-px w-16 bg-amber-500/30 mx-auto my-4`} />
          <p className={`text-[10px] font-mono ${tc.textMuted} uppercase tracking-widest`}>
            © {new Date().getFullYear()} Íñigo Barrera Barceló. {t.landing.footerRights}
          </p>
        </div>
      </footer>

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
