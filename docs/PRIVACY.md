# Privacidad infantil

## Datos almacenados

Solo en el dispositivo:

- nombre o apodo;
- identificadores de lecciones completadas;
- fecha, duración, foco y comentario de prácticas;
- meta semanal, preferencias visuales y de sonido;
- calibración del afinador y cantidad de desafíos completados;
- resultados acumulados de lectura musical;
- estado temporal de una sesión de práctica;
- credencial derivada del PIN familiar, cuando se activa.

## Micrófono

El permiso se solicita al presionar “Activar micrófono”. Las muestras se procesan en memoria para estimar frecuencia. No se crea un archivo, no se conserva una grabación y no existe un servidor receptor.

La primera configuración ofrece concederlo, explicando para qué sirve, y permite continuar sin él: es opcional y sin él solo se pierde la comprobación de afinación. Un indicador en la barra superior muestra en todo momento si está activo, y el panel familiar incluye un interruptor para desactivarlo dentro de la aplicación, de modo que no se vuelva a pedir.

Cuando la aplicación solicita el permiso para comprobar su estado, libera el micrófono de inmediato: interesa la autorización, no capturar audio. Mantener el flujo abierto encendería el indicador de grabación del sistema sin motivo.

## Voz

La lectura de instrucciones usa `SpeechSynthesis` del sistema cuando está disponible. La aplicación no envía el texto por su cuenta; el comportamiento exacto de las voces depende del sistema operativo instalado.

## Exportación e importación

La exportación genera un JSON que puede contener el apodo y comentarios escritos. En móviles compatibles puede abrir la hoja de compartir del sistema; la aplicación no selecciona un destino automáticamente. Una persona adulta debe decidir dónde guardarlo y con quién compartirlo. La importación valida formato, limita tamaño y normaliza valores antes de reemplazar el progreso local.

## Servicios no incluidos

- Publicidad.
- Analítica.
- Inicio de sesión.
- Redes sociales.
- Geolocalización.
- Cámara.
- Sincronización en la nube.

## Riesgo de pérdida

Los datos locales pueden desaparecer al borrar almacenamiento, desinstalar o restablecer el dispositivo. Se recomienda exportar respaldos periódicos.

## Antes de publicar

Se requiere una revisión legal y de privacidad aplicable a los países de distribución y a los requisitos vigentes de cada tienda. Este documento describe el diseño técnico, no constituye asesoría legal.

## PIN familiar

La aplicación permite crear un PIN local de cuatro números para evitar cambios accidentales en el panel familiar. Se almacena una credencial derivada con PBKDF2, sal aleatoria y SHA-256; el PIN no se guarda en texto claro. Debido al espacio reducido de cuatro dígitos y al acceso local al dispositivo, esta función no debe presentarse como protección fuerte ni como control parental del sistema operativo.

## Temporizador y resultados

El estado incompleto del temporizador, las respuestas de lectura musical y las insignias también permanecen en el dispositivo. No se envían eventos de uso, resultados ni identificadores a terceros.
