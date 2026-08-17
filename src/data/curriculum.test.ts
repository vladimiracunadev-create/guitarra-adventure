import { describe, expect, it } from "vitest";
import { lessons, worlds } from "./curriculum";

describe("curriculum integrity", () => {
  it("contains 24 ordered lessons in six worlds", () => {
    expect(lessons).toHaveLength(24);
    expect(worlds).toHaveLength(6);
    expect(lessons.map((lesson) => lesson.order)).toEqual(Array.from({ length: 24 }, (_, index) => index + 1));
  });

  it("uses unique identifiers and complete activities", () => {
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length);
    lessons.forEach((lesson) => {
      expect(lesson.steps.length).toBeGreaterThanOrEqual(4);
      expect(lesson.skills.length).toBeGreaterThan(0);
      expect(lesson.quiz.options[lesson.quiz.answer]).toBeTruthy();
      expect(worlds.some((world) => world.id === lesson.world)).toBe(true);
    });
  });
});
