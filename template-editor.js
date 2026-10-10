/* RahCare — Appointment Slip / Invoice layout editor
   - openTemplateEditor(kind, {data, save}) : admin-panel থেকে ডাকা হয় (kind = "slip" | "invoice")
   - applyLayout(kind, root, data)          : appointment / billing পেজ থেকে ডাকা হয়, সেভ করা লেআউট বসিয়ে দেয়
   সেভ হয় users ডকুমেন্টে: slipLayout / invoiceLayout (JSON {v,html}) + slipLayoutActive / invoiceLayoutActive */

const BASE = new URL(".", import.meta.url).href;
const FILE = { slip: "slip-template.json", invoice: "invoice-template.json" };
const KEY = { slip: "slipTemplate", invoice: "invoiceTemplate" };
const TITLE = { slip: "Appointment Slip Edit", invoice: "Invoice Edit" };
const MARK = "data-rc-lay";

const parseLayout = raw => {
  try {
    const L = typeof raw === "string" ? JSON.parse(raw) : raw;
    return L && typeof L.html === "string" && L.html ? L : null;
  } catch { return null; }
};

/* ---------- ইনভয়েসের টেবিল সারি (কোড থেকে তৈরি হয়) — সারির নাম + পজিশন ধরে স্টাইল মনে রাখা ---------- */
const rowKey = tr => { const t = (tr.cells[0]?.textContent || "").trim(); return /^\d+$/.test(t) ? "item" : t.replace(/:$/, ""); };
const pathOf = (el, tr) => { const p = []; for (let n = el; n !== tr; n = n.parentElement) p.unshift([...n.parentElement.children].indexOf(n)); return p.join("."); };
const byPath = (tr, p) => p ? p.split(".").reduce((n, i) => n && n.children[i], tr) : tr;
const rowEls = tr => [tr, ...tr.querySelectorAll("*")];
function styleRows(tb, rows) {
  for (const tr of [...tb.children]) {
    const k = rowKey(tr);
    for (const el of rowEls(tr)) {
      const r = rows[k + "|" + pathOf(el, tr)];
      if (!r) continue;
      if (r.s) el.setAttribute("style", r.s);
      if (r.h) el.style.display = "none";
    }
  }
}

/* ---------- live pages: সেভ করা লেআউট বসানো ---------- */
export function applyLayout(kind, root, data) {
  if (!root || !data || data[kind + "LayoutActive"] === false) return false;
  const L = parseLayout(data[kind + "Layout"]);
  if (!L) return false;
  if (root.firstElementChild && root.firstElementChild.hasAttribute(MARK)) return true;
  const keep = [...root.children].filter(n => n.tagName === "IMG" && /(WM|Logo)$/.test(n.id));
  root.innerHTML = L.html;
  keep.forEach(n => root.appendChild(n));
  if (kind === "slip" && L.pad) root.style.padding = L.pad;
  if (L.size) {
    root.style.width = L.size.w + "px";
    if (kind === "slip") { if (L.size.minH) root.style.minHeight = L.size.minH + "px"; }
    else { root.style.height = L.size.h + "px"; if (L.size.sc) root.dataset.rcScale = L.size.sc; }
  }
  if (L.css) {
    let st = document.getElementById("rc-lay-" + kind);
    if (!st) { st = document.createElement("style"); st.id = "rc-lay-" + kind; document.head.appendChild(st); }
    st.textContent = L.css;
  }
  const url = data.logoUrl || data.logo || data.centerLogo || "", waits = [];
  root.querySelectorAll("img[data-rc-logo]").forEach(i => {
    const u = url || i.getAttribute("data-fallback") || "";
    if (!u) { i.style.display = "none"; return; }
    i.style.display = ""; i.crossOrigin = "anonymous";
    waits.push(new Promise(res => { i.onload = i.onerror = res; i.src = u; }));
  });
  root.__rcWait = Promise.all(waits);
  const tb = kind === "invoice" && root.querySelector("#inv-items");
  if (tb && L.rows && Object.keys(L.rows).length) {
    new MutationObserver(() => styleRows(tb, L.rows)).observe(tb, { childList: true, subtree: true });
    styleRows(tb, L.rows);
  }
  return true;
}

/* ---------- default template ---------- */
const defCache = {};
const loadDefault = kind =>
  defCache[kind] || (defCache[kind] = fetch(BASE + FILE[kind] + "?t=" + Date.now())
    .then(r => r.json()).then(j => j[KEY[kind]]));

/* ---------- editor CSS ---------- */
const scope = (css, pre) => css.replace(/([^{}]+)\{([^}]*)\}/g, (_, s, b) =>
  s.split(",").map(x => pre + " " + x.trim()).join(",") + "{" + b + "}");

const SLIP_CSS = scope(`
.slip-main-box{background:transparent;position:relative;z-index:1;border:2px solid #000;flex-direction:column;width:100%;font-family:Roboto,'Noto Sans Bengali',sans-serif;display:flex}
.slip-header{border-bottom:2px solid #000;justify-content:center;align-items:center;height:35px;padding:5px;display:flex}
.header-title{align-items:center;gap:10px;display:flex}
.calendar-icon{font-size:15px;line-height:1}
.slip-header h2{font-size:17px}
.center-info{padding:8px 20px 2px;line-height:1.35;position:relative}
.slip-date{font-size:12px;position:absolute;top:8px;right:20px}
.branch-name,.center-info h3{font-size:13.5px}
.branch-name{margin-bottom:2px}
.center-info p{font-size:12px}
.info-table{border-collapse:collapse;border-top:1px solid #ccc;border-bottom:1px solid #ccc;width:100%}
.info-table td{vertical-align:middle;border:1px solid #ccc;padding:4px 15px;font-size:12.5px}
.info-table tr td:first-child{background:rgba(249,249,249,.6);width:35%}
.info-table tr td:last-child{width:65%;padding-left:15px}
.slip-footer{text-align:center;margin-top:auto;padding:4px 15px 8px}
.slip-footer p{color:#555;margin-bottom:1px;font-size:10px}
.patient-id{color:#0f3c6d;letter-spacing:.5px;font-size:14px}
.branch-name,.center-info h3,.center-info p,.info-table td,.slip-date,.slip-header h2{color:#000}
.branch-name,.center-info h3,.info-table tr td:first-child,.patient-id,.slip-date,.slip-header h2{font-weight:700}
`, "[data-k=slip]");

const CSS = `
#rceBack{position:fixed;inset:0;z-index:99998;background:#e9eeeb;display:flex;flex-direction:column;font-family:Roboto,'Noto Sans Bengali',system-ui,sans-serif;color:#1f2a24;-webkit-tap-highlight-color:transparent}
#rceBack *{box-sizing:border-box}
#rceBack [hidden]{display:none!important}
#rceBar{display:flex;gap:6px;align-items:center;padding:8px 10px;background:#fff;border-bottom:1px solid #d3dcd6;flex-wrap:wrap}
#rceBar b{flex:1;font-size:14px;min-width:120px}
.rce-b{border:1px solid #c3cfc8;background:#fff;border-radius:8px;padding:7px 10px;font-size:13px;line-height:1.1;cursor:pointer;color:#1f2a24;font-family:inherit}
.rce-b.p{background:#1a4731;color:#fff;border-color:#1a4731}
.rce-b.d{color:#b91c1c}
.rce-b.on{background:#e3f1e8;border-color:#1a4731}
.rce-b:disabled{opacity:.4;cursor:default}
#rceView{flex:1;overflow:auto;padding:12px 6px;display:flex;justify-content:center;align-items:flex-start}
#rceBox{position:relative;overflow:hidden;flex:none}
#rceStage{position:absolute;left:0;top:0;transform-origin:0 0;background:#fff;color:#000;box-shadow:0 1px 8px rgba(0,0,0,.2)}
#rceStage *{cursor:pointer}
#rceStage{position:absolute}
#rceStage[data-k=slip],.rce-pv[data-k=slip]{width:424px;padding:12px}
#rceStage[data-k=invoice],.rce-pv[data-k=invoice]{width:340px;height:480px;font-family:Roboto,sans-serif;display:flex;justify-content:center;align-items:flex-start}
.rce-pv{position:absolute;left:0;top:0;transform-origin:0 0;background:#fff;color:#000}
[data-k=invoice] .rcewm{left:60px;top:110px;width:220px;height:260px}
[data-k=invoice] .rcelg{left:135px;top:58px;width:70px;height:56px}
[data-k=slip] .rcewm{left:50%;top:50%;width:240px;height:240px;margin:-120px 0 0 -120px}
[data-k=slip] .rcelg{right:34px;top:91px;width:60px;height:46px}
#rceStage .rcewm,#rceStage .rcelg{pointer-events:none}
#rceTpl{position:absolute;inset:0;z-index:5;background:#e9eeeb;display:flex;flex-direction:column}
#rceTpl .bar{display:flex;gap:6px;align-items:center;padding:8px 10px;background:#fff;border-bottom:1px solid #d3dcd6}
#rceTpl .bar b{flex:1;font-size:14px}
#tGrid{flex:1;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:10px;align-content:start}
.rce-tile{border:1px solid #c3cfc8;background:#fff;border-radius:10px;padding:6px;cursor:pointer;text-align:center;font-family:inherit;font-size:12px;color:#1f2a24}
.rce-tile:active{background:#e3f1e8}
.rce-pvbox{position:relative;overflow:hidden;width:100%;background:#fff;border-radius:4px;pointer-events:none}
.rce-tile .cap{margin-top:5px}
#tMoreW{padding:8px 10px 14px;text-align:center}
[data-rc-nologo]{display:none!important}
.rce-sel{outline:2px solid #2563eb!important;outline-offset:1px}
.rce-hid{opacity:.3;outline:1px dashed #64748b}
#rcePanel{background:#fff;border-top:1px solid #d3dcd6;max-height:46vh;overflow:auto;padding:8px 10px 12px;font-size:12.5px}
#rcePanel .r{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}
#rcePanel .t{color:#5b6b62;margin-right:2px}
#rcePanel input[type=color]{width:36px;height:30px;padding:0;border:1px solid #c3cfc8;border-radius:6px;background:#fff}
#rcePanel input[type=text]{flex:1;min-width:140px;padding:7px 8px;border:1px solid #c3cfc8;border-radius:8px;font-size:13px;font-family:inherit}
#rcePanel select{padding:6px;border:1px solid #c3cfc8;border-radius:8px;font-size:12.5px;background:#fff}
#rcePanel .v{min-width:26px;text-align:center}
#rceInfo{color:#3b4b42;margin-bottom:2px}
#rceHidList .row{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #eef2ef}
#rceToast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#1f2a24;color:#fff;padding:9px 14px;border-radius:10px;font-size:13px;z-index:99999}
`;

