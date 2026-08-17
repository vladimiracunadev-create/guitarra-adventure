import type { ProgressState } from "../types";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
}

function minutesThisWeek(progress: ProgressState, now: Date): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return progress.practiceSessions.reduce((sum, session) => {
    const time = Date.parse(session.date);
    return Number.isFinite(time) && time >= start.getTime() && time <= now.getTime() ? sum + session.minutes : sum;
  }, 0);
}

export function getAchievements(progress: ProgressState, lessonCount = 24, now = new Date()): Achievement[] {
  const totalMinutes = progress.practiceSessions.reduce((sum, session) => sum + session.minutes, 0);
  const weekMinutes = minutesThisWeek(progress, now);
  return [
    { id: "first-lesson", icon: "🌱", title: "Primer paso", description: "Completar la primera lección", earned: progress.completedLessonIds.length >= 1 },
    { id: "six-lessons", icon: "🧭", title: "Exploradora", description: "Completar seis lecciones", earned: progress.completedLessonIds.length >= 6 },
    { id: "half-course", icon: "🏔️", title: "Mitad del viaje", description: "Completar doce lecciones", earned: progress.completedLessonIds.length >= 12 },
    { id: "course", icon: "🏆", title: "Guitarrista aventurera", description: "Completar el curso inicial", earned: progress.completedLessonIds.length >= lessonCount },
    { id: "first-practice", icon: "⏱️", title: "Mi primera práctica", description: "Guardar una sesión", earned: progress.practiceSessions.length >= 1 },
    { id: "hour", icon: "🎶", title: "Una hora de música", description: "Practicar 60 minutos en total", earned: totalMinutes >= 60 },
    { id: "weekly-goal", icon: "📅", title: "Meta semanal", description: "Cumplir la meta de esta semana", earned: weekMinutes >= progress.weeklyGoalMinutes },
    { id: "streak", icon: "🔥", title: "Constancia tranquila", description: "Alcanzar una racha de tres días", earned: progress.streak >= 3 },
    { id: "pitch", icon: "🎯", title: "Oído atento", description: "Superar cinco desafíos de afinación", earned: progress.pitchChallengesCompleted >= 5 },
    { id: "reader", icon: "📖", title: "Lectora musical", description: "Reconocer cinco notas", earned: progress.readingCorrect >= 5 }
  ];
}
