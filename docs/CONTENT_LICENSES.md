# Registro de licencias de contenido

## Contenido incluido

| Recurso | Origen | Licencia |
|---|---|---|
| Código fuente | Creado para este repositorio | MIT |
| Currículo y textos | Contenido original del repositorio | MIT |
| Ilustraciones SVG | Contenido original del repositorio | MIT |
| Icono de aplicación | Contenido original del repositorio | MIT |
| **Notas reales de guitarra** (`public/audio/guitarra/*.mp3`) | Soundfont **FluidR3_GM** de **Frank Wen**, instrumento *acoustic guitar (nylon)*, exportado por nota desde [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts) | **CC BY 3.0** — requiere atribución (ver abajo) |
| Clic de metrónomo, nota sostenida y tonos de respaldo | Generados en tiempo real por Web Audio | No corresponde archivo externo |
| Voz de instrucciones | Motor de síntesis instalado en el dispositivo | Sujeta al sistema del dispositivo; no se redistribuye audio |

### Atribución obligatoria (CC BY 3.0)

Las once notas reales de guitarra (Mi2, La2, Re3, Sol3, La3, Si3, Do4, Re4, Mi4,
Fa♯4 y Sol4) provienen del soundfont **Fluid (R3) General MIDI** creado por
**Frank Wen**, publicado bajo
[Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/).
Los archivos por nota se tomaron del instrumento *acoustic guitar (nylon)* del
proyecto [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts).
Esta atribución aparece también en la aplicación (panel Familia → privacidad).

Al reproducirlas, la afinación se corrige por software a la frecuencia exacta y a
la calibración elegida. Las frecuencias nativas guardadas en `src/lib/audio.ts`
están **medidas** con `pnpm measure:samples`, que decodifica cada mp3 y aplica
autocorrelación sobre la parte sostenida del sonido; no son estimaciones.

## Reglas para futuras incorporaciones

Antes de agregar una partitura, fotografía, tipografía, grabación o video:

1. Registra título, autoría, fuente, licencia y fecha de consulta.
2. Conserva la evidencia de autorización cuando no sea dominio público.
3. No supongas que una melodía infantil es libre por ser conocida.
4. Distingue la composición de una grabación concreta; pueden tener derechos diferentes.
5. Evita recursos con licencias incompatibles con la distribución prevista.
6. Incluye atribuciones visibles cuando la licencia lo exija.

En la versión 1.0.0 no se incluyen grabaciones comerciales ni partituras de
terceros. El único audio de terceros son las once notas de guitarra bajo
CC BY 3.0 registradas y atribuidas arriba. Las melodías de la sección Canciones
(Estrellita, Himno a la alegría, Mary tenía un corderito) son de dominio público;
se reproducen con esas mismas notas de guitarra.
