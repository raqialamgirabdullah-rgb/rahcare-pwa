/* Prescription: ধাপ ২-৭ (সুরক্ষা → গিট বাতিল → বের করা → খাদেম → দরজা বন্ধ → শোকর), তাশখিস (Symptom + Response) থেকে স্বয়ংক্রিয়।
   ধাপ ১ = তাশখিস নিজেই (Symptom Diagnosis + Response Diagnosis), তাই এখানে শুধু "তাশখিসের সারাংশ" হিসেবে আসে।
   প্রতিটি ধাপে: কাজ → রিঅ্যাকশন → ফলাফল।
   mountPrescriptionPlan(box, { symptomChecks, responseChecks, saved, patientName, onSavePlan(obj), onFill(text) }) */

import { symptomSummary } from "./symptom-checklist.js?v=3";
import { responseSummary } from "./response-checklist.js?v=2";

const toBn = x => String(x).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);

/* ---------- রোগীর ধরন ---------- */
const TYPES = {
  "1": { name: "১. নতুন যাদু (১-৪০ দিনের মধ্যে করা)", time: "৭-২১ দিনে ভালো",
    lines: ["ধাপ ২-৭ একবার (৬ ধাপ ১ বার)", "১১ দিনের আমল: ফালাক-নাস (১১ আয়াত) + ৭ আয়াতে বাতিল - পানি + তেল, প্রতিদিন ১ বৈঠক", "হিজামা লাগে না"] },
  "2": { name: "২. মাঝারি পুরনো (৩ মাস - ১ বছর)", time: "৪০ দিনে ভালো (এটাই সবচেয়ে বেশি)",
    lines: ["৬ ধাপ ২ বার ঘুরাতে হয়", "প্রথম ১১ দিন - গিঁট খোলা", "মাঝে ৭ দিন - বের করা: হিজামা ১ বার + সোনা পাতা", "শেষ ২১ দিন - ঘর/বাসা বন্ধ করা: বাকারা + সুরক্ষা, যাতে ফিরে না আসে", "মোট ৪০ দিন লেগে থাকা"] },
  "3": { name: "৩. পুরনো ও জটিল (১ বছর - ৫/১০ বছর)", time: "৩ থেকে ৬ মাস, ধৈর্যের পরীক্ষা",
    lines: ["৬ ধাপ ৩-৪ বার", "প্রতি মাসে: ১১ দিন রুকইয়াহ + ১ বার হিজামা + ১ বার সোনা পাতা - ৩ মাস", "তারপর ২ মাস শুধু সুরক্ষা - কোনো ফুঁ না, শুধু বাকারা + ৩ কুল, যাতে শরীর বিশ্রাম পায়"] },
  "4": { name: "৪. আল্লাহ যাকে চান - এক বৈঠকে ভালো", time: "এক ফুঁতে ভালো - এটা আল্লাহর হাতে",
    lines: ["এক বৈঠক"] }
};
const TIME_SECS = [["১ থেকে ৪০ দিনের", "1"], ["৩ মাস থেকে ১ বছরের", "2"], ["১ বছর থেকে ৫-১০ বছরের", "3"]];
const KINDS = ["মা'কুল", "মাদফুন", "তাফরিক", "তাতিল"];
const DX = ["যাদু", "নজর", "জিন"];
const CAUTION = ["গর্ভবতী", "শিশু", "বৃদ্ধ", "ডায়াবেটিস/হৃদরোগ/কিডনি/রক্তচাপ/রক্তশূন্যতা", "নিয়মিত ওষুধ খান"];

