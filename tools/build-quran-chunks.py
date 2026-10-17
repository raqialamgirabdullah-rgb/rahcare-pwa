"""quran-ayat.json / quran-bn.json / quran-wbw-bn.json -> quran-chunks/{a,b,w}/<surah>.json
Research পেজ শুধু যে সূরার আয়াত দেখাচ্ছে সেটুকুই নামায় (৩ বড় ফাইল একসাথে নয়)।"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = {"a": "quran-ayat.json", "b": "quran-bn.json", "w": "quran-wbw-bn.json"}
for k, f in src.items():
    data = json.loads((root / f).read_text("utf-8"))
    out = root / "quran-chunks" / k
    out.mkdir(parents=True, exist_ok=True)
    for i, surah in enumerate(data, 1):
        (out / f"{i}.json").write_text(json.dumps(surah, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(k, len(data), "surahs ->", out)