/* ---------- helpers ---------- */
const hex = c => {
  const m = (c || "").match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3 || (m[3] !== undefined && +m[3] === 0)) return null;
  return "#" + m.slice(0, 3).map(n => (+n | 0).toString(16).padStart(2, "0")).join("");
};
const today = () => {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + String(d.getFullYear()).slice(-2);
};
const CELLS = /^(TD|TH|TR|TBODY|THEAD|TFOOT)$/;

/* ---------- টেমপ্লেট জেনারেটর: seed নম্বর থেকে প্রতিবার আলাদা ডিজাইন (অসীম সংখ্যক) ---------- */
const mulberry0 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mulberry = a => { const f = mulberry0(Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ (a >>> 7)); for (let i = 0; i < 6; i++) f(); return f; };
const pick = (r, a) => a[Math.floor(r() * a.length)];
const hsl = (h, s, l) => {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
};
function palette(r) {
  if (r() < 0.1) { const g = pick(r, [0, 17, 34, 51]), p = "#" + g.toString(16).padStart(2, "0").repeat(3); return { p, soft: "#f2f2f2", mid: "#c9c9c9", acc: p }; }
  const h = Math.floor(r() * 360), sat = 40 + r() * 40;
  return { p: hsl(h, sat, 20 + r() * 16), soft: hsl(h, 35 + r() * 35, 93 + r() * 4), mid: hsl(h, 25 + r() * 25, 75 + r() * 10), acc: hsl((h + 25 + r() * 70) % 360, 55 + r() * 25, 36 + r() * 10) };
}
const hideEl = n => { n.setAttribute("data-rc-h", ""); n.style.display = "none"; };

/* ---------- সাইজ ও আকার ---------- */
const SLIP_SIZES = [
  { id: "s", w: 340, minH: 0, o: "p", wt: 2 }, { id: "m", w: 424, minH: 0, o: "p", wt: 3 }, { id: "l", w: 520, minH: 0, o: "p", wt: 2 },
  { id: "t", w: 360, minH: 560, o: "p", wt: 2 }, { id: "ls", w: 640, minH: 300, o: "l", wt: 3 }, { id: "w", w: 760, minH: 230, o: "l", wt: 2 }
];
const INV_SIZES = [
  { id: "a6", w: 340, h: 480, mm: [105, 148], sc: 2, o: "p", wt: 2 }, { id: "a5", w: 340, h: 480, mm: [148, 210], sc: 2, o: "p", wt: 3 },
  { id: "a4", w: 340, h: 480, mm: [210, 297], sc: 3, o: "p", wt: 2 }, { id: "long", w: 340, h: 640, mm: [80, 150], sc: 2.5, o: "p", wt: 2 },
  { id: "a5l", w: 640, h: 450, mm: [210, 148], sc: 2, o: "l", wt: 2 }, { id: "a4l", w: 640, h: 450, mm: [297, 210], sc: 3, o: "l", wt: 2 }
];
const wpick = (r, a) => { let v = r() * a.reduce((m, x) => m + x.wt, 0); for (const x of a) { if ((v -= x.wt) < 0) return x; } return a[0]; };
const wmSize = (kind, z) => Math.round(kind === "slip" ? Math.min(240, z.w * 0.55, (z.minH || 400) * 0.8) : Math.min(220, z.w * 0.55, z.h * 0.55));
const wmCss = (kind, z, imp) => { const s = wmSize(kind, z), i = imp ? "!important" : ""; return `left:50%${i};top:50%${i};width:${s}px${i};height:${s}px${i};margin:-${s / 2}px 0 0 -${s / 2}px${i}`; };
const layoutCss = (kind, z) => kind === "slip"
  ? `#slipLogo{display:none!important}#slipWM{${wmCss("slip", z, 1)}}`
  : `#invLogo{display:none!important}#invWM{${wmCss("invoice", z, 1)}}@media print{body:has(#pImg) #pImg{width:${z.mm[0]}mm!important;height:${z.mm[1]}mm!important}@page{size:${z.mm[0]}mm ${z.mm[1]}mm;margin:0}}`;

/* ---------- স্লিপ: ক্লাসিক (আগের কাঠামো) ---------- */
function genSlipClassic(def, r, P, size) {
  const box = document.createElement("div"); box.innerHTML = def;
  const $ = s => box.querySelector(s), $$ = s => [...box.querySelectorAll(s)];
  const root = $(".slip-main-box");
  const bw = pick(r, [1, 2, 2, 3]), bs = pick(r, ["solid", "solid", "solid", "double"]), rad = pick(r, [0, 0, 6, 12, 18]);
  root.style.border = `${bs === "double" ? Math.max(bw, 3) : bw}px ${bs} ${P.p}`;
  if (rad) { root.style.borderRadius = rad + "px"; root.style.overflow = "hidden"; }
  const ff = pick(r, [null, null, "Georgia,'Noto Serif Bengali',serif", "'Trebuchet MS','Noto Sans Bengali',sans-serif"]);
  if (ff) root.style.fontFamily = ff;
  const hd = $(".slip-header"), h2 = $(".slip-header h2"), ico = $(".calendar-icon"), hv = Math.floor(r() * 4);
  hd.style.height = pick(r, [34, 38, 42, 46]) + "px";
  if (hv === 0) { hd.style.background = P.p; hd.style.borderBottom = "none"; h2.style.color = "#fff"; }
  else if (hv === 1) { hd.style.background = P.soft; hd.style.borderBottom = `2px solid ${P.p}`; h2.style.color = P.p; }
  else if (hv === 2) { hd.style.borderBottom = `3px double ${P.p}`; h2.style.color = P.p; }
  else { hd.style.justifyContent = "flex-start"; hd.style.paddingLeft = "16px"; hd.style.borderBottom = `2px solid ${P.p}`; h2.style.color = P.p; }
  h2.style.letterSpacing = pick(r, ["0", "0.5px", "1px", "2px"]); h2.style.fontSize = pick(r, [15, 17, 19, 21]) + "px";
  if (r() < 0.25 && ico) hideEl(ico);
  const ci = $(".center-info");
  if (r() < 0.4) { ci.style.textAlign = "center"; const d = $(".slip-date"); d.style.position = "static"; d.style.textAlign = "right"; d.style.marginBottom = "2px"; }
  const h3 = $(".center-info h3"); if (h3) h3.style.color = P.p;
  const lg = document.createElement("img"); lg.setAttribute("data-rc-logo", ""); lg.setAttribute("alt", "");
  lg.setAttribute("style", "position:absolute;right:20px;top:26px;width:54px;height:44px;object-fit:contain"); ci.appendChild(lg);
  const tv = Math.floor(r() * 4), py = pick(r, [3, 4, 5, 6]) + "px", fs = pick(r, [12, 12.5, 13, 13.5]) + "px", lw = pick(r, [30, 35, 40]);
  $$(".info-table tr").forEach((tr, i) => {
    const [a, b] = tr.cells;
    [a, b].forEach(td => { td.style.paddingTop = td.style.paddingBottom = py; td.style.fontSize = fs; });
    a.style.width = lw + "%"; b.style.width = (100 - lw) + "%";
    if (tv === 0) { [a, b].forEach(td => td.style.border = `1px solid ${P.mid}`); a.style.background = P.soft; a.style.color = P.p; }
    else if (tv === 1) { [a, b].forEach(td => { td.style.border = "none"; td.style.borderBottom = `1px solid ${P.mid}`; }); a.style.background = "transparent"; a.style.color = P.p; }
    else if (tv === 2) { [a, b].forEach(td => { td.style.border = "none"; td.style.background = i % 2 ? "#fff" : P.soft; }); a.style.color = P.p; }
    else { [a, b].forEach(td => td.style.border = `1px solid ${P.p}`); a.style.background = P.p; a.style.color = "#fff"; }
  });
  const tb = $(".info-table"); tb.style.borderTop = tb.style.borderBottom = (tv === 1 || tv === 2) ? "none" : `1px solid ${P.mid}`;
  const ft = $(".slip-footer"), pid = $(".patient-id"), fv = Math.floor(r() * 3);
  pid.style.fontSize = pick(r, [14, 16, 18, 20]) + "px";
  if (fv === 0) pid.style.color = P.acc;
  else if (fv === 1) { Object.assign(pid.style, { display: "inline-block", border: `1.5px solid ${P.p}`, borderRadius: "20px", padding: "2px 16px", color: P.p }); }
  else { Object.assign(pid.style, { display: "inline-block", background: P.p, color: "#fff", borderRadius: pick(r, ["4px", "20px"]), padding: "3px 16px" }); }
  if (r() < 0.2) { tb.before(ft); ft.style.marginTop = "0"; ft.style.padding = "6px 15px"; }
  if (r() < 0.2) { const st = document.createElement("div"); st.setAttribute("data-rc-custom", "1"); st.style.cssText = `height:${pick(r, [4, 6, 8])}px;background:${P.p};width:100%`; root.insertBefore(st, root.firstChild); }
  const pad = pick(r, [6, 8, 10, 12, 14]);
  if (size.minH) root.style.minHeight = Math.max(0, size.minH - 2 * pad) + "px";
  return { html: box.innerHTML, pad: pad + "px" };
}

