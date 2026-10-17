#!/usr/bin/env python3
"""quran-roots.json-এর প্রতিটি রূপে (5ম উপাদান) শব্দের ধরন যোগ করে: N বিশেষ্য, ADJ বিশেষণ, PN নামবাচক, V ক্রিয়া।
উৎস: mustafa0x/quran-morphology (Quranic Arabic Corpus)। build-quran-roots.py এবং build-quran-bn.py চালানোর পরে চালান।
Usage: python3 tools/add-pos.py [path/to/quran-morphology.txt]"""
import sys, os, json, urllib.request
from collections import Counter, OrderedDict
root_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join("/tmp", "quran-morphology.txt")
if not os.path.exists(src):
    urllib.request.urlretrieve("https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt", src)
words = OrderedDict()
for line in open(src, encoding="utf8"):
    line = line.rstrip("\n")
    if not line: continue
    loc, text, pos, feats = line.split("\t")
    s, a, w, _ = loc.split(":")
    d = words.setdefault((int(s), int(a), int(w)), {"t": "", "codes": {}})
    d["t"] += text
    tags = feats.split("|")
    for r in [t[5:] for t in tags if t.startswith("ROOT:")]:
        code = "V" if pos == "V" else ("PN" if "PN" in tags else ("ADJ" if "ADJ" in tags else "N"))
        d["codes"][r] = code
by = {}
for d in words.values():
    for r, code in d["codes"].items():
        by.setdefault((r, d["t"]), Counter())[code] += 1
rp = os.path.join(root_dir, "quran-roots.json")
rj = json.load(open(rp, encoding="utf8"))
n = miss = 0
for r, forms in rj["roots"]:
    for f in forms:
        c = by.get((r, f[0]))
        del f[4:]
        if c: f.append(c.most_common(1)[0][0])
        else: f.append(""); miss += 1
        n += 1
json.dump(rj, open(rp, "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
tot = Counter(f[4] for r, fs in rj["roots"] for f in fs)
print("forms", n, "without pos", miss, dict(tot))
