import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    host: "0.0.0.0",
    port: 1420,
    strictPort: true
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  },
  build: {
    target: "es2022",
    sourcemap: true
  },
  test: {
    // Solo pruebas unitarias/dominio; las E2E (*.spec.ts) las corre Playwright.
    include: ["src/**/*.test.ts"]
  }
});