/* ---------- স্লিপ: ব্লক ভিত্তিক আলাদা কাঠামো ---------- */
function genSlipBlocks(def, a, size, r, P) {
  const box = document.createElement("div"); box.innerHTML = def;
  const T = id => box.querySelector("#" + id).innerHTML;
  const u = Math.max(0.85, Math.min(1.25, size.w / 424)) * (size.o === "l" ? 0.95 : 1), narrow = size.w <= 360;
  const F = n => (Math.round(n * u * 10) / 10) + "px";
  const ff = pick(r, ["", "", "font-family:Georgia,'Noto Serif Bengali',serif;", "font-family:'Trebuchet MS','Noto Sans Bengali',sans-serif;"]);
  const bw = pick(r, [1, 2, 2, 3]), bs = pick(r, ["solid", "solid", "double"]), rad = pick(r, [0, 0, 6, 12, 18]);
  const outer = `border:${bs === "double" ? Math.max(bw, 3) : bw}px ${bs} ${P.p};${rad ? `border-radius:${rad}px;overflow:hidden;` : ""}`;
  const pad = pick(r, [6, 8, 10, 12]), flip = r() < 0.5, cr = pick(r, [0, 4, 8]);
  const H = (tag, id, st, txt) => `<${tag}${id ? ` id="${id}"` : ""} style="margin:0;${st}">${txt}</${tag}>`;
  const lg = (w, h, ex = "") => `<img data-rc-logo alt="" style="width:${w}px;height:${h}px;object-fit:contain;display:block;flex:none;${ex}">`;
  const showIcon = r() < 0.75, ls = pick(r, ["0", "0.5px", "1px", "2px"]);
  const title = (c, sz, al = "") => `<div style="display:flex;align-items:center;gap:8px;${al}">${showIcon ? `<span style="font-size:${F(15)};line-height:1">📅</span>` : ""}${H("h2", "", `font-size:${sz};letter-spacing:${ls};color:${c};font-weight:700`, "Appointment Slip")}</div>`;
  const centre = (al, c1, c2, c3) => `<div style="text-align:${al};line-height:1.4">` +
    H("h3", "slipCentreName", `font-size:${F(14)};font-weight:700;color:${c1}`, T("slipCentreName")) +
    H("h3", "slipCentreType", `font-size:${F(12)};font-weight:600;color:${c2}`, T("slipCentreType")) +
    H("p", "slipBranchName", `font-size:${F(12)};font-weight:700;color:${c3}`, T("slipBranchName")) +
    H("p", "slipBranchAddress", `font-size:${F(11.5)};color:${c3}`, T("slipBranchAddress")) +
    H("p", "slipBranchNumber", `font-size:${F(11.5)};color:${c3}`, T("slipBranchNumber")) + `</div>`;
  const date = (st = "") => H("div", "slipDateVal", `font-size:${F(12)};font-weight:700;${st}`, T("slipDateVal"));
  const pv = Math.floor(r() * 3), pfs = pick(r, [15, 17, 19]), pr = pick(r, ["4px", "20px"]);
  const pid = (light = false) => {
    let ps = `font-size:${F(pfs)};letter-spacing:.5px;font-weight:700;display:inline-block;`;
    if (light) ps += pv === 2 ? `background:#fff;color:${P.p};border-radius:20px;padding:3px 16px;` : `border:1.5px solid #fff;color:#fff;border-radius:20px;padding:2px 16px;`;
    else ps += pv === 0 ? `color:${P.acc};` : pv === 1 ? `border:1.5px solid ${P.p};color:${P.p};border-radius:20px;padding:2px 16px;` : `background:${P.p};color:#fff;border-radius:${pr};padding:3px 16px;`;
    return `<div style="text-align:center"><p style="margin:0 0 2px;font-size:${F(10)};color:${light ? "#fff" : "#555"}">Patient ID</p>${H("div", "slipPid", ps, T("slipPid"))}</div>`;
  };
  const FL = [["Name", "slipName"], ["Phone", "slipPhone"], ["Age", "slipAge"], ["Gender", "slipGender"], ["Address", "slipAddr"], ["Schedule", "slipSchedule"]];
  const fv = Math.floor(r() * 4), py = pick(r, [3, 4, 5, 6]), lw = pick(r, [30, 35, 40]);
  const fields = (cols = 1) => {
    if (fv === 2) {
      const gc = cols > 1 ? cols : 2;
      return `<div style="display:grid;grid-template-columns:repeat(${gc},1fr);gap:6px;width:100%">` + FL.map(([l, id]) =>
        `<div style="border:1px solid ${P.mid};background:${P.soft};border-radius:${cr}px;padding:4px 8px;min-width:0;${id === "slipAddr" ? "grid-column:1/-1;" : ""}"><div style="font-size:${F(9.5)};color:${P.p};font-weight:700">${l}</div><div id="${id}" style="font-size:${F(12.5)};font-weight:600;min-height:1.3em"></div></div>`).join("") + `</div>`;
    }
    if (fv === 3 && cols > 1) {
      const c = (l, id, sp) => `<td style="padding:${py}px 8px;font-size:${F(12)};font-weight:700;color:${P.p};background:${P.soft};border:1px solid ${P.mid};width:14%">${l}</td><td${sp ? ` colspan="${sp}"` : ""} id="${id}" style="padding:${py}px 8px;font-size:${F(12.5)};border:1px solid ${P.mid}"></td>`;
      return `<table style="border-collapse:collapse;width:100%"><tr>${c("Name", "slipName")}${c("Phone", "slipPhone")}</tr><tr>${c("Age", "slipAge")}${c("Gender", "slipGender")}</tr><tr>${c("Address", "slipAddr", 3)}</tr><tr>${c("Schedule", "slipSchedule", 3)}</tr></table>`;
    }
    const g = fv === 0, b = g ? `1px solid ${P.mid}` : "none", bb = `1px solid ${P.mid}`;
    return `<table style="border-collapse:collapse;width:100%">` + FL.map(([l, id]) =>
      `<tr><td style="padding:${py}px 10px;width:${lw}%;font-size:${F(12.5)};font-weight:700;color:${P.p};${g ? `background:${P.soft};` : ""}border:${b};${g ? "" : `border-bottom:${bb};`}">${l}</td><td id="${id}" style="padding:${py}px 10px;font-size:${F(12.5)};border:${b};${g ? "" : `border-bottom:${bb};`}"></td></tr>`).join("") + `</table>`;
  };
  const dir = row => row ? `flex-direction:${flip ? "row-reverse" : "row"};` : "";
  const minH = size.minH ? `min-height:${Math.max(0, size.minH - 2 * pad)}px;` : "";
  let body = "", rowRoot = false;
  const bar = (j) => `<div style="background:${P.p};padding:${F(8)} 14px;display:flex;justify-content:${j};">${title("#fff", F(17))}</div>`;
  if (a === "split") {
    body = bar(pick(r, ["center", "flex-start"])) +
      `<div style="display:flex;${narrow ? "flex-direction:column;" : dir(1)}justify-content:space-between;align-items:${narrow ? "stretch" : "flex-start"};gap:10px;padding:12px 14px;">` +
      `<div style="display:flex;gap:10px;align-items:center;flex:1;min-width:0">${lg(52, 52)}<div style="min-width:0">${centre("left", P.p, "#333", "#333")}</div></div>` +
      `<div style="display:flex;${narrow ? "flex-direction:row;justify-content:space-between;align-items:center;" : "flex-direction:column;align-items:flex-end;"}gap:8px;flex:none">${date()}${pid()}</div></div>` +
      `<div style="padding:0 14px 14px">${fields(2)}</div>`;
  } else if (a === "side") {
    rowRoot = true;
    body = `<div style="width:${narrow ? "34%" : "30%"};flex:none;background:${P.p};color:#fff;padding:14px 8px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;">${lg(56, 56, "background:#fff;border-radius:50%;padding:3px")}${title("#fff", F(13), "flex-direction:column;gap:2px")}${date("color:#fff")}${pid(true)}</div>` +
      `<div style="flex:1;min-width:0;padding:14px;display:flex;flex-direction:column;gap:10px;">${centre("left", P.p, "#333", "#333")}<div style="border-top:2px solid ${P.p}"></div>${fields(size.o === "l" ? 2 : 1)}</div>`;
  } else if (a === "center") {
    body = `<div style="height:${pick(r, [5, 6, 8])}px;background:${P.p}"></div>` +
      `<div style="padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;flex:1">${lg(60, 60)}${title(P.p, F(18))}${centre("center", P.p, "#333", "#333")}<div style="border-top:1px dashed ${P.p};width:100%"></div>${date()}<div style="width:100%">${fields(2)}</div><div style="margin-top:auto">${pid()}</div></div>`;
  } else if (a === "minimal") {
    body = `<div style="padding:16px 16px 6px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div>${title(P.p, F(20))}<div style="height:3px;width:60px;background:${P.acc};margin-top:6px"></div></div>${lg(48, 48)}</div>` +
      `<div style="padding:4px 16px 8px;display:flex;justify-content:space-between;gap:10px"><div style="flex:1;min-width:0">${centre("left", "#111", "#333", "#555")}</div>${date("white-space:nowrap")}</div>` +
      `<div style="padding:4px 16px">${fields(1)}</div><div style="padding:10px 16px 14px;display:flex;justify-content:flex-end;margin-top:auto">${pid()}</div>`;
  } else if (a === "ticket") {
    rowRoot = true;
    body = `<div style="width:36%;flex:none;background:${P.p};color:#fff;padding:18px 14px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">${lg(64, 64, "background:#fff;border-radius:50%;padding:3px")}${title("#fff", F(16), "flex-direction:column;gap:2px")}${centre("center", "#fff", "#eee", "#eee")}</div>` +
      `<div style="flex:1;min-width:0;padding:16px;display:flex;flex-direction:column;gap:12px"><div style="display:flex;justify-content:space-between;align-items:center">${date()}${pid()}</div>${fields(2)}</div>`;
  } else { /* strip */
    rowRoot = true;
    body = `<div style="width:30%;flex:none;padding:12px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;border-right:1px solid ${P.mid}">${lg(48, 48)}${centre("center", P.p, "#333", "#333")}</div>` +
      `<div style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:8px">${title(P.p, F(15))}${fields(3)}</div>` +
      `<div style="width:22%;flex:none;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:${P.soft};border-left:1px solid ${P.mid}">${date()}${pid()}</div>`;
  }
  const html = `<div class="slip-main-box" style="${outer}${ff}${minH}${rowRoot ? dir(1) : ""}">${body}</div>`;
  return { html, pad: pad + "px" };
}

