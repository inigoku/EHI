import React from "react";
import { motion } from "motion/react";
import { BookOpen, Feather, Book, Layers, ArrowRight } from "lucide-react";
import { ReadingTheme } from "./ReadingSettings";
import { Language, uiStrings } from "../i18n";
import { allChapters, cuentosList } from "../chapters";

// @ts-ignore
import essayLandingImg from "../assets/images/landing/essay_landing.jpg";
// @ts-ignore
import storiesLandingImg from "../assets/images/landing/stories_landing.png";
// @ts-ignore
import poemsLandingImg from "../assets/images/landing/poems_landing.png";
// @ts-ignore
import reconstructLandingImg from "../assets/images/landing/reconstruct_landing.png";

type ReadingMode = "essay" | "cuentos" | "poemas" | "reconstruccion";

interface PathLandingProps {
  mode: ReadingMode;
  theme: ReadingTheme;
  language: Language;
  onClose: () => void;
  onSelectChapter?: (chapterId: string, mode: "essay" | "cuentos") => void;
}

interface PathContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  btnText: string;
}

export const PathLanding: React.FC<PathLandingProps> = ({
  mode,
  theme,
  language,
  onClose,
  onSelectChapter,
}) => {
  const [activeTab, setActiveTab] = React.useState<"presentation" | "graph">("presentation");
  const t = uiStrings[language].pathLanding;
  
  const content = React.useMemo<PathContent>(() => {
    switch (mode) {
      case "essay":
        return {
          title: t.essayTitle,
          subtitle: t.essaySubtitle,
          description: t.essayDescription,
          image: essayLandingImg,
          icon: <BookOpen className="w-5 h-5" />,
          btnText: t.essayBtn,
        };
      case "cuentos":
        return {
          title: t.cuentosTitle,
          subtitle: t.cuentosSubtitle,
          description: t.cuentosDescription,
          image: storiesLandingImg,
          icon: <Feather className="w-5 h-5" />,
          btnText: t.cuentosBtn,
        };
      case "poemas":
        return {
          title: t.poemasTitle,
          subtitle: t.poemasSubtitle,
          description: t.poemasDescription,
          image: poemsLandingImg,
          icon: <Book className="w-5 h-5" />,
          btnText: t.poemasBtn,
        };
      case "reconstruccion":
      default:
        return {
          title: t.reconTitle,
          subtitle: t.reconSubtitle,
          description: t.reconDescription,
          image: reconstructLandingImg,
          icon: <Layers className="w-5 h-5" />,
          btnText: t.reconBtn,
        };
    }
  }, [mode, t]);

  const textStrings = React.useMemo(() => {
    return {
      es: {
        presentation: "Presentación",
        graph: "Mapa de Relaciones",
        graphTitle: "Constelación de Capítulos",
        graphDesc: "Un plano interactivo de los horizontes del ensayo y sus cuentos de soporte. Pulsa un nodo para ver sus detalles.",
        readChapter: "Comenzar Lectura",
        readCuento: "Leer Cuento Relacionado",
        story: "Relato de Acompañamiento",
        connections: "Nodos Conectados",
        noCuentos: "Este capítulo es de lectura teórica pura",
      },
      en: {
        presentation: "Overview",
        graph: "Relations Map",
        graphTitle: "Chapter Constellation",
        graphDesc: "An interactive layout of the essay's conceptual horizons and their narrative stories. Select any node to browse.",
        readChapter: "Start Reading",
        readCuento: "Read Related Story",
        story: "Narrative Story",
        connections: "Linked Connections",
        noCuentos: "This chapter is pure theoretical reading",
      }
    }[language];
  }, [language]);

  // Filter core essay chapters
  const essayChapters = React.useMemo(() => {
    return allChapters.filter(c => 
      c.section && (
        c.section.includes("PRIMERA PARTE") || 
        c.section.includes("SEGUNDA PARTE") || 
        c.section.includes("TERCERA PARTE") || 
        c.section.includes("CUARTA PARTE") ||
        c.section.includes("INTERLUDIO") ||
        c.id === "cap20_5"
      )
    );
  }, []);

  const centerX = 400;
  const centerY = 205;
  const radius = 135;

  const nodes = React.useMemo(() => {
    return essayChapters.map((ch, idx) => {
      const angle = (idx / essayChapters.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      let color = "amber";
      if (ch.section?.includes("PRIMERA PARTE")) {
        color = "cyan";
      } else if (ch.section?.includes("SEGUNDA PARTE")) {
        color = "emerald";
      } else if (ch.section?.includes("TERCERA PARTE")) {
        color = "orange";
      } else if (ch.section?.includes("INTERLUDIO")) {
        color = "cyan";
      } else if (ch.id === "cap20_5") {
        color = "amber";
      }
      
      return {
        id: ch.id,
        chapterNumber: ch.chapterNumber || String(idx + 1),
        title: ch.title,
        subtitle: ch.subtitle || "",
        section: ch.section || "",
        linkedCuentosId: ch.linkedCuentosId,
        x,
        y,
        angle,
        color,
        chapter: ch,
      };
    });
  }, [essayChapters]);

  const cuentoNodes = React.useMemo(() => {
    return cuentosList.map((cuento) => {
      const parentNode = nodes.find(n => n.id === cuento.linkedChapterId || (n.linkedCuentosId === cuento.id));
      if (!parentNode) return null;
      
      const offsetRadius = 38;
      const angleOffset = 0.08;
      const x = centerX + (radius + offsetRadius) * Math.cos(parentNode.angle + angleOffset);
      const y = centerY + (radius + offsetRadius) * Math.sin(parentNode.angle + angleOffset);
      
      return {
        id: cuento.id,
        title: cuento.title,
        chapterNumber: "C",
        parentX: parentNode.x,
        parentY: parentNode.y,
        linkedChapterId: parentNode.id,
        x,
        y,
        cuento,
      };
    }).filter(Boolean) as Array<{
      id: string;
      title: string;
      chapterNumber: string;
      parentX: number;
      parentY: number;
      linkedChapterId: string;
      x: number;
      y: number;
      cuento: any;
    }>;
  }, [nodes]);

  const [selectedNodeId, setSelectedNodeId] = React.useState<string>(() => nodes[0]?.id || "");

  const selectedInfo = React.useMemo(() => {
    const essayNode = nodes.find(n => n.id === selectedNodeId);
    if (essayNode) {
      return {
        type: "essay" as const,
        id: essayNode.id,
        number: essayNode.chapterNumber,
        title: essayNode.title,
        subtitle: essayNode.subtitle,
        section: essayNode.section,
        color: essayNode.color,
        linkedId: essayNode.linkedCuentosId,
      };
    }
    const cuentoNode = cuentoNodes.find(c => c.id === selectedNodeId);
    if (cuentoNode) {
      return {
        type: "cuentos" as const,
        id: cuentoNode.id,
        number: cuentoNode.chapterNumber,
        title: cuentoNode.title,
        subtitle: language === "es" ? "Relato de acompañamiento narrativo" : "Narrative companion story",
        section: language === "es" ? "CUENTOS: EL REFLEJO" : "STORIES: THE REFLECTION",
        color: "purple",
        linkedId: cuentoNode.linkedChapterId,
      };
    }
    return null;
  }, [selectedNodeId, nodes, cuentoNodes, language]);

  const getColorHex = React.useCallback((color: string) => {
    if (theme === "cosmic") {
      switch (color) {
        case "cyan": return "#38BDF8";
        case "emerald": return "#34D399";
        case "orange": return "#FB923C";
        case "amber": return "#FBBF24";
        case "purple": return "#C084FC";
        default: return "#94A3B8";
      }
    } else {
      switch (color) {
        case "cyan": return "#0284C7";
        case "emerald": return "#059669";
        case "orange": return "#EA580C";
        case "amber": return "#D97706";
        case "purple": return "#9333EA";
        default: return "#475569";
      }
    }
  }, [theme]);

  // Theme-based styling configurations
  const sc = React.useMemo(() => {
    switch (theme) {
      case "paper":
        return {
          bg: "bg-[#F9F6F1]",
          text: "text-[#1A1A1A]",
          textMuted: "text-[#1A1A1A]/70",
          border: "border-[#1A1A1A]/10",
          cardBg: "bg-white border-[#1A1A1A]/15 shadow-sm",
          accentText: "text-amber-700",
          accentBg: "bg-amber-100/50",
          btnPrimary: "bg-[#1A1A1A] text-white hover:bg-black",
          imgShadow: "shadow-md shadow-[#1A1A1A]/5",
          accentBorder: "border-amber-700/25",
        };
      case "sepia":
        return {
          bg: "bg-[#FAF6EE]",
          text: "text-[#2C1E11]",
          textMuted: "text-[#2C1E11]/70",
          border: "border-[#2C1E11]/10",
          cardBg: "bg-[#F3EDE0] border-[#2C1E11]/15 shadow-sm",
          accentText: "text-amber-800",
          accentBg: "bg-amber-900/10",
          btnPrimary: "bg-[#2C1E11] text-amber-50 hover:bg-amber-950",
          imgShadow: "shadow-md shadow-[#2C1E11]/5",
          accentBorder: "border-amber-850/25",
        };
      case "cosmic":
      default:
        return {
          bg: "bg-[#0D0E12]",
          text: "text-[#E4E6EB]",
          textMuted: "text-[#E4E6EB]/70",
          border: "border-[#E4E6EB]/10",
          cardBg: "bg-[#15171F] border-[#E4E6EB]/5 shadow-xl",
          accentText: "text-amber-400",
          accentBg: "bg-amber-500/10",
          btnPrimary: "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/10",
          imgShadow: "shadow-2xl shadow-black/60 border-amber-500/10",
          accentBorder: "border-amber-500/25",
        };
    }
  }, [theme]);

  return (
    <div className={`w-full max-w-5xl mx-auto py-6 sm:py-10 transition-colors duration-300`}>
      {/* Tab Switcher for Essay mode */}
      {mode === "essay" && (
        <div className={`flex justify-center border-b ${sc.border} mb-8`}>
          <nav className="-mb-px flex space-x-6 sm:space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("presentation")}
              className={`shrink-0 border-b-2 px-3 pb-3 text-xs sm:text-sm font-display font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "presentation"
                  ? `border-amber-600 ${sc.accentText} font-bold`
                  : `border-transparent ${sc.textMuted} hover:text-amber-700`
              }`}
            >
              📖 {textStrings.presentation}
            </button>
            <button
              onClick={() => setActiveTab("graph")}
              className={`shrink-0 border-b-2 px-3 pb-3 text-xs sm:text-sm font-display font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "graph"
                  ? `border-amber-600 ${sc.accentText} font-bold`
                  : `border-transparent ${sc.textMuted} hover:text-amber-700`
              }`}
            >
              🕸️ {textStrings.graph}
            </button>
          </nav>
        </div>
      )}

      {/* Render based on selected Tab */}
      {activeTab === "graph" && mode === "essay" ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-display font-medium italic">
              {textStrings.graphTitle}
            </h3>
            <p className={`text-xs sm:text-sm ${sc.textMuted} font-sans leading-relaxed`}>
              {textStrings.graphDesc}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* SVG Graph Column */}
            <div className={`lg:col-span-8 p-4 sm:p-6 rounded-2xl border ${sc.cardBg} flex items-center justify-center relative overflow-hidden min-h-[360px] lg:min-h-[460px]`}>
              {/* Starfield background decoration (only for cosmic) */}
              {theme === "cosmic" && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <circle cx="10%" cy="15%" r="1" fill="#fff" />
                  <circle cx="85%" cy="20%" r="1.5" fill="#fff" />
                  <circle cx="45%" cy="80%" r="1" fill="#fff" />
                  <circle cx="20%" cy="70%" r="2" fill="#fff" opacity="0.4" />
                  <circle cx="90%" cy="65%" r="1.2" fill="#fff" />
                </svg>
              )}
              
              <svg
                viewBox="0 0 800 410"
                className="w-full h-auto max-h-[50vh] select-none z-10"
              >
                {/* Glow Filter */}
                <defs>
                  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Drawing Sequential Links */}
                {nodes.map((node, idx) => {
                  if (idx === nodes.length - 1) return null;
                  const nextNode = nodes[idx + 1];
                  const isHighlighted = selectedNodeId === node.id || selectedNodeId === nextNode.id;
                  return (
                    <line
                      key={`seq-link-${idx}`}
                      x1={node.x}
                      y1={node.y}
                      x2={nextNode.x}
                      y2={nextNode.y}
                      stroke={
                        isHighlighted
                          ? getColorHex(node.color)
                          : theme === "cosmic"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.08)"
                      }
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Satellite Cuento Links */}
                {cuentoNodes.map((cn) => {
                  const isHighlighted = selectedNodeId === cn.id || selectedNodeId === cn.linkedChapterId;
                  return (
                    <line
                      key={`cuento-link-${cn.id}`}
                      x1={cn.parentX}
                      y1={cn.parentY}
                      x2={cn.x}
                      y2={cn.y}
                      stroke={
                        isHighlighted
                          ? getColorHex("purple")
                          : theme === "cosmic"
                          ? "rgba(168, 85, 247, 0.18)"
                          : "rgba(147, 51, 234, 0.18)"
                      }
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={isHighlighted ? "none" : "2 2"}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Render Essay Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const colorHex = getColorHex(node.color);
                  
                  return (
                    <g
                      key={`essay-node-${node.id}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      {/* Pulse Circle for selected node */}
                      {isSelected && (
                        <motion.circle
                          cx={node.x}
                          cy={node.y}
                          r={21}
                          fill="none"
                          stroke={colorHex}
                          strokeWidth={1}
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        />
                      )}

                      {/* Glow circle behind */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 15 : 12.5}
                        fill={theme === "cosmic" ? "#0D0E12" : "#fff"}
                        stroke={colorHex}
                        strokeWidth={isSelected ? 3.2 : 1.8}
                        filter={isSelected ? "url(#glow)" : undefined}
                        className="transition-all duration-300"
                      />

                      {/* Number Text */}
                      <text
                        x={node.x}
                        y={node.y}
                        dy=".35em"
                        textAnchor="middle"
                        className={`font-mono text-[9px] font-bold ${
                          theme === "cosmic" ? "fill-slate-300" : "fill-slate-800"
                        }`}
                      >
                        {node.chapterNumber}
                      </text>

                      {/* Small floating tooltip-like label when selected */}
                      {isSelected && (
                        <g>
                          <rect
                            x={node.x - 65}
                            y={node.y - 31}
                            width={130}
                            height={15}
                            rx={4}
                            fill={theme === "cosmic" ? "#15171F" : "#F3EDE0"}
                            stroke={colorHex}
                            strokeWidth={0.5}
                            opacity={0.92}
                          />
                          <text
                            x={node.x}
                            y={node.y - 21}
                            textAnchor="middle"
                            className={`font-sans text-[7.5px] font-semibold tracking-wider ${
                              theme === "cosmic" ? "fill-slate-200" : "fill-slate-800"
                            }`}
                          >
                            {node.title.length > 20 ? `${node.title.substring(0, 18)}...` : node.title}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Render Cuento Nodes */}
                {cuentoNodes.map((cn) => {
                  const isSelected = selectedNodeId === cn.id;
                  const colorHex = getColorHex("purple");
                  
                  return (
                    <g
                      key={`cuento-node-${cn.id}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(cn.id)}
                    >
                      {/* Pulse Circle */}
                      {isSelected && (
                        <motion.circle
                          cx={cn.x}
                          cy={cn.y}
                          r={15}
                          fill="none"
                          stroke={colorHex}
                          strokeWidth={1}
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        />
                      )}

                      <circle
                        cx={cn.x}
                        cy={cn.y}
                        r={isSelected ? 9.5 : 7.5}
                        fill={theme === "cosmic" ? "#1A1525" : "#F5EFFF"}
                        stroke={colorHex}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        filter={isSelected ? "url(#glow)" : undefined}
                        className="transition-all duration-300"
                      />

                      <text
                        x={cn.x}
                        y={cn.y}
                        dy=".35em"
                        textAnchor="middle"
                        className="font-mono text-[7px] font-bold fill-purple-400"
                      >
                        {cn.chapterNumber}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Info Card Column */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              {selectedInfo ? (
                <motion.div
                  key={`info-${selectedInfo.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`p-6 rounded-2xl border ${sc.cardBg} space-y-4 shadow-lg flex-1 flex flex-col justify-between min-h-[300px]`}
                >
                  <div className="space-y-3">
                    {/* Header Tag */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full ${
                        selectedInfo.color === "cyan" ? "bg-cyan-500/10 text-cyan-400" :
                        selectedInfo.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                        selectedInfo.color === "orange" ? "bg-orange-500/10 text-orange-400" :
                        selectedInfo.color === "amber" ? "bg-amber-500/10 text-amber-400" :
                        "bg-purple-500/10 text-purple-400"
                      }`}>
                        {selectedInfo.type === "essay" 
                          ? `${language === "es" ? "Ensayo - Cap." : "Essay - Ch."} ${selectedInfo.number}` 
                          : textStrings.story}
                      </span>
                      <span className={`text-[9px] font-mono uppercase tracking-wider font-semibold ${sc.textMuted}`}>
                        {selectedInfo.section.split(":")[0]}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h4 className="text-xl sm:text-2xl font-display font-medium italic leading-snug">
                        {selectedInfo.title}
                      </h4>
                      {selectedInfo.subtitle && (
                        <p className={`text-xs font-sans tracking-wide font-medium leading-relaxed ${sc.accentText}`}>
                          {selectedInfo.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="h-px bg-amber-500/10 my-2" />

                    {/* Connections Links */}
                    {selectedInfo.type === "essay" && (
                      <div className="space-y-2">
                        <span className={`text-[9px] font-mono uppercase tracking-wider block ${sc.textMuted}`}>
                          {textStrings.connections}
                        </span>
                        {selectedInfo.linkedId ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-purple-400">🔮</span>
                            <button
                              onClick={() => setSelectedNodeId(selectedInfo.linkedId!)}
                              className="text-purple-400 hover:text-purple-300 font-sans font-medium text-left hover:underline cursor-pointer transition-colors"
                            >
                              {cuentosList.find(c => c.id === selectedInfo.linkedId)?.title}
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs font-sans italic ${sc.textMuted}`}>
                            {textStrings.noCuentos}
                          </span>
                        )}
                      </div>
                    )}

                    {selectedInfo.type === "cuentos" && (
                      <div className="space-y-2">
                        <span className={`text-[9px] font-mono uppercase tracking-wider block ${sc.textMuted}`}>
                          {textStrings.connections}
                        </span>
                        {selectedInfo.linkedId && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-amber-500">📖</span>
                            <button
                              onClick={() => setSelectedNodeId(selectedInfo.linkedId!)}
                              className={`hover:underline font-sans font-medium text-left cursor-pointer transition-colors ${sc.accentText}`}
                            >
                              {allChapters.find(c => c.id === selectedInfo.linkedId)?.title}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Actions */}
                  <div className="pt-6">
                    <button
                      onClick={() => {
                        if (onSelectChapter) {
                          onSelectChapter(selectedInfo.id, selectedInfo.type);
                        } else {
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-bold hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer ${sc.btnPrimary}`}
                    >
                      {selectedInfo.type === "essay" ? textStrings.readChapter : textStrings.readCuento}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className={`p-6 rounded-2xl border ${sc.cardBg} flex-1 flex items-center justify-center`}>
                  <p className={`text-xs font-sans italic ${sc.textMuted}`}>
                    Selecciona un nodo para iniciar
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        /* Presentación Grid (Standard Cover layout) */
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text and CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="md:col-span-7 space-y-6 order-2 md:order-1"
          >
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${sc.accentBg} ${sc.accentText}`}>
                {content.icon}
              </span>
              <span className={`text-xs font-mono uppercase tracking-[0.2em] font-bold ${sc.accentText}`}>
                {t.explorationLine}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium italic leading-tight">
                {content.title}
              </h2>
              <h3 className={`text-sm sm:text-base font-sans tracking-wide font-medium ${sc.accentText}`}>
                {content.subtitle}
              </h3>
            </div>

            <div className={`h-px w-20 bg-amber-500/30`} />

            <p className={`text-sm sm:text-base leading-relaxed ${sc.textMuted} font-serif`}>
              {content.description}
            </p>

            <div className="pt-4">
              <button
                onClick={onClose}
                className={`flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-sans font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${sc.btnPrimary}`}
              >
                {content.btnText}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Illustration Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 order-1 md:order-2 flex justify-center"
          >
            <div className={`relative max-w-[320px] md:max-w-full w-full rounded-2xl overflow-hidden border ${sc.cardBg} ${sc.imgShadow} group`}>
              {/* Ambient background glow for cosmic theme */}
              {theme === "cosmic" && (
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none" />
              )}
              
              <div className="relative aspect-[4/5] sm:aspect-square md:aspect-[3/4] overflow-hidden bg-slate-950">
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
