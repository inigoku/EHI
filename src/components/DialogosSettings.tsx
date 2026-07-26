import React from "react";
import {
  claveGuardada,
  guardarClave,
  modeloGuardado,
  guardarModelo,
  contextoGuardado,
  guardarContexto,
  estimarTokens,
  type ModoContexto,
} from "./horizonte";
import {
  cargarEntradasLocales,
  todasLasEntradas,
  exportarJSON,
  exportarTS,
} from "./dialogos";
import "./DialogosHorizonte.css";

// Configuración de "Diálogos con el Horizonte" (clave de API, modelo, contexto
// y exportación). Vive en el panel de configuración global (la rueda); los
// valores se guardan en localStorage y los lee DialogosHorizonte al preguntar.
export const DialogosSettings: React.FC = () => {
  const [clave, setClave] = React.useState(() => claveGuardada() || "");
  const [modelo, setModelo] = React.useState(() => modeloGuardado());
  const [modoContexto, setModoContexto] = React.useState<ModoContexto>(() => contextoGuardado());
  const tokens = React.useMemo(() => estimarTokens(modoContexto), [modoContexto]);

  return (
    <div className="dh-config-cuerpo">
      <label>
        Clave de API de Gemini
        <input
          type="password"
          value={clave}
          onChange={(e) => {
            setClave(e.target.value);
            guardarClave(e.target.value.trim());
          }}
          placeholder="Se guarda solo en este navegador"
          autoComplete="off"
        />
      </label>
      <label>
        Modelo
        <select
          value={modelo}
          onChange={(e) => {
            setModelo(e.target.value);
            guardarModelo(e.target.value);
          }}
        >
          <option value="gemini-3.6-flash">gemini-3.6-flash (recomendado)</option>
          <option value="gemini-3.5-flash">gemini-3.5-flash</option>
          <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (más barato)</option>
          <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (máxima calidad)</option>
        </select>
      </label>
      <label>
        Contexto de la obra
        <select
          value={modoContexto}
          onChange={(e) => {
            const v = e.target.value as ModoContexto;
            setModoContexto(v);
            guardarContexto(v);
          }}
        >
          <option value="completa">Obra completa</option>
          <option value="esencial">Esencial (más rápido y barato)</option>
        </select>
      </label>
      <p className="dh-nota">
        Contexto actual: ~{Math.round(tokens / 1000)}k tokens por pregunta.
      </p>
      <div className="dh-export">
        <button className="dh-boton-sec" onClick={() => exportarJSON(todasLasEntradas())}>
          Exportar JSON
        </button>
        <button className="dh-boton-sec" onClick={() => exportarTS(cargarEntradasLocales())}>
          Exportar como TS
        </button>
      </div>
      <p className="dh-nota">
        «Exportar como TS» genera el fragmento para pegar en{" "}
        <code>dialogosGuardados</code> (dialogos.ts) y hacer permanentes las
        entradas de este navegador.
      </p>
    </div>
  );
};
