#!/usr/bin/env node
/*
 * Dark theme generator.
 * Reads the site's own CSS (common.css, report css, and every <style> in pages/*.html)
 * and writes dark.css: for each rule that sets a light colour, a "html.rc-dark <selector>"
 * copy with a dark-tuned colour. Nothing in the originals is changed.
 *
 * Run after ANY css change:   npm i postcss && node tools/build-dark.js
 * then bump the ?v= of dark.css in loader.js (DARK_V) and loaderVer in tools/blogger-pages.json.
 */
const fs = require('fs'), path = require('path');
const postcss = require('postcss');
const ROOT = path.join(__dirname, '..');

/* ---------- colour helpers ---------- */
const COLOR_RE = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\([^)]*\)|(?<![-\w])(?:white|black)(?![-\w])/gi;
function parseColor(s) {
  s = s.trim().toLowerCase();
  if (s === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (s === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  if (s[0] === '#') {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
  }
  const m = s.match(/^rgba?\(([^)]*)\)$/);
  if (!m) return null;
  const p = m[1].split(/[\s,\/]+/).filter(Boolean);
  if (p.length < 3) return null;
  const n = v => (v.endsWith('%') ? parseFloat(v) * 2.55 : parseFloat(v));
  let a = 1;
  if (p[3] !== undefined) a = p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
  const c = { r: n(p[0]), g: n(p[1]), b: n(p[2]), a };
  return [c.r, c.g, c.b, c.a].some(isNaN) ? null : c;
}
function toHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}
function fromHsl(h, s, l, a) {
  h = ((h % 360) + 360) % 360 / 360;
  const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  let r, g, b;
  if (s === 0) r = g = b = l;
  else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3); }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
}
const hex = n => n.toString(16).padStart(2, '0');
function fmt(c) {
  if (c.a >= 0.995) return '#' + hex(c.r) + hex(c.g) + hex(c.b);
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + +c.a.toFixed(3) + ')';
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const GREEN = 150; // brand hue: neutrals are tinted slightly green

/* ---------- mappers: light-theme colour -> dark-theme colour ---------- */
function mapBg(c) {
  if (c.a < 0.04) return c;
  const { h, s, l } = toHsl(c);
  let nh = h, ns = s, nl = l;
  if (l >= 0.8) {                       // white / light tints -> deep surfaces (white == --card-bg)
    nl = 0.045 + (l - 0.8) * 0.225;
    if (s < 0.5) { nh = GREEN; ns = 0.18; } else ns = Math.min(s, 0.3);   // greys/slates -> brand-tinted neutrals
  } else if (l >= 0.55) {               // pastels (badges, highlights) -> deep tints
    nl = 0.2 - (l - 0.55) * 0.56;
    if (s < 0.3) { nh = GREEN; ns = 0.2; } else ns = Math.min(s, 0.55) * 0.85;
  } else if (s > 0.25) {                // brand / saturated fills: keep readable on dark
    nl = Math.max(l, 0.34);
  } else return c;                      // dark neutrals stay
  return fromHsl(nh, ns, nl, c.a);
}
function mapFg(c) {
  if (c.a < 0.04) return c;
  const { h, s, l } = toHsl(c);
  if (l >= 0.8) return c;               // white text stays white
  let nl = l < 0.5 ? 0.93 - l * 0.5 : 0.68 - (l - 0.5) * 0.2;
  if (s < 0.3) return fromHsl(GREEN, 0.08, nl, c.a);   // neutral text -> crisp soft green-white
  if (h >= 28 && h <= 62 && s >= 0.3) return fromHsl(GREEN, 0.3, Math.max(nl, 0.78), c.a);  // gold/khaki text -> clean mint (no muddy gold)
  return fromHsl(h, Math.min(s * 0.75, 0.75), nl, c.a);
}
function mapBd(c) {
  if (c.a < 0.04) return c;
  const { h, s, l } = toHsl(c);
  if (l >= 0.6) {
    const nh = s < 0.5 ? GREEN : h;
    return fromHsl(nh, Math.min(s, 0.2), 0.13 + (1 - l) * 0.3, c.a);
  }
  if (s > 0.25) return fromHsl(h, s, Math.max(l, 0.34), c.a);
  return c;
}
const MAPPERS = { bg: mapBg, fg: mapFg, bd: mapBd };

function mapValue(val, fn) {
  let changed = false;
  const v = val.split(/(url\([^)]*\))/).map((part, i) => i % 2 ? part : part.replace(COLOR_RE, m => {
    const c = parseColor(m);
    if (!c) return m;
    const n = fn(c);
    if (fmt(n) === fmt(c)) return m;
    changed = true;
    return fmt(n);
  })).join('');
  return changed ? v : val;
}
function nameClass(n) {
  n = n.toLowerCase();
  if (/(border|line|(^|-)bd(-|$)|divider|sep)/.test(n)) return 'bd';
  if (/(bg|background|card|surface|soft|tint)/.test(n)) return 'bg';
  if (/(text|color|fg|ink|muted)/.test(n)) return 'fg';
  return null;
}
function classify(prop, isRoot) {
  const p = prop.toLowerCase();
  if (p.startsWith('--')) return isRoot ? nameClass(p) : null;
  if (/^background(-color|-image)?$/.test(p)) return 'bg';
  if (/^(color|fill|stroke|caret-color|-webkit-text-fill-color|text-decoration-color)$/.test(p)) return 'fg';
  if (/^(border(-top|-right|-bottom|-left|-block|-inline)?(-color)?|outline(-color)?)$/.test(p)) return 'bd';
  return null;
}

