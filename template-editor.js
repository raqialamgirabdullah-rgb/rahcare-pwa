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
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
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

function genSlip(def, seed) {
  const r = mulberry((seed * 2654435761) >>> 0), P = palette(r);
  const box = document.createElement("div"); box.innerHTML = def;
  const $ = s => box.querySelector(s), $$ = s => [...box.querySelectorAll(s)];
  const root = $(".slip-main-box");
  const bw = pick(r, [1, 2, 2, 3]), bs = pick(r, ["solid", "solid", "solid", "double"]), rad = pick(r, [0, 0, 6, 12, 18]);
  root.style.border = `${bs === "double" ? Math.max(bw, 3) : bw}px ${bs} ${P.p}`;
  if (rad) { root.style.borderRadius = rad + "px"; root.style.overflow = "hidden"; }
  const ff = pick(r, [null, null, "Georgia,'Noto Serif Bengali',serif", "'Trebuchet MS','Noto Sans Bengali',sans-serif"]);
  if (ff) root.style.fontFamily = ff;
  /* header */
  const hd = $(".slip-header"), h2 = $(".slip-header h2"), ico = $(".calendar-icon"), hv = Math.floor(r() * 4);
  hd.style.height = pick(r, [34, 38, 42, 46]) + "px";
  if (hv === 0) { hd.style.background = P.p; hd.style.borderBottom = "none"; h2.style.color = "#fff"; }
  else if (hv === 1) { hd.style.background = P.soft; hd.style.borderBottom = `2px solid ${P.p}`; h2.style.color = P.p; }
  else if (hv === 2) { hd.style.borderBottom = `3px double ${P.p}`; h2.style.color = P.p; }
  else { hd.style.justifyContent = "flex-start"; hd.style.paddingLeft = "16px"; hd.style.borderBottom = `2px solid ${P.p}`; h2.style.color = P.p; }
  h2.style.letterSpacing = pick(r, ["0", "0.5px", "1px", "2px"]); h2.style.fontSize = pick(r, [15, 17, 19, 21]) + "px";
  if (r() < 0.25 && ico) hideEl(ico);
  /* centre info */
  if (r() < 0.4) { $(".center-info").style.textAlign = "center"; const d = $(".slip-date"); d.style.position = "static"; d.style.textAlign = "right"; d.style.marginBottom = "2px"; }
  const h3 = $(".center-info h3"); if (h3) h3.style.color = P.p;
  /* info table */
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
  /* footer / patient id */
  const ft = $(".slip-footer"), pid = $(".patient-id"), fv = Math.floor(r() * 3);
  pid.style.fontSize = pick(r, [14, 16, 18, 20]) + "px";
  if (fv === 0) pid.style.color = P.acc;
  else if (fv === 1) { Object.assign(pid.style, { display: "inline-block", border: `1.5px solid ${P.p}`, borderRadius: "20px", padding: "2px 16px", color: P.p }); }
  else { Object.assign(pid.style, { display: "inline-block", background: P.p, color: "#fff", borderRadius: pick(r, ["4px", "20px"]), padding: "3px 16px" }); }
  if (r() < 0.2) { tb.before(ft); ft.style.marginTop = "0"; ft.style.padding = "6px 15px"; }
  if (r() < 0.2) { const st = document.createElement("div"); st.setAttribute("data-rc-custom", "1"); st.style.cssText = `height:${pick(r, [4, 6, 8])}px;background:${P.p};width:100%`; root.insertBefore(st, root.firstChild); }
  return { html: box.innerHTML, pad: pick(r, [6, 8, 10, 12, 14]) + "px" };
}

