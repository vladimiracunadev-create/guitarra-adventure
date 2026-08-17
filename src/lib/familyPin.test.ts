import { describe, expect, it } from "vitest";
import { createFamilyPin, isValidFamilyPin, verifyFamilyPin } from "./familyPin";

describe("family PIN", () => {
  it("accepts only four digits", () => {
    expect(isValidFamilyPin("1234")).toBe(true);
    expect(isValidFamilyPin("123")).toBe(false);
    expect(isValidFamilyPin("12a4")).toBe(false);
  });

  it("creates and verifies a local credential", async () => {
    const credential = await createFamilyPin("4826");
    expect(await verifyFamilyPin("4826", credential)).toBe(true);
    expect(await verifyFamilyPin("0000", credential)).toBe(false);
  });
});
