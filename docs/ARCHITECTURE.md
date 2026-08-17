# Arquitectura

## Objetivo

Mantener una sola interfaz y un solo currículo para web, Windows, Android e iOS, reduciendo duplicación y conservando la privacidad infantil.

## Capas

```text
Interfaz React
├── Ruta y lecciones
├── Afinador y desafío auditivo
├── Metrónomo y práctica
└── Panel familiar
        │
Dominio TypeScript
├── curriculum.ts
├── pitch.ts y audio.ts
├── metronome.ts
├── capabilities.ts
├── storage.ts y practiceTimer.ts
├── familyPin.ts
└── achievements.ts
        │
Plataformas
├── Navegador / PWA
└── Tauri 2 / Rust
    ├── Windows
    ├── Android
    └── iOS
```

## Contenido

Las 24 lecciones se definen como objetos TypeScript validados por pruebas de integridad. Cada lección incluye objetivo, habilidades, cuatro o más pasos, pregunta final, recompensa y guía visual opcional.

El contenido no está mezclado con la lógica del afinador ni con la persistencia. Una evolución futura puede moverlo a paquetes JSON firmados sin reescribir la interfaz.

## Audio

### Referencias

Las notas de referencia usan once grabaciones reales de guitarra de nailon (soundfont FluidR3_GM, CC BY 3.0): las seis cuerdas al aire y las notas pisadas de la escala de Sol mayor en primera posición. De cada muestra se guarda su frecuencia **medida** —`scripts/measure-samples.mjs` decodifica el mp3 y le aplica autocorrelación, así que el número no es una estimación— y se corrige con `playbackRate` a la altura exacta pedida, de modo que la calibración de 432 a 446 Hz se respeta sin volver a grabar. Cuando no existe muestra para esa altura se recurre a un tono sintetizado con varios armónicos, que no imita fielmente el timbre de una guitarra.

La referencia sostenida del desafío de oído también se sintetiza. Una cuerda pulsada se apaga sola: repetir la grabación en bucle devolvería el ataque una y otra vez y sonaría a repetición, no a nota sostenida.

### Afinación

1. `getUserMedia` abre el micrófono después de una acción explícita.
2. `AnalyserNode` entrega muestras temporales.
3. `autoCorrelate` estima la frecuencia fundamental entre 70 y 1300 Hz; el límite inferior baja lo suficiente para alcanzar la sexta cuerda al aire (82,41 Hz).
4. La frecuencia se convierte a MIDI relativo a la calibración elegida.
5. La interfaz presenta nota, frecuencia, cents e historial.

El análisis se ejecuta en el hilo principal, pero limitado a ~22 Hz (una detección cada 45 ms) en lugar de una por frame: la autocorrelación sobre 4096 muestras supera el millón de operaciones y a 60 Hz saturaba el hilo visual y la batería. `AudioWorklet` sigue pendiente para sacarlo del todo del hilo de la interfaz.

### Metrónomo

El pulso no se marca con `setInterval`: ese temporizador acumula deriva y el navegador lo estrangula cuando la pantalla se atenúa o la aplicación pasa a segundo plano.

1. Un temporizador despierta al planificador cada 25 ms.
2. El planificador agenda por adelantado todos los clics que caen dentro de los siguientes 120 ms, calculando cada instante sobre `AudioContext.currentTime`.
3. Web Audio reproduce cada clic en su instante exacto, con precisión de muestra.
4. La animación consume aparte los clics ya sonados, de modo que un frame perdido no descoloca el audio.

`metronome.ts` no depende del navegador: recibe el reloj y la función de agendado, así que la rejilla se verifica en pruebas contra un reloj simulado con jitter. Cambiar el tempo conserva la posición dentro del compás; cambiar la métrica lo reinicia.

### Desafío de nota

El desafío exige una nota MIDI coincidente y una desviación máxima de 15 cents durante varias detecciones consecutivas. Es una actividad motivacional, no una evaluación docente ni una medición acústica certificada.

