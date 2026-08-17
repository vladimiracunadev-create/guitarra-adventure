# Historial de cambios

## 1.0.0 — 2026-08-17

Primera versión pública. El repositorio se publica con el curso completo y la
compilación automática de instaladores para todas las plataformas mediante
GitHub Actions.

### Curso

- **24 lecciones en seis mundos**: cuidado y postura, mano derecha, cuerdas al
  aire y pulsación, mano izquierda, primera posición, escala de Sol mayor, primer
  acorde, lectura en pentagrama y tablatura, y repertorio.
- **Seis ilustraciones SVG originales y accesibles** (partes de la guitarra,
  postura sentada, mano derecha, mano izquierda, diagrama de acorde y
  pentagrama), todas con `title` y `desc` para lectores de pantalla.
- Cada lección tiene objetivo, habilidades, pasos con duración, advertencias de
  seguridad cuando corresponde, pregunta final con explicación e insignia.
- Lectura opcional de las instrucciones con la voz instalada en el dispositivo.

### Afinación y sonido

- **Afinador cromático** con detección por autocorrelación, en dos modos: todas
  las notas o solo las seis cuerdas al aire (Mi, La, Re, Sol, Si, Mi).
- **Once notas con grabaciones reales de guitarra de nailon** (soundfont
  FluidR3_GM de Frank Wen, CC BY 3.0): las seis cuerdas al aire más las notas
  pisadas de la escala de Sol mayor en primera posición.
- La afinación nativa de cada muestra está **medida**, no estimada
  (`pnpm measure:samples`), y se corrige con `playbackRate` para que cada nota
  suene exacta y respete la calibración de La entre 432 y 446 Hz.
- **Desafío de oído** y nota de referencia sostenida para igualar de oído. La
  referencia larga se sintetiza: una cuerda pulsada se apaga sola y repetir la
  grabación en bucle sonaría a ataque repetido, no a nota sostenida.
- El rango de análisis baja hasta 70 Hz para alcanzar la sexta cuerda al aire
  (82,41 Hz).

### Ritmo y práctica

- **Metrónomo de 40 a 160 BPM** con el pulso agendado sobre el reloj de
  `AudioContext` en lugar de `setInterval`: sin deriva acumulada aunque el
  temporizador llegue tarde o la animación se detenga. Compases de 2, 3 y 4
  pulsos, negras y corcheas, *tap-tempo* y modo visual silencioso.
- **Juego de lectura musical** con la escala de Sol mayor en primera posición.
  La música de guitarra se escribe una octava más alta de lo que suena, así que
  el dibujo usa la altura escrita y el sonido, la real.
- **Canciones**: tres melodías de dominio público (Estrellita, Himno a la alegría
  y Mi corderito) en Sol mayor, tocadas con guitarra real, con modo «Tocar
  conmigo» que comprueba nota a nota con el micrófono e indica en qué cuerda y
  traste está cada una. El audio se analiza en tiempo real y nunca se graba.
- **Temporizador de práctica** de 5, 10, 15 o 20 minutos, recuperable mediante
  una hora final absoluta si se bloquea la pantalla o se cambia de sección.
- La detección de tono corre a ~22 Hz, no en cada frame: la autocorrelación sobre
  4096 muestras supera el millón de operaciones y a 60 Hz saturaría el hilo
  visual y la batería del móvil.

### Acompañamiento y datos

- **Panel familiar** con resumen, gráfico de minutos por semana (últimas ocho),
  historial de sesiones e insignias.
- **PIN familiar opcional** derivado con PBKDF2, sal aleatoria y SHA-256. Evita
  cambios accidentales; no es un control parental fuerte.
- Esquema de progreso local versionado con normalización defensiva de toda
  entrada, escritura temporal antes de reemplazar el dato principal y
  exportación e importación en JSON.
- **Modo oscuro** (Sistema / Claro / Oscuro), texto grande y respeto de
  `prefers-reduced-motion`.

### Estado del dispositivo

- Cuatro indicadores siempre visibles en la barra superior (🎤 micrófono,
  🔊 sonido, 🗣️ voz del dispositivo, 💾 guardado local). Pulsar cualquiera lleva
  al panel donde se gestionan.
- **Paso de micrófono en la primera configuración**: explica para qué se usa,
  permite concederlo ahí mismo y deja continuar sin él. Es opcional a propósito:
  las lecciones, el metrónomo y las canciones funcionan igual.
- **Panel «Requisitos y permisos»** en Familia, con el estado de cada elemento,
  qué se pierde si falta y qué hacer. Cuando el sistema tiene el micrófono
  denegado se indica que hay que cambiarlo en los ajustes del dispositivo, porque
  una aplicación no puede reconceder un permiso denegado.
- **Interruptor de micrófono propio de la aplicación**: al apagarlo, el afinador
  y «Tocar conmigo» quedan desactivados con un aviso claro.

### Distribución

- PWA instalable con aviso de instalación, de actualización y funcionamiento sin
  conexión.
- Compilación multiplataforma en CI: Windows (`.msi` y `.exe` NSIS), Android
  (`.apk` para instalación directa y `.aab` para Google Play), Linux (`.deb`,
  `.AppImage`, `.rpm`) y macOS (`.dmg` universal Intel + Apple Silicon).
- Flujo de release por etiqueta (`v*`) que publica los instaladores, genera
  `SHA256SUMS.txt` y redacta las notas a partir de este archivo.
- Landing page en GitHub Pages.

### Verificación

- 43 pruebas unitarias (Vitest) y 7 pruebas E2E (Playwright) en CI.
- Validadores de repositorio y de dominio que corren con Node sin instalar
  dependencias.

### Privacidad

- Sin cuentas, sin publicidad, sin analítica y sin servidor.
- El micrófono es el único permiso del sistema: **no se usa cámara ni ubicación**.
- El audio se analiza en memoria y nunca se graba ni se envía.

### Limitación conocida en Android

**Esta versión no se puede instalar encima de una anterior.** Hay que desinstalar
primero, y desinstalar borra el progreso guardado en el dispositivo.

El motivo es que el repositorio todavía no tiene configurada una clave de firma
permanente, así que cada compilación genera una distinta y Android rechaza la
actualización por no reconocer al autor. Está pendiente de resolver y explicado
en [docs/BUILD_MOBILE.md](docs/BUILD_MOBILE.md).

Para no perder la racha, las insignias ni el historial, sigue el procedimiento de
la [guía para familias](docs/PARENT_GUIDE.md#actualizar-la-aplicación-en-android):
exportar el respaldo antes de desinstalar e importarlo después.
