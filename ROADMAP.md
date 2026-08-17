# Hoja de ruta

## Publicado

### 1.0 — Primera versión pública (actual)

- **24 lecciones en seis mundos** con ilustraciones propias, insignias y panel
  familiar.
- **Afinador cromático** con once notas grabadas de guitarra de nailon y
  afinación nativa medida, calibración de La entre 432 y 446 Hz, desafío de oído
  y nota de referencia sostenida.
- **Metrónomo sin deriva**: los clics se agendan sobre el reloj de `AudioContext`
  con anticipación, en lugar de dispararse desde `setInterval`. El pulso se
  mantiene exacto aunque el temporizador llegue tarde o la animación se detenga.
- **Canciones** de dominio público en Sol mayor con modo «Tocar conmigo», que
  detecta con el micrófono si la niña toca cada nota en secuencia.
- **Lectura musical** en pentagrama y en tablatura, con la escala de Sol mayor de
  la primera posición.
- **Estado del dispositivo siempre visible** (micrófono, sonido, voz y guardado
  local), panel «Requisitos y permisos» e interruptor propio de micrófono.
- **Modo oscuro**, texto grande y respeto de `prefers-reduced-motion`.
- Compilación automática de instaladores (Windows, Android, Linux, macOS) por
  GitHub Actions y landing page en GitHub Pages.

> **Limitación conocida:** en Android esta versión no se instala sobre una
> anterior; hay que desinstalar, y eso borra el progreso. Falta configurar la
> clave de firma permanente (ver abajo). El procedimiento para no perder nada
> está en la [guía para familias](docs/PARENT_GUIDE.md#actualizar-la-aplicación-en-android).

## Planificado

### Pendiente inmediato — Clave de firma de Android

Sin ella, **cada versión nueva obliga a desinstalar la anterior y borra el
progreso**: racha, insignias, lecciones completadas e historial. Es lo primero
que conviene resolver, porque cada release publicada mientras tanto añade otra
reinstalación con pérdida de datos.

Es una configuración de una sola vez, de unos cinco minutos, con los pasos en
[docs/BUILD_MOBILE.md](docs/BUILD_MOBILE.md#configurar-la-clave-permanente). No
se puede aplicar de forma retroactiva: las instalaciones anteriores necesitarán
igualmente una última desinstalación.

### 1.1 — Más guitarra

- **Más acordes** (Mi mayor, La menor, Sol y Re) con diagramas y cambios
  cronometrados.
- **Rasgueos** con patrones escritos y comprobación de pulso.
- **Cejilla** y segunda posición, cuando la mano de la niña lo permita.
- Repertorio de dominio público ampliado, versionado y con licencias documentadas.

### 1.2 — Alcance y hábitos

- **Internacionalización (es / en / pt)**: interfaz y currículo traducidos y verificados.
- **Perfiles múltiples** (hermanos) en un mismo dispositivo, con migración de esquema.
- **Recordatorios de práctica** opt-in mediante notificaciones locales (plugin Tauri en móvil).
- **PWA jugable** publicada en GitHub Pages para probar sin instalar.
- **Auditoría Lighthouse/PWA** en CI.

### 1.3 — Interactividad musical

- Reconocimiento de ataques, duración y ritmo; lectura a primera vista.
- Detección de acordes completos, no solo de notas sueltas.
- `AudioWorklet` para análisis fuera del hilo visual.
- Calibración de ruido ambiental y tolerancias por micrófono.

### Pendiente transversal — Validación pedagógica (requiere personas)

- **Revisión completa por una profesora o profesor de guitarra infantil** (ver
  [docs/TEACHER_REVIEW.md](docs/TEACHER_REVIEW.md)). No puede sustituirse por software.
- Prueba piloto con familias y observación de sesiones reales.
- Ensayos acústicos con distintos micrófonos y dispositivos.
- Ajuste del currículo según resultados medidos, no solo opiniones.

### Distribución en tiendas

- Auditoría de accesibilidad y privacidad infantil.
- Actualización firmada de escritorio (updater Tauri).
- Compilación de iOS con cuenta Apple Developer.
- Publicación en Microsoft Store, Google Play y App Store.
