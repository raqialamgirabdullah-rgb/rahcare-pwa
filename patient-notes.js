/* রোগীর নোট পেজ: Symptom Diagnosis / Response Diagnosis / Prescription
   ব্যবহার: Blogger পেজে mountNotePage("symptom" | "response" | "prescription") */
import { db, requireAuth, loadUser, createLabels, UP, DO, GD } from "./common.js?v=13";
import { mountSymptomChecklist } from "./symptom-checklist.js";
import { createDocUpload } from "./doc-upload.js";

const KINDS = {
  symptom: { field: "symptomDx", key: "symptomDx", icon: "🩺" },
  response: { field: "responseDx", key: "responseDx", icon: "📈" },
  prescription: { field: "prescription", key: "prescription", icon: "💊" }
};
const DASH = "https://rahcare.blogspot.com/p/dashboard.html";

export function mountNotePage(kind) {
  const K = KINDS[kind], root = document.getElementById("npRoot");
  if (!K || !root) return;
  const el = (tag, css, txt) => {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (txt != null) e.textContent = txt;
    return e;
  };
  const card = el("div", "max-width:520px;margin:12px auto;padding:16px;box-sizing:border-box");
  card.className = "rc-card";
  root.innerHTML = "";
  root.appendChild(card);
  const say = t => { card.innerHTML = ""; card.appendChild(el("div", "text-align:center;padding:20px;color:#64748b", t)); };
  say("⏳ Loading...");

  let started = false;
  requireAuth(async user => {
    if (started) return;
    started = true;
    try {
      const u = await loadUser(user);
      if (!u) return;
      const LB = createLabels(u.d, o => UP(u.ref, o));
      const id = new URLSearchParams(location.search).get("d");
      if (!id) return say("Not found");
      const ref = DO(db, "appointments", id), snap = await GD(ref);
      const a = snap.exists() ? snap.data() : null;
      if (!a || a.uid !== user.uid) return say("Not found");
      // ImgBB ইমেজের লিংক এই অ্যাপয়েন্টমেন্টের রেকর্ডে সেভ হয়
      const saveImg = async img => {
        const list = Array.isArray(a.uploadedImages) ? a.uploadedImages.slice() : [];
        list.push({ url: img.url, name: img.name, page: kind, at: Date.now() });
        await UP(ref, { uploadedImages: list });
        a.uploadedImages = list;
      };

      // Symptom Diagnosis: এডমিন হলে টিক-চেকলিস্ট, না হলে নিচের সাধারণ নোট বক্স
      if (kind === "symptom") {
        let isAdmin = false;
        try { isAdmin = (await GD(DO(db, "admins", user.uid))).exists(); } catch (e) { console.error(e); }
        if (isAdmin) {
          const meta0 = [a.idNumber ? "ID: " + a.idNumber : "", a.phone || ""].filter(Boolean).join("  •  ");
          mountSymptomChecklist(card, {
            checked: Array.isArray(a.symptomChecks) ? a.symptomChecks : [],
            patient: { name: a.name || "Patient", meta: meta0 },
            back: DASH,
            extraTop: createDocUpload(user, { onImage: saveImg, images: () => a.uploadedImages }),
            onSave: ids => UP(ref, { symptomChecks: ids })
          });
          return;
        }
      }

      card.innerHTML = "";
      card.appendChild(el("h2", "margin:0 0 6px;font-size:20px;color:var(--primary-color,#4f46e5)", K.icon + " " + LB.L(K.key)));
      card.appendChild(el("div", "font-weight:700;font-size:15px", a.name || "Patient"));
      const meta = [a.idNumber ? "ID: " + a.idNumber : "", a.phone || ""].filter(Boolean).join("  •  ");
      if (meta) card.appendChild(el("div", "font-size:12px;color:#64748b;margin-bottom:12px", meta));
      card.appendChild(createDocUpload(user, { onImage: saveImg, images: () => a.uploadedImages }));

      const ta = el("textarea", "width:100%;min-height:220px;box-sizing:border-box;margin:10px 0;font-family:inherit;font-size:14px;padding:10px;border:1px solid #cbd5e1;border-radius:8px");
      ta.className = "rc-input";
      ta.value = a[K.field] || "";
      card.appendChild(ta);

      const row = el("div", "display:flex;gap:8px;align-items:center");
      const back = el("a", "flex:1;text-align:center;text-decoration:none;box-sizing:border-box", "Back");
      back.className = "c-no";
      back.href = DASH;
      const save = el("button", "flex:2", "Save");
      save.type = "button";
      save.className = "rc-btn rc-btn-primary";
      row.appendChild(back);
      row.appendChild(save);
      card.appendChild(row);
      const st = el("div", "text-align:center;font-size:12px;margin-top:8px;min-height:16px;color:#16a34a");
      card.appendChild(st);

      save.onclick = async () => {
        save.disabled = true;
        st.style.color = "#64748b";
        st.textContent = "Saving...";
        try {
          await UP(ref, { [K.field]: ta.value.trim() });
          st.style.color = "#16a34a";
          st.textContent = "✅ Saved";
        } catch (e) {
          console.error(e);
          st.style.color = "#dc2626";
          st.textContent = "Save failed";
        }
        save.disabled = false;
      };
    } catch (e) {
      console.error(e);
      say("Error");
    }
  });
}
