import json,re,sys
from pathlib import Path
B=Path('/home/claude/ehi/edicion_ensayo')
def load(tf):
    t=json.load(open(B/tf)); out=[]
    for c in t['chapters']:
        txt=(B/c['content_file']).read_text()
        for o,n in c.get('replace',[]): txt=txt.replace(o,n)
        fm=re.match(r'---\n(.*?)\n---\n',txt,re.S); meta={}
        if fm:
            for l in fm.group(1).splitlines():
                if ':' in l: k,v=l.split(':',1); meta[k.strip()]=v.strip()
            txt=txt[fm.end():]
        num=c.get('chapter_number',meta.get('chapterNumber','-'))
        out.append((c['id'],str(num),meta.get('title',c['id']),txt))
    return out
V1=load('toc_tomo1_ensayo_en.json'); V2=load('toc_tomo2_lecturas_en.json')
v1nums={n for _,n,_,_ in V1}
v2titles=['Cambiaso','Cuartetera','Tears in Rain','Blade Runner','Alien Horizons','First Contact','Dark Forest','Three-Body','Three Body','Non-Euclidean','Cosmic Horror','Silicon Cave','Matrix','Cartography of Three','Story of a Relay','The Translator','Protocol and the Bridge','Beach at the End of Time','Borrowed Body','Millipede','Fractal Reality','Vessel of Clay','Topological Readings']
v1titles=['Switch Trap','Black Holes for Non','Encapsulation','Reservoir','Birth as Emergence','Death as Return','Instantiation Cycle','Table of Equivalences','Time of the Bond','Entanglement for Non','Mother-Child','Empathy and Its Limit','Grief','Alzheimer','Parkinson','Interface of Suffering','Topology of the Ego','Exclusion Postulate','Idempotence','Four Experiments','Wounded Horizon','Pets and the Horizon','Five Maps','Vertical Entanglement','Collective Horizon','Mirror Without Depth','Borderline Cases','Calibration of the Horizon','Three Open Doors','The One Who Remains','What the Hypothesis Cannot Say','Experiment as Practice']
def ctx(t,m,w=90):
    s=max(0,m.start()-w); e=min(len(t),m.end()+w); return re.sub(r'\s+',' ',t[s:e])
rep=[]
def scan(label,V,own_nums,other_titles,other_label):
    for cid,num,title,t in V:
        for m in re.finditer(r'\b(Chapters?)\s+(\d+)(?:\s*(?:,|and|or|–|-)\s*(\d+))?',t):
            ns=[int(x) for x in m.groups()[1:] if x]
            for n in ns:
                if str(n) not in own_nums and not (label=='II' and 1<=n<=38):
                    rep.append((label,cid,num,'capítulo inexistente',f'Chapter {n}',ctx(t,m)))
        for m in re.finditer(r'\b(Readings?)\s+(\d+)',t):
            if label=='I': rep.append((label,cid,num,'remite a una Lectura (vol. II)',m.group(0),ctx(t,m)))
        for ti in other_titles:
            for m in re.finditer(re.escape(ti),t):
                rep.append((label,cid,num,f'menciona texto del {other_label}',ti,ctx(t,m)))
        for m in re.finditer(r'\b(next|second|first|third|fourth|previous|other|companion|separate) (book|volume)s?\b|\bthe (first|second|third|fourth) volume\b|\bVolumes? (I|II|III|IV|[1-4])\b|\b(final|closing|last) notes?\b',t,re.I):
            rep.append((label,cid,num,'remite a otro libro/volumen/nota final',m.group(0),ctx(t,m)))
scan('I',V1,v1nums|{str(i) for i in range(0,39)},v2titles,'vol. II')
scan('II',V2,{str(i) for i in range(1,15)},[x for x in v1titles if x not in('Grief','Encapsulation','Reservoir','Matrix')],'vol. I')
import collections
print(len(rep),'hallazgos'); c=collections.Counter((r[0],r[3]) for r in rep); print(c)
json.dump(rep,open('/tmp/refs.json','w'),ensure_ascii=False,indent=1)
