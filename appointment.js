import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAicuq_q2KoKLx01Yejo3jEx64n5tZOJA",
  authDomain: "rah-care.firebaseapp.com",
  projectId: "rah-care",
  storageBucket: "rah-care.firebasestorage.app",
  messagingSenderId: "205338868264",
  appId: "1:205338868264:web:c5cb43f269346374c2531d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const g = (id) => document.getElementById(id);

let currentAddress = "";
let userData = {};
let addressData = {};
let timesArr = [];
window.selectedCategory = "Ruqyah";

const RAHCARE_BASE = "https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/";

const dataReady = (async () => {
  try {
    let [addrText, slipJson, timeJson, formJson] = await Promise.all([
      fetch(RAHCARE_BASE + "address-data.js").then(r => r.text()),
      fetch(RAHCARE_BASE + "slip-template.json").then(r => r.json()),
      fetch(RAHCARE_BASE + "time-data.json").then(r => r.json()),
      fetch(RAHCARE_BASE + "form-template.json").then(r => r.json())
    ]);
    document.getElementById("appRoot").innerHTML = formJson.formTemplate;
    addressData = Function(addrText + ";return addressData;")();
    g("slipTemplate").innerHTML = slipJson.slipTemplate;
    timesArr = timeJson.times || [];
  } catch (e) {
    console.error("Error loading remote template/address/time data:", e);
  }
})();

window.onCatChange = function (box, cat) {
  if (!box.checked) {
    let other = g(cat === "Ruqyah" ? "catHijama" : "catRuqyah");
    if (!other.checked) {
      box.checked = true;
    }
  }
  updateSelectedCategory();
};

function updateSelectedCategory() {
  let ruqyah = g("catRuqyah").checked;
  let hijama = g("catHijama").checked;
  if (ruqyah && hijama) window.selectedCategory = "Ruqyah + Hijama";
  else if (ruqyah) window.selectedCategory = "Ruqyah";
  else if (hijama) window.selectedCategory = "Hijama";
  else window.selectedCategory = "";
}

function decodeHtml(html) {
  let t = document.createElement("textarea");
  t.innerHTML = html;
  return t.value;
}

function buildAddressMenu() {
  let menu = g("addrMenu");
  menu.innerHTML = "";
  Object.keys(addressData).forEach(division => {
    let span = document.createElement("span");
    span.textContent = division;
    span.onclick = (e) => {
      e.stopPropagation();
      showDistricts(division);
    };
    menu.appendChild(span);
  });
}

function showDistricts(division) {
  currentAddress = division;
  let menu = g("addrMenu");
  menu.innerHTML = "";
  let back = document.createElement("span");
  back.className = "back-opt";
  back.textContent = "🔙 Back to Divisions";
  back.onclick = (e) => {
    e.stopPropagation();
    buildAddressMenu();
  };
  menu.appendChild(back);
  addressData[division].forEach(district => {
    let span = document.createElement("span");
    span.textContent = district;
    span.onclick = () => {
      g("addrVal").textContent = `${currentAddress}, ${district}`;
      g("addrBtn").classList.add("selected");
      menu.classList.remove("open");
      buildAddressMenu();
    };
    menu.appendChild(span);
  });
}

function fillPatient(p) {
  if (g("pName")) g("pName").value = p.name || "";
  if (p.gender) {
    g("gVal").textContent = p.gender;
    g("gBtn").classList.add("selected");
  }
  if (p.address) {
    g("addrVal").textContent = p.address;
    g("addrBtn").classList.add("selected");
  }
  if (g("ageInput")) g("ageInput").value = p.age || "";
}

function buildTimeMenu() {
  let menu = g("timeMenu");
  menu.innerHTML = "";
  timesArr.forEach(time => {
    let span = document.createElement("span");
    span.textContent = time;
    span.onclick = () => {
      window.pickTime(time);
    };
    menu.appendChild(span);
  });
}

window.existingPatients = [];

