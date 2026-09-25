#!/usr/bin/env python3
"""EPUB de «El horizonte interior» (edición ilustrada) a partir del mismo
cuerpo_ilustrada.tex que el libro impreso, con sus láminas.

Traduce las macros del libro (\\capitulo, \\parte, \\lamina, \\seccion,
fisica, notacap, tesis, cita, tablas, glosario, referencias) a XHTML.
Cada capítulo es una pantalla; su lámina va al principio. Las imágenes se
reducen a 1200 px para pantalla.

    python3 scripts/build_ilustrada.py && python3 scripts/build_cover.py
    python3 scripts/build_epub.py          (desde edicion_original/)
"""
import html, io, re, uuid
from pathlib import Path
from PIL import Image
from ebooklib import epub

BASE = Path(__file__).resolve().parent.parent
SRC = (BASE / "cuerpo_ilustrada.tex").read_text(encoding="utf-8")
OUT = BASE / "El_Horizonte_Interior_ilustrada.epub"
COVER = BASE / "El_Horizonte_Interior_ilustrada_cubierta_ebook.jpg"

# ---------------------------------------------------------------- parser
def arg(s, i):
    """s[i] == '{' -> (contenido, índice tras '}'), con llaves anidadas."""
    assert s[i] == "{", s[i:i + 30]
    depth, j = 0, i
    while True:
        c = s[j]
        if c == "\\":
            j += 2; continue
        if c == "{": depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0: return s[i + 1:j], j + 1
        j += 1

def skip_ws(s, i):
    while i < len(s) and s[i] in " \t\n": i += 1
    return i

SIMPLE = {"textbf": "strong", "emph": "em", "textit": "em", "texttt": "code"}
DROP0 = {"noindent", "par", "small", "centering", "scriptsize", "footnotesize", "mainmatter",
         "backmatter", "toprule", "midrule", "bottomrule", "raggedright", "arraybackslash", "hfill"}
DROP_ARGS = {"vspace": 1, "vspace*": 1, "thispagestyle": 1, "setlength": 2, "renewcommand": 2, "hspace": 1}

def inline(s, strip=True):
    out, i = [], 0
    while i < len(s):
        c = s[i]
        if c == "\\":
            m = re.match(r"\\([a-zA-Z]+\*?)", s[i:])
            if not m:
                nxt = s[i + 1]
                out.append({"&": "&amp;", "%": "%", "#": "#", "$": "$", "_": "_", "\\": " ", " ": " ", ",": "\u2009"}.get(nxt, nxt))
                i += 2; continue
            name = m.group(1); i += len(m.group(0))
            if name in SIMPLE:
                a, i = arg(s, skip_ws(s, i)); out.append(f"<{SIMPLE[name]}>{inline(a)}</{SIMPLE[name]}>")
            elif name in ("textsc", "thead"):
                a, i = arg(s, skip_ws(s, i)); a = inline(a)
                out.append(f'<span class="sc">{a.lower() if name == "thead" else a}</span>')
            elif name == "lbl":
                a, i = arg(s, skip_ws(s, i)); out.append(f'<span class="lbl">{inline(a)}</span>')
            elif name in ("primeras", "capital"):
                a, i = arg(s, skip_ws(s, i)); b, i = arg(s, i)
                if name == "capital":
                    out.append(f'<span class="sc">{inline(a + b)}</span>')
                else:
                    out.append(f'<span class="sc">{inline(a)}</span>{inline(b, strip=False)}')
            elif name == "circnum":
                a, i = arg(s, skip_ws(s, i)); out.append(f"({a})")
            elif name == "textasciitilde":
                if s[i:i + 2] == "{}": i += 2
                out.append("~")
            elif name == "MakeLowercase":
                a, i = arg(s, skip_ws(s, i)); out.append(inline(a))
            elif name in DROP_ARGS:
                for _ in range(DROP_ARGS[name]):
                    i = skip_ws(s, i)
                    if i < len(s) and s[i] == "{": _, i = arg(s, i)
            elif name in DROP0 or name == "hsize":
                if name == "hsize" and s[i:i + 1] == "=":
                    i = re.match(r"=[0-9.]*\\hsize", s[i:]).end() + i if re.match(r"=[0-9.]*\\hsize", s[i:]) else i
            else:
                out.append("")   # macro desconocida: se ignora
        elif c == "~":
            out.append("\u00a0"); i += 1
        elif c in "{}":
            i += 1
        elif c == "&":
            out.append("&amp;"); i += 1
        elif c == "<":
            out.append("&lt;"); i += 1
        elif c == ">":
            out.append("&gt;"); i += 1
        else:
            out.append(c); i += 1
    r = re.sub(r"[ \t\n]+", " ", "".join(out))
    return r.strip() if strip else r