const SAFE = [
  "ডাক্তারের দেওয়া ওষুধ নিজে বন্ধ করবেন না।",
  "বমি, ডায়রিয়া, জ্বর, বুকে ব্যথা বা শ্বাসকষ্ট তীব্র বা দীর্ঘস্থায়ী হলে অবিলম্বে ডাক্তার দেখান।",
  "গর্ভবতী, শিশু, বৃদ্ধ, ডায়াবেটিস/হৃদরোগ/কিডনি/রক্তচাপ/রক্তশূন্যতার রোগী বা নিয়মিত ওষুধ খাওয়া রোগীর জন্য জোলাপ, বমি, হিজামা ও রোজা ডাক্তারের পরামর্শ ছাড়া নয়।"
];
const EMERGENCY = "জরুরি: আত্মহত্যার চিন্তার লক্ষণ টিক দেওয়া আছে। রোগীকে একা রাখবেন না, পরিবারের কাউকে জানান এবং অবিলম্বে চিকিৎসক/মানসিক স্বাস্থ্যসেবার সাহায্য নিন। বিপদে ৯৯৯। এই প্রেসক্রিপশন চিকিৎসার বিকল্প নয়।";

/* ---------- ১১ আয়াত = ১১ গিঁট ---------- */
const AYAT = [
  ["قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ", "বাইরের পোঁতা যাদুর গিঁট", 1],
  ["مِنْ شَرِّ مَا خَلَقَ", "সৃষ্টির ক্ষতির গিঁট", 1],
  ["وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَ", "রাতের অন্ধকারে করা গিঁট", 1],
  ["وَمِنْ شَرِّ النَّفّٰثٰتِ فِی الْعُقَدِ", "আসল গিঁটে ফুঁ দেওয়া", 7],
  ["وَمِنْ شَرِّ حَاسِدٍ اِذَا حَسَدَ", "হিংসুকের হাসাদের গিঁট - রোগী/পরিবারকে আলাদা করার গিঁট", 1],
  ["قُلْ اَعُوْذُ بِرَبِّ النَّاسِ", "মানুষরূপী শয়তানের গিঁট", 1],
  ["مَلِكِ النَّاسِ", "কোমর থেকে পা ভারী করার গিঁট", 1],
  ["اِلٰهِ النَّاسِ", "বুকে চাপ, শ্বাস আটকানোর গিঁট", 1],
  ["مِنْ شَرِّ الْوَسْوَاسِ ەۙ الْخَنَّاسِ", "মাথায় ওয়াসওয়াসা, চোখ লাফানোর গিঁট", 1],
  ["الَّذِیۡ یُوَسْوِسُ فِیْ صُدُوۡرِ النَّاسِ", "অন্তরে ঘৃণা ঢোকানোর গিঁট - ভাই ভাইকে/পরিবারকে ঘৃণা করার গিঁট", 1],
  ["مِنَ الْجِنَّةِ وَالنَّاسِ", "জিন ও মানুষ দুই শয়তানের শেষ গিঁট", 7]
];
const DUA_AR = "اللَّهُمَّ كَمَا فَكَكْتَ عُقَدَ نَبِيِّكَ مُحَمَّدٍ، فَكَّ عُقَدَ أَخِي وَبَيْتِنَا";
const DUA_BN = "হে আল্লাহ! আপনি যেভাবে আপনার নবী মুহাম্মদ (ﷺ)-এর (উপর থেকে জাদুর) বাঁধন খুলে দিয়েছিলেন, সেভাবেই আমার ভাই এবং আমাদের ঘরের (সকল) বাঁধন খুলে দিন।";

