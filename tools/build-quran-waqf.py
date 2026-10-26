#!/usr/bin/env python3
"""quran-waqf.json: ওয়াক্ফ (থামার) চিহ্নের অবস্থান, প্রতি আয়াতে শব্দ-নম্বর অনুযায়ী।
উৎস: fawazahmed0/quran-api, সংস্করণ ara-quranuthmanihaf (Tanzil.net-এর উসমানি হাফস টেক্সট, চিহ্নসহ)।
আউটপুট: {"সূরা:আয়াত": "শব্দনম্বর+চিহ্ন,শব্দনম্বর+চিহ্ন"}  (শব্দ-নম্বর ১ থেকে, quran-chunks/a-র শব্দ গোনার সাথে মেলে)
যেসব আয়াতে শব্দ-সংখ্যা মেলে না সেগুলো বাদ থাকে (তখন ওই আয়াতে পুরোটাই একটি অংশ ধরা হয়)।
Usage: python3 tools/build-quran-waqf.py [path/to/ara-quranuthmanihaf.json]"""
import json, os, re, sys, urllib.request
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join("/tmp", "ara-quranuthmanihaf.json")
if not os.path.exists(src):
    urllib.request.urlretrieve("https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/ara-quranuthmanihaf.json", src)
M = "ۖۗۘۙۚۛۜ"
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def parse(text):
    words, marks = [], {}
    for k in text.split(" "):
        core = "".join(c for c in k if c not in M)
        mk = "".join(c for c in k if c in M)
        if not core.strip():
            if mk and words: marks[len(words)] = marks.get(len(words), "") + mk
            continue
        # উৎসে "হুদাً" + "ا" আলাদা শব্দ হয়ে আছে; আগের শব্দের সাথে জোড়া হয়
        if words and re.fullmatch(r"[اى]", core.replace("۟", "")) and words[-1].endswith(("ࣰ", "ࣱ", "ࣲ")):
            words[-1] += core
        else:
            words.append(core)
        if mk: marks[len(words)] = marks.get(len(words), "") + mk
    return words, marks
out, skip, cache = {}, 0, {}
for x in json.load(open(src, encoding="utf-8"))["quran"]:
    s, a = x["chapter"], x["verse"]
    if s not in cache: cache[s] = json.load(open(os.path.join(root, "quran-chunks", "a", f"{s}.json"), encoding="utf-8"))
    n = len(cache[s][a - 1].split(" "))
    w, m = parse(x["text"])
    if len(w) != n: skip += 1; continue
    if m: out[f"{s}:{a}"] = ",".join(f"{i}{v}" for i, v in sorted(m.items()))
json.dump(out, open(os.path.join(root, "quran-waqf.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(out), "আয়াতে চিহ্ন;", skip, "আয়াত বাদ (শব্দ-সংখ্যা মেলেনি)")
