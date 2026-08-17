# Resultado de validación de la versión 1.0.0

Fecha: 17 de agosto de 2026. Entorno: Windows 11, Node 24.11.1, pnpm 10.14.0.

## Ejecutado y superado

- Versiones 1.0.0 sincronizadas en `package.json`, `src-tauri/tauri.conf.json` y
  `src-tauri/Cargo.toml`.
- `node scripts/validate-repository.mjs`: repositorio, manifiesto PWA, tres iconos,
  documentos requeridos, 24 lecciones consecutivas con identificadores únicos,
  seis guías SVG con `title` y `desc`, y las once notas de guitarra presentes y
  precargadas por el service worker.
- `node --experimental-strip-types scripts/smoke-domain.mjs`: detección sintética
  de 82,41 · 110 · 146,83 · 196 · 246,94 · 329,63 y 392 Hz con error inferior a
  0,01 cents en las señales ensayadas; reconocimiento de cuerda, reconocimiento
  cromático y calibración de La.
- `node --experimental-strip-types scripts/test-domain.mjs`: normalización del
  progreso, rechazo de respaldos ajenos o de formato futuro, expiración de racha,
  cálculo semanal, recuperación del temporizador y PIN familiar con PBKDF2.
- `pnpm test`: **43 pruebas unitarias en 8 archivos**, todas en verde.
- `pnpm build`: TypeScript estricto y compilación Vite sin errores.
- `pnpm test:e2e`: **7 pruebas Playwright** sobre Chromium, todas en verde
  (carga sin errores de consola, navegación por las siete secciones, reproducción
  de una canción con muestra real descargada, recorrido completo del compás del
  metrónomo, estado del dispositivo, bienvenida y tema oscuro forzado).
- `node scripts/measure-samples.mjs`: las once muestras decodificadas y medidas en
  Chromium; desviación respecto del temperamento igual entre −3,98 y +0,81 cents.
- `node scripts/generate-icons.mjs` y `pnpm tauri icon`: icono fuente, iconos PWA
  e iconos de Windows, macOS, Linux, Android e iOS regenerados desde el mismo
  dibujo.
- `node scripts/capture-screens.mjs`: diez capturas de la aplicación real
  servida en `localhost:1420`.

## No ejecutado en este entorno

- Compilación Rust/Tauri y generación de MSI/EXE, APK/AAB, DEB/AppImage/RPM o
  DMG: se delega en GitHub Actions al etiquetar la versión.
- Compilación y firma de iOS, que exige macOS, Xcode y cuenta Apple Developer.
- Pruebas con micrófonos, guitarras, WebView2 y teléfonos físicos.
- Evaluación con NVDA, Narrator, VoiceOver o TalkBack.
- Revisión curricular y piloto con una profesora y familias.

La versión 1.0.0 es un candidato técnico para piloto, no una aplicación aprobada
para publicación en tiendas ni un método pedagógico validado.
