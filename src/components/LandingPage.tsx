import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Compass, Heart, Layers, ArrowDown, ArrowRight, Book, Feather } from "lucide-react";
import { ReadingTheme } from "./ReadingSettings";

interface LandingPageProps {
  theme: ReadingTheme;
  onStartReading: (mode: "essay" | "cuentos" | "poemas" | "reconstruccion", chapterId?: string) => void;
  openGlossary: () => void;
}

const INTRO_PHRASES = [
  "¿Y si tu conciencia tuviera la misma geometría que un agujero negro?",
  "Una frontera viva que separa el adentro del afuera.",
  "No guardamos recuerdos en cajones. Los proyectamos en la piel de nuestro horizonte.",
  "Un viaje entre la física cuántica, la filosofía de la mente y la experiencia humana.",
  "Cruza el límite del Horizonte Interior."
];

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onStartReading,
  openGlossary,
}) => {
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const infoSectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % INTRO_PHRASES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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
          src="/eHI-intro.mp4"
          className="absolute inset-0 w-full h-full object-cover opacity-80 select-none pointer-events-none"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Ambient Dark Gradients (Softer to let the video shine) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.4))] pointer-events-none" />

        {/* Floating Top Header inside Hero */}
        <header className="relative w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-20">
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.3em] font-sans">
              Hipótesis Holográfica
            </span>
            <span className="text-xl font-display italic text-white leading-none mt-1">
              El Horizonte Interior
            </span>
          </div>
          <div className="flex items-center gap-6 font-sans text-xs tracking-wider text-slate-300">
            <button
              onClick={() => onStartReading("essay")}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              Ensayo
            </button>
            <button
              onClick={() => onStartReading("cuentos")}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              Cuentos
            </button>
            <button
              onClick={() => onStartReading("poemas")}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              Poemas
            </button>
            <button
              onClick={() => onStartReading("reconstruccion")}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              Reconstrucción
            </button>
            <button
              onClick={openGlossary}
              className="hover:text-amber-400 transition-colors hidden sm:inline cursor-pointer"
            >
              Glosario
            </button>
            <button
              onClick={() => onStartReading("essay")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl border border-white/10 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              Comenzar
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
            Comenzar Lectura
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={scrollToInfo}
            className="text-slate-400 hover:text-white flex flex-col items-center text-xs tracking-widest font-sans transition-colors cursor-pointer mt-4"
          >
            <span>DESCUBRIR MÁS</span>
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
            El Horizonte de Sucesos de la Mente
          </span>
          <h2 className="text-3xl md:text-5xl font-display italic mt-2">
            Un puente entre la geometría y el alma
          </h2>
          <p className={`text-base md:text-lg leading-relaxed ${tc.textMuted} font-serif`}>
            <em>El Horizonte Interior</em> es una exploración sobre la conciencia que desafía las fronteras tradicionales entre la ciencia y la experiencia vital. A través del prisma de la física teórica y el principio holográfico, esta obra plantea una hipótesis atrevida: que la mente no está guardada dentro del cerebro, sino escrita en su periferia geométrica.
          </p>
        </div>

        {/* The 3 Core Ideas Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {/* Card 1 */}
          <div className={`p-8 rounded-2xl border ${tc.cardBg} space-y-4 transition-all duration-300`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.accentBg} ${tc.accentText}`}>
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-semibold">1. La Burbuja</h3>
            <p className={`text-sm leading-relaxed ${tc.textMuted} font-sans`}>
              La conciencia funciona como un horizonte. No es una barrera física, sino una frontera geométrica viva que define y organiza un interior en contraposición a un exterior.
            </p>
          </div>

          {/* Card 2 */}
          <div className={`p-8 rounded-2xl border ${tc.cardBg} space-y-4 transition-all duration-300`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.accentBg} ${tc.accentText}`}>
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-semibold">2. El Eco</h3>
            <p className={`text-sm leading-relaxed ${tc.textMuted} font-sans`}>
              La información que cruza el umbral de la conciencia no se pierde. Queda retenida en la superficie de nuestro horizonte como un eco eterno, estructurando quiénes somos.
            </p>
          </div>

          {/* Card 3 */}
          <div className={`p-8 rounded-2xl border ${tc.cardBg} space-y-4 transition-all duration-300`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.accentBg} ${tc.accentText}`}>
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-semibold">3. La Luz</h3>
            <p className={`text-sm leading-relaxed ${tc.textMuted} font-sans`}>
              El entrelazamiento cuántico y la geometría conectan horizontes individuales. Aquello que denominamos vínculos o amor es el puente geométrico entre dos interiores.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The 4 Reading Paths Section */}
      <section className={`py-24 ${theme === "cosmic" ? "bg-slate-950/40" : theme === "sepia" ? "bg-[#FAF6EE]/50" : "bg-neutral-50"} border-t border-b ${tc.border} relative z-20`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-display italic">
              Cuatro Senderos de Exploración
            </h2>
            <p className={`text-sm ${tc.textMuted} font-sans`}>
              La obra está diseñada como una estructura poliédrica. Elige la puerta que resuene con tu curiosidad.
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
                  <h4 className="text-lg font-display font-bold">Ensayo Interactivo</h4>
                  <p className={`text-xs ${tc.textMuted} font-sans mt-2 leading-relaxed`}>
                    La columna vertebral teórica. 26 capítulos donde la física moderna dialoga directamente con la metafísica y la experiencia consciente.
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${tc.accentText} mt-4`}>
                <span>Comenzar Ensayo</span>
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
                  <h4 className="text-lg font-display font-bold">Cuentos de Tarel</h4>
                  <p className={`text-xs ${tc.textMuted} font-sans mt-2 leading-relaxed`}>
                    16 relatos alegóricos. La física explicada mediante fábulas, desde la ciudad sumergida en el silencio hasta el laberinto del interruptor.
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${tc.accentText} mt-4`}>
                <span>Leer Relatos</span>
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
                  <h4 className="text-lg font-display font-bold">Antología Poética</h4>
                  <p className={`text-xs ${tc.textMuted} font-sans mt-2 leading-relaxed`}>
                    Poesía y glosarios líricos. Los ecos emocionales del horizonte traducidos en versos libres y arquitecturas metafóricas.
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${tc.accentText} mt-4`}>
                <span>Explorar Poemas</span>
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
                  <h4 className="text-lg font-display font-bold">La Reconstrucción</h4>
                  <p className={`text-xs ${tc.textMuted} font-sans mt-2 leading-relaxed`}>
                    6 planos de síntesis. Un modo integrador donde ensayo, narrativa y poesía se fusionan en pestañas en paralelo.
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${tc.accentText} mt-4`}>
                <span>Ver Planos</span>
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
            El Horizonte Interior
          </p>
          <p className={`text-xs ${tc.textMuted} font-sans`}>
            Una propuesta filosófico-científica sobre la conciencia humana.
          </p>
          <div className={`h-px w-16 bg-amber-500/30 mx-auto my-4`} />
          <p className={`text-[10px] font-mono ${tc.textMuted} uppercase tracking-widest`}>
            © {new Date().getFullYear()} Íñigo Barrera Barceló. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
