import assert from "node:assert/strict";
import { lessons, worlds } from "../src/data/curriculum.ts";
import { createFamilyPin, verifyFamilyPin } from "../src/lib/familyPin.ts";
import { getAchievements } from "../src/lib/achievements.ts";
import { autoCorrelate, nearestChromaticNote } from "../src/lib/pitch.ts";
import { normalizePracticeTimer } from "../src/lib/practiceTimer.ts";
import { currentStreak, defaultProgress, normalizeProgress, parseProgressImport, weeklyMinutes } from "../src/lib/storage.ts";

assert.equal(lessons.length, 24);
assert.equal(worlds.length, 6);
assert.deepEqual(lessons.map((lesson) => lesson.order), Array.from({ length: 24 }, (_, index) => index + 1));
assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 24);

const migrated = normalizeProgress({ schemaVersion: 2, childName: " Ana ", completedLessonIds: ["a", "a"], practiceSessions: [] });
assert.equal(migrated.schemaVersion, 3);
assert.equal(migrated.onboardingCompleted, true);
assert.deepEqual(migrated.completedLessonIds, ["a"]);
assert.throws(() => parseProgressImport(JSON.stringify({ application: "guitarra-adventure", formatVersion: 99, progress: { childName: "Ana" } })), /versión más nueva/);
assert.equal(currentStreak(4, "2026-07-20", "2026-07-25"), 0);
assert.equal(weeklyMinutes([{ id: "a", date: "2026-07-20T10:00:00", minutes: 12, focus: "Ritmo", note: "" }], new Date("2026-07-25T12:00:00")), 12);

const recoveredTimer = normalizePracticeTimer({ selectedMinutes: 5, running: true, secondsLeft: 300, endAt: 130_000, focus: "Ritmo" }, 100_000);
assert.equal(recoveredTimer.secondsLeft, 30);
assert.equal(recoveredTimer.running, true);
const elapsedTimer = normalizePracticeTimer({ selectedMinutes: 5, running: true, secondsLeft: 300, endAt: 90_000 }, 100_000);
assert.equal(elapsedTimer.finished, true);

const credential = await createFamilyPin("4826");
assert.equal(await verifyFamilyPin("4826", credential), true);
assert.equal(await verifyFamilyPin("0000", credential), false);

const achievementProgress = { ...defaultProgress, onboardingCompleted: true, completedLessonIds: ["one"], readingCorrect: 5, readingAttempts: 5 };
const earned = getAchievements(achievementProgress, 24, new Date("2026-07-25T12:00:00")).filter((item) => item.earned).map((item) => item.id);
assert.ok(earned.includes("first-lesson"));
assert.ok(earned.includes("reader"));

const sampleRate = 48_000;
for (const expected of [82.41, 110, 146.83, 196, 246.94, 329.63, 392]) {
  const buffer = new Float32Array(4096);
  for (let index = 0; index < buffer.length; index += 1) buffer[index] = Math.sin((2 * Math.PI * expected * index) / sampleRate);
  const detected = autoCorrelate(buffer, sampleRate);
  assert.ok(detected !== null, `No se detectó ${expected} Hz`);
  assert.ok(Math.abs(detected - expected) < 1, `Error excesivo para ${expected} Hz: ${detected}`);
}
assert.equal(nearestChromaticNote(246.94).scientific, "B3");

console.log(JSON.stringify({
  status: "ok",
  lessons: lessons.length,
  worlds: worlds.length,
  migration: migrated.schemaVersion,
  pin: "verified",
  recoveredTimerSeconds: recoveredTimer.secondsLeft,
  earnedAchievements: earned
}, null, 2));