/* ---------- তাশখিস থেকে সংকেত ---------- */
function analyse(symptomChecks, responseChecks) {
  const sy = symptomSummary(symptomChecks), re = responseSummary(responseChecks);
  const ticked = sy.filter(s => s.n > 0);
  const texts = ticked.flatMap(s => s.texts);
  // সময়কাল-সেকশন থেকে ধরন
  let auto = "", best = 0;
  for (const [key, t] of TIME_SECS) {
    const s = sy.find(x => x.title.includes(key));
    if (s && s.n > 0 && s.n >= best) { best = s.n; auto = t; }
  }
  const khadem = sy.find(s => s.title.includes("খাদেম জিন চেনার"));
  const resText = re.map(r => r.result).join(" ");
  const jinn = (khadem && khadem.n > 0) || /জ্বিনের আলামত|চালান জ্বিন শরীরে আছে/.test(resText);
  const stomach = ticked.some(s => s.title.includes("পেট")) || /পেটে/.test(resText);
  const away = texts.some(t => /বাড়ি আসে না|ঘর ছাড়ে/.test(t));
  const selfHarm = texts.some(t => t.includes("আত্মহত্যা"));
  const reactTexts = re.flatMap(r => r.reacts).join(" ");
  const hit = i => {
    const hasSec = k => ticked.some(s => k.some(w => s.title.includes(w)));
    const hasTxt = k => texts.some(t => k.some(w => t.includes(w)));
    if (i === 0) return ticked.some(s => s.group.includes("বাহিরে"));
    if (i === 6) return hasSec(["কোমর", "পা বাঁধ", "পা বন্দি", "পা, কাঁধ"]) || /পা ভারী/.test(reactTexts);
    if (i === 7) return hasSec(["বুক"]);
    if (i === 8) return hasSec(["মাথায়", "মাথা"]) || /মাথা ভারী/.test(reactTexts);
    if (i === 9) return hasTxt(["ঘৃণা"]);
    return false;
  };
  return { sy, re, ticked, auto, jinn, stomach, away, selfHarm, hit };
}

