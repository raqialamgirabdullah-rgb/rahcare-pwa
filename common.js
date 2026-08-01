/* ============================================
   RAH CARE — COMMON JS UTILITIES
   এই ফাইলের ফাংশনগুলো pure utility — বিজনেস লজিক
   পরিবর্তন হলেও এগুলো বদলানোর দরকার পড়বে না।
   প্রতিটা পেজ এখান থেকে import করে ব্যবহার করবে।
   ============================================ */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* ------------------------------------------------
   FIREBASE INIT
   (একমাত্র জায়গা যেখানে Firebase project বদলালে
   এডিট করতে হবে — বছরে হয়তো কখনো একবার)
   ------------------------------------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyDAicuq_q2KoKLx01Yejo3jEx64n5tZOJA",
  authDomain: "rah-care.firebaseapp.com",
  projectId: "rah-care",
  storageBucket: "rah-care.firebasestorage.app",
  messagingSenderId: "205338868264",
  appId: "1:205338868264:web:c5cb43f269346374c2531d"
};

export const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

/* ------------------------------------------------
   CACHE-CONTROL + BACK-BUTTON BLOCK
   পেজের <head>-এর একদম শুরুতে কল করতে হবে
   ------------------------------------------------ */
export function blockCacheAndBack() {
  history.pushState(null, null, location.href);
  window.addEventListener("popstate", function () {
    history.pushState(null, null, location.href);
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) window.location.reload();
  });
  document.documentElement.style.visibility = "hidden";
}

/* ------------------------------------------------
   AUTH GUARD
   লগইন না থাকলে স্বয়ংক্রিয়ভাবে লগইন পেজে পাঠাবে
   ------------------------------------------------ */
export function requireAuth(onUser, loginUrl = "https://rahcare.blogspot.com/p/login.html") {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      localStorage.clear();
      window.location.replace(loginUrl);
      return;
    }
    onUser(user);
  });
}

/* ------------------------------------------------
   PASSWORD SHOW/HIDE TOGGLE (👁 আইকন)
   ------------------------------------------------ */
export function togglePasswordVisibility(inputId, iconEl) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  iconEl.textContent = isPassword ? "🔒" : "👁";
}

/* ------------------------------------------------
   DATE FORMAT → dd.mm.yy
   ------------------------------------------------ */
export function formatDateDMY(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

/* ------------------------------------------------
   COPY TO CLIPBOARD
   ------------------------------------------------ */
export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(String(text));
  }
}

/* ------------------------------------------------
   MONTH NAMES (ইংরেজি, ক্যালেন্ডার/রিপোর্টে ব্যবহারের জন্য)
   ------------------------------------------------ */
export const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ------------------------------------------------
   PHONE → WHATSAPP NUMBER / LINK
   ------------------------------------------------ */
export function toWhatsAppNumber(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) return "88" + digits;
  if (digits.startsWith("880")) return digits;
  return digits;
}

export function whatsappLink(phone, message = "") {
  const num = toWhatsAppNumber(phone);
  if (!num) return "";
  const base = `https://api.whatsapp.com/send?phone=${num}`;
  return message ? `${base}&text=${encodeURIComponent(message)}` : base;
}

/* ------------------------------------------------
   AUTH FORM AUTO-CLEAR (Login / Signup পেজে)
   ------------------------------------------------ */
export function autoClearAuthForm(selector = ".auth-card input") {
  function clear() {
    document.querySelectorAll(selector).forEach(i => i.value = "");
  }
  window.addEventListener("pagehide", clear);
  window.addEventListener("pageshow", function (e) {
    clear();
    if (e.persisted) location.reload();
  });
}

/* ------------------------------------------------
   DROPDOWN OPEN/CLOSE + OUTSIDE-CLICK
   ------------------------------------------------ */
export function initDropdowns(triggerSelector = ".rc-dd", menuSelector = ".rc-dd-menu") {
  document.addEventListener("click", (e) => {
    if (!e.target.closest(triggerSelector)) {
      document.querySelectorAll(menuSelector + ".open").forEach(m => m.classList.remove("open"));
    }
  });
}

export function toggleDropdown(menuEl, menuSelector = ".rc-dd-menu") {
  const isOpen = menuEl.classList.contains("open");
  document.querySelectorAll(menuSelector + ".open").forEach(m => m.classList.remove("open"));
  if (!isOpen) menuEl.classList.add("open");
}
