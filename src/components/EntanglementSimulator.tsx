import React, { useState, useEffect, useRef, useMemo } from "react";
import { MoveHorizontal, AlertTriangle, HelpCircle, Activity, Zap, RefreshCw, Info } from "lucide-react";
import { Language } from "../i18n";

interface EntanglementSimulatorProps {
  language: Language;
  theme: "cosmic" | "paper" | "sepia";
}

interface VinePoint {
  x: number;
  y: number;
  z: number;
  angle: number;
}

interface VineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

interface VineLeaf {
  x: number;
  y: number;
  angle: number;
  size: number;
  color: string;
  stroke: string;
}

export const EntanglementSimulator: React.FC<EntanglementSimulatorProps> = ({ language, theme }) => {
  const isEs = language === "es";

  // Distance between the two black hole horizons (from 70px to 250px)
  const [distance, setDistance] = useState<number>(110);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Spark burst animation trigger when bridge snaps
  const [burst, setBurst] = useState<{ active: boolean; x: number; y: number; radius: number }>({
    active: false,
    x: 160,
    y: 130,
    radius: 0,
  });

  const prevDistance = useRef<number>(110);

  // Critical threshold distance where ER bridge breaks
  const CRIT_DISTANCE = 185;

  const isEntangled = distance < CRIT_DISTANCE;

  const handleReset = () => {
    setDistance(110);
  };

  // Handle snapping spark burst animation
  useEffect(() => {
    if (prevDistance.current < CRIT_DISTANCE && distance >= CRIT_DISTANCE) {
      // Snapped! Trigger burst
      setBurst({ active: true, x: 160, y: 130, radius: 5 });
    }
    prevDistance.current = distance;
  }, [distance]);

  // Animate the spark burst frame-by-frame
  useEffect(() => {
    if (burst.active) {
      const id = requestAnimationFrame(() => {
        setBurst((prev) => {
          if (prev.radius > 65) {
            return { ...prev, active: false, radius: 0 };
          }
          return { ...prev, radius: prev.radius + 3 };
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [burst]);

  // Center coordinate of spheres: y is 130, x is offset from center (160)
  const yCenter = 130;
  const xLeft = 160 - distance / 2;
  const xRight = 160 + distance / 2;

  // Drag handlers on SVG
  const handleStartDrag = () => {
    setIsDragging(true);
  };

  const handleDrag = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!isDragging || !svgRef.current) return;

    let clientX = 0;
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * 320; // scale to 320 units

    // Calculate new distance symmetrically around the 160 center
    const newDist = Math.max(70, Math.min(255, Math.abs(mouseX - 160) * 2));
    setDistance(newDist);
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  // Aesthetic color tokens based on theme
  const sc = useMemo(() => {
    if (theme === "sepia") {
      return {
        cardBg: "bg-[#F3EDE0] border-[#2C1E11]/15 text-[#2C1E11]",
        textMuted: "text-[#2C1E11]/70",
        btnPreset: "bg-[#2C1E11]/10 hover:bg-[#2C1E11]/20 text-[#2C1E11]",
        btnActive: "bg-[#2C1E11] text-amber-50",
        panelBg: "bg-[#EEDCBE]/50 border border-amber-900/10",
        waterStart: "#78350F",
        waterEnd: "#451A03",
        waveColor1: "rgba(245, 158, 11, 0.25)",
        waveColor2: "rgba(180, 83, 9, 0.4)",
        sphereStart: "#FFFBEB",
        sphereMid: "#D97706",
        sphereEnd: "#78350F",
        bridgeColor: "#EA580C",
        bridgeGlow: "rgba(234, 88, 12, 0.45)",
        vineColor: "#854D0E", // woody brown
        leafColor: "#D97706", // autumn amber
      };
    } else if (theme === "paper") {
      return {
        cardBg: "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]",
        textMuted: "text-[#1A1A1A]/70",
        btnPreset: "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
        btnActive: "bg-[#1A1A1A] text-white",
        panelBg: "bg-[#F3F4F6] border border-slate-200",
        waterStart: "#0D9488",
        waterEnd: "#115E59",
        waveColor1: "rgba(20, 184, 166, 0.25)",
        waveColor2: "rgba(13, 148, 136, 0.4)",
        sphereStart: "#F0FDF4",
        sphereMid: "#10B981",
        sphereEnd: "#064E3B",
        bridgeColor: "#059669",
        bridgeGlow: "rgba(5, 150, 105, 0.45)",
        vineColor: "#065F46", // deep forest green
        leafColor: "#34D399", // bright mint leaf
      };
    } else {
      // cosmic
      return {
        cardBg: "bg-[#15171F] border-white/5 text-[#E4E6EB]",
        textMuted: "text-slate-400",
        btnPreset: "bg-white/5 hover:bg-white/10 text-slate-300",
        btnActive: "bg-amber-500 text-slate-950 font-bold",
        panelBg: "bg-slate-950/40 border border-white/5",
        waterStart: "#061A2C",
        waterEnd: "#01050A",
        waveColor1: "rgba(59, 130, 246, 0.25)",
        waveColor2: "rgba(30, 64, 175, 0.45)",
        sphereStart: "#E0F2FE",
        sphereMid: "#38BDF8",
        sphereEnd: "#0369A1",
        bridgeColor: "#8B5CF6",
        bridgeGlow: "rgba(139, 92, 246, 0.5)",
        vineColor: "#059669", // emerald vine
        leafColor: "#10B981", // glowing neon green leaves
      };
    }
  }, [theme]);

  // Calculate wormhole thickness: gets thin as it stretches
  const bridgeWidth = useMemo(() => {
    if (!isEntangled) return 0;
    const ratio = distance / CRIT_DISTANCE;
    return Math.max(2.0, 11 * (1 - ratio)); // thicker bridge for better presence
  }, [distance, isEntangled]);

  // Generate 4 distinct creeping vine stems wrapping around the bridge, divided into front & back elements
  const vinesData = useMemo(() => {
    if (!isEntangled) return { behindSegments: [], frontSegments: [], behindLeaves: [], frontLeaves: [] };

    const strength = 1 - distance / CRIT_DISTANCE; // 0 (snapped) to 1.0 (closest)
    const dx = xRight - xLeft;
    
    // Vine parameters (cycles, starting phase, amplitude scalar, leaf density, colors)
    const configs = [
      { cycles: 4.8, phase: 0.0, ampScale: 0.9, color: sc.vineColor, leafColor: sc.leafColor, leafDensity: 0.75 },
      { cycles: 3.0, phase: 1.6, ampScale: 1.3, color: theme === "sepia" ? "#9A3412" : "#047857", leafColor: theme === "sepia" ? "#C2410C" : "#10B981", leafDensity: 0.55 },
      { cycles: 4.2, phase: 3.2, ampScale: 1.0, color: theme === "sepia" ? "#78350F" : "#064E3B", leafColor: theme === "sepia" ? "#EA580C" : "#059669", leafDensity: 0.65 },
      { cycles: 5.8, phase: 4.6, ampScale: 1.15, color: theme === "sepia" ? "#B45309" : "#115E59", leafColor: theme === "sepia" ? "#F59E0B" : "#6EE7B7", leafDensity: 0.45 },
    ];

    const behindSegments: VineSegment[] = [];
    const frontSegments: VineSegment[] = [];
    const behindLeaves: VineLeaf[] = [];
    const frontLeaves: VineLeaf[] = [];

    // The winding radius/amplitude dynamically wraps the bridge thickness + offset
    const baseAmp = bridgeWidth * 0.5 + 2.8;

    configs.forEach((cfg, vineIdx) => {
      const steps = 38; // fine segments for smooth curves
      const points: VinePoint[] = [];

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = xLeft + t * dx;
        
        // Correct mathematical Bezier height equation for Q 160, yCenter-25:
        // y(t) = yCenter - 2 * H * t * (1 - t)
        const yBase = yCenter - 50 * t * (1 - t);
        
        // Winding angle
        const angle = t * Math.PI * 2 * cfg.cycles + cfg.phase;
        
        // Amplitude of wrapping stretches and grows with entanglement strength
        const amplitude = baseAmp * cfg.ampScale * strength;
        const y = yBase + Math.sin(angle) * amplitude;
        const z = Math.cos(angle); // Positive means in front of bridge, Negative means behind

        points.push({ x, y, z, angle });
      }

      // 1. Build segments (lines connecting points)
      for (let i = 0; i < steps; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Determine segment depth based on average Z coordinate
        const avgZ = (p1.z + p2.z) / 2;
        const segment: VineSegment = {
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          color: cfg.color,
          width: Math.max(0.8, 1.8 * strength * (1.1 - 0.2 * (i/steps))),
        };

        if (avgZ < 0) {
          behindSegments.push(segment);
        } else {
          frontSegments.push(segment);
        }
      }

      // 2. Build leaves (placed at specific steps)
      for (let i = 2; i < steps - 1; i += 2) {
        const p = points[i];
        
        // pseudo-random placement probability per step
        const shouldPlaceLeaf = (Math.sin(i * 3.5 + vineIdx * 2.1) + 1) / 2 < cfg.leafDensity;
        const leafSize = Math.max(0, 8.8 * strength * (0.8 + Math.sin(i * 1.5 + vineIdx) * 0.25)); // enlarged size (up to 8.8px)

        if (shouldPlaceLeaf && leafSize > 1.2) {
          const leaf: VineLeaf = {
            x: p.x,
            y: p.y,
            angle: (p.angle * 180) / Math.PI + (i % 3 === 0 ? 30 : -30),
            size: leafSize,
            color: cfg.leafColor,
            stroke: cfg.color,
          };

          // Leaves depth follows the point's Z coordinate
          if (p.z < 0) {
            behindLeaves.push(leaf);
          } else {
            frontLeaves.push(leaf);
          }
        }
      }
    });

    return {
      behindSegments,
      frontSegments,
      behindLeaves,
      frontLeaves,
    };
  }, [distance, xLeft, xRight, isEntangled, bridgeWidth, sc, theme]);

  return (
    <div className={`rounded-2xl border ${sc.cardBg} p-5 sm:p-6 shadow-xl transition-all duration-300`}>
      {/* CSS keyframe animations for moving ocean waves and flow particles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveFloatLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-40px); }
        }
        @keyframes waveFloatRight {
          from { transform: translateX(-40px); }
          to { transform: translateX(0); }
        }
        @keyframes flowParticles {
          from { strokeDashoffset: 100; }
          to { strokeDashoffset: 0; }
        }
        .ocean-wave-1 {
          animation: waveFloatLeft 12s linear infinite;
        }
        .ocean-wave-2 {
          animation: waveFloatRight 15s linear infinite;
        }
        .bridge-flow {
          animation: flowParticles 3.5s linear infinite;
        }
      `}} />

      {/* Title section */}
      <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-display font-medium text-base tracking-wide flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            {isEs ? "Geometría del Entrelazamiento (ER = EPR)" : "Entanglement Geometry (ER = EPR)"}
          </h4>
          <p className="text-xs opacity-75 mt-0.5 font-sans">
            {isEs 
              ? "Experimenta cómo múltiples tallos de enredaderas trepan y rodean el puente en 3D."
              : "Experience how multiple crawling ivy stems climb and physically wrap the bridge in 3D."}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left column: SVG Interactive Arena */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-black/40 rounded-xl min-h-[300px] border border-white/5 shadow-inner">
          <svg 
            ref={svgRef}
            viewBox="0 0 320 320" 
            className="w-full max-w-[300px] aspect-square select-none z-10 cursor-pointer"
            onMouseMove={handleDrag}
            onTouchMove={handleDrag}
            onMouseDown={handleStartDrag}
            onTouchStart={handleStartDrag}
            onMouseUp={handleEndDrag}
            onTouchEnd={handleEndDrag}
            onMouseLeave={handleEndDrag}
          >
            <defs>
              {/* Organic fractal noise filter for 3D sphere texture */}
              <filter id="organicTexture" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise">
                  <animate attributeName="baseFrequency" dur="25s" values="0.03;0.05;0.03" repeatCount="indefinite" />
                </feTurbulence>
                <feColorMatrix type="matrix" values="
                  1 0 0 0 0.1
                  0 1 0 0 0.3
                  0 0 1 0 0.5
                  0 0 0 1 0" result="colored" />
                <feDisplacementMap in="SourceGraphic" in2="colored" scale="12" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                <feBlend mode="multiply" in="SourceGraphic" in2="displaced" />
              </filter>

              {/* Glowing aura filter */}
              <filter id="auraGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* 3D Sphere Radial Lighting */}
              <radialGradient id="sphere3D" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor={sc.sphereStart} />
                <stop offset="45%" stopColor={sc.sphereMid} />
                <stop offset="100%" stopColor={sc.sphereEnd} />
              </radialGradient>

              {/* Sea surface vertical gradient */}
              <linearGradient id="seaGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={sc.waterStart} />
                <stop offset="100%" stopColor={sc.waterEnd} />
              </linearGradient>

              {/* Clipping Masks to keep Sphere borders 100% round and clean */}
              <clipPath id="clipLeft">
                <circle cx={xLeft} cy={yCenter} r={32} />
              </clipPath>
              <clipPath id="clipRight">
                <circle cx={xRight} cy={yCenter} r={32} />
              </clipPath>
            </defs>

            {/* Background space/atmosphere */}
            <rect width="320" height="320" fill="#010306" />

            {/* Glowing vertical ocean reflection bands under the spheres */}
            {isEntangled && (
              <g opacity="0.45" filter="url(#auraGlow)">
                <ellipse cx={xLeft} cy={235} rx="30" ry="4.5" fill={sc.sphereMid} />
                <ellipse cx={xRight} cy={235} rx="30" ry="4.5" fill={sc.sphereMid} />
                {/* Wormhole floor reflection */}
                <ellipse cx={160} cy={240} rx={distance / 2} ry="5" fill={sc.bridgeColor} opacity="0.6" />
              </g>
            )}

            {/* RENDER PHASE 1: Stems and leaves BEHIND the bridge (Z < 0) */}
            {isEntangled && (
              <g filter="url(#auraGlow)">
                {/* Behind vine segments */}
                {vinesData.behindSegments.map((seg, idx) => (
                  <line
                    key={`seg-b-${idx}`}
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke={seg.color}
                    strokeWidth={seg.width}
                    strokeLinecap="round"
                    opacity={0.8}
                  />
                ))}

                {/* Behind leaves */}
                {vinesData.behindLeaves.map((leaf, idx) => (
                  <path
                    key={`leaf-b-${idx}`}
                    d={`M 0,0 Q ${leaf.size},-${leaf.size * 0.75} ${leaf.size * 1.8},0 Q ${leaf.size},${leaf.size * 0.75} 0,0`}
                    fill={leaf.color}
                    stroke={leaf.stroke}
                    strokeWidth="0.5"
                    transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.angle})`}
                    opacity={0.88}
                  />
                ))}
              </g>
            )}

            {/* RENDER PHASE 2: Einstein-Rosen Bridge (Quantum Wormhole) */}
            {isEntangled && (
              <g filter="url(#auraGlow)">
                {/* Thick back connection tunnel casing */}
                <path
                  d={`M ${xLeft},${yCenter} Q 160,${yCenter - 25} ${xRight},${yCenter}`}
                  fill="none"
                  stroke={sc.bridgeGlow}
                  strokeWidth={bridgeWidth + 4}
                  strokeLinecap="round"
                />
                
                {/* Core energy flow bridge thread */}
                <path
                  d={`M ${xLeft},${yCenter} Q 160,${yCenter - 25} ${xRight},${yCenter}`}
                  fill="none"
                  stroke={sc.bridgeColor}
                  strokeWidth={bridgeWidth}
                  strokeLinecap="round"
                />

                {/* Helix winding sub-threads for organic look */}
                <path
                  d={`M ${xLeft},${yCenter} Q 160,${yCenter - 10} ${xRight},${yCenter}`}
                  fill="none"
                  stroke="#FFF"
                  strokeWidth={Math.max(0.6, bridgeWidth * 0.25)}
                  strokeDasharray="8 12"
                  className="bridge-flow opacity-60"
                />
              </g>
            )}

            {/* RENDER PHASE 3: Stems and leaves IN FRONT of the bridge (Z >= 0) */}
            {isEntangled && (
              <g filter="url(#auraGlow)">
                {/* Front vine segments */}
                {vinesData.frontSegments.map((seg, idx) => (
                  <line
                    key={`seg-f-${idx}`}
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke={seg.color}
                    strokeWidth={seg.width}
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                ))}

                {/* Front leaves */}
                {vinesData.frontLeaves.map((leaf, idx) => (
                  <path
                    key={`leaf-f-${idx}`}
                    d={`M 0,0 Q ${leaf.size},-${leaf.size * 0.75} ${leaf.size * 1.8},0 Q ${leaf.size},${leaf.size * 0.75} 0,0`}
                    fill={leaf.color}
                    stroke={leaf.stroke}
                    strokeWidth="0.5"
                    transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.angle})`}
                    opacity={0.95}
                  />
                ))}
              </g>
            )}

            {/* Spark burst expanding circle when connection snaps */}
            {burst.active && (
              <circle
                cx={burst.x}
                cy={burst.y}
                r={burst.radius}
                fill="none"
                stroke={sc.bridgeColor}
                strokeWidth={Math.max(1, 6 - (burst.radius / 10))}
                className="opacity-80"
                filter="url(#auraGlow)"
              />
            )}

            {/* Left 3D Sphere - Clipped to keep outer border perfectly smooth and round */}
            <g filter="url(#auraGlow)">
              {/* Background gradient shadow circle */}
              <circle cx={xLeft} cy={yCenter} r={32} fill={sc.sphereEnd} />
              
              {/* Clipped texture layer */}
              <g clipPath="url(#clipLeft)">
                <circle
                  cx={xLeft}
                  cy={yCenter}
                  r={32}
                  fill="url(#sphere3D)"
                  filter="url(#organicTexture)"
                />
              </g>
              
              {/* Semi-transparent shiny glass highlight overlay */}
              <circle
                cx={xLeft}
                cy={yCenter}
                r={32}
                fill="none"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1.2"
              />
            </g>

            {/* Right 3D Sphere - Clipped to keep outer border perfectly smooth and round */}
            <g filter="url(#auraGlow)">
              {/* Background gradient shadow circle */}
              <circle cx={xRight} cy={yCenter} r={32} fill={sc.sphereEnd} />
              
              {/* Clipped texture layer */}
              <g clipPath="url(#clipRight)">
                <circle
                  cx={xRight}
                  cy={yCenter}
                  r={32}
                  fill="url(#sphere3D)"
                  filter="url(#organicTexture)"
                />
              </g>

              {/* Semi-transparent shiny glass highlight overlay */}
              <circle
                cx={xRight}
                cy={yCenter}
                r={32}
                fill="none"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1.2"
              />
            </g>

            {/* Drag guide vectors shifted down to avoid overlaps */}
            {!isDragging && (
              <g opacity="0.35" transform={`translate(160, 205)`} className="animate-pulse">
                <text x="0" y="0" textAnchor="middle" fill="#FFF" fontSize="8px" fontFamily="monospace" letterSpacing="1">
                  {isEs ? "ARRAS-TRAR" : "DRAG"}
                </text>
                <path d="M -22 -3 L -30 0 L -22 3 M -30 0 L 30 0 M 22 -3 L 30 0 L 22 3" fill="none" stroke="#FFF" strokeWidth="0.8" />
              </g>
            )}

            {/* Ocean Surface Ground Floor (Wavy parallax lines) */}
            <g>
              {/* Back wave layer */}
              <path
                d="M -40,240 Q 0,232 40,240 T 120,240 T 200,240 T 280,240 T 360,240 L 360,325 L -40,325 Z"
                fill="url(#seaGrad)"
                className="ocean-wave-1 opacity-70"
              />

              {/* Middle wave layer (reflective color highlight) */}
              <path
                d="M -40,248 Q 20,240 80,248 T 200,248 T 320,248 L 320,325 L -40,325 Z"
                fill={sc.waveColor1}
                className="ocean-wave-2"
              />

              {/* Front wave layer (dark depth) */}
              <path
                d="M -40,256 Q 10,248 60,256 T 160,256 T 260,256 T 360,256 L 360,325 L -40,325 Z"
                fill={sc.waveColor2}
                className="ocean-wave-1"
              />
            </g>
          </svg>
        </div>

        {/* Right column: Controls & Didactic Panel */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            
            {/* Connection Status panel */}
            <div className={`p-4 rounded-xl ${sc.panelBg} flex flex-col items-center justify-center relative overflow-hidden`}>
              <span className="text-[10px] font-mono opacity-70 uppercase tracking-widest text-center">
                {isEs ? "Estado de Conexión de Horizontes" : "Horizon Connection State"}
              </span>
              <span className={`text-2xl font-display font-bold mt-1.5 flex items-center gap-2 ${
                isEntangled ? "text-amber-500" : "text-red-500 animate-pulse"
              }`}>
                {isEntangled ? (
                  <>
                    <Zap className="w-5 h-5 animate-bounce" />
                    {isEs ? "ENTRELAZADO (ER = EPR)" : "ENTANGLED (ER = EPR)"}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    {isEs ? "DESENTRELAZADO" : "DISENTANGLED"}
                  </>
                )}
              </span>
              
              {/* Distance meter bar */}
              <div className="w-full h-1.5 bg-black/25 rounded-full mt-3 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isEntangled ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${(distance / 255) * 100}%` }}
                />
              </div>
            </div>

            {/* Didactic explanation block */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-xs leading-relaxed font-serif text-slate-300">
              {isEntangled ? (
                isEs ? (
                  <>
                    <strong>Puente Einstein-Rosen Estable:</strong> Los dos horizontes están conectados por un micro-agujero de gusano (ER). Aunque los separes, comparten una misma región interna. Emerge el vínculo cuántico.
                  </>
                ) : (
                  <>
                    <strong>Stable Einstein-Rosen Bridge:</strong> Both horizons are connected by a microscopic wormhole (ER). Even as you separate them, they share a common internal region. Quantum bond emerges.
                  </>
                )
              ) : (
                isEs ? (
                  <>
                    <strong>Decoherencia Cuántica:</strong> La separación superó el límite crítico ({CRIT_DISTANCE}px). El puente de espacio-tiempo se estiró demasiado y colapsó. La información de los horizontes ya no está unida.
                  </>
                ) : (
                  <>
                    <strong>Quantum Decoherence:</strong> The separation exceeded the critical limit ({CRIT_DISTANCE}px). The spacetime bridge stretched too far and collapsed. The information inside the horizons is no longer linked.
                  </>
                )
              )}
            </div>

            {/* Manual coordinate slider (as backup to dragging) */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span>{isEs ? "Distancia Espacial" : "Spatial Distance"}</span>
                <span className="text-amber-500">{distance.toFixed(0)} px</span>
              </div>
              <input
                type="range"
                min="70"
                max="250"
                step="1"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Scientific Fact box */}
            <div className="p-3 bg-black/25 rounded-lg text-[11px] leading-relaxed text-slate-400 font-mono flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
              <p>
                {isEs ? (
                  <>
                    La conjetura <strong>ER=EPR</strong> (Maldacena & Susskind, 2013) propone que el entrelazamiento cuántico (EPR) es equivalente a la presencia de un puente de Einstein-Rosen (ER) en el tejido geométrico del espacio-tiempo.
                  </>
                ) : (
                  <>
                    The <strong>ER=EPR</strong> conjecture (Maldacena & Susskind, 2013) proposes that quantum entanglement (EPR) is equivalent to the presence of an Einstein-Rosen bridge (ER) in the geometry of spacetime.
                  </>
                )}
              </p>
            </div>

          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className={`w-full text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 ${sc.btnPreset}`}
          >
            <RefreshCw className="w-4 h-4" />
            {isEs ? "Reiniciar Distancia" : "Reset Distance"}
          </button>

        </div>

      </div>
    </div>
  );
};
