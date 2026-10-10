/* এডমিনের জন্য Response Diagnosis চেকলিস্ট — প্রতিটি এন্ট্রিতে তিনটি জিনিস: কাজ → রিঅ্যাকশন → ফলাফল
   কাজ = কোন আয়াত/আমল পড়া হলো, রিঅ্যাকশন = তাতে কী ঘটলো (টিক হয়), ফলাফল = ওই রিঅ্যাকশনে কী বোঝায়
   ডেটা ফরম্যাট:
   "## " = বড় ভাগ, "★ ... ★" = সেকশন
   "▶ ..." = সেকশনের কাজ (এক সেকশনে একাধিক হতে পারে; এই সেকশনের সব এন্ট্রির জন্য প্রযোজ্য)
   "☐ রিঅ্যাকশন | রিঅ্যাকশন => ফলাফল"          (কাজ সেকশন থেকে আসে)
   "☐ নিজস্ব কাজ :: রিঅ্যাকশন | রিঅ্যাকশন => ফলাফল"  (এন্ট্রির নিজস্ব কাজ থাকলে "::" এর আগে) */

const RAW = `
## রুকইয়াহ পড়লে/শুনলে রেসপন্সের আলামত
★ পেটে থাকা যাদুর আলামত ★
▶ রুকইয়াহ (আয়াত/তদবির পড়া বা শোনা)
☐ পেট গুড়গুড় | ঢেকুর | বাতাস | বমি ভাব | পেট ফুলে ওঠা => পেটে থাকা যাদুর আলামত
★ পা, কাঁধ, হাতে থাকা যাদুর আলামত ★
▶ রুকইয়াহ (আয়াত/তদবির পড়া বা শোনা)
☐ হাত মুষ্টি বন্ধ খুলে না | পা বেঁকে যায় => পা, কাঁধ, হাতে থাকা যাদুর আলামত
★ পাহাড়ি যাদুর আলামত ★
☐ "পাহাড়" শব্দ বলা :: কাঁপে => পাহাড়ি যাদুর আলামত
☐ "আল্লাহুম্মা আবতিল সিহরাল জাবাল" বলা :: কাঁপে | বমি => পাহাড়ি যাদুর আলামত
☐ "ইফতাহ" (তালা খোলার আয়াত) বলা :: চিৎকার => পাহাড়ি যাদুর আলামত
☐ "ওয়া মা রামাইতা" (বান ফেরত) বলা :: বুকে টান => পাহাড়ি যাদুর আলামত
★ সাধারণ জ্বিনের আলামত ★
▶ রুকইয়াহ বা তদবির করা বা শোনা
☐ চিৎকার করে | কাঁদে | হাজির হয় | বলে "আমি যাবো" => সাধারণ জ্বিনের আলামত
★ চালান জ্বিনের আলামত ★
▶ রুকইয়াহ (আয়াত/তদবির পড়া বা শোনা)
☐ হাজির হয় না | চুপ থাকে | শুধু শরীরের ভিতর দৌড়ায় | পেটে বল নড়ে | বুকে চাপ লাগে | মুখে কথা বলে না => চালান জ্বিনের আলামত

## চালান লেগেছে কিভাবে শিওর হবেন
★ পরীক্ষা-০১: পানি টেস্ট - সবচেয়ে সহজ ★
▶ এক গ্লাস পরিষ্কার পানিতে সূরা ফাতিহা ৭ বার, আয়াতুল কুরসি ৭ বার, সূরা ফালাক-নাস ৭ বার পড়ে ফুঁ দিন। এবার রোগীকে খাওয়ান, আর চোখের দিকে তাকান।
☐ খেতে তিতা | খেতে টক | পোড়া গন্ধ লাগে => চালান, পেটে যাদু আছে।
☐ খেয়ে বমি আসে | পেট গড়গড় করে => হাঁড়ি চালান।
☐ খেয়ে মাথা ঘোরে | চোখ অন্ধকার => মাথায় চালান, ছবি চালান
☐ কিছুই না লাগে | মিষ্টি লাগে => চালান নেই, বা খুব পুরাতন, গভীরে।
★ পরীক্ষা - ২: হাত টেস্ট ★
▶ রোগীকে বলুন - দুই হাত সামনে রাখতে, আপনি তার কানের কাছে সূরা সাফফাতের প্রথম ১০ আয়াত জোরে পড়ুন।
☐ হাত কাঁপে | আঙুল বেঁকে যায় | হাত মুষ্টি হয় | হাত ভারী হয়ে নিচে পড়ে যায় => চালান জ্বিন শরীরে আছে, হাজির হতে চায় না, কিন্তু হাত দিয়ে সিগনাল দিচ্ছে।
★ পরীক্ষা - ৩: স্বপ্ন টেস্ট - ইস্তিখারা ★
▶ রোগীকে বলুন - ৩ রাত, এশার পর ওযু করে, ২ রাকাত নফল পড়ে, এই দোয়া ৩ বার পড়ে ঘুমাতে:
▶ "আল্লাহুম্মা আরিনি সিহরি ওয়া মাকানা সিহরি" - হে আল্লাহ, আমার যাদু ও যাদুর জায়গা আমাকে দেখিয়ে দিন। তারপর সূরা যিলযাল ৩ বার পড়ে ডান কাতে ঘুমাতে।
☐ ৩ রাতের ভিতর স্বপ্নে দেখা - কে করেছে | ৩ রাতের ভিতর স্বপ্নে দেখা - কী দিয়ে করেছে | ৩ রাতের ভিতর স্বপ্নে দেখা - কোথায় আছে => স্বপ্নে জানা যায় - কে করেছে, কী দিয়ে করেছে, কোথায় আছে।
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
      s = { title: line.replace(/^★\s*/, "").replace(/\s*★\s*$/, "").trim(), actions: [], items: [] };
      g.sections.push(s);
    } else if (line.startsWith("▶")) {
      s.actions.push(line.replace(/^▶\s*/, ""));
    } else if (line.startsWith("☐")) {
      let body = line.replace(/^☐\s*/, "");
      let action = "";
      const ai = body.indexOf(" :: ");
      if (ai >= 0) { action = body.slice(0, ai).trim(); body = body.slice(ai + 4); }
      const ri = body.indexOf(" => ");
      const result = ri >= 0 ? body.slice(ri + 4).trim() : "";
      const reacts = (ri >= 0 ? body.slice(0, ri) : body).split(" | ").map(x => x.trim()).filter(Boolean);
      const base = "r" + n++, multi = reacts.length > 1;
      s.items.push({ action, result, reacts: reacts.map((t, k) => ({ id: multi ? base + "_" + k : base, text: t })) });
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
  box.appendChild(el("h3", "margin:6px 0 4px;font-size:17px;color:var(--primary-color,#4f46e5)", "📈 Response চেকলিস্ট"));
  box.appendChild(el("div", "font-size:12px;color:#64748b;margin-bottom:6px", "কাজ (কোন আয়াত/আমল) → রিঅ্যাকশন (টিক দিন) → ফলাফল"));

  const result = el("div", "position:sticky;top:0;z-index:5;background:#fff;border:1px solid #c7d2fe;border-radius:10px;padding:10px 12px;margin:8px 0 14px;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,.08)");
  box.appendChild(result);

  const badges = new Map(), resEls = [];
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
      for (const a of s.actions) {
        const ab = el("div", "font-size:13px;color:#1e3a8a;background:#eff6ff;border-radius:8px;padding:6px 8px;margin:4px 0;line-height:1.6");
        ab.appendChild(el("b", "", "🔹 কাজ: "));
        ab.appendChild(el("span", "", a));
        sec.appendChild(ab);
      }
      for (const it of s.items) {
        const card = el("div", "border-top:1px dashed #e2e8f0;margin-top:8px;padding-top:6px");
        if (it.action) {
          const ab = el("div", "font-size:13px;color:#1e3a8a;background:#eff6ff;border-radius:8px;padding:6px 8px;margin:4px 0;line-height:1.6");
          ab.appendChild(el("b", "", "🔹 কাজ: "));
          ab.appendChild(el("span", "", it.action));
          card.appendChild(ab);
        }
        card.appendChild(el("div", "font-size:12px;color:#64748b;margin-top:4px", "🔸 রিঅ্যাকশন"));
        for (const r of it.reacts) {
          const lab = el("label", "display:flex;gap:8px;align-items:flex-start;padding:5px 0;font-size:14px;line-height:1.5;cursor:pointer");
          const cb = el("input", "flex:none;width:18px;height:18px;margin-top:3px");
          cb.type = "checkbox";
          cb.checked = sel.has(r.id);
          cb.onchange = () => { cb.checked ? sel.add(r.id) : sel.delete(r.id); update(); };
          lab.appendChild(cb);
          lab.appendChild(el("span", "", r.text));
          card.appendChild(lab);
        }
        if (it.result) {
          const re = el("div", "font-size:13px;padding:6px 8px;border-radius:8px;margin-top:4px;line-height:1.6");
          re.appendChild(el("b", "", "➜ ফলাফল: "));
          re.appendChild(el("span", "", it.result));
          card.appendChild(re);
          resEls.push({ it, re });
        }
        sec.appendChild(card);
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
    const byResult = new Map();
    for (const s of all) {
      let n = 0, tot = 0;
      for (const it of s.items) {
        const on = it.reacts.filter(r => sel.has(r.id));
        n += on.length; tot += it.reacts.length;
        if (on.length && it.result) {
          if (!byResult.has(it.result)) byResult.set(it.result, []);
          byResult.get(it.result).push({ act: it.action, on: on.map(r => r.text) });
        }
      }
      badges.get(s).textContent = toBn(n) + "/" + toBn(tot);
      badges.get(s).style.cssText = "flex:none;font-size:12px;border-radius:99px;padding:2px 8px;" +
        (n ? "background:#dcfce7;color:#166534;font-weight:700" : "background:#f1f5f9;color:#475569");
    }
    for (const { it, re } of resEls) {
      const hit = it.reacts.some(r => sel.has(r.id));
      re.style.background = hit ? "#dcfce7" : "#f8fafc";
      re.style.color = hit ? "#166534" : "#94a3b8";
      re.style.fontWeight = hit ? "700" : "400";
    }
    const total = all.reduce((t, s) => t + s.items.reduce((u, it) => u + it.reacts.length, 0), 0);
    result.innerHTML = "";
    result.appendChild(el("div", "font-weight:700;margin-bottom:4px", "📊 ফলাফল — মোট রিঅ্যাকশন টিক: " + toBn(sel.size) + " / " + toBn(total)));
    if (!byResult.size) { result.appendChild(el("div", "color:#64748b", "কোনো রিঅ্যাকশন টিক দেওয়া হয়নি।")); return; }
    const list = el("div", "max-height:170px;overflow:auto");
    for (const [res, arr] of byResult) {
      const reacts = [...new Set(arr.flatMap(x => x.on))].join(", ");
      const acts = [...new Set(arr.map(x => x.act).filter(Boolean))].join(" • ");
      let t = "✅ " + res + " — রিঅ্যাকশন: " + reacts;
      if (acts) t += " (কাজ: " + acts + ")";
      list.appendChild(el("div", "padding:3px 0;color:#166534;font-weight:700", t));
    }
    result.appendChild(list);
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
