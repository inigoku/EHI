import React from "react";
import { motion } from "motion/react";

// Shared component for artistic, painterly watercolor and paper texture SVG filters
const ArtFilters: React.FC<{ idPrefix: string }> = ({ idPrefix }) => (
  <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      {/* Hand-drawn / sketchy / watercolor line displacement filter */}
      <filter id={`${idPrefix}-watercolor`} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        <feGaussianBlur in="displaced" stdDeviation="0.8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="displaced" />
        </feMerge>
      </filter>
      {/* High-quality cold-press paper / canvas fiber texture filter */}
      <filter id={`${idPrefix}-paper`} x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="paper-noise" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0.15 0" />
        <feBlend mode="multiply" in="SourceGraphic" in2="paper-noise" />
      </filter>
    </defs>
  </svg>
);

// 1. il_tarel: El agua se retira
export const IlTarel: React.FC = () => (
  <div className="w-full h-full relative overflow-hidden bg-slate-950 rounded-2xl border border-amber-500/10 shadow-lg" style={{ minHeight: "300px" }}>
    <ArtFilters idPrefix="iltarel" />
    <svg className="w-full h-full relative z-10" viewBox="0 0 400 400" fill="none">
      <g filter="url(#iltarel-watercolor)">
        <rect x="40" y="40" width="320" height="320" rx="16" fill="#0f172a" opacity="0.3" />
        {[100, 200, 300].map((x, idx) => (
          <g key={idx}>
            <rect x={x - 12} y="100" width="24" height="240" fill="#1e293b" rx="4" />
            <line x1={x - 12} y1="180" x2={x + 12} y2="180" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
            <line x1={x - 12} y1="220" x2={x + 12} y2="220" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />
            <line x1={x - 12} y1="260" x2={x + 12} y2="260" stroke="#d97706" strokeWidth="2" opacity="0.8" />
            <motion.circle
              cx={x}
              cy="210"
              r="12"
              stroke="#fbbf24"
              strokeWidth="2.5"
              fill="none"
              animate={{ y: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 3, delay: idx * 0.5 }}
            />
          </g>
        ))}
        <motion.path
          d="M 40,290 C 100,275 150,305 200,290 C 250,275 300,305 360,290 L 360,360 L 40,360 Z"
          fill="url(#receding-water)"
          opacity="0.8"
          animate={{ d: [
            "M 40,290 C 100,275 150,305 200,290 C 250,275 300,305 360,290 L 360,360 L 40,360 Z",
            "M 40,305 C 100,290 150,320 200,305 C 250,290 300,320 360,305 L 360,360 L 40,360 Z",
            "M 40,290 C 100,275 150,305 200,290 C 250,275 300,305 360,290 L 360,360 L 40,360 Z"
          ]}}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
      </g>
      <rect width="100%" height="100%" filter="url(#iltarel-paper)" className="pointer-events-none mix-blend-overlay opacity-85" />
      <defs>
        <linearGradient id="receding-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// 2. il04: La trampa del interruptor (El espectro gradual de la conciencia)
export const Il04: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-2 text-white font-sans bg-slate-950 rounded-2xl overflow-y-auto border border-amber-500/10 relative" style={{ maxHeight: "400px" }}>
      <ArtFilters idPrefix="il04" />
      
      {/* Title */}
      <div className="text-center mb-2 relative z-10">
        <h3 className="text-[10px] sm:text-xs font-bold tracking-wider text-amber-400 font-display uppercase">
          El Espectro Gradual de la Conciencia
        </h3>
        <p className="text-[7.5px] sm:text-[9px] text-gray-400 font-mono tracking-tight uppercase leading-tight">
          De la función mecánica a la experiencia subjetiva
        </p>
      </div>

      {/* Panels row */}
      <div className="w-full grid grid-cols-2 gap-3 mb-2 flex-1 relative z-10">
        {/* Thermostat Box */}
        <div className="flex flex-col items-center justify-center border border-slate-800 bg-slate-900/50 rounded-xl p-2 relative group overflow-hidden">
          {/* Cracked texture lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
            <g filter="url(#il04-watercolor)">
              <path d="M 0,20 L 30,35 L 40,30 L 50,55 L 70,50 L 100,65" stroke="#ffffff" strokeWidth="0.75" fill="none" />
              <path d="M 30,35 L 20,60 L 45,75" stroke="#ffffff" strokeWidth="0.75" fill="none" />
              <path d="M 70,50 L 80,25" stroke="#ffffff" strokeWidth="0.75" fill="none" />
            </g>
            <rect width="100%" height="100%" filter="url(#il04-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
          </svg>
          <div className="w-full aspect-[1.5/1] bg-slate-800 rounded-lg border-2 border-slate-700 p-1 flex flex-col justify-between shadow-inner">
            <div className="w-full h-5 bg-emerald-950/40 border border-emerald-900 rounded flex items-center justify-center p-1 font-mono text-[9px] text-emerald-400 shadow-inner">
              <span className="opacity-40 animate-pulse font-bold">24°C</span>
            </div>
            <div className="flex gap-1 justify-center mt-1">
              <div className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-600 text-[6.5px] text-gray-400 font-bold tracking-widest font-mono">ON</div>
              <div className="px-1.5 py-0.5 rounded bg-slate-950 border border-red-950 text-[6.5px] text-rose-500 font-bold tracking-widest font-mono">OFF</div>
            </div>
          </div>
          <span className="text-[7.5px] sm:text-[9px] text-gray-400 font-mono font-semibold tracking-wider text-center uppercase mt-1.5">
            Termostato Roto
          </span>
        </div>

        {/* Dial Box */}
        <div className="flex flex-col items-center justify-center border border-amber-500/10 bg-amber-500/5 rounded-xl p-2 relative overflow-hidden">
          {/* Glowing backlighting */}
          <div className="absolute inset-0 bg-amber-500/5 rounded-full filter blur-xl scale-75 animate-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            {/* Glowing ring */}
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <g filter="url(#il04-watercolor)">
                <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="6" fill="none" />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="url(#dial-glow-grad)" 
                  strokeWidth="6" 
                  fill="none"
                  strokeDasharray="251"
                  strokeDashoffset="60"
                  animate={{ strokeDashoffset: [90, 40, 90] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
              </g>
              <rect width="100%" height="100%" filter="url(#il04-paper)" className="pointer-events-none mix-blend-overlay opacity-50" />
              <defs>
                <linearGradient id="dial-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            {/* Inner knob */}
            <motion.div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border-2 border-slate-600 shadow-lg flex items-center justify-center relative cursor-pointer"
              animate={{ rotate: [20, 160, 20] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              {/* Pointer line */}
              <div className="absolute top-1 w-0.5 h-3 sm:h-4 bg-amber-400 rounded-full" style={{ left: "calc(50% - 0.25px)" }} />
              {/* Center cap */}
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-900 border border-slate-700 shadow-inner" />
            </motion.div>
          </div>
          <span className="text-[7.5px] sm:text-[9px] text-amber-400 font-mono font-semibold tracking-wider text-center uppercase mt-1.5 leading-tight">
            Dial Continuo
          </span>
          <span className="text-[5.5px] sm:text-[6.5px] text-gray-500 font-mono uppercase tracking-widest">
            Experiencia Subjetiva
          </span>
        </div>
      </div>

      {/* Bulbs row */}
      <div className="w-full flex flex-col items-center bg-slate-900/30 rounded-xl p-1.5 border border-slate-800 relative z-10">
        <div className="w-full flex items-center justify-between text-[6px] sm:text-[7.5px] text-gray-500 font-mono tracking-widest font-semibold px-2 mb-1 border-b border-slate-800/60 pb-1">
          <span>◀ BOMBILLA FRÍA Y OSCURA</span>
          <span className="text-amber-500/80">ESCALA VISUAL DE LA CONCIENCIA</span>
          <span>BOMBILLA RADIANTE ▶</span>
        </div>

        <div className="w-full grid grid-cols-5 gap-1.5">
          {[
            {
              id: "termostato",
              name: "1. Termostato",
              desc: "Mecánico. ON/OFF",
              glowClass: "from-slate-900 to-slate-950 border-slate-800 text-gray-500",
              bulbColor: "#1e293b",
              filamentColor: "#475569",
              lightGlow: "opacity-0"
            },
            {
              id: "gusano",
              name: "2. C. elegans",
              desc: "Gusano. Reflejos",
              glowClass: "from-amber-950/20 to-slate-950 border-amber-950/40 text-amber-300/80",
              bulbColor: "#451a03",
              filamentColor: "#f59e0b",
              lightGlow: "bg-amber-500/10 opacity-30"
            },
            {
              id: "abeja",
              name: "3. Abeja",
              desc: "Social. Navega",
              glowClass: "from-amber-900/30 to-slate-950 border-amber-900/40 text-amber-400",
              bulbColor: "#78350f",
              filamentColor: "#fbbf24",
              lightGlow: "bg-amber-400/20 opacity-50"
            },
            {
              id: "perro",
              name: "4. Perro",
              desc: "Emoción. Vínculo",
              glowClass: "from-orange-900/40 to-slate-950 border-orange-900/40 text-orange-400",
              bulbColor: "#9a3412",
              filamentColor: "#f97316",
              lightGlow: "bg-orange-500/30 opacity-70 animate-pulse"
            },
            {
              id: "humano",
              name: "5. Humano",
              desc: "Razón. Autoconsciente",
              glowClass: "from-yellow-900/50 to-slate-950 border-yellow-800/40 text-yellow-300 font-bold",
              bulbColor: "#7c2d12",
              filamentColor: "#fef08a",
              lightGlow: "bg-yellow-400/50 opacity-90 animate-ping"
            }
          ].map((b, idx) => (
            <div key={idx} className={`flex flex-col items-center bg-gradient-to-b ${b.glowClass} border rounded-lg p-1 text-center`}>
              {/* Bulb SVG */}
              <div className="relative w-8 h-8 flex items-center justify-center mb-1">
                <div className={`absolute w-6 h-6 rounded-full filter blur-md ${b.lightGlow}`} />
                <svg className="w-7 h-7 relative z-10" viewBox="0 0 40 40">
                  <g filter="url(#il04-watercolor)">
                    {/* Bulb glass */}
                    <path d="M 20,4 C 11.5,4 9.5,12 11.5,19 C 13,24.5 16,26.5 16,30 L 24,30 C 24,26.5 27,24.5 28.5,19 C 30.5,12 28.5,4 20,4 Z" fill={b.bulbColor} stroke={b.filamentColor} strokeWidth="1.2" />
                    {/* Filament */}
                    <path d="M 17,21 L 18.5,14 L 21.5,14 L 23,21" stroke={b.filamentColor} strokeWidth="1.2" fill="none" />
                    {/* Bulb base */}
                    <rect x="16" y="30" width="8" height="3" fill="#64748b" rx="0.5" />
                    <rect x="17.5" y="33" width="5" height="2" fill="#475569" rx="0.5" />
                  </g>
                  <rect width="100%" height="100%" filter="url(#il04-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                  {/* Sparkling stars for humans */}
                  {idx === 4 && (
                    <motion.g
                      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <polygon points="20,1 21,3 23,4 21,5 20,7 19,5 17,4 19,3" fill="#ffffff" />
                    </motion.g>
                  )}
                </svg>
              </div>
              <span className="text-[6.5px] sm:text-[7.5px] font-semibold tracking-tighter uppercase line-clamp-1">{b.name}</span>
              <span className="text-[5px] sm:text-[5.5px] text-gray-500 leading-none mt-0.5 line-clamp-2">{b.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. il05: Agujero negro para no físicos (Vortex con pez dorado)
export const Il05: React.FC = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 rounded-2xl border border-blue-500/10 shadow-lg shadow-blue-500/2" style={{ minHeight: "300px" }}>
      <ArtFilters idPrefix="il05" />
      <svg className="w-full h-full relative z-10" viewBox="0 0 400 400" fill="none">
        <g filter="url(#il05-watercolor)">
          {/* Outer intricate mandala border */}
          <circle cx="200" cy="200" r="190" stroke="#1d4ed8" strokeWidth="1" strokeDasharray="3,12" opacity="0.3" />
          <circle cx="200" cy="200" r="185" stroke="#1e1b4b" strokeWidth="2.5" />
          <circle cx="200" cy="200" r="180" stroke="#0369a1" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
          
          {/* Wave-like mandala rings */}
          {[...Array(6)].map((_, i) => (
            <circle 
              key={i} 
              cx="200" 
              cy="200" 
              r={140 + i * 8} 
              stroke={i % 2 === 0 ? "#fbbf24" : "#2563eb"} 
              strokeWidth="0.75" 
              strokeDasharray="20,40" 
              opacity={0.15 - i * 0.02} 
            />
          ))}

          {/* Deep vortex background gradient */}
          <circle cx="200" cy="200" r="130" fill="url(#mandala-vortex-glow)" />

          {/* Rotating water current lines */}
          <g transform="translate(200, 200)">
            {[...Array(8)].map((_, i) => (
              <motion.path
                key={i}
                d="M 0,0 C 40,-30 80,-40 120,0"
                stroke="url(#water-stream-grad)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.35"
                transform={`rotate(${i * 45})`}
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 12 + i * 2, ease: "linear" }}
              />
            ))}
          </g>

          {/* Inward arrow spirals */}
          <g transform="translate(200, 200)">
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                <g key={idx} transform={`rotate(${angle})`}>
                  {/* Curved spiral stream */}
                  <path d="M 0,-130 C 50,-120 100,-70 50,-30" stroke="#60a5fa" strokeWidth="1.2" strokeDasharray="4,6" fill="none" opacity="0.5" />
                  {/* Arrowhead */}
                  <polygon points="50,-30 46,-38 56,-36" fill="#fbbf24" opacity="0.8" />
                </g>
              ))}
            </motion.g>
          </g>

          {/* Black Hole Core */}
          <circle cx="200" cy="200" r="28" fill="#020617" stroke="#fbbf24" strokeWidth="1.5" opacity="0.9" />
          <motion.circle
            cx="200"
            cy="200"
            r="18"
            fill="#000000"
            animate={{ scale: [0.93, 1.07, 0.93] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />

          {/* The Golden Fish (Koi carp shape) swimming along the currents */}
          <motion.g
            transform="translate(200, 200)"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          >
            <g transform="translate(110, 0) rotate(90)">
              {/* Fish body */}
              <path d="M -15,0 C -8,-12 10,-10 18,0 C 10,10 -8,12 -15,0 Z" fill="url(#koi-body-grad)" stroke="#d97706" strokeWidth="1.2" />
              {/* Fish tail (animated wiggle) */}
              <motion.path 
                d="M -15,0 L -25,-6 L -20,0 L -25,6 Z" 
                fill="#ea580c" 
                animate={{ rotate: [-8, 8, -8] }} 
                style={{ transformOrigin: "-15px 0" }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
              />
              {/* Fish fins */}
              <path d="M 2,-11 Q -8,-16 -4,-6" fill="#f59e0b" />
              <path d="M 2,11 Q -8,16 -4,6" fill="#f59e0b" />
              {/* Eyes */}
              <circle cx="10" cy="-3.5" r="1.5" fill="#ffffff" />
              <circle cx="10" cy="-3.5" r="0.75" fill="#000000" />
              <circle cx="10" cy="3.5" r="1.5" fill="#ffffff" />
              <circle cx="10" cy="3.5" r="0.75" fill="#000000" />
              {/* Whiskers */}
              <path d="M 17,-3 Q 22,-5 20,-1" stroke="#fbbf24" strokeWidth="0.5" fill="none" />
              <path d="M 17,3 Q 22,5 20,1" stroke="#fbbf24" strokeWidth="0.5" fill="none" />
              {/* Bubbles emitting from fish */}
              {[...Array(3)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={18 + i * 8}
                  cy={-2 + (i % 2) * 4}
                  r="1.5"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  fill="none"
                  animate={{ y: [-15, 10], opacity: [0.8, 0], scale: [0.8, 1.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 + i * 0.4, ease: "easeOut" }}
                />
              ))}
            </g>
          </motion.g>
        </g>
        
        <rect width="100%" height="100%" filter="url(#il05-paper)" className="pointer-events-none mix-blend-overlay opacity-85" />

        {/* Definitions for Gradients */}
        <defs>
          <radialGradient id="mandala-vortex-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="35%" stopColor="#1e3a8a" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#0369a1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="water-stream-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="koi-body-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// 4. il06: Los cinco paralelos (Planos técnicos diagramáticos)
export const Il06: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col p-2 text-white font-sans bg-slate-950 rounded-2xl overflow-y-auto border border-blue-500/15 relative" style={{ maxHeight: "400px" }}>
      <ArtFilters idPrefix="il06" />
      {/* Grid line background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b1a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b1a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      {/* Blueprint Header */}
      <div className="flex items-center justify-between border-b border-blue-500/20 pb-1.5 mb-2 relative z-10 font-mono text-[7px] sm:text-[8px] text-blue-400">
        <span className="font-bold uppercase tracking-wider">REF. CINCO PARALELOS // DIAGRAMA ARTÍSTICO</span>
        <span>PLANO TEC. #056</span>
      </div>

      <div className="flex-1 flex flex-col gap-2 relative z-10">
        {[
          {
            num: "1",
            title: "CONTROL Y REGULACIÓN",
            leftComp: (
              /* Thermometer */
              <div className="flex items-center gap-1">
                <svg className="w-12 h-6" viewBox="0 0 80 40">
                  <g filter="url(#il06-watercolor)">
                    {/* Thermometer Tube */}
                    <rect x="5" y="16" width="55" height="8" fill="#1e293b" rx="4" stroke="#475569" strokeWidth="0.75" />
                    {/* Mercury Bulb */}
                    <circle cx="62" cy="20" r="7" fill="#ef4444" stroke="#475569" strokeWidth="0.75" />
                    {/* Active Mercury Column */}
                    <motion.rect 
                      x="9" y="18" height="4" fill="#ef4444" rx="2" 
                      animate={{ width: [15, 38, 15] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    />
                    {/* Tick Marks */}
                    <line x1="15" y1="12" x2="15" y2="15" stroke="#94a3b8" strokeWidth="0.5" />
                    <line x1="25" y1="12" x2="25" y2="15" stroke="#94a3b8" strokeWidth="0.5" />
                    <line x1="35" y1="12" x2="35" y2="15" stroke="#94a3b8" strokeWidth="0.5" />
                    <line x1="45" y1="12" x2="45" y2="15" stroke="#94a3b8" strokeWidth="0.5" />
                    <line x1="55" y1="12" x2="55" y2="15" stroke="#94a3b8" strokeWidth="0.5" />
                  </g>
                  <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                  <text x="35" y="10" textAnchor="middle" className="fill-blue-400 text-[6px] font-mono">24°C</text>
                </svg>
                {/* Switch toggle */}
                <svg className="w-8 h-6" viewBox="0 0 40 40">
                  <g filter="url(#il06-watercolor)">
                    <rect x="5" y="5" width="30" height="30" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <motion.circle
                      cx="20" cy="20" r="5" fill="#22c55e"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <line x1="20" y1="5" x2="20" y2="15" stroke="#22c55e" strokeWidth="1.5" />
                  </g>
                  <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                  <text x="20" y="38" textAnchor="middle" className="fill-gray-500 text-[6px] font-mono">ON</text>
                </svg>
              </div>
            ),
            desc: "Interruptor binario frente al dial de regulación"
          },
          {
            num: "2",
            title: "ESTRUCTURA Y DESORDEN",
            leftComp: (
              <div className="flex items-center gap-1.5">
                {/* Lattice (Left) */}
                <svg className="w-10 h-6" viewBox="0 0 60 40">
                  <g filter="url(#il06-watercolor)">
                    {/* Lattice lines */}
                    <line x1="10" y1="20" x2="30" y2="8" stroke="#3b82f6" strokeWidth="0.75" />
                    <line x1="10" y1="20" x2="30" y2="32" stroke="#3b82f6" strokeWidth="0.75" />
                    <line x1="30" y1="8" x2="50" y2="20" stroke="#3b82f6" strokeWidth="0.75" />
                    <line x1="30" y1="32" x2="50" y2="20" stroke="#3b82f6" strokeWidth="0.75" />
                    <line x1="30" y1="8" x2="30" y2="32" stroke="#3b82f6" strokeWidth="0.75" />
                    {/* Nodes */}
                    <circle cx="10" cy="20" r="2.5" fill="#60a5fa" />
                    <circle cx="30" cy="8" r="2.5" fill="#60a5fa" />
                    <circle cx="30" cy="32" r="2.5" fill="#60a5fa" />
                    <circle cx="50" cy="20" r="2.5" fill="#60a5fa" />
                  </g>
                  <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                </svg>
                {/* Tangled mess (Right) */}
                <svg className="w-10 h-6" viewBox="0 0 60 40">
                  <g filter="url(#il06-watercolor)">
                    <path d="M 5,20 Q 25,5 30,30 T 55,20 M 10,10 Q 40,35 50,15 T 15,35" stroke="#f43f5e" strokeWidth="0.75" fill="none" opacity="0.8" />
                    <path d="M 8,30 Q 35,0 45,35 T 20,5" stroke="#fbbf24" strokeWidth="0.75" fill="none" opacity="0.7" />
                  </g>
                  <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                </svg>
              </div>
            ),
            desc: "Red cristalina estructurada vs. filamentos desordenados"
          },
          {
            num: "3",
            title: "POTENCIAL OCULTO",
            leftComp: (
              /* Treasure Chest with Rays */
              <svg className="w-20 h-6" viewBox="0 0 100 40">
                <g filter="url(#il06-watercolor)">
                  {/* Sunburst rays */}
                  <g opacity="0.6">
                    {[...Array(8)].map((_, i) => (
                      <line
                        key={i}
                        x1="50" y1="20"
                        x2={50 + 35 * Math.cos((i * Math.PI) / 4)}
                        y2={20 + 35 * Math.sin((i * Math.PI) / 4)}
                        stroke="#fbbf24"
                        strokeWidth="0.5"
                      />
                    ))}
                  </g>
                  {/* Chest Base */}
                  <rect x="35" y="18" width="30" height="15" fill="#451a03" stroke="#94a3b8" strokeWidth="0.75" rx="1" />
                  <rect x="37" y="18" width="4" height="15" fill="#1e293b" />
                  <rect x="59" y="18" width="4" height="15" fill="#1e293b" />
                  {/* Glowing opened crack */}
                  <motion.polygon 
                    points="34,18 66,18 62,15 38,15" fill="#fbbf24"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  {/* Padlock */}
                  <rect x="47" y="22" width="6" height="6" fill="#64748b" rx="0.5" />
                  <circle cx="50" cy="21" r="2" fill="none" stroke="#64748b" strokeWidth="0.75" />
                </g>
                <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
              </svg>
            ),
            desc: "La caja de madera que contiene la luz comprimida"
          },
          {
            num: "4",
            title: "RITMO Y ESCALA",
            leftComp: (
              <div className="flex items-center gap-2">
                {/* Little mouse running */}
                <svg className="w-10 h-6" viewBox="0 0 60 40">
                  <g filter="url(#il06-watercolor)">
                    <motion.g
                      animate={{ x: [-5, 8, -5], y: [0, -1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    >
                      {/* Body */}
                      <ellipse cx="25" cy="22" rx="7" ry="4" fill="#94a3b8" />
                      {/* Head */}
                      <circle cx="32" cy="20" r="3" fill="#94a3b8" />
                      {/* Ears */}
                      <circle cx="28" cy="16" r="2" fill="#cbd5e1" />
                      {/* Tail */}
                      <path d="M 18,22 Q 12,24 8,20" stroke="#cbd5e1" strokeWidth="0.75" fill="none" />
                    </motion.g>
                    {/* Speed lines */}
                    <line x1="4" y1="20" x2="10" y2="20" stroke="#475569" strokeWidth="0.75" />
                    <line x1="2" y1="24" x2="7" y2="24" stroke="#475569" strokeWidth="0.75" />
                  </g>
                  <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                </svg>
                {/* Big Elephant */}
                <svg className="w-10 h-6" viewBox="0 0 60 40">
                  <g filter="url(#il06-watercolor)">
                    {/* Elephant silhouette */}
                    <path d="M 12,32 L 15,22 C 15,20 12,18 12,14 C 12,8 20,6 35,6 C 45,6 50,10 50,18 L 47,24 L 48,32 M 22,32 L 23,24" stroke="#94a3b8" strokeWidth="1" fill="none" />
                    {/* Trunk */}
                    <path d="M 12,14 Q 5,14 8,24" stroke="#94a3b8" strokeWidth="1" fill="none" />
                    {/* Ear */}
                    <path d="M 22,10 C 22,10 16,10 16,16 C 16,22 22,22 22,22 Z" fill="#475569" stroke="#94a3b8" strokeWidth="0.75" />
                    {/* Eye */}
                    <circle cx="20" cy="12" r="0.75" fill="#ffffff" />
                  </g>
                  <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                </svg>
              </div>
            ),
            desc: "Velocidad de cambio e integración biológica"
          },
          {
            num: "5",
            title: "PROYECCIÓN Y FORMA",
            leftComp: (
              <div className="flex items-center gap-1.5">
                {/* Holographic Projector casting a Rose */}
                <svg className="w-12 h-6" viewBox="0 0 80 40">
                  <g filter="url(#il06-watercolor)">
                    {/* Projector body */}
                    <rect x="5" y="26" width="22" height="8" fill="#1e293b" stroke="#475569" strokeWidth="0.75" rx="1" />
                    <circle cx="20" cy="26" r="3" fill="#64748b" />
                    {/* Laser light cone */}
                    <polygon points="20,24 10,2 30,2" fill="url(#holo-beam)" opacity="0.35" />
                    {/* Hologram Rose */}
                    <motion.g
                      transform="translate(20, 7) scale(0.65)"
                      animate={{ rotate: 360, y: [0, -2, 0] }}
                      transition={{ rotate: { repeat: Infinity, duration: 6, ease: "linear" }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
                    >
                      <circle cx="0" cy="0" r="6" fill="none" stroke="#f472b6" strokeWidth="1.2" />
                      <path d="M -5,0 C -5,-8 5,-8 5,0 Z" fill="#f472b6" opacity="0.8" />
                      <path d="M 0,-5 C 8,-5 8,5 0,5 Z" fill="#f472b6" opacity="0.8" />
                    </motion.g>
                  </g>
                  <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                </svg>
                {/* CD Disc */}
                <svg className="w-10 h-6" viewBox="0 0 40 40">
                  <g filter="url(#il06-watercolor)">
                    <motion.circle 
                      cx="20" cy="20" r="16" stroke="url(#cd-rainbow)" strokeWidth="4" fill="none" 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    />
                    <circle cx="20" cy="20" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                  </g>
                  <rect width="100%" height="100%" filter="url(#il06-paper)" className="pointer-events-none mix-blend-overlay opacity-60" />
                </svg>
              </div>
            ),
            desc: "El volumen proyectado desde el borde del horizonte"
          }
        ].map((row, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2 border border-blue-500/10 bg-blue-950/20 rounded-xl p-2 hover:bg-blue-950/30 transition-all duration-300">
            {/* Row index and description */}
            <div className="flex items-start gap-2 max-w-[55%]">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 w-5 h-5 rounded-lg flex items-center justify-center shrink-0">
                {row.num}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-amber-400 leading-tight">
                  {row.title}
                </span>
                <span className="text-gray-400 text-[7px] sm:text-[8px] font-mono leading-tight mt-0.5">
                  {row.desc}
                </span>
              </div>
            </div>

            {/* Left Blueprint component graphic */}
            <div className="flex-1 flex justify-end shrink-0">
              {row.leftComp}
            </div>
          </div>
        ))}
      </div>

      {/* Definitions */}
      <defs>
        <linearGradient id="holo-beam" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cd-rainbow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="25%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="75%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6366f1" />
        </radialGradient>
      </defs>
    </div>
  );
};

// 19. il08: El río que se convierte en lago (Triptych: Nacimiento, Vida, Muerte)
export const Il08: React.FC = () => {
  return (
    <div className="w-full h-full grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-amber-500/10 shadow-lg relative" style={{ minHeight: "260px" }}>
      <ArtFilters idPrefix="il08" />
      
      {/* Panel 1: NACIMIENTO */}
      <div className="flex flex-col h-full border border-emerald-500/20 bg-emerald-950/5 rounded-xl p-1 overflow-hidden group">
        <div className="flex-1 relative rounded-lg overflow-hidden border border-emerald-500/10 bg-sky-950/20">
          <svg className="w-full h-full" viewBox="0 0 100 200" preserveAspectRatio="none">
            <g filter="url(#il08-watercolor)">
              {/* Sky */}
              <rect x="0" y="0" width="100" height="70" fill="url(#sky-birth-grad)" />
              {/* Sun */}
              <circle cx="50" cy="50" r="12" fill="url(#sun-glow-birth)" opacity="0.6" />
              
              {/* Hills */}
              <path d="M -10,120 C 20,95 40,110 70,100 C 90,92 110,105 120,100 L 120,200 L -10,200 Z" fill="#047857" />
              <path d="M -10,140 C 30,125 60,150 110,135 L 110,200 L -10,200 Z" fill="#065f46" opacity="0.9" />
              
              {/* Winding River */}
              <motion.path 
                d="M 50,100 C 45,120 75,130 35,160 C 15,175 70,185 50,205" 
                stroke="url(#river-water-grad)" 
                strokeWidth="5" 
                strokeLinecap="round"
                fill="none" 
                animate={{ d: [
                  "M 50,100 C 45,120 75,130 35,160 C 15,175 70,185 50,205",
                  "M 51,100 C 42,122 78,128 32,162 C 12,177 72,183 48,205",
                  "M 50,100 C 45,120 75,130 35,160 C 15,175 70,185 50,205"
                ]}}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />

              {/* Foreground Flowers (little dots) */}
              <circle cx="15" cy="165" r="1.5" fill="#ffffff" />
              <circle cx="22" cy="185" r="1" fill="#facc15" />
              <circle cx="85" cy="175" r="1.2" fill="#f87171" />
              <circle cx="75" cy="190" r="1.5" fill="#ffffff" />
            </g>
            <rect width="100%" height="100%" filter="url(#il08-paper)" className="pointer-events-none mix-blend-overlay opacity-70" />
          </svg>
        </div>
        <div className="text-center pt-1 mt-1 border-t border-emerald-500/10">
          <span className="font-serif italic text-[8.5px] sm:text-[9px] tracking-widest text-emerald-400 font-bold">
            NACIMIENTO
          </span>
        </div>
      </div>

      {/* Panel 2: VIDA */}
      <div className="flex flex-col h-full border border-blue-500/20 bg-blue-950/5 rounded-xl p-1 overflow-hidden group">
        <div className="flex-1 relative rounded-lg overflow-hidden border border-blue-500/10 bg-sky-950/20">
          <svg className="w-full h-full" viewBox="0 0 100 200" preserveAspectRatio="none">
            <g filter="url(#il08-watercolor)">
              {/* Split View Line */}
              <rect x="0" y="0" width="100" height="90" fill="url(#sky-life-grad)" />
              
              {/* Background Pine Trees */}
              <path d="M 10,90 L 15,70 L 20,90 Z" fill="#0f172a" />
              <path d="M 15,90 L 20,65 L 25,90 Z" fill="#0f172a" />
              <path d="M 75,90 L 80,68 L 85,90 Z" fill="#0f172a" />
              <path d="M 80,90 L 85,72 L 90,90 Z" fill="#0f172a" />

              {/* Above-water lake reflection */}
              <rect x="0" y="80" width="100" height="10" fill="#0284c7" opacity="0.3" />
              
              {/* Under-water area */}
              <rect x="0" y="90" width="100" height="110" fill="url(#lake-underwater-grad)" />

              {/* Reeds */}
              <path d="M 5,90 C 7,120 4,140 5,200" stroke="#047857" strokeWidth="1" fill="none" />
              <path d="M 85,90 C 83,120 86,145 84,200" stroke="#047857" strokeWidth="1" fill="none" />

              {/* Fish (glowing outlines) */}
              <g>
                {/* Fish 1 */}
                <motion.g 
                  animate={{ x: [-5, 10, -5], y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <path d="M 30,115 C 38,111 48,113 54,115 C 48,117 38,119 30,115" fill="#facc15" opacity="0.8" />
                  <polygon points="30,115 25,112 25,118" fill="#eab308" />
                </motion.g>
                {/* Fish 2 */}
                <motion.g 
                  animate={{ x: [10, -5, 10], y: [2, -2, 2] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                  <path d="M 60,145 C 52,141 42,143 36,145 C 42,147 52,149 60,145" fill="#facc15" opacity="0.7" />
                  <polygon points="60,145 65,142 65,148" fill="#eab308" />
                </motion.g>
              </g>

              {/* Water ripples and bubbles */}
              {[105, 130, 160, 180].map((y, i) => (
                <motion.circle
                  key={i}
                  cx={20 + (i * 17) % 60}
                  cy={y}
                  r="1"
                  stroke="#38bdf8"
                  strokeWidth="0.5"
                  fill="none"
                  animate={{ y: [y, y - 25], opacity: [0.8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 + i * 0.5, ease: "linear" }}
                />
              ))}
            </g>
            <rect width="100%" height="100%" filter="url(#il08-paper)" className="pointer-events-none mix-blend-overlay opacity-70" />
          </svg>
        </div>
        <div className="text-center pt-1 mt-1 border-t border-blue-500/10">
          <span className="font-serif italic text-[8.5px] sm:text-[9px] tracking-widest text-blue-400 font-bold">
            VIDA
          </span>
        </div>
      </div>

      {/* Panel 3: MUERTE */}
      <div className="flex flex-col h-full border border-amber-500/20 bg-amber-950/5 rounded-xl p-1 overflow-hidden group">
        <div className="flex-1 relative rounded-lg overflow-hidden border border-amber-500/10 bg-orange-950/20">
          <svg className="w-full h-full" viewBox="0 0 100 200" preserveAspectRatio="none">
            <g filter="url(#il08-watercolor)">
              {/* Sky sunset */}
              <rect x="0" y="0" width="100" height="100" fill="url(#sky-death-grad)" />
              
              {/* Dead Trees */}
              <path d="M 15,130 L 15,95 M 15,115 L 8,110 M 15,108 L 22,103 M 15,100 L 10,93" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 82,140 L 82,105 M 82,125 L 75,120 M 82,118 L 88,113" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
              
              {/* Cracked Mud Ground */}
              <rect x="0" y="120" width="100" height="80" fill="#78350f" />
              
              {/* Cracks detail */}
              <g stroke="#451a03" strokeWidth="0.75" opacity="0.8">
                {/* Crack grid */}
                <path d="M 0,130 L 100,130 M 0,150 L 100,150 M 0,170 L 100,170 M 0,190 L 100,190" />
                <path d="M 20,120 L 20,200 M 40,120 L 40,200 M 60,120 L 60,200 M 80,120 L 80,200" />
                <path d="M 10,125 L 25,145 M 35,135 L 50,155 M 70,125 L 85,145 M 5,165 L 20,185 M 55,165 L 70,185" />
              </g>

              {/* Rising smoke/vapor coils */}
              {[25, 50, 75].map((x, idx) => (
                <motion.path
                  key={idx}
                  d={`M ${x},125 Q ${x - 5},100 ${x + 5},75 T ${x},30`}
                  stroke="#fed7aa"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.3"
                  animate={{ strokeDashoffset: [0, -30], opacity: [0.1, 0.4, 0.1] }}
                  strokeDasharray="10,20"
                  transition={{ repeat: Infinity, duration: 3 + idx, ease: "linear" }}
                />
              ))}
            </g>
            <rect width="100%" height="100%" filter="url(#il08-paper)" className="pointer-events-none mix-blend-overlay opacity-70" />
          </svg>
        </div>
        <div className="text-center pt-1 mt-1 border-t border-amber-500/10">
          <span className="font-serif italic text-[8.5px] sm:text-[9px] tracking-widest text-amber-400 font-bold">
            MUERTE
          </span>
        </div>
      </div>

      {/* Definitions for Gradients */}
      <defs>
        <linearGradient id="sky-birth-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <radialGradient id="sun-glow-birth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="river-water-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="sky-life-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="lake-underwater-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c1d3a" />
        </linearGradient>
        <linearGradient id="sky-death-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="60%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#292524" />
        </linearGradient>
      </defs>
    </div>
  );
};

// 5. il07: Hun Dun y los siete orificios
export const Il07: React.FC = () => (
  <div className="w-full h-full relative overflow-hidden bg-slate-950 rounded-2xl border border-amber-500/10 shadow-lg" style={{ minHeight: "300px" }}>
    <ArtFilters idPrefix="il07" />
    <svg className="w-full h-full relative z-10" viewBox="0 0 400 400" fill="none">
      <g filter="url(#il07-watercolor)">
        {/* Soft atmospheric glow / ink splatter in background */}
        <circle cx="200" cy="200" r="160" fill="url(#hundun-bg-glow)" opacity="0.4" />
        
        {/* Decorative celestial background ink splatters */}
        <circle cx="100" cy="110" r="4" fill="#fbbf24" opacity="0.15" />
        <circle cx="310" cy="280" r="6" fill="#6366f1" opacity="0.1" />
        <circle cx="280" cy="90" r="3" fill="#fbbf24" opacity="0.2" />
        <circle cx="90" cy="290" r="5" fill="#f59e0b" opacity="0.1" />

        <motion.g
          animate={{ scale: [1, 1.03, 1], rotate: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          {/* Main Hun Dun Chaos Body - thick painterly lines and rich radial wash */}
          <motion.path
            d="M 120,200 C 120,120 180,110 200,110 C 220,110 280,120 280,200 C 280,280 220,290 200,290 C 180,290 120,280 120,200 Z"
            fill="url(#hundun-body)"
            stroke="#d97706"
            strokeWidth="2.5"
            animate={{ d: [
              "M 120,200 C 120,120 180,110 200,110 C 220,110 280,120 280,200 C 280,280 220,290 200,290 C 180,290 120,280 120,200 Z",
              "M 115,195 C 115,125 185,115 200,115 C 215,115 285,125 285,195 C 285,275 215,285 200,285 C 185,285 115,275 115,195 Z",
              "M 120,200 C 120,120 180,110 200,110 C 220,110 280,120 280,200 C 280,280 220,290 200,290 C 180,290 120,280 120,200 Z"
            ]}}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
          {/* Fading facial structures representing original seamless state */}
          <motion.g
            animate={{ opacity: [1, 0.4, 0.1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          >
            <path d="M 170,180 Q 180,170 190,180" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 210,180 Q 220,170 230,180" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 180,220 Q 200,240 220,220" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </motion.g>
        </motion.g>
        {[
          { cx: 165, cy: 155, delay: 0 },
          { cx: 235, cy: 155, delay: 1 },
          { cx: 155, cy: 195, delay: 2 },
          { cx: 245, cy: 195, delay: 3 },
          { cx: 175, cy: 235, delay: 4 },
          { cx: 225, cy: 235, delay: 5 },
          { cx: 200, cy: 200, delay: 6 }
        ].map((o, idx) => (
          <g key={idx}>
            <motion.line
              x1={o.cx > 200 ? o.cx + 50 : o.cx - 50}
              y1={o.cy - 30}
              x2={o.cx}
              y2={o.cy}
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="4,4"
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: o.delay * 0.5 }}
            />
            <motion.circle
              cx={o.cx}
              cy={o.cy}
              r="3.5"
              fill="#fbbf24"
              animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: o.delay * 0.5 }}
            />
          </g>
        ))}
      </g>
      <rect width="100%" height="100%" filter="url(#il07-paper)" className="pointer-events-none mix-blend-overlay opacity-85" />
      <defs>
        <radialGradient id="hundun-body" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="60%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1c1917" />
        </radialGradient>
        <radialGradient id="hundun-bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#431407" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  </div>
);

// 6. il15: El reservorio de la asimetría
export const Il15: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="40" y="40" width="320" height="320" rx="16" fill="#090d16" opacity="0.4" />
    <motion.circle
      cx="200"
      cy="200"
      r="120"
      fill="url(#maternal-glow)"
      stroke="#fbbf24"
      strokeWidth="1.5"
      strokeDasharray="5,5"
      animate={{ rotate: 360, scale: [0.98, 1.02, 0.98] }}
      style={{ transformOrigin: "200px 200px" }}
      transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
    />
    <motion.circle
      cx="200"
      cy="200"
      r="45"
      fill="url(#child-glow)"
      stroke="#60a5fa"
      strokeWidth="2"
      animate={{ scale: [0.92, 1.08, 0.92] }}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
    />
    {[...Array(8)].map((_, i) => {
      const angle = (i * Math.PI) / 4;
      const r1 = 110;
      const r2 = 50;
      return (
        <motion.line
          key={i}
          x1={200 + r1 * Math.cos(angle)}
          y1={200 + r1 * Math.sin(angle)}
          x2={200 + r2 * Math.cos(angle)}
          y2={200 + r2 * Math.sin(angle)}
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -100], opacity: [0, 0.8, 0] }}
          strokeDasharray="10,40"
          transition={{ repeat: Infinity, duration: 3 + (i % 3) * 0.5, delay: i * 0.4 }}
        />
      );
    })}
    <path d="M 80,310 Q 200,320 320,310" stroke="#1d4ed8" strokeWidth="1" opacity="0.3" />
    <path d="M 100,320 Q 200,325 300,320" stroke="#1d4ed8" strokeWidth="1" opacity="0.2" />
    <defs>
      <radialGradient id="maternal-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
        <stop offset="70%" stopColor="#d97706" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="child-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
        <stop offset="70%" stopColor="#2563eb" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// 7. il_alzheimer: La biblioteca que se desintegra
export const IlAlzheimer: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <path d="M 80,100 L 320,100 M 80,180 L 320,180 M 80,260 L 320,260 M 80,340 L 320,340" stroke="#334155" strokeWidth="3" />
    <path d="M 80,80 L 80,340 M 320,80 L 320,340" stroke="#1e293b" strokeWidth="5" />
    <g>
      <rect x="95" y="110" width="15" height="70" fill="#1d4ed8" opacity="0.85" rx="1" />
      <rect x="112" y="115" width="18" height="65" fill="#475569" opacity="0.5" rx="1" />
      <motion.g animate={{ y: [0, -10, 0], opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 4 }}>
        <circle cx="145" cy="140" r="1.5" fill="#fbbf24" />
        <circle cx="160" cy="150" r="2" fill="#fbbf24" />
        <circle cx="150" cy="125" r="1" fill="#fbbf24" />
      </motion.g>
      <rect x="180" y="105" width="22" height="75" fill="#f59e0b" opacity="0.8" rx="1" />
      <g transform="translate(100, 180) rotate(-15)">
        <rect x="0" y="-70" width="16" height="70" fill="#fbbf24" opacity="0.85" rx="1" />
      </g>
      <rect x="230" y="195" width="15" height="65" fill="#1e3a8a" opacity="0.75" rx="1" />
      <rect x="247" y="190" width="18" height="70" fill="#d97706" opacity="0.8" rx="1" />
      <g transform="translate(180, 260)">
        <rect x="0" y="-65" width="15" height="65" fill="#475569" opacity="0.4" rx="1" />
        {[...Array(4)].map((_, i) => (
          <motion.circle
            key={i}
            cx={10 + i * 8}
            cy={-50 + (i % 2) * 10}
            r="2"
            fill="#fbbf24"
            animate={{ y: [0, -40], opacity: [0.8, 0], x: [0, (i - 1.5) * 15] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.5 }}
          />
        ))}
      </g>
    </g>
    <motion.path
      d="M 220,40 L 340,320 L 290,340 L 170,40 Z"
      fill="url(#light-ray)"
      animate={{ opacity: [0.15, 0.25, 0.15] }}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
    />
    <defs>
      <linearGradient id="light-ray" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

// 8. il_parkinson: El director sin orquesta
export const IlParkinson: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <path d="M 200,40 L 290,360 L 110,360 Z" fill="url(#spotlight-cone)" opacity="0.15" />
    {[130, 160, 190].map((r, idx) => (
      <motion.circle
        key={idx}
        cx="200"
        cy="250"
        r={r}
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeDasharray="4,8"
        opacity="0.25"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ repeat: Infinity, duration: 4, delay: idx * 0.8 }}
      />
    ))}
    <g transform="translate(200, 240)">
      <circle cx="0" cy="-40" r="10" fill="#e2e8f0" />
      <path d="M -15,0 L 15,0 L 10,-30 L -10,-30 Z" fill="#94a3b8" />
      <motion.path
        d="M -10,-25 Q -30,-45 -40,-35"
        stroke="#fbbf24"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        animate={{ d: [
          "M -10,-25 Q -30,-45 -40,-35",
          "M -10,-25 Q -35,-55 -45,-40",
          "M -10,-25 Q -30,-45 -40,-35"
        ]}}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      />
      <motion.g
        animate={{ rotate: [-10, 15, -10] }}
        style={{ transformOrigin: "10px -25px" }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
      >
        <path d="M 10,-25 Q 35,-45 40,-35" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <line x1="40" y1="-35" x2="65" y2="-65" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
    </g>
    {[...Array(6)].map((_, i) => (
      <motion.path
        key={i}
        d={`M ${120 + i * 30},140 Q ${135 + i * 30},110 ${120 + i * 30},80`}
        stroke="#fbbf24"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
        animate={{ y: [20, -40], opacity: [0, 0.7, 0] }}
        transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }}
      />
    ))}
    <defs>
      <linearGradient id="spotlight-cone" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

// 9. il_herido: La frontera herida
export const IlHerido: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <circle cx="200" cy="200" r="110" stroke="#475569" strokeWidth="3" opacity="0.5" />
    <motion.path
      d="M 200,90 L 200,160 M 200,310 L 200,240 M 90,200 L 160,200 M 310,200 L 240,200 L 220,180"
      stroke="#fbbf24"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
    />
    <path d="M 200,140 L 180,120 M 200,260 L 220,280 M 140,200 L 120,220 M 260,200 L 280,180" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    <motion.circle
      cx="200"
      cy="200"
      r="25"
      fill="url(#crack-core)"
      animate={{ scale: [1, 1.12, 1] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    />
    <g opacity="0.7">
      <motion.path
        d="M 60,190 Q 110,195 130,200 L 110,205 Z"
        stroke="#60a5fa"
        strokeWidth="2"
        fill="none"
        animate={{ x: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      <motion.path
        d="M 340,210 Q 290,205 270,200 L 290,195 Z"
        stroke="#f472b6"
        strokeWidth="2"
        fill="none"
        animate={{ x: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }}
      />
    </g>
    <defs>
      <radialGradient id="crack-core" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// 10. il_mascotas: El perro y el puente invisible
export const IlMascotas: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="80" y="80" width="240" height="240" rx="12" stroke="#1e293b" strokeWidth="2" />
    <line x1="200" y1="80" x2="200" y2="320" stroke="#1e293b" strokeWidth="1" />
    <line x1="80" y1="180" x2="320" y2="180" stroke="#1e293b" strokeWidth="1" />
    <g transform="translate(100, 180)">
      <path d="M 10,120 C 10,70 30,50 50,50 C 70,50 80,70 80,120 Z" fill="#1e293b" opacity="0.6" />
      <circle cx="50" cy="25" r="14" fill="#334155" />
      <path d="M 70,55 Q 95,75 110,85" stroke="#f59e0b" strokeWidth="2" fill="none" />
    </g>
    <g transform="translate(210, 200)">
      <path d="M 0,100 C 0,60 30,50 50,50 C 70,50 90,60 90,100 Z" fill="#1e293b" opacity="0.6" />
      <path d="M 20,40 Q -10,55 -30,60 L -30,70 Q -5,68 20,65 Z" fill="#334155" />
      <circle cx="20" cy="40" r="12" fill="#334155" />
      <path d="M 25,42 Q 35,65 30,75 Z" fill="#475569" />
      <circle cx="-25" cy="58" r="3" fill="#fbbf24" />
    </g>
    <g>
      {[
        "M 150,225 Q 185,210 220,245",
        "M 150,205 Q 185,190 200,240",
        "M 130,235 Q 170,250 205,260"
      ].map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="#fbbf24"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
          animate={{ strokeDashoffset: [0, -40] }}
          strokeDasharray="5,15"
          transition={{ repeat: Infinity, duration: 3 + i, ease: "linear" }}
        />
      ))}
      <motion.circle cx="185" cy="210" r="3" fill="#fbbf24" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
      <motion.circle cx="170" cy="235" r="2.5" fill="#fbbf24" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.7 }} />
    </g>
  </svg>
);

// 11. il_inanimado: El entrelazamiento con lo inanimado
export const IlInanimado: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <g transform="translate(200, 200)">
      <motion.circle
        r="35"
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeDasharray="4,4"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      />
      <circle r="25" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
      <path d="M -10,-2 Q 0,10 10,-2" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
    {[
      { x: 100, y: 100, name: "RELOJ", path: "M 0,-15 A 15,15 0 1,1 -1,-15 M 0,-15 L 0,0 L 8,5" },
      { x: 300, y: 100, name: "SILLA", path: "M -10,-15 L -10,15 M -10,0 L 10,0 L 10,15 M -10,-15 L 10,-15 L 10,0" },
      { x: 100, y: 300, name: "LIBRO", path: "M -15,0 Q 0,-8 15,0 L 15,10 Q 0,2 -15,10 Z M 0,-8 L 0,10" }
    ].map((obj, idx) => (
      <g key={idx} transform={`translate(${obj.x}, ${obj.y})`}>
        <circle r="25" fill="#1e293b" opacity="0.5" stroke="#475569" strokeWidth="1" />
        <path d={obj.path} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
        <text y="38" textAnchor="middle" className="fill-gray-500 font-mono text-[8px] tracking-wider">{obj.name}</text>
        <motion.path
          d={`M 0,0 L ${200 - obj.x}, ${200 - obj.y}`}
          stroke="url(#ray-grad)"
          strokeWidth="1.5"
          strokeDasharray="5,15"
          animate={{ strokeDashoffset: [0, -30] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
      </g>
    ))}
    <defs>
      <linearGradient id="ray-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
);

// 12. il_clon: El clon y el horizonte
export const IlClon: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="40" y="40" width="320" height="320" rx="16" fill="url(#dusk-sky)" opacity="0.3" />
    {[
      { x: 80, y: 260, scale: 0.6, op: 0.25 },
      { x: 140, y: 290, scale: 0.5, op: 0.2 },
      { x: 320, y: 270, scale: 0.6, op: 0.25 }
    ].map((cl, i) => (
      <g key={i} transform={`translate(${cl.x}, ${cl.y}) scale(${cl.scale})`} opacity={cl.op}>
        <path d="M -30,0 C -30,-40 30,-40 30,0 L 20,30 L -20,30 Z" fill="#475569" />
        <circle cx="20" cy="-35" r="10" fill="#475569" />
      </g>
    ))}
    <g transform="translate(200, 240)">
      <ellipse cx="0" cy="20" rx="45" ry="25" fill="#1e293b" />
      <path d="M 25,10 L 50,-20 L 65,-15 L 45,25 Z" fill="#1e293b" />
      <circle cx="55" cy="-18" r="8" fill="#1e293b" />
      <rect x="-35" y="35" width="8" height="50" fill="#1e293b" rx="2" />
      <rect x="-15" y="35" width="8" height="50" fill="#1e293b" rx="2" />
      <rect x="10" y="35" width="8" height="50" fill="#1e293b" rx="2" />
      <rect x="28" y="35" width="8" height="50" fill="#1e293b" rx="2" />
      <circle cx="-10" cy="-35" r="12" fill="#334155" />
      <path d="M -25,-23 L 5,-23 L 0,15 L -20,15 Z" fill="#334155" />
      <line x1="-5" y1="-12" x2="45" y2="-15" stroke="#fbbf24" strokeWidth="1.5" />
    </g>
    <g transform="translate(200, 240)">
      <motion.path
        d="M -10,-23 C 15,-40 35,-40 55,-18"
        stroke="#fbbf24"
        strokeWidth="2"
        fill="none"
        animate={{ strokeDashoffset: [0, -30] }}
        strokeDasharray="4,8"
        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
      />
      <motion.circle cx="22" cy="-33" r="3" fill="#fbbf24" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
    </g>
    <defs>
      <linearGradient id="dusk-sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#312e81" />
        <stop offset="60%" stopColor="#581c87" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
);

// 13. il_ia: La máquina que mira al agua
export const IlIa: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="40" y="40" width="320" height="320" rx="16" fill="#0b0f19" opacity="0.5" />
    <g transform="translate(130, 200)">
      <circle cx="0" cy="-40" r="12" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="-12" y1="-40" x2="-20" y2="-40" stroke="#60a5fa" strokeWidth="1.5" />
      <path d="M -15,-20 L 15,-20 L 10,15 L -10,15 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
      <circle cx="-12" cy="-15" r="3.5" fill="#60a5fa" />
      <path d="M -10,15 L -25,45 L 0,60" stroke="#334155" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M -12,-15 L 10,10 L 25,45" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </g>
    <line x1="60" y1="262" x2="340" y2="262" stroke="#1d4ed8" strokeWidth="2.5" />
    <rect x="60" y="263" width="280" height="90" fill="url(#estanque-grad)" opacity="0.6" />
    <g transform="translate(130, 262) scale(1, -1)">
      <motion.g
        animate={{ opacity: [0.5, 0.75, 0.5], y: [0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <path d="M 0,-10 Q 15,-15 20,-30 T 15,-50 Q 5,-58 -10,-55" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.8" />
        <path d="M 5,-28 Q 12,-28 10,-33" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
        <circle cx="10" cy="-28" r="8" fill="url(#face-glow)" opacity="0.15" />
      </motion.g>
    </g>
    <motion.path
      d="M 60,250 Q 150,240 240,250 T 340,250"
      stroke="#fbbf24"
      strokeWidth="2"
      fill="none"
      opacity="0.25"
      animate={{ x: [-15, 15, -15], opacity: [0.15, 0.35, 0.15] }}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
    />
    <defs>
      <linearGradient id="estanque-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <radialGradient id="face-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// 14. il_el_que_queda: El que queda
export const IlElQueQueda: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="40" y="40" width="320" height="320" rx="16" fill="#0f172a" opacity="0.3" />
    <rect x="240" y="60" width="80" height="120" fill="url(#dawn-grad)" rx="4" />
    <line x1="280" y1="60" x2="280" y2="180" stroke="#1e293b" />
    <line x1="240" y1="120" x2="320" y2="120" stroke="#1e293b" />
    <line x1="50" y1="280" x2="350" y2="280" stroke="#334155" strokeWidth="4" />
    <g transform="translate(100, 150)">
      <rect x="0" y="0" width="100" height="85" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
      <rect x="6" y="6" width="88" height="73" rx="4" fill="#020617" />
      <polygon points="40,85 60,85 65,115 35,115" fill="#334155" />
      <rect x="30" y="115" width="40" height="6" fill="#1e293b" rx="2" />
      <motion.g
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <circle cx="50" cy="28" r="8" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" fill="none" />
        <path d="M 38,42 L 62,42 M 50,36 L 50,65 L 42,75 M 50,65 L 58,75" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" fill="none" />
        <motion.line
          x1="8"
          y1="10"
          x2="92"
          y2="10"
          stroke="#34d399"
          strokeWidth="1"
          opacity="0.3"
          animate={{ y: [0, 65, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
      </motion.g>
    </g>
    <g transform="translate(230, 248)">
      <rect x="0" y="0" width="16" height="22" fill="#334155" rx="2" />
      <path d="M 16,5 Q 22,5 22,11 T 16,17" stroke="#334155" strokeWidth="2.5" fill="none" />
      <text x="8" y="-4" textAnchor="middle" className="fill-gray-600 font-mono text-[7px]">COLD</text>
    </g>
    <defs>
      <linearGradient id="dawn-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="60%" stopColor="#7c2d12" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
      </linearGradient>
    </defs>
  </svg>
);

// 15. il_mapayterritorio: El límite del experimento
export const IlMapaYTerritorio: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="50" y="50" width="300" height="300" rx="4" fill="#1c1917" stroke="#78350f" strokeWidth="2.5" opacity="0.6" />
    {[...Array(6)].map((_, i) => (
      <g key={i}>
        <line x1={50 + i * 60} y1="50" x2={50 + i * 60} y2="350" stroke="#78350f" strokeWidth="0.5" opacity="0.2" />
        <line x1="50" y1={50 + i * 60} x2="350" y2={50 + i * 60} stroke="#78350f" strokeWidth="0.5" opacity="0.2" />
      </g>
    ))}
    <g transform="translate(200, 200)">
      <motion.path
        d="M -70,-60 C -40,-90 10,-80 50,-60 C 80,-40 90,10 60,50 C 30,80 -40,70 -70,50 C -100,30 -100,-30 -70,-60 Z"
        stroke="#d97706"
        strokeWidth="2"
        fill="#1e1b4b"
        fillOpacity="0.15"
        animate={{ scale: [0.97, 1.03, 0.97] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <path d="M -40,-30 Q -10,-50 20,-30 T 40,20 Q 0,40 -30,10 Z" stroke="#b45309" strokeWidth="1.2" strokeDasharray="3,3" fill="none" />
      <g transform="translate(60, -40) scale(0.6)">
        <circle r="15" stroke="#fbbf24" strokeWidth="1" />
        <path d="M 0,-20 L 4,-4 L 20,0 L 4,4 L 0,20 L -4,4 L -20,0 L -4,-4 Z" fill="#fbbf24" />
        <text y="-23" textAnchor="middle" className="fill-amber-400 font-mono text-[9px] font-bold">N</text>
      </g>
    </g>
    <g transform="translate(160, 100)">
      <line x1="40" y1="0" x2="10" y2="120" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="40" y1="0" x2="70" y2="120" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="40" cy="0" r="6" fill="#fbbf24" />
    </g>
    <text x="200" y="325" textAnchor="middle" className="fill-amber-300 font-serif italic text-xs tracking-wider">"El mapa no es el territorio"</text>
  </svg>
);

// 16. il_practica: El experimento como práctica
export const IlPractica: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="40" y="40" width="320" height="320" rx="16" fill="#0c111d" opacity="0.4" />
    {[...Array(6)].map((_, i) => (
      <circle key={i} cx={80 + i * 50} cy={60 + (i % 2) * 15} r="1" fill="#ffffff" opacity="0.3" />
    ))}
    <g transform="translate(90, 220)">
      <circle cx="20" cy="-25" r="11" fill="#334155" />
      <path d="M 10,-15 C 10,0 30,5 30,35 L 5,35 Z" fill="#1e293b" />
      <path d="M 22,-5 L 45,5" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="42" y="1" width="8" height="8" fill="#fbbf24" rx="1" />
    </g>
    <g transform="translate(180, 195)">
      <rect x="0" y="30" width="80" height="30" fill="#78350f" opacity="0.8" />
      <rect x="0" y="0" width="18" height="35" fill="#78350f" opacity="0.8" />
      <polygon points="-4,0 9,-18 22,0" fill="#9a3412" />
      <rect x="62" y="0" width="18" height="35" fill="#78350f" opacity="0.8" />
      <polygon points="58,0 71,-18 84,0" fill="#9a3412" />
      <path d="M 28,30 C 28,15 52,15 52,30 Z" fill="#b45309" />
      <line x1="40" y1="15" x2="40" y2="2" stroke="#fbbf24" strokeWidth="1.5" />
      <polygon points="40,2 52,6 40,10" fill="#fbbf24" />
    </g>
    <motion.path
      d="M 40,175 C 100,165 150,185 200,175 C 250,165 300,185 360,175 L 360,360 L 40,360 Z"
      fill="url(#incoming-tide)"
      opacity="0.35"
      animate={{ d: [
        "M 40,175 C 100,165 150,185 200,175 C 250,165 300,185 360,175 L 360,360 L 40,360 Z",
        "M 40,165 C 100,175 150,165 200,175 C 250,185 300,175 360,165 L 360,360 L 40,360 Z",
        "M 40,175 C 100,165 150,185 200,175 C 250,165 300,185 360,175 L 360,360 L 40,360 Z"
      ]}}
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
    />
    <g transform="translate(290, 275) scale(0.6)">
      <ellipse cx="20" cy="20" rx="10" ry="8" fill="#451a03" opacity="0.5" />
      {[
        { cx: 8, cy: 12, r: 2.5 },
        { cx: 14, cy: 6, r: 2.5 },
        { cx: 22, cy: 5, r: 2.5 },
        { cx: 29, cy: 9, r: 2.5 },
        { cx: 33, cy: 18, r: 2.5 }
      ].map((f, i) => (
        <circle key={i} cx={f.cx} cy={f.cy} r={f.r} fill="#451a03" opacity="0.5" />
      ))}
    </g>
    <defs>
      <linearGradient id="incoming-tide" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
  </svg>
);

// 17. il_orilla: La orilla
export const IlOrilla: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="40" y="40" width="320" height="320" rx="16" fill="#020617" opacity="0.4" />
    {[100, 200, 300].map((x, idx) => (
      <g key={idx}>
        <rect x={x - 12} y="100" width="24" height="150" fill="#1e293b" rx="2" />
        <path d={`M ${x - 12},160 L ${x + 12},160`} stroke="#78350f" strokeWidth="2.5" opacity="0.8" />
      </g>
    ))}
    <g transform="translate(110, 210) scale(0.8)">
      <path d="M 10,20 L 90,20 L 75,50 L 25,50 Z" fill="#334155" opacity="0.75" />
      <line x1="50" y1="20" x2="50" y2="-15" stroke="#475569" strokeWidth="2" />
    </g>
    <g transform="translate(200, 160)">
      <circle cx="0" cy="-40" r="9" fill="#94a3b8" />
      <path d="M -12,-20 L 12,-20 L 6,25 L -8,25 Z" fill="#475569" />
      <motion.path
        d="M -12,-15 Q -25,-25 -32,-20"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={{ y: [-1, 1, -1] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
      <motion.path
        d="M 12,-15 Q 25,-25 32,-20"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={{ y: [1, -1, 1] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
    </g>
    <motion.path
      d="M 40,240 C 100,230 150,250 200,240 C 250,230 300,250 360,240 L 360,360 L 40,360 Z"
      fill="url(#high-tide)"
      opacity="0.8"
      animate={{ d: [
        "M 40,240 C 100,230 150,250 200,240 C 250,230 300,250 360,240 L 360,360 L 40,360 Z",
        "M 40,248 C 100,238 150,258 200,248 C 250,238 300,258 360,248 L 360,360 L 40,360 Z",
        "M 40,240 C 100,230 150,250 200,240 C 250,230 300,250 360,240 L 360,360 L 40,360 Z"
      ]}}
      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
    />
    <g>
      {[...Array(5)].map((_, i) => (
        <motion.line
          key={i}
          x1={80 + i * 60}
          y1={280 + (i % 2) * 15}
          x2={130 + i * 60}
          y2={280 + (i % 2) * 15}
          stroke="#fbbf24"
          strokeWidth="1.5"
          opacity="0.3"
          animate={{ opacity: [0.1, 0.6, 0.1], x: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 3 + i, ease: "easeInOut" }}
        />
      ))}
    </g>
    <defs>
      <linearGradient id="high-tide" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#0b1329" />
      </linearGradient>
    </defs>
  </svg>
);

// 18. il_notas: Rastros de donde he estado leyendo
export const IlNotas: React.FC = () => (
  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
    <rect x="40" y="40" width="320" height="320" rx="16" fill="#1c1917" stroke="#44403c" strokeWidth="2.5" opacity="0.6" />
    <path d="M 40,40 L 260,360 L 40,360 Z" fill="url(#lamp-light)" opacity="0.22" />
    <path d="M 40,40 L 80,60" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
    <g transform="translate(180, 150) rotate(-10)">
      <rect x="-35" y="-25" width="70" height="50" fill="#292524" stroke="#57534e" strokeWidth="1.5" rx="2" />
      <line x1="0" y1="-25" x2="0" y2="25" stroke="#78716c" strokeWidth="1.5" />
      <line x1="-25" y1="-15" x2="-5" y2="-15" stroke="#78716c" strokeWidth="1" />
      <line x1="-25" y1="-8" x2="-5" y2="-8" stroke="#78716c" strokeWidth="1" />
      <line x1="-25" y1="0" x2="-5" y2="0" stroke="#78716c" strokeWidth="1" />
      <circle cx="16" cy="0" r="10" stroke="#60a5fa" strokeWidth="1.2" fill="none" />
      <circle cx="16" cy="0" r="4" fill="#fbbf24" />
    </g>
    <g transform="translate(120, 240) rotate(15)">
      <rect x="-40" y="-30" width="80" height="60" fill="#292524" stroke="#57534e" strokeWidth="1.5" rx="2" />
      <line x1="0" y1="-30" x2="0" y2="30" stroke="#78716c" strokeWidth="1.5" />
      <path d="M -25,-15 L -15,-15 M -20,-15 L -20,-5 M -25,-5 L -15,-5" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="5" y="-5" className="fill-blue-400 font-mono text-[6px]">S = A/4</text>
      <text x="5" y="10" className="fill-blue-400 font-mono text-[6px]">T = h/2π</text>
    </g>
    <g transform="translate(270, 220) rotate(-5)">
      <rect x="-20" y="-25" width="40" height="50" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="1" />
      <ellipse cx="0" cy="5" rx="10" ry="12" fill="#d97706" />
      <circle cx="-5" cy="-2" r="3" fill="#fbbf24" />
      <circle cx="5" cy="-2" r="3" fill="#fbbf24" />
    </g>
    <g transform="translate(100, 100) rotate(45)">
      <rect x="0" y="0" width="4" height="60" fill="#475569" rx="1" />
      <polygon points="0,0 4,0 2,-6" fill="#f59e0b" />
    </g>
    <defs>
      <linearGradient id="lamp-light" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#1c1917" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

// 19. il_prologo: El experimento (Microagujero negro y neuronas)
export const IlPrologo: React.FC = () => {
  return (
    <svg className="w-full h-full bg-slate-950 rounded-2xl border border-amber-500/10 shadow-lg" viewBox="0 0 400 400" fill="none">
      {/* Space stars */}
      {[...Array(20)].map((_, i) => (
        <motion.circle
          key={`star-${i}`}
          cx={40 + (i * 77) % 320}
          cy={40 + (i * 93) % 320}
          r="1"
          fill="#ffffff"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 + (i % 3), delay: i * 0.1 }}
        />
      ))}

      {/* Outer neural connections */}
      <g opacity="0.3">
        <path d="M 60,60 L 150,150 M 340,60 L 250,150 M 60,340 L 150,250 M 340,340 L 250,250" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M 200,40 L 200,120 M 200,360 L 200,280 M 40,200 L 120,200 M 360,200 L 280,200" stroke="#f472b6" strokeWidth="1.5" />
      </g>

      {/* Synaptic nodes */}
      <g opacity="0.5">
        <circle cx="60" cy="60" r="5" fill="#3b82f6" />
        <circle cx="340" cy="60" r="5" fill="#3b82f6" />
        <circle cx="60" cy="340" r="5" fill="#3b82f6" />
        <circle cx="340" cy="340" r="5" fill="#3b82f6" />
        <circle cx="200" cy="40" r="4" fill="#f472b6" />
        <circle cx="200" cy="360" r="4" fill="#f472b6" />
        <circle cx="40" cy="200" r="4" fill="#f472b6" />
        <circle cx="360" cy="200" r="4" fill="#f472b6" />
      </g>

      {/* Gravitational lensing / light bending rays */}
      <g transform="translate(200, 200)">
        {[...Array(12)].map((_, i) => (
          <motion.path
            key={i}
            d="M 0,-160 C 40,-130 60,-80 0,-35"
            stroke="url(#prologo-ray-grad)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
            transform={`rotate(${i * 30})`}
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ repeat: Infinity, duration: 4 + (i % 2) * 2, ease: "easeInOut" }}
          />
        ))}
      </g>

      {/* Central glow */}
      <circle cx="200" cy="200" r="70" fill="url(#prologo-center-glow)" />

      {/* Pulsing event horizon */}
      <motion.circle
        cx="200"
        cy="200"
        r="40"
        stroke="url(#prologo-horizon-grad)"
        strokeWidth="3"
        fill="none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />

      {/* Black Hole Core */}
      <circle cx="200" cy="200" r="22" fill="#000" />
      
      {/* Micro Hawking Radiation particles escaping */}
      {[...Array(4)].map((_, i) => (
        <motion.circle
          key={`part-${i}`}
          cx="200"
          cy="200"
          r="2.5"
          fill="#f59e0b"
          animate={{
            x: [0, (i % 2 === 0 ? 1 : -1) * (60 + i * 20)],
            y: [0, (i < 2 ? 1 : -1) * (60 + i * 20)],
            scale: [1, 1.8, 0],
            opacity: [1, 1, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i,
            delay: i * 0.7,
            transformOrigin: "center",
            ease: "easeOut"
          }}
        />
      ))}

      <defs>
        <radialGradient id="prologo-center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#d97706" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="prologo-ray-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="prologo-horizon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

