# Contribuir

## Principios

Toda contribución debe proteger la experiencia infantil, la privacidad y la salud física. No se aceptarán SDK de publicidad, rastreo oculto, rankings públicos o patrones diseñados para generar dependencia.

## Flujo

1. Crea una rama desde `main`.
2. Realiza cambios pequeños y documentados.
3. Ejecuta `pnpm validate:repo`, `pnpm test:domain`, `pnpm test` y `pnpm build`.
4. Describe el impacto pedagógico y técnico.
5. Para contenido musical, incluye origen y licencia.

## Nuevas lecciones

Cada lección debe contener:

- un objetivo observable;
- al menos cuatro pasos breves;
- instrucciones apropiadas para la edad;
- advertencia de seguridad cuando corresponda;
- una pregunta final explicativa;
- duración realista.

## Audio y partituras

No incluyas grabaciones, imágenes o partituras sin permiso. Prefiere obras de dominio público, contenido original o licencias compatibles.

## Persistencia y PIN

Cualquier cambio del esquema debe incluir migración, prueba de importación y actualización del formato de respaldo. El PIN familiar es una barrera frente a cambios accidentales; no agregues mensajes que prometan seguridad fuerte.
