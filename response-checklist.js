/* এডমিনের জন্য Response Diagnosis চেকলিস্ট (রুকইয়াহতে রোগীর রেসপন্স + চালান শিওর হওয়ার পরীক্ষা)
   ডেটা ফরম্যাট: "## " = বড় ভাগ, "★ ... ★" = সেকশন, "ℹ ..." = নির্দেশনা (টিক নয়), "☐ ..." = টিক আইটেম
   "☐ ক | খ | গ" = এক লাইনে একাধিক আলামত (আলাদা টিক), "☐ ... => ফল" = টিক দিলে ফলাফলে "ফল" দেখাবে */

const RAW = `
## রুকইয়াহ পড়লে/শুনলে রেসপন্সের আলামত
★ পেটে থাকা যাদুর আলামত ★
☐ পেট গুড়গুড় | ঢেকুর | বাতাস | বমি ভাব | পেট ফুলে ওঠা
★ পা, কাঁধ, হাতে থাকা যাদুর আলামত ★
☐ হাত মুষ্টি বন্ধ খুলে না | পা বেঁকে যায়
★ পাহাড়ি যাদুর আলামত ★
☐ "পাহাড়" শব্দে কাঁপে | "আল্লাহুম্মা আবতিল সিহরাল জাবাল" বললে কাঁপে, বমি | "ইফতাহ" তালা খোলার আয়াত বললে চিৎকার | "ওয়া মা রামাইতা" বান ফেরত বললে বুকে টান
★ সাধারণ জ্বিনের আলামত ★
ℹ রুকইয়াহ বা তদবির করলে বা শুনলে:
☐ চিৎকার করে | কাঁদে | হাজির হয় | বলে "আমি যাবো"
★ চালান জ্বিনের আলামত ★
☐ হাজির হয় না | চুপ থাকে | শুধু শরীরের ভিতর দৌড়ায় | পেটে বল নড়ে | বুকে চাপ লাগে | মুখে কথা বলে না

## চালান লেগেছে কিভাবে শিওর হবেন
★ পরীক্ষা-০১: পানি টেস্ট - সবচেয়ে সহজ ★
ℹ এক গ্লাস পরিষ্কার পানিতে সূরা ফাতিহা ৭ বার, আয়াতুল কুরসি ৭ বার, সূরা ফালাক-নাস ৭ বার পড়ে ফুঁ দিন। এবার রোগীকে খাওয়ান, আর চোখের দিকে তাকান।
☐ খেতে তিতা, টক, বা পোড়া গন্ধ লাগে => চালান, পেটে যাদু আছে।
☐ খেয়ে বমি আসে, বা পেট গড়গড় করে => হাঁড়ি চালান।
☐ খেয়ে মাথা ঘোরে, চোখ অন্ধকার => মাথায় চালান, ছবি চালান
☐ কিছুই না লাগে, মিষ্টি লাগে => চালান নেই, বা খুব পুরাতন, গভীরে।
★ পরীক্ষা - ২: হাত টেস্ট ★
ℹ রোগীকে বলুন - দুই হাত সামনে রাখতে, আপনি তার কানের কাছে সূরা সাফফাতের প্রথম ১০ আয়াত জোরে পড়ুন।
☐ হাত কাঁপে | আঙুল বেঁকে যায় | হাত মুষ্টি হয় | হাত ভারী হয়ে নিচে পড়ে যায => চালান জ্বিন শরীরে আছে, হাজির হতে চায় না, কিন্তু হাত দিয়ে সিগনাল দিচ্ছে।
★ পরীক্ষা - ৩: স্বপ্ন টেস্ট - ইস্তিখারা ★
ℹ রোগীকে বলুন - ৩ রাত, এশার পর ওযু করে, ২ রাকাত নফল পড়ে, এই দোয়া ৩ বার পড়ে ঘুমাতে:
ℹ "আল্লাহুম্মা আরিনি সিহরি ওয়া মাকানা সিহরি" - হে আল্লাহ, আমার যাদু ও যাদুর জায়গা আমাকে দেখিয়ে দিন। তারপর সূরা যিলযাল ৩ বার পড়ে ডান কাতে ঘুমাতে।
☐ ৩ রাতের ভিতর স্বপ্নে দেখেছে - কে করেছে | ৩ রাতের ভিতর স্বপ্নে দেখেছে - কী দিয়ে করেছে | ৩ রাতের ভিতর স্বপ্নে দেখেছে - কোথায় আছে
`;

/* ---------- পার্সার ---------- */
function parse() {
  const groups = [];
  let g = null, s = null, n = 0;
  for (const line of RAW.split("\n").map(x => x.trim()).filter(Boolean)) {
    if (line.startsWith("## ")) {
      g = { title: line.slice(3), sections: [] };
      groups.push(g);
    } else if (line.startsWith("★")) {
      const title = line.replace(/^★\s*/, "").replace(/\s*★\s*$/, "").trim();
      s = { title, notes: [], items: [] };
      g.sections.push(s);
    } else if (line.startsWith("ℹ")) {
      s.notes.push(line.replace(/^ℹ\s*/, ""));
    } else if (line.startsWith("☐")) {
      const body = line.replace(/^☐\s*/, "");
      const ix = body.indexOf(" => ");
      const meaning = ix >= 0 ? body.slice(ix + 4).trim() : "";
      const parts = (ix >= 0 ? body.slice(0, ix) : body).split(" | ").map(x => x.trim()).filter(Boolean);
      const base = "r" + n++, multi = parts.length > 1;
      parts.forEach((t, k) => s.items.push({ id: multi ? base + "_" + k : base, text: t, meaning, showM: k === parts.length - 1 }));
    }
  }
  return groups;
}

