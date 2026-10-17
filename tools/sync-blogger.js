// Builds each enabled page as inline HTML (+ its own scripts) and pushes it to its Blogger page. No loader.
// Usage: node tools/sync-blogger.js [--dry]   (--dry only writes dist/*.html, no network)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "blogger-pages.json"), "utf8"));
const dry = process.argv.includes("--dry");
const esc = s => JSON.stringify(s).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

const EARLY = '<script>!function(){try{var c=JSON.parse(localStorage.getItem("rcLT:"+location.pathname)||"null");c=c||{};var r=document.getElementById("rc-app")||document,q=function(s){return[].slice.call(r.querySelectorAll(s))};q("[data-l]").forEach(function(e){var v=c.l&&c.l[e.getAttribute("data-l")];"string"==typeof v&&(e.textContent=v)});q("[data-lp]").forEach(function(e){var v=c.p&&c.p[e.getAttribute("data-lp")];"string"==typeof v&&(e.placeholder=v)});c.i&&q(".lb-sw").forEach(function(e){e.textContent=c.i[0];e.style.display=c.i[1]?"none":""});if(c.s){var s=document.createElement("style");s.id="rc-lstyle";s.textContent=c.s;document.head.appendChild(s)}var t=document.getElementById("ti");t&&c.t&&(t.textContent=c.t)}catch(e){}try{var t=document.getElementById("ti"),v=localStorage.getItem("rcTi");t&&v&&(t.textContent=v)}catch(e){}}()</script>';


// Pre-paint script: draws the bottom bar + burger button from cache BEFORE the first frame, so they never "pop in".
// common.js (RC-SHELL block) adopts these elements afterwards and keeps them up to date. Icons/burger come from common.js (single source).
function shellSource() {
  const c = fs.readFileSync(path.join(root, "common.js"), "utf8");
  const icons = /var ICONS = (\{[\s\S]*?\});\n/.exec(c), burger = /var BURGER = '([^']*)';/.exec(c);
  if (!icons || !burger) throw new Error("RC-SHELL constants (ICONS / BURGER) not found in common.js");
  return { icons: icons[1], burger: burger[1] };
}
function pre(p, html) {
  if (/^(login|sign-up|signup)$/.test(p.slug) || /data-rc-hide-chrome/.test(html)) return "";
  const { icons, burger } = shellSource();
  const js = `!function(){try{var m=/\\/p\\/([\\w-]+)\\.html/.exec(location.pathname),cur=m?m[1]:"";if(document.getElementById("rc-bnav"))return;var I=${icons},S="https://rahcare.blogspot.com/p/",ls=localStorage,` +
    `ic=function(k,z){return'<svg viewBox="0 0 24 24" width="'+z+'" height="'+z+'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(I[k]||I.other)+"</svg>"},h=ls.getItem("rcBarH");` +
    `if(!h){var add=ls.getItem("rcAdd")||"";if(!add){var mt=ls.getItem("mgmtType");mt&&(add="Add "+mt.charAt(0).toUpperCase()+mt.slice(1).toLowerCase())}` +
    `var one=function(k,t,s){return'<a class="rc-bn-i'+("dashboard"===k?" rc-home":"")+'" role="link" data-u="'+S+k+'.html"'+(s?' data-s="'+s+'"':"")+'><span class="rc-bn-p">'+ic(k,24)+(s?'<i class="rc-bn-pen"></i>':"")+'</span><span class="rc-bn-l">'+t+"</span></a>"};` +
    `h=one("appointment",add||"Add Patient","l")+one("dashboard","Home","")+one("accounts","Accounts","r")}` +
    `var b=document.createElement("nav");b.id="rc-bnav";b.setAttribute("data-pre","1");b.innerHTML=h;` +
    `[].forEach.call(b.querySelectorAll("a[data-u]"),function(a){cur&&a.getAttribute("data-u").indexOf("/p/"+cur+".html")>-1&&a.classList.add("on")});` +
    `["appointment","billing","dashboard"].some(function(k){return"1"===ls.getItem("rc_edit_"+k)})&&b.classList.add("ed");document.body.appendChild(b);` +
    `var g=document.createElement("button");g.id="rc-burger";g.type="button";g.setAttribute("aria-label","Menu");g.setAttribute("data-pre","1");g.innerHTML='${burger}';` +
    `(document.querySelector(".header-wrapper")||document.body).appendChild(g);document.body.classList.add("rc-has-nav","rc-hide-topnav")}catch(e){}}()`;
  return "<script>" + js + "</script>";
}

