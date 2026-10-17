#!/usr/bin/env python3
"""Adds Bangla to the Research page data.
 - word meanings (শব্দার্থ): SadaqaWorks/Word-By-Word-Quran-Android (MIT) -> wordbyword.db, table `bywords`
 - verse translation: Muhiuddin Khan (via tanzil.net), packaged in the npm package quran-json (CC BY-SA 4.0), dist/quran_bn.json
Writes quran-bn.json (verse translations), quran-wbw-bn.json (per-verse word meanings joined by |) and
adds the most common Bangla meaning to every word form in quran-roots.json (4th item of each form).
Run tools/build-quran-roots.py first.
Usage: python3 tools/build-quran-bn.py [wordbyword.db] [quran_bn.json]
  (npm pack quran-json@3.1.2 && tar xzf quran-json-3.1.2.tgz  ->  package/dist/quran_bn.json)"""
import sys, os, json, sqlite3, urllib.request
from collections import Counter
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
db = sys.argv[1] if len(sys.argv) > 1 else "/tmp/wordbyword.db"
bnf = sys.argv[2] if len(sys.argv) > 2 else "package/dist/quran_bn.json"
if not os.path.exists(db):
    urllib.request.urlretrieve("https://raw.githubusercontent.com/SadaqaWorks/Word-By-Word-Quran-Android/master/app/src/main/assets/databases/wordbyword.db", db)
clean = lambda s: " ".join((s or "").replace("\u00a0", " ").split())
by = {}
for s, a, w, bn in sqlite3.connect(db).execute("select surah_id,verse_id,words_id,translate_bn from bywords"):
    by[(s, a, w)] = clean(bn)
ay = json.load(open(os.path.join(root, "quran-ayat.json"), encoding="utf8"))
wbw = [[("|".join(by.get((si, ai, i), "") for i in range(1, len(t.split(" ")) + 1))) for ai, t in enumerate(sur, 1)] for si, sur in enumerate(ay, 1)]
json.dump(wbw, open(os.path.join(root, "quran-wbw-bn.json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
q = json.load(open(bnf, encoding="utf8"))
tr = [[clean(v["translation"]) for v in sur["verses"]] for sur in q]
assert [len(x) for x in tr] == [len(x) for x in ay], "verse count mismatch"
json.dump(tr, open(os.path.join(root, "quran-bn.json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
rp = os.path.join(root, "quran-roots.json"); rj = json.load(open(rp, encoding="utf8"))
for r, forms in rj["roots"]:
    for f in forms:
        c = Counter(by.get(tuple(map(int, x.split(":"))), "") for x in f[2].split(","))
        c.pop("", None)
        del f[3:]
        f.append(c.most_common(1)[0][0] if c else "")
json.dump(rj, open(rp, "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
print("ok: verses", sum(map(len, tr)), "word meanings", len(by))
