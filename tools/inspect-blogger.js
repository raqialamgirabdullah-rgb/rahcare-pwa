// One-off, READ-ONLY: fetches every Blogger page by id and writes reports/blogger-inspect.json
// (loader references, external scripts, imported common.js versions). Never writes to Blogger.
const fs = require("fs"), path = require("path");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "blogger-pages.json"), "utf8"));
const extra = [
  ["prescription", "2300373295904001575"], ["response-diagnosis", "8953213167542803474"],
  ["logo", "7321200216496606751"], ["invoice-mapper", "5083990105748298429"]
];
const pages = cfg.pages.map(p => [p.slug, p.id, true]).concat(extra.map(e => [e[0], e[1], false]));
(async () => {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.BLOGGER_CLIENT_ID, client_secret: process.env.BLOGGER_CLIENT_SECRET, refresh_token: process.env.BLOGGER_REFRESH_TOKEN, grant_type: "refresh_token" })
  });
  const tk = (await r.json()).access_token;
  if (!tk) throw new Error("no token");
  const out = [];
  for (const [slug, id, synced] of pages) {
    const j = await (await fetch(`https://www.googleapis.com/blogger/v3/blogs/${cfg.blogId}/pages/${id}?fields=id,title,url,content`, { headers: { Authorization: "Bearer " + tk } })).json();
    if (j.error) { out.push({ slug, id, synced, error: j.error.message }); continue; }
    const c = j.content || "";
    const uniq = a => [...new Set(a)];
    out.push({
      slug, id, synced, title: j.title, url: j.url, length: c.length,
      loaderRefs: uniq(c.match(/[^"'\s=]*loader\.js[^"'\s>]*/g) || []),
      hasRcHtml: c.includes("__RC_HTML"), hasRcApp: c.includes('id="rc-app"'), hasEarlyScript: c.includes("rcLT:"),
      scriptSrcs: uniq([...c.matchAll(/<script[^>]*\ssrc=["']([^"']+)/g)].map(m => m[1])),
      moduleImports: uniq([...c.matchAll(/from\s*["'](https:\/\/[^"']+\.js[^"']*)["']/g)].map(m => m[1])),
      head: c.slice(0, 260)
    });
  }
  fs.mkdirSync(path.join(__dirname, "..", "reports"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "..", "reports", "blogger-inspect.json"), JSON.stringify(out, null, 2));
  console.log("inspected", out.length);
})().catch(e => { console.error(e.message); process.exit(1); });
