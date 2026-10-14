#!/usr/bin/env node
/*
 * Dark theme generator.
 * Reads the site's own CSS (common.css, report css, and every <style> in pages/*.html)
 * and writes dark.css: for each rule that sets a light colour, a "html.rc-dark <selector>"
 * copy with a dark-tuned colour. Nothing in the originals is changed.
 *
 * Run after ANY css change:   npm i postcss && node tools/build-dark.js
 * then bump the ?v= of dark.css (DARK_CSS in the RC-SHELL block of common.js) and the common.js ?v= in pages/*.html.
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
const NH = 40, NS = 0.05;   // warm neutral grey (no colour cast)
const SAGE = 150;           // soft sage, used only for brand-coloured text

/* brand green (forest greens) is removed from dark mode: surfaces/borders/text become neutral */
const isBrand = (h, s, l) => h >= 135 && h <= 175 && s > 0.3 && l < 0.42;
const BRAND_VARS = ['primary-dark', 'primary-light', 'primary-color', 'primary', 'accent-light', 'accent', 'green-dark'];
const BRAND_REPL = {
  bg: { primary: '#3a3935', 'primary-dark': '#46453f', 'primary-color': '#3a3935', accent: '#3a3935', 'green-dark': '#3a3935', 'primary-light': '#2d2c2a', 'accent-light': '#2d2c2a' },
  fg: { primary: '#e7e4dc', 'primary-dark': '#e7e4dc', 'primary-color': '#e7e4dc', accent: '#d6d2c9', 'green-dark': '#d6d2c9', 'primary-light': '#d6d2c9', 'accent-light': '#d6d2c9' },
  bd: { primary: 'rgba(255,255,255,.16)', 'primary-dark': 'rgba(255,255,255,.16)', 'primary-color': 'rgba(255,255,255,.16)', accent: 'rgba(255,255,255,.14)', 'green-dark': 'rgba(255,255,255,.14)', 'primary-light': 'rgba(255,255,255,.08)', 'accent-light': 'rgba(255,255,255,.08)' }
};
function replaceBrandVars(val, cls) {
  const tbl = BRAND_REPL[cls]; if (!tbl) return val;
  let out = '', i = 0;
  while (i < val.length) {
    const m = val.slice(i, i + 40).match(/^var\(\s*--([a-z-]+)/);
    if (m && BRAND_VARS.includes(m[1])) {
      let depth = 0, j = i;
      for (; j < val.length; j++) { if (val[j] === '(') depth++; else if (val[j] === ')') { depth--; if (depth === 0) break; } }
      out += tbl[m[1]]; i = j + 1; continue;
    }
    out += val[i++];
  }
  return out;
}

/* ---------- mappers: light-theme colour -> dark-theme colour ---------- */
function mapBg(c) {
  if (c.a < 0.04) return c;
  const { h, s, l } = toHsl(c);
  if (isBrand(h, s, l)) return c.a < 0.995 ? { r: 255, g: 255, b: 255, a: Math.min(c.a, 0.06) } : fromHsl(NH, 0.04, 0.24, c.a);
  let nh = h, ns = s, nl = l;
  if (l >= 0.8) {                       // white / light tints -> neutral charcoal surfaces (white == --card-bg)
    nl = 0.075 + (l - 0.8) * 0.325;
    if (s < 0.5) { nh = NH; ns = NS; } else ns = Math.min(s, 0.3);   // greys / slates / mint tints -> neutral
  } else if (l >= 0.55) {               // pastels (badges, highlights) -> deep tints
    nl = 0.2 - (l - 0.55) * 0.56;
    if (s < 0.3) { nh = NH; ns = NS; } else ns = Math.min(s, 0.55) * 0.85;
  } else if (s > 0.25) {                // brand / saturated fills: keep readable on dark
    nl = Math.max(l, 0.34);
  } else return c;                      // dark neutrals stay
  return fromHsl(nh, ns, nl, c.a);
}
function mapFg(c) {
  if (c.a < 0.04) return c;
  const { h, s, l } = toHsl(c);
  if (l >= 0.8) return c;               // white text stays white
  if (isBrand(h, s, l)) return fromHsl(NH, 0.05, 0.88, c.a);
  let nl = l < 0.5 ? 0.91 - l * 0.5 : 0.66 - (l - 0.5) * 0.2;
  if (s < 0.3) return fromHsl(NH, NS, nl, c.a);   // neutral text -> soft warm off-white
  if (h >= 28 && h <= 62 && s >= 0.3) return fromHsl(SAGE, 0.3, Math.max(nl, 0.74), c.a);  // gold/khaki text -> clean sage (no muddy gold)
  return fromHsl(h, Math.min(s * 0.75, 0.75), nl, c.a);
}
function mapSh(c) {
  const { h, s, l } = toHsl(c);
  return isBrand(h, s, l) ? { r: 0, g: 0, b: 0, a: Math.min(0.6, c.a * 2) } : c;
}
function mapBd(c) {
  if (c.a < 0.04) return c;
  const { h, s, l } = toHsl(c);
  if (isBrand(h, s, l)) return c.a < 0.995 ? { r: 255, g: 255, b: 255, a: Math.min(c.a, 0.14) } : fromHsl(NH, 0.04, 0.26, 1);
  if (l >= 0.6) {
    if (s < 0.5) return fromHsl(NH, NS + 0.01, 0.15 + (1 - l) * 0.25, c.a);   // neutral hairlines
    return fromHsl(h, Math.min(s, 0.2), 0.15 + (1 - l) * 0.25, c.a);
  }
  if (s > 0.25) return fromHsl(h, s, Math.max(l, 0.34), c.a);
  return c;
}
const MAPPERS = { bg: mapBg, fg: mapFg, bd: mapBd, sh: mapSh };

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
  if (/^(box-shadow|text-shadow)$/.test(p)) return 'sh';
  return null;
}

