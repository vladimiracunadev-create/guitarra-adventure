import { frequencyToMidi } from "./pitch";

let sharedContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedContext || sharedContext.state === "closed") sharedContext = new AudioContext();
  return sharedContext;
}

/**
 * Estado del audio sin crear un contexto: `idle` es que todavía no hizo falta.
 * Se usa para informar del estado en pantalla sin provocar efectos secundarios.
 */
export function peekAudioState(): "unsupported" | "idle" | AudioContextState {
  if (typeof AudioContext === "undefined") return "unsupported";
  return sharedContext ? sharedContext.state : "idle";
}

export async function ensureAudioReady(): Promise<AudioContext> {
  const context = getAudioContext();
  if (context.state === "suspended") await context.resume();
  return context;
}

// Grabaciones reales de guitarra de nailon (soundfont FluidR3_GM de Frank Wen,
// CC BY 3.0). Para cada nota se guarda su frecuencia real medida —los valores
// salen de `node scripts/measure-samples.mjs`, no de una estimación—, de modo
// que al reproducir se corrige con playbackRate a la frecuencia exacta deseada
// (afinación precisa y calibración A = 432–446 Hz). Ver docs/CONTENT_LICENSES.md.
const GUITAR_SAMPLES: Record<number, { file: string; native: number }> = {
  40: { file: "e2", native: 82.33 },
  45: { file: "a2", native: 110.05 },
  50: { file: "d3", native: 146.81 },
  55: { file: "g3", native: 195.87 },
  57: { file: "a3", native: 219.84 },
  59: { file: "b3", native: 247.06 },
  60: { file: "c4", native: 261.74 },
  62: { file: "d4", native: 293.8 },
  64: { file: "e4", native: 328.9 },
  66: { file: "fs4", native: 369.14 },
  67: { file: "g4", native: 391.1 }
};

const bufferCache = new Map<string, Promise<AudioBuffer>>();

function loadSample(file: string): Promise<AudioBuffer> {
  let pending = bufferCache.get(file);
  if (!pending) {
    pending = (async () => {
      const response = await fetch(`${import.meta.env.BASE_URL}audio/guitarra/${file}.mp3`);
      if (!response.ok) throw new Error(`No se pudo cargar la nota ${file}`);
      return getAudioContext().decodeAudioData(await response.arrayBuffer());
    })();
    pending.catch(() => bufferCache.delete(file));
    bufferCache.set(file, pending);
  }
  return pending;
}

/** Precarga las seis cuerdas al aire para una respuesta inmediata. */
export function preloadGuitarStrings(): void {
  for (const midi of [40, 45, 50, 55, 59, 64]) {
    const sample = GUITAR_SAMPLES[midi];
    if (sample) void loadSample(sample.file).catch(() => undefined);
  }
}

let droneNodes: { oscillators: OscillatorNode[]; gain: GainNode } | null = null;

/**
 * Sostiene la nota indicada para que la niña la iguale de oído.
 *
 * A diferencia de un instrumento de arco, una cuerda pulsada se apaga sola: un
 * bucle sobre la grabación devolvería el ataque una y otra vez y sonaría a
 * repetición, no a nota sostenida. Por eso la referencia larga se sintetiza con
 * osciladores y la grabación real se reserva para la nota suelta.
 */
export async function startDrone(frequency: number): Promise<boolean> {
  stopDrone();
  try {
    const context = await ensureAudioReady();
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.24, now + 0.2);
    gain.connect(context.destination);

    const oscillators = [
      { multiplier: 1, gain: 0.6, type: "triangle" as OscillatorType },
      { multiplier: 2, gain: 0.22, type: "sine" as OscillatorType },
      { multiplier: 3, gain: 0.09, type: "sine" as OscillatorType }
    ].map(({ multiplier, gain: level, type }) => {
      const oscillator = context.createOscillator();
      const partial = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency * multiplier;
      partial.gain.value = level;
      oscillator.connect(partial).connect(gain);
      oscillator.start(now);
      return oscillator;
    });

    droneNodes = { oscillators, gain };
    return true;
  } catch {
    return false;
  }
}

export function stopDrone(): void {
  if (!droneNodes) return;
  const { oscillators, gain } = droneNodes;
  droneNodes = null;
  for (const oscillator of oscillators) {
    try { oscillator.stop(); } catch { /* ya detenido */ }
    oscillator.disconnect();
  }
  gain.disconnect();
}

/**
 * Reproduce una nota con una grabación real de guitarra cuando existe para esa
 * altura; si no, recurre al tono sintetizado. `frequency` fija la altura exacta
 * (respetando la calibración), corrigiendo la afinación nativa de la muestra.
 */
export async function playGuitarTone(frequency: number, seconds = 1.6): Promise<void> {
  const sample = GUITAR_SAMPLES[Math.round(frequencyToMidi(frequency, 440))];
  if (!sample) {
    await playReferenceTone(frequency, seconds);
    return;
  }
  try {
    const context = await ensureAudioReady();
    const buffer = await loadSample(sample.file);
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = frequency / sample.native;
    const gain = context.createGain();
    const release = Math.max(0.06, seconds - 0.28);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.95, now + 0.02);
    gain.gain.setValueAtTime(0.95, now + release);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    source.connect(gain).connect(context.destination);
    source.start(now);
    source.stop(now + seconds + 0.05);
  } catch {
    await playReferenceTone(frequency, seconds);
  }
}

export async function playReferenceTone(frequency: number, seconds = 1.4): Promise<void> {
  const context = await ensureAudioReady();
  const now = context.currentTime;
  const master = context.createGain();
  const harmonics = [
    { multiplier: 1, gain: 0.2 },
    { multiplier: 2, gain: 0.08 },
    { multiplier: 3, gain: 0.035 },
    { multiplier: 4, gain: 0.018 }
  ];

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.9, now + 0.05);
  master.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  master.connect(context.destination);

  harmonics.forEach(({ multiplier, gain }) => {
    const oscillator = context.createOscillator();
    const harmonicGain = context.createGain();
    oscillator.type = multiplier === 1 ? "triangle" : "sine";
    oscillator.frequency.value = frequency * multiplier;
    harmonicGain.gain.value = gain;
    oscillator.connect(harmonicGain).connect(master);
    oscillator.start(now);
    oscillator.stop(now + seconds + 0.06);
  });
}

/**
 * Agenda un clic en un instante exacto del reloj de audio. Es síncrona a
 * propósito: el metrónomo la llama desde su planificador y esperar una promesa
 * introduciría justo el jitter que se quiere evitar.
 */
export function scheduleClick(context: AudioContext, when: number, accent = false): void {
  const time = Math.max(when, context.currentTime);
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.frequency.value = accent ? 1150 : 850;
  oscillator.type = "square";
  gain.gain.setValueAtTime(0.14, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.06);
}

export async function playClick(accent = false): Promise<void> {
  const context = await ensureAudioReady();
  scheduleClick(context, context.currentTime, accent);
}

export function speakInstruction(text: string): boolean {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-CL";
  utterance.rate = 0.88;
  utterance.pitch = 1.05;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
  return true;
}
