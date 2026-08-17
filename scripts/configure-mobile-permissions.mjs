import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const androidManifest = join(root, "src-tauri", "gen", "android", "app", "src", "main", "AndroidManifest.xml");
const permission = '<uses-permission android:name="android.permission.RECORD_AUDIO" />';

if (existsSync(androidManifest)) {
  const content = readFileSync(androidManifest, "utf8");
  if (!content.includes("android.permission.RECORD_AUDIO")) {
    const updated = content.replace(/<manifest([^>]*)>/, `<manifest$1>\n    ${permission}`);
    writeFileSync(androidManifest, updated);
    console.log("✓ Permiso RECORD_AUDIO agregado a AndroidManifest.xml");
  } else {
    console.log("✓ Android ya tiene permiso de micrófono");
  }
} else {
  console.log("ℹ Android aún no está inicializado; ejecuta: pnpm android:init");
}

// `tauri android init` crea el proyecto con los iconos por defecto de Tauri y
// no recoge los de `src-tauri/icons/android`, que es donde los deja
// `tauri icon`. Sin esta copia la aplicación se publicaría con el logo
// genérico de Tauri en lugar del suyo.
const iconosAndroid = join(root, "src-tauri", "icons", "android");
const resAndroid = join(root, "src-tauri", "gen", "android", "app", "src", "main", "res");

if (existsSync(iconosAndroid) && existsSync(resAndroid)) {
  cpSync(iconosAndroid, resAndroid, { recursive: true, force: true });
  const densidades = readdirSync(iconosAndroid).filter((name) => name.startsWith("mipmap"));
  console.log(`✓ Iconos de Android copiados al proyecto generado (${densidades.length} densidades)`);
} else if (!existsSync(iconosAndroid)) {
  console.log("⚠ Faltan los iconos de Android; genéralos con: pnpm tauri icon assets/icon-source.png");
} else {
  console.log("ℹ Android aún no está inicializado; los iconos se copiarán tras: pnpm android:init");
}

const appleRoot = join(root, "src-tauri", "gen", "apple");
function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const infoFiles = walk(appleRoot).filter((path) => path.endsWith("Info.plist"));
for (const infoFile of infoFiles) {
  const content = readFileSync(infoFile, "utf8");
  if (!content.includes("NSMicrophoneUsageDescription")) {
    const entry = "  <key>NSMicrophoneUsageDescription</key>\n  <string>El micrófono se usa únicamente para mostrar la afinación de la guitarra en tiempo real. El audio no se graba ni se envía.</string>\n";
    writeFileSync(infoFile, content.replace("</dict>", `${entry}</dict>`));
    console.log(`✓ Descripción de micrófono agregada a ${infoFile}`);
  }
}

if (!existsSync(appleRoot)) {
  console.log("ℹ iOS aún no está inicializado; ejecútalo desde macOS con: pnpm ios:init");
}
