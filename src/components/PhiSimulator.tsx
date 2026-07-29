import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, RefreshCw, Zap, ShieldAlert, BookOpen, Brain, Eye, HelpCircle, HardDrive } from "lucide-react";
import { Language } from "../i18n";

interface PhiSimulatorProps {
  language: Language;
  theme: "cosmic" | "paper" | "sepia";
}

// Bipartitions of a 4-node system {A, B, C, D}
const PARTITIONS = [
  { p1: ["A"], p2: ["B", "C", "D"], label: "A | BCD" },
  { p1: ["B"], p2: ["A", "C", "D"], label: "B | ACD" },
  { p1: ["C"], p2: ["A", "B", "D"], label: "C | ABD" },
  { p1: ["D"], p2: ["A", "B", "C"], label: "D | ABC" },
  { p1: ["A", "B"], p2: ["C", "D"], label: "AB | CD" },
  { p1: ["A", "C"], p2: ["B", "D"], label: "AC | BD" },
  { p1: ["A", "D"], p2: ["B", "C"], label: "AD | BC" },
];

export const PhiSimulator: React.FC<PhiSimulatorProps> = ({ language, theme }) => {
  const isEs = language === "es";

  // State to track current tutorial step
  const [activeStep, setActiveStep] = useState<number>(0);

  // Node coordinates inside a 400x400 space (A, B, C, D in a diamond pattern)
  const nodes = [
    { id: "A", x: 200, y: 70, labelEs: "Cerebro (Núcleo)", labelEn: "Brain (Core)", icon: Brain },
    { id: "B", x: 330, y: 200, labelEs: "Ojo (Sensorial)", labelEn: "Eye (Sensory)", icon: Eye },
    { id: "C", x: 200, y: 330, labelEs: "Mano (Motor)", labelEn: "Hand (Motor)", icon: HelpCircle },
    { id: "D", x: 70, y: 200, labelEs: "Memoria (Hipocampo)", labelEn: "Memory (Hipocampus)", icon: HardDrive },
  ];

  // Connection weights: A-B, B-C, etc. Toggled directly between 0, 0.5, and 1.0 on click
  const [weights, setWeights] = useState<Record<string, number>>({
    "A-B": 1.0,
    "B-C": 1.0,
    "C-D": 1.0,
    "D-A": 1.0,
    "B-A": 0.0,
    "C-B": 0.0,
    "D-C": 0.0,
    "A-D": 0.0,
    "A-C": 0.0,
    "C-A": 0.0,
    "B-D": 0.0,
    "D-B": 0.0,
  });

  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  // Calculate integration values
  const { phi, mip, mipCutCoords } = useMemo(() => {
    let minPhi = Infinity;
    let bestPartition = PARTITIONS[0];

    PARTITIONS.forEach((part) => {
      let flow1to2 = 0;
      part.p1.forEach((u) => {
        part.p2.forEach((v) => {
          flow1to2 += weights[`${u}-${v}`] || 0;
        });
      });

      let flow2to1 = 0;
      part.p2.forEach((v) => {
        part.p1.forEach((u) => {
          flow2to1 += weights[`${v}-${u}`] || 0;
        });
      });

      const sizeFactor = 2.0 - Math.abs(part.p1.length - part.p2.length) / 4.0;
      const partPhi = Math.min(flow1to2, flow2to1) * sizeFactor;

      if (partPhi < minPhi) {
        minPhi = partPhi;
        bestPartition = part;
      }
    });

    // Calculate cut division line visual coords
    const p1 = bestPartition.p1;
    let sumX1 = 0, sumY1 = 0;
    p1.forEach((id) => {
      const n = nodes.find((node) => node.id === id)!;
      sumX1 += n.x;
      sumY1 += n.y;
    });
    const c1 = { x: sumX1 / p1.length, y: sumY1 / p1.length };

    const p2 = bestPartition.p2;
    let sumX2 = 0, sumY2 = 0;
    p2.forEach((id) => {
      const n = nodes.find((node) => node.id === id)!;
      sumX2 += n.x;
      sumY2 += n.y;
    });
    const c2 = { x: sumX2 / p2.length, y: sumY2 / p2.length };

    const midX = (c1.x + c2.x) / 2;
    const midY = (c1.y + c2.y) / 2;

    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    let cutCoords = null;
    if (len > 0) {
      const px = -dy / len;
      const py = dx / len;
      const lineLen = 220;
      cutCoords = {
        x1: midX - px * lineLen,
        y1: midY - py * lineLen,
        x2: midX + px * lineLen,
        y2: midY + py * lineLen,
      };
    }

    return {
      phi: parseFloat(minPhi.toFixed(2)),
      mip: bestPartition,
      mipCutCoords: cutCoords,
    };
  }, [weights]);

  // Click handler to cycle weights: 0 -> 0.5 -> 1.0 -> 0
  const handleEdgeClick = (edgeKey: string) => {
    setWeights((prev) => {
      const current = prev[edgeKey] || 0;
      let next = 0;
      if (current === 0) next = 0.5;
      else if (current === 0.5) next = 1.0;
      else next = 0.0;

      return {
        ...prev,
        [edgeKey]: next,
      };
    });
  };

  const getExplanation = () => {
    if (phi === 0) {
      return isEs
        ? "El sistema no integra información. Las partes actúan de forma aislada o puramente lineal (inconsciente)."
        : "The system does not integrate information. Parts act in isolation or in a purely linear fashion (unconscious).";
    } else if (phi <= 0.5) {
      return isEs
        ? "Integración mínima. Hay bucles de retroalimentación pequeños. Emerge un destello rudimentario de presencia o reactividad interna."
        : "Minimal integration. Small feedback loops are present. A rudimentary flash of internal presence or reactivity emerges.";
    } else if (phi <= 1.2) {
      return isEs
        ? "Integración media. Las partes comparten estados reflexivos complejos. Cohesión de memoria y procesamiento sensorio-motor."
        : "Medium integration. Parts share complex reflective states. Cohesion of memory and sensory-motor processing.";
    } else {
      return isEs
        ? "Alta integración. La red es fuertemente indivisible. Emerge una experiencia unificada coherente: la base física de la conciencia."
        : "High integration. The network is strongly indivisible. A unified, coherent experience emerges: the physical basis of consciousness.";
    }
  };

  // Pre-configured tutorial presets
  const applyPreset = (stepIdx: number) => {
    setActiveStep(stepIdx);
    if (stepIdx === 0) {
      // Unidirectional feedforward loop
      setWeights({
        "A-B": 1.0, "B-C": 1.0, "C-D": 1.0, "D-A": 0.0,
        "B-A": 0.0, "C-B": 0.0, "D-C": 0.0, "A-D": 0.0,
        "A-C": 0.0, "C-A": 0.0, "B-D": 0.0, "D-B": 0.0,
      });
    } else if (stepIdx === 1) {
      // Simple feedback loop (A <-> B)
      setWeights({
        "A-B": 1.0, "B-A": 1.0, "B-C": 0.0, "C-B": 0.0,
        "C-D": 0.0, "D-C": 0.0, "D-A": 0.0, "A-D": 0.0,
        "A-C": 0.0, "C-A": 0.0, "B-D": 0.0, "D-B": 0.0,
      });
    } else if (stepIdx === 2) {
      // Dense bidirectional network
      setWeights({
        "A-B": 1.0, "B-A": 0.8, "B-C": 1.0, "C-B": 0.8,
        "C-D": 1.0, "D-C": 0.8, "D-A": 1.0, "A-D": 0.8,
        "A-C": 0.5, "C-A": 0.5, "B-D": 0.5, "D-B": 0.5,
      });
    }
  };

  const sc = useMemo(() => {
    if (theme === "sepia") {
      return {
        cardBg: "bg-[#F3EDE0] border-[#2C1E11]/15 text-[#2C1E11]",
        nodeBg: "#EEDCBE",
        nodeStroke: "#854d0e",
        activeNode: "#d97706",
        textMuted: "text-[#2C1E11]/70",
        btnPreset: "bg-[#2C1E11]/10 hover:bg-[#2C1E11]/20 text-[#2C1E11]",
        btnActive: "bg-[#2C1E11] text-amber-50",
        meterBg: "bg-amber-900/10",
        meterBar: "bg-amber-700",
        activeGlow: "rgba(217, 119, 6, 0.4)",
      };
    } else if (theme === "paper") {
      return {
        cardBg: "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]",
        nodeBg: "#F3F4F6",
        nodeStroke: "#374151",
        activeNode: "#059669",
        textMuted: "text-[#1A1A1A]/70",
        btnPreset: "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
        btnActive: "bg-[#1A1A1A] text-white",
        meterBg: "bg-slate-100",
        meterBar: "bg-slate-800",
        activeGlow: "rgba(5, 150, 105, 0.4)",
      };
    } else {
      // cosmic
      return {
        cardBg: "bg-[#15171F] border-white/5 text-[#E4E6EB]",
        nodeBg: "#1E293B",
        nodeStroke: "rgba(255,255,255,0.15)",
        activeNode: "#FBBF24",
        textMuted: "text-slate-400",
        btnPreset: "bg-white/5 hover:bg-white/10 text-slate-300",
        btnActive: "bg-amber-500 text-slate-950 font-bold",
        accent: "text-amber-400",
        meterBg: "bg-slate-900/60 border border-white/5",
        meterBar: "bg-gradient-to-r from-amber-500 to-amber-400 shadow-md shadow-amber-500/20",
        activeGlow: "rgba(251, 191, 36, 0.4)",
      };
    }
  }, [theme]);

  return (
    <div className={`rounded-2xl border ${sc.cardBg} p-5 sm:p-6 shadow-xl transition-all duration-300`}>
      {/* Title block */}
      <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-display font-medium text-base tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            {isEs ? "Experimentación Táctil: Información Integrada" : "Tactile Experiment: Integrated Information"}
          </h4>
          <p className="text-xs opacity-75 mt-0.5 font-sans">
            {isEs 
              ? "Toca las conexiones en el diagrama para regular el flujo de información."
              : "Touch connections in the diagram to regulate the flow of information."}
          </p>
        </div>
        <button
          onClick={() => {
            setWeights({
              "A-B": 0.0, "B-C": 0.0, "C-D": 0.0, "D-A": 0.0,
              "B-A": 0.0, "C-B": 0.0, "D-C": 0.0, "A-D": 0.0,
              "A-C": 0.0, "C-A": 0.0, "B-D": 0.0, "D-B": 0.0,
            });
            setActiveStep(-1);
          }}
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded border border-red-500/10 transition-colors"
        >
          {isEs ? "Limpiar Todo" : "Clear All"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left panel: Constellation graph (SVG) */}
        <div className="flex-[5] flex flex-col items-center justify-center relative p-2 bg-black/10 rounded-xl">
          <svg viewBox="0 0 400 400" className="w-full max-w-[340px] aspect-square select-none z-10">
            
            {/* Accretion/Network glow background */}
            <circle cx="200" cy="200" r="140" fill="none" stroke={sc.activeGlow} strokeWidth="1" strokeDasharray="3 9" className="opacity-20 animate-spin" style={{ transformOrigin: "200px 200px", animationDuration: "120s" }} />
            
            {/* Draw connections */}
            {Object.entries(weights).map(([key, wVal]) => {
              const w = wVal as number;
              const [fromId, toId] = key.split("-");
              const fromNode = nodes.find((n) => n.id === fromId)!;
              const toNode = nodes.find((n) => n.id === toId)!;

              const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
              
              const shift = 6;
              const fx = fromNode.x + shift * Math.cos(angle + Math.PI / 2);
              const fy = fromNode.y + shift * Math.sin(angle + Math.PI / 2);
              const tx = toNode.x + shift * Math.cos(angle + Math.PI / 2);
              const ty = toNode.y + shift * Math.sin(angle + Math.PI / 2);

              const startX = fx + 26 * Math.cos(angle);
              const startY = fy + 26 * Math.sin(angle);
              const endX = tx - 28 * Math.cos(angle);
              const endY = ty - 28 * Math.sin(angle);

              const isHovered = hoveredEdge === key;
              const isFlowing = w > 0;
              
              // Color setup: Amber if hovered/selected, Purple if flowing, dim grey if off
              const strokeColor = isHovered
                ? "#FBBF24"
                : isFlowing
                ? w === 0.5
                  ? theme === "cosmic" ? "rgba(192, 132, 252, 0.45)" : "rgba(147, 51, 234, 0.4)"
                  : theme === "cosmic" ? "#C084FC" : "#9333EA"
                : theme === "cosmic"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)";

              const strokeWidth = isHovered ? 4.5 : isFlowing ? (w === 0.5 ? 2.2 : 3.8) : 1.2;

              return (
                <g 
                  key={key} 
                  className="cursor-pointer group" 
                  onClick={() => handleEdgeClick(key)}
                  onMouseEnter={() => setHoveredEdge(key)}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  {/* Invisible broad click target line */}
                  <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="transparent" strokeWidth={16} />
                  
                  {/* Visual Connection Link Line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={!isFlowing ? "3 3" : undefined}
                    className="transition-all duration-300"
                  />

                  {/* Flowing Information Particles (glowing dots moving along the path) */}
                  {isFlowing && (
                    <circle r={w === 0.5 ? 2 : 3.2} fill={theme === "cosmic" ? "#FFF" : "#A78BFA"} filter={theme === "cosmic" ? "drop-shadow(0px 0px 3px #C084FC)" : undefined}>
                      <animateMotion
                        dur={w === 0.5 ? "2.5s" : "1.2s"}
                        repeatCount="indefinite"
                        path={`M ${startX} ${startY} L ${endX} ${endY}`}
                      />
                    </circle>
                  )}

                  {/* Directed Arrow Pointer Head */}
                  {isFlowing && (
                    <path
                      d={`M ${endX} ${endY} L ${endX - 7 * Math.cos(angle - 0.45)} ${
                        endY - 7 * Math.sin(angle - 0.45)
                      } L ${endX - 7 * Math.cos(angle + 0.45)} ${
                        endY - 7 * Math.sin(angle + 0.45)
                      } Z`}
                      fill={strokeColor}
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Small floating numeric tag to explicitly show the weight */}
                  {isFlowing && (
                    <g transform={`translate(${(startX + endX) / 2 + 13 * Math.cos(angle + Math.PI / 2)}, ${(startY + endY) / 2 + 13 * Math.sin(angle + Math.PI / 2) + 3})`}>
                      <text
                        fill={isHovered ? "#FBBF24" : theme === "cosmic" ? "#C084FC" : "#7C3AED"}
                        fontSize="8px"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="font-mono bg-black/60 px-1 rounded"
                      >
                        {w.toFixed(1)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* MIP Cut Line (LASER RED DIVISION CUT) */}
            {phi > 0 && mipCutCoords && (
              <g>
                <line
                  x1={mipCutCoords.x1}
                  y1={mipCutCoords.y1}
                  x2={mipCutCoords.x2}
                  y2={mipCutCoords.y2}
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  className="animate-pulse"
                />
                <circle cx={mipCutCoords.x1} cy={mipCutCoords.y1} r="2.5" fill="#EF4444" />
                <circle cx={mipCutCoords.x2} cy={mipCutCoords.y2} r="2.5" fill="#EF4444" />
              </g>
            )}

            {/* Render Nodes (Constellation Cells) */}
            {nodes.map((node) => {
              const IconComp = node.icon;
              const isLinked = Object.keys(weights).some(
                (k) => (k.startsWith(`${node.id}-`) && weights[k] > 0) || (k.endsWith(`-${node.id}`) && weights[k] > 0)
              );

              return (
                <g key={node.id} className="pointer-events-none">
                  {/* Glowing pulsing aura around active nodes */}
                  {isLinked && phi > 0 && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="none"
                      stroke={sc.activeNode}
                      strokeWidth={1}
                      className="opacity-20 animate-pulse"
                    />
                  )}
                  {/* Main Circle node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    fill={sc.nodeBg}
                    stroke={isLinked ? sc.activeNode : sc.nodeStroke}
                    strokeWidth={2}
                    className="transition-colors duration-300"
                  />
                  {/* SVG Icon inside the node for intuitive visualization */}
                  <g transform={`translate(${node.x - 7.5}, ${node.y - 8})`} className="opacity-80">
                    <IconComp className="w-[15px] h-[15px]" style={{ color: isLinked ? (theme === "cosmic" ? "#FFF" : sc.nodeStroke) : "#94A3B8" }} />
                  </g>
                  {/* Label under/beside nodes */}
                  <text
                    x={node.x}
                    y={node.y + (node.y > 200 ? 32 : -26)}
                    textAnchor="middle"
                    fill={isLinked ? (theme === "cosmic" ? "#E4E6EB" : "#1A1A1A") : sc.textMuted}
                    fontSize="9px"
                    fontWeight="bold"
                    className="font-sans"
                  >
                    {isEs ? node.labelEs : node.labelEn}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right panel: Didactic steps and Phi gauge */}
        <div className="flex-[6] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            
            {/* Step-by-Step Didactic Guide */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-60 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-500" />
                {isEs ? "Guía Interactiva Paso a Paso" : "Step-by-Step Interactive Guide"}
              </span>
              
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => applyPreset(0)}
                  className={`text-[10px] px-2 py-1.5 rounded transition-all font-mono uppercase border ${
                    activeStep === 0 
                      ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold" 
                      : "bg-black/10 border-white/5 hover:bg-black/20 text-slate-400"
                  }`}
                >
                  {isEs ? "1. Unidireccional" : "1. Feedforward"}
                </button>
                <button
                  onClick={() => applyPreset(1)}
                  className={`text-[10px] px-2 py-1.5 rounded transition-all font-mono uppercase border ${
                    activeStep === 1 
                      ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold" 
                      : "bg-black/10 border-white/5 hover:bg-black/20 text-slate-400"
                  }`}
                >
                  {isEs ? "2. Bucle Simple" : "2. Simple Loop"}
                </button>
                <button
                  onClick={() => applyPreset(2)}
                  className={`text-[10px] px-2 py-1.5 rounded transition-all font-mono uppercase border ${
                    activeStep === 2 
                      ? "bg-amber-500/20 border-amber-500 text-amber-400 font-bold" 
                      : "bg-black/10 border-white/5 hover:bg-black/20 text-slate-400"
                  }`}
                >
                  {isEs ? "3. Red Completa" : "3. Full Network"}
                </button>
              </div>

              {/* Explanatory text for the current step */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-xs leading-relaxed font-serif">
                {activeStep === 0 && (
                  isEs ? (
                    <>
                      <strong>Paso 1 (Φ = 0.0):</strong> La información fluye en un solo sentido. El ojo estimula el cerebro y la mano se mueve, pero no hay bucles de retorno. El sistema procesa información de forma lineal. <em>Es una máquina inconsciente</em> (como un termostato o una cámara de fotos).
                    </>
                  ) : (
                    <>
                      <strong>Step 1 (Φ = 0.0):</strong> Information flows in a single direction. The eye triggers the brain, and the hand moves, but there are no return loops. Processing is linear. <em>This is an unconscious machine</em> (like a thermostat or camera).
                    </>
                  )
                )}
                {activeStep === 1 && (
                  isEs ? (
                    <>
                      <strong>Paso 2 (Φ &gt; 0):</strong> ¡Has creado retroalimentación! Al conectar el Cerebro de vuelta al Ojo, la señal viaja en bucle cerrado. Ahora, el sistema integra información sobre sí mismo. Emerge un nivel básico de experiencia sensible.
                    </>
                  ) : (
                    <>
                      <strong>Step 2 (Φ &gt; 0):</strong> You created feedback! By connecting the Brain back to the Eye, the signal travels in a closed loop. The system now integrates information about itself. A basic level of sensitive experience emerges.
                    </>
                  )
                )}
                {activeStep === 2 && (
                  isEs ? (
                    <>
                      <strong>Paso 3 (Φ Máximo):</strong> Una red densa de retroalimentación en todas las áreas. Toda la información se vuelve indisoluble: ya no puedes cortar el sistema en partes sin destruir la experiencia completa. Emerge la <strong>conciencia integrada</strong>.
                    </>
                  ) : (
                    <>
                      <strong>Step 3 (Max Φ):</strong> A dense network of feedback across all areas. All information becomes indissoluble: you can no longer cut the system into parts without destroying the whole experience. <strong>Integrated consciousness</strong> emerges.
                    </>
                  )
                )}
                {activeStep === -1 && (
                  isEs ? (
                    <>
                      <strong>Diseña tu propio sistema:</strong> Haz clic en cualquier conexión. Si está inactiva (punteada), activará un flujo medio (0.5); si vuelves a pulsar, será flujo máximo (1.0). Construye bucles para ver cómo sube la integración Φ.
                    </>
                  ) : (
                    <>
                      <strong>Design your own system:</strong> Click any connection. If inactive (dotted), it turns into medium flow (0.5); click again for max flow (1.0). Build feedback loops to see integration Φ rise.
                    </>
                  )
                )}
              </div>
            </div>

            {/* Phi Value Gauge */}
            <div className={`p-4 rounded-xl ${sc.meterBg} flex flex-col items-center justify-center relative overflow-hidden`}>
              <span className="text-[10px] font-mono opacity-70 uppercase tracking-widest text-center">
                {isEs ? "Grado de Información Integrada (Conciencia Subjetiva)" : "Degree of Integrated Information (Subjective Consciousness)"}
              </span>
              <span className="text-4xl sm:text-5xl font-display font-bold my-1 tracking-tighter">
                Φ = {phi}
              </span>
              <div className="w-full h-2.5 bg-black/20 rounded-full mt-2 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${sc.meterBar}`}
                  style={{ width: `${Math.min(100, (phi / 2.0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Dynamic system diagnostic message */}
            <p className="text-xs font-serif leading-relaxed italic p-3 bg-black/20 rounded-lg text-center">
              {getExplanation()}
            </p>

            {/* Minimum Information Partition (MIP) explanation */}
            {phi > 0 && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-2 text-xs text-red-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">
                    {isEs ? "El Punto de Fractura Mínimo (MIP)" : "Minimum Fracture Point (MIP)"}
                  </strong>
                  <p className="mt-0.5 leading-normal opacity-90">
                    {isEs ? (
                      <>
                        El corte <code className="font-mono text-white bg-black/40 px-1 rounded">{mip.label}</code> es la línea roja láser del diagrama.
                        Representa la división que divide el sistema con el menor esfuerzo. La fuerza de esta frontera es la que limita el Φ total.
                      </>
                    ) : (
                      <>
                        The cut <code className="font-mono text-white bg-black/40 px-1 rounded">{mip.label}</code> is the red laser line in the diagram.
                        It represents the division that splits the system with the least effort. The strength of this boundary bounds total Φ.
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
