// Rasteriza las guías visuales a PNG para revisarlas fuera del navegador.
// Uso: node scripts/render-illustrations.mjs [carpeta-de-salida]
import { chromium } from "@playwright/test";
import { mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const source = resolve("public/illustrations");
const target = resolve(process.argv[2] ?? "docs/screenshots/illustrations");
mkdirSync(target, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 720, height: 360 }, deviceScaleFactor: 2 });

for (const file of readdirSync(source).filter((name) => name.endsWith(".svg"))) {
  await page.goto(pathToFileURL(join(source, file)).href);
  const output = join(target, file.replace(/\.svg$/, ".png"));
  await page.screenshot({ path: output });
  console.log(`✓ ${output}`);
}

await browser.close();
