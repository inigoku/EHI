import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, RotateCcw, AlertTriangle } from "lucide-react";
import { Language } from "../i18n";

interface HorizonSimulatorProps {
  language: Language;
  theme: "cosmic" | "paper" | "sepia";
}

const ITEMS_ES = ["Yo", "Memoria", "Tiempo", "Miedo", "Silencio", "Identidad"];
const ITEMS_EN = ["Self", "Memory", "Time", "Fear", "Silence", "Identity"];

export const HorizonSimulator: React.FC<HorizonSimulatorProps> = ({ language, theme }) => {
  const isEs = language === "es";
  const items = isEs ? ITEMS_ES : ITEMS_EN;

  const [selectedItem, setSelectedItem] = useState<string>(items[0]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Black hole event horizon radius (Schwarschild Radius Rs)
  const [Rs, setRs] = useState<number>(60);

  // Current distance of the object from center (Rs .. 220)
  const [r, setR] = useState<number>(220);

  // Clocks
  const [tObserver, setTObserver] = useState<number>(0.0);
  const [tSubjective, setTSubjective] = useState<number>(0.0);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Calculations
  const { gamma, speedFactor, redshiftColor, opacity, stretchX, stretchY } = useMemo(() => {
    // Safety check to prevent division by zero or negative sqrt
    const normalizedR = Math.max(r, Rs + 0.5);
    const ratio = Rs / normalizedR;

    // Time dilation factor (gamma)
    const g = 1 / Math.sqrt(1 - ratio);

    // Coordinate speed factor (slowing down from observer view)
    const sFact = 1 - ratio;

    // Redshift color transition (HSL)
    // Cyan/Blue (190) -> Orange (30) -> Red (0)
    const hue = Math.max(0, 190 - ratio * 200);
    // Darkening near the horizon
    const lightness = Math.max(10, 60 - ratio * 45);
    const color = `hsl(${hue}, 90%, ${lightness}%)`;

    // Opacity fades out near the horizon due to extreme redshift and photon capture
    const op = Math.max(0.05, 1 - ratio * 0.95);

    // Spaghettification: stretched radially (X in our drop), compressed angularly (Y)
    const sX = 1 + ratio * 2.5;
    const sY = Math.max(0.4, 1 - ratio * 0.5);

    return {
      gamma: g,
      speedFactor: sFact,
      redshiftColor: color,
      opacity: op,
      stretchX: sX,
      stretchY: sY,
    };
  }, [r, Rs]);

  // Animation Loop
  const animate = (time: number) => {
    if (previousTimeRef.current !== null) {
      const dt = (time - previousTimeRef.current) / 1000; // in seconds

      setR((prevR) => {
        // Slow down radial speed coordinate-wise as we approach Rs
        const baseSpeed = 45; // pixels per sec
        const speed = baseSpeed * (1 - Rs / prevR);
        const nextR = prevR - speed * dt;

        // Never actually cross Rs from observer's perspective
        return Math.max(Rs + 0.1, nextR);
      });

      setTObserver((prev) => prev + dt);
      
      // Subjective time rate is dilated by gamma
      setTSubjective((prev) => prev + dt / gamma);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, gamma]);

  const handleReset = () => {
    setIsRunning(false);
    setR(220);
    setTObserver(0.0);
    setTSubjective(0.0);
  };

  // Color configurations based on theme
  const sc = useMemo(() => {
    if (theme === "sepia") {
      return {
        cardBg: "bg-[#F3EDE0] border-[#2C1E11]/15 text-[#2C1E11]",
        textMuted: "text-[#2C1E11]/70",
        btnActive: "bg-[#2C1E11] text-amber-50 hover:bg-[#2C1E11]/90",
        btnInactive: "bg-[#2C1E11]/10 hover:bg-[#2C1E11]/20 text-[#2C1E11]",
        panelBg: "bg-[#EEDCBE]/50 border border-amber-900/10",
        gridLine: "rgba(133, 77, 14, 0.08)",
      };
    } else if (theme === "paper") {
      return {
        cardBg: "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]",
        textMuted: "text-[#1A1A1A]/70",
        btnActive: "bg-[#1A1A1A] text-white hover:bg-black",
        btnInactive: "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
        panelBg: "bg-[#F3F4F6] border border-slate-200",
        gridLine: "rgba(0, 0, 0, 0.05)",
      };
    } else {
      // cosmic
      return {
        cardBg: "bg-[#15171F] border-white/5 text-[#E4E6EB]",
        textMuted: "text-slate-400",
        btnActive: "bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold shadow-lg shadow-amber-500/10",
        btnInactive: "bg-white/5 hover:bg-white/10 text-slate-300",
        panelBg: "bg-slate-950/40 border border-white/5",
        gridLine: "rgba(255, 255, 255, 0.05)",
      };
    }
  }, [theme]);

  // Center coordinate of SVG space (320x320)
  const cx = 160;
  const cy = 160;

  // Calculate object coordinates
  // Moving from left (r = 220) to center (r = 0) horizontally
  const objX = cx + r;
  const objY = cy;

  return (
    <div className={`rounded-2xl border ${sc.cardBg} p-5 sm:p-6 shadow-xl transition-all duration-300`}>
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left column: SVG simulation */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-black/20 rounded-xl min-h-[300px]">
          
          <svg viewBox="0 0 320 320" className="w-full max-w-[300px] aspect-square select-none z-10">
            {/* Draw gravity well funnel lines (warped grid) */}
            <circle cx={cx} cy={cy} r={220} fill="none" stroke={sc.gridLine} strokeWidth={1} />
            <circle cx={cx} cy={cy} r={170} fill="none" stroke={sc.gridLine} strokeWidth={1} />
            <circle cx={cx} cy={cy} r={120} fill="none" stroke={sc.gridLine} strokeWidth={1} />
            <circle cx={cx} cy={cy} r={80} fill="none" stroke={sc.gridLine} strokeWidth={1} />

            {/* Radial grid lines representing coordinates */}
            {Array.from({ length: 8 }).map((_, idx) => {
              const angle = (idx * Math.PI) / 4;
              return (
                <line
                  key={idx}
                  x1={cx + Rs * Math.cos(angle)}
                  y1={cy + Rs * Math.sin(angle)}
                  x2={cx + 220 * Math.cos(angle)}
                  y2={cy + 220 * Math.sin(angle)}
                  stroke={sc.gridLine}
                  strokeWidth={0.8}
                />
              );
            })}

            {/* Black Hole Singularity accretion disk */}
            <circle
              cx={cx}
              cy={cy}
              r={Rs + 8}
              fill="none"
              stroke="url(#accretionGlow)"
              strokeWidth={12}
              className="opacity-40"
            />
            
            {/* Real Event Horizon circle (pure black) */}
            <circle
              cx={cx}
              cy={cy}
              r={Rs}
              fill="#020204"
              stroke={theme === "cosmic" ? "rgba(251,191,36,0.35)" : "rgba(0,0,0,0.2)"}
              strokeWidth={2.5}
            />

            {/* Accretion disk glow shader */}
            <defs>
              <radialGradient id="accretionGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="1" />
                <stop offset="70%" stopColor="#EA580C" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Falling Object */}
            {r > Rs && (
              <g 
                transform={`translate(${objX}, ${objY}) scale(${stretchX}, ${stretchY})`}
                style={{ opacity }}
              >
                {/* Spaghettified glow trail */}
                <ellipse cx={0} cy={0} rx={16} ry={6} fill={redshiftColor} className="opacity-20 blur-sm" />
                {/* Object core */}
                <circle cx={0} cy={0} r={5} fill={redshiftColor} />
                {/* Object Label text */}
                <text
                  x={0}
                  y={-12}
                  textAnchor="middle"
                  fill={redshiftColor}
                  fontSize="11px"
                  fontWeight="bold"
                  transform="scale(0.85, 2)" // reverse spaghettification transform slightly so text remains readable
                  className="font-sans filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                >
                  {selectedItem}
                </text>
              </g>
            )}
          </svg>

          {/* Dilation Factor overlay */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[10px] text-slate-300">
            {isEs ? "Dilatación Temporal" : "Time Dilation"} (γ):{" "}
            <span className={gamma > 100 ? "text-red-500 animate-pulse font-bold" : "text-amber-400 font-bold"}>
              {gamma > 1000 ? "∞" : `${gamma.toFixed(2)}x`}
            </span>
          </div>
        </div>

        {/* Right column: Clocks & control panel */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            
            {/* Item selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono opacity-70 uppercase tracking-widest block">
                {isEs ? "Objeto en caída libre" : "Falling Object"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedItem(item);
                      handleReset();
                    }}
                    className={`text-xs px-2.5 py-1.5 rounded-lg transition-all font-medium ${
                      selectedItem === item ? sc.btnActive : sc.btnInactive
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Clocks comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Observer Clock */}
              <div className={`p-3.5 rounded-xl ${sc.panelBg} flex flex-col`}>
                <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider block">
                  {isEs ? "Tiempo Externo (Tú)" : "External Time (You)"}
                </span>
                <span className="text-2xl font-mono font-bold mt-1 text-slate-100">
                  {tObserver.toFixed(2)}s
                </span>
                <span className="text-[9px] font-mono opacity-50 block mt-0.5">
                  {isEs ? "Observador exterior" : "Observer on Earth"}
                </span>
              </div>

              {/* Subjective Clock */}
              <div className={`p-3.5 rounded-xl ${sc.panelBg} flex flex-col border border-red-500/5`}>
                <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider block">
                  {isEs ? "Tiempo Subjetivo" : "Subjective Time"}
                </span>
                <span className="text-2xl font-mono font-bold mt-1 text-amber-400">
                  {tSubjective.toFixed(2)}s
                </span>
                <span className="text-[9px] font-mono opacity-50 block mt-0.5">
                  {isEs ? "En la palabra caída" : "Inside the falling word"}
                </span>
              </div>
            </div>

            {/* Interactive sliders */}
            <div className="space-y-3 pt-2">
              {/* Height slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>{isEs ? "Posición (Distancia al centro)" : "Position (Distance to center)"}</span>
                  <span className="text-amber-500">{r.toFixed(1)} px</span>
                </div>
                <input
                  type="range"
                  min={Rs + 0.1}
                  max="220"
                  step="0.5"
                  value={r}
                  disabled={isRunning}
                  onChange={(e) => {
                    setR(parseFloat(e.target.value));
                  }}
                  className={`w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none ${
                    isRunning ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Mass (Rs) slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>{isEs ? "Radio de Schwarzschild (Masa)" : "Schwarzschild Radius (Mass)"}</span>
                  <span className="text-amber-500">{Rs} px</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={Rs}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setRs(val);
                    if (r < val) setR(val + 5);
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            </div>
            
            {/* Informational block */}
            {r < Rs + 5 && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-2 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {isEs ? (
                    <>
                      <strong>Congelación temporal:</strong> El objeto está infinitamente cerca del límite. Su velocidad aparente cae a cero y su luz se apaga. Su tiempo subjetivo se detiene para siempre en tu presente.
                    </>
                  ) : (
                    <>
                      <strong>Time Freeze:</strong> The object is infinitely close to the boundary. Its apparent velocity drops to zero and its light fades out. Its subjective time stops forever in your present.
                    </>
                  )}
                </p>
              </div>
            )}

          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-3 border-t border-white/5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 ${sc.btnActive}`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  {isEs ? "Pausar Caída" : "Pause Fall"}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {isEs ? "Iniciar Caída" : "Start Fall"}
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className={`text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 ${sc.btnInactive}`}
            >
              <RotateCcw className="w-4 h-4" />
              {isEs ? "Reiniciar" : "Reset"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