def paras(block, cls=None):
    ps = [p.strip() for p in re.split(r"\n\s*\n", block) if p.strip()]
    c = f' class="{cls}"' if cls else ""
    return "".join(f"<p{c}>{inline(p)}</p>" for p in ps if inline(p))

def table(body):
    rows = [r.strip() for r in re.split(r"\\\\(?:\[[^\]]*\])?", body) if r.strip()]
    htmlrows = []
    for k, r in enumerate(rows):
        cells = [inline(c) for c in re.split(r"(?<!\\)&", r)]
        if not any(cells): continue
        tag = "th" if k == 0 else "td"
        htmlrows.append("<tr>" + "".join(f"<{tag}>{c}</{tag}>" for c in cells) + "</tr>")
    return '<table class="tabla">' + "".join(htmlrows) + "</table>"

IMGS = {}
def img(path, alt=""):
    name = Path(path).stem + ".jpg"
    if name not in IMGS:
        im = Image.open(BASE / path).convert("RGB")
        im.thumbnail((1200, 1200))
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=84, optimize=True)
        IMGS[name] = buf.getvalue()
    return f'<figure class="lamina"><img src="../images/{name}" alt="{html.escape(alt)}"/></figure>'

ENV = re.compile(r"\\begin\{(\w+)\}")
def block(s):
    """Texto de un capítulo -> XHTML."""
    out, i = [], 0
    buf = []
    def flush():
        if buf:
            out.append(paras("".join(buf))); buf.clear()
    while i < len(s):
        m = re.compile(r"\\(begin\{\w+\}|seccion|glos|refe|lamina|finalpage|findelexperimento|atrib|par\\vspace\{4pt\}\\begin\{center\})").search(s, i)
        if not m:
            buf.append(s[i:]); break
        buf.append(s[i:m.start()])
        tok = m.group(1)
        if tok.startswith("seccion"):
            flush(); a, j = arg(s, m.end()); out.append(f"<h2>{inline(a)}</h2>"); i = j
        elif tok in ("glos", "refe"):
            flush()
            end = s.find("\n\n", m.end()); end = len(s) if end < 0 else end
            out.append(f'<p class="{tok}">{inline(s[m.end():end])}</p>'); i = end
        elif tok == "lamina":
            flush(); a, j = arg(s, m.end()); out.append(img(a)); i = j
        elif tok == "finalpage":
            flush(); a, j = arg(s, m.end()); out.append(img(a)); i = j
        elif tok == "findelexperimento":
            flush(); out.append('<p class="fin">✦ fin del experimento ✦</p>'); i = m.end()
        elif tok == "atrib":
            flush(); a, j = arg(s, m.end()); out.append(f'<p class="atrib">— {inline(a)}</p>'); i = j
        elif tok.startswith("par"):
            i = m.end() - len("\\begin{center}")      # deja que lo trate el entorno
        else:
            env = tok[6:-1]
            flush()
            endtag = f"\\end{{{env}}}"
            j = m.end()
            title = ""
            if env in ("notacap", "cajalateral"):
                title, j = arg(s, j)
            if env == "tabularx":
                _, j = arg(s, skip_ws(s, j))                 # anchura
                _, j = arg(s, skip_ws(s, j))                 # columnas
            k = s.index(endtag, j)
            inner = s[j:k]; i = k + len(endtag)
            if env == "fisica":
                out.append(f'<div class="fisica">{paras(inner)}</div>')
            elif env == "notacap":
                out.append(f'<div class="nota"><p class="nota-t">{inline(title)}</p>{paras(inner)}</div>')
            elif env == "cajalateral":
                out.append(f'<div class="caja"><p class="nota-t">{inline(title)}</p>{paras(inner)}</div>')
            elif env == "tesis":
                out.append(f'<p class="tesis">{inline(inner)}</p>')
            elif env == "cita":
                out.append(f"<blockquote>{block(inner)}</blockquote>")
            elif env in ("itemize", "enumerate"):
                tag = "ul" if env == "itemize" else "ol"
                items = [x for x in re.split(r"\\item\s*", inner) if x.strip()]
                out.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
            elif env == "tabularx":
                out.append(table(inner))
            elif env in ("center", "landscape", "figure"):
                out.append(block(inner))
            else:
                out.append(block(inner))
    flush()
    return "".join(out)

