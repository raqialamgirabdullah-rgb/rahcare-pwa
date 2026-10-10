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

/* ---------- live pages: সেভ করা লেআউট বসানো ---------- */
export function applyLayout(kind, root, data) {
  if (!root || !data || data[kind + "LayoutActive"] === false) return false;
  const L = parseLayout(data[kind + "Layout"]);
  if (!L) return false;
  if (root.firstElementChild && root.firstElementChild.hasAttribute(MARK)) return true;
  const keep = [...root.children].filter(n => n.tagName === "IMG" && /(WM|Logo)$/.test(n.id));
  root.innerHTML = L.html;
  keep.forEach(n => root.appendChild(n));
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
`, "#rceStage[data-k=slip]");

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
#rceStage[data-k=slip]{width:424px;padding:12px}
#rceStage[data-k=invoice]{width:340px;height:480px;font-family:Roboto,sans-serif;display:flex;justify-content:center;align-items:flex-start}
#rceStage[data-k=invoice] #rceWM{left:60px;top:110px;width:220px;height:260px}
#rceStage[data-k=invoice] #rceLogo{left:135px;top:58px;width:70px;height:56px}
#rceStage[data-k=slip] #rceWM{left:50%;top:50%;width:240px;height:240px;margin:-120px 0 0 -120px}
#rceStage[data-k=slip] #rceLogo{right:34px;top:91px;width:60px;height:46px}
#rceStage #rceWM,#rceStage #rceLogo{pointer-events:none}
.rce-sel{outline:2px solid #2563eb!important;outline-offset:1px}
.rce-hid{opacity:.3;outline:1px dashed #64748b}
#rcePanel{background:#fff;border-top:1px solid #d3dcd6;max-height:46vh;overflow:auto;padding:8px 10px 12px;font-size:12.5px}
#rcePanel .r{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}
#rcePanel .t{color:#5b6b62;margin-right:2px}
#rcePanel input[type=color]{width:36px;height:30px;padding:0;border:1px solid #c3cfc8;border-radius:6px;background:#fff}
#rcePanel input[type=text]{flex:1;min-width:140px;padding:7px 8px;border:1px solid #c3cfc8;border-radius:8px;font-size:13px;font-family:inherit}
#rcePanel select{padding:6px;border:1px solid #c3cfc8;border-radius:8px;font-size:12.5px;background:#fff}
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
      <button class="rce-b" id="rceUndo" disabled>↶ Undo</button>
      <button class="rce-b" id="rceHidBtn">Hidden (0)</button>
      <button class="rce-b d" id="rceReset">Reset</button>
      <button class="rce-b" id="rceClose">Close</button>
      <button class="rce-b p" id="rceSave">Save</button></div>
    <div id="rceView"><div id="rceBox"><div id="rceStage" data-k="${kind}"></div></div></div>
    <div id="rcePanel">
      <div id="rceInfo">Tap any part of the preview to select it, then change it below.</div>
      <div id="rceHidList" hidden></div>
      <div id="rceCtl" hidden>
        <div class="r"><button class="rce-b" id="cUp">↑ Parent</button>
          <button class="rce-b" id="cPrev">▲ Move up</button><button class="rce-b" id="cNext">▼ Move down</button>
          <button class="rce-b" id="cHide">Hide</button><button class="rce-b d" id="cDel">Delete</button></div>
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

  const setT = (id, v) => { const n = stage.querySelector("#" + id); if (n) n.textContent = v; };
  const D = data;
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
    const tb = stage.querySelector("#inv-items");
    if (tb) tb.innerHTML =
      '<tr><td align="center">1</td><td>Consultation</td><td align="center">Service</td><td align="center">1</td><td align="right">500</td><td align="right">0</td><td align="right">500</td></tr>' +
      '<tr><td colspan="6" align="right">Sub Total:</td><td align="right">500</td></tr>' +
      '<tr><td colspan="6" align="right">Payable Amount:</td><td align="right">500</td></tr>';
  }
  if (D.logoUrl && D.logoActive !== false) {
    stage.classList.add("hasLogo");
    [["rceWM", "wm"], ["rceLogo", "lg"]].forEach(([id, c]) => {
      const i = new Image(); i.id = id; i.className = c; i.crossOrigin = "anonymous"; i.src = D.logoUrl;
      i.onload = () => { i.style.display = "block"; }; stage.appendChild(i);
    });
  }

  /* --- fit to screen --- */
  const fit = () => {
    const sw = stage.offsetWidth, sh = stage.offsetHeight, s = Math.min(1, (view.clientWidth - 12) / sw);
    stage.style.transform = `scale(${s})`; box.style.width = sw * s + "px"; box.style.height = sh * s + "px";
  };
  const ro = new ResizeObserver(fit); ro.observe(stage); ro.observe(view); fit();

  /* --- state --- */
  let sel = null, dirty = false;
  const hist = [];
  const push = () => { hist.push(stage.innerHTML); if (hist.length > 40) hist.shift(); dirty = true; $("rceUndo").disabled = false; };
  const toast = m => { document.getElementById("rceToast")?.remove(); const t = document.createElement("div"); t.id = "rceToast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };
  const hidden = () => [...stage.querySelectorAll("[data-rc-h]")];
  const hidCount = () => { $("rceHidBtn").textContent = "Hidden (" + hidden().length + ")"; };

  const select = el => {
    sel?.classList.remove("rce-sel");
    sel = el && el !== stage ? el : null;
    sel?.classList.add("rce-sel");
    refreshPanel();
  };

  function refreshPanel() {
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
    const isImg = tag === "img";
    $("cSzT").textContent = isImg ? "Width" : "Size";
    $("cSz").textContent = isImg ? Math.round(sel.offsetWidth) : Math.round(parseFloat(cs.fontSize)) + "px";
    $("cImg").hidden = !isImg; if (isImg) $("cSrc").value = sel.getAttribute("src") || "";
    $("cHide").textContent = sel.hasAttribute("data-rc-h") ? "Show" : "Hide";
    $("cDel").disabled = !sel.closest("[data-rc-custom]");
    $("cPrev").disabled = $("cNext").disabled = CELLS.test(sel.tagName) && sel.tagName !== "TR" || sel.parentElement === stage;
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
  $("cHide").onclick = () => {
    if (!sel) return; push();
    const on = sel.toggleAttribute("data-rc-h"); sel.classList.toggle("rce-hid", on);
    hidCount(); refreshPanel(); renderHidden();
  };
  $("cDel").onclick = () => {
    const c = sel && sel.closest("[data-rc-custom]"); if (!c) return;
    push(); select(null); c.remove(); hidCount();
  };

  /* --- add --- */
  const anchorFor = () => {
    let a = sel || stage.firstElementChild;
    if (a.classList?.contains("invoice-card")) a = a.firstElementChild || a;
    if (a.parentElement === stage) return { into: a };
    const t = a.closest("table"); if (t && !a.closest("[data-rc-custom]")) a = t;
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
    sel = null; stage.innerHTML = s; stage.querySelectorAll(".rce-sel").forEach(n => n.classList.remove("rce-sel"));
    $("rceUndo").disabled = !hist.length; hidCount(); renderHidden(); refreshPanel();
  };

  /* --- serialize / save / reset / close --- */
  const serialize = () => {
    const c = stage.cloneNode(true);
    c.querySelectorAll("#rceWM,#rceLogo").forEach(n => n.remove());
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
  const onKey = e => { if (e.key === "Escape") close(); };
  addEventListener("keydown", onKey);
  $("rceClose").onclick = close;

  $("rceSave").onclick = async () => {
    const b = $("rceSave"); b.disabled = true; b.textContent = "Saving...";
    try {
      if (!save) throw new Error("save() missing");
      await save({ [kind + "Layout"]: JSON.stringify({ v: 1, html: serialize() }), [kind + "LayoutActive"]: true });
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

  hidCount();
}
