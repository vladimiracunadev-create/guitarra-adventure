# Compilar para Android e iOS

> **La forma recomendada de obtener instaladores es GitHub Actions.** Al empujar una
> etiqueta `v*` (por ejemplo `v1.0.0`), el flujo `release.yml` compila el `.apk` y el
> `.aab` de Android y los publica en la GitHub Release. iOS se genera con el flujo
> manual `ios.yml`. Las secciones siguientes describen la compilación local.

## Firma de Android en CI

> ## ⚠️ PENDIENTE — la clave permanente no está configurada
>
> **Estado actual:** el repositorio no tiene los secrets del keystore, así que
> cada release firma el APK con una clave nueva y desechable.
>
> **Qué provoca:** ninguna versión se puede instalar sobre otra. Cada
> actualización obliga a desinstalar, y desinstalar **borra el progreso** de la
> niña: racha, insignias, lecciones completadas e historial de práctica.
>
> **Cómo convivir con ello mientras tanto:** el procedimiento de exportar el
> respaldo, desinstalar, instalar e importar está en la
> [guía para familias](PARENT_GUIDE.md#actualizar-la-aplicación-en-android).
>
> **Cómo resolverlo:** los cuatro pasos están más abajo, en
> [«Configurar la clave permanente»](#configurar-la-clave-permanente). Es una
> configuración de una sola vez, de unos cinco minutos. Después no se vuelve a
> tocar y las actualizaciones se instalan encima sin perder nada.
>
> **Por qué merece la pena hacerlo pronto:** cada versión que se publique sin la
> clave añade otra reinstalación con pérdida de datos. Y a partir del momento en
> que se configure, las instalaciones anteriores seguirán necesitando **una**
> desinstalación más — no se puede evitar de forma retroactiva.

### Para qué sirve la clave de firma

Android exige que toda aplicación esté firmada. La firma no cifra ni protege el
contenido: sirve para responder a una única pregunta cuando llega una
actualización.

> ¿Esta versión nueva viene de quien hizo la que ya está instalada?

Android compara la firma de la versión instalada con la de la nueva. Si
coinciden, la reemplaza **conservando los datos locales**. Si no coinciden, se
niega a instalarla: asume que alguien intenta suplantar la aplicación. Es como el
sello de una carta — no oculta nada, solo acredita quién la envía.

El *keystore* es el archivo que contiene esa clave, protegido con una contraseña.

**Consecuencia práctica para esta aplicación:** el progreso de la niña (racha,
insignias, lecciones completadas e historial de práctica) vive en el
almacenamiento local del dispositivo. Si Android rechaza la actualización, hay
que desinstalar, y desinstalar borra ese almacenamiento. Firmar siempre con la
misma clave es lo que convierte una actualización en algo transparente en vez de
una pérdida de datos.

Por eso el keystore persistente no es un detalle de publicación: es lo que hace
que actualizar la aplicación sea una experiencia normal.

### Los dos modos del flujo

El flujo `release.yml` firma el APK automáticamente:

- **Sin secrets:** genera un keystore efímero por compilación y lo descarta al
  terminar. Cada versión queda firmada con una clave distinta, así que **ninguna
  puede instalarse sobre otra** ni publicarse en Google Play. Solo sirve para
  probar una primera versión suelta. El flujo emite un aviso cuando ocurre.
- **Con keystore persistente (recomendado, sin configurar todavía):** el flujo usa
  siempre la misma clave, tomada de cuatro secrets del repositorio.

### Configurar la clave permanente

Una sola vez, unos cinco minutos. Los cuatro secrets que hay que dejar creados:

| Secret | Contenido |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Keystore `.jks` codificado en base64 |
| `ANDROID_KEY_ALIAS` | Alias de la clave dentro del keystore |
| `ANDROID_STORE_PASSWORD` | Contraseña del keystore |
| `ANDROID_KEY_PASSWORD` | Contraseña de la clave |

#### 1. Generar el keystore

En Linux o macOS:

```bash
keytool -genkeypair -v -keystore release.jks -alias guitarra \
  -keyalg RSA -keysize 2048 -validity 10000
```

En Windows, `keytool` viene con Android Studio y no está en el `PATH`. Conviene
añadirlo a la sesión en lugar de llamarlo por su ruta entre comillas: en
PowerShell, una ruta entrecomillada al principio de una línea se interpreta como
texto y falla con `Token inesperado`, salvo que se anteponga el operador `&`.

```powershell
$env:Path = "C:\Program Files\Android\Android Studio\jbr\bin;$env:Path"
keytool -genkeypair -v -keystore release.jks -alias guitarra -keyalg RSA -keysize 2048 -validity 10000
```

Pedirá una contraseña (anótala) y unos datos de identificación. Con el formato
por defecto (PKCS12) la contraseña de la clave es la misma que la del almacén, así
que los dos secrets de contraseña llevan el mismo valor.

No pases la contraseña con `-storepass`: quedaría guardada en el historial del
intérprete en texto plano.

#### 2. Crear los secrets

La vía más fiable es la CLI de GitHub, porque el formulario web es fácil de dejar
a medias (hay que pulsar **Add secret** al final, y la pestaña correcta es
*Secrets*, no *Variables*).

```powershell
gh secret set ANDROID_KEY_ALIAS --body guitarra
```

```powershell
gh secret set ANDROID_KEYSTORE_BASE64 --body ([Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\Documents\release.jks")))
```

> La ruta del keystore debe ser **absoluta**. `[IO.File]` es .NET y no sigue el
> `cd` de PowerShell: resuelve las rutas relativas contra el directorio donde
> arrancó el proceso, no contra la ubicación actual.

Las dos contraseñas, en modo interactivo, para que no queden en el historial
(cada comando responde `Paste your secret:`):

```powershell
gh secret set ANDROID_STORE_PASSWORD
```

```powershell
gh secret set ANDROID_KEY_PASSWORD
```

#### 3. Comprobar que quedaron guardados

```bash
gh secret list
```

Deben aparecer los cuatro. Si la lista sale vacía, no se guardaron: repite el
paso 2. Conviene comprobarlo también en los otros sitios donde suelen acabar por
error —secrets de entorno, de Dependabot o la pestaña *Variables*—, porque el
flujo solo lee los **secrets de repositorio**.

#### 4. Guardar el archivo

Guarda `release.jks` fuera del repositorio y con copia de respaldo. Es la
identidad de la aplicación: quien lo tenga puede publicar actualizaciones. Si se
pierde, no hay forma de volver a firmar con esa clave y **todas las instalaciones
existentes quedan sin ruta de actualización**, de forma irreversible.

### Comprobar con qué clave está firmado un APK

Dos APK firmados con claves distintas no se pueden instalar uno sobre otro. Para
comparar la huella del certificado:

```bash
keytool -printcert -jarfile MiAventuraConLaGuitarra-<version>.apk
```

Si la línea `SHA256:` cambia entre dos versiones, la actualización en el
dispositivo fallará y habrá que desinstalar primero (perdiendo el progreso
guardado, salvo que se exporte antes desde el panel Familia).

Esta es la comprobación que confirma que el keystore persistente quedó bien
configurado: **la huella debe ser idéntica en dos releases consecutivas**. Que el
workflow termine en verde no lo demuestra — con keystore efímero también termina
en verde, y firma cada versión con una clave distinta.

### Historial de firmas

| Versión | Huella SHA-256 del certificado |
| --- | --- |
| 1.0.0 | Clave efímera generada en CI, irrecuperable |

La 1.0.0 se publicó antes de configurar el keystore persistente. Quien la tenga
instalada necesitará **una desinstalación más** para pasar a la primera versión
firmada con la clave permanente. Conviene exportar el respaldo desde el panel
Familia antes de hacerlo, e importarlo después. A partir de ahí, las
actualizaciones se instalan encima sin pérdida.

Anota aquí la huella de cada release en cuanto se publique: es el registro que
permite detectar un cambio de clave antes de que rompa las instalaciones.

## Android

### Requisitos

- Android Studio.
- Android SDK y NDK compatibles con Tauri.
- Java/JDK configurado.
- Rust y destinos Android.
- Node.js y pnpm.

### Inicialización

```bash
pnpm install
pnpm android:init
```

El comando ejecuta Tauri y luego `scripts/configure-mobile-permissions.mjs`, que agrega:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

Si vuelves a generar el proyecto nativo, ejecuta:

```bash
pnpm mobile:permissions
```

### Desarrollo y compilación

```bash
pnpm android:dev
pnpm android:build
```

La publicación en Google Play requiere una clave de firma, ficha de privacidad, iconos rasterizados y capturas definitivas.

## iOS

### Requisitos

- Un equipo macOS.
- Xcode.
- Destinos Rust para iOS.
- Cuenta Apple Developer para instalar en dispositivos o publicar.

### Inicialización

```bash
pnpm install
pnpm ios:init
pnpm mobile:permissions
```

La descripción `NSMicrophoneUsageDescription` está en `src-tauri/Info.ios.plist`; el script revisa también archivos generados.

### Desarrollo y compilación

```bash
pnpm ios:dev
pnpm ios:build
```

## Antes de publicar

- Reemplazar el icono SVG por el conjunto de iconos PNG requerido por cada tienda.
- Probar afinación con distintos micrófonos y ambientes.
- Revisar textos de privacidad infantil.
- Probar teléfonos de gama baja y tabletas.
- Realizar evaluación pedagógica con profesora o profesor de guitarra.
- Preparar política de soporte y eliminación de datos.
