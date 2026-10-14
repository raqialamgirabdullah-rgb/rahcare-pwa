// Builds each enabled page as inline HTML (+ its own scripts) and pushes it to its Blogger page. No loader.
// Usage: node tools/sync-blogger.js [--dry]   (--dry only writes dist/*.html, no network)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "blogger-pages.json"), "utf8"));
const dry = process.argv.includes("--dry");
const esc = s => JSON.stringify(s).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

const EARLY = '<script>!function(){try{var c=JSON.parse(localStorage.getItem("rcLT:"+location.pathname)||"null");c=c||{};var r=document.getElementById("rc-app")||document,q=function(s){return[].slice.call(r.querySelectorAll(s))};q("[data-l]").forEach(function(e){var v=c.l&&c.l[e.getAttribute("data-l")];"string"==typeof v&&(e.textContent=v)});q("[data-lp]").forEach(function(e){var v=c.p&&c.p[e.getAttribute("data-lp")];"string"==typeof v&&(e.placeholder=v)});c.i&&q(".lb-sw").forEach(function(e){e.textContent=c.i[0];e.style.display=c.i[1]?"none":""});if(c.s){var s=document.createElement("style");s.id="rc-lstyle";s.textContent=c.s;document.head.appendChild(s)}var t=document.getElementById("ti");t&&c.t&&(t.textContent=c.t)}catch(e){}try{var t=document.getElementById("ti"),v=localStorage.getItem("rcTi");t&&v&&(t.textContent=v)}catch(e){}}()</script>';

function build(p) {
  const html = fs.readFileSync(path.join(root, "pages", p.page + ".html"), "utf8");
  // Split into static markup (painted together with Blogger's own header) and scripts (run in original order).
  // Everything shared (menu, sidebar, bottom bar, dark mode, fonts) lives in common.js / common.css - no loader any more.
  const scripts = [];
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => { scripts.push(m); return ""; });
  return `<div id="rc-app">${markup}</div>\n` + EARLY + "\n" + scripts.join("\n");
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
