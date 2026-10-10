/* RahCare page loader
   Blogger পেজে শুধু এই ফাইলের লিংক থাকে। আসল পেজ রিপোর pages/ ফোল্ডার থেকে আসে।
   টেস্ট করতে: Blogger পেজের লিংকের শেষে ?rcbeta=1 দিলে ওই ব্রাউজারে beta/ ফোল্ডারের পেজ চলে। বন্ধ করতে ?rcbeta=0 */
(function () {
  var cs = document.currentScript;
  if (!cs) return;
  /* Install-App প্রম্পট দেরিতে ধরা পড়লে হারিয়ে যায়, তাই লোডারই সবার আগে ধরে রাখে */
  try { addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.__bip = e; dispatchEvent(new Event("bip")); }); } catch (e) {}
  var name = cs.getAttribute("data-page");
  var base = cs.src.replace(/[^\/]*$/, "");
  var beta = false;
  try {
    if (localStorage.getItem("rcBetaReset") !== "1") { localStorage.removeItem("rcBeta"); localStorage.setItem("rcBetaReset", "1"); }
    var q = new URLSearchParams(location.search).get("rcbeta");
    if (q === "1") localStorage.setItem("rcBeta", "1");
    if (q === "0") localStorage.removeItem("rcBeta");
    beta = localStorage.getItem("rcBeta") === "1";
  } catch (e) {}

  var host = document.createElement("div");
  host.id = "rc-app";
  cs.parentNode.insertBefore(host, cs);

  function fail() {
    host.innerHTML = '<div style="padding:28px 16px;text-align:center;font-family:sans-serif;color:#b91c1c">পেজ লোড করা যায়নি। ইন্টারনেট দেখে পেজটি রিফ্রেশ করুন।</div>';
  }
  function run(old) {
    return new Promise(function (res) {
      var n = document.createElement("script");
      if (old.type) n.type = old.type;
      if (old.src) {
        n.src = old.src;
        n.async = false;
        var done = false, fin = function () { if (!done) { done = true; res(); } };
        n.onload = n.onerror = fin;
        setTimeout(fin, 8000);
        document.head.appendChild(n);
      } else {
        n.textContent = old.textContent;
        document.body.appendChild(n);
        res();
      }
    });
  }

  /* নিচের নেভিগেশন বার (মোবাইল অ্যাপের মতো): মেনু-লিংকগুলো ব্লগারের নিজের নেভ থেকে নেওয়া হয়, তাই URL আলাদা করে লিখতে হয় না */
  var NAV_PAGES = { dashboard: 1, appointment: 1, billing: 1, accounts: 1, profile: 1 };
  var NAV_ITEMS = [
    ["dashboard", "Home", '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'],
    ["appointment", "Add Patient", '<circle cx="10" cy="8" r="3.6"/><path d="M3.5 20c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6"/><path d="M19 8v6M16 11h6"/>'],
    ["billing", "Billing", '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9.5 8.5h5M9.5 12h5"/>'],
    ["accounts", "Accounts", '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5z"/><path d="M19 9.5h-4a2 2 0 0 0 0 4h4"/>'],
    ["profile", "Profile", '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6"/>']
  ];
  function buildNav(page) {
    try {
      if (!NAV_PAGES[page] || document.getElementById("rc-bnav")) return;
      var found = {};
      [].slice.call(document.querySelectorAll('a[href*="/p/"]')).forEach(function (a) {
        if (a.closest("#rc-app") || a.closest("#rc-bnav")) return;
        var m = /\/p\/([\w-]+)\.html/.exec(a.getAttribute("href") || "");
        if (m && !found[m[1]]) found[m[1]] = { href: a.href, text: (a.textContent || "").replace(/\s+/g, " ").trim() };
      });
      var html = "";
      NAV_ITEMS.forEach(function (it) {
        var f = found[it[0]];
        if (!f && it[0] !== "dashboard" && it[0] !== "appointment" && it[0] !== "billing") return;
        var href = f ? f.href : "https://rahcare.blogspot.com/p/" + it[0] + ".html";
        var label = it[0] === "dashboard" ? it[1] : (f && f.text && f.text.length < 18 ? f.text : it[1]);
        html += '<a class="rc-bn-i' + (it[0] === page ? " on" : "") + '" href="' + href + '"><span class="rc-bn-p"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + it[2] + '</svg></span><span class="rc-bn-l">' + label + "</span></a>";
      });
      if (!html) return;
      var nav = document.createElement("nav");
      nav.id = "rc-bnav";
      nav.innerHTML = html;
      document.body.appendChild(nav);
      document.body.classList.add("rc-has-nav");
    } catch (e) { console.error("RahCare nav:", e); }
  }

  fetch(base + (beta ? "beta/" : "pages/") + name + ".html", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(async function (html) {
      var d = new DOMParser().parseFromString(html, "text/html");
      var nodes = [].slice.call(d.head.children).concat([].slice.call(d.body.children));
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i], t = el.tagName;
        if (t === "SCRIPT") await run(el);
        else if (t === "LINK" || t === "STYLE") document.head.appendChild(document.importNode(el, true));
        else host.appendChild(document.importNode(el, true));
      }
      buildNav(name);
      if (beta) {
        var b = document.createElement("div");
        b.textContent = "BETA";
        b.title = "বিটা বন্ধ করতে চাপুন";
        b.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:99999;background:#dc2626;color:#fff;font:700 11px sans-serif;padding:3px 8px;border-radius:10px;cursor:pointer;opacity:.85";
        b.onclick = function () { try { localStorage.removeItem("rcBeta"); } catch (e) {} location.reload(); };
        document.body.appendChild(b);
      }
    })
    .catch(function (e) { console.error("RahCare loader:", e); fail(); });
})();
