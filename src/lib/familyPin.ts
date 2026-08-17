import type { FamilyPinCredential } from "../types";

const ITERATIONS = 120_000;
const PIN_PATTERN = /^\d{4}$/;

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) throw new Error("Credencial de PIN dañada.");
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  return bytes;
}

async function derivePinHash(pin: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

export function isValidFamilyPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

export async function createFamilyPin(pin: string): Promise<FamilyPinCredential> {
  if (!isValidFamilyPin(pin)) throw new Error("El PIN debe tener exactamente cuatro números.");
  if (!globalThis.crypto?.subtle) throw new Error("Este dispositivo no permite proteger el panel con PIN.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    algorithm: "PBKDF2-SHA-256",
    iterations: ITERATIONS,
    salt: bytesToHex(salt),
    hash: await derivePinHash(pin, salt, ITERATIONS)
  };
}

export async function verifyFamilyPin(pin: string, credential: FamilyPinCredential): Promise<boolean> {
  if (!isValidFamilyPin(pin) || credential.algorithm !== "PBKDF2-SHA-256") return false;
  const actual = await derivePinHash(pin, hexToBytes(credential.salt), credential.iterations);
  if (actual.length !== credential.hash.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ credential.hash.charCodeAt(index);
  return difference === 0;
}
