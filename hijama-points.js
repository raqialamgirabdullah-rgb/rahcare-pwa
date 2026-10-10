/* Hijama Points (শুধু অ্যাডমিন): হিজামা রোগীর নামে ক্লিক করলে ৪টি বডি-ডায়াগ্রাম একটার নিচে আরেকটা।
   উপরের Mark টগল চালু করলে ছবিতে ট্যাপ করে বিন্দু বসানো যায় (Dry = ধূসর-নীল, Wet = লাল)।
   বিন্দু আবার ট্যাপ করলে মুছে যায়। মার্কগুলো appointment ডকুমেন্টের hijamaMarks ফিল্ডে সেভ হয়।

   সবার উপরে "রোগ অনুযায়ী পয়েন্ট" সেকশন: + আইকনে রোগের নাম দিয়ে অসংখ্য এন্ট্রি যোগ করা যায়।
   প্রতিটি রোগে ক্লিক করলে আলাদা ভিউতে শুধু ওই রোগের ৪টি ছবি আসে, সেখানে মার্ক করে সেভ করা যায়। এগুলো সব পেশেন্টের ক্ষেত্রে একই
   (শেয়ার্ড) এবং অ্যাডমিনের নিজের users ডকুমেন্টের hijamaDiseases ফিল্ডে সেভ হয়। */
import { db, auth, DO, GD, UP, loadUser } from "./common.js?v=14";

const IMAGES = [
  { key: "head", title: "Head", file: "hijama-points/head.gif" },
  { key: "front", title: "Front", file: "hijama-points/front.gif" },
  { key: "back", title: "Back", file: "hijama-points/back.gif" },
  { key: "limbs", title: "Upper & Lower Limbs", file: "hijama-points/limbs.webp" }
];
const TYPES = {
  dry: { label: "Dry Cup", color: "#7a8fa6" },
  wet: { label: "Wet Cup", color: "#dc2626" }
};
const DOT = 16;
/* বিন্দু স্বচ্ছ + multiply ব্লেন্ড: রং দেখা যায়, কিন্তু নিচের কালো নম্বর/দাগ পুরো স্পষ্ট থাকে */
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; };

/* সেভ করা ডেটা থেকে শুধু বৈধ মার্কগুলো নিই */
const cleanMarks = saved => {
  const src = saved && typeof saved === "object" ? saved : {};
  const marks = {};
  IMAGES.forEach(im => {
    marks[im.key] = (Array.isArray(src[im.key]) ? src[im.key] : [])
      .filter(m => m && typeof m.x === "number" && typeof m.y === "number" && TYPES[m.t])
      .map(m => ({ x: m.x, y: m.y, t: m.t }));
  });
  return marks;
};
const cleanDiseases = saved =>
  (Array.isArray(saved) ? saved : [])
    .filter(d => d && typeof d.id === "string" && typeof d.name === "string" && d.name.trim())
    .map(d => ({ id: d.id, name: d.name.trim(), marks: cleanMarks(d.marks) }));
