import React from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Feather } from "lucide-react";
import { ReadingTheme } from "./ReadingSettings";
import { Language } from "../i18n";
import { allChapters, cuentosList } from "../chapters";

interface RelationsGraphProps {
  theme: ReadingTheme;
  language: Language;
  onSelectChapter: (chapterId: string, mode: "essay" | "cuentos") => void;
}

export const RelationsGraph: React.FC<RelationsGraphProps> = ({
  theme,
  language,
  onSelectChapter,
}) => {
  const textStrings = React.useMemo(() => {
    return {
      es: {
        graphTitle: "Constelación de Capítulos",
        graphDesc: "Un plano interactivo de los horizontes del ensayo y sus cuentos de soporte. Pulsa un nodo para ver sus detalles.",
        readChapter: "Comenzar Lectura",
        readCuento: "Leer Cuento Relacionado",
        story: "Relato de Acompañamiento",
        connections: "Nodos Conectados",
        noCuentos: "Este capítulo es de lectura teórica pura",
      },
      en: {
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

  const conceptualLinks = React.useMemo(() => [
    { fromId: "cap1", toId: "cap8" },
    { fromId: "cap1", toId: "cap20_real" },
    { fromId: "cap2", toId: "cap10" },
    { fromId: "cap2", toId: "cap15_real" },
    { fromId: "cap3", toId: "cap11" },
    { fromId: "cap4", toId: "cap12" },
    { fromId: "cap4", toId: "cap19_real" },
    { fromId: "cap5", toId: "cap13_5" },
    { fromId: "cap5", toId: "cap18_real" },
    { fromId: "cap6", toId: "cap14_real" },
    { fromId: "cap6", toId: "cap20_5" },
    { fromId: "cap7", toId: "cap12" },
    { fromId: "cap7", toId: "cap17_real" },
    { fromId: "cap8", toId: "cap13" },
    { fromId: "cap8", toId: "cap20_real" },
    { fromId: "cap9", toId: "cap16_real" },
    { fromId: "cap10", toId: "cap18_real" },
    { fromId: "cap10", toId: "cap20_real" },
    { fromId: "cap13", toId: "cap17_real" },
    { fromId: "cap15_real", toId: "cap20_5" },
  ], []);

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
                      ? "rgba(251, 191, 36, 0.12)"
                      : "rgba(71, 85, 105, 0.1)"
                  }
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Connecting last to first (loop) */}
            {nodes.length > 1 && (() => {
              const first = nodes[0];
              const last = nodes[nodes.length - 1];
              const isHighlighted = selectedNodeId === first.id || selectedNodeId === last.id;
              return (
                <line
                  x1={last.x}
                  y1={last.y}
                  x2={first.x}
                  y2={first.y}
                  stroke={
                    isHighlighted
                      ? getColorHex(last.color)
                      : theme === "cosmic"
                      ? "rgba(251, 191, 36, 0.12)"
                      : "rgba(71, 85, 105, 0.1)"
                  }
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  className="transition-all duration-300"
                />
              );
            })()}

            {/* Drawing Conceptual Links */}
            {conceptualLinks.map((link, idx) => {
              const fromNode = nodes.find(n => n.id === link.fromId);
              const toNode = nodes.find(n => n.id === link.toId);
              if (!fromNode || !toNode) return null;
              
              const isHighlighted = selectedNodeId === fromNode.id || selectedNodeId === toNode.id;
              
              return (
                <line
                  key={`conceptual-link-${idx}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={
                    isHighlighted
                      ? theme === "cosmic"
                        ? "rgba(251, 191, 36, 0.35)"
                        : "rgba(217, 119, 6, 0.35)"
                      : theme === "cosmic"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.04)"
                  }
                  strokeWidth={isHighlighted ? 1.2 : 0.6}
                  strokeDasharray="4 4"
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })}

            {/* Orbit paths for Cuentos */}
            {cuentoNodes.map((cNode) => {
              const isHighlighted = selectedNodeId === cNode.id || selectedNodeId === cNode.linkedChapterId;
              return (
                <line
                  key={`orbit-link-${cNode.id}`}
                  x1={cNode.parentX}
                  y1={cNode.parentY}
                  x2={cNode.x}
                  y2={cNode.y}
                  stroke={
                    isHighlighted
                      ? getColorHex("purple")
                      : theme === "cosmic"
                      ? "rgba(192, 132, 252, 0.18)"
                      : "rgba(147, 51, 234, 0.12)"
                  }
                  strokeWidth={isHighlighted ? 2 : 0.8}
                  strokeDasharray="3 3"
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Render Essay Chapter Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const nodeColorHex = getColorHex(node.color);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Outer Pulsing Glow aura on hover/select */}
                  {isSelected && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={15}
                      fill="none"
                      stroke={nodeColorHex}
                      strokeWidth={2}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.8,
                        ease: "easeOut",
                      }}
                    />
                  )}

                  {/* Selection glowing background filter */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 10.5 : 8}
                    fill={isSelected ? nodeColorHex : theme === "cosmic" ? "#1e293b" : "#e2e8f0"}
                    stroke={isSelected ? nodeColorHex : theme === "cosmic" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all duration-300 shadow-md group-hover:scale-110"
                    filter={isSelected ? "url(#glow)" : undefined}
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />

                  {/* Text index */}
                  <text
                    x={node.x}
                    y={node.y + 3.5}
                    textAnchor="middle"
                    fill={isSelected ? (theme === "cosmic" ? "#0D0E12" : "#ffffff") : theme === "cosmic" ? "#94a3b8" : "#475569"}
                    className="font-sans font-bold select-none transition-colors duration-300"
                    style={{ fontSize: isSelected ? "9px" : "8px" }}
                  >
                    {node.chapterNumber}
                  </text>
                </g>
              );
            })}

            {/* Render Cuentos Satellite Nodes */}
            {cuentoNodes.map((cNode) => {
              const isSelected = selectedNodeId === cNode.id;
              const purpleHex = getColorHex("purple");

              return (
                <g
                  key={cNode.id}
                  onClick={() => setSelectedNodeId(cNode.id)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing glow for selection */}
                  {isSelected && (
                    <motion.circle
                      cx={cNode.x}
                      cy={cNode.y}
                      r={11}
                      fill="none"
                      stroke={purpleHex}
                      strokeWidth={1.5}
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 1.7, opacity: 0 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.8,
                        ease: "easeOut",
                      }}
                    />
                  )}

                  <circle
                    cx={cNode.x}
                    cy={cNode.y}
                    r={isSelected ? 7.5 : 5.5}
                    fill={isSelected ? purpleHex : theme === "cosmic" ? "#312e81" : "#faf5ff"}
                    stroke={isSelected ? purpleHex : theme === "cosmic" ? "rgba(192, 132, 252, 0.3)" : "rgba(147, 51, 234, 0.3)"}
                    strokeWidth={1}
                    className="transition-all duration-300 group-hover:scale-110"
                    filter={isSelected ? "url(#glow)" : undefined}
                    style={{ transformOrigin: `${cNode.x}px ${cNode.y}px` }}
                  />

                  <text
                    x={cNode.x}
                    y={cNode.y + 2.5}
                    textAnchor="middle"
                    fill={isSelected ? (theme === "cosmic" ? "#0D0E12" : "#ffffff") : theme === "cosmic" ? "#c084fc" : "#7c3aed"}
                    className="font-sans font-bold select-none transition-colors duration-300"
                    style={{ fontSize: isSelected ? "7px" : "6px" }}
                  >
                    {cNode.chapterNumber}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Card Column */}
        {selectedInfo && (
          <div className="lg:col-span-4 flex">
            <motion.div
              key={selectedInfo.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`w-full p-6 rounded-2xl border ${sc.cardBg} flex flex-col justify-between space-y-6`}
            >
              <div className="space-y-4">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono uppercase tracking-[0.15em] ${sc.textMuted} bg-slate-950/20 px-2 py-0.5 rounded border ${sc.border}`}>
                    {selectedInfo.section}
                  </span>
                  <span className={`text-[10px] font-sans font-bold uppercase tracking-wide flex items-center gap-1.5`} style={{ color: getColorHex(selectedInfo.color) }}>
                    {selectedInfo.type === "essay" ? (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        Capítulo {selectedInfo.number}
                      </>
                    ) : (
                      <>
                        <Feather className="w-3.5 h-3.5" />
                        {textStrings.story}
                      </>
                    )}
                  </span>
                </div>

                <div className="h-px bg-amber-500/10" />

                {/* Titles */}
                <div className="space-y-1.5">
                  <h4 className={`font-display text-lg sm:text-xl font-bold leading-tight ${sc.text}`}>
                    {selectedInfo.title}
                  </h4>
                  {selectedInfo.subtitle && (
                    <p className={`font-sans text-[11px] sm:text-xs leading-relaxed ${sc.textMuted}`}>
                      {selectedInfo.subtitle}
                    </p>
                  )}
                </div>

                {/* Connections section */}
                <div className="space-y-2 pt-2">
                  <span className={`text-[9px] font-mono uppercase tracking-wider ${sc.textMuted}`}>
                    {textStrings.connections}
                  </span>
                  
                  {selectedInfo.linkedId ? (
                    <div className="flex flex-col gap-1.5">
                      {selectedInfo.type === "essay" ? (() => {
                        const linkedCuento = cuentosList.find(cuento => cuento.id === selectedInfo.linkedId);
                        if (!linkedCuento) return null;
                        return (
                          <button
                            onClick={() => setSelectedNodeId(linkedCuento.id)}
                            className={`w-full text-left p-2.5 rounded-xl border ${sc.border} bg-slate-950/10 hover:bg-slate-950/20 transition-all cursor-pointer flex items-center gap-2 group`}
                          >
                            <span className="text-purple-500 text-xs shrink-0">🔮</span>
                            <span className={`text-[11px] font-display italic font-medium group-hover:text-amber-500 transition-colors truncate ${sc.text}`}>
                              “{linkedCuento.title}”
                            </span>
                          </button>
                        );
                      })() : (() => {
                        const linkedEssay = nodes.find(n => n.id === selectedInfo.linkedId);
                        if (!linkedEssay) return null;
                        return (
                          <button
                            onClick={() => setSelectedNodeId(linkedEssay.id)}
                            className={`w-full text-left p-2.5 rounded-xl border ${sc.border} bg-slate-950/10 hover:bg-slate-950/20 transition-all cursor-pointer flex items-center gap-2 group`}
                          >
                            <span className="text-amber-500 text-xs shrink-0">📖</span>
                            <span className={`text-[11px] font-display italic font-medium group-hover:text-amber-500 transition-colors truncate ${sc.text}`}>
                              “{linkedEssay.title}”
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className={`text-[10px] italic ${sc.textMuted}`}>
                      {textStrings.noCuentos}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6">
                <button
                  onClick={() => onSelectChapter(selectedInfo.id, selectedInfo.type)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-bold hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer ${sc.btnPrimary}`}
                >
                  {selectedInfo.type === "essay" ? textStrings.readChapter : textStrings.readCuento}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
