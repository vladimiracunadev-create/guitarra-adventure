import { describe, expect, it } from "vitest";
import { getAchievements } from "./achievements";
import { defaultProgress } from "./storage";

describe("achievements", () => {
  it("unlocks progress milestones", () => {
    const progress = { ...defaultProgress, onboardingCompleted: true, completedLessonIds: ["one"], readingCorrect: 5, readingAttempts: 6 };
    const achievements = getAchievements(progress, 24, new Date("2026-07-25T12:00:00"));
    expect(achievements.find((item) => item.id === "first-lesson")?.earned).toBe(true);
    expect(achievements.find((item) => item.id === "reader")?.earned).toBe(true);
    expect(achievements.find((item) => item.id === "course")?.earned).toBe(false);
  });
});
