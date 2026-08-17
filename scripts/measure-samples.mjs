// Mide la afinación real de cada muestra de guitarra.
//
// Las grabaciones del soundfont no están exactamente en el temperamento igual,
// así que `src/lib/audio.ts` guarda la frecuencia nativa de cada archivo para
// corregirla con `playbackRate`. Este script es el origen verificable de esos
// números: decodifica el mp3 en Chromium con Web Audio y aplica autocorrelación
// normalizada sobre la parte sostenida del sonido.
//
// Uso: node scripts/measure-samples.mjs [carpeta]   (por defecto public/audio/guitarra)

import { chromium } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const NOTE_OFFSETS = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

/** `fs4` → MIDI 66; `e2` → MIDI 40. */
function midiFromFileName(name) {
  const match = /^([a-g])(s|b)?(\d)$/.exec(name);
  if (!match) return null;
  const [, letter, accidental, octave] = match;
  const alteration = accidental === "s" ? 1 : accidental === "b" ? -1 : 0;
  return (Number(octave) + 1) * 12 + NOTE_OFFSETS[letter] + alteration;
}

const equalTemperament = (midi) => 440 * 2 ** ((midi - 69) / 12);
const cents = (frequency, target) => 1200 * Math.log2(frequency / target);

const dir = resolve(process.argv[2] ?? "public/audio/guitarra");
const files = readdirSync(dir).filter((name) => name.endsWith(".mp3")).sort();

const browser = await chromium.launch();
const page = await browser.newPage();
const natives = {};

for (const file of files) {
  const note = file.replace(/\.mp3$/, "");
  const midi = midiFromFileName(note);
  if (midi === null) {
    console.error(`Nombre de archivo no reconocido: ${file}`);
    process.exitCode = 1;
    continue;
  }
  const expected = equalTemperament(midi);
  const base64 = readFileSync(join(dir, file)).toString("base64");

  const measurement = await page.evaluate(async ({ base64, expected }) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const buffer = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes.buffer);
    const data = buffer.getChannelData(0);
    const rate = buffer.sampleRate;

    function pitchAt(offset, size) {
      const length = Math.min(size, data.length - offset);
      if (length < 4096) return null;
      const window = data.subarray(offset, offset + length);
      let mean = 0;
      for (let index = 0; index < length; index += 1) mean += window[index];
      mean /= length;
      const centered = new Float32Array(length);
      for (let index = 0; index < length; index += 1) centered[index] = window[index] - mean;

      // La búsqueda se acota a ±3 semitonos de la nota esperada: sin esa cota la
      // autocorrelación de una cuerda grave se engancha con frecuencia al primer
      // armónico y devuelve la octava.
      const minLag = Math.max(2, Math.floor(rate / (expected * 2 ** (3 / 12))));
      const maxLag = Math.min(length - 2, Math.ceil(rate / (expected * 2 ** (-3 / 12))));
      let bestLag = -1;
      let bestScore = -1;
      for (let lag = minLag; lag <= maxLag; lag += 1) {
        let product = 0;
        let first = 0;
        let second = 0;
        const compared = length - lag;
        for (let index = 0; index < compared; index += 1) {
          const a = centered[index];
          const b = centered[index + lag];
          product += a * b;
          first += a * a;
          second += b * b;
        }
        const denominator = Math.sqrt(first * second);
        const score = denominator > 0 ? product / denominator : 0;
        if (score > bestScore) { bestScore = score; bestLag = lag; }
      }
      if (bestLag <= minLag || bestLag >= maxLag || bestScore < 0.5) return null;

      // Interpolación parabólica entre los tres puntos vecinos del máximo.
      const around = (lag) => {
        let product = 0;
        let first = 0;
        let second = 0;
        const compared = length - lag;
        for (let index = 0; index < compared; index += 1) {
          const a = centered[index];
          const b = centered[index + lag];
          product += a * b;
          first += a * a;
          second += b * b;
        }
        const denominator = Math.sqrt(first * second);
        return denominator > 0 ? product / denominator : 0;
      };
      const left = around(bestLag - 1);
      const right = around(bestLag + 1);
      const denominator = 2 * bestScore - left - right;
      const adjust = denominator === 0 ? 0 : (right - left) / (2 * denominator);
      return rate / (bestLag + adjust);
    }

    const readings = [];
    for (const fraction of [0.12, 0.2, 0.28, 0.36, 0.44, 0.52]) {
      const value = pitchAt(Math.floor(data.length * fraction), 16384);
      if (value) readings.push(value);
    }
    readings.sort((first, second) => first - second);
    return {
      pitch: readings.length ? readings[Math.floor(readings.length / 2)] : null,
      readings,
      duration: buffer.duration
    };
  }, { base64, expected });

  if (!measurement.pitch) {
    console.error(`No se pudo medir ${file}.`);
    process.exitCode = 1;
    continue;
  }

  const deviation = cents(measurement.pitch, expected);
  natives[midi] = { file: note, native: Number(measurement.pitch.toFixed(2)) };
  console.log(
    `${note.padEnd(4)} MIDI ${String(midi).padStart(3)}  esperado ${expected.toFixed(2)} Hz  ` +
    `medido ${measurement.pitch.toFixed(2)} Hz  (${deviation >= 0 ? "+" : ""}${deviation.toFixed(2)} cents)  ` +
    `${measurement.duration.toFixed(2)} s`
  );
}

await browser.close();

console.log("\n// Copiar en src/lib/audio.ts");
const entries = Object.keys(natives)
  .map(Number)
  .sort((first, second) => first - second)
  .map((midi) => `  ${midi}: { file: "${natives[midi].file}", native: ${natives[midi].native} }`);
console.log(`const GUITAR_SAMPLES: Record<number, { file: string; native: number }> = {\n${entries.join(",\n")}\n};`);