function genInvoice(def, seed) {
  const r = mulberry((seed * 2654435761) >>> 0), P = palette(r);
  const box = document.createElement("div"); box.innerHTML = def;
  const $ = s => box.querySelector(s), $$ = s => [...box.querySelectorAll(s)];
  const card = $(".invoice-card");
  card.style.boxSizing = "border-box";
  const cv = Math.floor(r() * 4);
  if (cv === 1) card.style.border = `1px solid ${P.p}`; else if (cv === 2) card.style.border = `2px solid ${P.p}`; else if (cv === 3) card.style.border = `3px double ${P.p}`;
  if (cv > 0 && r() < 0.5) card.style.borderRadius = pick(r, [6, 10]) + "px";
  if (r() < 0.25) card.style.background = P.soft;
  card.style.padding = `25px ${pick(r, [18, 20, 22])}px`;
  if (r() < 0.3) card.style.fontFamily = "Arial,'Noto Sans Bengali',sans-serif";
  /* title */
  const ti = $(".invoice-title"), tv = Math.floor(r() * 4);
  ti.style.letterSpacing = pick(r, ["0", "1px", "2px"]);
  if (tv === 0) { Object.assign(ti.style, { background: P.p, color: "#fff", padding: "3px 0", marginBottom: "15px" }); }
  else if (tv === 1) { Object.assign(ti.style, { color: P.p, borderBottom: `2px solid ${P.p}`, paddingBottom: "3px", marginBottom: "17px" }); }
  else if (tv === 2) { ti.style.color = P.p; }
  else { Object.assign(ti.style, { border: `1.5px solid ${P.p}`, color: P.p, padding: "2px 0", marginBottom: "17px", borderRadius: pick(r, ["0px", "6px"]) }); }
  /* header + info colours */
  const cn = $("#inv-centre-name"); if (cn) cn.style.color = P.p;
  $$(".billing-info strong").forEach(x => { x.style.color = P.p; });
  const ln = $(".dashed-line"); ln.style.borderTop = `${pick(r, [1, 1, 2])}px ${pick(r, ["solid", "dashed", "dotted"])} ${P.p}`; ln.style.margin = pick(r, ["18px 0", "14px 0", "16px 0"]);
  /* table header */
  const bc = pick(r, [P.mid, P.p, "#000"]), thv = Math.floor(r() * 3);
  $$(".invoice-table th").forEach(th => {
    th.style.borderColor = bc;
    if (thv === 0) { th.style.background = P.p; th.style.color = "#fff"; }
    else if (thv === 1) { th.style.background = P.soft; th.style.color = P.p; }
    else { th.style.background = "transparent"; th.style.color = P.p; th.style.borderBottom = `2px solid ${P.p}`; }
  });
  /* table rows (code-generated → keyed styles) */
  const rows = {}, B = `border-color:${bc};`, set = (k, i, st) => { rows[k + "|" + i] = { s: st, h: 0 }; };
  for (let i = 0; i < 7; i++) set("item", i, B);
  ["Sub Total", "Online Service Charge", "Total Amount", "Discount"].forEach(k => { set(k, 0, B); set(k, 1, B); });
  const hv = r() < 0.35 ? `background:${P.p};color:#fff;font-weight:700;` : `background:${P.soft};color:${P.p};font-weight:700;`;
  set("Payable Amount", 0, B + hv); set("Payable Amount", 1, B + hv);
  set("Paid Amount", 0, "vertical-align:middle;padding-right:10px;" + B); set("Paid Amount", 1, "padding:0;vertical-align:middle;" + B); set("Paid Amount", 2, "vertical-align:middle;" + B);
  set("Due Amount", 0, "color:red;" + B); set("Due Amount", 1, "color:red;" + B);
  const words = $$(".invoice-inner-content strong").find(x => /Payable In Word/.test(x.textContent)); if (words) words.style.color = P.p;
  return { html: box.innerHTML, rows };
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
  const addLogoImgs = root => {
    if (!(D.logoUrl && D.logoActive !== false)) return;
    root.classList.add("hasLogo");
    [["rceWM", "wm rcewm"], ["rceLogo", "lg rcelg"]].forEach(([id, c]) => {
      const i = new Image(); if (root === stage) i.id = id; i.className = c; i.crossOrigin = "anonymous"; i.src = D.logoUrl;
      i.onload = () => { i.style.display = "block"; }; root.appendChild(i);
    });
  };
  fillSample(stage); addLogoImgs(stage);

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
      await save({ [kind + "Layout"]: JSON.stringify((() => { const html = serialize(); return kind === "invoice" ? { v: 2, html, rows: rowsOut } : { v: 1, html, pad: stage.style.padding || "" }; })()), [kind + "LayoutActive"]: true });
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
    tile.innerHTML = '<div class="rce-pvbox"><div class="rce-pv" data-k="' + kind + '"></div></div><div class="cap">Template ' + seed + "</div>";
    const pv = tile.querySelector(".rce-pv"), pb = tile.querySelector(".rce-pvbox");
    const fill = root => {
      root.innerHTML = g.html;
      root.querySelectorAll("img[onerror]").forEach(n => n.remove());
      root.querySelectorAll("[data-rc-h]").forEach(n => { n.style.display = "none"; });
      fillSample(root);
      if (kind === "invoice") { const tb = root.querySelector("#inv-items"); if (tb) styleRows(tb, g.rows); }
    };
    fill(pv);
    if (kind === "slip" && g.pad) pv.style.padding = g.pad;
    addLogoImgs(pv);
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
    fillSample(stage); addLogoImgs(stage);
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
