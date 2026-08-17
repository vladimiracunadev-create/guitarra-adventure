import { describe, expect, it } from "vitest";
import {
  CAPABILITIES,
  detectSound,
  isActive,
  stateAdvice,
  stateLabel,
  summarize,
  type CapabilityStates
} from "./capabilities";

const allActive: CapabilityStates = { microphone: "active", sound: "active", voice: "active", storage: "active" };

describe("inventario de requisitos", () => {
  it("no declara cámara ni ubicación", () => {
    const ids = CAPABILITIES.map((item) => item.id);
    expect(ids).toEqual(["microphone", "sound", "voice", "storage"]);
  });

  it("solo el micrófono pide permiso al sistema", () => {
    const conPermiso = CAPABILITIES.filter((item) => item.needsPermission).map((item) => item.id);
    expect(conPermiso).toEqual(["microphone"]);
  });

  it("describe para qué sirve y qué se pierde en cada uno", () => {
    for (const capability of CAPABILITIES) {
      expect(capability.purpose.length).toBeGreaterThan(10);
      expect(capability.missing.length).toBeGreaterThan(10);
    }
  });
});

describe("resumen de estado", () => {
  it("marca todo listo cuando lo esencial está activo", () => {
    expect(summarize(allActive)).toEqual({ active: 4, total: 4, essentialMissing: [], ready: true });
  });

  it("el micrófono ausente no impide usar la aplicación", () => {
    const summary = summarize({ ...allActive, microphone: "blocked" });
    expect(summary.essentialMissing).toEqual([]);
    expect(summary.ready).toBe(true);
    expect(summary.active).toBe(3);
  });

  it("sin sonido ni guardado la experiencia queda incompleta", () => {
    const summary = summarize({ ...allActive, sound: "unsupported", storage: "unsupported" });
    expect(summary.essentialMissing).toEqual(["sound", "storage"]);
    expect(summary.ready).toBe(false);
  });

  it("no da nada por perdido mientras se comprueba", () => {
    const summary = summarize({ microphone: "checking", sound: "checking", voice: "checking", storage: "checking" });
    expect(summary.essentialMissing).toEqual([]);
    expect(summary.ready).toBe(true);
  });

  it("el sonido a la espera del primer gesto no es una carencia", () => {
    // El AudioContext no arranca hasta que hay interacción; avisar aquí sería
    // una alarma en falso nada más abrir la aplicación.
    const summary = summarize({ ...allActive, sound: "prompt" });
    expect(summary.essentialMissing).toEqual([]);
    expect(summary.ready).toBe(true);
  });
});

describe("sonido", () => {
  it("está disponible aunque el contexto espere el primer gesto", () => {
    expect(detectSound("idle")).toBe("prompt");
    expect(detectSound("suspended")).toBe("prompt");
    expect(detectSound("running")).toBe("active");
    expect(detectSound("unsupported")).toBe("unsupported");
  });
});

describe("textos para la familia", () => {
  it("traduce cada estado sin dejar ninguno sin etiqueta", () => {
    for (const state of ["active", "prompt", "blocked", "unsupported", "checking"] as const) {
      expect(stateLabel(state)).not.toBe("");
      expect(isActive(state)).toBe(state === "active");
    }
  });

  it("cuando está bloqueado remite a los ajustes del sistema", () => {
    const microphone = CAPABILITIES[0];
    expect(stateAdvice(microphone, "blocked")).toMatch(/ajustes del dispositivo/i);
  });

  it("cuando se puede pedir, explica qué hacer", () => {
    const microphone = CAPABILITIES[0];
    expect(stateAdvice(microphone, "prompt")).toMatch(/Activar/);
  });
});
