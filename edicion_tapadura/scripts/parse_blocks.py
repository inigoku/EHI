import json, re

data = json.load(open("/home/claude/structured.json"))

# TOC chapter titles (H1, size 17 bold) in the order they appear — used to anchor chapters
H1_SET = None  # detected dynamically

def line_markup(chars_line_text, runs):
    """runs: list of (text, bold, italic) contiguous spans for one physical line -> markup str"""
    out = []
    for text, bold, italic in runs:
        t = (text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))
        if bold and italic:
            t = f"<b><i>{t}</i></b>"
        elif bold:
            t = f"<b>{t}</b>"
        elif italic:
            t = f"<i>{t}</i>"
        out.append(t)
    return "".join(out)

def get_page_chars(pageobj_index):
    return None

import pdfplumber
SRC = "/mnt/user-data/uploads/EHI_manuscrito_5x8__10_.pdf"
pdf = pdfplumber.open(SRC)

def build_line_runs(page_idx):
    """Return list of dicts per physical line: {top, x0, size, markup, plain, is_italic_start, all_italic, all_bold}"""
    page = pdf.pages[page_idx]
    chars = page.chars
    lines = {}
    for c in chars:
        key = round(c['top'], 1)
        lines.setdefault(key, []).append(c)
    out = []
    for top in sorted(lines.keys()):
        cs = sorted(lines[top], key=lambda c: c['x0'])
        # build runs of contiguous same (bold,italic)
        runs = []
        cur_text = ""
        cur_bold = None
        cur_italic = None
        for c in cs:
            b = 'Bold' in c['fontname']
            it = 'Italic' in c['fontname']
            if cur_bold is None:
                cur_bold, cur_italic = b, it
            if b != cur_bold or it != cur_italic:
                runs.append((cur_text, cur_bold, cur_italic))
                cur_text = ""
                cur_bold, cur_italic = b, it
            cur_text += c['text']
        if cur_text:
            runs.append((cur_text, cur_bold, cur_italic))
        plain = "".join(c['text'] for c in cs)
        sizes = [c['size'] for c in cs]
        avg_size = round(sum(sizes) / len(sizes), 1)
        all_bold = all(r[1] for r in runs) if runs else False
        all_italic = all(r[2] for r in runs) if runs else False
        first_italic = runs[0][2] if runs else False
        out.append({
            "top": top, "x0": round(cs[0]['x0'], 1), "x1": round(max(c['x1'] for c in cs), 1),
            "size": avg_size,
            "markup": line_markup(plain, runs), "plain": plain,
            "all_bold": all_bold, "all_italic": all_italic, "first_italic": first_italic,
        })
    return out

ALL_PAGE_LINES = [build_line_runs(i) for i in range(len(pdf.pages))]
pdf.close()

if __name__ == "__main__":
    import sys
    p = int(sys.argv[1]) if len(sys.argv) > 1 else 4
    for l in ALL_PAGE_LINES[p-1]:
        print(l["size"], l["all_bold"], l["all_italic"], l["x0"], l["markup"][:70])
