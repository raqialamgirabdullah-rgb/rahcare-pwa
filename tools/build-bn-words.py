# Builds quran-bn-words.json: an index of every Bengali word used as a meaning in quran-roots.json,
# so the Research page can browse Bengali words by first letter. Run: python3 tools/build-bn-words.py
import json,re,sys
root=sys.argv[1] if len(sys.argv)>1 else "."
R=json.load(open(root+"/quran-roots.json",encoding="utf-8"))["roots"]
src=open(root+"/pages/research.html",encoding="utf-8").read()
STOP=set(re.findall(r'"([^"]+)"',re.search(r'const BSTOP=new Set\(\[(.*?)\]\)',src,re.S).group(1)))
PUNCT=re.compile(r'[()\[\],.;:!?"\'“”‘’।–—\-/]')
BN=re.compile(r'^[ঀ-৿]+$')
def fb(s):  # spelling-fold: keep identical to fb() in pages/research.html
    s=re.sub('[\u200c\u200d\u0981]','',s).replace('\u09df','য').replace('য\u09bc','য')
    s=s.replace('ী','ি').replace('ূ','ু').replace('ঈ','ই').replace('ঊ','উ').replace('ণ','ন').replace('য','জ')
    return s.replace('জ্দু','জাদু')
forms=[]  # (folded meaning, set of "sura:ayah", root)
occ={}
for rn,fs in R:
    for f in fs:
        m=f[3]
        if m:
            forms.append((fb(m),{":".join(r.split(":")[:2]) for r in f[2].split(",")},rn))
            for w in PUNCT.sub(" ",m).split():
                if len(w)>=2 and BN.match(w) and w not in STOP: occ[w]=occ.get(w,0)+1
words=set(occ)
fwords={fb(w) for w in words}
SUF=sorted(["গুলোকে","গুলোর","গুলো","গুলি","গণ","দের","েরা","ের","রা","কে","টি","টা","তে","েও","ও","ই","র","ে","য়","ি"],key=len,reverse=True)
def base(w):
    best=w
    for s_ in SUF:
        b=w[:-len(s_)] if w.endswith(s_) else None
        if b and len(b)>=2 and b in fwords and len(b)<len(best): best=b
    return best
groups={}
for w in words: groups.setdefault(base(fb(w)),[]).append(w)
out=[]
for h,ws in sorted(groups.items()):
    rs=set();vs=set()
    for m,v,rn in forms:
        if h in m: rs.add(rn);vs|=v
    ws.sort(key=lambda w:-occ[w])
    # label: most common spelling of the head word itself (shortest spelling family), alts: other spellings of the head
    hs=[w for w in ws if fb(w)==h] or ws
    out.append([hs[0],len(rs),len(vs),[a for a in hs[1:] if ('্' in a)==('্' in hs[0])][:3]])
out.sort(key=lambda x:fb(x[0]))
json.dump({"w":out},open(root+"/quran-bn-words.json","w",encoding="utf-8"),ensure_ascii=False,separators=(",",":"))
print(len(words),"words ->",len(out),"heads")
