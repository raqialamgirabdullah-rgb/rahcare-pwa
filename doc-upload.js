/* Upload Image বক্স — Symptom / Response / Prescription পেজের উপরে বসে
   ব্যবহার: card.appendChild(createDocUpload(user, { images: () => [{url,name}], onImage: async ({url,name}) => {} }))
   এখন শুধু ইমেজ আপলোড চলে (ImgBB, Admin Panel-এর Logo আপলোডের মতো Cloudflare proxy দিয়ে)।
   অডিও / ভিডিও / PDF / ডকুমেন্ট / ZIP আপাতত বন্ধ। আপলোডের পর ছবিটা বক্সের নিচেই দেখা যায়। */
const IMGBB_PROXY_URL = "https://imgbb-proxy.raqialamgirabdullah.workers.dev";
const MAX_IMG = 33554432; // 32MB (ImgBB সীমা)
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|tiff?|heic|heif|avif|svg|ico|jfif)$/i;
const isImage = f => (f.type || "").startsWith("image/") || IMAGE_EXT.test(f.name || "");

const sendToImgbb = (f, onProgress) => new Promise((res, rej) => {
  const x = new XMLHttpRequest();
  x.open("POST", IMGBB_PROXY_URL);
  x.upload.onprogress = e => {
    if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
  };
  x.onload = () => {
    let d = {};
    try { d = JSON.parse(x.responseText) || {}; } catch (_) {}
    res({
      ok: x.status >= 200 && x.status < 300,
      status: x.status,
      success: !!d.success,
      url: d.data && (d.data.url || d.data.display_url),
      error: d.error && (d.error.message || d.error)
    });
  };
  x.onerror = () => rej(new Error("network"));
  const fd = new FormData();
  fd.append("image", f);
  x.send(fd);
});

export function createDocUpload(user, opts) {
  opts = opts || {};
  const el = (tag, css, txt) => {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (txt != null) e.textContent = txt;
    return e;
  };
  const wrap = el("div", "margin:10px 0 14px;padding:10px 12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc");
  wrap.appendChild(el("div", "font-size:13px;font-weight:700;margin-bottom:6px", "Upload Image"));
  const inp = el("input", "width:100%;box-sizing:border-box;margin-bottom:8px;font-size:13px");
  inp.type = "file";
  inp.accept = "image/*";
  inp.className = "rc-input";
  const btn = el("button", "width:100%", "Upload");
  btn.type = "button";
  btn.className = "rc-btn rc-btn-primary";
  const st = el("div", "display:none;font-size:12px;margin-top:6px;color:#475569;word-break:break-word");
  const gal = el("div", "display:none;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin-top:10px");
  wrap.appendChild(inp);
  wrap.appendChild(btn);
  wrap.appendChild(st);
  wrap.appendChild(gal);

  // ছবির থাম্বনেইল (ট্যাপ করলে বড় করে দেখা যায়)
  const addThumb = img => {
    if (!img || !img.url) return;
    const a = el("a", "display:block;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#fff");
    a.href = img.url; a.target = "_blank"; a.rel = "noopener";
    const im = el("img", "display:block;width:100%;height:110px;object-fit:cover");
    im.src = img.url; im.alt = img.name || ""; im.loading = "lazy";
    a.appendChild(im);
    gal.appendChild(a);
    gal.style.display = "grid";
  };
  let initial = [];
  try { initial = (typeof opts.images === "function" ? opts.images() : opts.images) || []; } catch (_) {}
  initial.forEach(addThumb);

  const setP = (p, t) => {
    btn.style.background = "linear-gradient(to right,#16a34a " + p + "%,#4f46e5 " + p + "%)";
    btn.textContent = t;
  };
  const reset = () => {
    btn.disabled = false;
    btn.style.background = "";
    btn.textContent = "Upload";
  };

  btn.onclick = async () => {
    const f = inp.files[0];
    if (!f) return alert("Please choose an image first.");
    if (!user) return alert("Please log in again.");
    if (!isImage(f)) return alert("Only images can be uploaded.");
    if (f.size > MAX_IMG) return alert("Max 32MB");
    btn.disabled = true;
    st.style.display = "block";
    st.textContent = "";
    setP(0, "Uploading 0%");
    try {
      const j = await sendToImgbb(f, p => setP(p, p < 100 ? "Uploading " + p + "%" : "Processing..."));
      if (j.ok && j.success && j.url) {
        setP(100, "Uploaded ✓");
        st.textContent = "Uploaded: " + f.name;
        let saved = true;
        if (opts.onImage) {
          try { await opts.onImage({ url: j.url, name: f.name }); }
          catch (e) { saved = false; console.error(e); st.textContent = "Uploaded, but could not be saved to record."; }
        }
        if (saved) addThumb({ url: j.url, name: f.name });
        inp.value = "";
        setTimeout(reset, 2000);
      } else {
        st.textContent = "Upload failed: " + (j.error || j.status);
        reset();
      }
    } catch (e) {
      st.textContent = "Network error. Please try again.";
      reset();
    }
  };
  return wrap;
}
