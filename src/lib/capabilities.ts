/**
 * Lo que la aplicación necesita del dispositivo, su estado y cómo pedirlo.
 *
 * Solo el micrófono pide permiso al sistema; el resto son comprobaciones de
 * disponibilidad. No se usa cámara ni ubicación, y no debería añadirse ninguna
 * sin una necesidad real: la ausencia de esos permisos es parte de lo que se le
 * promete a la familia (ver docs/PRIVACY.md).
 */

export type CapabilityId = "microphone" | "sound" | "voice" | "storage";

/** `prompt` = se puede pedir; `blocked` = lo denegó el sistema y hay que ir a ajustes. */
export type CapabilityState = "active" | "prompt" | "blocked" | "unsupported" | "checking";

export interface Capability {
  id: CapabilityId;
  icon: string;
  title: string;
  /** Para qué se usa, en lenguaje de familia. */
  purpose: string;
  /** Qué deja de funcionar si falta. */
  missing: string;
  /** Si requiere permiso del sistema operativo. */
  needsPermission: boolean;
  /** Si la aplicación sigue siendo útil sin esto. */
  optional: boolean;
}

export const CAPABILITIES: readonly Capability[] = [
  {
    id: "microphone",
    icon: "🎤",
    title: "Micrófono",
    purpose: "Escuchar la guitarra para el afinador, el desafío de oído y «Tocar conmigo».",
    missing: "Las lecciones, el metrónomo y las canciones siguen funcionando; no se podrá comprobar la afinación.",
    needsPermission: true,
    optional: true
  },
  {
    id: "sound",
    icon: "🔊",
    title: "Sonido",
    purpose: "Reproducir las notas de referencia, el metrónomo y las canciones con guitarra real.",
    missing: "No se escuchará ninguna nota ni el pulso del metrónomo.",
    needsPermission: false,
    optional: false
  },
  {
    id: "voice",
    icon: "🗣️",
    title: "Voz del dispositivo",
    purpose: "Leer en voz alta las instrucciones de cada paso de la lección.",
    missing: "Las instrucciones se leen en pantalla; no se escucharán.",
    needsPermission: false,
    optional: true
  },
  {
    id: "storage",
    icon: "💾",
    title: "Guardado local",
    purpose: "Conservar el progreso, la racha y las insignias en este dispositivo.",
    missing: "El progreso se perderá al cerrar la aplicación.",
    needsPermission: false,
    optional: false
  }
] as const;

export type CapabilityStates = Record<CapabilityId, CapabilityState>;

export const INITIAL_STATES: CapabilityStates = {
  microphone: "checking",
  sound: "checking",
  voice: "checking",
  storage: "checking"
};

export function isActive(state: CapabilityState): boolean {
  return state === "active";
}

/**
 * Solo `blocked` y `unsupported` significan que algo no va a funcionar.
 * `prompt` es «disponible, aún sin usar» —el audio espera el primer gesto— y
 * `checking` es transitorio: avisar en esos casos sería una alarma en falso.
 */
export function isUnavailable(state: CapabilityState): boolean {
  return state === "blocked" || state === "unsupported";
}

export function stateLabel(state: CapabilityState): string {
  switch (state) {
    case "active": return "Activo";
    case "prompt": return "Sin activar";
    case "blocked": return "Bloqueado";
    case "unsupported": return "No disponible";
    default: return "Comprobando…";
  }
}

/** Texto de ayuda: qué puede hacer la familia con este estado. */
export function stateAdvice(capability: Capability, state: CapabilityState): string {
  switch (state) {
    case "active":
      return capability.purpose;
    case "prompt":
      return capability.needsPermission
        ? "Pulsa «Activar» y acepta el aviso del sistema."
        : "Aún no se ha usado en esta sesión.";
    case "blocked":
      return "El sistema lo tiene denegado. Cámbialo en los ajustes del dispositivo para esta aplicación.";
    case "unsupported":
      return `Este dispositivo o navegador no lo admite. ${capability.missing}`;
    default:
      return "Comprobando el estado…";
  }
}

export interface CapabilitySummary {
  active: number;
  total: number;
  /** Faltan y no son opcionales: la experiencia queda incompleta. */
  essentialMissing: CapabilityId[];
  ready: boolean;
}

export function summarize(states: CapabilityStates): CapabilitySummary {
  const active = CAPABILITIES.filter((item) => isActive(states[item.id]));
  const essentialMissing = CAPABILITIES
    .filter((item) => !item.optional && isUnavailable(states[item.id]))
    .map((item) => item.id);

  return {
    active: active.length,
    total: CAPABILITIES.length,
    essentialMissing,
    ready: essentialMissing.length === 0
  };
}

// --- Comprobaciones del dispositivo -----------------------------------------
// Todas devuelven un estado en vez de lanzar: un dispositivo que no admite algo
// no es un error, es información que la familia necesita ver.

export function detectStorage(): CapabilityState {
  try {
    const probe = "guitarra-adventure-probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return "active";
  } catch {
    return "unsupported";
  }
}

export function detectVoice(): CapabilityState {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return "unsupported";
  // Chrome devuelve la lista vacía hasta que dispara `voiceschanged`.
  return window.speechSynthesis.getVoices().length > 0 ? "active" : "prompt";
}

export function detectSound(audioState: string): CapabilityState {
  if (audioState === "unsupported") return "unsupported";
  // `idle` = todavía no se ha creado el contexto; `suspended` = espera un gesto.
  // En ambos casos el sonido está disponible, solo falta la primera interacción.
  return audioState === "running" ? "active" : "prompt";
}

export async function readMicrophoneState(): Promise<CapabilityState> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    if (status.state === "granted") return "active";
    return status.state === "denied" ? "blocked" : "prompt";
  } catch {
    // Firefox y algunas WebView no exponen el permiso de micrófono: no se puede
    // saber sin pedirlo, así que se ofrece activarlo.
    return "prompt";
  }
}

/**
 * Pide el permiso y suelta el micrófono de inmediato: aquí solo interesa la
 * autorización, no capturar audio. Dejar el flujo abierto encendería el
 * indicador de grabación del sistema sin motivo.
 */
export async function requestMicrophone(): Promise<CapabilityState> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return "active";
  } catch (error) {
    const name = (error as { name?: string }).name;
    if (name === "NotFoundError" || name === "OverconstrainedError") return "unsupported";
    return name === "NotAllowedError" || name === "SecurityError" ? "blocked" : "prompt";
  }
}
