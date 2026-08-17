import { CAPABILITIES, isActive, stateLabel, type CapabilityStates } from "../lib/capabilities";

const MARK: Record<string, string> = { active: "✓", prompt: "!", blocked: "✗", unsupported: "✗", checking: "…" };

/**
 * Indicadores siempre visibles en la barra superior. Pulsarlos lleva al panel
 * donde se gestionan, para que el estado no sea solo informativo.
 */
export function CapabilityChips({ states, onManage }: { states: CapabilityStates; onManage: () => void }) {
  return (
    <div className="capability-chips" aria-label="Estado del dispositivo">
      {CAPABILITIES.map((capability) => {
        const state = states[capability.id];
        return (
          <button
            key={capability.id}
            type="button"
            className={`capability-chip is-${state}`}
            onClick={onManage}
            title={`${capability.title}: ${stateLabel(state)}`}
            aria-label={`${capability.title}: ${stateLabel(state)}. Abrir la configuración del dispositivo.`}
          >
            <span aria-hidden="true">{capability.icon}</span>
            <span className="capability-mark" aria-hidden="true">{MARK[state]}</span>
            <span className="visually-hidden">{isActive(state) ? "activo" : stateLabel(state)}</span>
          </button>
        );
      })}
    </div>
  );
}
