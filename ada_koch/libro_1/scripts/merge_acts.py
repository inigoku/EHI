# -*- coding: utf-8 -*-
"""Une las tres exportaciones markdown de Claude Docs en Los_Amantes_de_la_Espiral.md.
Uso: python3 merge_acts.py acto1.json acto2.json acto3.json"""
import base64, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "Los_Amantes_de_la_Espiral.md")
ACTS = ["Primer acto · El faro", "Segundo acto · Iter", "Tercer acto · El nombre"]


def load(path):
    d = json.loads(open(path, encoding="utf-8").read())
    if isinstance(d, list):
        d = json.loads([x for x in d if x["text"].startswith("{")][0]["text"])
    return base64.b64decode(d["data"]["bytes_b64"]).decode("utf-8")


parts = [load(p) for p in sys.argv[1:4]]
body = [f"# {n}\n" + p[p.find("\n## "):].strip() + "\n" for n, p in zip(ACTS, parts)]
md = ('---\ntitle: "Los Amantes de la Espiral"\nsubtitle: "El Cuaderno de Ada Koch · Libro I"\n'
      'author: "Íñigo Barrera Barceló"\nlang: es-ES\n---\n\n' + "\n\n".join(body))
open(OUT, "w", encoding="utf-8").write(md)
print("palabras:", len(md.split()))