/* ---------- selector prefixing ---------- */
function prefixSel(sel) {
  sel = sel.trim();
  if (!sel) return null;
  if (/^(:root|html)\b/.test(sel)) return sel.replace(/^(:root|html)/, 'html.rc-dark');
  return 'html.rc-dark ' + sel;
}

const HEAD_GRAD = 'linear-gradient(135deg,#f3fff8 0%,#c6f3dc 45%,#7fdcaa 100%)';
const DOC_ZONES = /#(invT|invWM|slipTemplate|slipWM|sPImg|pImg)\b|\.invoice-table|\.trans-container|\.dashed-line/;

/* ---------- walk css ---------- */
function emit(nodes, opts) {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'rule') {
      if (DOC_ZONES.test(n.selector)) continue;   // invoices / slips / report sheets stay light
      const isRoot = /^\s*(:root|html)\s*$/.test(n.selector);
      if (opts.skipRoot && isRoot) continue;
      const decls = [];
      let textClip = false;
      n.each(d => { if (d.type === 'decl' && /^(-webkit-)?background-clip$/i.test(d.prop) && /text/i.test(d.value)) textClip = true; });
      n.each(d => {
        if (d.type !== 'decl') return;
        let cls = classify(d.prop, isRoot);
        if (!cls) return;
        if (cls === 'bg' && textClip) cls = 'fg';   // gradient TEXT: light colours, not dark surfaces
        const nv = (textClip && /^background(-image)?$/i.test(d.prop)) ? HEAD_GRAD : mapValue(d.value, MAPPERS[cls]);
        if (nv !== d.value) decls.push(d.prop + ':' + nv + (d.important ? '!important' : ''));
      });
      if (!decls.length) continue;
      // `background:` shorthand resets background-clip: re-state clip / text-fill so gradient text stays visible
      if (decls.some(x => /^background(-image)?:/.test(x))) {
        n.each(d => {
          if (d.type === 'decl' && /^(-webkit-)?background-clip$|^-webkit-text-fill-color$/i.test(d.prop) && !decls.some(x => x.startsWith(d.prop + ':')))
            decls.push(d.prop + ':' + d.value + (d.important ? '!important' : ''));
        });
      }
      const sels = n.selectors.map(prefixSel).filter(Boolean);
      if (sels.length) out += sels.join(',') + '{' + decls.join(';') + '}\n';
    } else if (n.type === 'atrule') {
      if (/^(media|supports|layer)$/i.test(n.name) && n.nodes) {
        if (/print/i.test(n.params)) continue;       // never theme print styles
        const inner = emit(n.nodes, opts);
        if (inner) out += '@' + n.name + ' ' + n.params + '{\n' + inner + '}\n';
      }
    }
  }
  return out;
}

const sources = [];
for (const f of ['common.css', 'monthly-report.css', 'myreport.css']) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) sources.push({ name: f, css: fs.readFileSync(p, 'utf8'), skipRoot: f === 'common.css' });
}
for (const f of fs.readdirSync(path.join(ROOT, 'pages')).filter(x => x.endsWith('.html')).sort()) {
  const t = fs.readFileSync(path.join(ROOT, 'pages', f), 'utf8');
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi; let m, i = 0;
  while ((m = re.exec(t))) sources.push({ name: 'pages/' + f + '#' + (++i), css: m[1], skipRoot: false });
}

