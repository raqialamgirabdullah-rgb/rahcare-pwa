/* Hijama Points (শুধু অ্যাডমিন): হিজামা রোগীর নামে ক্লিক করলে ৪টি বডি-ডায়াগ্রাম একটার নিচে আরেকটা।
   উপরের Mark টগল চালু করলে ছবিতে ট্যাপ করে বিন্দু বসানো যায় (Dry = ধূসর-নীল, Wet = লাল)।
   বিন্দু আবার ট্যাপ করলে মুছে যায়। মার্কগুলো appointment ডকুমেন্টের hijamaMarks ফিল্ডে সেভ হয়। */
import { db, auth, DO, GD, UP } from "./common.js?v=14";

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
const DOT = 14;

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

  const marks = {};
  const saved = appt.hijamaMarks && typeof appt.hijamaMarks === "object" ? appt.hijamaMarks : {};
  IMAGES.forEach(im => {
    marks[im.key] = (Array.isArray(saved[im.key]) ? saved[im.key] : [])
      .filter(m => m && typeof m.x === "number" && typeof m.y === "number" && TYPES[m.t])
      .map(m => ({ x: m.x, y: m.y, t: m.t }));
  });

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
    IMAGES.forEach(im => marks[im.key].forEach(m => (m.t === "dry" ? d++ : w++)));
    counts.textContent = "Dry " + d + " • Wet " + w;
  };
  tgl.onclick = () => { markOn = !markOn; paintTools(); };

  /* সেভ (ক্রমানুসারে) */
  let chain = Promise.resolve();
  const save = () => {
    status.style.color = "#64748b";
    status.textContent = "Saving...";
    chain = chain
      .then(() => UP(ref, { hijamaMarks: marks }))
      .then(() => { status.style.color = "#16a34a"; status.textContent = "✅ Saved"; })
      .catch(e => { console.error(e); status.style.color = "#dc2626"; status.textContent = "Save failed"; });
  };

  /* ছবির সেকশন */
  const list = el("div", "max-width:520px;margin:0 auto;padding:10px 10px 30px");
  IMAGES.forEach(im => {
    const card = el("div", "background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px;margin-bottom:12px");
    card.appendChild(el("div", "font-weight:700;font-size:13px;color:#334155;margin:0 0 6px", im.title));
    const wrap = el("div", "position:relative;line-height:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent");
    wrap.setAttribute("data-wrap", "1");
    const img = el("img", "width:100%;height:auto;display:block;user-select:none;-webkit-user-drag:none");
    img.src = base + im.file;
    img.alt = im.title;
    img.draggable = false;
    wrap.appendChild(img);
    const layer = el("div", "position:absolute;inset:0");
    wrap.appendChild(layer);

    const draw = () => {
      layer.innerHTML = "";
      marks[im.key].forEach((m, i) => {
        const d = el("div", "position:absolute;width:" + DOT + "px;height:" + DOT + "px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #0000004d;box-sizing:border-box;transform:translate(-50%,-50%);background:" + TYPES[m.t].color + ";left:" + m.x * 100 + "%;top:" + m.y * 100 + "%");
        d.setAttribute("data-dot", i);
        d.style.pointerEvents = markOn ? "auto" : "none";
        layer.appendChild(d);
      });
    };
    wrap.addEventListener("click", e => {
      if (!markOn) return;
      const dot = e.target.closest && e.target.closest("[data-dot]");
      if (dot) {
        marks[im.key].splice(+dot.getAttribute("data-dot"), 1);
      } else {
        const r = wrap.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        if (px < 0 || px > 1 || py < 0 || py > 1) return;
        marks[im.key].push({ x: Math.round(px * 10000) / 10000, y: Math.round(py * 10000) / 10000, t: cur });
      }
      draw();
      paintCounts();
      save();
    });
    draw();
    card.appendChild(wrap);
    list.appendChild(card);
  });
  ov.appendChild(list);

  paintTools();
  paintCounts();
  document.body.appendChild(ov);
}
