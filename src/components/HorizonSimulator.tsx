import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, RotateCcw, AlertTriangle, Eye, Navigation } from "lucide-react";
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

  // Perspective: "observer" (Earth view) or "object" (falling inside)
  const [perspective, setPerspective] = useState<"observer" | "object">("observer");

  // Rs is event horizon radius (scaled to fit perfectly in 320x320 viewBox)
  const [Rs, setRs] = useState<number>(45);

  // Distance from center (Rs .. 140). Bounded to prevent any clipping.
  const [r, setR] = useState<number>(140);

  // Clocks
  const [tObserver, setTObserver] = useState<number>(0.0);
  const [tSubjective, setTSubjective] = useState<number>(0.0);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Physics Calculations
  const { gamma, redshiftColor, stretchX, stretchY } = useMemo(() => {
    const normalizedR = Math.max(r, Rs + 0.5);
    const ratio = Rs / normalizedR;

    // Relativistic Time dilation factor (gamma)
    const g = 1 / Math.sqrt(1 - ratio);

    // Highly visible Redshift: Bright Cyan/Blue (195) -> Intense Orange (30) -> Glowing Neon Red (0)
    const hue = Math.max(0, 195 - ratio * 205);
    const lightness = Math.max(45, 60 - ratio * 15); // Kept bright (>= 45%) for perfect visibility
    const color = `hsl(${hue}, 100%, ${lightness}%)`;

    // Dramatic Spaghettification factors (extreme radial stretch, lateral compression)
    const sX = 1 + ratio * 4.2; // Stretches up to ~5.2x
    const sY = Math.max(0.12, 1 - ratio * 0.88); // Compresses down to 0.12x (thin thread)

    return {
      gamma: g,
      redshiftColor: color,
      stretchX: sX,
      stretchY: sY,
    };
  }, [r, Rs]);

  // Reset simulation state
  const handleReset = () => {
    setIsRunning(false);
    setR(140);
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
          const baseSpeed = 45; // coordinate falling speed
          const speed = baseSpeed * (1 - Rs / prevR);
          const nextR = prevR - speed * dt;
          return Math.max(Rs + 0.05, nextR);
        });
        setTObserver((prev) => prev + dt);
        setTSubjective((prev) => prev + dt / gamma);
      } else {
        // Object's view: falls at a steady speed, crosses Rs smoothly, and hits singularity (r = 0)
        setR((prevR) => {
          const baseSpeed = 50; // constant subjective falling speed
          const nextR = prevR - baseSpeed * dt;
          if (nextR <= 3) {
            setIsRunning(false); // reached singularity
            return 0.1;
          }
          return nextR;
        });
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
        gridLine: "rgba(133, 77, 14, 0.06)",
        spaceBg: "#1F1206",
        diskColor: "#C2410C",
        diskGlow: "#9A3412",
        starColor: "rgba(251, 191, 36, 0.4)",
      };
    } else if (theme === "paper") {
      return {
        cardBg: "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]",
        textMuted: "text-[#1A1A1A]/70",
        btnActive: "bg-[#1A1A1A] text-white hover:bg-black",
        btnInactive: "bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]",
        panelBg: "bg-[#F3F4F6] border border-slate-200",
        gridLine: "rgba(0, 0, 0, 0.04)",
        spaceBg: "#F3F4F6",
        diskColor: "#059669",
        diskGlow: "#10B981",
        starColor: "rgba(55, 65, 81, 0.2)",
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
        spaceBg: "#020205",
        diskColor: "#EA580C",
        diskGlow: "#F97316",
        starColor: "rgba(255, 255, 255, 0.65)",
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
    if (r > 115) {
      return isEs
        ? "Espacio Seguro: La gravedad es débil. Tu reloj y el del viajero marchan casi al unísono."
        : "Safe Space: Weak gravity. Your clock and the traveler's tick almost in unison.";
    } else if (r > Rs + 5) {
      return isEs
        ? "Frontera de Marea: La luz de la nave se desplaza al naranja por corrimiento al rojo gravitatorio. El tiempo corre al 50%."
        : "Tidal Boundary: The ship's light shifts to orange via gravitational redshift. Time runs at 50% speed.";
    } else {
      return isEs
        ? "Horizonte de Sucesos: Tiempo exterior congelado para ti. Para el viajero, el cruce ya ocurrió de forma inmediata."
        : "Event Horizon: External time frozen for you. For the traveler, the crossing occurred instantly.";
    }
  };

  return (
    <div className={`rounded-2xl border ${sc.cardBg} p-5 sm:p-6 shadow-xl transition-all duration-300`}>
      {/* CSS custom keyframe animations for accretion disk rotation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spinAccretion {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-disk {
          transform-origin: 160px 160px;
          animation: spinAccretion 8s linear infinite;
        }
      `}} />

      {/* Header Selector */}
      <div className="border-b border-white/5 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-display font-medium text-base tracking-wide flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-500 rotate-45" />
            {isEs ? "Caída al Horizonte: Detección Temporal" : "Fall to the Horizon: Time Detection"}
          </h4>
          <p className="text-xs opacity-75 mt-0.5 font-sans">
            {isEs 
              ? "Observa la deformación física y el desplazamiento al rojo (redshift) de la nave."
              : "Observe the physical deformation and redshift of the falling ship."}
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
        
        {/* Left column: SVG Photorealistic Gravitational representation */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#020205] rounded-xl min-h-[300px] border border-white/5 shadow-2xl">
          
          <svg viewBox="0 0 320 320" className="w-full max-w-[300px] aspect-square select-none z-10">
            <defs>
              {/* Soft stars glow filter */}
              <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Glowing neon filter for ship to keep it perfectly visible */}
              <filter id="shipGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComponentTransfer in="blur" result="glow">
                  <feFuncA type="linear" slope="0.85" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Accretion disk lensed background halo (Einstein Ring shader) */}
              <radialGradient id="einsteinRing" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="1" />
                <stop offset="42%" stopColor="#000000" stopOpacity="1" />
                <stop offset="45%" stopColor={sc.diskColor} stopOpacity="0.9" />
                <stop offset="55%" stopColor={sc.diskGlow} stopOpacity="0.75" />
                <stop offset="70%" stopColor="#EA580C" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* Front horizontal accretion disk gradient */}
              <linearGradient id="frontDisk" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.0" />
                <stop offset="35%" stopColor={sc.diskGlow} stopOpacity="0.85" />
                <stop offset="50%" stopColor="#FFFBEB" stopOpacity="1" />
                <stop offset="65%" stopColor={sc.diskGlow} stopOpacity="0.85" />
                <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
              </linearGradient>

              {/* Gravitational redshift transition gradient for the ship plume */}
              <linearGradient id="ionPlume" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Deep Space Background */}
            <rect width="320" height="320" fill={sc.spaceBg} />

            {/* Twinkling star field */}
            <g opacity="0.85">
              <circle cx="40" cy="50" r="0.8" fill={sc.starColor} />
              <circle cx="280" cy="70" r="1.2" fill={sc.starColor} filter="url(#starGlow)" />
              <circle cx="50" cy="250" r="1" fill={sc.starColor} />
              <circle cx="290" cy="240" r="0.6" fill={sc.starColor} />
              <circle cx="100" cy="30" r="1.5" fill={sc.starColor} filter="url(#starGlow)" />
              <circle cx="220" cy="20" r="0.8" fill={sc.starColor} />
              <circle cx="220" cy="300" r="1.3" fill={sc.starColor} />
              <circle cx="90" cy="290" r="0.8" fill={sc.starColor} />
            </g>

            {/* Gravitational lensing distorted background stars (stretched into concentric arcs) */}
            <g opacity="0.65">
              <path d={`M ${cx - 70} ${cy - 12} A 71 71 0 0 1 ${cx - 12} ${cy - 70}`} fill="none" stroke={sc.starColor} strokeWidth="0.8" strokeDasharray="1 18" />
              <path d={`M ${cx + 70} ${cy + 12} A 71 71 0 0 1 ${cx + 12} ${cy + 70}`} fill="none" stroke={sc.starColor} strokeWidth="0.8" strokeDasharray="1 15" />
              <path d={`M ${cx - 95} ${cy + 15} A 96 96 0 0 0 ${cx - 15} ${cy + 95}`} fill="none" stroke={sc.starColor} strokeWidth="0.6" strokeDasharray="1 22" />
            </g>

            {/* 1. Lensed Accretion Halo (Light from behind the black hole warped by gravity into a circle) */}
            <circle
              cx={cx}
              cy={cy}
              r={Rs + 38}
              fill="url(#einsteinRing)"
              className="opacity-95"
            />

            {/* Swirling Relativistic Accretion Disk (Spins along the orbital plane) */}
            <g transform="rotate(-14, 160, 160)">
              <g className="animate-spin-disk">
                {/* Plasma gas wisps and hot spots swirling in orbit */}
                <path d={`M ${cx - 110} ${cy} A 110 110 0 0 1 ${cx} ${cy - 110}`} fill="none" stroke={sc.diskGlow} strokeWidth="6" strokeLinecap="round" className="opacity-30" />
                <path d={`M ${cx + 120} ${cy} A 120 120 0 0 1 ${cx} ${cy + 120}`} fill="none" stroke={sc.diskColor} strokeWidth="8" strokeLinecap="round" className="opacity-25" />
                <path d={`M ${cx} ${cy - 90} A 90 90 0 0 1 ${cx + 90} ${cy}`} fill="none" stroke="#FFF" strokeWidth="4" strokeLinecap="round" className="opacity-40 filter blur-[1px]" />
                
                {/* Dark Dust Lane gaps inside the rotating disk */}
                <circle cx={cx - 85} cy={cy - 40} r="7" fill="#020205" className="opacity-80 filter blur-[2px]" />
                <circle cx={cx + 95} cy={cy + 30} r="9" fill="#020205" className="opacity-85 filter blur-[3px]" />
              </g>
            </g>

            {/* Front horizontal accretion disk (crosses in front of the event horizon) */}
            <path
              d={`M ${cx - 130} ${cy} C ${cx - 65} ${cy + 32}, ${cx + 65} ${cy + 32}, ${cx + 130} ${cy} C ${cx + 50} ${cy - 12}, ${cx - 50} ${cy - 12}, ${cx - 130} ${cy}`}
              fill="url(#frontDisk)"
              className="opacity-85"
            />

            {/* Event Horizon Sphere (Pure Black hole singularity boundary) */}
            <circle
              cx={cx}
              cy={cy}
              r={Rs}
              fill="#000000"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.8"
            />

            {/* Foreground Accretion Disk Silhouette (Dust lane blocking some back-warped light) */}
            <path
              d={`M ${cx - 110} ${cy + 4} C ${cx - 50} ${cy + 22}, ${cx + 50} ${cy + 22}, ${cx + 110} ${cy + 4}`}
              fill="none"
              stroke="#0b0704"
              strokeWidth="2.5"
              className="opacity-60"
            />

            {/* Falling Spaceship / Concept Bubble (Perfect visibility, no opacity fade) */}
            {r > 1 && (
              <g 
                transform={`translate(${objX}, ${objY}) scale(${stretchX}, ${stretchY})`}
                filter="url(#shipGlow)"
              >
                {/* Spaghettification plasma glow trail */}
                <ellipse cx={0} cy={0} rx={22} ry={4} fill={redshiftColor} className="opacity-40 filter blur-[1px]" />
                
                {/* Ion Thruster engine glow (active when falling) */}
                {isRunning && r > Rs && (
                  <path
                    d="M 6 -2.5 L 20 -5 L 20 5 L 6 2.5 Z"
                    fill="url(#ionPlume)"
                    transform="scale(0.8, 1)"
                    className="opacity-95"
                  />
                )}

                {/* Sleek metallic triangular spaceship probe hull (highlighted edge for visibility) */}
                <path
                  d="M -8 -4.5 L 8 0 L -8 4.5 L -5 0 Z"
                  fill={theme === "paper" ? "#1E293B" : "#F8FAFC"}
                  stroke={redshiftColor}
                  strokeWidth="1.2"
                />

                {/* Concept label overlay text (perfectly readable at all times) */}
                <text
                  x={-2}
                  y={-14}
                  textAnchor="middle"
                  fill={redshiftColor}
                  fontSize="12px"
                  fontWeight="bold"
                  transform="scale(0.68, 1.8)" // counter-act spaghettification scale so text stays readable
                  className="font-sans filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)]"
                >
                  {selectedItem}
                </text>
              </g>
            )}
          </svg>

          {/* Time dilation indicator */}
          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[10px] text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
            {isEs ? "DILATACIÓN (γ):" : "DILATION (γ):"}{" "}
            <span className={gamma > 100 ? "text-red-500 font-bold" : "text-amber-400 font-bold"}>
              {gamma > 1000 ? "∞" : `${gamma.toFixed(2)}x`}
            </span>
          </div>
        </div>

        {/* Right column: Clocks & control panel */}
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

            {/* Clocks comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3.5 rounded-xl ${sc.panelBg} flex flex-col`}>
                <span className="text-[10px] font-mono opacity-70 uppercase tracking-wider block">
                  {isEs ? "Tiempo de la Tierra" : "Earth Clock"}
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
                  {isEs ? "Tiempo en la Nave" : "Spaceship Clock"}
                </span>
                <span className="text-2xl font-mono font-bold mt-1 text-amber-400">
                  {tSubjective.toFixed(2)}s
                </span>
                <span className="text-[9px] font-mono opacity-50 block mt-0.5">
                  {isEs ? `Tiempo en el "${selectedItem}"` : `Time on "${selectedItem}"`}
                </span>
              </div>
            </div>

            {/* Diagnostic helper block */}
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
                max="140"
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

            {/* Informational warning blocks */}
            {r < Rs + 5 && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-2 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  {perspective === "observer" ? (
                    isEs ? (
                      <>
                        <strong>Congelación Temporal:</strong> Para ti, la nave se enrojece hasta apagarse y se queda flotando en el borde indefinidamente. Su tiempo se detiene en tu presente.
                      </>
                    ) : (
                      <>
                        <strong>Time Freezing:</strong> For you, the ship turns red and fades away, freezing at the event horizon indefinitely. Its time stops in your present.
                      </>
                    )
                  ) : (
                    isEs ? (
                      <>
                        <strong>Singularidad Inevitable:</strong> La nave cruza el horizonte sin frenar. A tus espaldas, el tiempo exterior avanza hacia el infinito. Estás cruzando la frontera de no retorno.
                      </>
                    ) : (
                      <>
                        <strong>Inevitable Singularity:</strong> The ship crosses the horizon without slowing down. Behind you, external time accelerates to infinity. You are crossing the point of no return.
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
                  {isEs ? "Pausar" : "Pause"}
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