/* ---------- selector prefixing ---------- */
function prefixSel(sel) {
  sel = sel.trim();
  if (!sel) return null;
  if (/^(:root|html)\b/.test(sel)) return sel.replace(/^(:root|html)/, 'html.rc-dark');
  return 'html.rc-dark ' + sel;
}

const HEAD_GRAD = 'linear-gradient(135deg,#faf8f3 0%,#e6e2d9 100%)';
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
        const nv = (textClip && /^background(-image)?$/i.test(d.prop)) ? HEAD_GRAD : mapValue(replaceBrandVars(d.value, cls), MAPPERS[cls]);
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
html.rc-dark{color-scheme:dark;background:#171715;
--primary:#e7e4dc;--primary-dark:#d6d2c9;--primary-light:#2d2c2a;--accent:#d6d2c9;--accent-light:#2d2c2a;
--danger:#f07178;--danger-light:#3a2224;--info:#5bb8e8;--info-light:#1d2a33;--success:#4cc58a;--warning:#e8b04a;--warning-light:#332b1a;
--bg:#171715;--card-bg:#252422;--border:#343432;--border-light:#2b2b29;
--text-main:#ece9e2;--text-sub:#c4c0b7;--text-muted:#8f8c85;
--shadow-card:0 0 0 1px rgba(255,255,255,.05),0 4px 14px rgba(0,0,0,.35);--shadow-pop:0 0 0 1px rgba(255,255,255,.07),0 12px 32px rgba(0,0,0,.55);
--primary-color:#e7e4dc;--text-color:#ece9e2;--bg-color:#171715;--line:#343432;--bg-soft:#1c1c1a;--muted-2:#8f8c85;--line-soft:#3d3d3a;
--text-slate:#d0ccc3;--text-dark:#ece9e2;--text-mid:#b3afa6;--green-dark:#d6d2c9}
`;

const EXTRAS = `
html.rc-dark body{background:var(--bg);color:var(--text-main)}
html.rc-dark .body-fauxcolumn-outer,html.rc-dark .body-fauxcolumns,html.rc-dark .fauxcolumn-outer,html.rc-dark .content-outer,html.rc-dark .content-inner,html.rc-dark .main-outer,html.rc-dark .main-inner,html.rc-dark .header-outer,html.rc-dark .header-inner,html.rc-dark .header-wrapper,html.rc-dark .tabs-outer,html.rc-dark .tabs-inner,html.rc-dark .columns-inner,html.rc-dark .column-center-outer,html.rc-dark .column-center-inner,html.rc-dark .region-inner,html.rc-dark .Header{background:transparent!important;border-color:transparent!important}
html.rc-dark #invT,html.rc-dark #slipTemplate{color:#111827;color-scheme:light}
html.rc-dark ::selection{background:rgba(255,255,255,.18)}
html.rc-dark ::placeholder{color:#8a8780;opacity:1}
html.rc-dark input,html.rc-dark select,html.rc-dark textarea{background-color:#1c1c1a;color:var(--text-main);border-color:#3a3a37}
html.rc-dark option{background:#242422;color:#ece9e2}
html.rc-dark img{filter:brightness(.92)}
html.rc-dark #rc-side .rc-sd-f{border-top-color:#2e2e2c;color:#d6d2c9}
html.rc-dark .rc-sd-sl{background:#3d3d3a}
html.rc-dark .rc-sd-sw input:checked+.rc-sd-sl{background:#8a877f}
html.rc-dark #rc-side-scrim{background:rgba(0,0,0,.6)}
html.rc-dark #rc-bnav .rc-bn-i.on .rc-bn-p{background:#34332f}
html.rc-dark #rc-bnav .rc-bn-i.on{color:#ece9e2}
html.rc-dark #rc-side .rc-sd-i.on{background:#2f2e2b}
html.rc-dark #rc-bnav.ed .rc-bn-i:not(.rc-home) .rc-bn-pen{background:#242422 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e7e4dc' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z'/%3E%3C/svg%3E") center/9px 9px no-repeat;border-color:rgba(255,255,255,.2)}
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
