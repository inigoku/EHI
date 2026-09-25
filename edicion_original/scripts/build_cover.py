#!/usr/bin/env python3
"""Cubiertas de «El horizonte interior» (edición ilustrada), en LaTeX para
usar la misma EB Garamond del interior.

Saca, en edicion_original/:

  El_Horizonte_Interior_ilustrada_portada_frontal.pdf   frente con sangre (6,25 x 9,25")
  El_Horizonte_Interior_ilustrada_cubierta_tapadura.pdf  envolvente de tapa dura KDP
  El_Horizonte_Interior_ilustrada_cubierta_tapablanda.pdf  envolvente de tapa blanda KDP
  El_Horizonte_Interior_ilustrada_cubierta_ebook.jpg    portada del EPUB (1600 x 2560)

El lomo se calcula sobre las páginas reales de El_Horizonte_Interior_ilustrada_6x9.pdf
(el mismo interior sirve para tapa dura y tapa blanda). Papel a color: 0,002347"/página.
Misma física de KDP que edicion_cuentos/scripts/build_cover*.py.

    python3 scripts/build_cover.py          (desde edicion_original/)
"""
import shutil, subprocess, sys, tempfile
from pathlib import Path
import pymupdf

BASE = Path(__file__).resolve().parent.parent
INTERIOR = BASE / "El_Horizonte_Interior_ilustrada_6x9.pdf"
ART = BASE / "img" / "portada_ilustrada_2k.jpg"   # óleo del círculo de agua en calma (1728 x 2576)
DPI = 300

from PIL import Image, ImageChops, ImageFilter

def upscaled(target_h_px):
    im = Image.open(ART).convert("RGB")
    while im.height < target_h_px:
        f = min(2.0, target_h_px / im.height)
        im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
    return im

