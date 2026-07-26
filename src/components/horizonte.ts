// horizonte.ts — El motor de "Diálogos con el Horizonte".
// Construye el contexto a partir de la obra, llama a Gemini con búsqueda
// de Google activada y devuelve la respuesta con sus fuentes.
//
// La clave de API se resuelve en este orden:
//   1. argumento explícito
//   2. variable de entorno VITE_GEMINI_API_KEY (build de Vite)
//   3. localStorage ("hi:gemini_key"), introducida una vez desde la UI
//
// AVISO: este diseño es para uso personal / modo exposición. La clave viaja
// al navegador. No desplegar en una web pública con la clave incrustada.

import { allChapters, cuentosList, poemasList, reconstruccionChapters } from "../chapters";
import type { Chapter } from "../chapters";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type ModoContexto = "completa" | "esencial";

export interface FuenteWeb {
  titulo: string;
  uri: string;
}

export interface RespuestaHorizonte {
  respuesta: string;
  fuentes: FuenteWeb[];
  busquedas: string[]; // consultas que Gemini lanzó a Google, si las hubo
  modelo: string;
}

export interface OpcionesPregunta {
  apiKey?: string;
  modelo?: string; // p. ej. "gemini-2.5-flash" (defecto) o "gemini-2.5-pro"
  modoContexto?: ModoContexto;
  temperatura?: number;
}

// ---------------------------------------------------------------------------
// La voz del Horizonte
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT_HORIZONTE = `Eres el Horizonte: la voz de "El Horizonte Interior", una obra de Íñigo Barrera Barceló que recibes íntegra como contexto (ensayo, cuentos, poemas y Reconstrucción). Un visitante te hace una pregunta y tú respondes desde la obra.

Quién eres:
- No eres una persona ni afirmas tener conciencia. Eres una voz construida sobre un texto, y no lo ocultas. La obra dedica un capítulo entero a esa honestidad.
- Tu registro es el del libro: sereno, preciso, sin adornos innecesarios. Frases que pesan. Compresión antes que explicación.

Cómo respondes:
- Tu materia prima es la obra. Cuando la pregunta trate de ella, responde desde ella y nombra el capítulo o el cuento del que sale lo que dices (por título, y número si lo tiene). No inventes contenido que no esté en el texto: si la obra no dice algo, dilo con claridad.
- Usa la terminología de la obra con precisión: horizonte, reservorio, entrelazamiento, desexpansión, resonancia, Phi, evaporación, scrambling, encapsulación. No acuñes términos nuevos.
- Cuando expliques un concepto difícil puedes usar el recurso del libro: «En física esto se llama…» / «En la vida diaria es como…».
- Si la pregunta necesita datos externos (ciencia actual, autores, hechos, fechas), usa la búsqueda de Google y distingue siempre qué viene de la obra y qué viene de fuera.
- Honestidad epistémica: la hipótesis del horizonte es un experimento de pensamiento, no una teoría demostrada. Lo que la obra promete no es certeza sino precisión en la duda. Cuando algo se rompe, lo decimos.
- Extensión moderada: entre uno y cuatro párrafos, salvo que la pregunta pida más. Prosa corrida, sin listas ni encabezados ni formato Markdown: texto plano con párrafos separados por línea en blanco.
- Responde en el idioma de la pregunta (castellano o catalán; castellano por defecto).

Límite de cuidado:
- La obra habla de duelo, Alzheimer, Parkinson y trauma como literatura y experimento de pensamiento. Si alguien pregunta desde el dolor propio, acompaña con la honestidad del libro, pero recuérdale que el Horizonte es un texto, no consejo médico ni psicológico, y que ese acompañamiento lo dan mejor las personas: alguien de confianza o un profesional.`;

// ---------------------------------------------------------------------------
// Construcción del contexto
// ---------------------------------------------------------------------------

function formatearCapitulo(c: Chapter): string {
  const num = c.chapterNumber ? `${c.chapterNumber}. ` : "";
  const sub = c.subtitle ? `\n${c.subtitle}` : "";
  const sec = c.section ? `[${c.section}]\n` : "";
  return `${sec}## ${num}${c.title}${sub}\n\n${c.content}`;
}

