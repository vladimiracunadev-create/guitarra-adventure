# Guía para agentes de desarrollo

- Usar `pnpm`, no npm ni yarn.
- Mantener una sola base de código para web, Windows, Android e iOS.
- No agregar servicios externos sin una justificación de privacidad.
- Todo contenido para menores debe ser claro, seguro y no competitivo.
- Mantener `src/data/curriculum.ts` separado de la interfaz.
- Agregar pruebas para cambios en afinación, progreso o cálculo musical.
- No modificar proyectos bajo `src-tauri/gen/` manualmente; usar scripts reproducibles.
- Documentar licencias de imágenes, audio y repertorio.

- Mantener compatibles las migraciones del esquema de progreso y validar toda importación.
- No presentar el contenido como método validado sin completar `docs/TEACHER_REVIEW.md`.
- Ejecutar `pnpm test:domain` para cambios puros que deban verificarse sin navegador.
- Mantener el PIN familiar como protección contra cambios accidentales; no describirlo como control parental fuerte.
- Los cambios del service worker deben incrementar el nombre de caché y conservar el flujo de actualización explícita.
