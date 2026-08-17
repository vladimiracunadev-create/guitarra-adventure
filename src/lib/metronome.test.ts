import { describe, expect, it } from "vitest";
import { describeTick, MetronomeScheduler, secondsPerTick, type MetronomeTick } from "./metronome";

function fakeClock() {
  const state = { time: 0, scheduled: [] as MetronomeTick[] };
  return {
    state,
    runtime: {
      now: () => state.time,
      scheduleTick: (tick: MetronomeTick) => { state.scheduled.push(tick); }
    }
  };
}

describe("descripción del pulso", () => {
  it("acentúa solo el primer pulso del compás", () => {
    const beats = [0, 1, 2, 3, 4].map((index) => describeTick(index, 4, 1));
    expect(beats.map((tick) => tick.beat)).toEqual([1, 2, 3, 4, 1]);
    expect(beats.map((tick) => tick.accent)).toEqual([true, false, false, false, true]);
  });

  it("marca las corcheas a contratiempo sin acentuarlas", () => {
    const ticks = [0, 1, 2, 3].map((index) => describeTick(index, 2, 2));
    expect(ticks.map((tick) => tick.beat)).toEqual([1, 1, 2, 2]);
    expect(ticks.map((tick) => tick.onBeat)).toEqual([true, false, true, false]);
    expect(ticks.map((tick) => tick.accent)).toEqual([true, false, false, false]);
  });

  it("calcula la duración del clic según tempo y subdivisión", () => {
    expect(secondsPerTick(120, 1)).toBeCloseTo(0.5, 12);
    expect(secondsPerTick(120, 2)).toBeCloseTo(0.25, 12);
  });
});

describe("planificador del metrónomo", () => {
  it("mantiene la rejilla exacta aunque el temporizador despierte con retraso", () => {
    const { state, runtime } = fakeClock();
    const scheduler = new MetronomeScheduler(runtime, { bpm: 120, beats: 4, subdivision: 1 });
    scheduler.anchor(0);

    // Simula un `setInterval` con jitter (de 20 a 86 ms) durante un minuto.
    for (let wakeup = 0; state.time < 60; wakeup += 1) {
      scheduler.pump();
      state.time += 0.02 + (wakeup % 7) * 0.011;
    }

    expect(state.scheduled.length).toBeGreaterThan(100);
    state.scheduled.forEach((tick, index) => {
      expect(tick.time).toBeCloseTo(index * 0.5, 9);
    });
  });

  it("no agenda más allá del horizonte de anticipación", () => {
    const { state, runtime } = fakeClock();
    const scheduler = new MetronomeScheduler(runtime, { bpm: 120, beats: 4, subdivision: 1 });
    scheduler.anchor(0);
    scheduler.pump();

    // A 120 BPM y con 0,12 s de horizonte solo cabe el clic del instante 0.
    expect(state.scheduled).toHaveLength(1);
    expect(state.scheduled[0].time).toBe(0);
  });

  it("aplica el cambio de tempo conservando la posición del compás", () => {
    const { state, runtime } = fakeClock();
    const scheduler = new MetronomeScheduler(runtime, { bpm: 60, beats: 4, subdivision: 1 });
    scheduler.anchor(0);
    scheduler.pump();
    state.time = 1;
    scheduler.pump();

    scheduler.update({ bpm: 120 });
    state.time = 2;
    scheduler.pump();
    state.time = 2.5;
    scheduler.pump();

    expect(state.scheduled.map((tick) => tick.beat)).toEqual([1, 2, 3, 4]);
    expect(state.scheduled.map((tick) => tick.time)).toEqual([0, 1, 2, 2.5]);
  });

  it("reinicia el compás al cambiar la métrica", () => {
    const { state, runtime } = fakeClock();
    const scheduler = new MetronomeScheduler(runtime, { bpm: 60, beats: 4, subdivision: 1 });
    scheduler.anchor(0);
    scheduler.pump();
    state.time = 1;
    scheduler.pump();
    expect(state.scheduled.map((tick) => tick.beat)).toEqual([1, 2]);

    scheduler.update({ beats: 3 });
    state.time = 2;
    scheduler.pump();
    expect(state.scheduled.at(-1)?.beat).toBe(1);
  });

  it("entrega a la animación solo los clics que ya sonaron", () => {
    const { state, runtime } = fakeClock();
    const scheduler = new MetronomeScheduler(runtime, { bpm: 120, beats: 4, subdivision: 1 });
    scheduler.anchor(0.1);
    scheduler.pump();

    // El clic ya está agendado en el audio, pero todavía no ha sonado.
    expect(state.scheduled.map((tick) => tick.time)).toEqual([0.1]);
    expect(scheduler.drainDue()).toHaveLength(0);

    state.time = 0.1;
    expect(scheduler.drainDue().map((tick) => tick.time)).toEqual([0.1]);
    expect(scheduler.drainDue()).toHaveLength(0);
  });

  it("no deja clics pendientes tras detenerse", () => {
    const { state, runtime } = fakeClock();
    const scheduler = new MetronomeScheduler(runtime, { bpm: 120, beats: 4, subdivision: 1 });
    scheduler.anchor(0);
    scheduler.pump();
    scheduler.stop();
    state.time = 10;
    expect(scheduler.drainDue()).toHaveLength(0);
    expect(scheduler.running).toBe(false);
  });
});
