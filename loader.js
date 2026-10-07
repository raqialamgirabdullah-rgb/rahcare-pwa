/* RahCare page loader
   Blogger পেজে শুধু এই ফাইলের লিংক থাকে। আসল পেজ রিপোর pages/ ফোল্ডার থেকে আসে।
   টেস্ট করতে: Blogger পেজের লিংকের শেষে ?rcbeta=1 দিলে ওই ব্রাউজারে beta/ ফোল্ডারের পেজ চলে। বন্ধ করতে ?rcbeta=0 */
(function () {
  var cs = document.currentScript;
  if (!cs) return;
  var name = cs.getAttribute("data-page");
  var base = cs.src.replace(/[^\/]*$/, "");
  var beta = false;
  try {
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
