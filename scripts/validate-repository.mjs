import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const fail = (message) => { throw new Error(message); };
const requireFile = (path) => { if (!existsSync(resolve(root, path))) fail(`Falta el archivo ${path}.`); };

const packageJson = JSON.parse(read("package.json"));
const tauriConfig = JSON.parse(read("src-tauri/tauri.conf.json"));
const cargo = read("src-tauri/Cargo.toml");
const cargoVersion = cargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1];

if (packageJson.version !== tauriConfig.version || packageJson.version !== cargoVersion) {
  fail(`Versiones diferentes: package=${packageJson.version}, tauri=${tauriConfig.version}, cargo=${cargoVersion}`);
}
if (!String(packageJson.packageManager).startsWith("pnpm@")) fail("El proyecto debe declarar pnpm como gestor de paquetes.");
if (existsSync(resolve(root, "package-lock.json")) || existsSync(resolve(root, "yarn.lock"))) fail("Se encontró un lockfile de otro gestor de paquetes.");

const manifest = JSON.parse(read("public/manifest.webmanifest"));
JSON.parse(read("src-tauri/capabilities/default.json"));
if (manifest.lang !== "es-CL" || manifest.display !== "standalone") fail("El manifiesto PWA no tiene la configuración regional esperada.");
for (const icon of manifest.icons ?? []) requireFile(`public${icon.src}`);
for (const requiredIcon of ["/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png"]) {
  if (!(manifest.icons ?? []).some((icon) => icon.src === requiredIcon)) fail(`El manifiesto no declara ${requiredIcon}.`);
}

const curriculum = read("src/data/curriculum.ts").split("export const worlds")[0];
const ids = [...curriculum.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]);
const orders = [...curriculum.matchAll(/\border:\s*(\d+)/g)].map((match) => Number(match[1]));
const guides = [...curriculum.matchAll(/visualGuide:\s*"([^"]+)"/g)].map((match) => match[1]);

if (ids.length !== 24) fail(`Se esperaban 24 lecciones y se encontraron ${ids.length}.`);
if (new Set(ids).size !== ids.length) fail("Existen identificadores de lección duplicados.");
if (orders.some((order, index) => order !== index + 1)) fail("El orden de las lecciones no es consecutivo.");

for (const guide of guides) {
  const relative = guide.replace(/^\//, "public/");
  requireFile(relative);
  const svg = read(relative);
  if (!svg.includes("<title") || !svg.includes("<desc")) fail(`La guía ${relative} necesita title y desc accesibles.`);
}

for (const path of [
  "README.md", "ROADMAP.md", "CHANGELOG.md", "docs/CURRICULUM.md", "docs/PEDAGOGY.md",
  "docs/PRIVACY.md", "docs/TEACHER_REVIEW.md", "docs/VALIDATION.md", "docs/RELEASE_CHECKLIST.md",
  "docs/PARENT_GUIDE.md", "docs/PRACTICE_PLAN_8_WEEKS.md", "docs/ACCESSIBILITY.md", "docs/CONTENT_LICENSES.md"
]) requireFile(path);

for (const path of [
  "src/lib/pitch.test.ts", "src/lib/storage.test.ts", "src/lib/familyPin.test.ts",
  "src/lib/practiceTimer.test.ts", "src/lib/achievements.test.ts", "src/data/curriculum.test.ts",
  "scripts/test-domain.mjs"
]) requireFile(path);

const progressTypes = read("src/types.ts");
if (!progressTypes.includes("schemaVersion: 3") || !progressTypes.includes("formatVersion: 3")) fail("El esquema de progreso no está en la versión 3.");
const serviceWorker = read("public/sw.js");
if (!serviceWorker.includes("guitarra-adventure-v3") || !serviceWorker.includes("SKIP_WAITING")) fail("El service worker no contiene la estrategia de actualización v3.");

const guitarNotes = ["e2", "a2", "d3", "g3", "a3", "b3", "c4", "d4", "e4", "fs4", "g4"];
for (const note of guitarNotes) {
  requireFile(`public/audio/guitarra/${note}.mp3`);
  if (!serviceWorker.includes(`/audio/guitarra/${note}.mp3`)) fail(`El service worker no precachea la nota ${note}.`);
}

console.log(`Repositorio válido: v${packageJson.version}, ${ids.length} lecciones, ${guides.length} guías, PWA con ${manifest.icons.length} iconos y esquema de progreso 3.`);