## Requisitos del dispositivo

`capabilities.ts` declara lo que la aplicación necesita y en qué estado está:
micrófono, salida de sonido, voz del dispositivo y guardado local. **Solo el
micrófono pide permiso al sistema**; no se usa cámara ni ubicación, y una prueba
del propio módulo lo verifica para que no se añadan sin querer.

Cada estado distingue cuatro situaciones, porque no todas significan lo mismo
para la familia:

| Estado | Significado |
| --- | --- |
| `active` | Disponible y en uso. |
| `prompt` | Disponible, aún sin activar. El audio espera el primer gesto. |
| `blocked` | Denegado por el sistema. La aplicación no puede reconcederlo: hay que ir a los ajustes del dispositivo. |
| `unsupported` | El dispositivo o navegador no lo admite. |

Solo `blocked` y `unsupported` cuentan como carencia real. Tratar `prompt` como
fallo produciría una alarma en falso nada más abrir la aplicación, cuando el
contexto de audio todavía no ha arrancado.

El estado se refresca ante los avisos del propio sistema —`permissions.onchange`
del micrófono, `voiceschanged` de las voces— y tras cualquier gesto, que es
cuando el audio puede pasar a `running`. No hay sondeo periódico: gastaría
batería sin aportar nada.

`microphoneEnabled` es una preferencia de la aplicación, distinta del permiso del
sistema: permite al adulto desactivar el micrófono sin tocar los ajustes del
dispositivo, y evita que se vuelva a pedir.

## Persistencia

`storage.ts` mantiene un esquema `ProgressState` versionado. Los datos se normalizan al cargar e importar —cada campo con su tipo, su límite y su valor por defecto—, se escriben primero en una clave temporal y luego en la clave principal, de modo que una escritura interrumpida no deja el progreso a medias.

El lector acepta también claves de esquemas anteriores, para que un cambio de formato futuro no obligue a reescribir la carga. Los respaldos incluyen identificador de aplicación, versión de formato y fecha de exportación. Los respaldos de formatos futuros se rechazan para evitar una migración destructiva.

## PWA

El service worker guarda la carcasa, iconos e ilustraciones. Las navegaciones intentan red y usan la página almacenada como respaldo. Los recursos estáticos usan caché con actualización en segundo plano. Cuando existe un worker nuevo, la interfaz permite activarlo explícitamente y recargar la aplicación.

## Tauri

Tauri sirve el frontend compilado dentro de una WebView. La configuración mantiene permisos mínimos; los proyectos móviles reciben los textos y permisos de micrófono mediante el script `configure-mobile-permissions.mjs`.

## Decisiones de privacidad

- Sin servidor y sin autenticación.
- Sin SDK publicitario o analítico.
- Sin almacenamiento de audio.
- Sin permisos de cámara o ubicación.
- Exportación solo por acción de la persona usuaria.

## Riesgos conocidos

- Diferencias de micrófonos y procesamiento de audio entre dispositivos.
- `localStorage` puede borrarse al limpiar datos de la aplicación.
- La voz del dispositivo puede no existir o variar entre plataformas.
- El currículo no ha sido validado todavía por una profesora de guitarra infantil.
- La detección reconoce notas sueltas, no acordes: «Tocar conmigo» exige una nota por vez.

## Decisiones heredadas y por qué

- El progreso usa un esquema versionado y normaliza todo lo que lee.
- El temporizador guarda una hora final absoluta para recuperar el tiempo después de suspensión o navegación.
- El PIN familiar se deriva localmente con PBKDF2; la credencial guarda sal y hash, nunca el PIN en texto claro.
- Las insignias se calculan desde el progreso y no duplican estado persistente.
- La instalación y actualización PWA se comunican mediante eventos locales entre el registro del service worker y React.
- Los diálogos reutilizan un hook de foco para teclado y tecnologías de asistencia.
