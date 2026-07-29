import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Info, RefreshCw, Zap, ShieldAlert, Activity } from "lucide-react";
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
  // Node coordinates inside a 400x400 space
  const nodes = [
    { id: "A", x: 200, y: 80 },
    { id: "B", x: 320, y: 200 },
    { id: "C", x: 200, y: 320 },
    { id: "D", x: 80, y: 200 },
  ];

  // Default active connections to form a loop: A -> B -> C -> D -> A
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

  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  // Reset to default loop
  const handleReset = () => {
    setWeights({
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
    setSelectedEdge(null);
  };

  const handlePresetHigh = () => {
    // Rich bidirectional loop
    setWeights({
      "A-B": 1.0,
      "B-A": 0.8,
      "B-C": 1.0,
      "C-B": 0.8,
      "C-D": 1.0,
      "D-C": 0.8,
      "D-A": 1.0,
      "A-D": 0.8,
      "A-C": 0.5,
      "C-A": 0.5,
      "B-D": 0.5,
      "D-B": 0.5,
    });
    setSelectedEdge(null);
  };

  const handlePresetFeedforward = () => {
    // Feedforward flow without feedback loops
    setWeights({
      "A-B": 1.0,
      "B-C": 1.0,
      "C-D": 1.0,
      "D-A": 0.0,
      "B-A": 0.0,
      "C-B": 0.0,
      "D-C": 0.0,
      "A-D": 0.0,
      "A-C": 0.0,
      "C-A": 0.0,
      "B-D": 0.0,
      "D-B": 0.0,
    });
    setSelectedEdge(null);
  };

  // Perform calculations for Phi and MIP
  const { phi, mip, mipCutCoords } = useMemo(() => {
    let minPhi = Infinity;
    let bestPartition = PARTITIONS[0];

    PARTITIONS.forEach((part) => {
      // Flow from P1 to P2
      let flow1to2 = 0;
      part.p1.forEach((u) => {
        part.p2.forEach((v) => {
          flow1to2 += weights[`${u}-${v}`] || 0;
        });
      });

      // Flow from P2 to P1
      let flow2to1 = 0;
      part.p2.forEach((v) => {
        part.p1.forEach((u) => {
          flow2to1 += weights[`${v}-${u}`] || 0;
        });
      });

      // Phi is the minimum information crossing in either direction
      const sizeFactor = 2.0 - Math.abs(part.p1.length - part.p2.length) / 4.0;
      const partPhi = Math.min(flow1to2, flow2to1) * sizeFactor;

      if (partPhi < minPhi) {
        minPhi = partPhi;
        bestPartition = part;
      }
    });

    // Compute visual coords for MIP cut line
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

  // Color configurations based on theme
  const sc = useMemo(() => {
    if (theme === "sepia") {
      return {
        cardBg: "bg-[#F3EDE0] border-[#2C1E11]/15 text-[#2C1E11]",
        nodeBg: "#EEDCBE",
        nodeStroke: "#854d0e",
        activeNode: "#d97706",
        textMuted: "text-[#2C1E11]/70",
        btnPreset: "bg-[#2C1E11]/10 hover:bg-[#2C1E11]/20 text-[#2C1E11]",
        accent: "text-amber-800",
        meterBg: "bg-amber-900/10",
        meterBar: "bg-amber-700",
      };
    } else if (theme === "paper") {
      return {
        cardBg: "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]",
        nodeBg: "#F3F4F6",
        nodeStroke: "#374151",
        activeNode: "#059669",
        textMuted: "text-[#1A1A1A]/70",
        btnPreset: "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
        accent: "text-[#1A1A1A] font-bold",
        meterBg: "bg-slate-100",
        meterBar: "bg-slate-800",
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
        accent: "text-amber-400",
        meterBg: "bg-slate-900/60 border border-white/5",
        meterBar: "bg-gradient-to-r from-amber-500 to-amber-400 shadow-md shadow-amber-500/20",
      };
    }
  }, [theme]);

  // Dynamic descriptions
  const getExplanation = () => {
    const isEs = language === "es";
    if (phi === 0) {
      return isEs
        ? "Φ = 0: El sistema no integra información. Al ser feedforward o estar desconectado, es divisible sin pérdida. No posee conciencia unificada."
        : "Φ = 0: The system does not integrate information. Being feedforward or disconnected, it is divisible without loss. It has no unified consciousness.";
    } else if (phi <= 0.5) {
      return isEs
        ? "Φ bajo: Hay bucles de retroalimentación débiles. Emerge una integración básica, pero la experiencia subjetiva es frágil y limitada."
        : "Low Φ: Weak feedback loops exist. Basic integration emerges, but the subjective experience is fragile and limited.";
    } else if (phi < 1.2) {
      return isEs
        ? "Φ moderado: Estructura circular con flujo continuo. El sistema funciona como una entidad irreductible. Hay un nivel apreciable de conciencia."
        : "Moderate Φ: Circular structure with continuous flow. The system operates as an irreducible entity. A notable level of consciousness is present.";
    } else {
      return isEs
        ? "Φ alto: Red densa y bidireccional de alta cohesión. La información está intrínsecamente integrada como un todo indisoluble."
        : "High Φ: Dense, bidirectional network with high cohesion. Information is intrinsically integrated as an indissoluble whole.";
    }
  };

  const getColorHex = (color: string) => {
    if (theme === "cosmic") {
      switch (color) {
        case "purple": return "#C084FC";
        default: return "#FBBF24";
      }
    } else {
      switch (color) {
        case "purple": return "#9333EA";
        default: return "#D97706";
      }
    }
  };

  return (
    <div className={`rounded-2xl border ${sc.cardBg} p-5 sm:p-6 shadow-xl transition-all duration-300`}>
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left column: SVG Interactive graph */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1.5">
            <button
              onClick={handleReset}
              title={language === "es" ? "Bucle simple" : "Simple loop"}
              className={`p-1.5 rounded-lg ${sc.btnPreset} transition-colors active:scale-95`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePresetHigh}
              className={`text-xs px-2.5 py-1 rounded-lg ${sc.btnPreset} transition-colors font-medium flex items-center gap-1`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              {language === "es" ? "Alta Integración" : "High Integration"}
            </button>
            <button
              onClick={handlePresetFeedforward}
              className={`text-xs px-2.5 py-1 rounded-lg ${sc.btnPreset} transition-colors font-medium flex items-center gap-1`}
            >
              <ShieldAlert className="w-3 h-3 text-slate-500" />
              {language === "es" ? "Feedforward (Φ=0)" : "Feedforward (Φ=0)"}
            </button>
          </div>

          <svg viewBox="0 0 400 400" className="w-full max-w-[340px] aspect-square select-none z-10">
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

              const startX = fx + 24 * Math.cos(angle);
              const startY = fy + 24 * Math.sin(angle);
              const endX = tx - 26 * Math.cos(angle);
              const endY = ty - 26 * Math.sin(angle);

              const isSelected = selectedEdge === key;
              const isFlowing = w > 0;
              const strokeColor = isSelected
                ? "#FBBF24"
                : isFlowing
                ? getColorHex("purple")
                : theme === "cosmic"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)";

              const strokeWidth = isSelected ? 3.5 : isFlowing ? 1.5 + w * 2.5 : 1;

              return (
                <g key={key} className="cursor-pointer" onClick={() => setSelectedEdge(key)}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="transparent"
                    strokeWidth={15}
                  />
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
                  {isFlowing && (
                    <path
                      d={`M ${endX} ${endY} L ${endX - 8 * Math.cos(angle - 0.4)} ${
                        endY - 8 * Math.sin(angle - 0.4)
                      } L ${endX - 8 * Math.cos(angle + 0.4)} ${
                        endY - 8 * Math.sin(angle + 0.4)
                      } Z`}
                      fill={strokeColor}
                      className="transition-all duration-300"
                    />
                  )}
                  {isFlowing && (
                    <text
                      x={(startX + endX) / 2 + 12 * Math.cos(angle + Math.PI / 2)}
                      y={(startY + endY) / 2 + 12 * Math.sin(angle + Math.PI / 2) + 3}
                      fill={isSelected ? "#FBBF24" : theme === "cosmic" ? "#A78BFA" : "#6D28D9"}
                      fontSize="9px"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {w.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* MIP Cut Line */}
            {phi > 0 && mipCutCoords && (
              <line
                x1={mipCutCoords.x1}
                y1={mipCutCoords.y1}
                x2={mipCutCoords.x2}
                y2={mipCutCoords.y2}
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                className="transition-all duration-300 opacity-60"
              />
            )}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isLinked = Object.keys(weights).some(
                (k) => (k.startsWith(`${node.id}-`) && weights[k] > 0) || (k.endsWith(`-${node.id}`) && weights[k] > 0)
              );

              return (
                <g key={node.id} className="pointer-events-none">
                  {isLinked && phi > 0 && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={22}
                      fill="none"
                      stroke={sc.activeNode}
                      strokeWidth={1.5}
                      className="opacity-40"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    fill={sc.nodeBg}
                    stroke={isLinked ? sc.activeNode : sc.nodeStroke}
                    strokeWidth={2}
                    className="transition-colors duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4.5}
                    textAnchor="middle"
                    fill={isLinked ? (theme === "cosmic" ? "#FFF" : sc.nodeStroke) : sc.textMuted}
                    fontSize="12px"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.id}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + (node.y > 200 ? 30 : -24)}
                    textAnchor="middle"
                    fill={sc.textMuted}
                    fontSize="8px"
                    className="font-mono tracking-wider uppercase opacity-70"
                  >
                    {language === "es"
                      ? node.id === "A"
                        ? "Núcleo"
                        : node.id === "B"
                        ? "Sensorial"
                        : node.id === "C"
                        ? "Motor"
                        : "Memoria"
                      : node.id === "A"
                      ? "Core"
                      : node.id === "B"
                      ? "Sensory"
                      : node.id === "C"
                      ? "Motor"
                      : "Memory"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right column: Phi gauge and sliders */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="font-display font-medium text-sm tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              {language === "es" ? "Medidor de Integración (IIT)" : "Integration Meter (IIT)"}
            </h4>

            {/* Phi Value Gauge */}
            <div className={`p-4 rounded-xl ${sc.meterBg} flex flex-col items-center justify-center relative overflow-hidden`}>
              <span className="text-xs font-mono opacity-70 uppercase tracking-widest">
                {language === "es" ? "Información Integrada" : "Integrated Information"}
              </span>
              <span className="text-4xl sm:text-5xl font-display font-bold my-1 tracking-tighter">
                Φ = {phi}
              </span>
              <div className="w-full h-2 bg-black/20 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${sc.meterBar}`}
                  style={{ width: `${Math.min(100, (phi / 2.0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Explanation box */}
            <p className="text-xs font-serif leading-relaxed italic p-3 bg-black/10 rounded-lg">
              {getExplanation()}
            </p>

            {/* Minimum Information Partition (MIP) explanation */}
            {phi > 0 && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-2 text-xs text-red-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">
                    {language === "es" ? "Corte de Información Mínimo (MIP)" : "Minimum Information Cut (MIP)"}
                  </strong>
                  {language === "es" ? (
                    <>
                      El sistema es más vulnerable en la división: <code className="font-mono text-white bg-black/30 px-1 rounded">{mip.label}</code>.
                      El flujo a través de esta sección limita la cohesión del todo.
                    </>
                  ) : (
                    <>
                      The system is most vulnerable at the cut: <code className="font-mono text-white bg-black/30 px-1 rounded">{mip.label}</code>.
                      Flow across this partition bounds the cohesion of the whole.
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive controls */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            {selectedEdge ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span>{language === "es" ? "Conexión Seleccionada" : "Selected Connection"}: <strong className="text-amber-500">{selectedEdge}</strong></span>
                  <span className="font-bold">{weights[selectedEdge] > 0 ? `${(weights[selectedEdge] * 100).toFixed(0)}%` : (language === "es" ? "Inactiva" : "Inactive")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={weights[selectedEdge]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setWeights((prev) => ({ ...prev, [selectedEdge]: val }));
                    }}
                    className="flex-1 accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                  />
                  <button
                    onClick={() => {
                      setWeights((prev) => ({
                        ...prev,
                        [selectedEdge]: weights[selectedEdge] > 0 ? 0.0 : 1.0,
                      }));
                    }}
                    className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded border border-amber-500/25 transition-colors"
                  >
                    {weights[selectedEdge] > 0 ? (language === "es" ? "Apagar" : "Turn Off") : (language === "es" ? "Encender" : "Turn On")}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic text-center py-2">
                {language === "es"
                  ? "Toca cualquier flecha o conexión punteada para regular su flujo."
                  : "Touch any arrow or dotted connection to regulate its flow."}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
