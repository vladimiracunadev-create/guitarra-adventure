/**
 * Planificador de metrónomo con anticipación sobre el reloj de Web Audio.
 *
 * `setInterval` no sirve para marcar el pulso: acumula deriva y el navegador lo
 * estrangula cuando la pantalla se atenúa o la aplicación pasa a segundo plano.
 * Aquí el temporizador solo despierta al planificador cada `LOOKAHEAD_MS`; los
 * clics se agendan por adelantado sobre `AudioContext.currentTime`, que es
 * exacto a nivel de muestra. El pulso se mantiene en rejilla aunque el
 * temporizador llegue tarde.
 */

export type Subdivision = 1 | 2;

export interface MetronomeSettings {
  bpm: number;
  /** Pulsos por compás. */
  beats: number;
  subdivision: Subdivision;
}

export interface MetronomeTick {
  /** Posición absoluta desde el arranque del pulso. */
  index: number;
  /** Instante exacto en el reloj de audio, en segundos. */
  time: number;
  /** Pulso dentro del compás, de 1 a `beats`. */
  beat: number;
  /** Primer pulso del compás y no una subdivisión: se acentúa. */
  accent: boolean;
  /** `false` en las corcheas a contratiempo. */
  onBeat: boolean;
}

export interface MetronomeRuntime {
  /** Reloj de audio, en segundos. */
  now: () => number;
  /** Agenda el clic para `tick.time`; debe ser síncrona y no bloquear. */
  scheduleTick: (tick: MetronomeTick) => void;
}

/** Cada cuánto despierta el temporizador para rellenar el horizonte. */
export const LOOKAHEAD_MS = 25;
/** Cuánto audio se deja agendado por delante del instante actual. */
export const SCHEDULE_AHEAD_SECONDS = 0.12;
/** Margen antes del primer clic para que el primer compás no llegue cortado. */
const FIRST_TICK_DELAY_SECONDS = 0.06;
/** Tope de clics pendientes de animar cuando la pestaña está oculta. */
const MAX_PENDING_VISUALS = 64;

export function secondsPerTick(bpm: number, subdivision: Subdivision): number {
  return 60 / Math.max(1, bpm) / subdivision;
}

export function describeTick(index: number, beats: number, subdivision: Subdivision): Omit<MetronomeTick, "time"> {
  const onBeat = index % subdivision === 0;
  const beat = (Math.floor(index / subdivision) % Math.max(1, beats)) + 1;
  return { index, beat, accent: onBeat && beat === 1, onBeat };
}

export class MetronomeScheduler {
  private settings: MetronomeSettings;
  private nextTickTime = 0;
  private tickIndex = 0;
  private pending: MetronomeTick[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly runtime: MetronomeRuntime, settings: MetronomeSettings) {
    this.settings = { ...settings };
  }

  get running(): boolean {
    return this.timer !== null;
  }

  /**
   * Fija el instante del primer clic y reinicia el compás. `start()` lo hace
   * sobre el reloj de audio; se expone aparte para planificar contra otro reloj.
   */
  anchor(time: number): void {
    this.nextTickTime = time;
    this.tickIndex = 0;
    this.pending = [];
  }

  start(): void {
    if (this.timer !== null) return;
    this.anchor(this.runtime.now() + FIRST_TICK_DELAY_SECONDS);
    this.pump();
    this.timer = setInterval(() => this.pump(), LOOKAHEAD_MS);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.pending = [];
  }

  /**
   * El cambio de tempo se aplica desde el clic siguiente y conserva la posición
   * dentro del compás. Cambiar la métrica reordena los pulsos, así que el
   * compás vuelve a empezar.
   */
  update(next: Partial<MetronomeSettings>): void {
    const previous = this.settings;
    this.settings = { ...previous, ...next };
    if (this.settings.beats !== previous.beats || this.settings.subdivision !== previous.subdivision) {
      this.tickIndex = 0;
    }
  }

  /** Agenda todos los clics que caen dentro del horizonte de anticipación. */
  pump(): MetronomeTick[] {
    const horizon = this.runtime.now() + SCHEDULE_AHEAD_SECONDS;
    const scheduled: MetronomeTick[] = [];

    while (this.nextTickTime <= horizon) {
      const tick: MetronomeTick = {
        ...describeTick(this.tickIndex, this.settings.beats, this.settings.subdivision),
        time: this.nextTickTime
      };
      this.runtime.scheduleTick(tick);
      scheduled.push(tick);
      this.pending.push(tick);
      this.nextTickTime += secondsPerTick(this.settings.bpm, this.settings.subdivision);
      this.tickIndex += 1;
    }

    if (this.pending.length > MAX_PENDING_VISUALS) {
      this.pending.splice(0, this.pending.length - MAX_PENDING_VISUALS);
    }
    return scheduled;
  }

  /** Devuelve los clics que ya sonaron, para sincronizar la animación. */
  drainDue(): MetronomeTick[] {
    const now = this.runtime.now();
    let count = 0;
    while (count < this.pending.length && this.pending[count].time <= now) count += 1;
    return count === 0 ? [] : this.pending.splice(0, count);
  }
}
