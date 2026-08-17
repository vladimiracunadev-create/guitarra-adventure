import { useState } from "react";
import {
  CAPABILITIES,
  stateAdvice,
  stateLabel,
  summarize,
  type CapabilityStates,
  type CapabilityState
} from "../lib/capabilities";

/**
 * Gestión de los requisitos del dispositivo, dentro del panel familiar.
 *
 * Un permiso del sistema no se puede retirar desde la aplicación, así que aquí
 * se puede pedir, volver a comprobar y —cuando el sistema lo tiene denegado—
 * se explica dónde cambiarlo. El interruptor de micrófono es de la aplicación:
 * apagarlo evita que se pida y desactiva las funciones que lo usan.
 */
export function CapabilityPanel({ states, microphoneEnabled, onToggleMicrophone, onRequest, onRefresh }: {
  states: CapabilityStates;
  microphoneEnabled: boolean;
  onToggleMicrophone: (value: boolean) => void;
  onRequest: () => Promise<CapabilityState>;
  onRefresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const summary = summarize(states);

  async function activate() {
    setBusy(true);
    const state = await onRequest();
    setBusy(false);
    setMessage(state === "active"
      ? "Micrófono activado."
      : state === "blocked"
        ? "El sistema denegó el micrófono. Actívalo en los ajustes del dispositivo para esta aplicación."
        : "No se pudo activar el micrófono.");
  }

  return (
    <article className="card capability-card">
      <span className="eyebrow">DISPOSITIVO</span>
      <h2>Requisitos y permisos</h2>
      <p>
        {summary.ready
          ? `Todo lo necesario está disponible (${summary.active} de ${summary.total} activos).`
          : "Falta algo necesario para que la aplicación funcione completa."}
      </p>

      <ul className="capability-list">
        {CAPABILITIES.map((capability) => {
          const state = states[capability.id];
          return (
            <li key={capability.id} className={`capability-row is-${state}`}>
              <span className="capability-icon" aria-hidden="true">{capability.icon}</span>
              <div className="capability-text">
                <strong>
                  {capability.title}
                  {capability.optional && <em className="capability-optional"> · opcional</em>}
                </strong>
                <span className={`capability-state is-${state}`}>{stateLabel(state)}</span>
                <small>{stateAdvice(capability, state)}</small>
              </div>
              {capability.id === "microphone" && state !== "active" && state !== "unsupported" && (
                <button className="secondary-button" onClick={() => void activate()} disabled={busy || !microphoneEnabled}>
                  {busy ? "Pidiendo…" : "Activar"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <label className="capability-toggle">
        <input
          type="checkbox"
          checked={microphoneEnabled}
          onChange={(event: { target: HTMLInputElement }) => onToggleMicrophone(event.target.checked)}
        />
        <span>
          <strong>Usar el micrófono en esta aplicación</strong>
          <small>Al apagarlo, el afinador y «Tocar conmigo» quedan desactivados y no se vuelve a pedir permiso.</small>
        </span>
      </label>

      {message && <p className="capability-message" role="status">{message}</p>}

      <div className="capability-actions">
        <button className="secondary-button" onClick={() => void onRefresh()}>Volver a comprobar</button>
      </div>

      <aside className="safety-box">
        🛡️ La aplicación no usa cámara ni ubicación. El audio del micrófono se analiza en el momento y nunca se graba ni se envía.
      </aside>
    </article>
  );
}
