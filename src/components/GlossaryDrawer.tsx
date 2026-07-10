import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, Lightbulb, Activity } from "lucide-react";

export interface GlossaryTerm {
  term: string;
  physicsName: string;
  metaphor: string;
  description: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Horizonte",
    physicsName: "Horizonte de sucesos",
    metaphor: "La piel de la burbuja",
    description: "La frontera causal que separa un 'adentro' de un 'afuera'. No es una barrera material física, sino un límite geométrico y de información más allá del cual ningún suceso exterior puede penetrar y nada del interior puede escapar."
  },
  {
    term: "Reservorio",
    physicsName: "Vacío cuántico / Campo primordial",
    metaphor: "El océano antes de las olas",
    description: "El campo continuo de potencialidad pura del que emergen todas las conciencias individuales y al que regresan al disolverse. En física cuántica, el vacío no está vacío, sino lleno de energía y fluctuaciones que dan origen a la materia."
  },
  {
    term: "Phi (Φ)",
    physicsName: "Información integrada",
    metaphor: "Qué tan 'red' es una red",
    description: "La medida cuantitativa de la conciencia según la IIT. Representa cuánta información genera un sistema unificado por encima de la simple suma de sus partes. Un cerebro despierto tiene un Phi alto; anestesiado o dispersado tiene un Phi bajo."
  },
  {
    term: "Scrambling",
    physicsName: "Dispersión cuántica de información",
    metaphor: "Echar tinta en agua",
    description: "El proceso por el cual la información local se esparce e integra tan profundamente en el entorno que se vuelve indetectable de forma individual. La información no desaparece (se conserva físicamente), pero es operativamente inaccesible."
  },
  {
    term: "Entrelazamiento",
    physicsName: "Correlación no-local (EPR / ER)",
    metaphor: "Dos cuerdas de guitarra que vibran juntas",
    description: "La conexión invisible y geométrica entre dos partes de un sistema que han estado en contacto. Según el postulado ER=EPR, las partículas entrelazadas comparten un túnel microscópico en el espacio-tiempo que une sus interiores."
  },
  {
    term: "Transición de fase",
    physicsName: "Cambio de estado crítico",
    metaphor: "Agua que se convierte en hielo",
    description: "El momento exacto en que un cambio cuantitativo continuo resulta en un salto cualitativo abrupto. El cerebro cruzando de un feto en desarrollo a una conciencia individual es una transición de fase organizativa."
  },
  {
    term: "Soft hair / huella",
    physicsName: "Deformación permanente del vacío",
    metaphor: "La forma que el viento dejó en el agua",
    description: "Las marcas permanentes e infinitesimales que un horizonte deja en la geometría del espacio-tiempo o del reservorio tras evaporarse. Asegura que lo que existió deja una firma geométrica eterna en el universo."
  }
];

interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTermName?: string;
  theme: string;
}

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({ isOpen, onClose, selectedTermName, theme }) => {
  const [activeTerm, setActiveTerm] = React.useState<GlossaryTerm>(glossaryTerms[0]);

  React.useEffect(() => {
    if (selectedTermName) {
      const found = glossaryTerms.find(
        (t) =>
          t.term.toLowerCase().includes(selectedTermName.toLowerCase()) ||
          t.physicsName.toLowerCase().includes(selectedTermName.toLowerCase())
      );
      if (found) {
        setActiveTerm(found);
      }
    }
  }, [selectedTermName]);

  const sc = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          bg: "bg-[#F9F6F1]",
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/60",
          border: "border-[#1A1A1A]/10",
          icon: "text-[#1A1A1A]",
          card: "bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]",
          itemActive: "bg-[#1A1A1A] border border-[#1A1A1A] text-[#F9F6F1]",
          itemInactive: "bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
          metaBox: "bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A]",
          physBox: "bg-[#1A1A1A]/10 border border-[#1A1A1A]/10 text-[#1A1A1A]",
          buttonClose: "hover:bg-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:text-[#1A1A1A]",
          label: "text-[#1A1A1A]/80 font-semibold font-sans uppercase",
        };
      case "sepia":
        return {
          bg: "bg-[#FAF6EE]",
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/60",
          border: "border-[#2C1E11]/10",
          icon: "text-amber-800",
          card: "bg-amber-800/5 border border-[#2C1E11]/10 text-[#2C1E11]",
          itemActive: "bg-[#2C1E11] border border-[#2C1E11] text-[#FAF6EE]",
          itemInactive: "bg-[#2C1E11]/5 border border-[#2C1E11]/10 hover:bg-[#2C1E11]/10 text-[#2C1E11]",
          metaBox: "bg-amber-800/5 border border-amber-800/10 text-amber-900",
          physBox: "bg-[#2C1E11]/10 border border-[#2C1E11]/10 text-[#2C1E11]",
          buttonClose: "hover:bg-[#2C1E11]/10 text-[#2C1E11]/60 hover:text-[#2C1E11]",
          label: "text-amber-800 font-semibold font-sans uppercase",
        };
      case "cosmic":
      default:
        return {
          bg: "bg-[#14161D]",
          text: "text-[#E4E6EB]",
          textMuted: "text-[#E4E6EB]/60",
          border: "border-slate-800",
          icon: "text-amber-500",
          card: "bg-[#14161D]/40 border border-slate-800 text-[#E4E6EB]",
          itemActive: "bg-slate-900 border border-indigo-500/50 text-indigo-400 shadow-md shadow-indigo-500/5",
          itemInactive: "bg-slate-950/40 border border-slate-800 hover:border-slate-700 text-slate-300",
          metaBox: "bg-amber-500/5 border border-amber-500/10 text-amber-300",
          physBox: "bg-indigo-950/20 border border-indigo-500/20 text-indigo-300",
          buttonClose: "hover:bg-slate-800 text-slate-400 hover:text-slate-200",
          label: "text-amber-500 font-mono uppercase",
        };
    }
  }, [theme]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 w-full max-w-md ${sc.bg} border-l ${sc.border} shadow-2xl z-50 flex flex-col h-full ${sc.text}`}
          >
            {/* Header */}
            <div className={`p-5 border-b ${sc.border} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <BookOpen className={`w-5 h-5 ${sc.icon}`} />
                <h3 className="font-display font-medium text-lg tracking-wide">
                  El Experimento Explicado
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${sc.buttonClose}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content list & detail split */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Metaphor table card list */}
              <div className="grid grid-cols-2 gap-2 font-sans">
                {glossaryTerms.map((t) => {
                  const isActive = activeTerm.term === t.term;
                  return (
                    <button
                      key={t.term}
                      onClick={() => setActiveTerm(t)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive ? sc.itemActive : sc.itemInactive
                      }`}
                    >
                      <div className="font-display font-semibold text-xs tracking-wide">{t.term}</div>
                      <div className="text-[10px] font-sans mt-1 italic truncate opacity-80">
                        {t.metaphor}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detail view card */}
              <motion.div
                key={activeTerm.term}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${sc.card} rounded-2xl p-5 space-y-4`}
              >
                <div>
                  <div className={`text-[10px] tracking-wider ${sc.label} font-medium`}>
                    Concepto de la Hipótesis
                  </div>
                  <h4 className="font-display text-xl font-semibold mt-1">
                    {activeTerm.term}
                  </h4>
                </div>

                <div className={`flex gap-3 p-3 rounded-xl border ${sc.physBox}`}>
                  <Activity className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
                  <div>
                    <div className="text-[10px] font-sans opacity-70">En Física se llama:</div>
                    <div className="font-sans text-xs font-semibold">
                      {activeTerm.physicsName}
                    </div>
                  </div>
                </div>

                <div className={`flex gap-3 p-3 rounded-xl border ${sc.metaBox}`}>
                  <Lightbulb className="w-5 h-5 shrink-0 mt-0.5 opacity-85" />
                  <div>
                    <div className="text-[10px] font-sans opacity-75">Para la vida diaria es como:</div>
                    <div className="font-sans text-xs font-semibold italic">
                      {activeTerm.metaphor}
                    </div>
                  </div>
                </div>

                <div className={`pt-2 border-t ${sc.border}`}>
                  <p className="font-serif text-sm leading-relaxed opacity-90">
                    {activeTerm.description}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${sc.border} text-center text-[10px] font-sans ${sc.textMuted}`}>
              Usa los términos resaltados en el texto para abrir este panel.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
