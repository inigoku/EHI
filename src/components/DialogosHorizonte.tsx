// DialogosHorizonte.tsx — Sección "Diálogos con el Horizonte".
// Uso:   <DialogosHorizonte />
//        <DialogosHorizonte modoExposicion />   (oculta configuración,
//        exportación y borrado: para el quiosco de la exposición)

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  preguntarAlHorizonte,
  claveGuardada,
  modeloGuardado,
  contextoGuardado,
} from "./horizonte";
import {
  cargarEntradasLocales,
  guardarEntradasLocales,
  nuevaEntrada,
  todasLasEntradas,
  type DialogoEntrada,
} from "./dialogos";
import "./DialogosHorizonte.css";

const FRASES_ESPERA = [
  "El Horizonte integra la pregunta…",
  "El agua tarda lo que tarda…",
  "Buscando en la orilla…",
  "Precisión en la duda…",
];

function fechaLegible(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function Parrafos({ texto }: { texto: string }) {
  return (
    <>
      {texto
        .split(/\n{2,}/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i}>{p.trim()}</p>
        ))}
    </>
  );
}

export interface DialogosHorizonteProps {
  modoExposicion?: boolean;
  apiKey?: string;
}

export default function DialogosHorizonte({
  modoExposicion = false,
  apiKey,
}: DialogosHorizonteProps) {
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [fraseIdx, setFraseIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [entradas, setEntradas] = useState<DialogoEntrada[]>(() =>
    todasLasEntradas()
  );
  const [abierta, setAbierta] = useState<string | null>(null);
  // La clave, el modelo y el contexto se configuran desde la rueda de ajustes
  // global (DialogosSettings); aquí solo se leen al preguntar.
  const respuestaRef = useRef<HTMLDivElement>(null);

  const ultima = entradas.length > 0 ? entradas[0] : null;

  useEffect(() => {
    if (!cargando) return;
    const t = setInterval(
      () => setFraseIdx((i) => (i + 1) % FRASES_ESPERA.length),
      3500
    );
    return () => clearInterval(t);
  }, [cargando]);

  async function enviar() {
    const q = pregunta.trim();
    if (!q || cargando) return;
    setError(null);
    setCargando(true);
    setFraseIdx(0);
    try {
      const r = await preguntarAlHorizonte(q, {
        apiKey: apiKey || claveGuardada() || undefined,
        modelo: modeloGuardado(),
        modoContexto: contextoGuardado(),
      });
      const entrada = nuevaEntrada({
        pregunta: q,
        respuesta: r.respuesta,
        fuentes: r.fuentes,
        modelo: r.modelo,
      });
      const locales = [entrada, ...cargarEntradasLocales()];
      guardarEntradasLocales(locales);
      setEntradas(todasLasEntradas());
      setAbierta(entrada.id);
      setPregunta("");
      respuestaRef.current?.scrollIntoView({ block: "nearest" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCargando(false);
    }
  }

  function borrar(id: string) {
    const locales = cargarEntradasLocales().filter((e) => e.id !== id);
    guardarEntradasLocales(locales);
    setEntradas(todasLasEntradas());
    if (abierta === id) setAbierta(null);
  }

  function alTeclear(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <section className="dh" aria-labelledby="dh-titulo">
      <header className="dh-cabecera">
        <p className="dh-eyebrow">Bitácora</p>
        <h2 id="dh-titulo">Diálogos con el Horizonte</h2>
        <p className="dh-intro">
          Haz una pregunta. El Horizonte responde desde el texto de la obra y,
          cuando hace falta, sale a buscar fuera. Cada diálogo queda anotado en
          la bitácora.
        </p>
      </header>

      <div className="dh-linea" data-viva={cargando || undefined} aria-hidden="true" />

      <div className="dh-formulario">
        <label className="dh-label" htmlFor="dh-pregunta">
          Tu pregunta
        </label>
        <textarea
          id="dh-pregunta"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          onKeyDown={alTeclear}
          rows={3}
          placeholder="¿Qué le preguntarías al Horizonte?"
          disabled={cargando}
        />
        <div className="dh-acciones">
          <button
            className="dh-boton"
            onClick={enviar}
            disabled={cargando || !pregunta.trim()}
          >
            {cargando ? "El Horizonte piensa…" : "Preguntar al Horizonte"}
          </button>
          {cargando && (
            <span className="dh-espera" role="status">
              {FRASES_ESPERA[fraseIdx]}
            </span>
          )}
        </div>
        {error && (
          <p className="dh-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {ultima && (
        <article className="dh-respuesta" ref={respuestaRef}>
          <p className="dh-pregunta-eco">«{ultima.pregunta}»</p>
          <div className="dh-texto">
            <Parrafos texto={ultima.respuesta} />
          </div>
          {ultima.fuentes.length > 0 && (
            <div className="dh-fuentes">
              <span className="dh-fuentes-titulo">Fuentes consultadas</span>
              <ul>
                {ultima.fuentes.map((f) => (
                  <li key={f.uri}>
                    <a href={f.uri} target="_blank" rel="noopener noreferrer">
                      {f.titulo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="dh-meta">
            {fechaLegible(ultima.fecha)} · {ultima.modelo}
          </p>
        </article>
      )}

      {entradas.length > 1 && (
        <div className="dh-bitacora">
          <h3>Entradas anteriores</h3>
          <ul className="dh-lista">
            {entradas.slice(1).map((e) => (
              <li key={e.id} className="dh-entrada">
                <button
                  className="dh-entrada-cab"
                  onClick={() => setAbierta(abierta === e.id ? null : e.id)}
                  aria-expanded={abierta === e.id}
                >
                  <span className="dh-entrada-fecha">
                    {fechaLegible(e.fecha)}
                  </span>
                  <span className="dh-entrada-pregunta">{e.pregunta}</span>
                </button>
                {abierta === e.id && (
                  <div className="dh-entrada-cuerpo">
                    <div className="dh-texto">
                      <Parrafos texto={e.respuesta} />
                    </div>
                    {e.fuentes.length > 0 && (
                      <div className="dh-fuentes">
                        <span className="dh-fuentes-titulo">
                          Fuentes consultadas
                        </span>
                        <ul>
                          {e.fuentes.map((f) => (
                            <li key={f.uri}>
                              <a
                                href={f.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {f.titulo}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!modoExposicion && (
                      <button
                        className="dh-borrar"
                        onClick={() => borrar(e.id)}
                      >
                        Borrar entrada
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!modoExposicion && (
        <p className="dh-nota" style={{ textAlign: "center" }}>
          La configuración (clave de API, modelo y exportación) está en la rueda
          de ajustes de la barra superior.
        </p>
      )}
    </section>
  );
}
