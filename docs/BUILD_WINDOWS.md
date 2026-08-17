# Compilar para Windows

## Requisitos

1. Windows 10 u 11 actualizado.
2. Node.js 22.12 o superior.
3. pnpm mediante Corepack.
4. Rust estable con MSVC.
5. Microsoft C++ Build Tools con “Desktop development with C++”.
6. Microsoft Edge WebView2 Runtime.

## Preparación

```powershell
corepack enable
corepack prepare pnpm@10.14.0 --activate
rustup default stable-msvc
pnpm install
```

## Desarrollo

```powershell
pnpm desktop:dev
```

Esto inicia Vite y abre la ventana nativa de Tauri.

## Pruebas y compilación web

```powershell
pnpm test
pnpm build
```

## Crear instalador

```powershell
pnpm desktop:build
```

Tauri genera los formatos habilitados para Windows dentro de:

```text
src-tauri/target/release/bundle/
```

## Firma

El instalador local puede generarse sin certificado para pruebas. Para distribución pública se recomienda firma de código y un proceso de actualización firmado.

## Micrófono

Windows mostrará su propio control de privacidad. Verifica:

`Configuración > Privacidad y seguridad > Micrófono`

La aplicación no necesita un plugin Tauri de grabación porque utiliza el micrófono del WebView mediante `getUserMedia`.
