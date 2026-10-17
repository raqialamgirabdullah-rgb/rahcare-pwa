# Builds quran-bn-words.json: an index of every Bengali word used as a meaning in quran-roots.json,
# so the Research page can browse Bengali words by first letter. Run: python3 tools/build-bn-words.py
import json,re,sys
root=sys.argv[1] if len(sys.argv)>1 else "."
R=json.load(open(root+"/quran-roots.json",encoding="utf-8"))["roots"]
src=open(root+"/pages/research.html",encoding="utf-8").read()
STOP=set(re.findall(r'"([^"]+)"',re.search(r'const BSTOP=new Set\(\[(.*?)\]\)',src,re.S).group(1)))
PUNCT=re.compile(r'[()\[\],.;:!?"\'“”‘’।–—\-/]')
BN=re.compile(r'^[ঀ-৿]+$')
forms=[]  # (meaning, set of "sura:ayah", root)
for rn,fs in R:
    for f in fs:
        m=f[3]
        if m: forms.append((m,{":".join(r.split(":")[:2]) for r in f[2].split(",")},rn))
words=set()
for m,_,_ in forms:
    for w in PUNCT.sub(" ",m).split():
        if len(w)>=2 and BN.match(w) and w not in STOP: words.add(w)
SUF=sorted(["গুলোকে","গুলোর","গুলো","গুলি","গণ","দের","েরা","ের","রা","কে","টি","টা","তে","েও","ও","ই","র","ে","য়","ি"],key=len,reverse=True)
def base(w):
    best=w
    for s in SUF:
        if w.endswith(s) and len(w)-len(s)>=2 and w[:-len(s)] in words: best=w[:-len(s)] if len(w[:-len(s)])<len(best) else best
    return best
heads=sorted({base(w) for w in words})
out=[]
for h in heads:
    rs=set();vs=set()
    for m,v,rn in forms:
        if h in m: rs.add(rn);vs|=v
    out.append([h,len(rs),len(vs)])
json.dump({"w":out},open(root+"/quran-bn-words.json","w",encoding="utf-8"),ensure_ascii=False,separators=(",",":"))
print(len(words),"words ->",len(out),"heads")
