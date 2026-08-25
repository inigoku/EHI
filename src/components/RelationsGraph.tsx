import React from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Feather, Sparkles } from "lucide-react";
import { ReadingTheme } from "./ReadingSettings";
import { Language } from "../i18n";
import { allChapters, cuentosList, poemasList, lecturasTopologicas } from "../chapters";
import { conceptualLinks as sharedConceptualLinks } from "../chapters/conceptualLinks";

interface RelationsGraphProps {
  theme: ReadingTheme;
  language: Language;
  onSelectChapter: (chapterId: string, mode: "essay" | "cuentos" | "poemas") => void;
  initialSelectedId?: string;
}

export const RelationsGraph: React.FC<RelationsGraphProps> = ({
  theme,
  language,
  onSelectChapter,
  initialSelectedId,
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
        lectura: "Lectura Topológica",
        readLectura: "Leer esta Lectura",
      },
      en: {
        graphTitle: "Chapter Constellation",
        graphDesc: "An interactive layout of the essay's conceptual horizons and their narrative stories. Select any node to browse.",
        readChapter: "Start Reading",
        readCuento: "Read Related Story",
        story: "Narrative Story",
        connections: "Linked Connections",
        noCuentos: "This chapter is pure theoretical reading",
        lectura: "Topological Reading",
        readLectura: "Read this Reading",
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

  const centerX = 240;
  const centerY = 240;
  const radius = 105;

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
      
      const r2 = 135; // Ring 2 (Cuentos)
      const x = centerX + r2 * Math.cos(parentNode.angle);
      const y = centerY + r2 * Math.sin(parentNode.angle);
      
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

  const poemaNodes = React.useMemo(() => {
    return poemasList.map((poema) => {
      const parentId = (() => {
        if (poema.id === "poema_sintonizadores") {
          return "cap22_idempotencia";
        }
        if (poema.id.startsWith("poema_arq")) {
          const num = parseInt(poema.id.replace("poema_arq", ""));
          const mapping: Record<number, string> = {
            1: "cap1",
            2: "cap2",
            3: "cap2_5",
            4: "cap3",
            5: "cap4",
            6: "cap5",
            7: "cap6",
            8: "cap6_5",
          };
          return mapping[num] || "cap1";
        }
        if (poema.id.startsWith("poema_frialdad")) {
          const num = parseInt(poema.id.replace("poema_frialdad", ""));
          const mapping: Record<number, string> = {
            1: "cap7",
            2: "cap7_5",
            3: "cap8",
            4: "cap9",
            5: "cap10",
            6: "cap11",
          };
          return mapping[num] || "cap9";
        }
        return "cap20_5"; // poema_glosario
      })();

      const parentNode = nodes.find(n => n.id === parentId);
      if (!parentNode) return null;
      
      const r3 = 165; // Ring 3 (Poemas)
      const x = centerX + r3 * Math.cos(parentNode.angle);
      const y = centerY + r3 * Math.sin(parentNode.angle);
      
      return {
        id: poema.id,
        title: poema.title,
        chapterNumber: "P",
        parentX: parentNode.x,
        parentY: parentNode.y,
        linkedChapterId: parentNode.id,
        x,
        y,
        poema,
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
      poema: any;
    }>;
  }, [nodes]);

  // Ring 5 (Lecturas Topológicas): its own independent sequential ring,
  // like the essay ring, since most of these chapters have no single
  // "parent" essay chapter to hang off of as a satellite.
  const lecturaNodes = React.useMemo(() => {
    return lecturasTopologicas.map((ch, idx) => {
      const angle = (idx / lecturasTopologicas.length) * 2 * Math.PI - Math.PI / 2;
      const r5 = 225; // Ring 5 (Lecturas Topológicas)
      const x = centerX + r5 * Math.cos(angle);
      const y = centerY + r5 * Math.sin(angle);

      return {
        id: ch.id,
        title: ch.title,
        chapterNumber: "L",
        linkedCuentosId: ch.linkedCuentosId,
        x,
        y,
        angle,
        color: "indigo",
        chapter: ch,
      };
    });
  }, []);

  const conceptualLinkNodes = React.useMemo(() => [...nodes, ...lecturaNodes], [nodes, lecturaNodes]);

  const conceptualLinks = sharedConceptualLinks;

  const [selectedNodeId, setSelectedNodeId] = React.useState<string>(() => {
    if (initialSelectedId && nodes.some((n) => n.id === initialSelectedId)) return initialSelectedId;
    return nodes[0]?.id || "";
  });

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
    const poemaNode = poemaNodes.find(p => p.id === selectedNodeId);
    if (poemaNode) {
      return {
        type: "poemas" as const,
        id: poemaNode.id,
        number: "Poema",
        title: poemaNode.title,
        subtitle: language === "es" ? "Composición lírica complementaria" : "Complementary lyrical composition",
        section: language === "es" ? "POEMAS: LA RESONANCIA" : "POEMS: THE RESONANCE",
        color: "rose",
        linkedId: poemaNode.linkedChapterId,
      };
    }
    const lecturaNode = lecturaNodes.find(l => l.id === selectedNodeId);
    if (lecturaNode) {
      return {
        type: "lecturas" as const,
        id: lecturaNode.id,
        number: lecturaNode.chapter.chapterNumber || "",
        title: lecturaNode.title,
        subtitle: lecturaNode.chapter.subtitle || "",
        section: language === "es" ? "LECTURAS TOPOLÓGICAS" : "TOPOLOGICAL READINGS",
        color: "indigo",
        linkedId: lecturaNode.linkedCuentosId,
      };
    }
    return null;
  }, [selectedNodeId, nodes, cuentoNodes, poemaNodes, lecturaNodes, language]);

  const getColorHex = React.useCallback((color: string) => {
    if (theme === "cosmic") {
      switch (color) {
        case "cyan": return "#38BDF8";
        case "emerald": return "#34D399";
        case "orange": return "#FB923C";
        case "amber": return "#FBBF24";
        case "purple": return "#C084FC";
        case "rose": return "#F43F5E";
        case "indigo": return "#818CF8";
        default: return "#94A3B8";
      }
    } else {
      switch (color) {
        case "cyan": return "#0284C7";
        case "emerald": return "#059669";
        case "orange": return "#EA580C";
        case "amber": return "#D97706";
        case "purple": return "#9333EA";
        case "rose": return "#E11D48";
        case "indigo": return "#4F46E5";
        default: return "#475569";
      }
    }
  }, [theme]);

  const areSequentiallyAdjacent = React.useCallback((id1: string, id2: string) => {
    const idx1 = nodes.findIndex(n => n.id === id1);
    const idx2 = nodes.findIndex(n => n.id === id2);
    if (idx1 === -1 || idx2 === -1) return false;
    return Math.abs(idx1 - idx2) === 1 || Math.abs(idx1 - idx2) === nodes.length - 1;
  }, [nodes]);

  const hasConceptualLink = React.useCallback((id1: string, id2: string) => {
    return conceptualLinks.some(l => 
      (l.fromId === id1 && l.toId === id2) || (l.fromId === id2 && l.toId === id1)
    );
  }, [conceptualLinks]);

  const getLinkStyle = React.useCallback((X: string, Y: string, isSequential: boolean) => {
    const S = selectedNodeId;
    
    // Default inactive/dim styles
    const defaultSeq = {
      stroke: theme === "cosmic" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      strokeWidth: 1,
      opacity: 0.15,
      strokeDasharray: undefined,
    };
    const defaultConceptual = {
      stroke: theme === "cosmic" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
      strokeWidth: 0.5,
      opacity: 0.1,
      strokeDasharray: "4 4",
    };

    if (!S) {
      return isSequential ? defaultSeq : defaultConceptual;
    }

    // Resolve S to parent essay node if it is a satellite
    const S_parent = (() => {
      if (nodes.some(n => n.id === S)) return S;
      
      const cNode = cuentoNodes.find(c => c.id === S);
      if (cNode) return cNode.linkedChapterId;
      
      const pNode = poemaNodes.find(p => p.id === S);
      if (pNode) return pNode.linkedChapterId;

      return S;
    })();

    const nodeX = nodes.find(n => n.id === X) || lecturaNodes.find(n => n.id === X);
    const colorHex = nodeX ? getColorHex(nodeX.color) : getColorHex("amber");

    if (isSequential) {
      // 1. Weight 100: Adjacent (sequential) link involving S_parent
      if (X === S_parent || Y === S_parent) {
        return {
          stroke: colorHex,
          strokeWidth: 2.5,
          opacity: 1.0,
          strokeDasharray: undefined,
        };
      }
      // 2. Weight 50: Adjacent of a conceptual direct link of S_parent
      if (hasConceptualLink(X, S_parent) || hasConceptualLink(Y, S_parent)) {
        return {
          stroke: theme === "cosmic" ? "rgba(251, 191, 36, 0.45)" : "rgba(217, 119, 6, 0.45)",
          strokeWidth: 1.4,
          opacity: 0.55,
          strokeDasharray: undefined,
        };
      }
      return defaultSeq;
    } else {
      // 1. Weight 75: Conceptual direct link involving S_parent
      if (X === S_parent || Y === S_parent) {
        return {
          stroke: colorHex,
          strokeWidth: 1.8,
          opacity: 0.8,
          strokeDasharray: "4 4",
        };
      }
      // 2. Weight 50: Conceptual direct link involving a sequential neighbor of S_parent
      if (areSequentiallyAdjacent(X, S_parent) || areSequentiallyAdjacent(Y, S_parent)) {
        return {
          stroke: theme === "cosmic" ? "rgba(251, 191, 36, 0.45)" : "rgba(217, 119, 6, 0.45)",
          strokeWidth: 1.2,
          opacity: 0.5,
          strokeDasharray: "4 4",
        };
      }
      // 3. Weight 25: Conceptual direct link of a conceptual direct of S_parent
      if (hasConceptualLink(X, S_parent) || hasConceptualLink(Y, S_parent)) {
        return {
          stroke: theme === "cosmic" ? "rgba(251, 191, 36, 0.25)" : "rgba(217, 119, 6, 0.25)",
          strokeWidth: 0.8,
          opacity: 0.3,
          strokeDasharray: "4 4",
        };
      }
      return defaultConceptual;
    }
  }, [selectedNodeId, theme, nodes, getColorHex, hasConceptualLink, areSequentiallyAdjacent, cuentoNodes, poemaNodes, lecturaNodes]);

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
            viewBox="0 0 480 480"
            className="w-full h-auto max-h-[65vh] select-none z-10"
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
              const style = getLinkStyle(node.id, nextNode.id, true);
              return (
                <line
                  key={`seq-link-${idx}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  opacity={style.opacity}
                  strokeDasharray={style.strokeDasharray}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Connecting last to first (loop) */}
            {nodes.length > 1 && (() => {
              const first = nodes[0];
              const last = nodes[nodes.length - 1];
              const style = getLinkStyle(last.id, first.id, true);
              return (
                <line
                  x1={last.x}
                  y1={last.y}
                  x2={first.x}
                  y2={first.y}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  opacity={style.opacity}
                  strokeDasharray={style.strokeDasharray}
                  className="transition-all duration-300"
                />
              );
            })()}

            {/* Drawing Conceptual Links */}
            {conceptualLinks.map((link, idx) => {
              const fromNode = conceptualLinkNodes.find(n => n.id === link.fromId);
              const toNode = conceptualLinkNodes.find(n => n.id === link.toId);
              if (!fromNode || !toNode) return null;
              
              const style = getLinkStyle(fromNode.id, toNode.id, false);
              
              return (
                <line
                  key={`conceptual-link-${idx}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  opacity={style.opacity}
                  strokeDasharray={style.strokeDasharray}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })}

            {/* Corona guidelines (concentric circle paths) */}
            <circle cx={centerX} cy={centerY} r={105} fill="none" stroke={theme === "cosmic" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"} strokeWidth={1} className="pointer-events-none" />
            <circle cx={centerX} cy={centerY} r={135} fill="none" stroke={theme === "cosmic" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)"} strokeWidth={1} className="pointer-events-none" />
            <circle cx={centerX} cy={centerY} r={165} fill="none" stroke={theme === "cosmic" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)"} strokeWidth={1} className="pointer-events-none" />
            <circle cx={centerX} cy={centerY} r={225} fill="none" stroke={theme === "cosmic" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)"} strokeWidth={1} className="pointer-events-none" />

            {/* Sequential Links for Cuentos (Corona 2) */}
            {cuentoNodes.map((node, idx) => {
              if (idx === cuentoNodes.length - 1) return null;
              const nextNode = cuentoNodes[idx + 1];
              const isHighlighted = selectedNodeId === node.id || selectedNodeId === nextNode.id;
              
              return (
                <line
                  key={`cuento-seq-${idx}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke={
                    isHighlighted
                      ? getColorHex("purple")
                      : theme === "cosmic"
                      ? "rgba(192, 132, 252, 0.1)"
                      : "rgba(147, 51, 234, 0.08)"
                  }
                  strokeWidth={isHighlighted ? 2.0 : 0.6}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })}
            {cuentoNodes.length > 1 && (() => {
              const first = cuentoNodes[0];
              const last = cuentoNodes[cuentoNodes.length - 1];
              const isHighlighted = selectedNodeId === first.id || selectedNodeId === last.id;
              return (
                <line
                  x1={last.x}
                  y1={last.y}
                  x2={first.x}
                  y2={first.y}
                  stroke={
                    isHighlighted
                      ? getColorHex("purple")
                      : theme === "cosmic"
                      ? "rgba(192, 132, 252, 0.1)"
                      : "rgba(147, 51, 234, 0.08)"
                  }
                  strokeWidth={isHighlighted ? 2.0 : 0.6}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })()}

            {/* Sequential Links for Poemas (Corona 3) */}
            {poemaNodes.map((node, idx) => {
              if (idx === poemaNodes.length - 1) return null;
              const nextNode = poemaNodes[idx + 1];
              const isHighlighted = selectedNodeId === node.id || selectedNodeId === nextNode.id;
              
              return (
                <line
                  key={`poema-seq-${idx}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke={
                    isHighlighted
                      ? getColorHex("rose")
                      : theme === "cosmic"
                      ? "rgba(244, 63, 94, 0.1)"
                      : "rgba(225, 29, 72, 0.08)"
                  }
                  strokeWidth={isHighlighted ? 2.0 : 0.6}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })}
            {poemaNodes.length > 1 && (() => {
              const first = poemaNodes[0];
              const last = poemaNodes[poemaNodes.length - 1];
              const isHighlighted = selectedNodeId === first.id || selectedNodeId === last.id;
              return (
                <line
                  x1={last.x}
                  y1={last.y}
                  x2={first.x}
                  y2={first.y}
                  stroke={
                    isHighlighted
                      ? getColorHex("rose")
                      : theme === "cosmic"
                      ? "rgba(244, 63, 94, 0.1)"
                      : "rgba(225, 29, 72, 0.08)"
                  }
                  strokeWidth={isHighlighted ? 2.0 : 0.6}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })()}

            {/* Sequential Links for Lecturas Topológicas (Corona 5) */}
            {lecturaNodes.map((node, idx) => {
              if (idx === lecturaNodes.length - 1) return null;
              const nextNode = lecturaNodes[idx + 1];
              const isHighlighted = selectedNodeId === node.id || selectedNodeId === nextNode.id;

              return (
                <line
                  key={`lectura-seq-${idx}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke={
                    isHighlighted
                      ? getColorHex("indigo")
                      : theme === "cosmic"
                      ? "rgba(129, 140, 248, 0.1)"
                      : "rgba(79, 70, 229, 0.08)"
                  }
                  strokeWidth={isHighlighted ? 2.0 : 0.6}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })}
            {lecturaNodes.length > 1 && (() => {
              const first = lecturaNodes[0];
              const last = lecturaNodes[lecturaNodes.length - 1];
              const isHighlighted = selectedNodeId === first.id || selectedNodeId === last.id;
              return (
                <line
                  x1={last.x}
                  y1={last.y}
                  x2={first.x}
                  y2={first.y}
                  stroke={
                    isHighlighted
                      ? getColorHex("indigo")
                      : theme === "cosmic"
                      ? "rgba(129, 140, 248, 0.1)"
                      : "rgba(79, 70, 229, 0.08)"
                  }
                  strokeWidth={isHighlighted ? 2.0 : 0.6}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })()}

            {/* Radial Spoke connectors for Cuentos (Corona 2) */}
            {cuentoNodes.map((cNode) => {
              const isSelected = selectedNodeId === cNode.id || selectedNodeId === cNode.linkedChapterId;
              return (
                <line
                  key={`radial-cuento-${cNode.id}`}
                  x1={cNode.parentX}
                  y1={cNode.parentY}
                  x2={cNode.x}
                  y2={cNode.y}
                  stroke={
                    isSelected
                      ? getColorHex("purple")
                      : theme === "cosmic"
                      ? "rgba(192, 132, 252, 0.12)"
                      : "rgba(147, 51, 234, 0.08)"
                  }
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  strokeDasharray="1 3"
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })}

            {/* Radial Spoke connectors for Poemas (Corona 3) */}
            {poemaNodes.map((pNode) => {
              const isSelected = selectedNodeId === pNode.id || selectedNodeId === pNode.linkedChapterId;
              return (
                <line
                  key={`radial-poema-${pNode.id}`}
                  x1={pNode.parentX}
                  y1={pNode.parentY}
                  x2={pNode.x}
                  y2={pNode.y}
                  stroke={
                    isSelected
                      ? getColorHex("rose")
                      : theme === "cosmic"
                      ? "rgba(244, 63, 94, 0.12)"
                      : "rgba(225, 29, 72, 0.08)"
                  }
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  strokeDasharray="1 3"
                  className="transition-all duration-300 pointer-events-none"
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

            {/* Render Poemas Satellite Nodes */}
            {poemaNodes.map((pNode) => {
              const isSelected = selectedNodeId === pNode.id;
              const roseHex = getColorHex("rose");

              return (
                <g
                  key={pNode.id}
                  onClick={() => setSelectedNodeId(pNode.id)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing glow for selection */}
                  {isSelected && (
                    <motion.circle
                      cx={pNode.x}
                      cy={pNode.y}
                      r={11}
                      fill="none"
                      stroke={roseHex}
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
                    cx={pNode.x}
                    cy={pNode.y}
                    r={isSelected ? 7.5 : 5.5}
                    fill={isSelected ? roseHex : theme === "cosmic" ? "#881337" : "#fff1f2"}
                    stroke={isSelected ? roseHex : theme === "cosmic" ? "rgba(244, 63, 94, 0.3)" : "rgba(225, 29, 72, 0.3)"}
                    strokeWidth={1}
                    className="transition-all duration-300 group-hover:scale-110"
                    filter={isSelected ? "url(#glow)" : undefined}
                    style={{ transformOrigin: `${pNode.x}px ${pNode.y}px` }}
                  />

                  <text
                    x={pNode.x}
                    y={pNode.y + 2.5}
                    textAnchor="middle"
                    fill={isSelected ? (theme === "cosmic" ? "#0D0E12" : "#ffffff") : theme === "cosmic" ? "#f43f5e" : "#e11d48"}
                    className="font-sans font-bold select-none transition-colors duration-300"
                    style={{ fontSize: isSelected ? "7px" : "6px" }}
                  >
                    {pNode.chapterNumber}
                  </text>
                </g>
              );
            })}

            {/* Render Lecturas Topológicas Nodes (Corona 5) */}
            {lecturaNodes.map((lNode) => {
              const isSelected = selectedNodeId === lNode.id;
              const indigoHex = getColorHex("indigo");

              return (
                <g
                  key={lNode.id}
                  onClick={() => setSelectedNodeId(lNode.id)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing glow for selection */}
                  {isSelected && (
                    <motion.circle
                      cx={lNode.x}
                      cy={lNode.y}
                      r={11}
                      fill="none"
                      stroke={indigoHex}
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
                    cx={lNode.x}
                    cy={lNode.y}
                    r={isSelected ? 7.5 : 5.5}
                    fill={isSelected ? indigoHex : theme === "cosmic" ? "#312e81" : "#eef2ff"}
                    stroke={isSelected ? indigoHex : theme === "cosmic" ? "rgba(129, 140, 248, 0.3)" : "rgba(79, 70, 229, 0.3)"}
                    strokeWidth={1}
                    className="transition-all duration-300 group-hover:scale-110"
                    filter={isSelected ? "url(#glow)" : undefined}
                    style={{ transformOrigin: `${lNode.x}px ${lNode.y}px` }}
                  />

                  <text
                    x={lNode.x}
                    y={lNode.y + 2.5}
                    textAnchor="middle"
                    fill={isSelected ? (theme === "cosmic" ? "#0D0E12" : "#ffffff") : theme === "cosmic" ? "#818cf8" : "#4f46e5"}
                    className="font-sans font-bold select-none transition-colors duration-300"
                    style={{ fontSize: isSelected ? "7px" : "6px" }}
                  >
                    {lNode.chapterNumber}
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
                    ) : selectedInfo.type === "cuentos" ? (
                      <>
                        <Feather className="w-3.5 h-3.5" />
                        {textStrings.story}
                      </>
                    ) : selectedInfo.type === "poemas" ? (
                      <>
                        <Feather className="w-3.5 h-3.5" />
                        {language === "es" ? "Poema" : "Poem"}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        {textStrings.lectura}
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
                      {(selectedInfo.type === "essay" || selectedInfo.type === "lecturas") ? (() => {
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
                  onClick={() => onSelectChapter(selectedInfo.id, selectedInfo.type === "lecturas" ? "essay" : selectedInfo.type)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-bold hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer ${sc.btnPrimary}`}
                >
                  {selectedInfo.type === "essay"
                    ? textStrings.readChapter
                    : selectedInfo.type === "cuentos"
                    ? textStrings.readCuento
                    : selectedInfo.type === "poemas"
                    ? (language === "es" ? "Leer Poema" : "Read Poem")
                    : textStrings.readLectura
                  }
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