/* ---------- ধাপ ২-৭ ---------- */
// আইটেম: স্ট্রিং | {t, gate:true} (শারীরিক প্রভাবের ধাপ - ডাক্তারের অনুমতি) | {ar, bn, k, rel}
function buildSteps(ctx, A) {
  const g = t => ({ t, gate: true });
  const S = [];
  S.push({ no: 2, title: "সুরক্ষা ও তাওবা", when: "১-৩ দিন",
    blocks: [
      { h: "কাজ", items: [
        "রোগী ও তার পরিবারকে ৩ দিনের তাওবা করানো",
        "সকল তাবিজ, নকশা, লাল সুতা, কবিরাজের পানি - এক বালতি বরই পড়া পানিতে ডুবিয়ে নষ্ট করা",
        "ঘর থেকে ছবি, মূর্তি, গান-বাজনা বের করা",
        "সুরক্ষার আমল মুখস্থ: ৫ ওয়াক্ত নামাজ + সকাল-সন্ধ্যা ৩ কুল + আয়াতুল কুরসি + \"বিসমিল্লাহিল্লাজি লা ইয়াদুররু মাআসমিহি শাইউন ফিল আরদি ওয়ালা ফিস সামায়ি ওয়া হুয়াস সামিউল আলিম\" ৩ বার"] },
      { h: "নিয়ম", items: ["এই ৩ দিন কোনো রুকইয়াহ নয়, শুধু সুরক্ষা"] }
    ],
    pairs: [["৩ দিন পর রোগী বলে - ঘুম একটু ভালো", "দুর্গ তৈরি"]] });

  const s3 = [
    { h: "১১ আয়াতের আমল", items: [
      "নিয়ত: \"হে আল্লাহ, আমি ফালাক-নাসের ১১ আয়াত দিয়ে সব গিঁট খোলার নিয়ত করলাম, তুমি খুলে দাও\"",
      "লাগবে: ১ বালতি পানি + ৭ বরই পাতা বাটা + লবণ + জয়তুন তেল",
      "নিয়ম: ওযু করে - পানি ও তেল সামনে রেখে প্রতিটি আয়াত পড়ে ১ বার ফুঁ দেবেন পানি ও তেলে"] },
    { h: "১১ আয়াত = ১১ গিঁট (সূরা ফালাক ৫ + সূরা নাস ৬)",
      items: AYAT.map((a, i) => ({ ar: a[0], bn: a[1], k: a[2], rel: A.hit(i), no: i + 1 })) },
    { h: "পড়া শেষে", items: ["৩ বার দরুদ পড়ে এই দোয়া:", { ar: DUA_AR, bn: DUA_BN, k: 1, plain: true }] },
    { h: "ব্যবহার", items: [
      "পানি: অর্ধেক সারা বাড়ি ছিটানো - দরজা, চৌকাঠ, রোগীর ঘর। অর্ধেক খাওয়া ও গোসল - ১১ দিন",
      "তেল: রাতে নাভি, কপাল, কোমর-পা মালিশ, যেখানে ভারী লাগে"].concat(A.away
        ? ["যাদুর কারণে ব্যক্তি দূরে গেলে: তার পুরনো জামায় এই পানি ছিটিয়ে আলমারিতে রাখুন - আর প্রতিদিন তার নামে ২০ টাকা সদকা"] : []) },
    { h: "৩ শর্ত", items: ["ঘরে কোনো শিরকি তাবিজ-নকশা রাখবেন না", "গান-ছবি বন্ধ, বাকারা চালু", "কে করেছে খুঁজবেন না"] },
    { h: "৭ আয়াতে বাতিল", items: [
      "আরাফ ১১৭-১২২, ইউনুস ৮১-৮২, ত্বহা ৬৯, ফুরকান ২৩ - প্রতিটি ৭ বার পড়ে পানি ও তেলে ফুঁ",
      "পড়া শেষে: পানি দিয়ে গোসল, তেল দিয়ে মালিশ, বাড়ি ছিটানো"] }
  ];
  S.push({ no: 3, title: "গিঁট বাতিল", when: "৭-১১ দিন, প্রতিদিন ১ বৈঠক - ৪৫ মিনিট", blocks: s3,
    pairs: [["প্রথম ৩ দিন ঘুম, ভয়, স্বপ্ন বাড়ে", "গিঁট নড়ছে"],
            ["৭ আয়াতে বাতিলের পর ৭ দিনের মধ্যে বমি, পায়খানা, ঘাম, কান্না, মাংস লাফানো", "গিঁট খুলছে"]],
    result: "৭ দিন পর হালকা লাগবে",
    note: "আয়াতের সংখ্যা যাচাই বাকি: আরাফ ১১৭-১২২ মানে ৬ আয়াত।" });

  const s4 = [{ h: "কাজ", items: [
    g("পায়খানা দিয়ে বের করা: সোনা পাতা + বরই পাতা + মধু - পড়া পানিতে মিশিয়ে সকালে খাওয়ানো - ১ দিন"),
    g("বমির মাধ্যমে বের করা: লবণ + বরই পাতা পড়া পানি খাইয়ে হালকা বমি (জোরে না) - ১ বার")]
    .concat(ctx.type === "1" ? [] : [g("হিজামার মাধ্যমে বের করা - ১১ দিন পর - সুন্নাহ হিজামা: ঘাড়ে ২টা, কোমরে ২টা, পায়ে ২টা")]) }];
  S.push({ no: 4, title: "বের করা", when: "৩-৭ দিন", blocks: s4,
    pairs: A.stomach ? [["পেটে যাদু (মা'কুল), পেট ফোলা - পায়খানায় কালো, বিজল বের হয়", "যাদুর অংশ"]] : [],
    result: "রোগী বলে - শরীর হালকা",
    note: ctx.type === "1" ? "নতুন যাদুতে হিজামা লাগে না।" : "" });

  S.push({ no: 5, title: "খাদেম বের করা", when: "১-৩ বৈঠক - শুধু জিন থাকলে",
    status: A.jinn ? "জিনের লক্ষণ/রেসপন্স পাওয়া গেছে - প্রযোজ্য হতে পারে" : "জিনের লক্ষণ পাওয়া যায়নি - দরকার না-ও হতে পারে",
    blocks: [{ h: "কাজ", items: [
      "জিন হাজির হলে শুধু ৩ কথা: \"উখরুজ আদুওয়াল্লাহ, ইত্তাকিল্লাহ, লা তুযি হাযাল জাসাদ\" - আল্লাহর শত্রু বের হও, আল্লাহকে ভয় করো, এই শরীরকে কষ্ট দিও না",
      "জিন না বের হলে: আযান + বাকারা + সাফফাত ১-১০ - কানে নরম করে পড়বেন, জোরে ফুঁ না"] }],
    pairs: [], result: "রোগী ঘুম থেকে ওঠার মতো বলবে - আমি কোথায় ছিলাম" });

  S.push({ no: 6, title: "দরজা বন্ধ", when: "৪০ দিন - যাতে ফিরে না আসে",
    blocks: [{ h: "কাজ", items: [
      "ফজর + মাগরিব - ৩ কুল + আয়াতুল কুরসি - কখনো মিস না",
      "ঘুমের আগে - বাকারার শেষ ২ আয়াত + ওযু + বিছানা ঝাড়া",
      "প্রতিদিন বাকারা (লাউডে/নিজে) ১ ঘণ্টা করে ৪০ দিন - বাড়িতে",
      "কোনো ছবি, গান, নাটক না; হারাম থেকে তাওবা"] }],
    pairs: [], result: "৪০ দিন পর শরীরে সীসার দুর্গ - যাদু ফিরে ঢুকতে পারবে না" });

  S.push({ no: 7, title: "শোকর ও সদকা - শিফা ধরে রাখা", when: "শিফা পেলে, সারাজীবন",
    blocks: [{ h: "কাজ", items: [
      "শিফা পেলে ২ রাকাত শোকরানা নামাজ",
      g("৭ দিন রোজা - না পারলে ৩ দিন"),
      g("প্রতিমাসে ১ বার হিজামা + পড়া পানি দিয়ে গোসল (রিচার্জ)"),
      "একটা সদকায়ে জারিয়া: অন্য এক যাদুগ্রস্তকে এই ৭ ধাপ শেখানো"] }],
    pairs: [], result: "" });
  return S;
}

