/* Upload Document বক্স — আগে Profile পেজে ছিল, এখন Symptom / Response / Prescription পেজের উপরে বসে
   ব্যবহার: card.appendChild(createDocUpload(user))  (user = Firebase auth user)
   রাউটিং: যেকোনো ইমেজ → ImgBB; অডিও / ভিডিও → Google Drive; PDF / ডকুমেন্ট / ZIP ইত্যাদি → Supabase (Worker দিয়ে)
   ImgBB-তে সরাসরি API key নেই; Admin Panel-এর Logo আপলোডের মতোই Cloudflare proxy দিয়ে যায় */
const IMGBB_PROXY_URL = "https://imgbb-proxy.raqialamgirabdullah.workers.dev";
const MAX_IMG = 33554432; // 32MB (ImgBB সীমা)
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|tiff?|heic|heif|avif|svg|ico|jfif)$/i;
const isImage = f => (f.type || "").startsWith("image/") || IMAGE_EXT.test(f.name || "");
const MEDIA_EXT = /\.(mp3|wav|ogg|oga|m4a|aac|flac|wma|opus|amr|mp4|m4v|mov|avi|mkv|webm|3gp|wmv|flv|mpe?g)$/i;
const isMedia = f => /^(audio|video)\//.test(f.type || "") || MEDIA_EXT.test(f.name || "");
const PROXY_WORKER_URL = "https://supabase-pdf-proxy.raqialamgirabdullah.workers.dev/";
const DRIVE_PROXY_URL = "https://gdrive-media-proxy.raqialamgirabdullah.workers.dev/";

const sendToWorker = (url, f, u, onProgress, encName) => new Promise((res, rej) => {
  const x = new XMLHttpRequest();
  x.open("POST", url);
  x.setRequestHeader("X-User-UID", u.uid);
  // Drive Worker নামটা যেমন আছে তেমনই নেয়; বাংলা/non-ASCII নাম হলে হেডারে পাঠানোর জন্য এনকোড করা হয়
  x.setRequestHeader("X-File-Name", (encName || /[^\x20-\x7e]/.test(f.name)) ? encodeURIComponent(f.name) : f.name);
  x.setRequestHeader("Content-Type", f.type || "application/octet-stream");
  x.upload.onprogress = e => {
    if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
  };
  x.onload = () => {
    let d = {};
    try { d = JSON.parse(x.responseText) || {}; } catch (_) {}
    d.ok = x.status >= 200 && x.status < 300;
    d.status = x.status;
    res(d);
  };
  x.onerror = () => rej(new Error("network"));
  x.send(f);
});

const sendToSupabase = (f, u, onProgress) => sendToWorker(PROXY_WORKER_URL, f, u, onProgress, true);
const sendToDrive = (f, u, onProgress) => new Promise((res, rej) => {
  sendToWorker(DRIVE_PROXY_URL, f, u, onProgress, false).then(d => {
    d.url = d.fileUrl;
    res(d);
  }, rej);
});

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

const sendFile = (f, u, onProgress) =>
  isImage(f) ? sendToImgbb(f, onProgress) : isMedia(f) ? sendToDrive(f, u, onProgress) : sendToSupabase(f, u, onProgress);

export function createDocUpload(user, opts) {
  opts = opts || {};
  const el = (tag, css, txt) => {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (txt != null) e.textContent = txt;
    return e;
  };
  const wrap = el("div", "margin:10px 0 14px;padding:10px 12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc");
  wrap.appendChild(el("div", "font-size:13px;font-weight:700;margin-bottom:6px", "Upload Document"));
  const inp = el("input", "width:100%;box-sizing:border-box;margin-bottom:8px;font-size:13px");
  inp.type = "file";
  inp.className = "rc-input";
  const btn = el("button", "width:100%", "Upload");
  btn.type = "button";
  btn.className = "rc-btn rc-btn-primary";
  const st = el("div", "display:none;font-size:12px;margin-top:6px;color:#475569;word-break:break-word");
  wrap.appendChild(inp);
  wrap.appendChild(btn);
  wrap.appendChild(st);

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
    if (!f) return alert("Please choose a file first.");
    if (!user) return alert("Please log in again.");
    if (isImage(f) && f.size > MAX_IMG) return alert("Max 32MB");
    btn.disabled = true;
    st.style.display = "block";
    st.textContent = "";
    setP(0, "Uploading 0%");
    try {
      const j = await sendFile(f, user, p => setP(p, p < 100 ? "Uploading " + p + "%" : "Processing..."));
      if (j.ok && j.success) {
        setP(100, "Uploaded ✓");
        st.textContent = "Uploaded: " + f.name;
        if (isImage(f) && j.url && opts.onImage) {
          try { await opts.onImage({ url: j.url, name: f.name }); }
          catch (e) { console.error(e); st.textContent = "Uploaded, but could not be saved to record."; }
        }
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