def figure_includegraphics(s):
    return re.sub(r"\\includegraphics(\[[^\]]*\])?\{([^}]*)\}", lambda m: "\\lamina{" + m.group(2) + "}", s)

# ------------------------------------------------------------- estructura
body = figure_includegraphics(SRC)
tokens = list(re.finditer(r"\\(capitulo|parte)\{", body))
units = []          # (tipo, cabecera, texto)
lead = body[:tokens[0].start()]
pending = re.findall(r"\\lamina\{([^}]*)\}", lead)   # frontispicio de capítulo 0
for n, t in enumerate(tokens):
    kind = t.group(1)
    j = t.end() - 1
    args = []
    for _ in range(4 if kind == "capitulo" else 3):
        a, j = arg(body, j); args.append(a)
    end = tokens[n + 1].start() if n + 1 < len(tokens) else len(body)
    text = body[j:end]
    # la \lamina final de cada bloque pertenece al capítulo siguiente
    nxt = []
    mm = re.search(r"((?:\s*\\lamina\{[^}]*\}\s*)+)$", text)
    if mm and n + 1 < len(tokens):
        nxt = re.findall(r"\\lamina\{([^}]*)\}", mm.group(1)); text = text[:mm.start()]
    units.append((kind, args, text, pending)); pending = nxt

book = epub.EpubBook()
book.set_identifier(f"urn:uuid:{uuid.uuid5(uuid.NAMESPACE_URL, 'el-horizonte-interior-ilustrada')}")
book.set_title("El horizonte interior (segunda edición)")
book.set_language("es")
book.add_author("Íñigo Barrera Barceló")
book.add_metadata("DC", "description", "Un experimento de pensamiento. Segunda edición, ilustrada.")
book.set_cover("images/cover.jpg", COVER.read_bytes())

CSS = """
body{font-family:serif;line-height:1.5;margin:0 4%}
h1{font-variant:small-caps;letter-spacing:.12em;font-weight:normal;text-align:center;font-size:1.5em;margin:1.2em 0 .2em}
p.kicker{text-align:center;font-variant:small-caps;letter-spacing:.15em;color:#777;font-size:.85em;margin:2em 0 0}
p.sub{text-align:center;font-style:italic;margin:.2em 0 1.4em}
p.orn{text-align:center;color:#999;margin:.6em 0 1.4em}
h2{font-variant:small-caps;letter-spacing:.08em;font-weight:normal;text-align:center;font-size:1.1em;margin:1.6em 0 .6em}
p{text-indent:1.2em;margin:0;text-align:justify}
h1+p,h2+p,p.sub+p,p.orn+p,div+p,figure+p,table+p,blockquote+p,ul+p,ol+p{text-indent:0}
.sc{font-variant:small-caps}
figure.lamina{text-align:center;margin:0 0 1.2em;page-break-after:always}
figure.lamina img{max-width:100%;max-height:95vh}
div.fisica{margin:.8em 1.2em;padding-left:.8em;border-left:1px solid #bbb;font-style:italic;font-size:.95em}
div.fisica p,div.nota p,div.caja p{text-indent:0;margin:.2em 0}
.lbl{font-variant:small-caps;font-style:normal}
div.nota{margin:1.4em 0;padding:.6em 0;border-top:1px solid #999;border-bottom:1px solid #999;font-size:.92em}
div.caja{margin:1em 0;padding:.6em;border:1px solid #bbb;font-size:.92em;font-style:italic}
p.nota-t{text-align:center;font-variant:small-caps;letter-spacing:.12em;color:#777;margin-bottom:.4em}
p.tesis{text-align:center;font-style:italic;margin:1em 2em;text-indent:0}
blockquote{margin:1em 2em;font-style:italic}
p.atrib{text-align:right;font-style:normal;font-variant:small-caps}
table.tabla{border-collapse:collapse;width:100%;font-size:.8em;margin:1em 0}
table.tabla td,table.tabla th{border-top:1px solid #ccc;padding:.3em;vertical-align:top;text-align:left}
table.tabla th{font-variant:small-caps;font-weight:normal;color:#666}
p.glos,p.refe{text-indent:-1.2em;margin:0 0 .5em 1.2em;text-align:left}
p.refe{font-size:.9em}
p.fin{text-align:center;font-variant:small-caps;letter-spacing:.15em;margin:1.5em 0;text-indent:0}
div.titulo{text-align:center;margin-top:20%}
div.titulo p{text-align:center;text-indent:0}
"""
css = epub.EpubItem(uid="css", file_name="style/book.css", media_type="text/css", content=CSS)
book.add_item(css)

