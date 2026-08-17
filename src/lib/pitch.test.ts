import { describe, expect, it } from "vitest";
import {
  autoCorrelate,
  centsBetween,
  frequencyForMidi,
  frequencyToMidi,
  nearestChromaticNote,
  nearestGuitarString
} from "./pitch";

describe("pitch helpers", () => {
  it("maps A4 to MIDI 69", () => {
    expect(frequencyToMidi(440)).toBeCloseTo(69, 5);
  });

  it("respects a custom calibration", () => {
    expect(frequencyForMidi(69, 442)).toBeCloseTo(442, 5);
    expect(nearestChromaticNote(442, 442).scientific).toBe("A4");
  });

  it("reports zero cents for an exact frequency", () => {
    expect(centsBetween(440, 440)).toBeCloseTo(0, 5);
  });

  it("recognizes the fifth string", () => {
    const result = nearestGuitarString(111);
    expect(result.scientific).toBe("A2");
    expect(result.stringNumber).toBe(5);
    expect(result.cents).toBeGreaterThan(0);
  });

  it("tells the two E strings apart", () => {
    expect(nearestGuitarString(82.4).stringNumber).toBe(6);
    expect(nearestGuitarString(329).stringNumber).toBe(1);
  });

  it("recognizes a stopped B3 note chromatically", () => {
    const result = nearestChromaticNote(246.94);
    expect(result.noteName).toBe("Si");
    expect(result.scientific).toBe("B3");
  });

  it("detects a synthetic 440 Hz signal", () => {
    const sampleRate = 48_000;
    const buffer = new Float32Array(4096);
    for (let index = 0; index < buffer.length; index += 1) {
      buffer[index] = Math.sin((2 * Math.PI * 440 * index) / sampleRate);
    }
    expect(autoCorrelate(buffer, sampleRate)).toBeCloseTo(440, 0);
  });

  it("reaches the low open sixth string", () => {
    const sampleRate = 48_000;
    const buffer = new Float32Array(4096);
    for (let index = 0; index < buffer.length; index += 1) {
      buffer[index] = Math.sin((2 * Math.PI * 82.41 * index) / sampleRate);
    }
    expect(autoCorrelate(buffer, sampleRate)).toBeCloseTo(82.41, 0);
  });

  it("ignores near-silence", () => {
    expect(autoCorrelate(new Float32Array(4096), 48_000)).toBeNull();
  });
});
