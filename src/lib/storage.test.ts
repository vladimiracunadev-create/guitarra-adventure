import { describe, expect, it } from "vitest";
import { currentStreak, normalizeProgress, parseProgressImport, weeklyMinutes } from "./storage";

describe("progress storage", () => {
  it("migrates an old progress object to schema 3", () => {
    const progress = normalizeProgress({ schemaVersion: 2, childName: "  Ana  ", completedLessonIds: ["one", "one"], practiceSessions: [] });
    expect(progress.schemaVersion).toBe(3);
    expect(progress.onboardingCompleted).toBe(true);
    expect(progress.childName).toBe("Ana");
    expect(progress.completedLessonIds).toEqual(["one"]);
    expect(progress.weeklyGoalMinutes).toBe(45);
  });

  it("accepts a versioned export", () => {
    const imported = parseProgressImport(JSON.stringify({
      application: "guitarra-adventure",
      formatVersion: 3,
      progress: { childName: "Sofía", completedLessonIds: [], practiceSessions: [] }
    }));
    expect(imported.childName).toBe("Sofía");
  });

  it("rejects backups from a future format", () => {
    expect(() => parseProgressImport(JSON.stringify({ application: "guitarra-adventure", formatVersion: 99, progress: { childName: "Ana" } })))
      .toThrow("versión más nueva");
  });

  it("rejects unrelated JSON", () => {
    expect(() => parseProgressImport("{}")) .toThrow("No se encontró progreso reconocible");
  });

  it("counts only sessions from the current week", () => {
    const now = new Date("2026-07-25T12:00:00");
    const sessions = [
      { id: "a", date: "2026-07-20T10:00:00", minutes: 10, focus: "Ritmo", note: "" },
      { id: "b", date: "2026-07-19T10:00:00", minutes: 30, focus: "Pulsación", note: "" }
    ];
    expect(weeklyMinutes(sessions, now)).toBe(10);
  });

  it("expires an old streak", () => {
    expect(currentStreak(5, "2026-07-20", "2026-07-25")).toBe(0);
    expect(currentStreak(5, "2026-07-24", "2026-07-25")).toBe(5);
  });
});