const SLIP_ARCH = { p: ["classic", "classic", "split", "side", "center", "minimal"], l: ["ticket", "strip", "side", "ticket"] };
function genSlip(def, seed) {
  const r = mulberry((seed * 2654435761) >>> 0), P = palette(r), size = wpick(r, SLIP_SIZES), a = pick(r, SLIP_ARCH[size.o]);
  const out = a === "classic" ? genSlipClassic(def, r, P, size) : genSlipBlocks(def, a, size, r, P);
  out.size = { w: size.w, minH: size.minH }; out.css = layoutCss("slip", size); out.v = 3; out.name = size.id + "-" + a;
  return out;
}

/* ---------- ইনভয়েস: আকার + কাঠামো ---------- */
function genInvoice(def, seed) {
  const r = mulberry((seed * 2654435761) >>> 0), P = palette(r), size = wpick(r, INV_SIZES), land = size.o === "l";
  const box = document.createElement("div"); box.innerHTML = def;
  const q = s => box.querySelector(s), $$ = s => [...box.querySelectorAll(s)];
  const card = q(".invoice-card"), inner = q(".invoice-inner-content");
  const title = q(".invoice-title"), comp = q(".company-details"), logoBox = q(".logo-container"), meta = q(".invoice-meta");
  const dash = q(".dashed-line"), bill = q(".billing-info"), table = q(".invoice-table");
  const words = table.nextElementSibling, terms = words.nextElementSibling;
  const old = logoBox.querySelector("img"), fb = old.getAttribute("src");
  const lg = document.createElement("img");
  lg.setAttribute("data-rc-logo", ""); lg.setAttribute("data-fallback", fb); lg.setAttribute("src", fb); lg.setAttribute("alt", "Logo");
  lg.setAttribute("crossorigin", "anonymous"); lg.className = "rc-logo"; lg.setAttribute("style", "max-width:85px;height:auto;display:block");
  logoBox.replaceChild(lg, old);
  [comp, logoBox, meta].forEach(n => { n.style.order = "0"; });
  const D = (st, ...kids) => { const d = document.createElement("div"); d.setAttribute("style", st); kids.forEach(k => k && d.appendChild(k)); return d; };
  inner.innerHTML = "";
  const flip = r() < 0.5;
  let titleMB = null, noPad = false, skipTitle = false, arche;
  card.style.width = size.w + "px"; card.style.height = size.h + "px";
  const longP = size.id === "long";
  if (!land) {
    arche = pick(r, longP ? ["perm", "titlerow", "center", "dual", "boxbill"] : ["perm", "titlerow", "dual", "dual", "boxbill"]);
    bill.style.gridTemplateColumns = longP ? pick(r, ["1.4fr 1.1fr .5fr", "1fr 1fr", "1fr"]) : "1.4fr 1.1fr .5fr";
    if (arche === "perm" || arche === "boxbill") {
      const pm = pick(r, [["c", "l", "m"], ["l", "c", "m"], ["m", "l", "c"], ["c", "m", "l"], ["l", "m", "c"], ["m", "c", "l"]]), map = { c: comp, l: logoBox, m: meta };
      const h = D("display:flex;justify-content:space-between;align-items:flex-start;width:100%;margin-bottom:8px");
      pm.forEach((k, i) => { const n = map[k]; n.style.width = k === "l" ? "30%" : "35%"; n.style.textAlign = k === "m" ? (i === 0 ? "left" : "right") : (k === "c" && i === 2 ? "right" : (k === "l" ? "center" : "left")); h.appendChild(n); });
      if (arche === "boxbill") Object.assign(bill.style, { background: P.soft, borderLeft: `3px solid ${P.p}`, padding: "6px 8px", boxSizing: "border-box", marginBottom: "10px" });
      inner.append(title, h, dash, bill, table, words, terms);
    } else if (arche === "dual") {
      const left = D("width:46%;display:flex;flex-direction:column;gap:6px;align-items:flex-start"), right = D(`flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;text-align:${flip ? "left" : "right"}`);
      comp.style.width = "100%"; logoBox.style.width = "auto"; logoBox.style.marginTop = "0";
      meta.style.width = "100%"; meta.style.textAlign = flip ? "left" : "right"; bill.style.gridTemplateColumns = "1fr"; bill.style.marginBottom = "0";
      left.append(logoBox, comp); right.append(meta, bill);
      inner.append(title, D(`display:flex;gap:14px;width:100%;margin-bottom:8px;${flip ? "flex-direction:row-reverse;" : ""}`, left, right), dash, table, words, terms);
    } else if (arche === "titlerow") {
      const tr = D("display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:10px;gap:8px");
      title.style.margin = "0"; title.style.textAlign = "left"; meta.style.width = "auto"; meta.style.textAlign = flip ? "left" : "right";
      flip ? tr.append(meta, title) : tr.append(title, meta);
      const h = D("display:flex;align-items:center;gap:10px;width:100%;margin-bottom:8px");
      comp.style.width = "auto"; comp.style.flex = "1"; logoBox.style.width = "auto"; logoBox.style.marginTop = "0";
      flip ? h.append(comp, logoBox) : h.append(logoBox, comp);
      inner.append(tr, h, dash, bill, table, words, terms); titleMB = "0";
    } else {
      logoBox.style.width = "100%"; logoBox.style.marginTop = "0"; logoBox.style.marginBottom = "4px";
      comp.style.width = "100%"; comp.style.textAlign = "center"; comp.style.marginBottom = "6px";
      Object.assign(meta.style, { width: "100%", display: "flex", justifyContent: "space-between", marginBottom: "4px", textAlign: "left" });
      inner.append(title, logoBox, comp, meta, dash, bill, table, words, terms);
    }
    card.style.padding = `25px ${pick(r, [18, 20, 22])}px`;
  } else {
    arche = pick(r, ["split", "head", "side"]);
    table.style.marginBottom = "10px"; words.style.marginBottom = "10px";
    if (arche === "split") {
      const wrap = D(`display:flex;gap:22px;width:100%;align-items:stretch;${flip ? "flex-direction:row-reverse;" : ""}`);
      const left = D("width:36%;flex:none;display:flex;flex-direction:column;gap:8px"), right = D("flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center");
      title.style.margin = "0 0 2px"; comp.style.width = "auto"; comp.style.flex = "1"; logoBox.style.width = "auto"; logoBox.style.marginTop = "0";
      meta.style.width = "100%"; meta.style.textAlign = "left"; bill.style.gridTemplateColumns = "1fr"; bill.style.marginBottom = "0"; dash.style.margin = "4px 0";
      left.append(title, D("display:flex;gap:10px;align-items:center", logoBox, comp), meta, dash, bill);
      right.append(table, words, terms); wrap.append(left, right); inner.append(wrap); titleMB = "0";
    } else if (arche === "head") {
      comp.style.width = "auto"; comp.style.flex = "1"; logoBox.style.width = "auto"; logoBox.style.marginTop = "0"; meta.style.width = "auto";
      title.style.margin = "0"; title.style.flex = "none";
      const top = D(`display:flex;justify-content:space-between;align-items:center;gap:14px;width:100%;${flip ? "flex-direction:row-reverse;" : ""}`, D("display:flex;align-items:center;gap:10px;flex:1", logoBox, comp), title, meta);
      bill.style.gridTemplateColumns = "1fr"; bill.style.marginBottom = "0"; dash.style.margin = "10px 0";
      const cols = D(`display:flex;gap:20px;width:100%;${flip ? "flex-direction:row-reverse;" : ""}`, D("width:30%;flex:none;display:flex;flex-direction:column;gap:12px", bill, words, terms), D("flex:1;min-width:0", table));
      inner.append(top, dash, cols); titleMB = "0";
    } else {
      noPad = true; skipTitle = true;
      card.style.flexDirection = flip ? "row-reverse" : "row"; card.style.padding = "0"; card.style.alignItems = "stretch";
      const side = D(`width:150px;flex:none;background:${P.p};color:#fff;padding:20px 12px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center`);
      logoBox.style.width = "auto"; logoBox.style.marginTop = "0"; logoBox.style.background = "#fff"; logoBox.style.padding = "6px"; logoBox.style.borderRadius = "6px";
      title.style.cssText = "margin:0;color:#fff;font-size:14px;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:1px";
      Object.assign(meta.style, { width: "100%", textAlign: "center", color: "#fff" });
      side.append(logoBox, title, meta);
      inner.style.cssText = "flex:1;min-width:0;width:auto;padding:20px 22px;display:flex;flex-direction:column;justify-content:center";
      comp.style.width = "100%"; comp.style.marginBottom = "4px";
      bill.style.gridTemplateColumns = "1.4fr 1.1fr .5fr"; bill.style.marginBottom = "10px"; dash.style.margin = "8px 0";
      inner.append(comp, dash, bill, table, words, terms);
      card.insertBefore(side, inner);
    }
    if (!noPad) card.style.padding = "22px 26px";
  }
  /* ---- রং/স্টাইল ---- */
  const cv = Math.floor(r() * 4);
  card.style.boxSizing = "border-box";
  if (cv === 1) card.style.border = `1px solid ${P.p}`; else if (cv === 2) card.style.border = `2px solid ${P.p}`; else if (cv === 3) card.style.border = `3px double ${P.p}`;
  if (cv > 0 && r() < 0.5) { card.style.borderRadius = pick(r, [6, 10]) + "px"; if (noPad) card.style.overflow = "hidden"; }
  if (r() < 0.25 && !noPad) card.style.background = P.soft;
  if (r() < 0.3) card.style.fontFamily = "Arial,'Noto Sans Bengali',sans-serif";
  if (!skipTitle) {
    const tv = Math.floor(r() * 4);
    title.style.letterSpacing = pick(r, ["0", "1px", "2px"]);
    if (tv === 0) Object.assign(title.style, { background: P.p, color: "#fff", padding: "3px 8px", marginBottom: titleMB ?? "15px" });
    else if (tv === 1) Object.assign(title.style, { color: P.p, borderBottom: `2px solid ${P.p}`, paddingBottom: "3px", marginBottom: titleMB ?? "17px" });
    else if (tv === 2) { title.style.color = P.p; if (titleMB != null) title.style.marginBottom = titleMB; }
    else Object.assign(title.style, { border: `1.5px solid ${P.p}`, color: P.p, padding: "2px 8px", marginBottom: titleMB ?? "17px", borderRadius: pick(r, ["0px", "6px"]) });
  }
  const cn = q("#inv-centre-name"); if (cn) cn.style.color = P.p;
  $$(".billing-info strong").forEach(x => { x.style.color = P.p; });
  dash.style.borderTop = `${pick(r, [1, 1, 2])}px ${pick(r, ["solid", "dashed", "dotted"])} ${P.p}`;
  if (!land && arche !== "center") dash.style.margin = arche === "boxbill" ? "10px 0" : arche === "dual" ? "0 0 12px" : pick(r, ["18px 0", "14px 0", "16px 0"]);
  const bc = pick(r, [P.mid, P.p, "#000"]), thv = Math.floor(r() * 3);
  $$(".invoice-table th").forEach(th => {
    th.style.borderColor = bc;
    if (thv === 0) { th.style.background = P.p; th.style.color = "#fff"; }
    else if (thv === 1) { th.style.background = P.soft; th.style.color = P.p; }
    else { th.style.background = "transparent"; th.style.color = P.p; th.style.borderBottom = `2px solid ${P.p}`; }
  });
  const rows = {}, B = `border-color:${bc};`, set = (k, i, st) => { rows[k + "|" + i] = { s: st, h: 0 }; };
  for (let i = 0; i < 7; i++) set("item", i, B);
  ["Sub Total", "Online Service Charge", "Total Amount", "Discount"].forEach(k => { set(k, 0, B); set(k, 1, B); });
  const hv = r() < 0.35 ? `background:${P.p};color:#fff;font-weight:700;` : `background:${P.soft};color:${P.p};font-weight:700;`;
  set("Payable Amount", 0, B + hv); set("Payable Amount", 1, B + hv);
  set("Paid Amount", 0, "vertical-align:middle;padding-right:10px;" + B); set("Paid Amount", 1, "padding:0;vertical-align:middle;" + B); set("Paid Amount", 2, "vertical-align:middle;" + B);
  set("Due Amount", 0, "color:red;" + B); set("Due Amount", 1, "color:red;" + B);
  const ws = [...words.querySelectorAll("strong")].find(x => /Payable In Word/.test(x.textContent)); if (ws) ws.style.color = P.p;
  return { html: box.innerHTML, rows, size: { w: size.w, h: size.h, mm: size.mm, sc: size.sc }, css: layoutCss("invoice", size), v: 3, name: size.id + "-" + arche };
}
const generate = (kind, def, seed) => kind === "slip" ? genSlip(def, seed) : genInvoice(def, seed);

