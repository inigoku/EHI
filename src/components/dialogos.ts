// dialogos.ts — La bitácora de "Diálogos con el Horizonte".
// Cada pregunta+respuesta se guarda como una entrada. Las entradas viven en
// localStorage; las que quieras hacer permanentes se exportan y se pegan en
// el array dialogosGuardados de este archivo (así entran en el repo como el
// resto de la obra).

import type { FuenteWeb } from "./horizonte";

export interface DialogoEntrada {
  id: string;
  fecha: string; // ISO 8601
  pregunta: string;
  respuesta: string;
  fuentes: FuenteWeb[];
  modelo: string;
  destacado?: boolean;
}

// ---------------------------------------------------------------------------
// Entradas permanentes (curadas a mano, viven en el repositorio).
// Para consolidar diálogos de localStorage: botón "Exportar como TS" en la
// sección, y pegar aquí el resultado.
// ---------------------------------------------------------------------------
export const dialogosGuardados: DialogoEntrada[] = [];

// ---------------------------------------------------------------------------
// Persistencia local
// ---------------------------------------------------------------------------

const LS_KEY = "hi:dialogos";

export function cargarEntradasLocales(): DialogoEntrada[] {
  try {
    const bruto = localStorage.getItem(LS_KEY);
    if (!bruto) return [];
    const lista = JSON.parse(bruto) as DialogoEntrada[];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function guardarEntradasLocales(entradas: DialogoEntrada[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entradas));
  } catch {
    /* almacenamiento no disponible o lleno */
  }
}

export function nuevaEntrada(
  datos: Omit<DialogoEntrada, "id" | "fecha">
): DialogoEntrada {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return { id, fecha: new Date().toISOString(), ...datos };
}

/** Permanentes + locales, sin duplicados, de más reciente a más antigua. */
export function todasLasEntradas(): DialogoEntrada[] {
  const locales = cargarEntradasLocales();
  const ids = new Set(locales.map((e) => e.id));
  const permanentes = dialogosGuardados.filter((e) => !ids.has(e.id));
  return [...locales, ...permanentes].sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
  );
}

// ---------------------------------------------------------------------------
// Exportación
// ---------------------------------------------------------------------------

function descargar(nombre: string, contenido: string, tipo: string): void {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportarJSON(entradas: DialogoEntrada[]): void {
  descargar(
    `dialogos-horizonte-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(entradas, null, 2),
    "application/json"
  );
}

/** Genera el fragmento listo para pegar en dialogosGuardados. */
export function exportarTS(entradas: DialogoEntrada[]): void {
  const cuerpo = entradas
    .map((e) => "  " + JSON.stringify(e, null, 2).replace(/\n/g, "\n  "))
    .join(",\n");
  descargar(
    `dialogos-guardados-${new Date().toISOString().slice(0, 10)}.ts`,
    "// Pegar dentro de dialogosGuardados en dialogos.ts\n" +
      "export const nuevasEntradas = [\n" +
      cuerpo +
      "\n];\n",
    "text/plain"
  );
}
