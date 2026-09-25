"""Convierte un capítulo de la web (content/*.es.md) al LaTeX del libro
original: \\seccion, \\primeras, cajas fisica, tesis, notacap, tablas con
tabularx/booktabs y comillas tipográficas. El resultado se revisa a mano."""
import re, sys

def esc(s):
    s = s.replace('\\', r'\textbackslash{}')
    for a, b in (('&', r'\&'), ('%', r'\%'), ('#', r'\#'), ('$', r'\$'), ('_', r'\_')):
        s = s.replace(a, b)
    return s

def inline(s):
    codes = []
    s = re.sub(r'`([^`]+)`', lambda m: codes.append(m.group(1)) or f'\x00{len(codes)-1}\x00', s)
    s = esc(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', s)
    s = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'\\emph{\1}', s)
    s = re.sub(r'"([^"]+)"', r'“\1”', s)
    s = s.replace('...', '…')
    s = re.sub(r'\x00(\d+)\x00', lambda m: r'\texttt{' + esc(codes[int(m.group(1))]) + '}', s)
    return s

def primeras(par):
    m = re.match(r'(\S+)(.*)', par, re.S)
    return r'\noindent \primeras{' + m.group(1) + '}{' + m.group(2) + '}'

def convert(md):
    fm, body = re.match(r'\A---\n(.*?)\n---\n(.*)\Z', md, re.S).groups()
    blocks = [b.strip('\n') for b in re.split(r'\n\s*\n', body) if b.strip()]
    out, first, after_sec = [], True, False
    i = 0
    while i < len(blocks):
        b = blocks[i]
        if b.strip() == '---':
            i += 1; continue
        if b.startswith('#'):
            title = re.sub(r'^#+\s*', '', b).strip()
            out.append(r'\seccion{' + inline(title) + '}'); after_sec = True; i += 1; continue
        if b.startswith('>'):
            lines = [re.sub(r'^>\s?', '', l).rstrip() for l in b.split('\n')]
            txt = '\n'.join(lines).strip()
            nota = re.match(r'\*\*Nota al Capítulo (\d+)\*\*', txt)
            if nota:
                items = [l for l in lines[1:] if l.strip()]
                body_ = '\n\n'.join(re.sub(r'^\*\*(.+?:)\*\*', r'\\lbl{\1}', inline_keep(l)) for l in items)
                out.append(r'\begin{notacap}{Nota al capítulo ' + nota.group(1) + '}\n' + body_ + '\n\\end{notacap}')
            elif 'En física esto se llama' in txt:
                items = [l.strip() for l in lines if l.strip()]
                body_ = '\n\n'.join(re.sub(r'^\\textbf\{(.+?:)\}', r'\\lbl{\1}', inline(l)) for l in items)
                out.append('\\begin{fisica}\n' + body_ + '\n\\end{fisica}')
            else:
                t = txt.strip()
                if t.startswith('*') and t.endswith('*'): t = t[1:-1]
                out.append('\\begin{tesis}\n' + inline(t) + '\n\\end{tesis}')
            i += 1; continue
        if b.startswith('|'):
            rows = [[c.strip() for c in r.strip().strip('|').split('|')] for r in b.split('\n') if not re.match(r'^\|[\s:|-]+\|$', r.strip())]
            out.append(('TABLA', rows)); i += 1; continue
        if re.match(r'^(\d+\.|-)\s', b):
            env = 'enumerate' if b[0].isdigit() else 'itemize'
            its = re.split(r'\n(?=\d+\.\s|-\s)', b)
            out.append('\\begin{' + env + '}\n' + '\n'.join(r'\item ' + inline(re.sub(r'^(\d+\.|-)\s+', '', x).replace('\n', ' ')) for x in its) + '\n\\end{' + env + '}')
            i += 1; continue
        par = inline(b.replace('\n', ' ').strip())
        if first:
            out.append(primeras(par)); first = False
        elif after_sec:
            out.append(r'\noindent ' + par)
        else:
            out.append(par)
        after_sec = False
        i += 1
    return fm, out

def inline_keep(l):
    return inline(l)

if __name__ == '__main__':
    fm, out = convert(open(sys.argv[1], encoding='utf-8').read())
    for o in out:
        if isinstance(o, tuple):
            print('%% TABLA'); [print('%% ' + ' | '.join(r)) for r in o[1]]
        else:
            print(o + '\n')
