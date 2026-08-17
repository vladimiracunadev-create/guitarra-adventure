export type Screen = "home" | "path" | "tuner" | "rhythm" | "songs" | "practice" | "family";

export type ThemePreference = "system" | "light" | "dark";

export type LessonStepKind = "observe" | "move" | "listen" | "play" | "reflect";

export interface LessonStep {
  title: string;
  instruction: string;
  durationMinutes: number;
  kind?: LessonStepKind;
  safety?: string;
  referenceFrequency?: number;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  world: number;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  durationMinutes: number;
  objective: string;
  skills: string[];
  visualGuide?: string;
  adultNote?: string;
  steps: LessonStep[];
  quiz: LessonQuiz;
  reward: string;
}

export interface PracticeSession {
  id: string;
  date: string;
  minutes: number;
  focus: string;
  note: string;
}

export interface FamilyPinCredential {
  algorithm: "PBKDF2-SHA-256";
  iterations: number;
  salt: string;
  hash: string;
}

export interface ProgressState {
  schemaVersion: 3;
  onboardingCompleted: boolean;
  completedLessonIds: string[];
  practiceSessions: PracticeSession[];
  streak: number;
  lastPracticeDate?: string;
  childName: string;
  largeText: boolean;
  theme: ThemePreference;
  soundEnabled: boolean;
  /** Permite al adulto desactivar el micrófono sin tocar los ajustes del sistema. */
  microphoneEnabled: boolean;
  weeklyGoalMinutes: number;
  tunerCalibration: number;
  pitchChallengesCompleted: number;
  readingCorrect: number;
  readingAttempts: number;
  songsCompleted: number;
  familyPin?: FamilyPinCredential;
}

export interface ProgressExport {
  application: "guitarra-adventure";
  formatVersion: 3;
  exportedAt: string;
  progress: ProgressState;
}
