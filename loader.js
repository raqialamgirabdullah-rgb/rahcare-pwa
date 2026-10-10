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

  /* নিচের নেভিগেশন বার (শুধু Home ও Profile) + ডান পাশে থ্রি-লাইন বাটন যা মেনুকে সাইডবার হিসেবে খোলে।
     সাইডবারের লিংক ব্লগারের নিজের মেনু থেকে নেওয়া হয় (খোলার সময়), তাই URL/নাম আলাদা করে লিখতে হয় না। */
  var NAV_PAGES = { dashboard: 1, appointment: 1, billing: 1, accounts: 1, profile: 1 };
  var IC = {
    dashboard: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    appointment: '<circle cx="10" cy="8" r="3.6"/><path d="M3.5 20c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6"/><path d="M19 8v6M16 11h6"/>',
    billing: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9.5 8.5h5M9.5 12h5"/>',
    accounts: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5z"/><path d="M19 9.5h-4a2 2 0 0 0 0 4h4"/>',
    profile: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6"/>',
    other: '<circle cx="12" cy="12" r="3.2"/>'
  };
  function svg(inner, size) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  }
  function cleanText(el) {
    var c = el.cloneNode(true);
    [].slice.call(c.querySelectorAll(".lb-ed,.ed-only,.lb-sw,svg,script,style")).forEach(function (x) { x.remove(); });
    return (c.textContent || "").replace(/[✎+]/g, "").replace(/\s+/g, " ").trim();
  }
  function collectLinks() {
    var out = [], seen = {};
    function add(href, text) {
      if (!href || !text || text.length > 40 || /^(javascript:|#)/i.test(href)) return;
      var u; try { u = new URL(href, location.href); } catch (e) { return; }
      if (/\/p\/(login|sign-up|signup)\.html$/.test(u.pathname)) return;
      var key = u.pathname.replace(/\/$/, "") || "/";
      if (seen[key]) return; seen[key] = 1;
      var m = /\/p\/([\w-]+)\.html/.exec(u.pathname);
      out.push({ href: u.href, text: text, path: key, slug: m ? m[1] : "" });
    }
    var q = '.nav-wrapper a[href],#PageList1 a[href],.main-navigation a[href],.menu a[href],.nav-menu a[href],.nav-bar a[href],a[href*="/p/"]';
    [].slice.call(document.querySelectorAll(q)).forEach(function (a) {
      if (a.closest("#rc-app") || a.closest("#rc-bnav") || a.closest("#rc-side") || a.id === "rc-burger") return;
      add(a.href, cleanText(a));
    });
    [].slice.call(document.querySelectorAll(".nav-wrapper option[value],#PageList1 option[value]")).forEach(function (o) { add(o.value, cleanText(o)); });
    return out;
  }
  function buildNav(page) {
    try {
      if (!NAV_PAGES[page] || document.getElementById("rc-bnav")) return;
      var found = {};
      collectLinks().forEach(function (l) { if (l.slug && !found[l.slug]) found[l.slug] = l; });
      var tabs = [["dashboard", "Home"], ["profile", "Profile"]], html = "";
      tabs.forEach(function (it) {
        var f = found[it[0]];
        var href = f ? f.href : "https://rahcare.blogspot.com/p/" + it[0] + ".html";
        var label = it[0] === "dashboard" ? it[1] : (f && f.text.length < 14 ? f.text : it[1]);
        html += '<a class="rc-bn-i' + (it[0] === page ? " on" : "") + '" href="' + href + '"><span class="rc-bn-p">' + svg(IC[it[0]], 24) + '</span><span class="rc-bn-l">' + label + "</span></a>";
      });
      var nav = document.createElement("nav");
      nav.id = "rc-bnav";
      nav.innerHTML = html;
      document.body.appendChild(nav);

      var burger = document.createElement("button");
      burger.id = "rc-burger"; burger.type = "button"; burger.setAttribute("aria-label", "Menu");
      burger.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6.5h16M4 12h16M4 17.5h16"/></svg>';
      var scrim = document.createElement("div"); scrim.id = "rc-side-scrim";
      var side = document.createElement("aside");
      side.id = "rc-side"; side.setAttribute("aria-hidden", "true");
      side.innerHTML = '<div class="rc-sd-h"><span class="rc-sd-t">Rah Care</span><button type="button" class="rc-sd-x" aria-label="Close">&times;</button></div><div class="rc-sd-l"></div>';
      document.body.appendChild(burger); document.body.appendChild(scrim); document.body.appendChild(side);
      document.body.classList.add("rc-has-nav", "rc-hide-topnav");

      var list = side.querySelector(".rc-sd-l");
      function render() {
        list.innerHTML = "";
        var here = location.pathname.replace(/\/$/, "") || "/";
        collectLinks().forEach(function (l) {
          var a = document.createElement("a");
          a.className = "rc-sd-i" + (l.path === here ? " on" : "");
          a.href = l.href;
          var ic = document.createElement("span"); ic.className = "rc-sd-ic"; ic.innerHTML = svg(IC[l.slug] || IC.other, 22);
          var tx = document.createElement("span"); tx.className = "rc-sd-tx"; tx.textContent = l.text;
          a.appendChild(ic); a.appendChild(tx);
          list.appendChild(a);
        });
      }
      function open() { render(); document.body.classList.add("rc-side-open"); side.setAttribute("aria-hidden", "false"); }
      function close() { document.body.classList.remove("rc-side-open"); side.setAttribute("aria-hidden", "true"); }
      burger.onclick = open; scrim.onclick = close;
      side.querySelector(".rc-sd-x").onclick = close;
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    } catch (e) { console.error("RahCare nav:", e); }
  }

  /* স্পিড: পেজের HTML আসার অপেক্ষায় না থেকে Firebase ও common.js আগেই ডাউনলোড শুরু */
  function hint(rel, href, crossorigin) {
    try {
      var l = document.createElement("link");
      l.rel = rel; l.href = href;
      if (crossorigin) l.crossOrigin = "";
      document.head.appendChild(l);
    } catch (e) {}
  }
  hint("preconnect", "https://www.gstatic.com", true);
  hint("preconnect", "https://firestore.googleapis.com", true);
  hint("preconnect", "https://securetoken.googleapis.com", true);
  ["firebase-app", "firebase-auth", "firebase-firestore"].forEach(function (n) {
    hint("modulepreload", "https://www.gstatic.com/firebasejs/12.15.0/" + n + ".js", true);
  });
  try {
    var cj = localStorage.getItem("rcCJ");
    if (cj && /^common\.js\?v=\d+$/.test(cj)) hint("modulepreload", base + cj, true);
  } catch (e) {}

  fetch(base + (beta ? "beta/" : "pages/") + name + ".html", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(async function (html) {
      try { var mj = /common\.js\?v=\d+/.exec(html); if (mj) localStorage.setItem("rcCJ", mj[0]); } catch (e) {}
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
