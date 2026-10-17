#!/usr/bin/env python3
"""Builds quran-roots.json (root -> word forms -> verse locations) and quran-ayat.json (verse texts)
from mustafa0x/quran-morphology (fork of the Quranic Arabic Corpus v0.4, GNU GPL).
Usage: python3 tools/build-quran-roots.py [path/to/quran-morphology.txt]"""
import sys, os, json, urllib.request
from collections import OrderedDict
root_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join("/tmp", "quran-morphology.txt")
if not os.path.exists(src):
    urllib.request.urlretrieve("https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt", src)
words = OrderedDict()  # (s,a,w) -> {"segs": [text], "roots": [], "lem": ""}
for line in open(src, encoding="utf8"):
    line = line.rstrip("\n")
    if not line: continue
    loc, text, pos, feats = line.split("\t")
    s, a, w, _ = loc.split(":")
    k = (int(s), int(a), int(w))
    d = words.setdefault(k, {"t": "", "roots": [], "lem": ""})
    d["t"] += text
    tags = feats.split("|")
    for t in tags:
        if t.startswith("ROOT:") and t[5:] not in d["roots"]: d["roots"].append(t[5:])
        if t.startswith("LEM:") and "PREF" not in tags and "SUFF" not in tags and not d["lem"]: d["lem"] = t[4:]
ayat = OrderedDict()
roots = {}
for (s, a, w), d in words.items():
    ayat.setdefault((s, a), []).append(d["t"])
    for r in d["roots"]:
        f = roots.setdefault(r, OrderedDict()).setdefault(d["t"], [d["lem"], []])
        f[1].append("%d:%d:%d" % (s, a, w))
out = {"roots": [[r, [[t, v[0], ",".join(v[1])] for t, v in forms.items()]] for r, forms in sorted(roots.items())]}
json.dump(out, open(os.path.join(root_dir, "quran-roots.json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
surahs = {}
for (s, a), ws in ayat.items(): surahs.setdefault(s, []).append(" ".join(ws))
json.dump([surahs[i] for i in sorted(surahs)], open(os.path.join(root_dir, "quran-ayat.json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
print("roots", len(roots), "words", len(words), "ayat", len(ayat), "surahs", len(surahs))
