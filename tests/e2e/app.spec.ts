import { test, expect, type Page } from "@playwright/test";

// Semilla mínima para saltar la bienvenida y activar el sonido.
// El service worker se bloquea en playwright.config.ts (`serviceWorkers`), no
// aquí: `page.route` no llega a interceptar la petición de `/sw.js`.
async function seed(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript((data) => {
    localStorage.setItem("guitarra-adventure-progress-v3", JSON.stringify(data));
  }, { schemaVersion: 3, onboardingCompleted: true, childName: "Test", soundEnabled: true, ...extra });
}

test("carga el inicio sin errores de consola", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Hola/ })).toBeVisible();
  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("navega por todas las secciones", async ({ page }) => {
  await seed(page);
  const screens: Array<[string, RegExp]> = [
    ["path", /Ruta de 24 lecciones/],
    ["tuner", /Afinador crom/],
    ["rhythm", /Metrónomo y pulso/],
    ["songs", /Canciones/],
    ["practice", /Sesión de práctica/],
    ["family", /Panel familiar/]
  ];
  for (const [screen, heading] of screens) {
    await page.goto(`/?screen=${screen}`);
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
  }
});

test("reproduce una canción con muestras reales de guitarra", async ({ page }) => {
  await seed(page);
  await page.goto("/?screen=songs");
  const audioResponse = page.waitForResponse(
    (r) => /\/audio\/guitarra\/.*\.mp3/.test(r.url()) && r.status() === 200,
    { timeout: 10_000 }
  );
  await page.getByRole("button", { name: /Escuchar/ }).click();
  // La reproducción arranca (aparece Detener) y se descarga una muestra real.
  await expect(page.getByRole("button", { name: /Detener/ })).toBeVisible();
  await audioResponse;
  await expect(page.locator(".song-note.active")).toHaveCount(1);
});

test("el metrónomo recorre el compás siguiendo el reloj de audio", async ({ page }) => {
  // El reloj de audio headless puede ir más lento que el tiempo real.
  test.setTimeout(60_000);
  await seed(page);
  await page.goto("/?screen=rhythm");
  await page.getByRole("button", { name: "120", exact: true }).click();
  await page.getByRole("button", { name: "Comenzar" }).click();

  const disc = page.locator(".pulse-disc");
  await expect(disc).toHaveClass(/active/, { timeout: 15_000 });

  // Se comprueba que el compás recorre sus cuatro pulsos, no cuánto tarda: el
  // reloj de AudioContext no avanza en tiempo real sin dispositivo de audio, y
  // la exactitud de la rejilla ya se verifica en las pruebas de metronome.ts.
  // El disco se remonta en cada pulso (lleva `key`), así que hay que volver a
  // consultarlo en cada muestra: una referencia guardada queda desprendida.
  const observed = await page.evaluate(() => new Promise<string[]>((resolve) => {
    const seen = new Set<string>();
    const startedAt = Date.now();
    const sampler = setInterval(() => {
      const text = document.querySelector(".pulse-disc")?.textContent?.trim();
      if (text && text !== "♪") seen.add(text);
      if (seen.size >= 4 || Date.now() - startedAt > 18_000) {
        clearInterval(sampler);
        resolve([...seen]);
      }
    }, 30);
  }));

  expect(observed.sort()).toEqual(["1", "2", "3", "4"]);
  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(disc).not.toHaveClass(/active/);
});

test("muestra el estado del dispositivo y permite desactivar el micrófono", async ({ page }) => {
  await seed(page);
  await page.goto("/");

  // Los cuatro indicadores están siempre visibles y son accionables.
  const chips = page.locator(".capability-chip");
  await expect(chips).toHaveCount(4);
  await expect(page.getByRole("button", { name: /Guardado local: Activo/ })).toBeVisible();

  // Pulsar un indicador lleva al panel donde se gestionan.
  await chips.first().click();
  await expect(page.getByRole("heading", { name: "Requisitos y permisos" })).toBeVisible();
  await expect(page.locator(".capability-row")).toHaveCount(4);

  // Apagarlo desde el panel desactiva las funciones que lo necesitan. Se navega
  // por la propia aplicación: un `goto` recargaría y `addInitScript` volvería a
  // sembrar el progreso, descartando el cambio.
  await page.locator(".capability-toggle input").uncheck();
  await page.getByRole("button", { name: /Afinador/ }).click();
  await expect(page.getByRole("button", { name: "Activar micrófono" })).toBeDisabled();
  await expect(page.locator(".capability-hint")).toContainText("panel Familia");
});

test("la bienvenida ofrece activar el micrófono y deja seguir sin él", async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");

  const step = page.locator(".welcome-mic");
  await expect(step).toBeVisible();
  await expect(step).toContainText("nunca se graba ni se envía");
  await expect(step).toContainText("Puedes omitirlo");

  // Se puede completar la bienvenida sin conceder el micrófono.
  await page.locator(".welcome-check input").check();
  await page.getByRole("button", { name: "Entrar a mi aventura" }).click();
  await expect(page.locator(".welcome-dialog")).toHaveCount(0);
});

test("el tema oscuro forzado aplica data-theme", async ({ page }) => {
  await seed(page, { theme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
