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
    { id: "A", x: 200, y: 75, labelEs: "Cerebro (Núcleo)", labelEn: "Brain (Core)", icon: Brain },
    { id: "B", x: 325, y: 200, labelEs: "Ojo (Sensorial)", labelEn: "Eye (Sensory)", icon: Eye },
    { id: "C", x: 200, y: 325, labelEs: "Mano (Motor)", labelEn: "Hand (Motor)", icon: HelpCircle },
    { id: "D", x: 75, y: 200, labelEs: "Memoria (Hipocampo)", labelEn: "Memory (Hipocampus)", icon: HardDrive },
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
        textMuted: "text-[#2C1E11]/70",
        btnPreset: "bg-[#2C1E11]/10 hover:bg-[#2C1E11]/20 text-[#2C1E11]",
        btnActive: "bg-[#2C1E11] text-amber-50",
        meterBg: "bg-amber-900/10",
        meterBar: "bg-amber-700",
        // SVG Styles
        waterGradientStart: "#2D1B08",
        waterGradientEnd: "#1C0F02",
        waterBlobColor: "rgba(217, 119, 6, 0.06)",
        sphereActiveStart: "#FFFBEB",
        sphereActiveMid: "#D97706",
        sphereActiveEnd: "#78350F",
        sphereInactiveStart: "#F3EDE0",
        sphereInactiveMid: "#8C7E6B",
        sphereInactiveEnd: "#453C30",
        tubeBg: "rgba(217, 119, 6, 0.15)",
        tubeActive: "#D97706",
        particleColor: "#FBBF24",
      };
    } else if (theme === "paper") {
      return {
        cardBg: "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]",
        textMuted: "text-[#1A1A1A]/70",
        btnPreset: "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
        btnActive: "bg-[#1A1A1A] text-white",
        meterBg: "bg-slate-100",
        meterBar: "bg-slate-800",
        // SVG Styles
        waterGradientStart: "#F0FDF4",
        waterGradientEnd: "#DCFCE7",
        waterBlobColor: "rgba(5, 150, 105, 0.04)",
        sphereActiveStart: "#ECFDF5",
        sphereActiveMid: "#059669",
        sphereActiveEnd: "#064E3B",
        sphereInactiveStart: "#F9FAFB",
        sphereInactiveMid: "#9CA3AF",
        sphereInactiveEnd: "#374151",
        tubeBg: "rgba(5, 150, 105, 0.12)",
        tubeActive: "#059669",
        particleColor: "#34D399",
      };
    } else {
      // cosmic
      return {
        cardBg: "bg-[#15171F] border-white/5 text-[#E4E6EB]",
        textMuted: "text-slate-400",
        btnPreset: "bg-white/5 hover:bg-white/10 text-slate-300",
        btnActive: "bg-amber-500 text-slate-950 font-bold",
        meterBg: "bg-slate-900/60 border border-white/5",
        meterBar: "bg-gradient-to-r from-amber-500 to-amber-400 shadow-md shadow-amber-500/20",
        // SVG Styles
        waterGradientStart: "#051625",
        waterGradientEnd: "#01050A",
        waterBlobColor: "rgba(59, 130, 246, 0.05)",
        sphereActiveStart: "#FFFBEB",
        sphereActiveMid: "#FBBF24",
        sphereActiveEnd: "#9A3412",
        sphereInactiveStart: "#F1F5F9",
        sphereInactiveMid: "#475569",
        sphereInactiveEnd: "#0F172A",
        tubeBg: "rgba(167, 139, 250, 0.08)",
        tubeActive: "#8B5CF6",
        particleColor: "#A78BFA",
      };
    }
  }, [theme]);

  return (
    <div className={`rounded-2xl border ${sc.cardBg} p-5 sm:p-6 shadow-xl transition-all duration-300`}>
      {/* CSS custom keyframe animations for watery drifting background */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatBlob1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -35px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes floatBlob2 {
          0% { transform: translate(0, 0) scale(1.05); }
          50% { transform: translate(-30px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1.05); }
        }
        .water-blob-1 {
          animation: floatBlob1 18s ease-in-out infinite;
        }
        .water-blob-2 {
          animation: floatBlob2 22s ease-in-out infinite;
        }
      `}} />

      {/* Title block */}
      <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-display font-medium text-base tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            {isEs ? "Experimentación Táctil: Información Integrada" : "Tactile Simulation: Integrated Information"}
          </h4>
          <p className="text-xs opacity-75 mt-0.5 font-sans">
            {isEs 
              ? "Toca las conexiones de gel en el agua para regular el flujo de información."
              : "Touch fluid connections in the water to regulate information flow."}
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
          className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded border border-red-500/10 transition-colors"
        >
          {isEs ? "Limpiar" : "Clear"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left panel: Constellation graph (SVG) with volumetric spheres and tubes on watery background */}
        <div className="flex-[5] flex flex-col items-center justify-center relative p-1.5 bg-black/15 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
          <svg viewBox="0 0 400 400" className="w-full max-w-[345px] aspect-square select-none z-10 rounded-xl">
            
            <defs>
              {/* Watery background linear gradient */}
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={sc.waterGradientStart} />
                <stop offset="100%" stopColor={sc.waterGradientEnd} />
              </linearGradient>

              {/* Active node 3D sphere radial gradient */}
              <radialGradient id="sphereActive" cx="32%" cy="32%" r="68%">
                <stop offset="0%" stopColor={sc.sphereActiveStart} />
                <stop offset="35%" stopColor={sc.sphereActiveMid} />
                <stop offset="100%" stopColor={sc.sphereActiveEnd} />
              </radialGradient>

              {/* Inactive node 3D sphere radial gradient */}
              <radialGradient id="sphereInactive" cx="32%" cy="32%" r="68%">
                <stop offset="0%" stopColor={sc.sphereInactiveStart} />
                <stop offset="45%" stopColor={sc.sphereInactiveMid} />
                <stop offset="100%" stopColor={sc.sphereInactiveEnd} />
              </radialGradient>

              {/* Node Drop Shadow */}
              <filter id="sphereShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.65" />
              </filter>
              
              {/* Volumetric Tube Glow filter */}
              <filter id="tubeGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Aqueous depth background rect */}
            <rect width="400" height="400" fill="url(#waterGrad)" />
            
            {/* Shifting liquid blobs in background (water current) */}
            <circle cx="120" cy="150" r="110" fill={sc.waterBlobColor} className="water-blob-1 filter blur-[35px]" />
            <circle cx="280" cy="260" r="120" fill={sc.waterBlobColor} className="water-blob-2 filter blur-[40px]" />
            
            {/* Radial coordinate rings */}
            <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 8" />

            {/* Draw synaptic gel tubes (Volumetric Connections) */}
            {Object.entries(weights).map(([key, wVal]) => {
              const w = wVal as number;
              const [fromId, toId] = key.split("-");
              const fromNode = nodes.find((n) => n.id === fromId)!;
              const toNode = nodes.find((n) => n.id === toId)!;

              const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
              
              const shift = 6.5;
              const fx = fromNode.x + shift * Math.cos(angle + Math.PI / 2);
              const fy = fromNode.y + shift * Math.sin(angle + Math.PI / 2);
              const tx = toNode.x + shift * Math.cos(angle + Math.PI / 2);
              const ty = toNode.y + shift * Math.sin(angle + Math.PI / 2);

              // Clear spacing from spheres center
              const startX = fx + 28 * Math.cos(angle);
              const startY = fy + 28 * Math.sin(angle);
              const endX = tx - 30 * Math.cos(angle);
              const endY = ty - 30 * Math.sin(angle);

              const isHovered = hoveredEdge === key;
              const isFlowing = w > 0;

              // Volumetric styling variables
              const tubeWidth = isFlowing ? (w === 0.5 ? 9 : 14) : 4;
              const coreWidth = isFlowing ? (w === 0.5 ? 4 : 8) : 1;
              
              return (
                <g 
                  key={key} 
                  className="cursor-pointer" 
                  onClick={() => handleEdgeClick(key)}
                  onMouseEnter={() => setHoveredEdge(key)}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  {/* Broad invisible mouse click target line */}
                  <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="transparent" strokeWidth={24} />

                  {/* 1. Cast shadow of the gel tube on the water background */}
                  {isFlowing && (
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#000"
                      strokeWidth={tubeWidth}
                      strokeLinecap="round"
                      className="opacity-45 filter blur-[3px]"
                      transform="translate(2, 4)"
                    />
                  )}

                  {/* 2. Tube Outer Sheath (Gel Pipe) */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={isFlowing ? sc.tubeActive : (theme === "cosmic" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)")}
                    strokeWidth={tubeWidth}
                    strokeLinecap="round"
                    strokeDasharray={!isFlowing ? "4 4" : undefined}
                    className="opacity-20 transition-all duration-300"
                  />

                  {/* 3. Fluid Liquid Core (inside the sheath) */}
                  {isFlowing && (
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={sc.tubeActive}
                      strokeWidth={coreWidth}
                      strokeLinecap="round"
                      className="opacity-60 transition-all duration-300"
                      filter="url(#tubeGlow)"
                    />
                  )}

                  {/* 4. Cylindrical 3D Specular Highlight Line (simulates 3D gloss/reflection) */}
                  {isFlowing && (
                    <line
                      x1={startX + 1 * Math.cos(angle + Math.PI / 2)}
                      y1={startY + 1 * Math.sin(angle + Math.PI / 2)}
                      x2={endX + 1 * Math.cos(angle + Math.PI / 2)}
                      y2={endY + 1 * Math.sin(angle + Math.PI / 2)}
                      stroke="#FFF"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      className="opacity-45 transition-all duration-300"
                    />
                  )}

                  {/* Glowing signal packet drifting inside the watery core */}
                  {isFlowing && (
                    <g>
                      <circle r={w === 0.5 ? 3.5 : 5.5} fill="#FFF" className="opacity-30 filter blur-[1px]">
                        <animateMotion
                          dur={w === 0.5 ? "2.6s" : "1.4s"}
                          repeatCount="indefinite"
                          path={`M ${startX} ${startY} L ${endX} ${endY}`}
                        />
                      </circle>
                      <circle r={w === 0.5 ? 2 : 3} fill="#FFF">
                        <animateMotion
                          dur={w === 0.5 ? "2.6s" : "1.4s"}
                          repeatCount="indefinite"
                          path={`M ${startX} ${startY} L ${endX} ${endY}`}
                        />
                      </circle>
                    </g>
                  )}

                  {/* Directed volume arrow head pointer */}
                  {isFlowing && (
                    <path
                      d={`M ${endX} ${endY} L ${endX - 9 * Math.cos(angle - 0.4)} ${
                        endY - 9 * Math.sin(angle - 0.4)
                      } L ${endX - 9 * Math.cos(angle + 0.4)} ${
                        endY - 9 * Math.sin(angle + 0.4)
                      } Z`}
                      fill={isHovered ? "#FBBF24" : sc.tubeActive}
                      className="transition-all duration-300 opacity-80"
                    />
                  )}

                  {/* Hover weight number tag */}
                  {isFlowing && (
                    <g transform={`translate(${(startX + endX) / 2 + 15 * Math.cos(angle + Math.PI / 2)}, ${(startY + endY) / 2 + 15 * Math.sin(angle + Math.PI / 2) + 3})`}>
                      <text
                        fill={isHovered ? "#FBBF24" : (theme === "cosmic" ? "#A78BFA" : sc.tubeActive)}
                        fontSize="8.5px"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="font-mono filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                      >
                        {w.toFixed(1)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* MIP Cut division (Glowing Red Laser Laser Divider) */}
            {phi > 0 && mipCutCoords && (
              <g>
                {/* Red Laser shadow */}
                <line
                  x1={mipCutCoords.x1}
                  y1={mipCutCoords.y1}
                  x2={mipCutCoords.x2}
                  y2={mipCutCoords.y2}
                  stroke="#EF4444"
                  strokeWidth={3}
                  className="opacity-40 filter blur-[2px]"
                />
                {/* Core laser line */}
                <line
                  x1={mipCutCoords.x1}
                  y1={mipCutCoords.y1}
                  x2={mipCutCoords.x2}
                  y2={mipCutCoords.y2}
                  stroke="#FF8A8A"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* Render Nodes as 3D Volumetric Spheres */}
            {nodes.map((node) => {
              const IconComp = node.icon;
              const isLinked = Object.keys(weights).some(
                (k) => (k.startsWith(`${node.id}-`) && weights[k] > 0) || (k.endsWith(`-${node.id}`) && weights[k] > 0)
              );

              return (
                <g key={node.id} className="pointer-events-none">
                  {/* Glowing halo behind active 3D spheres */}
                  {isLinked && phi > 0 && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={30}
                      fill="none"
                      stroke={sc.tubeActive}
                      strokeWidth={1.5}
                      className="opacity-25 animate-pulse"
                    />
                  )}

                  {/* 3D Sphere Element with radial lighting */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={24}
                    fill={isLinked ? "url(#sphereActive)" : "url(#sphereInactive)"}
                    filter="url(#sphereShadow)"
                    className="transition-all duration-300"
                  />

                  {/* SVG Icon centered on the sphere */}
                  <g transform={`translate(${node.x - 7.5}, ${node.y - 7.5})`} className="opacity-95">
                    <IconComp 
                      className="w-[15px] h-[15px]" 
                      style={{ color: isLinked ? "#FFF" : "rgba(255, 255, 255, 0.45)" }} 
                    />
                  </g>

                  {/* Label positioning adjusted around the sphere */}
                  <text
                    x={node.x}
                    y={node.y + (node.y > 200 ? 38 : -32)}
                    textAnchor="middle"
                    fill={isLinked ? (theme === "cosmic" ? "#E4E6EB" : "#1A1A1A") : sc.textMuted}
                    fontSize="9px"
                    fontWeight="bold"
                    className="font-sans filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]"
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
