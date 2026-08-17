export const PRACTICE_TIMER_KEY = "guitarra-adventure-practice-timer-v1";

export interface PracticeTimerState {
  version: 1;
  selectedMinutes: number;
  secondsLeft: number;
  running: boolean;
  finished: boolean;
  focus: string;
  endAt?: number;
}

export const defaultPracticeTimer: PracticeTimerState = {
  version: 1,
  selectedMinutes: 10,
  secondsLeft: 600,
  running: false,
  finished: false,
  focus: "Sonido y pulsación"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizePracticeTimer(value: unknown, now = Date.now()): PracticeTimerState {
  if (!isRecord(value)) return { ...defaultPracticeTimer };
  const selectedMinutes = typeof value.selectedMinutes === "number" && [5, 10, 15, 20].includes(value.selectedMinutes)
    ? value.selectedMinutes
    : 10;
  const maximumSeconds = selectedMinutes * 60;
  const storedSeconds = typeof value.secondsLeft === "number" && Number.isFinite(value.secondsLeft)
    ? Math.min(maximumSeconds, Math.max(0, Math.ceil(value.secondsLeft)))
    : maximumSeconds;
  const endAt = typeof value.endAt === "number" && Number.isFinite(value.endAt) ? value.endAt : undefined;
  const wasRunning = value.running === true && endAt !== undefined;
  const remaining = wasRunning ? Math.max(0, Math.ceil((endAt - now) / 1000)) : storedSeconds;
  const finished = value.finished === true || (wasRunning && remaining === 0);
  return {
    version: 1,
    selectedMinutes,
    secondsLeft: remaining,
    running: wasRunning && remaining > 0,
    finished,
    focus: typeof value.focus === "string" && value.focus.trim() ? value.focus.slice(0, 60) : defaultPracticeTimer.focus,
    endAt: wasRunning && remaining > 0 ? endAt : undefined
  };
}

export function loadPracticeTimer(now = Date.now()): PracticeTimerState {
  try {
    const raw = localStorage.getItem(PRACTICE_TIMER_KEY);
    return raw ? normalizePracticeTimer(JSON.parse(raw), now) : { ...defaultPracticeTimer };
  } catch {
    return { ...defaultPracticeTimer };
  }
}

export function savePracticeTimer(timer: PracticeTimerState): void {
  try {
    localStorage.setItem(PRACTICE_TIMER_KEY, JSON.stringify(timer));
  } catch {
    // El temporizador continúa en memoria si el almacenamiento no está disponible.
  }
}

export function clearPracticeTimer(): void {
  try {
    localStorage.removeItem(PRACTICE_TIMER_KEY);
  } catch {
    // Sin acción adicional.
  }
}