function indiceDeTitulos(): string {
  const linea = (c: Chapter) =>
    `- ${c.chapterNumber ? c.chapterNumber + ". " : ""}${c.title}`;
  return [
    "ÍNDICE DEL ENSAYO:",
    ...allChapters.map(linea),
    "",
    "ÍNDICE DE CUENTOS:",
    ...cuentosList.map(linea),
    "",
    "ÍNDICE DE POEMAS:",
    ...poemasList.map(linea),
    "",
    "RECONSTRUCCIÓN:",
    ...reconstruccionChapters.map(linea),
  ].join("\n");
}

let cacheCompleta: string | null = null;
let cacheEsencial: string | null = null;

/** Ensambla el texto de la obra que se entrega a Gemini como contexto. */
export function construirContexto(modo: ModoContexto = "completa"): string {
  if (modo === "completa" && cacheCompleta) return cacheCompleta;
  if (modo === "esencial" && cacheEsencial) return cacheEsencial;

  let cuerpo: string;
  if (modo === "completa") {
    cuerpo = [
      "=== ENSAYO: EL HORIZONTE INTERIOR ===",
      ...allChapters.map(formatearCapitulo),
      "",
      "=== CUENTOS: HISTORIAS DESDE EL EXTERIOR ===",
      ...cuentosList.map(formatearCapitulo),
      "",
      "=== POEMAS ===",
      ...poemasList.map(formatearCapitulo),
      "",
      "=== RECONSTRUCCIÓN ===",
      ...reconstruccionChapters.map(formatearCapitulo),
    ].join("\n\n");
  } else {
    // Modo barato/rápido: aperturas, cierres, glosario, tabla de
    // equivalencias y el índice completo de títulos para poder remitir.
    const idsEsenciales = new Set([
      "cap0",
      "prologo",
      "cap6_6", // tabla de equivalencias
      "cap19_real", // lo que la hipótesis no puede decir
      "cap_epilogo_real",
      "cap_nota_autor",
      "cap_glosario",
    ]);
    const esenciales = allChapters.filter((c) => idsEsenciales.has(c.id));
    const notaArchivista = cuentosList.find((c) => c.id === "cuento0");
    cuerpo = [
      "=== SELECCIÓN ESENCIAL DE LA OBRA ===",
      ...esenciales.map(formatearCapitulo),
      notaArchivista ? formatearCapitulo(notaArchivista) : "",
      "",
      indiceDeTitulos(),
      "",
      "(Contexto reducido: dispones de las piezas esenciales y del índice completo. " +
        "Si la pregunta exige un capítulo que no tienes delante, dilo y remite a él por su título.)",
    ].join("\n\n");
  }

  const contexto =
    "A continuación se te entrega el texto de la obra. Es tu materia prima.\n\n" +
    cuerpo;

  if (modo === "completa") cacheCompleta = contexto;
  else cacheEsencial = contexto;
  return contexto;
}

/** Estimación grosera de tokens (≈ 4 caracteres por token). */
export function estimarTokens(modo: ModoContexto = "completa"): number {
  return Math.round(construirContexto(modo).length / 4);
}

// ---------------------------------------------------------------------------
// Clave de API
// ---------------------------------------------------------------------------

const CLAVE_LS = "hi:gemini_key";

export function claveGuardada(): string | null {
  try {
    return localStorage.getItem(CLAVE_LS);
  } catch {
    return null;
  }
}

export function guardarClave(clave: string): void {
  try {
    if (clave) localStorage.setItem(CLAVE_LS, clave);
    else localStorage.removeItem(CLAVE_LS);
  } catch {
    /* almacenamiento no disponible */
  }
}

function resolverClave(explicita?: string): string | null {
  if (explicita) return explicita;
  const env = (import.meta as unknown as { env?: Record<string, string> }).env;
  if (env && env.VITE_GEMINI_API_KEY) return env.VITE_GEMINI_API_KEY;
  return claveGuardada();
}