const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      localStorage.clear();
      window.location.replace("https://rahcare.blogspot.com/p/login.html");
      return;
    }
    resolve(user);

    (async function loadUserData(uid) {
    try {
      let snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        userData = snap.data();
        if (g("slipCentreName")) g("slipCentreName").textContent = (userData.centreName || "Centre Name") + ":";
        if (g("slipCentreType")) g("slipCentreType").textContent = userData.centreType || "";
        if (g("slipBranchName")) g("slipBranchName").textContent = "(" + (userData.branchName || "Branch") + ")";
        if (g("slipBranchAddress")) g("slipBranchAddress").textContent = userData.branchAddress || "";
        if (g("slipBranchNumber")) g("slipBranchNumber").textContent = "Phone: " + (userData.branchNumber || "").replace("+880", "0");
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    }
  })(user.uid);

  (async function loadPatientHistory(uid) {
    try {
      let snap = await getDocs(query(collection(db, "appointments"), where("uid", "==", uid)));
      let latestByPhone = {};
      snap.forEach(docSnap => {
        let d = docSnap.data();
        if (!d.phone) return;
        let existing = latestByPhone[d.phone];
        if (!existing || (d.date && d.date > (existing.date || ""))) {
          latestByPhone[d.phone] = { phone: d.phone, name: d.name, gender: d.gender, address: d.address, age: d.age, date: d.date || "" };
        }
      });
      window.existingPatients = Object.values(latestByPhone);
    } catch (e) {
      console.error("Error loading patient history:", e);
    }
  })(user.uid);
  });
});

Promise.all([dataReady, authReady]).then(() => {
  buildAddressMenu();
  buildTimeMenu();
  document.documentElement.style.visibility = "visible";
});

window.handlePhoneInput = function (input) {
  let v = input.value.replace(/[^0-9+]/g, "");
  if (v.startsWith("+880") || v.startsWith("0088")) {
    v = "0" + v.slice(4);
  } else if (v.startsWith("880") && v[3] === "1") {
    v = "0" + v.slice(3);
  }
  input.value = v;
  if (v.length >= 2 && v.length < 11) {
    let matches = window.existingPatients.filter(p => p.phone && p.phone.startsWith(v));
    if (matches.length === 1) {
      input.value = matches[0].phone;
      fillPatient(matches[0]);
    }
  } else if (v.length >= 11) {
    let match = window.existingPatients.find(p => p.phone === v);
    if (match) fillPatient(match);
  }
};

window.toggleMenu = function (id) {
  document.querySelectorAll(".dd-menu").forEach(menu => {
    if (menu.id !== id) menu.classList.remove("open");
  });
  g(id).classList.toggle("open");
};

window.pickGender = function (val) {
  g("gVal").textContent = val;
  g("gBtn").classList.add("selected");
  g("gMenu").classList.remove("open");
};

window.pickTime = function (val) {
  g("timeVal").value = val;
  g("timeMenu").classList.remove("open");
};

window.onTimeTyped = function (input) {};

window.updateDateFormat = function (input) {
  let label = g("dateLabel");
  if (input.value) {
    let [y, m, d] = input.value.split("-");
    label.textContent = `${d}.${m}.${y.slice(-2)}`;
    label.classList.add("selected");
  } else {
    label.textContent = "Select Date";
    label.classList.remove("selected");
  }
};

window.clearForm = function () {
  document.querySelectorAll(".body-form input").forEach(i => i.value = "");
  g("gVal").textContent = "Select";
  g("gBtn").classList.remove("selected");
  g("addrVal").textContent = "Select Address";
  g("addrBtn").classList.remove("selected");
  g("timeVal").value = "";
  let label = g("dateLabel");
  label.textContent = "Select Date";
  label.classList.remove("selected");
  g("catRuqyah").checked = true;
  g("catHijama").checked = false;
  window.selectedCategory = "Ruqyah";
  buildAddressMenu();
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dd")) {
    document.querySelectorAll(".dd-menu").forEach(menu => menu.classList.remove("open"));
  }
});

