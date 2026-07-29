import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, RotateCcw, AlertTriangle, Eye, Navigation, Info } from "lucide-react";
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

  // Perspective: "observer" (earth) or "object" (subjective inside)
  const [perspective, setPerspective] = useState<"observer" | "object">("observer");

  // Rs is event horizon radius
  const [Rs, setRs] = useState<number>(60);

  // Distance from center (Rs .. 220)
  const [r, setR] = useState<number>(220);

  // Clocks
  const [tObserver, setTObserver] = useState<number>(0.0);
  const [tSubjective, setTSubjective] = useState<number>(0.0);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Physics Calculations
  const { gamma, redshiftColor, opacity, stretchX, stretchY } = useMemo(() => {
    const normalizedR = Math.max(r, Rs + 0.5);
    const ratio = Rs / normalizedR;

    // Time dilation factor (gamma)
    const g = 1 / Math.sqrt(1 - ratio);

    // Redshift color (HSL): Blue/Cyan (190) -> Orange (30) -> Red (0)
    const hue = Math.max(0, 195 - ratio * 205);
    const lightness = Math.max(8, 55 - ratio * 45);
    const color = `hsl(${hue}, 95%, ${lightness}%)`;

    // Opacity fades near horizon due to extreme redshift (photons lose all energy)
    const op = Math.max(0.02, 1 - ratio * 0.95);

    // Radial stretch (spaghettification)
    const sX = 1 + ratio * 3.0;
    const sY = Math.max(0.3, 1 - ratio * 0.6);

    return {
      gamma: g,
      redshiftColor: color,
      opacity: op,
      stretchX: sX,
      stretchY: sY,
    };
  }, [r, Rs]);

  // Reset function
  const handleReset = () => {
    setIsRunning(false);
    setR(220);
    setTObserver(0.0);
    setTSubjective(0.0);
  };

  // Switch perspective resets state
  const handlePerspectiveChange = (persp: "observer" | "object") => {
    setPerspective(persp);
    handleReset();
  };

  // Animation Loop
  const animate = (time: number) => {
    if (previousTimeRef.current !== null) {
      const dt = (time - previousTimeRef.current) / 1000; // in seconds

      if (perspective === "observer") {
        // Observer's view: object slows down exponentially near Rs and NEVER crosses Rs
        setR((prevR) => {
          const baseSpeed = 50; // pixels per sec
          // Coordinate speed decreases as we approach Rs
          const speed = baseSpeed * (1 - Rs / prevR);
          const nextR = prevR - speed * dt;
          return Math.max(Rs + 0.05, nextR);
        });
        setTObserver((prev) => prev + dt);
        setTSubjective((prev) => prev + dt / gamma);
      } else {
        // Object's view: falls at a steady speed, crosses Rs smoothly, and hits singularity (r = 0)
        setR((prevR) => {
          const baseSpeed = 60; // constant subjective falling speed
          const nextR = prevR - baseSpeed * dt;
          if (nextR <= 5) {
            setIsRunning(false); // reached singularity
            return 0.1;
          }
          return nextR;
        });
        // For the falling object, subjective clock runs at normal rate
        setTSubjective((prev) => prev + dt);
        // From object's perspective, external observer's clock runs infinitely fast (ticks accelerated)
        setTObserver((prev) => prev + dt * gamma);
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, perspective, gamma]);

  const sc = useMemo(() => {
    if (theme === "sepia") {
      return {
        cardBg: "bg-[#F3EDE0] border-[#2C1E11]/15 text-[#2C1E11]",
        textMuted: "text-[#2C1E11]/70",
        btnActive: "bg-[#2C1E11] text-amber-50 hover:bg-[#2C1E11]/90",
        btnInactive: "bg-[#2C1E11]/10 hover:bg-[#2C1E11]/20 text-[#2C1E11]",
        panelBg: "bg-[#EEDCBE]/50 border border-amber-900/10",
        gridLine: "rgba(133, 77, 14, 0.09)",
        wellGlow: "rgba(217, 119, 6, 0.06)",
      };
    } else if (theme === "paper") {
      return {
        cardBg: "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]",
        textMuted: "text-[#1A1A1A]/70",
        btnActive: "bg-[#1A1A1A] text-white hover:bg-black",
        btnInactive: "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
        panelBg: "bg-[#F3F4F6] border border-slate-200",
        gridLine: "rgba(0, 0, 0, 0.06)",
        wellGlow: "rgba(15, 23, 42, 0.03)",
      };
    } else {
      // cosmic
      return {
        cardBg: "bg-[#15171F] border-white/5 text-[#E4E6EB]",
        textMuted: "text-slate-400",
        btnActive: "bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold shadow-lg shadow-amber-500/10",
        btnInactive: "bg-white/5 hover:bg-white/10 text-slate-300",
        panelBg: "bg-slate-950/40 border border-white/5",
        gridLine: "rgba(255, 255, 255, 0.07)",
        wellGlow: "rgba(251, 191, 36, 0.05)",
      };
    }
  }, [theme]);

  // Center coordinate of SVG space (320x320)
  const cx = 160;
  const cy = 160;

  // Horizontal falling coordinate
  const objX = cx + r;
  const objY = cy;

  // Checkpoint analysis text
  const getCheckpointInfo = () => {
    if (r > 160) {
      return isEs
        ? "Espacio Plano: Gravedad débil. El tiempo de la nave corre casi idéntico al tuyo. El redshift es inapreciable."
        : "Flat Spacetime: Weak gravity. The ship's time runs almost identical to yours. Redshift is negligible.";
    } else if (r > Rs + 10) {
      return isEs
        ? "Pozo Gravitatorio: La nave se estira por fuerzas de marea y se enrojece. Su tiempo transcurre al 50% de tu velocidad."
        : "Gravity Well: The ship is stretched by tidal forces and turns orange. Its clock runs at 50% of your speed.";
    } else {
      return isEs
        ? "Límite del Horizonte: Para ti, el tiempo de la nave se ha congelado. Nunca la verás cruzar. Para ella, el cruce ocurrió al instante."
        : "Horizon Edge: For you, the ship's clock has frozen. You will never see it cross. For the ship, it crossed instantly.";
    }
  };

  return (
    <div className={`rounded-2xl border ${sc.cardBg} p-5 sm:p-6 shadow-xl transition-all duration-300`}>
      {/* Header Selector */}
      <div className="border-b border-white/5 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-display font-medium text-base tracking-wide flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-500 rotate-45" />
            {isEs ? "Caída al Horizonte: Detección Temporal" : "Fall to the Horizon: Time Detection"}
          </h4>
          <p className="text-xs opacity-75 mt-0.5 font-sans">
            {isEs 
              ? "Experimenta cómo cambia el tiempo y la luz cerca del horizonte."
              : "Experience how time and light warp near the horizon."}
          </p>
        </div>

        {/* Perspective toggle selector */}
        <div className="flex bg-black/30 p-1 rounded-lg border border-white/5 self-start sm:self-center">
          <button
            onClick={() => handlePerspectiveChange("observer")}
            className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              perspective === "observer" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {isEs ? "Desde Fuera" : "From Outside"}
          </button>
          <button
            onClick={() => handlePerspectiveChange("object")}
            className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              perspective === "object" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Navigation className="w-3 h-3 rotate-45" />
            {isEs ? "Desde Dentro" : "From Inside"}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left column: SVG Gravitational Well representation */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-black/35 rounded-xl min-h-[300px] border border-white/5">
          
          <svg viewBox="0 0 320 320" className="w-full max-w-[300px] aspect-square select-none z-10">
            {/* Draw concentric gravity funnel coordinates (warped space grid) */}
            <circle cx={cx} cy={cy} r={220} fill={sc.wellGlow} stroke={sc.gridLine} strokeWidth={0.8} />
            <circle cx={cx} cy={cy} r={170} fill={sc.wellGlow} stroke={sc.gridLine} strokeWidth={0.8} />
            <circle cx={cx} cy={cy} r={120} fill={sc.wellGlow} stroke={sc.gridLine} strokeWidth={1} />
            <circle cx={cx} cy={cy} r={80} fill={sc.wellGlow} stroke={sc.gridLine} strokeWidth={1.2} />

            {/* Warped gravitational funnel grid radial segments */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx * Math.PI) / 6;
              // Curved paths pulling grid into the black hole center
              const startX = cx + 220 * Math.cos(angle);
              const startY = cy + 220 * Math.sin(angle);
              const endX = cx + Rs * Math.cos(angle);
              const endY = cy + Rs * Math.sin(angle);
              
              // We draw slightly curved lines towards the center using quadratic bezier
              const midAngle = angle - 0.08;
              const midX = cx + (Rs + 60) * Math.cos(midAngle);
              const midY = cy + (Rs + 60) * Math.sin(midAngle);

              return (
                <path
                  key={idx}
                  d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                  fill="none"
                  stroke={sc.gridLine}
                  strokeWidth={0.8}
                  className="opacity-70"
                />
              );
            })}

            {/* Glowing Einstein Ring Accretion Disk (gravitational lensing light warp) */}
            <circle
              cx={cx}
              cy={cy}
              r={Rs + 10}
              fill="none"
              stroke="url(#accretionDiskGlow)"
              strokeWidth={16}
              className="opacity-60"
            />
            
            {/* Warp Accretion Disk halo outline */}
            <circle
              cx={cx}
              cy={cy}
              r={Rs + 4}
              fill="none"
              stroke="#EA580C"
              strokeWidth={1}
              className="opacity-40 animate-pulse"
            />

            {/* The Event Horizon boundary itself (absolute black hole) */}
            <circle
              cx={cx}
              cy={cy}
              r={Rs}
              fill="#000002"
              stroke={theme === "cosmic" ? "rgba(251,191,36,0.3)" : "rgba(0,0,0,0.15)"}
              strokeWidth={2}
            />

            {/* Accretion disk gradient shader */}
            <defs>
              <radialGradient id="accretionDiskGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="1" />
                <stop offset="60%" stopColor="#EA580C" stopOpacity="0.4" />
                <stop offset="90%" stopColor="#7C2D12" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* The falling ship/concept bubble */}
            {r > 0 && (
              <g 
                transform={`translate(${objX}, ${objY}) scale(${stretchX}, ${stretchY})`}
                style={{ opacity: perspective === "observer" ? opacity : 1 }}
              >
                {/* Spaghettification trail */}
                <ellipse cx={0} cy={0} rx={18} ry={5} fill={redshiftColor} className="opacity-25 blur-sm" />
                <circle cx={0} cy={0} r={4.5} fill={redshiftColor} />
                {/* Floating concept name */}
                <text
                  x={0}
                  y={-12}
                  textAnchor="middle"
                  fill={redshiftColor}
                  fontSize="11px"
                  fontWeight="bold"
                  transform="scale(0.8, 1.8)" // adjust text warp
                  className="font-sans filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                >
                  {selectedItem}
                </text>
              </g>
            )}
          </svg>

          {/* Dilation gamma factor indicator overlay */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[10px] text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
            {isEs ? "DILATACIÓN TEMPORAL" : "TIME DILATION"} (γ):{" "}
            <span className={gamma > 100 ? "text-red-500 font-bold" : "text-amber-400 font-bold"}>
              {gamma > 1000 ? "∞" : `${gamma.toFixed(2)}x`}
            </span>
          </div>
        </div>

        {/* Right column: Timers and interactive control */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            
            {/* Concept bubble selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono opacity-70 uppercase tracking-widest block">
                {isEs ? "Concepto a lanzar al pozo" : "Concept to Launch"}
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

            {/* Relativity clocks */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3.5 rounded-xl ${sc.panelBg} flex flex-col`}>
                <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider block">
                  {isEs ? "Reloj de la Tierra" : "Clock on Earth"}
                </span>
                <span className="text-2xl font-mono font-bold mt-1 text-slate-100">
                  {tObserver.toFixed(2)}s
                </span>
                <span className="text-[9px] font-mono opacity-50 block mt-0.5">
                  {isEs ? "Observador exterior (Tú)" : "External observer (You)"}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl ${sc.panelBg} flex flex-col border border-red-500/5`}>
                <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider block">
                  {isEs ? "Reloj del Viajero" : "Traveler's Clock"}
                </span>
                <span className="text-2xl font-mono font-bold mt-1 text-amber-400">
                  {tSubjective.toFixed(2)}s
                </span>
                <span className="text-[9px] font-mono opacity-50 block mt-0.5">
                  {isEs ? `Tiempo en el "${selectedItem}"` : `Time on "${selectedItem}"`}
                </span>
              </div>
            </div>

            {/* Didactic diagnostic block */}
            <div className="p-3 bg-black/10 rounded-lg text-xs leading-relaxed font-serif text-center italic">
              {getCheckpointInfo()}
            </div>

            {/* Position coordinate slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span>{isEs ? "Ajuste de Altura Gravitatoria" : "Gravity Height Adjust"}</span>
                <span className="text-amber-500">{r > 1 ? `${r.toFixed(0)} px` : (isEs ? "SINGULARIDAD" : "SINGULARITY")}</span>
              </div>
              <input
                type="range"
                min={perspective === "observer" ? Rs + 0.1 : 0.0}
                max="220"
                step="1"
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

            {/* Alert messages for extreme horizon */}
            {r < Rs + 6 && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-2 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  {perspective === "observer" ? (
                    isEs ? (
                      <>
                        <strong>Paradoja del Observador:</strong> El objeto parece detenido para siempre en el borde. Su velocidad aparente de caída es cero. El tiempo de la Tierra vuela al infinito, congelando al viajero en tu presente.
                      </>
                    ) : (
                      <>
                        <strong>Observer Paradox:</strong> The object appears frozen forever at the boundary. Its coordinate speed drops to zero. Earth time flies to infinity, locking the traveler in your present.
                      </>
                    )
                  ) : (
                    isEs ? (
                      <>
                        <strong>Cruce sin Retorno:</strong> Desde la nave, el cruce ocurre sin detenerse. El reloj corre normal. El universo entero parece acelerar su tiempo hasta el infinito a tus espaldas en el momento del cruce.
                      </>
                    ) : (
                      <>
                        <strong>Crossing No Return:</strong> From inside, the crossing occurs without stopping. The traveler's clock ticks normally. The external universe appears to accelerate to infinity behind you at the crossing moment.
                      </>
                    )
                  )}
                </div>
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
                  {isEs ? "Pausar Simulación" : "Pause Simulation"}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {isEs ? "Iniciar Simulación" : "Start Simulation"}
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