function build(p) {
  const html = fs.readFileSync(path.join(root, "pages", p.page + ".html"), "utf8");
  // Split into static markup (painted together with Blogger's own header) and scripts (run in original order).
  // Everything shared (menu, sidebar, bottom bar, dark mode, fonts) lives in common.js / common.css - no loader any more.
  const scripts = [];
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => { scripts.push(m); return ""; });
  return `<div id="rc-app">${markup}</div>\n` + EARLY + "\n" + pre(p, html) + "\n" + scripts.join("\n");
}

async function token() {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.BLOGGER_CLIENT_ID,
      client_secret: process.env.BLOGGER_CLIENT_SECRET,
      refresh_token: process.env.BLOGGER_REFRESH_TOKEN,
      grant_type: "refresh_token"
    })
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("token error: " + JSON.stringify(j));
  return j.access_token;
}

(async () => {
  const list = cfg.pages.filter(p => p.enabled);
  fs.mkdirSync(path.join(root, "dist"), { recursive: true });
  list.forEach(p => fs.writeFileSync(path.join(root, "dist", p.slug + ".html"), build(p)));
  if (dry) return console.log("dry run: built", list.map(p => p.slug).join(", "));
  const at = await token(), H = { Authorization: "Bearer " + at };
  fs.mkdirSync(path.join(root, "backup"), { recursive: true });
  // pages without an "id" are looked up by their address (/p/<slug>.html); if the Blogger page does not exist yet it is created first
  if (list.some(p => !p.id)) {
    const pl = await (await fetch(`https://www.googleapis.com/blogger/v3/blogs/${cfg.blogId}/pages?maxResults=500&fetchBodies=false&status=live&status=draft`, { headers: H })).json();
    if (pl.error) throw new Error("page list: " + JSON.stringify(pl.error));
    for (const p of list.filter(x => !x.id)) {
      const found = (pl.items || []).find(i => (i.url || "").endsWith("/p/" + p.slug + ".html"));
      if (found) { p.id = found.id; console.log(p.slug, "found on Blogger:", found.id); continue; }
      const cr = await (await fetch(`https://www.googleapis.com/blogger/v3/blogs/${cfg.blogId}/pages`, { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ title: p.title || p.slug, content: "<p>…</p>" }) })).json();
      if (cr.error) throw new Error(p.slug + " create: " + JSON.stringify(cr.error));
      p.id = cr.id; console.log(p.slug, "created on Blogger:", cr.id, cr.url);
      if (!(cr.url || "").endsWith("/p/" + p.slug + ".html")) console.warn("WARNING: Blogger address is", cr.url, "- expected /p/" + p.slug + ".html (rename the page / change its permalink)");
    }
  }
  for (const p of list) {
    const url = `https://www.googleapis.com/blogger/v3/blogs/${cfg.blogId}/pages/${p.id}`;
    const cur = await (await fetch(url, { headers: H })).json();
    if (cur.error) throw new Error(p.slug + " read: " + JSON.stringify(cur.error));
    fs.writeFileSync(path.join(root, "backup", p.slug + ".html"), cur.content || "");
    const content = build(p);
    if (cur.content === content) { console.log(p.slug, "unchanged"); continue; }
    const r = await fetch(url, { method: "PATCH", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    const j = await r.json();
    if (j.error) throw new Error(p.slug + " write: " + JSON.stringify(j.error));
    console.log(p.slug, "updated", content.length, "bytes");
  }
})().catch(e => { console.error(e.message); process.exit(1); });
