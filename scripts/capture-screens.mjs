// Captura las pantallas de la app en tamaño teléfono para documentación y landing.
// Requiere el servidor en :1420 y @playwright/test (dependencia de desarrollo del proyecto):
//   pnpm build && pnpm preview --port 1420 &   (o pnpm dev)
//   node scripts/capture-screens.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:1420";
const OUT = join(process.cwd(), "docs", "screenshots");
mkdirSync(OUT, { recursive: true });

const iso = (daysAgo) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();
const today = new Date().toISOString().slice(0, 10);
const baseDemo = {
  schemaVersion: 3,
  onboardingCompleted: true,
  childName: "Sofía",
  completedLessonIds: ["meet-the-guitar", "healthy-posture", "right-hand-shape", "guitar-care", "open-strings", "steady-pulse", "first-plucking"],
  practiceSessions: [
    { id: "s1", date: iso(0), minutes: 15, focus: "Sonido y pulsación", note: "Las notas sonaron más limpias 🎶" },
    { id: "s2", date: iso(1), minutes: 10, focus: "Notas y digitación", note: "Encontré el Sol más rápido" },
    { id: "s3", date: iso(2), minutes: 20, focus: "Ritmo", note: "" },
    { id: "s4", date: iso(3), minutes: 10, focus: "Postura y relajación", note: "Hombros abajo" },
    { id: "s5", date: iso(8), minutes: 12, focus: "Canción", note: "" },
    { id: "s6", date: iso(9), minutes: 18, focus: "Sonido y pulsación", note: "" },
    { id: "s7", date: iso(15), minutes: 8, focus: "Ritmo", note: "" },
    { id: "s8", date: iso(16), minutes: 14, focus: "Canción", note: "" }
  ],
  streak: 4,
  lastPracticeDate: today,
  largeText: false,
  soundEnabled: true,
  weeklyGoalMinutes: 45,
  tunerCalibration: 440,
  pitchChallengesCompleted: 6,
  readingCorrect: 18,
  readingAttempts: 21,
  songsCompleted: 2
};

const screens = [
  { id: "home", file: "01-inicio.png" },
  { id: "path", file: "02-ruta.png" },
  { id: "tuner", file: "03-afinador.png" },
  { id: "rhythm", file: "04-ritmo.png" },
  { id: "practice", file: "05-practica.png" },
  { id: "family", file: "06-familia.png" },
  { id: "songs", file: "08-canciones.png" }
];

const browser = await chromium.launch();

async function capture(demo, theme, list) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: theme === "dark" ? "dark" : "light"
  });
  await context.addInitScript((data) => {
    localStorage.setItem("guitarra-adventure-progress-v3", JSON.stringify(data));
  }, demo);
  const page = await context.newPage();
  for (const screen of list) {
    await page.goto(`${BASE}/?screen=${screen.id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(650);
    await page.screenshot({ path: join(OUT, screen.file) });
    console.log(`✓ ${screen.file}`);
  }
  // Una lección abierta (solo tema claro).
  if (theme !== "dark") {
    await page.goto(`${BASE}/?screen=path`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const lesson = page.locator(".lesson-row:not([disabled])").first();
    if (await lesson.count()) {
      await lesson.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(OUT, "07-leccion.png") });
      console.log("✓ 07-leccion.png");
    }
  }
  await context.close();
}

await capture(baseDemo, "light", screens);
await capture({ ...baseDemo, theme: "dark" }, "dark", [
  { id: "home", file: "dark-inicio.png" },
  { id: "songs", file: "dark-canciones.png" }
]);

await browser.close();
console.log(`\nCapturas en ${OUT}`);
