import { defineConfig, devices } from "@playwright/test";

// Pruebas E2E de humo sobre la app compilada (Vite preview en :1420).
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://localhost:1420",
    trace: "on-first-retry",
    // El service worker recarga la página al tomar el control
    // (`controllerchange` en src/lib/pwa.ts), lo que borra el estado de React en
    // mitad de una prueba. Interceptar `/sw.js` con `page.route` no sirve: esa
    // petición la hace el contexto, no la página. Hay que bloquearlo aquí.
    serviceWorkers: "block"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: {
    command: "pnpm build && pnpm preview --port 1420 --strictPort",
    url: "http://localhost:1420",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
