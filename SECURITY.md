# Seguridad

No publiques vulnerabilidades que expongan datos, permisos o dispositivos de usuarios. Describe de forma privada:

- versión afectada;
- plataforma;
- pasos mínimos para reproducir;
- impacto esperado;
- posible mitigación.

El prototipo no utiliza backend. Los principales riesgos son permisos de micrófono, dependencias, contenido no confiable y cambios futuros en persistencia o sincronización.


## PIN familiar

La credencial local usa PBKDF2, sal aleatoria y SHA-256, pero un PIN de cuatro dígitos tiene un espacio de búsqueda reducido. Esta función no protege frente a acceso técnico al dispositivo. Los informes deben considerar filtración de credenciales, bloqueo permanente, degradación de parámetros y errores de migración.