/* ---------- টেক্সট (নোট বক্সে বসানোর জন্য) ---------- */
function toText(st, A, S, steps) {
  const L = [];
  L.push("💊 প্রেসক্রিপশন" + (st.name ? " - " + st.name : ""));
  if (A.selfHarm) L.push("", "⚠️ " + EMERGENCY);
  L.push("", "▶ তাশখিসের ফল: " + [st.dx || "(নির্ধারণ হয়নি)", st.kinds.length ? "প্রকার: " + st.kinds.join(", ") : ""].filter(Boolean).join(" | "));
  const tp = TYPES[st.type];
  if (tp) { L.push("▶ রোগীর ধরন: " + tp.name, "▶ সম্ভাব্য সময়: " + tp.time); tp.lines.forEach(x => L.push("   - " + x)); }
  if (st.dx && st.dx !== "যাদু") L.push("(সতর্কতা: নিচের ৭ ধাপ যাদুর রোগীর জন্য)");
  const top = A.ticked.slice().sort((a, b) => b.n / b.total - a.n / a.total).slice(0, 6);
  if (top.length) { L.push("", "▶ সিম্পটম (প্রধান):"); top.forEach(s => L.push("   • " + s.title + " - " + toBn(s.n) + "/" + toBn(s.total))); }
  if (A.re.length) { L.push("▶ রেসপন্স:"); A.re.forEach(r => L.push("   • " + r.section + ": " + r.reacts.join(", ") + (r.result ? " → " + r.result : ""))); }
  L.push("", "⚠ সতর্কতা"); SAFE.forEach(x => L.push("   - " + x));
  for (const s of steps) {
    L.push("", "━━ ধাপ " + toBn(s.no) + ": " + s.title + " (" + s.when + ")");
    if (s.status) L.push("   [" + s.status + "]");
    for (const b of s.blocks) {
      L.push("  " + b.h + ":");
      for (const it of b.items) {
        if (typeof it === "string") L.push("   • " + it);
        else if (it.gate) L.push(S.caution.length ? "   • (বাদ - ডাক্তারের পরামর্শ ছাড়া নয়) " + it.t : "   • " + it.t + "  [⛔ ডাক্তারের অনুমতি ছাড়া নয়, যদি গর্ভবতী/শিশু/বৃদ্ধ/দীর্ঘস্থায়ী রোগী হন]");
        else L.push("   " + (it.no ? toBn(it.no) + ". " : "• ") + it.ar + (it.plain ? "\n     " + it.bn : " - " + it.bn + (it.k > 1 ? " (" + toBn(it.k) + " বার)" : "")) + (it.rel ? "  ✔ রোগীর লক্ষণের সাথে মিল" : ""));
      }
    }
    s.pairs.forEach(p => L.push("  রিঅ্যাকশন: " + p[0] + "  → ফলাফল: " + p[1]));
    if (s.result) L.push("  ফল: " + s.result);
    if (s.note) L.push("  নোট: " + s.note);
  }
  return L.join("\n");
}

