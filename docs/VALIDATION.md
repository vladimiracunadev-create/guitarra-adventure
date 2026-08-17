# Validación técnica

## Capas de comprobación

### Sin instalar dependencias

```bash
node scripts/validate-repository.mjs
node --experimental-strip-types scripts/smoke-domain.mjs
node --experimental-strip-types scripts/test-domain.mjs
```

Estas comprobaciones validan:

- versiones sincronizadas entre npm, Tauri y Cargo;
- manifiesto PWA, iconos y documentos requeridos;
- 24 lecciones ordenadas, identificadores únicos y guías visuales existentes;
- detección sintética de frecuencias de guitarra (82,41 a 392 Hz) y conversión cromática;
- normalización del progreso al esquema local vigente;
- rechazo de respaldos ajenos o creados por formatos futuros;
- expiración de rachas, cálculo semanal y deduplicación defensiva;
- recuperación del temporizador mediante `endAt`;
- creación y comprobación del PIN familiar;
- reglas principales de insignias.

### Con dependencias instaladas

```bash
pnpm test
pnpm build
```

Vitest agrega pruebas unitarias para afinación, almacenamiento, PIN, temporizador, insignias y currículo. El build aplica TypeScript estricto y genera la aplicación Vite.

## Validaciones realizadas en el entorno de generación

- TypeScript estricto con declaraciones temporales porque no fue posible descargar paquetes.
- Suite de dominio de Node ejecutada correctamente.
- Parseo de JSON, XML, TOML y scripts JavaScript.
- Inspección de estructura, iconos PWA, service worker y migraciones.
- Generación e integridad del archivo ZIP y checksum.

## No validado aquí

- Instalación real mediante `pnpm install`.
- Ejecución de Vitest con sus dependencias reales.
- Compilación Vite con React real.
- Compilación Rust/Tauri.
- Instaladores Windows o paquetes Android/iOS.
- Permisos y precisión del micrófono en dispositivos físicos.
- Exactitud acústica con guitarras y salas reales, incluida la sexta cuerda al aire.
- Accesibilidad con lectores de pantalla.
- Revisión curricular por profesora de guitarra infantil.

Estos puntos continúan siendo requisitos de una versión publicable.
