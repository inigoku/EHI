from parse_blocks import ALL_PAGE_LINES
import re

MANGA_PAGES = set(range(98, 113))  # 1-indexed page numbers
FULL_X1 = 300.0  # column-full threshold in source coords
GAP_PARA = 18.7  # gap*  threshold for size-11 body (1.7*11)
GAP_H1 = 29.0
GAP_H2 = 24.0

def terminal_punct(s):
    s = s.rstrip()
    return bool(s) and s[-1] in '.!?»”\u2026:;'

blocks = []  # list of dicts: {"type":..., ...}

state = None  # currently open block dict or None

def flush():
    global state
    if state is not None:
        blocks.append(state)
        state = None

n_pages = len(ALL_PAGE_LINES)
for pnum in range(4, n_pages + 1):  # 1-indexed, skip cover(1)/toc(2)/dedication(3)
    if pnum in MANGA_PAGES:
        flush()
        blocks.append({"type": "MANGA", "page": pnum})
        continue
    lines = ALL_PAGE_LINES[pnum - 1]
    prev_top = None
    for idx, l in enumerate(lines):
        size, x0, markup, plain = l["size"], l["x0"], l["markup"], l["plain"]
        is_first_on_page = (idx == 0)
        if size >= 16.5:  # H1
            gap = (l["top"] - prev_top) if (prev_top is not None and not is_first_on_page) else 999
            if state and state["type"] == "H1" and not is_first_on_page and gap < GAP_H1:
                state["text"] += " " + markup
            else:
                flush()
                state = {"type": "H1", "text": markup, "page": pnum}
        elif 12.5 <= size < 16.5:  # H2 subtitle
            gap = (l["top"] - prev_top) if (prev_top is not None and not is_first_on_page) else 999
            if state and state["type"] == "H2" and not is_first_on_page and gap < GAP_H2:
                state["text"] += " " + markup
            else:
                flush()
                state = {"type": "H2", "text": markup, "page": pnum}
        else:  # body-ish, size ~11
            is_poem = l["all_italic"] and x0 != 42.0
            if is_poem:
                gap = (l["top"] - prev_top) if (prev_top is not None and not is_first_on_page) else 999
                stanza_break = (prev_top is not None and not is_first_on_page and gap >= GAP_PARA)
                if state and state["type"] == "POEM":
                    state["lines"].append({"text": markup, "stanza_break": stanza_break})
                else:
                    flush()
                    state = {"type": "POEM", "lines": [{"text": markup, "stanza_break": False}], "page": pnum}
            else:
                new_para = False
                if state is None or state["type"] != "PARA":
                    new_para = True
                elif is_first_on_page:
                    # crossing a page boundary: decide via fullness+punctuation of prev block's last physical line
                    prev_full = state.get("_last_x1", 0) >= FULL_X1
                    prev_term = state.get("_last_term", False)
                    if prev_term and not prev_full:
                        new_para = True
                else:
                    gap = l["top"] - prev_top
                    if gap >= GAP_PARA:
                        new_para = True
                if new_para:
                    flush()
                    state = {"type": "PARA", "text": markup, "page": pnum}
                else:
                    state["text"] += " " + markup
                # track fullness/terminal punctuation of this physical line for page-boundary decisions
                state["_last_x1"] = l["x1"]
                state["_last_term"] = terminal_punct(plain)
        prev_top = l["top"]
    # end of page: need actual x1 of last line for fullness check -> recompute using raw pdf coords
flush()

print("Total blocks:", len(blocks))
from collections import Counter
print(Counter(b["type"] for b in blocks))