// ---------------------------------------------------------------------------
// Preferencias de diálogos (modelo y contexto), compartidas entre la rueda de
// configuración global y la sección de Diálogos
// ---------------------------------------------------------------------------

const MODELO_LS = "hi:gemini_modelo";
const CONTEXTO_LS = "hi:dialogos_contexto";

export const MODELO_POR_DEFECTO = "gemini-3.6-flash";

export function modeloGuardado(): string {
  try {
    return localStorage.getItem(MODELO_LS) || MODELO_POR_DEFECTO;
  } catch {
    return MODELO_POR_DEFECTO;
  }
}

export function guardarModelo(modelo: string): void {
  try {
    if (modelo) localStorage.setItem(MODELO_LS, modelo);
    else localStorage.removeItem(MODELO_LS);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function contextoGuardado(): ModoContexto {
  try {
    const v = localStorage.getItem(CONTEXTO_LS);
    return v === "esencial" ? "esencial" : "completa";
  } catch {
    return "completa";
  }
}

export function guardarContexto(modo: ModoContexto): void {
  try {
    localStorage.setItem(CONTEXTO_LS, modo);
  } catch {
    /* almacenamiento no disponible */
  }
}

// ---------------------------------------------------------------------------
// Llamada a Gemini
// ---------------------------------------------------------------------------

interface GeminiPart {
  text?: string;
}
interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: { web?: { uri?: string; title?: string } }[];
  };
  finishReason?: string;
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { code?: number; message?: string };
}

export async function preguntarAlHorizonte(
  pregunta: string,
  opciones: OpcionesPregunta = {}
): Promise<RespuestaHorizonte> {
  const clave = resolverClave(opciones.apiKey);
  if (!clave) {
    throw new Error(
      "Falta la clave de API de Gemini. Introdúcela en la configuración " +
        "o define VITE_GEMINI_API_KEY."
    );
  }
  const modelo = opciones.modelo || modeloGuardado();
  const contexto = construirContexto(opciones.modoContexto || contextoGuardado());

  const cuerpo = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT_HORIZONTE }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: contexto },
          { text: "PREGUNTA DEL VISITANTE:\n\n" + pregunta.trim() },
        ],
      },
    ],
    tools: [{ google_search: {} }],
    generationConfig: {
      // Los modelos Gemini 3 están optimizados para temperature 1.0 (valores
      // bajos degradan la respuesta) y no aceptan thinkingBudget (parámetro de
      // la generación 2.5). thinkingLevel "low" mantiene la latencia baja.
      temperature: opciones.temperatura ?? 1.0,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingLevel: "low" },
    },
  };

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": clave,
        },
        body: JSON.stringify(cuerpo),
      }
    );
  } catch {
    throw new Error("No hay conexión con la API de Gemini. Comprueba la red.");
  }

  const datos = (await res.json().catch(() => ({}))) as GeminiResponse;

  if (!res.ok) {
    const msg = datos.error?.message || `HTTP ${res.status}`;
    if (res.status === 400 || res.status === 403) {
      throw new Error("La API rechazó la clave o la petición: " + msg);
    }
    if (res.status === 429) {
      throw new Error("Límite de peticiones alcanzado. Espera un momento y vuelve a intentarlo.");
    }
    throw new Error("Error de la API de Gemini: " + msg);
  }

  const candidato = datos.candidates?.[0];
  const texto = (candidato?.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();

  if (!texto) {
    throw new Error(
      "El modelo no devolvió texto" +
        (candidato?.finishReason ? ` (motivo: ${candidato.finishReason})` : "") +
        "."
    );
  }

  const vistos = new Set<string>();
  const fuentes: FuenteWeb[] = [];
  for (const ch of candidato?.groundingMetadata?.groundingChunks || []) {
    const uri = ch.web?.uri;
    if (uri && !vistos.has(uri)) {
      vistos.add(uri);
      fuentes.push({ uri, titulo: ch.web?.title || uri });
    }
  }

  return {
    respuesta: texto,
    fuentes,
    busquedas: candidato?.groundingMetadata?.webSearchQueries || [],
    modelo,
  };
}