const newId = () => "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export async function openHijamaPoints(docId, patientName) {
  if (document.getElementById("rc-hp")) return;
  const user = auth.currentUser;
  if (!user) return;

  let ref, appt;
  try {
    const [ad, snap] = await Promise.all([GD(DO(db, "admins", user.uid)), GD(DO(db, "appointments", docId))]);
    if (!ad.exists() || !snap.exists() || snap.data().uid !== user.uid) return;
    ref = DO(db, "appointments", docId);
    appt = snap.data();
  } catch (e) {
    console.error(e);
    alert("Hijama Points খোলা যায়নি");
    return;
  }

  /* রোগ অনুযায়ী পয়েন্টের ডেটা অ্যাডমিনের নিজের users ডকুমেন্টে থাকে (সব পেশেন্টের জন্য একই) */
  let userRef = null, diseases = [];
  try {
    const u = await loadUser(user);
    if (u && u.ref) {
      userRef = u.ref;
      diseases = cleanDiseases(u.d && u.d.hijamaDiseases);
    }
  } catch (e) { console.error(e); }

  const marks = cleanMarks(appt.hijamaMarks);
  let viewMarks = marks;

  const el = (tag, css, txt) => {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (txt != null) e.textContent = txt;
    return e;
  };
  const base = new URL(".", import.meta.url).href;

  let markOn = false, cur = "wet";
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const ov = el("div", "position:fixed;inset:0;z-index:100000;background:#f1f5f9;overflow-y:auto;-webkit-overflow-scrolling:touch");
  ov.id = "rc-hp";
  const close = () => {
    document.body.style.overflow = prevOverflow;
    document.removeEventListener("keydown", onKey);
    ov.remove();
  };
  const onKey = e => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);

  /* উপরের স্টিকি বার: নাম, বন্ধ, Mark টগল, কালার */
  const bar = el("div", "position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid #e2e8f0;padding:8px 12px;box-shadow:0 1px 3px #0000000f");
  const top = el("div", "display:flex;align-items:center;gap:8px");
  top.appendChild(el("div", "flex:1;min-width:0;font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis", "🩸 " + (patientName || "Patient")));
  const status = el("span", "font-size:11px;color:#64748b;white-space:nowrap");
  top.appendChild(status);
  const x = el("button", "border:0;background:0 0;font-size:24px;line-height:1;cursor:pointer;color:#64748b;padding:0 4px", "×");
  x.type = "button";
  x.onclick = close;
  top.appendChild(x);
  bar.appendChild(top);

  const tools = el("div", "display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap");
  const tgl = el("button", "display:flex;align-items:center;gap:8px;border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:4px 12px 4px 4px;cursor:pointer;font-size:13px;font-weight:700;color:#334155");
  tgl.type = "button";
  tgl.setAttribute("role", "switch");
  const knob = el("span", "width:22px;height:22px;border-radius:50%;background:#cbd5e1;display:inline-block;transition:.15s");
  const tglTxt = el("span", "", "Mark");
  tgl.appendChild(knob);
  tgl.appendChild(tglTxt);
  tools.appendChild(tgl);

  const colorWrap = el("div", "display:none;align-items:center;gap:6px");
  const colorBtns = {};
  Object.keys(TYPES).forEach(k => {
    const b = el("button", "display:flex;align-items:center;gap:6px;border:2px solid #e2e8f0;background:#fff;border-radius:999px;padding:3px 10px 3px 6px;cursor:pointer;font-size:12px;font-weight:600;color:#334155");
    b.type = "button";
    b.appendChild(el("span", "width:12px;height:12px;border-radius:50%;display:inline-block;background:" + TYPES[k].color));
    b.appendChild(el("span", "", TYPES[k].label));
    b.onclick = () => { cur = k; paintTools(); };
    colorBtns[k] = b;
    colorWrap.appendChild(b);
  });
  tools.appendChild(colorWrap);
  const counts = el("span", "margin-left:auto;font-size:11px;color:#64748b");
  tools.appendChild(counts);
  bar.appendChild(tools);
  ov.appendChild(bar);

  const paintTools = () => {
    tgl.setAttribute("aria-checked", markOn);
    knob.style.background = markOn ? "#16a34a" : "#cbd5e1";
    tgl.style.borderColor = markOn ? "#16a34a" : "#cbd5e1";
    colorWrap.style.display = markOn ? "flex" : "none";
    Object.keys(colorBtns).forEach(k => { colorBtns[k].style.borderColor = k === cur ? TYPES[k].color : "#e2e8f0"; });
    ov.querySelectorAll("[data-dot]").forEach(d => { d.style.pointerEvents = markOn ? "auto" : "none"; });
    ov.querySelectorAll("[data-wrap]").forEach(w => { w.style.cursor = markOn ? "crosshair" : "default"; });
  };
  const paintCounts = () => {
    let d = 0, w = 0;
    IMAGES.forEach(im => viewMarks[im.key].forEach(m => (m.t === "dry" ? d++ : w++)));
    counts.textContent = "Dry " + d + " • Wet " + w;
  };
  tgl.onclick = () => { markOn = !markOn; paintTools(); };

  /* সেভ (ক্রমানুসারে): পেশেন্টের মার্ক এবং রোগ অনুযায়ী মার্ক একই সারিতে, যাতে একটা আরেকটাকে ওভারলাপ না করে */
  let chain = Promise.resolve();
  const saveTo = (target, data) => {
    status.style.color = "#64748b";
    status.textContent = "Saving...";
    chain = chain
      .then(() => UP(target, data))
      .then(() => { status.style.color = "#16a34a"; status.textContent = "✅ Saved"; })
      .catch(e => { console.error(e); status.style.color = "#dc2626"; status.textContent = "Save failed"; });
  };
  const save = () => saveTo(ref, { hijamaMarks: marks });
  const saveDiseases = () => {
    if (!userRef) { status.style.color = "#dc2626"; status.textContent = "Save failed"; return; }
    saveTo(userRef, { hijamaDiseases: diseases });
  };

  /* ৪টি ছবির কার্ড: পেশেন্ট এবং রোগ — দুই জায়গাতেই একই কোড। onChange() মার্ক বদলালে ডাকা হয় */
  const buildImages = (parent, m, onChange) => {
    IMAGES.forEach(im => {
      const card = el("div", "background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px;margin-bottom:12px");
      card.appendChild(el("div", "font-weight:700;font-size:13px;color:#334155;margin:0 0 6px", im.title));
      const wrap = el("div", "position:relative;line-height:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent");
      wrap.setAttribute("data-wrap", "1");
      wrap.style.cursor = markOn ? "crosshair" : "default";
      const img = el("img", "width:100%;height:auto;display:block;user-select:none;-webkit-user-drag:none");
      img.src = base + im.file;
      img.alt = im.title;
      img.draggable = false;
      wrap.appendChild(img);
      const layer = el("div", "position:absolute;inset:0");
      wrap.appendChild(layer);

      const draw = () => {
        layer.innerHTML = "";
        m[im.key].forEach((mk, i) => {
          const d = el("div", "position:absolute;width:" + DOT + "px;height:" + DOT + "px;border-radius:50%;border:2px solid " + TYPES[mk.t].color + ";box-sizing:border-box;transform:translate(-50%,-50%);mix-blend-mode:multiply;background:" + rgba(TYPES[mk.t].color, 0.4) + ";left:" + mk.x * 100 + "%;top:" + mk.y * 100 + "%");
          d.setAttribute("data-dot", i);
          d.style.pointerEvents = markOn ? "auto" : "none";
          layer.appendChild(d);
        });
      };
      wrap.addEventListener("click", e => {
        if (!markOn) return;
        const dot = e.target.closest && e.target.closest("[data-dot]");
        if (dot) {
          m[im.key].splice(+dot.getAttribute("data-dot"), 1);
        } else {
          const r = wrap.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          if (px < 0 || px > 1 || py < 0 || py > 1) return;
          m[im.key].push({ x: Math.round(px * 10000) / 10000, y: Math.round(py * 10000) / 10000, t: cur });
        }
        draw();
        onChange();
      });
      draw();
      card.appendChild(wrap);
      parent.appendChild(card);
    });
  };

  const list = el("div", "max-width:520px;margin:0 auto;padding:10px 10px 30px");

  /* ===== রোগ অনুযায়ী পয়েন্ট (সব পেশেন্টের জন্য একই) ===== */
  const sec = el("div", "background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px;margin-bottom:12px");
  const secHead = el("div", "display:flex;align-items:center;gap:8px");
  secHead.appendChild(el("div", "flex:1;font-weight:700;font-size:14px;color:#334155", "রোগ অনুযায়ী পয়েন্ট"));
  const plus = el("button", "width:30px;height:30px;border:0;border-radius:50%;background:#16a34a;color:#fff;font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0", "+");
  plus.type = "button";
  plus.title = "নতুন রোগ যোগ করুন";
  plus.setAttribute("aria-label", "নতুন রোগ যোগ করুন");
  secHead.appendChild(plus);
  sec.appendChild(secHead);
  const dList = el("div", "margin-top:8px");
  sec.appendChild(dList);
  list.appendChild(sec);

  /* রোগে ক্লিক করলে আলাদা ভিউ: শুধু ওই রোগের ৪টি ছবি (পেশেন্টের ছবি লুকানো থাকে) */
  const dview = el("div", "max-width:520px;margin:0 auto;padding:10px 10px 30px;display:none");
  const showMain = () => {
    dview.style.display = "none";
    dview.innerHTML = "";
    list.style.display = "block";
    viewMarks = marks;
    paintCounts();
    ov.scrollTop = 0;
  };
  const showDisease = d => {
    dview.innerHTML = "";
    const hd = el("div", "display:flex;align-items:center;gap:8px;margin-bottom:10px");
    const back = el("button", "border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:700;color:#334155;cursor:pointer", "← Back");
    back.type = "button";
    back.onclick = showMain;
    hd.appendChild(back);
    hd.appendChild(el("div", "flex:1;min-width:0;font-weight:700;font-size:15px;color:#1e293b;word-break:break-word", d.name));
    dview.appendChild(hd);
    buildImages(dview, d.marks, () => { paintCounts(); saveDiseases(); });
    list.style.display = "none";
    dview.style.display = "block";
    viewMarks = d.marks;
    paintCounts();
    ov.scrollTop = 0;
  };

  const iconBtn = (txt, label, fn) => {
    const b = el("button", "border:0;background:0 0;cursor:pointer;font-size:15px;padding:2px 6px;color:#64748b", txt);
    b.type = "button";
    b.title = label;
    b.setAttribute("aria-label", label);
    b.onclick = fn;
    return b;
  };
  const renderDiseases = () => {
    dList.innerHTML = "";
    if (!diseases.length) {
      dList.appendChild(el("div", "font-size:12px;color:#94a3b8;padding:4px 2px", "কোনো রোগ যোগ করা হয়নি। উপরের + চেপে রোগের নাম দিয়ে যোগ করুন।"));
      return;
    }
    diseases.forEach(d => {
      const row = el("div", "display:flex;align-items:center;gap:4px;border-top:1px solid #f1f5f9");
      const open = el("button", "flex:1;min-width:0;text-align:left;border:0;background:0 0;cursor:pointer;font-size:14px;font-weight:600;color:#1e293b;padding:10px 2px;word-break:break-word", d.name);
      open.type = "button";
      open.onclick = () => showDisease(d);
      row.appendChild(open);
      row.appendChild(iconBtn("✎", "নাম বদলান", () => {
        const nm = prompt("রোগের নাম", d.name);
        if (nm == null || !nm.trim()) return;
        d.name = nm.trim();
        saveDiseases();
        renderDiseases();
      }));
      row.appendChild(iconBtn("🗑", "মুছুন", () => {
        if (!confirm("«" + d.name + "» মুছে ফেলবেন? এর সব মার্ক মুছে যাবে।")) return;
        diseases = diseases.filter(z => z !== d);
        saveDiseases();
        renderDiseases();
      }));
      dList.appendChild(row);
    });
  };
  plus.onclick = () => {
    if (!userRef) { alert("রোগ যোগ করা যাচ্ছে না, পেজ রিলোড করে আবার চেষ্টা করুন"); return; }
    const nm = prompt("রোগের নাম");
    if (nm == null || !nm.trim()) return;
    const d = { id: newId(), name: nm.trim(), marks: cleanMarks(null) };
    diseases.push(d);
    saveDiseases();
    renderDiseases();
    showDisease(d);
  };
  renderDiseases();

  /* ===== এই পেশেন্টের নিজের মার্কিং (আগের মতোই) ===== */
  buildImages(list, marks, () => { paintCounts(); save(); });
  ov.appendChild(list);
  ov.appendChild(dview);

  paintTools();
  paintCounts();
  document.body.appendChild(ov);
}
