import type { FamilyPinCredential, PracticeSession, ProgressExport, ProgressState } from "../types";

const STORAGE_KEY = "guitarra-adventure-progress-v3";
const PREVIOUS_STORAGE_KEY = "guitarra-adventure-progress-v2";
const LEGACY_STORAGE_KEY = "guitarra-adventure-progress-v1";
const TEMP_STORAGE_KEY = `${STORAGE_KEY}-pending`;
const CURRENT_FORMAT_VERSION = 3;

export const defaultProgress: ProgressState = {
  schemaVersion: 3,
  onboardingCompleted: false,
  completedLessonIds: [],
  practiceSessions: [],
  streak: 0,
  childName: "Guitarrista",
  largeText: false,
  theme: "system",
  soundEnabled: true,
  microphoneEnabled: true,
  weeklyGoalMinutes: 45,
  tunerCalibration: 440,
  pitchChallengesCompleted: 0,
  readingCorrect: 0,
  readingAttempts: 0,
  songsCompleted: 0
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampNumber(value: unknown, fallback: number, minimum: number, maximum: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;
}

function cleanText(value: unknown, fallback: string, maximum: number): string {
  if (typeof value !== "string") return fallback;
  const clean = value.trim().slice(0, maximum);
  return clean || fallback;
}

function normalizeFamilyPin(value: unknown): FamilyPinCredential | undefined {
  if (!isRecord(value)) return undefined;
  if (value.algorithm !== "PBKDF2-SHA-256") return undefined;
  if (typeof value.iterations !== "number" || value.iterations < 50_000 || value.iterations > 1_000_000) return undefined;
  if (typeof value.salt !== "string" || !/^[0-9a-f]{32}$/i.test(value.salt)) return undefined;
  if (typeof value.hash !== "string" || !/^[0-9a-f]{64}$/i.test(value.hash)) return undefined;
  return {
    algorithm: "PBKDF2-SHA-256",
    iterations: Math.round(value.iterations),
    salt: value.salt.toLowerCase(),
    hash: value.hash.toLowerCase()
  };
}

function normalizeSession(value: unknown, index: number): PracticeSession | null {
  if (!isRecord(value)) return null;
  const date = typeof value.date === "string" && !Number.isNaN(Date.parse(value.date))
    ? value.date
    : new Date().toISOString();
  return {
    id: typeof value.id === "string" && value.id.trim() ? value.id.slice(0, 120) : `imported-${date}-${index}`,
    date,
    minutes: Math.round(clampNumber(value.minutes, 5, 1, 180)),
    focus: cleanText(value.focus, "Práctica general", 60),
    note: cleanText(value.note, "", 240)
  };
}

function uniqueSessions(values: unknown[]): PracticeSession[] {
  const sessions = values.map(normalizeSession).filter((session): session is PracticeSession => session !== null).slice(-1000);
  const used = new Set<string>();
  return sessions.map((session, index) => {
    let id = session.id;
    while (used.has(id)) id = `${session.id}-${index}-${used.size}`;
    used.add(id);
    return id === session.id ? session : { ...session, id };
  });
}

export function normalizeProgress(value: unknown): ProgressState {
  const candidate = isRecord(value) && isRecord(value.progress) ? value.progress : value;
  if (!isRecord(candidate)) return { ...defaultProgress };

  const completedLessonIds = Array.isArray(candidate.completedLessonIds)
    ? [...new Set(candidate.completedLessonIds.filter((item): item is string => typeof item === "string" && item.length <= 100))].slice(0, 200)
    : [];
  const practiceSessions = Array.isArray(candidate.practiceSessions) ? uniqueSessions(candidate.practiceSessions) : [];
  const readingAttempts = Math.round(clampNumber(candidate.readingAttempts, 0, 0, 1_000_000));
  const readingCorrect = Math.min(readingAttempts, Math.round(clampNumber(candidate.readingCorrect, 0, 0, 1_000_000)));
  const existingInstallation = candidate.schemaVersion === 1 || candidate.schemaVersion === 2
    || completedLessonIds.length > 0 || practiceSessions.length > 0
    || "soundEnabled" in candidate || "largeText" in candidate || "streak" in candidate;

  return {
    schemaVersion: 3,
    onboardingCompleted: typeof candidate.onboardingCompleted === "boolean" ? candidate.onboardingCompleted : existingInstallation,
    completedLessonIds,
    practiceSessions,
    streak: Math.round(clampNumber(candidate.streak, 0, 0, 10_000)),
    lastPracticeDate: typeof candidate.lastPracticeDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(candidate.lastPracticeDate)
      ? candidate.lastPracticeDate
      : undefined,
    childName: cleanText(candidate.childName, defaultProgress.childName, 24),
    largeText: typeof candidate.largeText === "boolean" ? candidate.largeText : false,
    theme: candidate.theme === "light" || candidate.theme === "dark" ? candidate.theme : "system",
    soundEnabled: typeof candidate.soundEnabled === "boolean" ? candidate.soundEnabled : true,
    microphoneEnabled: typeof candidate.microphoneEnabled === "boolean" ? candidate.microphoneEnabled : true,
    weeklyGoalMinutes: Math.round(clampNumber(candidate.weeklyGoalMinutes, 45, 10, 420)),
    tunerCalibration: clampNumber(candidate.tunerCalibration, 440, 432, 446),
    pitchChallengesCompleted: Math.round(clampNumber(candidate.pitchChallengesCompleted, 0, 0, 1_000_000)),
    readingCorrect,
    readingAttempts,
    songsCompleted: Math.round(clampNumber(candidate.songsCompleted, 0, 0, 1_000_000)),
    familyPin: normalizeFamilyPin(candidate.familyPin)
  };
}

export function currentStreak(storedStreak: number, lastPracticeDate: string | undefined, today = localDateKey()): number {
  if (!lastPracticeDate || storedStreak <= 0) return 0;
  if (lastPracticeDate === today) return storedStreak;
  const previous = new Date(`${lastPracticeDate}T12:00:00`);
  const current = new Date(`${today}T12:00:00`);
  const difference = Math.round((current.getTime() - previous.getTime()) / 86_400_000);
  return difference === 1 ? storedStreak : 0;
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
      ?? localStorage.getItem(TEMP_STORAGE_KEY)
      ?? localStorage.getItem(PREVIOUS_STORAGE_KEY)
      ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    const progress = normalizeProgress(JSON.parse(raw));
    progress.streak = currentStreak(progress.streak, progress.lastPracticeDate);
    saveProgress(progress);
    return progress;
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(progress: ProgressState): void {
  try {
    const serialized = JSON.stringify(normalizeProgress(progress));
    localStorage.setItem(TEMP_STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.removeItem(TEMP_STORAGE_KEY);
  } catch {
    // La aplicación sigue funcionando aunque el almacenamiento esté lleno o bloqueado.
  }
}

export function createProgressExport(progress: ProgressState): ProgressExport {
  return {
    application: "guitarra-adventure",
    formatVersion: CURRENT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    progress: normalizeProgress(progress)
  };
}

export async function exportProgress(progress: ProgressState): Promise<void> {
  const payload = createProgressExport(progress);
  const filename = `progreso-guitarra-${localDateKey()}.json`;
  const file = new File([JSON.stringify(payload, null, 2)], filename, { type: "application/json" });

  try {
    if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "Respaldo de Mi Aventura con la Guitarra", files: [file] });
      return;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
  }

  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseProgressImport(text: string): ProgressState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("El archivo no contiene JSON válido.");
  }

  if (isRecord(parsed) && "application" in parsed && parsed.application !== "guitarra-adventure") {
    throw new Error("El archivo pertenece a otra aplicación.");
  }
  if (isRecord(parsed) && typeof parsed.formatVersion === "number" && parsed.formatVersion > CURRENT_FORMAT_VERSION) {
    throw new Error("El respaldo fue creado por una versión más nueva de la aplicación.");
  }

  const candidate = isRecord(parsed) && isRecord(parsed.progress) ? parsed.progress : parsed;
  const recognizable = isRecord(candidate) && [
    "completedLessonIds", "practiceSessions", "childName", "weeklyGoalMinutes", "tunerCalibration"
  ].some((key) => key in candidate);
  if (!recognizable) throw new Error("No se encontró progreso reconocible.");
  return normalizeProgress(parsed);
}

