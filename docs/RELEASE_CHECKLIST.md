# Lista antes de publicar

## Pedagogía

- [ ] Revisión firmada por docente de guitarra infantil.
- [ ] Prueba con familias y registro de observaciones.
- [ ] Revisión de todas las ilustraciones y grabaciones.
- [ ] Licencias del repertorio documentadas.

## Calidad

- [ ] Generar y revisar `pnpm-lock.yaml` en un entorno con acceso al registro.
- [ ] `pnpm install --frozen-lockfile` funciona después de confirmar el lockfile.
- [ ] Pruebas, build web y build Tauri pasan.
- [ ] Pruebas E2E de navegación, importación y micrófono.
- [ ] Auditoría de accesibilidad, navegación por teclado y lectores de pantalla.
- [ ] Ensayo en Windows, al menos tres Android y dos iPhone/iPad.

## Seguridad y privacidad

- [ ] Revisión legal de privacidad infantil.
- [ ] Permisos, CSP, PIN familiar y migraciones de datos auditados.
- [ ] Archivos exportados revisados para evitar datos innecesarios.
- [ ] Proceso de reporte y corrección de vulnerabilidades.

## Artefactos publicados

Un flujo en verde **no** prueba que el artefacto sirva. Comprobar sobre el
archivo descargado, no sobre el registro de la compilación:

- [ ] Cada enlace de descarga de la landing resuelve (no 404) y el nombre del
      archivo coincide con el publicado en la release.
- [ ] Checksum del archivo descargado igual al de `SHA256SUMS.txt`.
- [ ] El instalador **contiene la aplicación**: abrir el `.exe`/`.apk` y
      comprobar que dentro están el `index.html`, el bundle JS, las once notas de
      guitarra y las ilustraciones. Un instalador que compila pero se instala vacío
      pasa todas las comprobaciones anteriores.
- [ ] Huella SHA-256 del certificado del APK **idéntica a la release anterior**
      (ver [BUILD_MOBILE.md](BUILD_MOBILE.md)). Si cambió, la actualización
      fallará en los dispositivos y se perderá el progreso.

## Distribución

- [ ] Identificadores definitivos y derechos del nombre.
- [ ] Certificados de firma y secretos fuera del repositorio.
- [ ] Iconos y capturas para cada tienda.
- [ ] Política de privacidad publicada.
- [ ] Actualizaciones seguras y plan de reversión.
