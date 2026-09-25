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
ART = BASE / "img" / "portada_ilustrada.jpg"  # fig01_p5 ampliada a 300 ppp, bordes fundidos al fondo

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
\definecolor{fondo}{HTML}{030305}\definecolor{crema}{HTML}{E9DFC9}\definecolor{oro}{HTML}{B89B5E}\definecolor{gris}{HTML}{8C8577}
\newcommand{\esp}[2]{{\addfontfeature{LetterSpace=#1}#2}}
\pagestyle{empty}\setlength{\parindent}{0pt}
\begin{document}\noindent
\begin{tikzpicture}[remember picture,overlay,x=1in,y=1in]
\fill[fondo] (current page.south west) rectangle (current page.north east);
\coordinate (O) at (current page.south west);
"""

def front(x0, y0):
    """Frente: trim de 6x9 con esquina inferior izquierda en (x0,y0) pulgadas."""
    cx = x0 + TRIM_W / 2
    return rf"""
\node[anchor=north] at ($(O)+({cx},{y0 + TRIM_H - 0.85})$) {{\color{{crema}}\fontsize{{34}}{{40}}\selectfont\esp{{12}}{{\scshape el horizonte}}}};
\node[anchor=north] at ($(O)+({cx},{y0 + TRIM_H - 1.45})$) {{\color{{crema}}\fontsize{{34}}{{40}}\selectfont\esp{{12}}{{\scshape interior}}}};
\node at ($(O)+({cx},{y0 + TRIM_H - 2.18})$) {{\color{{oro}}\rule[0.55ex]{{2.4em}}{{0.4pt}}\hspace{{0.6em}}$\diamond$\hspace{{0.6em}}\rule[0.55ex]{{2.4em}}{{0.4pt}}}};
\node at ($(O)+({cx},{y0 + TRIM_H - 2.52})$) {{\color{{crema}}\fontsize{{14}}{{17}}\selectfont\itshape Un experimento de pensamiento}};
\node at ($(O)+({cx},{y0 + 3.62})$) {{\includegraphics[width=5.3in]{{{ART}}}}};
\node at ($(O)+({cx},{y0 + 0.92})$) {{\color{{gris}}\fontsize{{9}}{{11}}\selectfont\esp{{9}}{{\scshape segunda edición · ilustrada}}}};
\node at ($(O)+({cx},{y0 + 0.56})$) {{\color{{crema}}\fontsize{{13}}{{16}}\selectfont\esp{{9}}{{\scshape íñigo barrera barceló}}}};
"""

def back(x0, y0):
    cx = x0 + TRIM_W / 2
    paras = r"\par\vspace{9pt}".join(BLURB)
    return rf"""
\node[anchor=north] at ($(O)+({cx},{y0 + TRIM_H - 1.0})$) {{\color{{crema}}\fontsize{{16}}{{20}}\selectfont\esp{{9}}{{\scshape el horizonte interior}}}};
\node at ($(O)+({cx},{y0 + TRIM_H - 1.45})$) {{\color{{oro}}\rule[0.55ex]{{1.8em}}{{0.4pt}}\hspace{{0.5em}}$\diamond$\hspace{{0.5em}}\rule[0.55ex]{{1.8em}}{{0.4pt}}}};
\node[anchor=north, text width=4.3in, align=justify] at ($(O)+({cx},{y0 + TRIM_H - 1.75})$) {{\color{{crema}}\fontsize{{11.2}}{{15.5}}\selectfont {paras}}};
\node[anchor=north, text width=4.3in, align=center] at ($(O)+({cx},{y0 + 3.05})$) {{\color{{oro}}\fontsize{{10.5}}{{14}}\selectfont\itshape Segunda edición, ilustrada: una lámina a página completa\\ al comienzo de cada capítulo.}};
\fill[white] ($(O)+({x0 + TRIM_W - 2.35},{y0 + 0.4})$) rectangle ++(2.0,1.2);
"""

def spine(cx, y0, spine_w):
    if spine_w < 0.35:
        return ""
    return rf"""
\node[rotate=-90] at ($(O)+({cx},{y0 + TRIM_H / 2})$) {{\color{{crema}}\fontsize{{11}}{{13}}\selectfont\esp{{6}}{{\scshape el horizonte interior}}\hspace{{1.4em}}{{\color{{oro}}$\diamond$}}\hspace{{1.4em}}{{\color{{gris}}\esp{{6}}{{\scshape íñigo barrera barceló}}}}}};
"""

def compile_tex(body, W, H, out):
    tex = (PREAMBLE % dict(W=W, H=H, fonts=BASE)).replace(r"\usepackage{fontspec,tikz,xcolor}",
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
    print(f"Interior: {pages} páginas")
    # frente suelto con sangre
    W, H = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
    fp = BASE / "El_Horizonte_Interior_ilustrada_portada_frontal.pdf"
    compile_tex(front(BLEED, BLEED), W, H, fp)
    # tapa dura
    sp = pages * SPINE_PER_PAGE + BOARD
    side = WRAP + BLEED + TRIM_W + HINGE
    W, H = 2 * side + sp, TRIM_H + 2 * (WRAP + BLEED)
    y0 = WRAP + BLEED
    body = back(WRAP + BLEED, y0) + front(W - WRAP - BLEED - TRIM_W, y0) + spine(W / 2, y0, sp)
    compile_tex(body, W, H, BASE / "El_Horizonte_Interior_ilustrada_cubierta_tapadura.pdf")
    print(f"  lomo tapa dura {sp:.3f}\"")
    # tapa blanda
    sp = pages * SPINE_PER_PAGE
    W, H = 2 * (BLEED + TRIM_W) + sp, TRIM_H + 2 * BLEED
    body = back(BLEED, BLEED) + front(W - BLEED - TRIM_W, BLEED) + spine(W / 2, BLEED, sp)
    compile_tex(body, W, H, BASE / "El_Horizonte_Interior_ilustrada_cubierta_tapablanda.pdf")
    print(f"  lomo tapa blanda {sp:.3f}\"")
    # ebook: frente sin sangre, 1600 x 2560 (proporción 1:1,6 que pide KDP)
    page = pymupdf.open(fp)[0]
    clip = pymupdf.Rect(BLEED * 72, BLEED * 72, (BLEED + TRIM_W) * 72, (BLEED + TRIM_H) * 72)
    zoom = 2560 / (TRIM_H * 72)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip)
    from PIL import Image
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    canvas = Image.new("RGB", (1600, 2560), (3, 3, 5))
    canvas.paste(im, ((1600 - im.width) // 2, 0))
    out = BASE / "El_Horizonte_Interior_ilustrada_cubierta_ebook.jpg"
    canvas.save(out, quality=92)
    print(f"{out.name}  —  1600 x 2560 px")

if __name__ == "__main__":
    main()
