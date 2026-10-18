"""Compone las portadas Kindle (1600x2560) a partir de la ilustración.

Uso: python3 scripts/make_cover.py cover/ilustracion.jpg cover/fonts cover
(fuentes OFL: Cormorant Garamond y Cinzel)
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

SRC, FONTS, OUTDIR = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, OFF = 1600, 2560, 300

def font(name, size, wght):
    f = ImageFont.truetype(f"{FONTS}/{name}", size)
    try: f.set_variation_by_axes([wght])
    except Exception: pass
    return f

def base():
    src = Image.open(SRC).convert("RGB")
    sc = src.resize((W, round(src.height * W / src.width)), Image.LANCZOS)
    canvas = Image.new("RGB", (W, H))
    # cielo prolongado: espejo difuminado de la franja superior
    top = ImageOps.flip(sc.crop((0, 0, W, OFF + 60))).filter(ImageFilter.GaussianBlur(28))
    canvas.paste(top, (0, 0))
    canvas.paste(sc.crop((0, 0, W, H - OFF)), (0, OFF))
    # fundido del corte y oscurecido para el título
    shade = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(shade)
    for y in range(0, 900):
        a = int(215 * (1 - y / 900) ** 1.6)
        d.line([(0, y), (W, y)], fill=a)
    for y in range(H - 320, H):
        d.line([(0, y), (W, y)], fill=int(170 * ((y - (H - 320)) / 320) ** 1.5))
    dark = Image.new("RGB", (W, H), (8, 12, 22))
    canvas = Image.composite(dark, canvas, shade)
    # suavizar la costura del espejo
    seam = canvas.crop((0, OFF - 40, W, OFF + 40)).filter(ImageFilter.GaussianBlur(10))
    canvas.paste(seam, (0, OFF - 40))
    return canvas

CREAM = (244, 228, 196)
GOLD = (226, 190, 128)

def centred(d, y, text, f, fill, spacing=0, shadow=True):
    if spacing:
        widths = [d.textlength(c, font=f) for c in text]
        total = sum(widths) + spacing * (len(text) - 1)
        x = (W - total) / 2
        for c, w in zip(text, widths):
            if shadow: d.text((x + 3, y + 4), c, font=f, fill=(0, 0, 0))
            d.text((x, y), c, font=f, fill=fill)
            x += w + spacing
        return
    w = d.textlength(text, font=f)
    if shadow:
        d.text(((W - w) / 2 + 4, y + 5), text, font=f, fill=(0, 0, 0))
    d.text(((W - w) / 2, y), text, font=f, fill=fill)

def compose(lines, saga, out):
    img = base()
    glow = Image.new("RGB", (W, H)); gd = ImageDraw.Draw(glow)
    d = ImageDraw.Draw(img)
    fa = font("Cinzel%5Bwght%5D.ttf", 62, 500)
    centred(d, 80, "ARIADNA ITURBE", fa, GOLD, spacing=14)
    size = 200
    ft = font("CormorantGaramond%5Bwght%5D.ttf", size, 600)
    while max(d.textlength(l, font=ft) for l in lines) > W - 160:
        size -= 6; ft = font("CormorantGaramond%5Bwght%5D.ttf", size, 600)
    y = 185
    for l in lines:
        centred(gd, y, l, ft, (90, 70, 40), shadow=False)
        y += int(size * 0.95)
    img = Image.blend(img, Image.composite(glow, img, glow.convert("L")).filter(ImageFilter.GaussianBlur(18)), 0.0) if False else img
    d = ImageDraw.Draw(img)
    y = 185
    for l in lines:
        centred(d, y, l, ft, CREAM)
        y += int(size * 0.95)
    fs = font("CormorantGaramond-Italic%5Bwght%5D.ttf", 58, 500)
    w = d.textlength(saga, font=fs)
    d.text((W - 70 - w + 3, H - 120 + 3), saga, font=fs, fill=(0, 0, 0))
    d.text((W - 70 - w, H - 120), saga, font=fs, fill=GOLD)
    img.save(out, quality=94, dpi=(300, 300))
    print(out, size)

compose(["El hombre", "de arriba"], "El Cuaderno de Ada Koch · Libro III", f"{OUTDIR}/portada_es.jpg")
compose(["The Man", "Upstairs"], "The Sketchbook of Ada Koch · Book Three", f"{OUTDIR}/cover_en.jpg")