export function createLocalId(prefix = "item"): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return `${prefix}-${[...bytes].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateStreak(previousDate: string | undefined, today: string): number | "keep" {
  if (!previousDate) return 1;
  if (previousDate === today) return "keep";

  const previous = new Date(`${previousDate}T12:00:00`);
  const current = new Date(`${today}T12:00:00`);
  const difference = Math.round((current.getTime() - previous.getTime()) / 86_400_000);
  return difference === 1 ? 1 : 0;
}

export function startOfLocalWeek(date = new Date()): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const mondayOffset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - mondayOffset);
  return result;
}

export function weeklyHistory(sessions: PracticeSession[], weeks = 8, now = new Date()): { start: number; minutes: number }[] {
  const currentWeekStart = startOfLocalWeek(now);
  const buckets: { start: number; minutes: number }[] = [];
  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - offset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const minutes = sessions.reduce((sum, session) => {
      const timestamp = Date.parse(session.date);
      return Number.isFinite(timestamp) && timestamp >= weekStart.getTime() && timestamp < weekEnd.getTime()
        ? sum + session.minutes
        : sum;
    }, 0);
    buckets.push({ start: weekStart.getTime(), minutes });
  }
  return buckets;
}

export function weeklyMinutes(sessions: PracticeSession[], now = new Date()): number {
  const start = startOfLocalWeek(now).getTime();
  return sessions.reduce((total, session) => {
    const timestamp = Date.parse(session.date);
    return Number.isFinite(timestamp) && timestamp >= start && timestamp <= now.getTime() ? total + session.minutes : total;
  }, 0);
}
