import { describe, expect, it } from "vitest";
import { normalizePracticeTimer } from "./practiceTimer";

describe("practice timer", () => {
  it("recovers a running timer from its absolute end time", () => {
    const timer = normalizePracticeTimer({ selectedMinutes: 5, secondsLeft: 300, running: true, endAt: 130_000, focus: "Ritmo" }, 100_000);
    expect(timer.running).toBe(true);
    expect(timer.secondsLeft).toBe(30);
  });

  it("marks an elapsed timer as finished", () => {
    const timer = normalizePracticeTimer({ selectedMinutes: 5, secondsLeft: 300, running: true, endAt: 90_000 }, 100_000);
    expect(timer.running).toBe(false);
    expect(timer.finished).toBe(true);
    expect(timer.secondsLeft).toBe(0);
  });
});
