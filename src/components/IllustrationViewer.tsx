import React from "react";
import { motion } from "motion/react";
import { Illustration } from "../chapters";
// @ts-ignore
import prologueConceptImg from "../assets/images/prologue_concept_1783641146967.jpg";
// @ts-ignore
import tarelStiltTownImg from "../assets/images/tarel_stilt_town_1783642944532.jpg";
import {
  IlTarel,
  Il04,
  Il05,
  Il06,
  Il07,
  Il08,
  IlPrologo,
  Il15,
  IlAlzheimer,
  IlParkinson,
  IlHerido,
  IlMascotas,
  IlInanimado,
  IlClon,
  IlIa,
  IlElQueQueda,
  IlMapaYTerritorio,
  IlPractica,
  IlOrilla,
  IlNotas
} from "./AdditionalIllustrations";

interface IllustrationViewerProps {
  illustration?: Illustration;
}

export const IllustrationViewer: React.FC<IllustrationViewerProps> = ({ illustration }) => {
  if (!illustration) return null;

  const [imageError, setImageError] = React.useState<boolean>(false);

  React.useEffect(() => {
    setImageError(false);
  }, [illustration?.id]);

  const renderSVG = () => {
    switch (illustration.id) {
      case "il01": // Las tres ideas (Burbuja, Océano, Red)
        if (imageError) {
          return (
            <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
              <rect x="40" y="40" width="320" height="320" rx="16" fill="#0f172a" opacity="0.3" />
              {/* Ocean / Océano (waves at the bottom) */}
              <motion.path 
                d="M 50,280 C 100,265 150,295 200,280 C 250,265 300,295 350,280 L 350,350 L 50,350 Z" 
                fill="url(#ocean-grad-fb)" 
                opacity="0.6"
                animate={{ d: [
                  "M 50,280 C 100,265 150,295 200,280 C 250,265 300,295 350,280 L 350,350 L 50,350 Z",
                  "M 50,285 C 100,270 150,290 200,285 C 250,270 300,290 350,285 L 350,350 L 50,350 Z",
                  "M 50,280 C 100,265 150,295 200,280 C 250,265 300,295 350,280 L 350,350 L 50,350 Z"
                ] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              />
              
              {/* Bubble / Burbuja (glowing sphere in the center) */}
              <motion.circle 
                cx="200" 
                cy="180" 
                r="60" 
                fill="url(#bubble-grad-fb)" 
                stroke="#fbbf24" 
                strokeWidth="2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
              <circle cx="180" cy="160" r="15" fill="#ffffff" opacity="0.1" />

              {/* Network / Red (connected points) */}
              <g opacity="0.8">
                <line x1="140" y1="120" x2="200" y2="120" stroke="#60a5fa" strokeWidth="1.5" />
                <line x1="200" y1="120" x2="260" y2="120" stroke="#60a5fa" strokeWidth="1.5" />
                <line x1="140" y1="120" x2="170" y2="180" stroke="#60a5fa" strokeWidth="1.5" />
                <line x1="260" y1="120" x2="230" y2="180" stroke="#60a5fa" strokeWidth="1.5" />
                <line x1="170" y1="180" x2="230" y2="180" stroke="#60a5fa" strokeWidth="1.5" />
                
                <circle cx="140" cy="120" r="6" fill="#60a5fa" />
                <circle cx="200" cy="120" r="6" fill="#60a5fa" />
                <circle cx="260" cy="120" r="6" fill="#60a5fa" />
                <circle cx="170" cy="180" r="6" fill="#3b82f6" />
                <circle cx="230" cy="180" r="6" fill="#3b82f6" />
              </g>
              
              <defs>
                <radialGradient id="bubble-grad-fb" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#eab308" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.3" />
                </radialGradient>
                <linearGradient id="ocean-grad-fb" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e40af" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
              </defs>
            </svg>
          );
        }
        return (
          <motion.img
            src={prologueConceptImg}
            alt="Las tres ideas: Burbuja, Océano, Red"
            className="w-full h-full object-cover rounded-xl select-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        );

      case "il02": // La costumbre del agua / Waves
      case "il09": // La evaporación (Lake evaporating into faces/clouds)
      case "il19": // La orilla donde el agua regresa
        const isEvaporating = illustration.id === "il09";
        const isReturning = illustration.id === "il19";
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Ocean bed / Lake circle outline */}
            <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1" className="text-blue-500/20" />
            
            {/* Water Wave Animations */}
            <motion.path
              d="M 50,220 C 100,200 150,240 200,220 C 250,200 300,240 350,220 L 350,350 L 50,350 Z"
              fill="url(#water-grad-deep)"
              opacity="0.8"
              animate={{ d: [
                "M 50,220 C 100,200 150,240 200,220 C 250,200 300,240 350,220 L 350,350 L 50,350 Z",
                "M 50,225 C 100,215 150,230 200,225 C 250,220 300,235 350,225 L 350,350 L 50,350 Z",
                "M 50,220 C 100,200 150,240 200,220 C 250,200 300,240 350,220 L 350,350 L 50,350 Z"
              ]}}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            />
            
            <motion.path
              d="M 50,240 C 110,220 140,250 200,235 C 260,220 290,250 350,240 L 350,350 L 50,350 Z"
              fill="url(#water-grad-light)"
              opacity="0.5"
              animate={{ d: [
                "M 50,240 C 110,220 140,250 200,235 C 260,220 290,250 350,240 L 350,350 L 50,350 Z",
                "M 50,230 C 100,240 160,230 200,240 C 240,250 300,230 350,230 L 350,350 L 50,350 Z",
                "M 50,240 C 110,220 140,250 200,235 C 260,220 290,250 350,240 L 350,350 L 50,350 Z"
              ]}}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />

            {isEvaporating && (
              /* Animated evaporating particles rising up */
              <g>
                {[...Array(6)].map((_, i) => (
                  <motion.path
                    key={i}
                    d={`M ${100 + i * 40},200 Q ${110 + i * 40},150 ${100 + i * 40},100`}
                    stroke="url(#evap-grad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="5,15"
                    animate={{ strokeDashoffset: [0, -40], opacity: [0.1, 0.8, 0.1], y: [10, -50] }}
                    transition={{ repeat: Infinity, duration: 3 + i, ease: "linear" }}
                  />
                ))}
              </g>
            )}

            {isReturning && (
              /* Soft drops falling from the sky */
              <g>
                {[...Array(8)].map((_, i) => (
                  <motion.circle
                    key={i}
                    cx={120 + i * 30}
                    cy="80"
                    r="2.5"
                    fill="#60a5fa"
                    animate={{ y: [0, 140], opacity: [0, 0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 + (i % 3) * 0.4, delay: i * 0.2 }}
                  />
                ))}
              </g>
            )}

            <defs>
              <linearGradient id="water-grad-deep" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="water-grad-light" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="evap-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        );

      case "il08": // El río que se convierte en lago (Nacimiento, Vida, Muerte)
        return <Il08 />;

      case "il_prologo": // El experimento (Prólogo)
        return <IlPrologo />;

      case "il_int": // El borde que cruzamos cada noche
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Giant sphere representing consciousness */}
            <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" className="text-amber-500/20" />
            
            {/* Upper half - high frequency gamma */}
            <motion.path
              d="M 90,160 Q 110,130 130,160 T 170,160 T 210,160 T 250,160 T 290,160 T 310,160"
              stroke="#f59e0b"
              strokeWidth="3"
              fill="none"
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
            <text x="200" y="110" textAnchor="middle" className="fill-amber-400 font-mono text-[10px] tracking-widest">GAMMA (VIGILIA / REM)</text>

            {/* Lower half - slow wave delta */}
            <motion.path
              d="M 80,240 C 140,280 180,200 240,270 C 280,310 300,240 320,240"
              stroke="#3b82f6"
              strokeWidth="4"
              fill="none"
              animate={{ d: [
                "M 80,240 C 140,280 180,200 240,270 C 280,310 300,240 320,240",
                "M 80,240 C 120,200 170,300 220,220 C 270,300 300,250 320,240",
                "M 80,240 C 140,280 180,200 240,270 C 280,310 300,240 320,240"
              ]}}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />
            <text x="200" y="300" textAnchor="middle" className="fill-blue-400 font-mono text-[10px] tracking-widest">DELTA (SUEÑO PROFUNDO)</text>

            {/* Center border exact line */}
            <line x1="80" y1="200" x2="320" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
            <motion.circle cx="200" cy="200" r="6" fill="#ef4444" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
            <text x="200" y="190" textAnchor="middle" className="fill-red-400 font-display text-[11px] font-semibold tracking-wider">EL BORDE</text>
          </svg>
        );

      case "il11": // El tiempo del vínculo (Hourglass)
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Glass body */}
            <path d="M 120,100 L 280,100 L 210,200 L 280,300 L 120,300 L 190,200 Z" stroke="currentColor" strokeWidth="3" className="text-amber-500/40" />
            
            {/* Falling sand simulation */}
            <motion.path
              d="M 200,195 L 200,300"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4,4"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />

            {/* Upper Sand level decreasing */}
            <motion.path
              d="M 140,130 C 180,140 220,140 260,130 L 200,200 Z"
              fill="url(#sand-grad)"
              animate={{ scaleY: [1, 0.4, 1], y: [0, 40, 0] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />

            {/* Lower Sand level increasing */}
            <motion.path
              d="M 130,290 C 170,270 230,270 270,290 L 270,300 L 130,300 Z"
              fill="url(#sand-grad)"
              animate={{ scaleY: [0.3, 1, 0.3], y: [20, 0, 20] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />

            <defs>
              <linearGradient id="sand-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        );

      case "il12": // Cuerdas entrelazadas / Wormhole
      case "il13": // El puente del reconocimiento
      case "il12_5": // El puente entre dos horizontes
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Left Entity */}
            <g transform="translate(100, 200)">
              <circle r="40" fill="url(#ent-left)" opacity="0.3" />
              <motion.circle
                r="30"
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
              <circle cx="0" cy="0" r="5" fill="#6366f1" />
            </g>

            {/* Right Entity */}
            <g transform="translate(300, 200)">
              <circle r="40" fill="url(#ent-right)" opacity="0.3" />
              <motion.circle
                r="30"
                stroke="#f59e0b"
                strokeWidth="2"
                fill="none"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1.5, ease: "easeInOut" }}
              />
              <circle cx="0" cy="0" r="5" fill="#f59e0b" />
            </g>

            {/* Connected Einstein-Rosen bridge (wormhole) */}
            <motion.path
              d="M 100,200 C 170,140 230,140 300,200 C 230,260 170,260 100,200"
              stroke="url(#bridge-grad)"
              strokeWidth="3"
              fill="none"
              animate={{ strokeWidth: [2, 4, 2] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            
            {/* Flowing particles across the bridge */}
            {[...Array(4)].map((_, i) => (
              <motion.circle
                key={i}
                r="3"
                fill="#ffffff"
                animate={{
                  cx: [100, 200, 300],
                  cy: [200, 160 + i * 15, 200],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  delay: i * 1.0,
                  ease: "easeInOut"
                }}
              />
            ))}

            <defs>
              <radialGradient id="ent-left" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ent-right" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="bridge-grad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        );

      case "il14": // El puente roto del deseo (Neon rift)
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Two cliffs */}
            <path d="M 50,260 L 140,260 L 110,350 L 50,350 Z" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
            <path d="M 260,260 L 350,260 L 350,350 L 290,350 Z" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
            
            {/* Broken hanging bridge ropes */}
            <path d="M 140,260 Q 155,290 160,310" stroke="#f59e0b" strokeWidth="3" fill="none" />
            <path d="M 260,260 Q 245,290 240,310" stroke="#f59e0b" strokeWidth="3" fill="none" />

            {/* Glowing neon lava river below */}
            <motion.path
              d="M 50,320 L 350,320 L 350,350 L 50,350 Z"
              fill="url(#lava-grad)"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />

            <defs>
              <linearGradient id="lava-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        );

      case "il16": // La piel emocional (Paper, Leather, Anchor)
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Paper skin figure (permeable) */}
            <g transform="translate(90, 200)">
              <circle r="35" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,3" />
              <text y="5" textAnchor="middle" className="fill-blue-400 font-display text-[10px] tracking-wider">PAPEL</text>
              {/* Incident wave passing right through */}
              <path d="M -60,0 Q -45,-15 -30,0 T 0,0 T 30,0" stroke="#f472b6" strokeWidth="2" fill="none" />
            </g>

            {/* Leather skin figure (impermeable) */}
            <g transform="translate(200, 200)">
              <circle r="35" fill="none" stroke="#9ca3af" strokeWidth="4" />
              <text y="5" textAnchor="middle" className="fill-gray-400 font-display text-[10px] tracking-wider">CUERO</text>
              {/* Incident wave bouncing off */}
              <path d="M 140,200 Q 155,185 165,200" stroke="#f472b6" strokeWidth="2" fill="none" />
              <path d="M 165,200 Q 155,215 140,230" stroke="#f472b6" strokeWidth="2" opacity="0.6" fill="none" />
            </g>

            {/* Anchor skin figure (strong core) */}
            <g transform="translate(310, 200)">
              <circle r="35" fill="none" stroke="#10b981" strokeWidth="2" />
              {/* Glowing anchor core */}
              <motion.circle r="12" fill="url(#core-glow)" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} />
              <text y="5" textAnchor="middle" className="fill-emerald-400 font-display text-[10px] tracking-wider">ANCLA</text>
            </g>

            <defs>
              <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        );

      case "il17": // La arquitectura con un hueco
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Outline of the house */}
            <path d="M 100,280 L 100,180 L 200,100 L 300,180 L 300,280 Z" stroke="currentColor" strokeWidth="2" className="text-gray-500/40" />
            
            {/* Empty glowing central court */}
            <motion.circle
              cx="200"
              cy="210"
              r="45"
              fill="url(#void-glow)"
              animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            <circle cx="200" cy="210" r="45" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,4" />
            
            <text x="200" y="215" textAnchor="middle" className="fill-amber-400 font-display text-xs font-medium tracking-widest">VACÍO</text>
            
            <defs>
              <radialGradient id="void-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        );

      case "il22": // El círculo sin borde (Ensō Zen)
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Ensō circle */}
            <motion.path
              d="M 200,100 A 100,100 0 1,1 190,100"
              stroke="url(#enso-grad)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="600"
              strokeDashoffset="600"
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="enso-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="70%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        );

      case "il23": // La rueda del Tao
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Wheel outer rim */}
            <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="8" className="text-amber-800" />
            <circle cx="200" cy="200" r="126" stroke="#fbbf24" strokeWidth="2" />
            
            {/* Spokes of the wheel */}
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1="200"
                y1="200"
                x2={200 + 126 * Math.cos((i * Math.PI) / 4)}
                y2={200 + 126 * Math.sin((i * Math.PI) / 4)}
                stroke="currentColor"
                strokeWidth="4"
                className="text-amber-700/60"
              />
            ))}

            {/* Central hub (empty but glowing) */}
            <circle cx="200" cy="200" r="30" fill="url(#hub-glow)" />
            <circle cx="200" cy="200" r="30" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="200" cy="200" r="8" fill="#1e1b4b" stroke="#fbbf24" strokeWidth="1" />

            <defs>
              <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
              </radialGradient>
            </defs>
          </svg>
        );

      case "il24": // La presencia geométrica (Gravity grid warping)
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Curved warp lines horizontally */}
            {[...Array(11)].map((_, i) => {
              const y = 80 + i * 24;
              return (
                <path
                  key={`h-${i}`}
                  d={`M 60,${y} Q 200,${y + (200 - y) * 0.4} 340,${y}`}
                  stroke="#4b5563"
                  strokeWidth="1"
                  opacity={0.4}
                />
              );
            })}
            
            {/* Curved warp lines vertically */}
            {[...Array(11)].map((_, i) => {
              const x = 80 + i * 24;
              return (
                <path
                  key={`v-${i}`}
                  d={`M ${x},60 Q ${x + (200 - x) * 0.4},200 ${x},340`}
                  stroke="#4b5563"
                  strokeWidth="1"
                  opacity={0.4}
                />
              );
            })}

            {/* Sinking heavy core sphere */}
            <circle cx="200" cy="200" r="40" fill="url(#gravity-core)" opacity="0.4" />
            <motion.circle
              cx="200"
              cy="200"
              r="20"
              fill="#fbbf24"
              animate={{ scale: [1, 1.1, 1], boxShadow: "0 0 20px #fbbf24" }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            <defs>
              <radialGradient id="gravity-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        );

      case "il25": // El lugar donde la luz no se pierde (Infinity network)
        return (
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Star background stars */}
            {[...Array(15)].map((_, i) => (
              <motion.circle
                key={`star-${i}`}
                cx={50 + (i * 73) % 300}
                cy={50 + (i * 97) % 300}
                r="1.5"
                fill="#ffffff"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 2 + (i % 3), delay: i * 0.1 }}
              />
            ))}

            {/* Glowing web lines */}
            <path d="M 80,120 L 200,80 L 320,120 L 280,240 L 120,240 Z" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
            <path d="M 200,80 L 200,180 L 280,240" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5" />
            <path d="M 80,120 L 200,180 L 120,240" stroke="#f472b6" strokeWidth="1.5" opacity="0.5" />

            {/* Main hubs */}
            <motion.circle cx="200" cy="80" r="6" fill="#fbbf24" animate={{ r: [6, 8, 6] }} transition={{ repeat: Infinity, duration: 3 }} />
            <motion.circle cx="80" cy="120" r="5" fill="#f59e0b" />
            <motion.circle cx="320" cy="120" r="5" fill="#3b82f6" />
            <motion.circle cx="200" cy="180" r="8" fill="#ffffff" animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 4 }} />
            <circle cx="200" cy="180" r="14" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

            <text x="200" y="320" textAnchor="middle" className="fill-amber-200 font-display text-xs tracking-widest font-semibold">EL INFINITO</text>
          </svg>
        );

      case "il_tarel":
        if (imageError) {
          return <IlTarel />;
        }
        return (
          <motion.img
            src={tarelStiltTownImg}
            alt="Tarel: El agua se retira"
            className="w-full h-full object-cover rounded-xl select-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        );
      case "il04":
        return <Il04 />;
      case "il05":
        return <Il05 />;
      case "il06":
        return <Il06 />;
      case "il07":
        return <Il07 />;
      case "il15":
        return <Il15 />;
      case "il_alzheimer":
        return <IlAlzheimer />;
      case "il_parkinson":
        return <IlParkinson />;
      case "il_herido":
        return <IlHerido />;
      case "il_mascotas":
        return <IlMascotas />;
      case "il_inanimado":
        return <IlInanimado />;
      case "il_clon":
        return <IlClon />;
      case "il_ia":
        return <IlIa />;
      case "il_el_que_queda":
        return <IlElQueQueda />;
      case "il_mapayterritorio":
        return <IlMapaYTerritorio />;
      case "il_practica":
        return <IlPractica />;
      case "il_orilla":
        return <IlOrilla />;
      case "il_notas":
        return <IlNotas />;

      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center border border-amber-500/10 rounded-xl bg-amber-500/5 p-6 text-center">
            <span className="text-amber-500 font-display text-sm font-semibold mb-2">{illustration.title}</span>
            <span className="text-gray-400 font-sans text-xs max-w-xs">{illustration.description}</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full aspect-square max-w-[280px] sm:max-w-[340px] mx-auto bg-slate-950/40 border border-amber-500/10 rounded-2xl p-4 flex items-center justify-center relative shadow-lg shadow-amber-500/2 overflow-hidden group">
      {/* Absolute corner designs */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500/30" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500/30" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500/30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500/30" />
      
      {renderSVG()}
    </div>
  );
};