const toBn = x => String(x).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);

/* ---------- রেন্ডার ----------
   mountResponseChecklist(box, { checked: string[], onSave: async(ids)=>void }) */
export function mountResponseChecklist(box, opt) {
  const groups = parse(), all = groups.flatMap(g => g.sections);
  const sel = new Set(opt.checked || []);
  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };

  box.innerHTML = "";
  box.appendChild(el("h3", "margin:6px 0 8px;font-size:17px;color:var(--primary-color,#4f46e5)", "📈 Response চেকলিস্ট"));

  const result = el("div", "position:sticky;top:0;z-index:5;background:#fff;border:1px solid #c7d2fe;border-radius:10px;padding:10px 12px;margin:8px 0 14px;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,.08)");
  box.appendChild(result);

  const badges = new Map();
  for (const g of groups) {
    box.appendChild(el("h4", "margin:16px 0 8px;font-size:15px;padding-bottom:4px;border-bottom:2px solid #e2e8f0", g.title));
    for (const s of g.sections) {
      const sec = el("div", "border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;margin:0 0 10px");
      const head = el("div", "display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:6px");
      head.appendChild(el("div", "font-weight:700;font-size:14px", "★ " + s.title));
      const badge = el("span", "flex:none;font-size:12px;color:#475569;background:#f1f5f9;border-radius:99px;padding:2px 8px");
      head.appendChild(badge);
      sec.appendChild(head);
      badges.set(s, badge);
      for (const t of s.notes) sec.appendChild(el("div", "font-size:13px;color:#334155;background:#f8fafc;border-radius:8px;padding:6px 8px;margin:4px 0;line-height:1.6", t));
      for (const it of s.items) {
        const lab = el("label", "display:flex;gap:8px;align-items:flex-start;padding:6px 0;font-size:14px;line-height:1.5;cursor:pointer");
        const cb = el("input", "flex:none;width:18px;height:18px;margin-top:3px");
        cb.type = "checkbox";
        cb.checked = sel.has(it.id);
        cb.onchange = () => { cb.checked ? sel.add(it.id) : sel.delete(it.id); update(); };
        lab.appendChild(cb);
        const txt = el("span", "");
        txt.appendChild(el("span", "", it.text));
        if (it.meaning && it.showM) txt.appendChild(el("div", "font-size:12px;color:#64748b", "→ " + it.meaning));
        lab.appendChild(txt);
        sec.appendChild(lab);
      }
      box.appendChild(sec);
    }
  }

  const row = el("div", "display:flex;gap:8px;align-items:center;margin-top:12px");
  const save = el("button", "flex:1", "Save checklist");
  save.type = "button"; save.className = "rc-btn rc-btn-primary";
  row.appendChild(save);
  box.appendChild(row);
  const st = el("div", "text-align:center;font-size:12px;margin-top:8px;min-height:16px");
  box.appendChild(st);

  function update() {
    const rows = [], meanings = [];
    for (const s of all) {
      const ticked = s.items.filter(i => sel.has(i.id));
      badges.get(s).textContent = toBn(ticked.length) + "/" + toBn(s.items.length);
      badges.get(s).style.cssText = "flex:none;font-size:12px;border-radius:99px;padding:2px 8px;" +
        (ticked.length ? "background:#dcfce7;color:#166534;font-weight:700" : "background:#f1f5f9;color:#475569");
      if (ticked.length) rows.push({ s, n: ticked.length, p: Math.round(ticked.length / s.items.length * 100) });
      ticked.forEach(i => { if (i.meaning && !meanings.includes(i.meaning)) meanings.push(i.meaning); });
    }
    const total = all.reduce((t, s) => t + s.items.length, 0);
    result.innerHTML = "";
    result.appendChild(el("div", "font-weight:700;margin-bottom:4px", "📊 ফলাফল — মোট টিক: " + toBn(sel.size) + " / " + toBn(total)));
    if (!rows.length) { result.appendChild(el("div", "color:#64748b", "কোনো আলামত টিক দেওয়া হয়নি।")); return; }
    const list = el("div", "max-height:150px;overflow:auto");
    rows.sort((a, b) => b.p - a.p || b.n - a.n);
    for (const r of rows) list.appendChild(el("div", "padding:2px 0", "• " + r.s.title + " — " + toBn(r.n) + "/" + toBn(r.s.items.length) + " (" + toBn(r.p) + "%)"));
    result.appendChild(list);
    if (meanings.length) {
      const m = el("div", "margin-top:6px;padding-top:6px;border-top:1px dashed #cbd5e1;color:#166534;font-weight:700");
      m.textContent = "🔎 পরীক্ষার ফল: " + meanings.join(" • ");
      result.appendChild(m);
    }
    result.appendChild(el("div", "font-size:11px;color:#94a3b8;margin-top:4px", "এটি আলামত মিলের হিসাব; চূড়ান্ত সিদ্ধান্ত নয়।"));
  }
  update();

  save.onclick = async () => {
    save.disabled = true;
    st.style.color = "#64748b"; st.textContent = "Saving...";
    try {
      await opt.onSave([...sel]);
      st.style.color = "#16a34a"; st.textContent = "✅ Saved";
    } catch (e) {
      console.error(e);
      st.style.color = "#dc2626"; st.textContent = "Save failed";
    }
    save.disabled = false;
  };
}