def grain(im, strength=7):
    noise = Image.effect_noise(im.size, strength).convert("L")
    noise = Image.merge("RGB", (noise, noise, noise))
    return ImageChops.overlay(im, noise.point(lambda v: 118 + (v - 128) // 3))

def vertical_veil(im, top_frac, bottom_frac, top_alpha, bottom_alpha, top_falloff=0.85, bottom_falloff=1.1):
    w, h = im.size
    veil = Image.new("L", (1, h), 0); px = veil.load()
    for y in range(h):
        a = 0.0
        if y < h * top_frac:
            a = top_alpha * (1 - y / (h * top_frac)) ** top_falloff
        tail = h * (1 - bottom_frac)
        if y > tail:
            a = max(a, bottom_alpha * ((y - tail) / (h * bottom_frac)) ** bottom_falloff)
        px[0, y] = int(255 * a)
    return Image.composite(Image.new("RGB", (w, h), (8, 22, 26)), im, veil.resize((w, h)))

def cover_field(width_in, height_in, flip=False):
    w_px, h_px = round(width_in * DPI), round(height_in * DPI)
    im = upscaled(h_px)
    s = max(w_px / im.width, h_px / im.height)
    if s > 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, tp = max(0, (im.width - w_px) // 2), max(0, (im.height - h_px) // 2)
    im = im.crop((l, tp, l + w_px, tp + h_px))
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im

def front_raster(path):
    w, h = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
    grain(vertical_veil(cover_field(w, h), 0.46, 0.30, 0.68, 0.72)).save(path, "JPEG", quality=94, subsampling=0, dpi=(DPI, DPI))

def wrap_raster(path, w_in, h_in, spine_in):
    W, H = round(w_in * DPI), round(h_in * DPI)
    field = Image.new("RGB", (W, H), (8, 22, 26))
    half = (w_in - spine_in) / 2
    front, back = cover_field(half, h_in), cover_field(half, h_in, flip=True)
    field.paste(back, (0, 0)); field.paste(front, (W - front.width, 0))
    art = vertical_veil(field, 0.44, 0.28, 0.66, 0.70)
    wash = Image.new("RGB", (back.width, H), (9, 24, 28))
    art.paste(Image.blend(art.crop((0, 0, back.width, H)), wash, 0.74), (0, 0))
    x0 = round(half * DPI)
    art.paste(Image.new("RGB", (round(spine_in * DPI), H), (10, 27, 31)), (x0, 0))
    grain(art).save(path, "JPEG", quality=92, subsampling=0, dpi=(DPI, DPI))

TRIM_W, TRIM_H, BLEED = 6.0, 9.0, 0.125
WRAP, HINGE, BOARD = 0.625, 0.375, 0.06       # tapa dura (case laminate)
SPINE_PER_PAGE = 0.002347                      # papel a color

BLURB = [
    r"¿Y si la conciencia tuviera la forma de un horizonte? Una burbuja que, al cerrarse, crea un dentro y un fuera. Un océano del que emergen las olas. Una red que es más que la suma de sus nudos.",
    r"\emph{El horizonte interior} es un experimento de pensamiento: toma en serio la coincidencia entre la física de los agujeros negros, la teoría de la información integrada y la sabiduría taoísta, y la lleva al nacimiento, el amor, el duelo, la enfermedad, las máquinas y la fe.",
    r"Sin fórmulas: cada idea llega con una imagen cotidiana, y cada capítulo termina diciendo con honestidad lo que sabemos y lo que no.",
]

PREAMBLE = r"""\documentclass{article}
\usepackage[paperwidth=%(W).4fin,paperheight=%(H).4fin,margin=0pt]{geometry}
\usepackage{fontspec,tikz,xcolor}
\setmainfont{EBGaramond}[Path=%(fonts)s/,Extension=.otf,UprightFont=*-Regular,ItalicFont=*-Italic,BoldFont=*-SemiBold,Numbers=OldStyle]
\definecolor{crema}{HTML}{F2EDE4}\definecolor{oro}{HTML}{CFE3E2}\definecolor{gris}{HTML}{CFE3E2}
\newcommand{\esp}[2]{{\addfontfeature{LetterSpace=#1}#2}}
\pagestyle{empty}\setlength{\parindent}{0pt}
\begin{document}\noindent
\begin{tikzpicture}[remember picture,overlay,x=1in,y=1in]
\node[anchor=south west,inner sep=0] at (current page.south west) {\includegraphics[width=\paperwidth,height=\paperheight]{%(bg)s}};
\coordinate (O) at (current page.south west);
"""

def front(x0, y0):
    """Frente: trim de 6x9 con esquina inferior izquierda en (x0,y0) pulgadas.
    Mismo esquema que las demás cubiertas de la serie: título arriba sobre
    el velo, filete y subtítulo; autor y edición abajo."""
    cx = x0 + TRIM_W / 2
    return rf"""
\node[anchor=base] at ($(O)+({cx},{y0 + TRIM_H - 1.35})$) {{\color{{crema}}\fontsize{{40}}{{46}}\selectfont\esp{{16}}{{\scshape el horizonte}}}};
\node[anchor=base] at ($(O)+({cx},{y0 + TRIM_H - 2.05})$) {{\color{{crema}}\fontsize{{40}}{{46}}\selectfont\esp{{16}}{{\scshape interior}}}};
\draw[oro, line width=0.8pt] ($(O)+({cx - 0.64},{y0 + TRIM_H - 2.42})$) -- ++(1.28,0);
\node[anchor=base] at ($(O)+({cx},{y0 + TRIM_H - 2.80})$) {{\color{{oro}}\fontsize{{15}}{{18}}\selectfont\itshape Un experimento de pensamiento}};
\node[anchor=base] at ($(O)+({cx},{y0 + 1.30})$) {{\color{{crema}}\fontsize{{15}}{{18}}\selectfont\esp{{9}}{{\scshape íñigo barrera barceló}}}};
\node[anchor=base] at ($(O)+({cx},{y0 + 0.93})$) {{\color{{oro}}\fontsize{{10}}{{12}}\selectfont\esp{{9}}{{\scshape segunda edición · ilustrada}}}};
"""

def back(x0, y0):
    cx = x0 + TRIM_W / 2
    paras = r"\par\vspace{9pt}".join(BLURB)
    return rf"""
\node[anchor=base] at ($(O)+({cx},{y0 + TRIM_H - 1.55})$) {{\color{{crema}}\fontsize{{16}}{{20}}\selectfont\esp{{10}}{{\scshape el horizonte interior}}}};
\draw[oro, line width=0.7pt] ($(O)+({cx - 0.47},{y0 + TRIM_H - 1.82})$) -- ++(0.94,0);
\node[anchor=north, text width=4.4in, align=justify] at ($(O)+({cx},{y0 + TRIM_H - 2.15})$) {{\color{{crema}}\fontsize{{11.6}}{{16.2}}\selectfont {paras}}};
\node[anchor=north, text width=4.4in, align=center] at ($(O)+({cx},{y0 + 3.00})$) {{\color{{oro}}\fontsize{{10.8}}{{14}}\selectfont\itshape Segunda edición, ilustrada: una lámina a página completa\\ al comienzo de cada capítulo.}};
\fill[white] ($(O)+({x0 + TRIM_W - 2.35},{y0 + 0.4})$) rectangle ++(2.0,1.2);
"""

def spine(cx, y0, spine_w):
    if spine_w < 0.35:
        return ""
    return rf"""
\node[rotate=-90] at ($(O)+({cx},{y0 + TRIM_H / 2})$) {{\color{{crema}}\fontsize{{11.5}}{{13}}\selectfont\esp{{6}}{{\scshape el horizonte interior}}\hspace{{1.4em}}{{\color{{oro}}·}}\hspace{{1.4em}}\esp{{6}}{{\scshape íñigo barrera barceló}}}};
"""

def compile_tex(body, W, H, out, bg):
    tex = (PREAMBLE % dict(W=W, H=H, fonts=BASE, bg=bg)).replace(r"\usepackage{fontspec,tikz,xcolor}",
          r"\usepackage{fontspec,tikz,xcolor}\usetikzlibrary{calc}") + body + "\n\\end{tikzpicture}\n\\end{document}\n"
    with tempfile.TemporaryDirectory() as d:
        (Path(d) / "c.tex").write_text(tex, encoding="utf-8")
        for _ in range(2):
            r = subprocess.run(["xelatex", "-interaction=nonstopmode", "c.tex"], cwd=d, capture_output=True, text=True)
        if r.returncode != 0 or not (Path(d) / "c.pdf").exists():
            sys.exit(r.stdout[-3000:])
        shutil.copy(Path(d) / "c.pdf", out)
    print(f"{out.name}  —  {W:.3f} x {H:.3f} pulgadas")

def main():
    pages = pymupdf.open(INTERIOR).page_count
    print(f"Interior: {pages} páginas; arte {Image.open(ART).size}")
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        # frente suelto con sangre
        W, H = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
        fp = BASE / "El_Horizonte_Interior_ilustrada_portada_frontal.pdf"
        front_raster(tmp / "f.jpg")
        compile_tex(front(BLEED, BLEED), W, H, fp, tmp / "f.jpg")
        # tapa dura
        sp = pages * SPINE_PER_PAGE + BOARD
        side = WRAP + BLEED + TRIM_W + HINGE
        W, H = 2 * side + sp, TRIM_H + 2 * (WRAP + BLEED)
        y0 = WRAP + BLEED
        wrap_raster(tmp / "hd.jpg", W, H, sp)
        body = back(WRAP + BLEED, y0) + front(W - WRAP - BLEED - TRIM_W, y0) + spine(W / 2, y0, sp)
        compile_tex(body, W, H, BASE / "El_Horizonte_Interior_ilustrada_cubierta_tapadura.pdf", tmp / "hd.jpg")
        print(f"  lomo tapa dura {sp:.3f}\"")
        # tapa blanda
        sp = pages * SPINE_PER_PAGE
        W, H = 2 * (BLEED + TRIM_W) + sp, TRIM_H + 2 * BLEED
        wrap_raster(tmp / "tb.jpg", W, H, sp)
        body = back(BLEED, BLEED) + front(W - BLEED - TRIM_W, BLEED) + spine(W / 2, BLEED, sp)
        compile_tex(body, W, H, BASE / "El_Horizonte_Interior_ilustrada_cubierta_tapablanda.pdf", tmp / "tb.jpg")
        print(f"  lomo tapa blanda {sp:.3f}\"")
    # ebook: el frente sin sangre, 1600 x 2560 (1:1,6); se recorta por los lados
    page = pymupdf.open(fp)[0]
    clip = pymupdf.Rect(BLEED * 72, BLEED * 72, (BLEED + TRIM_W) * 72, (BLEED + TRIM_H) * 72)
    zoom = 2560 / (TRIM_H * 72)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip)
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    l = (im.width - 1600) // 2
    out = BASE / "El_Horizonte_Interior_ilustrada_cubierta_ebook.jpg"
    im.crop((l, 0, l + 1600, 2560)).save(out, quality=92)
    print(f"{out.name}  —  1600 x 2560 px")

if __name__ == "__main__":
    main()