/* ---------- hand-tuned palette (premium dark: deep green-tinted neutrals + gold accent) ---------- */
const PALETTE = `
html.rc-dark{color-scheme:dark;background:#0a0f0d;
--primary:#268a5e;--primary-dark:#1c6f4a;--primary-light:#15291f;--accent:#7fdcaa;--accent-light:#14261c;
--danger:#f26b6b;--danger-light:#3b1b1d;--info:#38b6f0;--info-light:#0f2b3a;--success:#3fcf7a;--warning:#f2b134;--warning-light:#33280e;
--bg:#0a0f0d;--card-bg:#131b17;--border:#243029;--border-light:#1c2722;
--text-main:#eef3f0;--text-sub:#bccbc3;--text-muted:#8a9c93;
--shadow-card:0 0 0 1px rgba(138,212,172,.08),0 4px 14px rgba(0,0,0,.45);--shadow-pop:0 0 0 1px rgba(138,212,172,.1),0 12px 32px rgba(0,0,0,.65);
--primary-color:#8fe0b4;--text-color:#eef3f0;--bg-color:#0a0f0d;--line:#243029;--bg-soft:#17201c;--muted-2:#82958b;--line-soft:#2b3a32;
--text-slate:#cad6cf;--text-dark:#eef3f0;--text-mid:#aebdb5;--green-dark:#5fe39b}
`.replace('#8399 8c', '#83998c');

const EXTRAS = `
html.rc-dark body{background:var(--bg);color:var(--text-main)}
html.rc-dark .body-fauxcolumn-outer,html.rc-dark .body-fauxcolumns,html.rc-dark .fauxcolumn-outer,html.rc-dark .content-outer,html.rc-dark .content-inner,html.rc-dark .main-outer,html.rc-dark .main-inner,html.rc-dark .header-outer,html.rc-dark .header-inner,html.rc-dark .header-wrapper,html.rc-dark .tabs-outer,html.rc-dark .tabs-inner,html.rc-dark .columns-inner,html.rc-dark .column-center-outer,html.rc-dark .column-center-inner,html.rc-dark .region-inner,html.rc-dark .Header{background:transparent!important;border-color:transparent!important}
html.rc-dark #invT,html.rc-dark #slipTemplate{color:#111827;color-scheme:light}
html.rc-dark ::selection{background:rgba(43,148,104,.4)}
html.rc-dark ::placeholder{color:#6f867a;opacity:1}
html.rc-dark input,html.rc-dark select,html.rc-dark textarea{background-color:#0e1511;color:var(--text-main);border-color:#2a3830}
html.rc-dark option{background:#131b17;color:#e6efe9}
html.rc-dark img{filter:brightness(.9)}
html.rc-dark #rc-side .rc-sd-f{border-top-color:#1c2722;color:#d4e3da}
html.rc-dark .rc-sd-sl{background:#33493d}
html.rc-dark .rc-sd-sw input:checked+.rc-sd-sl{background:#268a5e}
html.rc-dark #rc-side-scrim{background:rgba(0,0,0,.6)}
html.rc-dark #rc-bnav .rc-bn-i.on .rc-bn-p{background:#1b3a2b}
html.rc-dark #rc-bnav .rc-bn-i.on{color:#8ad4ac}
html.rc-dark #rc-side .rc-sd-i.on{background:#173126}
html.rc-dark #rc-bnav.ed .rc-bn-i:not(.rc-home) .rc-bn-pen{background:#111d17 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238ad4ac' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z'/%3E%3C/svg%3E") center/9px 9px no-repeat;border-color:rgba(138,212,172,.35)}
`;

let body = '';
for (const s of sources) {
  let root;
  try { root = postcss.parse(s.css); } catch (e) { console.error('skip (parse error):', s.name, e.message); continue; }
  const o = emit(root.nodes, { skipRoot: s.skipRoot });
  if (o) body += '/* ' + s.name + ' */\n' + o;
}
const out = '/* AUTO-GENERATED by tools/build-dark.js - do not edit by hand */\n@media screen{\n' + PALETTE.trim() + '\n' + body + EXTRAS.trim() + '\n}\n';
postcss.parse(out); // sanity: must be valid css
fs.writeFileSync(path.join(ROOT, 'dark.css'), out);
console.log('dark.css written:', out.length, 'bytes from', sources.length, 'sources');