/* ---------- editor ---------- */
export async function openTemplateEditor(kind, { data = {}, save } = {}) {
  document.getElementById("rceBack")?.remove();
  let defHtml;
  try { defHtml = await loadDefault(kind); } catch { alert("Template load করা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।"); return; }
  const saved = parseLayout(data[kind + "Layout"]);

  const st = document.createElement("style");
  st.id = "rceStyle";
  st.textContent = CSS + (kind === "slip" ? SLIP_CSS : "");
  document.head.appendChild(st);

  const back = document.createElement("div");
  back.id = "rceBack";
  back.innerHTML = `
    <div id="rceBar"><b>${TITLE[kind]}</b>
      <button class="rce-b p" id="rceTplBtn">🎨 Templates</button>
      <button class="rce-b" id="rceUndo" disabled>↶ Undo</button>
      <button class="rce-b" id="rceHidBtn">Hidden (0)</button>
      <button class="rce-b d" id="rceReset">Reset</button>
      <button class="rce-b" id="rceClose">Close</button>
      <button class="rce-b p" id="rceSave">Save</button></div>
    <div id="rceView"><div id="rceBox"><div id="rceStage" data-k="${kind}"></div></div></div>
    <div id="rcePanel">
      <div id="rceInfo">Tap any part of the preview to select it, then change it below.</div>
      <div class="r" id="rceMar"><span class="t">Page margin</span>
        <span class="t">Top</span><button class="rce-b" data-m="t" data-d="-1">−</button><span id="mt" class="v"></span><button class="rce-b" data-m="t" data-d="1">+</button>
        <span class="t">Bottom</span><button class="rce-b" data-m="b" data-d="-1">−</button><span id="mb" class="v"></span><button class="rce-b" data-m="b" data-d="1">+</button>
        <span class="t">Left</span><button class="rce-b" data-m="l" data-d="-1">−</button><span id="ml" class="v"></span><button class="rce-b" data-m="l" data-d="1">+</button>
        <span class="t">Right</span><button class="rce-b" data-m="r" data-d="-1">−</button><span id="mr" class="v"></span><button class="rce-b" data-m="r" data-d="1">+</button></div>
      <div id="rceHidList" hidden></div>
      <div id="rceCtl" hidden>
        <div class="r"><button class="rce-b" id="cUp">↑ Parent</button>
          <button class="rce-b" id="cPrev">▲ Move up</button><button class="rce-b" id="cNext">▼ Move down</button>
          <button class="rce-b" id="cHide">Hide</button><button class="rce-b" id="cHideRow">Hide row</button><button class="rce-b d" id="cDel">Delete</button></div>
        <div class="r" id="cTexts"></div>
        <div class="r" id="cImg" hidden><span class="t">Image link</span><input type="text" id="cSrc" placeholder="https://..."></div>
        <div class="r"><span class="t">Text</span><input type="color" id="cColor"><button class="rce-b" data-clr="color">✕</button>
          <span class="t">Fill</span><input type="color" id="cBg"><button class="rce-b" data-clr="backgroundColor">✕</button>
          <span class="t">Border</span><input type="color" id="cBc"><button class="rce-b" data-clr="borderColor">✕</button></div>
        <div class="r"><span class="t">Border width</span>
          <select id="cBw"><option value="">–</option><option value="0">None</option><option value="1">1px</option><option value="2">2px</option><option value="3">3px</option></select>
          <span class="t">Corners</span>
          <select id="cRad"><option value="">–</option><option value="0">Square</option><option value="4">4px</option><option value="8">8px</option><option value="16">16px</option></select></div>
        <div class="r"><span class="t" id="cSzT">Size</span><button class="rce-b" id="cSm">A−</button><span id="cSz" style="min-width:34px;text-align:center"></span><button class="rce-b" id="cLg">A+</button>
          <button class="rce-b" id="cB"><b>B</b></button><button class="rce-b" id="cI"><i>I</i></button>
          <button class="rce-b" data-al="left">⇤</button><button class="rce-b" data-al="center">↔</button><button class="rce-b" data-al="right">⇥</button></div>
        <div class="r"><span class="t" id="cSpT">Space above</span><button class="rce-b" data-s="Top" data-d="-1">−</button><span id="sT" class="v"></span><button class="rce-b" data-s="Top" data-d="1">+</button>
          <span class="t" id="cSpB">Space below</span><button class="rce-b" data-s="Bottom" data-d="-1">−</button><span id="sB" class="v"></span><button class="rce-b" data-s="Bottom" data-d="1">+</button></div>
        <div class="r"><span class="t">Add below</span><button class="rce-b" id="aTxt">+ Text</button><button class="rce-b" id="aRow">+ Row</button>
          <button class="rce-b" id="aLine">+ Line</button><button class="rce-b" id="aSp">+ Space</button></div>
      </div>
    </div>`;
  document.body.appendChild(back);

  const $ = id => back.querySelector("#" + id);
  const stage = $("rceStage"), box = $("rceBox"), view = $("rceView");

  /* --- load template into stage --- */
  const defBox = document.createElement("div");
  defBox.innerHTML = defHtml;
  stage.innerHTML = saved ? saved.html : defHtml;
  stage.querySelectorAll("[data-rc-h]").forEach(n => { n.style.removeProperty("display"); n.classList.add("rce-hid"); });
  stage.firstElementChild?.removeAttribute(MARK);
  if (kind === "slip" && saved && saved.pad) stage.style.padding = saved.pad;
  let curSize = (saved && saved.size) || null, curCss = (saved && saved.css) || "";
  const applySize = () => {
    stage.style.width = curSize ? curSize.w + "px" : "";
    if (kind === "invoice") stage.style.height = curSize ? curSize.h + "px" : ""; else stage.style.minHeight = curSize && curSize.minH ? curSize.minH + "px" : "";
  };
  applySize();

  const D = data;
  const fillSample = root => {
    const setT = (id, v) => { const n = root.querySelector("#" + id); if (n) n.textContent = v; };
  if (kind === "slip") {
    setT("slipDateVal", "Date: " + today()); setT("slipCentreName", (D.centreName || "Centre Name") + ":");
    setT("slipCentreType", D.centreType || ""); setT("slipBranchName", "(" + (D.branchName || "Branch") + ")");
    setT("slipBranchAddress", D.branchAddress || ""); setT("slipBranchNumber", "Phone: " + (D.branchNumber || "").replace("+880", "0"));
    setT("slipName", "Mohammad Rahim"); setT("slipPhone", "01712345678"); setT("slipAge", "32"); setT("slipGender", "Male");
    setT("slipAddr", "Jessore Sadar, Jessore"); setT("slipSchedule", "10:30 AM"); setT("slipPid", "04150626");
  } else {
    setT("inv-centre-name", (D.centerName || D.centreName || "--") + " :"); setT("inv-centre-type", D.centreType || "Cupping & Ruqyah Centre");
    setT("inv-branch-name", "(" + (D.branch || D.branchName || "--") + ")"); setT("inv-branch-addr", D.address || D.branchAddress || "--");
    setT("inv-branch-phone", "Phone: " + (D.phone || D.branchNumber || "--")); setT("inv-pid", "04150626"); setT("inv-date", today());
    setT("inv-name", "Mohammad Rahim"); setT("inv-addr", "Jessore Sadar, Jessore"); setT("inv-age", "32 years");
    setT("inv-phone", "01712345678"); setT("inv-gender", "Male");
    const tb = root.querySelector("#inv-items");
    const R = (l, v, x = "") => `<tr><td colspan="6" align="right"${x}>${l}:</td><td align="right"${x}>${v}</td></tr>`;
    if (tb) tb.innerHTML =
      '<tr><td align="center">1</td><td>Consultation</td><td align="center">Service</td><td align="center">1</td><td align="right">500</td><td align="right">0</td><td align="right">500</td></tr>' +
      R("Sub Total", "500") + R("Online Service Charge", "50") + R("Total Amount", "550") + R("Discount", "0") + R("Payable Amount", "550") +
      '<tr><td colspan="4" align="right" style="vertical-align:middle;padding-right:10px">Paid Amount:</td><td colspan="2" style="padding:0;vertical-align:middle"><table class="trans-container"><tr><td colspan="2">Transactions</td></tr><tr><td width="55%">' + today() + '</td><td width="45%">Cash</td></tr></table></td><td align="right" style="vertical-align:middle">300</td></tr>' +
      R("Due Amount", "250", ' style="color:red"');
  }
  };
  const logoUrl = D.logoUrl || D.logo || D.centerLogo || "";
  const fillLogos = root => {
    root.querySelectorAll("img[data-rc-logo]").forEach(i => {
      const u = logoUrl || i.getAttribute("data-fallback") || "";
      if (u) { i.removeAttribute("data-rc-nologo"); i.crossOrigin = "anonymous"; i.src = u; } else i.setAttribute("data-rc-nologo", "1");
    });
  };
  const addLogoImgs = (root, z) => {
    if (!logoUrl) return;
    const v3 = !!root.querySelector("[data-rc-logo]");
    root.classList.add("hasLogo");
    [["rceWM", "wm rcewm"], ["rceLogo", "lg rcelg"]].forEach(([id, c]) => {
      if (v3 && id === "rceLogo") return;
      const i = new Image(); if (root === stage) i.id = id; i.className = c; i.crossOrigin = "anonymous"; i.src = logoUrl;
      if (v3 && z) i.style.cssText = wmCss(kind, z, false);
      i.onload = () => { i.style.display = "block"; }; root.appendChild(i);
    });
  };
  fillSample(stage); fillLogos(stage); addLogoImgs(stage, curSize);

  /* --- fit to screen --- */
  const fit = () => {
    const sw = stage.offsetWidth, sh = stage.offsetHeight, s = Math.min(1, (view.clientWidth - 12) / sw);
    stage.style.transform = `scale(${s})`; box.style.width = sw * s + "px"; box.style.height = sh * s + "px";
  };
  const ro = new ResizeObserver(fit); ro.observe(stage); ro.observe(view); fit();

  /* --- state --- */
  let sel = null, dirty = false;
  const hist = [];
  const push = () => { hist.push([stage.innerHTML, stage.style.padding]); if (hist.length > 40) hist.shift(); dirty = true; $("rceUndo").disabled = false; };
  const toast = m => { document.getElementById("rceToast")?.remove(); const t = document.createElement("div"); t.id = "rceToast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };
  const hidden = () => [...stage.querySelectorAll("[data-rc-h]")];
  const hidCount = () => { $("rceHidBtn").textContent = "Hidden (" + hidden().length + ")"; };

  const select = el => {
    sel?.classList.remove("rce-sel");
    sel = el && el !== stage ? el : null;
    sel?.classList.add("rce-sel");
    refreshPanel();
  };

  /* ইনভয়েসের একই ধরনের সারি (যেমন একাধিক আইটেম) একসাথে এক স্টাইল পাবে */
  function syncRows() {
    const tb = stage.querySelector("#inv-items");
    if (!tb || !sel || !tb.contains(sel) || sel === tb) return;
    const tr = [...tb.children].find(r => r.contains(sel)); if (!tr) return;
    const k = rowKey(tr), p = pathOf(sel, tr);
    for (const o of tb.children) {
      if (o === tr || rowKey(o) !== k) continue;
      const el = byPath(o, p); if (!el) continue;
      const a = sel.getAttribute("style"); a ? el.setAttribute("style", a) : el.removeAttribute("style");
      const h = sel.hasAttribute("data-rc-h"); el.toggleAttribute("data-rc-h", h); el.classList.toggle("rce-hid", h);
    }
  }

  function refreshPanel() {
    syncRows();
    const ctl = $("rceCtl"), info = $("rceInfo");
    ctl.hidden = !sel;
    if (!sel) { info.textContent = "Tap any part of the preview to select it, then change it below."; return; }
    const cs = getComputedStyle(sel), tag = sel.tagName.toLowerCase();
    const label = (sel.textContent || "").trim().replace(/\s+/g, " ").slice(0, 26);
    info.textContent = "Selected: " + tag + (sel.id ? "#" + sel.id : "") + (label ? " — " + label : "");
    $("cColor").value = hex(cs.color) || "#000000";
    $("cBg").value = hex(cs.backgroundColor) || "#ffffff";
    $("cBc").value = hex(cs.borderTopColor) || "#000000";
    $("cBw").value = ""; $("cRad").value = "";
    const cell = /^(TD|TH)$/.test(sel.tagName);
    $("cSpT").textContent = cell ? "Padding top" : "Space above"; $("cSpB").textContent = cell ? "Padding bottom" : "Space below";
    $("sT").textContent = Math.round(parseFloat(cs[cell ? "paddingTop" : "marginTop"]) || 0);
    $("sB").textContent = Math.round(parseFloat(cs[cell ? "paddingBottom" : "marginBottom"]) || 0);
    const tr = sel.closest("tr");
    $("cHideRow").hidden = !tr || sel === tr;
    if (tr) $("cHideRow").textContent = tr.hasAttribute("data-rc-h") ? "Show row" : "Hide row";
    const isImg = tag === "img";
    $("cSzT").textContent = isImg ? "Width" : "Size";
    $("cSz").textContent = isImg ? Math.round(sel.offsetWidth) : Math.round(parseFloat(cs.fontSize)) + "px";
    $("cImg").hidden = !isImg; if (isImg) $("cSrc").value = sel.getAttribute("src") || "";
    $("cHide").textContent = sel.hasAttribute("data-rc-h") ? "Show" : "Hide";
    $("cDel").disabled = !sel.closest("[data-rc-custom]");
    $("cPrev").disabled = $("cNext").disabled = CELLS.test(sel.tagName) && sel.tagName !== "TR" || sel.parentElement === stage || !!sel.closest("#inv-items");
    $("cUp").disabled = !sel.parentElement || sel.parentElement === stage;
    $("cB").classList.toggle("on", parseInt(cs.fontWeight) >= 600);
    $("cI").classList.toggle("on", cs.fontStyle === "italic");
    back.querySelectorAll("[data-al]").forEach(b => b.classList.toggle("on", cs.textAlign === b.dataset.al || (b.dataset.al === "left" && /^(start|left)$/.test(cs.textAlign))));
    $("aRow").disabled = !(sel.closest(".info-table") || stage.querySelector(".info-table"));
    const T = $("cTexts"); T.innerHTML = "";
    if (sel.id) { T.innerHTML = '<span class="t">This value fills in automatically — you can restyle or move it, not retype it.</span>'; return; }
    [...sel.childNodes].filter(n => n.nodeType === 3 && n.nodeValue.trim()).forEach(n => {
      const i = document.createElement("input"); i.type = "text"; i.value = n.nodeValue.trim();
      const lead = n.nodeValue.match(/^\s*/)[0], trail = n.nodeValue.match(/\s*$/)[0];
      i.onfocus = () => { i._p = 0; };
      i.oninput = () => { if (!i._p) { push(); i._p = 1; } n.nodeValue = lead + i.value + trail; };
      T.appendChild(i);
    });
  }

  const css = (prop, val) => { if (!sel) return; push(); sel.style[prop] = val; refreshPanel(); };

  /* --- tap to select --- */
  stage.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); select(e.target === stage ? null : e.target); }, true);

  /* --- colours --- */
  $("cColor").oninput = e => css("color", e.target.value);
  $("cBg").oninput = e => css("backgroundColor", e.target.value);
  $("cBc").oninput = e => {
    if (!sel) return; push();
    const w = parseFloat(getComputedStyle(sel).borderTopWidth) || 0;
    if (!w || getComputedStyle(sel).borderTopStyle === "none") sel.style.border = "1px solid " + e.target.value;
    else sel.style.borderColor = e.target.value;
    refreshPanel();
  };
  back.querySelectorAll("[data-clr]").forEach(b => b.onclick = () => {
    if (!sel) return; push();
    sel.style.removeProperty(b.dataset.clr.replace(/[A-Z]/g, m => "-" + m.toLowerCase()));
    if (b.dataset.clr === "borderColor") sel.style.removeProperty("border");
    refreshPanel();
  });
  $("cBw").onchange = e => {
    if (!sel || e.target.value === "") return; push();
    const c = hex(getComputedStyle(sel).borderTopColor) || "#000000";
    sel.style.border = e.target.value === "0" ? "none" : e.target.value + "px solid " + c;
    refreshPanel();
  };
  $("cRad").onchange = e => { if (e.target.value !== "") css("borderRadius", e.target.value + "px"); };

  /* --- font / image size, bold, italic, align --- */
  const bump = d => {
    if (!sel) return; push();
    if (sel.tagName === "IMG") { const w = Math.max(10, sel.offsetWidth + d * 6); sel.style.width = w + "px"; sel.style.maxWidth = "none"; sel.style.height = "auto"; }
    else sel.style.fontSize = Math.min(48, Math.max(5, parseFloat(getComputedStyle(sel).fontSize) + d * 0.5)) + "px";
    refreshPanel();
  };
  $("cSm").onclick = () => bump(-1); $("cLg").onclick = () => bump(1);
  $("cB").onclick = () => css("fontWeight", parseInt(getComputedStyle(sel).fontWeight) >= 600 ? "400" : "700");
  $("cI").onclick = () => css("fontStyle", getComputedStyle(sel).fontStyle === "italic" ? "normal" : "italic");
  back.querySelectorAll("[data-al]").forEach(b => b.onclick = () => css("textAlign", b.dataset.al));
  $("cSrc").onchange = e => { if (sel && sel.tagName === "IMG") { push(); sel.setAttribute("src", e.target.value.trim()); } };

  /* --- space above / below --- */
  back.querySelectorAll("[data-s]").forEach(b => b.onclick = () => {
    if (!sel) return; push();
    const cell = /^(TD|TH)$/.test(sel.tagName), prop = (cell ? "padding" : "margin") + b.dataset.s;
    const cur = parseFloat(getComputedStyle(sel)[prop]) || 0;
    sel.style[prop] = Math.min(80, Math.max(cell ? 0 : -20, cur + (+b.dataset.d) * 2)) + "px";
    refreshPanel();
  });

  /* --- page margin (invoice: card padding, slip: space around the box) --- */
  const marTarget = () => kind === "slip" ? stage : stage.firstElementChild;
  const SIDE = { t: "Top", b: "Bottom", l: "Left", r: "Right" };
  function refreshMargins() {
    const t = marTarget(); if (!t) return; const cs = getComputedStyle(t);
    Object.keys(SIDE).forEach(k => { $("m" + k).textContent = Math.round(parseFloat(cs["padding" + SIDE[k]]) || 0); });
  }
  back.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
    const t = marTarget(); if (!t) return; push();
    const cs = getComputedStyle(t), v = {};
    Object.keys(SIDE).forEach(k => { v[k] = Math.round(parseFloat(cs["padding" + SIDE[k]]) || 0); });
    v[b.dataset.m] = Math.min(80, Math.max(0, v[b.dataset.m] + (+b.dataset.d) * 2));
    t.style.padding = `${v.t}px ${v.r}px ${v.b}px ${v.l}px`;
    refreshMargins();
  });

  /* --- structure: parent / move / hide / delete --- */
  $("cUp").onclick = () => { if (sel && sel.parentElement && sel.parentElement !== stage) select(sel.parentElement); };
  const move = dir => {
    if (!sel) return;
    const sib = dir < 0 ? sel.previousElementSibling : sel.nextElementSibling;
    if (!sib || sib.id === "rceWM" || sib.id === "rceLogo") return toast("Can't move further");
    push();
    dir < 0 ? sel.parentElement.insertBefore(sel, sib) : sel.parentElement.insertBefore(sib, sel);
    const p = sel.parentElement, d = getComputedStyle(p).display;
    if (/flex|grid/.test(d)) [...p.children].forEach((c, i) => { if (c.id !== "rceWM" && c.id !== "rceLogo") c.style.order = i + 1; });
    refreshPanel();
  };
  $("cPrev").onclick = () => move(-1); $("cNext").onclick = () => move(1);
  const toggleHide = h => {
    push();
    const on = h.toggleAttribute("data-rc-h"); h.classList.toggle("rce-hid", on);
    if (h !== sel && h.closest("#inv-items")) { const keep = sel; sel = h; syncRows(); sel = keep; }
    hidCount(); refreshPanel(); renderHidden();
  };
  $("cHide").onclick = () => { if (sel) toggleHide(sel); };
  $("cHideRow").onclick = () => { const r = sel && sel.closest("tr"); if (r) toggleHide(r); };
  $("cDel").onclick = () => {
    const c = sel && sel.closest("[data-rc-custom]"); if (!c) return;
    push(); select(null); c.remove(); hidCount();
  };

  /* --- add --- */
  const anchorFor = () => {
    let a = sel || stage.firstElementChild;
    if (a.classList?.contains("invoice-card")) a = a.firstElementChild || a;
    if (a.parentElement === stage) return { into: a };
    let t = a.closest("table"); while (t && t.parentElement && t.parentElement.closest("table")) t = t.parentElement.closest("table"); if (t && !a.closest("[data-rc-custom]")) a = t;
    return { after: a };
  };
  const place = n => {
    push(); const { into, after } = anchorFor();
    into ? into.appendChild(n) : after.after(n);
    hidCount(); select(n);
  };
  const mk = (tag, style, html) => { const n = document.createElement(tag); n.setAttribute("data-rc-custom", "1"); if (style) n.setAttribute("style", style); if (html != null) n.innerHTML = html; return n; };
  $("aTxt").onclick = () => place(mk("p", "font-size:11px;margin:3px 0;text-align:center;width:100%", "New text"));
  $("aLine").onclick = () => place(mk("div", "border-top:1px solid #000;margin:6px 0;width:100%", ""));
  $("aSp").onclick = () => place(mk("div", "height:12px;width:100%", ""));
  $("aRow").onclick = () => {
    const tbl = (sel && sel.closest(".info-table")) || stage.querySelector(".info-table"); if (!tbl) return;
    const tr = mk("tr", "", "<td>Label</td><td>Value</td>");
    const ref = (sel && sel.closest("tr") && sel.closest(".info-table")) ? sel.closest("tr") : tbl.querySelector("tr:last-child");
    push(); ref.after(tr); hidCount(); select(tr);
  };

  /* --- hidden list --- */
  const renderHidden = () => {
    const L = $("rceHidList"); if (L.hidden) return;
    const h = hidden();
    L.innerHTML = h.length ? "" : '<div class="t">Nothing is hidden.</div>';
    h.forEach(n => {
      const r = document.createElement("div"); r.className = "row";
      const s = document.createElement("span"); s.textContent = (n.textContent || "").trim().replace(/\s+/g, " ").slice(0, 34) || "<" + n.tagName.toLowerCase() + ">";
      const b = document.createElement("button"); b.className = "rce-b"; b.textContent = "Show";
      b.onclick = () => { push(); n.removeAttribute("data-rc-h"); n.classList.remove("rce-hid"); hidCount(); renderHidden(); refreshPanel(); };
      r.append(s, b); L.appendChild(r);
    });
  };
  $("rceHidBtn").onclick = () => { const L = $("rceHidList"); L.hidden = !L.hidden; $("rceHidBtn").classList.toggle("on", !L.hidden); renderHidden(); };

  /* --- undo --- */
  $("rceUndo").onclick = () => {
    const s = hist.pop(); if (s == null) return;
    sel = null; stage.innerHTML = s[0]; stage.style.padding = s[1]; refreshMargins(); stage.querySelectorAll(".rce-sel").forEach(n => n.classList.remove("rce-sel"));
    $("rceUndo").disabled = !hist.length; hidCount(); renderHidden(); refreshPanel();
  };

  /* --- serialize / save / reset / close --- */
  let rowsOut = {};
  const serialize = () => {
    const c = stage.cloneNode(true);
    c.querySelectorAll("#rceWM,#rceLogo").forEach(n => n.remove());
    rowsOut = {};
    const tb = c.querySelector("#inv-items");
    if (tb) for (const tr of [...tb.children]) {
      const k = rowKey(tr);
      for (const el of rowEls(tr)) {
        const sty = el.getAttribute("style") || "", h = el.hasAttribute("data-rc-h");
        if (sty || h) rowsOut[k + "|" + pathOf(el, tr)] = { s: sty, h: h ? 1 : 0 };
      }
    }
    c.querySelectorAll(".rce-sel").forEach(n => n.classList.remove("rce-sel"));
    c.querySelectorAll("img[data-rc-logo]").forEach(i => {
      i.removeAttribute("data-rc-nologo"); i.removeAttribute("crossorigin");
      const fb = i.getAttribute("data-fallback"); fb ? i.setAttribute("src", fb) : i.removeAttribute("src");
    });
    c.querySelectorAll("[data-rc-h]").forEach(n => { n.classList.remove("rce-hid"); n.style.display = "none"; });
    c.querySelectorAll("[class='']").forEach(n => n.removeAttribute("class"));
    c.querySelectorAll("[id]").forEach(n => { const d = defBox.querySelector("#" + CSS_ESC(n.id)); if (d) n.innerHTML = d.innerHTML; });
    if (c.firstElementChild) c.firstElementChild.setAttribute(MARK, "1");
    return c.innerHTML;
  };
  const CSS_ESC = s => (window.CSS && CSS.escape) ? CSS.escape(s) : s;

  const close = () => {
    if (dirty && !confirm("Unsaved changes will be lost. Close anyway?")) return;
    ro.disconnect(); back.remove(); st.remove(); removeEventListener("keydown", onKey);
  };
  const onKey = e => { if (e.key !== "Escape") return; const t = back.querySelector("#rceTpl"); if (t && !t.hidden) t.hidden = true; else close(); };
  addEventListener("keydown", onKey);
  $("rceClose").onclick = close;

  $("rceSave").onclick = async () => {
    const b = $("rceSave"); b.disabled = true; b.textContent = "Saving...";
    try {
      if (!save) throw new Error("save() missing");
      await save({ [kind + "Layout"]: JSON.stringify((() => { const html = serialize(); const o = kind === "invoice" ? { v: 2, html, rows: rowsOut } : { v: 1, html, pad: stage.style.padding || "" };
      if (curSize) { o.v = 3; o.size = curSize; o.css = curCss; }
      return o; })()), [kind + "LayoutActive"]: true });
      dirty = false; toast("✔ Saved");
    } catch (e) { alert("Save failed: " + (e.message || e)); }
    b.disabled = false; b.textContent = "Save";
  };
  $("rceReset").onclick = async () => {
    if (!confirm("Reset to the original design? Your saved layout will be removed.")) return;
    try {
      if (!save) throw new Error("save() missing");
      await save({ [kind + "Layout"]: "", [kind + "LayoutActive"]: false });
      dirty = false; ro.disconnect(); back.remove(); st.remove(); removeEventListener("keydown", onKey);
      toast("Reset to default");
    } catch (e) { alert("Reset failed: " + (e.message || e)); }
  };

  /* --- templates --- */
  const tpl = document.createElement("div");
  tpl.id = "rceTpl"; tpl.hidden = true;
  tpl.innerHTML = '<div class="bar"><b>Templates</b><button class="rce-b" id="tShuf">🔀 New set</button><button class="rce-b" id="tClose">Close</button></div>' +
    '<div id="tGrid"></div><div id="tMoreW"><button class="rce-b p" id="tMore">Show more</button></div>';
  back.appendChild(tpl);
  const grid = tpl.querySelector("#tGrid");
  let seedBase = 1, made = 0;

  const buildTile = seed => {
    const g = generate(kind, defHtml, seed);
    const tile = document.createElement("button"); tile.className = "rce-tile";
    tile.innerHTML = '<div class="rce-pvbox"><div class="rce-pv" data-k="' + kind + '"></div></div><div class="cap">Template ' + seed + (g.name ? " · " + g.name : "") + "</div>";
    const pv = tile.querySelector(".rce-pv"), pb = tile.querySelector(".rce-pvbox");
    const fill = root => {
      root.innerHTML = g.html;
      root.querySelectorAll("img[onerror]").forEach(n => n.remove());
      root.querySelectorAll("[data-rc-h]").forEach(n => { n.style.display = "none"; });
      fillSample(root); fillLogos(root);
      if (kind === "invoice") { const tb = root.querySelector("#inv-items"); if (tb) styleRows(tb, g.rows); }
    };
    fill(pv);
    if (kind === "slip" && g.pad) pv.style.padding = g.pad;
    if (g.size) { pv.style.width = g.size.w + "px"; if (kind === "invoice") pv.style.height = g.size.h + "px"; else if (g.size.minH) pv.style.minHeight = g.size.minH + "px"; }
    addLogoImgs(pv, g.size);
    tile.onclick = () => applyTemplate(g);
    grid.appendChild(tile);
    requestAnimationFrame(() => {
      const w = pb.clientWidth, sw = pv.offsetWidth || 1, sc = w / sw;
      pv.style.transform = "scale(" + sc + ")"; pb.style.height = pv.offsetHeight * sc + "px";
    });
  };
  const moreTiles = n => { for (let i = 0; i < n; i++) buildTile(seedBase + made++); };

  function applyTemplate(g) {
    push(); select(null);
    stage.innerHTML = g.html;
    stage.style.padding = kind === "slip" ? (g.pad || "") : "";
    stage.classList.remove("hasLogo");
    curSize = g.size || null; curCss = g.css || ""; applySize();
    fillSample(stage); fillLogos(stage); addLogoImgs(stage, curSize);
    if (kind === "invoice") { const tb = stage.querySelector("#inv-items"); if (tb) styleRows(tb, g.rows); }
    refreshMargins(); hidCount(); renderHidden(); fit();
    tpl.hidden = true;
    toast("Template applied — change anything you like, then press Save");
  }
  $("rceTplBtn").onclick = () => {
    tpl.hidden = false;
    if (!made) moreTiles(8);
  };
  tpl.querySelector("#tClose").onclick = () => { tpl.hidden = true; };
  tpl.querySelector("#tMore").onclick = () => moreTiles(8);
  tpl.querySelector("#tShuf").onclick = () => { grid.innerHTML = ""; seedBase = 1 + Math.floor(Math.random() * 900000); made = 0; moreTiles(8); grid.scrollTop = 0; };

  hidCount(); refreshMargins();
}