/* ---------- রেন্ডার ---------- */
export function mountPrescriptionPlan(box, opt) {
  const A = analyse(opt.symptomChecks, opt.responseChecks);
  const sv = opt.saved || {};
  const st = {
    name: opt.patientName || "", dx: sv.dx || "", kinds: Array.isArray(sv.kinds) ? sv.kinds.slice() : [],
    type: sv.type || A.auto || "", caution: Array.isArray(sv.caution) ? sv.caution.slice() : []
  };
  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };
  box.innerHTML = "";
  box.appendChild(el("h3", "margin:6px 0 4px;font-size:17px;color:var(--primary-color,#4f46e5)", "💊 প্রেসক্রিপশন (স্বয়ংক্রিয় খসড়া)"));
  box.appendChild(el("div", "font-size:12px;color:#64748b;margin-bottom:8px", "তাশখিস (সিম্পটম + রেসপন্স) থেকে তৈরি। ধাপ ১ = তাশখিস; এখানে ধাপ ২-৭।"));

  if (A.selfHarm) box.appendChild(el("div", "background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;border-radius:10px;padding:10px 12px;margin:8px 0;font-size:13px;font-weight:700;line-height:1.6", "⚠️ " + EMERGENCY));

  /* তাশখিসের সারাংশ */
  const sum = el("div", "border:1px solid #c7d2fe;border-radius:10px;padding:10px 12px;margin:8px 0;font-size:13px;line-height:1.6");
  sum.appendChild(el("div", "font-weight:700;margin-bottom:4px", "🔎 ধাপ ১ - তাশখিসের সারাংশ"));
  const top = A.ticked.slice().sort((a, b) => b.n / b.total - a.n / a.total || b.n - a.n).slice(0, 6);
  if (!top.length && !A.re.length) sum.appendChild(el("div", "color:#64748b", "সিম্পটম বা রেসপন্সে কোনো টিক নেই। আগে ওই দুই পেজে টিক দিয়ে Save করুন।"));
  top.forEach(s => {
    let t = "• " + s.title + " — " + toBn(s.n) + "/" + toBn(s.total);
    if (s.need) t += s.n >= s.need ? " ✅ শর্ত পূর্ণ" : " (শর্ত: " + toBn(s.need) + "টি)";
    sum.appendChild(el("div", "", t));
  });
  if (A.re.length) {
    sum.appendChild(el("div", "font-weight:700;margin-top:6px", "রেসপন্স:"));
    A.re.forEach(r => sum.appendChild(el("div", "", "• " + r.section + ": " + r.reacts.join(", ") + (r.result ? " → " + r.result : ""))));
  }
  box.appendChild(sum);

  /* সেটিংস: ফল, প্রকার, ধরন, সতর্কতা */
  const set = el("div", "border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;margin:8px 0;font-size:13px");
  const row = (label, node) => { const r = el("div", "display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0"); r.appendChild(el("b", "", label)); r.appendChild(node); set.appendChild(r); };
  const sel = (opts, cur, cb) => {
    const s = el("select", "padding:4px 6px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;max-width:100%");
    opts.forEach(([v, t]) => { const o = el("option", "", t); o.value = v; if (v === cur) o.selected = true; s.appendChild(o); });
    s.onchange = () => cb(s.value); return s;
  };
  row("তাশখিসের ফল:", sel([["", "(নির্ধারণ হয়নি)"]].concat(DX.map(d => [d, d])), st.dx, v => { st.dx = v; render(); }));
  const kw = el("span", "display:flex;gap:10px;flex-wrap:wrap");
  KINDS.forEach(k => {
    const l = el("label", "display:flex;gap:4px;align-items:center;cursor:pointer");
    const c = el("input"); c.type = "checkbox"; c.checked = st.kinds.includes(k);
    c.onchange = () => { c.checked ? st.kinds.push(k) : st.kinds.splice(st.kinds.indexOf(k), 1); render(); };
    l.appendChild(c); l.appendChild(el("span", "", k)); kw.appendChild(l);
  });
  row("যাদুর প্রকার:", kw);
  row("রোগীর ধরন:", sel([["", "(নির্ধারণ হয়নি)"]].concat(Object.keys(TYPES).map(k => [k, TYPES[k].name])), st.type, v => { st.type = v; render(); }));
  if (A.auto) set.appendChild(el("div", "font-size:11px;color:#64748b", "সিম্পটমের সময়কাল-সেকশন থেকে ধরন: " + TYPES[A.auto].name));
  const cw = el("div", "margin-top:8px;padding-top:8px;border-top:1px dashed #cbd5e1");
  cw.appendChild(el("b", "", "⚠ সতর্কতা - রোগী কি এদের মধ্যে পড়েন? (জোলাপ, বমি, হিজামা, রোজা তখন বাদ যাবে)"));
  const cl = el("div", "display:flex;flex-direction:column;gap:4px;margin-top:4px");
  CAUTION.forEach(k => {
    const l = el("label", "display:flex;gap:6px;align-items:center;cursor:pointer");
    const c = el("input"); c.type = "checkbox"; c.checked = st.caution.includes(k);
    c.onchange = () => { c.checked ? st.caution.push(k) : st.caution.splice(st.caution.indexOf(k), 1); render(); };
    l.appendChild(c); l.appendChild(el("span", "", k)); cl.appendChild(l);
  });
  cw.appendChild(cl); set.appendChild(cw);
  box.appendChild(set);

  const safe = el("div", "background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:8px 12px;margin:8px 0;font-size:12px;line-height:1.6");
  safe.appendChild(el("b", "", "সাধারণ সতর্কতা"));
  SAFE.forEach(x => safe.appendChild(el("div", "", "• " + x)));
  box.appendChild(safe);

  const plan = el("div", "");
  box.appendChild(plan);

  const btns = el("div", "display:flex;gap:8px;margin:12px 0 4px");
  const fill = el("button", "flex:1", "খসড়া নোটে বসান"); fill.type = "button"; fill.className = "rc-btn";
  const save = el("button", "flex:1", "সেটিংস সেভ"); save.type = "button"; save.className = "rc-btn rc-btn-primary";
  btns.appendChild(fill); btns.appendChild(save); box.appendChild(btns);
  const msg = el("div", "text-align:center;font-size:12px;min-height:16px");
  box.appendChild(msg);

  let steps = [];
  function render() {
    steps = buildSteps(st, A);
    plan.innerHTML = "";
    const tp = TYPES[st.type];
    const head = el("div", "border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:10px 12px;margin:8px 0;font-size:13px;line-height:1.6");
    head.appendChild(el("div", "font-weight:700", tp ? "📅 " + tp.name + " — " + tp.time : "📅 রোগীর ধরন নির্ধারণ হয়নি"));
    if (tp) tp.lines.forEach(x => head.appendChild(el("div", "", "• " + x)));
    if (st.dx && st.dx !== "যাদু") head.appendChild(el("div", "color:#b45309;font-weight:700", "নোট: নিচের ৭ ধাপ যাদুর রোগীর জন্য।"));
    plan.appendChild(head);
    for (const s of steps) {
      const d = el("details", "border:1px solid #e2e8f0;border-radius:10px;padding:8px 12px;margin:8px 0");
      if (s.no === 2) d.open = true;
      d.appendChild(el("summary", "font-weight:700;font-size:14px;cursor:pointer", "ধাপ " + toBn(s.no) + ": " + s.title + " (" + s.when + ")"));
      if (s.status) d.appendChild(el("div", "font-size:12px;color:" + (A.jinn ? "#166534" : "#64748b") + ";margin:4px 0", "• " + s.status));
      for (const b of s.blocks) {
        d.appendChild(el("div", "font-size:12px;color:#1e3a8a;font-weight:700;margin-top:8px", "🔹 " + b.h));
        for (const it of b.items) {
          if (typeof it === "string") d.appendChild(el("div", "font-size:13px;line-height:1.6;margin:2px 0", "• " + it));
          else if (it.gate) {
            const blocked = st.caution.length > 0;
            d.appendChild(el("div", "font-size:13px;line-height:1.6;margin:2px 0;" + (blocked ? "color:#94a3b8;text-decoration:line-through" : ""), "• " + it.t));
            if (blocked) d.appendChild(el("div", "font-size:12px;color:#b91c1c", "   ⛔ বাদ - ডাক্তারের পরামর্শ ছাড়া নয়"));
          } else {
            const r = el("div", "font-size:14px;line-height:1.8;margin:3px 0;padding:4px 6px;border-radius:6px;" + (it.rel ? "background:#dcfce7" : "background:#f8fafc"));
            r.appendChild(el("div", "direction:rtl;text-align:right;font-size:18px", (it.no ? toBn(it.no) + ". " : "") + it.ar));
            r.appendChild(el("div", "font-size:12px;color:#334155", it.bn + (it.k > 1 ? " (" + toBn(it.k) + " বার)" : "") + (it.rel ? "  ✔ রোগীর লক্ষণের সাথে মিল" : "")));
            d.appendChild(r);
          }
        }
      }
      if (s.pairs.length) {
        d.appendChild(el("div", "font-size:12px;color:#64748b;font-weight:700;margin-top:8px", "🔸 রিঅ্যাকশন → ➜ ফলাফল"));
        s.pairs.forEach(p => d.appendChild(el("div", "font-size:13px;line-height:1.6;margin:2px 0", "• " + p[0] + "  →  " + p[1])));
      }
      if (s.result) d.appendChild(el("div", "font-size:13px;margin-top:6px;padding:6px 8px;border-radius:8px;background:#dcfce7;color:#166534;font-weight:700", "➜ ফল: " + s.result));
      if (s.note) d.appendChild(el("div", "font-size:12px;color:#b45309;margin-top:6px", "⚠ " + s.note));
      plan.appendChild(d);
    }
  }
  render();

  fill.onclick = () => {
    try {
      if (opt.onFill(toText(st, A, st, steps)) === false) { msg.style.color = "#64748b"; msg.textContent = "বাতিল করা হয়েছে"; return; }
      msg.style.color = "#16a34a"; msg.textContent = "✅ নিচের নোট বক্সে বসেছে - দেখে Save করুন";
    }
    catch (e) { console.error(e); msg.style.color = "#dc2626"; msg.textContent = "বসানো যায়নি"; }
  };
  save.onclick = async () => {
    save.disabled = true; msg.style.color = "#64748b"; msg.textContent = "Saving...";
    try { await opt.onSavePlan({ dx: st.dx, kinds: st.kinds, type: st.type, caution: st.caution }); msg.style.color = "#16a34a"; msg.textContent = "✅ Saved"; }
    catch (e) { console.error(e); msg.style.color = "#dc2626"; msg.textContent = "Save failed"; }
    save.disabled = false;
  };
}

export { analyse as _analyse, buildSteps as _buildSteps, toText as _toText };
