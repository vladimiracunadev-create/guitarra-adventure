// Generador del icono de la aplicación.
//
// Dibuja la guitarra a 4× y reduce a 1024 px, para que los bordes queden suaves
// sin depender de bibliotecas de rasterizado externas. A partir de esa fuente,
// `pnpm tauri icon` genera los formatos de cada plataforma; aquí se producen
// además los iconos de la PWA, que Tauri no cubre.
//
// Uso: node scripts/generate-icons.mjs   (requiere Python con Pillow)

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

const script = String.raw`
from PIL import Image, ImageDraw
import os

S = 4096              # lienzo de trabajo
FINAL = 1024
CX = S // 2

MORADO_CLARO = (118, 88, 247)
MORADO_OSCURO = (78, 47, 211)
MADERA_CLARA = (247, 200, 130)
MADERA = (232, 155, 60)
MADERA_OSCURA = (150, 82, 20)
DIAPASON = (52, 33, 74)
TRASTE = (201, 194, 180)
CUERDA = (255, 248, 235)

def lienzo():
    return Image.new("L", (S, S), 0)

def marca(fn):
    capa = lienzo()
    fn(ImageDraw.Draw(capa))
    return capa

def fondo_degradado():
    base = Image.new("RGB", (S, S), MORADO_CLARO)
    px = base.load()
    for y in range(S):
        t = y / (S - 1)
        c = tuple(int(a + (b - a) * t) for a, b in zip(MORADO_CLARO, MORADO_OSCURO))
        for x in range(S):
            px[x, y] = c
    return base

def esquinas_redondeadas(img, radio):
    mascara = marca(lambda d: d.rounded_rectangle([0, 0, S - 1, S - 1], radius=radio, fill=255))
    img.putalpha(mascara)
    return img

# --- Silueta de la caja -----------------------------------------------------
# El contorno se construye por composición: se unen los dos bombos y el centro,
# y luego se restan dos círculos laterales para tallar la cintura. Dibujar la
# curva a mano daría una forma menos limpia al reducir.

BOMBO_INF_Y, BOMBO_INF_RX, BOMBO_INF_RY = 3152, 848, 640
BOMBO_SUP_Y, BOMBO_SUP_RX, BOMBO_SUP_RY = 2400, 672, 512
CINTURA_Y, CINTURA_R, CINTURA_DX = 2792, 540, 1150

def silueta_caja():
    m = lienzo()
    d = ImageDraw.Draw(m)
    d.ellipse([CX - BOMBO_INF_RX, BOMBO_INF_Y - BOMBO_INF_RY,
               CX + BOMBO_INF_RX, BOMBO_INF_Y + BOMBO_INF_RY], fill=255)
    d.ellipse([CX - BOMBO_SUP_RX, BOMBO_SUP_Y - BOMBO_SUP_RY,
               CX + BOMBO_SUP_RX, BOMBO_SUP_Y + BOMBO_SUP_RY], fill=255)
    d.rectangle([CX - 672, BOMBO_SUP_Y, CX + 672, BOMBO_INF_Y], fill=255)
    for signo in (-1, 1):
        cx = CX + signo * CINTURA_DX
        d.ellipse([cx - CINTURA_R, CINTURA_Y - CINTURA_R,
                   cx + CINTURA_R, CINTURA_Y + CINTURA_R], fill=0)
    return m

def degradado_madera():
    g = Image.new("RGB", (S, S), MADERA)
    px = g.load()
    y0, y1 = BOMBO_SUP_Y - BOMBO_SUP_RY, BOMBO_INF_Y + BOMBO_INF_RY
    for y in range(S):
        t = min(1.0, max(0.0, (y - y0) / (y1 - y0)))
        c = tuple(int(a + (b - a) * t) for a, b in zip(MADERA_CLARA, MADERA))
        for x in range(S):
            px[x, y] = c
    return g

def construir():
    img = esquinas_redondeadas(fondo_degradado(), int(S * 0.22))

    d = ImageDraw.Draw(img)

    # Clavijero con seis clavijas, por encima del mástil.
    d.rounded_rectangle([1760, 384, 2336, 992], radius=128, fill=MADERA_OSCURA)
    for lado in (1872, 2224):
        for y in (544, 720, 896):
            d.ellipse([lado - 64, y - 64, lado + 64, y + 64], fill=MADERA_CLARA)

    # Mástil hasta donde empieza la caja.
    d.rounded_rectangle([1824, 896, 2272, 2304], radius=80, fill=MADERA_OSCURA)

    # Caja de resonancia.
    img.paste(degradado_madera(), (0, 0), silueta_caja())

    d = ImageDraw.Draw(img)

    # Diapasón sobre el mástil, con trastes.
    d.rounded_rectangle([1856, 944, 2240, 2256], radius=64, fill=DIAPASON)
    for y in (1248, 1536, 1808, 2048):
        d.rectangle([1856, y - 14, 2240, y + 14], fill=TRASTE)

    # Cejuela.
    d.rounded_rectangle([1824, 888, 2272, 976], radius=32, fill=MADERA_CLARA)

    # Boca con aro.
    d.ellipse([CX - 344, 2816 - 344, CX + 344, 2816 + 344], fill=MADERA_OSCURA)
    d.ellipse([CX - 288, 2816 - 288, CX + 288, 2816 + 288], fill=DIAPASON)

    # Puente.
    d.rounded_rectangle([1664, 3296, 2432, 3520], radius=72, fill=MADERA_OSCURA)

    # Cuerdas: del clavijero al puente, abriéndose ligeramente.
    for dx_arriba, dx_abajo, grosor in (
        (-160, -272, 34), (-96, -160, 30), (-32, -48, 26),
        (32, 64, 22), (96, 176, 20), (160, 288, 18)
    ):
        d.line([(CX + dx_arriba, 448), (CX + dx_abajo, 3400)], fill=CUERDA, width=grosor)

    return img.resize((FINAL, FINAL), Image.LANCZOS)

raiz = os.environ["RAIZ"]
icono = construir()

fuente = os.path.join(raiz, "assets", "icon-source.png")
os.makedirs(os.path.dirname(fuente), exist_ok=True)
icono.save(fuente)
print("fuente:", fuente)

# --- Iconos de la PWA -------------------------------------------------------
iconos = os.path.join(raiz, "public", "icons")
icono.save(os.path.join(iconos, "app-icon.png"))
icono.resize((512, 512), Image.LANCZOS).save(os.path.join(iconos, "icon-512.png"))
icono.resize((192, 192), Image.LANCZOS).save(os.path.join(iconos, "icon-192.png"))

# El icono maskable se recorta con formas distintas según el lanzador de
# Android, así que va a sangre y con el dibujo dentro de la zona segura (80%).
maskable = Image.new("RGBA", (512, 512), (78, 47, 211, 255))
interior = icono.resize((410, 410), Image.LANCZOS)
maskable.paste(interior, (51, 51), interior)
maskable.save(os.path.join(iconos, "icon-maskable-512.png"))
print("PWA: app-icon, 512, 192, maskable-512")
`;

execFileSync("python", ["-c", script], {
  cwd: raiz,
  env: { ...process.env, RAIZ: raiz },
  stdio: "inherit"
});