window.generateSlip = async function () {
  let name = g("pName") ? g("pName").value.trim() : "N/A";
  let phone = g("phone").value.trim();
  let gender = g("gVal").textContent;
  let address = g("addrVal").textContent;
  let age = g("ageInput").value.trim();
  let time = g("timeVal").value.trim();
  let date = g("dateInput").value;

  if (!phone || gender === "Select" || address === "Select Address" || !age || !time || !date) {
    alert("Please fill in all information correctly.");
    return;
  }

  await dataReady;
  let uid = auth.currentUser ? auth.currentUser.uid : "N/A";
  let category = window.selectedCategory || "Ruqyah";

  g("slipName").textContent = name;
  g("slipPhone").textContent = phone;
  g("slipAge").textContent = age;
  g("slipGender").textContent = gender;
  g("slipAddr").textContent = address;
  g("slipSchedule").textContent = time;
  g("slipDateVal").textContent = "Date: " + g("dateLabel").textContent;

  let dayKey = time.split(":")[0] + date.split("-")[2] + date.split("-")[1] + date.split("-")[0].slice(-2);
  let seq = parseInt(localStorage.getItem(dayKey) || 0) + 1;
  localStorage.setItem(dayKey, seq);
  let suffixMap = ["", "", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  let idNumber = seq === 1 ? dayKey : (suffixMap[seq] || "B" + seq) + dayKey;
  g("slipPid").textContent = idNumber;

  let appointment = {
    uid, date, idNumber, name, phone, gender, age, address, time, category,
    bill: "Unpaid",
    serviceName: "--",
    serviceCharge: "--",
    serviceQuantity: "--",
    next: "--",
    centreName: userData.centreName || "",
    branchName: userData.branchName || "",
    branchNumber: userData.branchNumber || "",
    branchAddress: userData.branchAddress || ""
  };

  try {
    await addDoc(collection(db, "appointments"), appointment);
    await new Promise(r => setTimeout(r, 400));

    let downloaded = false;
    try {
      let dataUrl = (await html2canvas(g("slipTemplate"), {
        scale: 2, useCORS: true, logging: false, width: 424, windowWidth: 424, backgroundColor: "#ffffff"
      })).toDataURL("image/png");
      let a = document.createElement("a");
      a.download = (name === "N/A" ? "Appointment" : name.replace(/\s+/g, "_")) + "_Slip.png";
      a.href = dataUrl;
      a.click();
      await new Promise(r => setTimeout(r, 1500));
      downloaded = true;
    } catch (e) {
      console.error("Slip image generation/download failed:", e);
    }

    alert(decodeHtml(downloaded ? "Appointment Submitted Successfully!" : "Appointment save হয়েছে কিন্তু slip download-এ সমস্যা হয়েছে!"));

    redirectAfterWhatsApp(phone, decodeHtml(`আসসালামু আলাইকুম ${name}, আপনার অ্যাপয়েন্টমেন্ট ${g("dateLabel").textContent} তারিখে ${time} সময়ে নিশ্চিত করা হয়েছে। ধন্যবাদ।`));
  } catch (e) {
    alert(decodeHtml("Error saving data: " + e.message));
  }
};

function redirectAfterWhatsApp(phoneRaw, message) {
  function toWaNumber(p) {
    let digits = String(p).replace(/\D/g, "");
    return digits.startsWith("01") && digits.length === 11 ? "88" + digits : digits;
  }
  let waUrl = "whatsapp://send?phone=" + toWaNumber(phoneRaw);
  let isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  let smsUrl = "sms:" + phoneRaw + (isIOS ? "&body=" : "?body=") + encodeURIComponent(message);
  let dashboardUrl = "https://rahcare.blogspot.com/p/dashboard.html";
  let redirected = false;

  function goToDashboard() {
    if (!redirected) {
      redirected = true;
      window.location.replace(dashboardUrl);
    }
  }

  document.addEventListener("visibilitychange", function onVis() {
    if (document.visibilityState === "visible") {
      document.removeEventListener("visibilitychange", onVis);
      goToDashboard();
    }
  });

  setTimeout(goToDashboard, 8000);
  window.location.href = waUrl;
  setTimeout(() => {
    if (!redirected && document.visibilityState === "visible") {
      window.location.href = smsUrl;
    }
  }, 1500);
}
