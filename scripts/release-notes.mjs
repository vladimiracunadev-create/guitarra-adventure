// Genera las notas de un release a partir de la versión y el CHANGELOG.
// Uso: node scripts/release-notes.mjs [version] > notes.md
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const version = (process.argv[2] || pkg.version).replace(/^v/, "");
const repo = "vladimiracunadev-create/guitarra-adventure";
const blob = `https://github.com/${repo}/blob/main`;

// Extrae la sección del CHANGELOG correspondiente a la versión.
function changelogSection(v) {
  const changelog = readFileSync(resolve(root, "CHANGELOG.md"), "utf8");
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => new RegExp(`^##\\s+${v.replace(/\./g, "\\.")}\\b`).test(line));
  if (start === -1) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+\d/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

const novedades = changelogSection(version) || "- Consulta el CHANGELOG para el detalle de cambios.";

const notes = `## Mi Aventura con la Guitarra v${version}

Aplicación educativa, privada y sin publicidad para aprender guitarra desde los 10 años.
24 lecciones, afinador cromático con once notas grabadas de guitarra real, metrónomo, canciones para tocar y práctica guiada. Misma base de código para Windows, Android, Linux, macOS y web (Tauri 2 + React).

🌐 Web / landing: https://vladimiracunadev-create.github.io/guitarra-adventure/

> La app **acompaña**, pero no reemplaza a una profesora o profesor de guitarra. La postura, el tamaño del instrumento y la colocación de los dedos siempre necesitan revisión de una persona.

## Novedades de esta versión

${novedades}

---

## Qué hay en este release

| Archivo | Plataforma | Descripción |
|---|---|---|
| \`Mi.Aventura.con.la.Guitarra_${version}_x64-setup.exe\` | Windows | Instalador recomendado (NSIS, por usuario) |
| \`Mi.Aventura.con.la.Guitarra_${version}_x64_en-US.msi\` | Windows | Instalador alternativo (MSI, para despliegue) |
| \`MiAventuraConLaGuitarra-${version}.apk\` | Android | Instalación directa en el teléfono (sideload) |
| \`MiAventuraConLaGuitarra-${version}.aab\` | Android | Paquete para publicar en Google Play |
| \`Mi.Aventura.con.la.Guitarra_${version}_amd64.AppImage\` | Linux | Portable: dar permiso de ejecución y abrir |
| \`Mi.Aventura.con.la.Guitarra_${version}_amd64.deb\` | Linux | Debian / Ubuntu (\`apt\`, \`dpkg -i\`) |
| \`Mi.Aventura.con.la.Guitarra-${version}-1.x86_64.rpm\` | Linux | Fedora / RHEL / openSUSE (\`dnf\`, \`rpm -i\`) |
| \`Mi.Aventura.con.la.Guitarra_${version}_universal.dmg\` | macOS | Universal (Intel + Apple Silicon), 10.15+ |
| \`Mi.Aventura.con.la.Guitarra_universal.app.tar.gz\` | macOS | App comprimida (alternativa al \`.dmg\`) |
| \`SHA256SUMS.txt\` | Todas | Hashes SHA-256 para verificar integridad antes de instalar |

---

## ¿Cuál descargo?

| Tu equipo… | Descarga |
|---|---|
| **Windows 10 u 11** | \`…_x64-setup.exe\` (si falta WebView2 se instala solo) |
| **Android 7.0 o superior** | \`…-${version}.apk\` |
| **Linux** (cualquier distro) | \`…_amd64.AppImage\` (portable, sin instalar) |
| **Linux Debian/Ubuntu** | \`…_amd64.deb\` |
| **Linux Fedora/RHEL** | \`…-1.x86_64.rpm\` |
| **Mac** (Intel o Apple Silicon) | \`…_universal.dmg\` |

**Firma Android:** \`ephemeral-ci-key\` (clave temporal de CI). El APK es instalable, pero para **actualizar** sobre una instalación previa se necesita un keystore persistente — ver [docs/BUILD_MOBILE.md](${blob}/docs/BUILD_MOBILE.md).
**Integridad:** verifica con \`SHA256SUMS.txt\`.

---

## Instalación

### Windows
1. Descarga \`…_x64-setup.exe\`.
2. (Recomendado) Verifica el hash SHA-256.
3. Ejecútalo. Si SmartScreen avisa: **Más información → Ejecutar de todas formas** (aún sin certificado de editor).

### Android
1. Descarga \`MiAventuraConLaGuitarra-${version}.apk\` en el teléfono y ábrelo.
2. Autoriza «instalar apps de orígenes desconocidos» para tu navegador o gestor de archivos.
3. (Recomendado) Verifica que el SHA-256 coincida con \`SHA256SUMS.txt\`.

### Linux
- **AppImage:** \`chmod +x Mi.Aventura*.AppImage\` y ejecútalo.
- **Debian/Ubuntu:** \`sudo dpkg -i Mi.Aventura*.deb\` (o \`sudo apt install ./Mi.Aventura*.deb\`).
- **Fedora/RHEL:** \`sudo rpm -i Mi.Aventura*.rpm\` (o \`sudo dnf install ./Mi.Aventura*.rpm\`).

### macOS
1. Abre el \`…_universal.dmg\` y arrastra la app a Aplicaciones.
2. La primera vez: **clic derecho → Abrir** (sin firma Apple Developer, Gatekeeper pedirá confirmación).

---

## Verificar integridad (opcional pero recomendado)

\`\`\`bash
# Linux / macOS
sha256sum -c SHA256SUMS.txt --ignore-missing
\`\`\`

\`\`\`powershell
# Windows (PowerShell)
Get-FileHash .\\Mi.Aventura.con.la.Guitarra_${version}_x64-setup.exe -Algorithm SHA256
\`\`\`

---

## Privacidad

Sin cuentas, sin publicidad, sin analítica y sin servidor. El nombre y el progreso se guardan solo en el dispositivo. El micrófono se usa en tiempo real para el afinador y las canciones, y **nunca se graba**.

**iOS:** en pausa — el proyecto compila en CI, pero distribuir requiere una cuenta de Apple Developer de pago (flujo manual \`ios.yml\`).

Cambios completos en [CHANGELOG.md](${blob}/CHANGELOG.md).
`;

process.stdout.write(notes);