def page(fname, title, content):
    it = epub.EpubHtml(title=title, file_name=fname, lang="es")
    it.content = f"<html><head><title>{html.escape(title)}</title></head><body>{content}</body></html>"
    it.add_item(css); book.add_item(it); return it

spine, toc, part = [], [], None
tp = page("text/titulo.xhtml", "El horizonte interior",
    '<div class="titulo"><h1>El horizonte interior</h1><p class="orn">— ◇ —</p>'
    '<p class="sub">Un experimento de pensamiento</p><p class="kicker">segunda edición · ilustrada</p>'
    '<p style="margin-top:3em" class="sc">Íñigo Barrera Barceló</p></div>')
cr = page("text/creditos.xhtml", "Créditos",
    '<div class="titulo" style="margin-top:40%;font-size:.85em"><p><em>El horizonte interior. Un experimento de pensamiento</em></p>'
    '<p>Segunda edición, ilustrada</p><p>© Íñigo Barrera Barceló, 2026</p>'
    '<p>Todos los derechos reservados. No se permite la reproducción total o parcial de este libro, ni su incorporación a un sistema informático, ni su transmisión en cualquier forma o por cualquier medio sin el permiso previo y por escrito del autor.</p>'
    '<p>Primera edición: 2026<br/>Segunda edición, ilustrada: 2026</p></div>')
spine += ["cover", tp, cr, "nav"]

n = 0
for kind, args, text, plates in units:
    n += 1
    if kind == "parte":
        label, title, image = args
        content = f'<p class="kicker">{inline(label)}</p><h1>{inline(title)}</h1><p class="orn">— ◇ —</p>'
        if image: content += img(image)
        it = page(f"text/u{n:02d}.xhtml", f"{inline(label)}: {inline(title).capitalize()}", content)
        spine.append(it); part = [epub.Link(it.file_name, f"{inline(label)}: {inline(title).capitalize()}", f"u{n}"), []]
        toc.append(part); continue
    label, title, sub, _ = args
    head = "".join(img(p) for p in plates)
    if label: head += f'<p class="kicker">{inline(label)}</p>'
    head += f"<h1>{inline(title)}</h1>"
    if sub: head += f'<p class="sub">{inline(sub)}</p>'
    head += '<p class="orn">— ◇ —</p>'
    t_clean = inline(title)
    name = t_clean[0] + t_clean[1:].lower()
    nav = f"{inline(label).capitalize()}. {name}" if label.startswith("CAPÍTULO") else (f"{label.capitalize()}: {name}" if label else name)
    it = page(f"text/u{n:02d}.xhtml", nav, head + block(text))
    spine.append(it)
    link = epub.Link(it.file_name, nav, f"u{n}")
    if part is not None and not t_clean.startswith(("EPÍLOGO", "GLOSARIO", "NOTAS", "REFERENCIAS")) and label != "EPÍLOGO":
        part[1].append(link)
    else:
        part = None if label == "EPÍLOGO" or not label else part
        toc.append(link)

for name, data in IMGS.items():
    book.add_item(epub.EpubItem(uid=f"img_{name}", file_name=f"images/{name}", media_type="image/jpeg", content=data))
book.toc = [(epub.Section(p[0].title, href=p[0].href), p[1]) if isinstance(p, list) else p for p in toc]
book.add_item(epub.EpubNcx()); book.add_item(epub.EpubNav())
book.spine = spine
epub.write_epub(str(OUT), book)
print(f"{OUT.name}  —  {len(units)} pantallas, {len(IMGS)} imágenes, {OUT.stat().st_size/1e6:.1f} MB")
