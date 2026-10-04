import{initializeApp as t,getApps as e}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";import{getFirestore as n,updateDoc as UPD,collection as CO,doc as DO,getDoc as GD,getDocs as GS,addDoc as AD,deleteDoc as DL,onSnapshot as ON,query as QU,where as WH}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";import{getAuth as o,onAuthStateChanged as r,signOut as SO}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";export const app=e().length?e()[0]:t({apiKey:"AIzaSyDAicuq_q2KoKLx01Yejo3jEx64n5tZOJA",authDomain:"rah-care.firebaseapp.com",projectId:"rah-care",storageBucket:"rah-care.firebasestorage.app",messagingSenderId:"205338868264",appId:"1:205338868264:web:c5cb43f269346374c2531d"});export const db=n(app);export const auth=o(app);export function blockCacheAndBack(){history.pushState(null,null,location.href),window.addEventListener("popstate",function(){history.pushState(null,null,location.href)}),window.addEventListener("pageshow",function(t){t.persisted&&window.location.reload()}),document.documentElement.style.visibility="hidden"}export function requireAuth(t,e="https://rahcare.blogspot.com/p/login.html"){return r(auth,n=>{if(!n)return localStorage.clear(),void window.location.replace(e);t(n)})}export function togglePasswordVisibility(t,e){const n=document.getElementById(t),o="password"===n.type;n.type=o?"text":"password",e.textContent=o?"🔒":"👁"}export function formatDateDMY(t){const e=new Date(t);return isNaN(e.getTime())?null:`${String(e.getDate()).padStart(2,"0")}.${String(e.getMonth()+1).padStart(2,"0")}.${String(e.getFullYear()).slice(-2)}`}export function formatTime12(t){if(!t)return"";const e=String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/);if(!e)return t;let n=parseInt(e[1],10);const o=parseInt(e[2],10);let r=e[3]?e[3].toUpperCase():null;r||(r=n>=12?"PM":"AM",n%=12,0===n&&(n=12));const a=String(n).padStart(2,"0");return 0===o?`${a} ${r}`:`${a}:${String(o).padStart(2,"0")} ${r}`}export function copyToClipboard(t){navigator.clipboard&&navigator.clipboard.writeText(String(t))}export const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];export function toWhatsAppNumber(t){let e=String(t||"").replace(/\D/g,"");return e.startsWith("01")&&11===e.length?"88"+e:e}export function whatsappLink(t,e=""){const n=toWhatsAppNumber(t);if(!n)return"";const o=`https://api.whatsapp.com/send?phone=${n}`;return e?`${o}&text=${encodeURIComponent(e)}`:o}export function autoClearAuthForm(t=".auth-card input"){function e(){document.querySelectorAll(t).forEach(t=>t.value="")}window.addEventListener("pagehide",e),window.addEventListener("pageshow",function(t){e(),t.persisted&&location.reload()})}export function initDropdowns(t=".rc-dd",e=".rc-dd-menu"){document.addEventListener("click",n=>{n.target.closest(t)||document.querySelectorAll(e+".open").forEach(t=>t.classList.remove("open"))})}export function toggleDropdown(t,e=".rc-dd-menu"){const n=t.classList.contains("open");document.querySelectorAll(e+".open").forEach(t=>t.classList.remove("open")),n||(t.classList.add("open"),fitMenu(t))}export function toISODate(t){return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")}export function toISOMonth(t){return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")}export function openModal(t){const e="string"==typeof t?document.getElementById(t):t;e&&e.classList.add("show")}export function closeModal(t){const e="string"==typeof t?document.getElementById(t):t;e&&e.classList.remove("show")}export function isPaid(t){return void 0!==t.bill&&"unpaid"!==String(t.bill).trim().toLowerCase()&&""!==String(t.bill).trim()&&"0"!==String(t.bill).trim()}export function monthLabel(t){const e=(t+"").split("-");return(MONTH_NAMES[parseInt(e[1])-1]||"")+" "+e[0]}export const RAHCARE_BASE="https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/";export function isHijama(t){return!!t.category&&(t.category+"").trim().toLowerCase().startsWith("hijama")}export async function fetchAddressData(){const t=await fetch(RAHCARE_BASE+"address-data.js").then(t=>t.text());return Function(t+";return addressData;")()}export function initAddressDropdown({menuId:t,btnId:e,valueId:n,addressData:o,onSelect:r}){const a=document.getElementById(t),i=document.getElementById(e),s=document.getElementById(n);function v(t,e,n){const o=[t,e,n].filter(Boolean).join(", ");"INPUT"===s.tagName?s.value=o:s.textContent=o,i&&i.classList.add("selected")}function c(t,e,n){const o=document.createElement("span");o.textContent=t,n&&(o.className=n),o.onclick=t=>{t.stopPropagation(),e()},a.appendChild(o)}function p(t,e,n){v(t,e,n),a.classList.remove("open"),r&&r(t,e,n),d()}function d(){a.innerHTML="",Object.keys(o).forEach(t=>{c(t,()=>l(t))})}function l(t){v(t),a.innerHTML="",c("🔙 Back to Divisions",d,"rc-dd-back"),Object.keys(o[t]).forEach(e=>{c(e,()=>{v(t,e);(function(t,e){a.innerHTML="",c("🔙 Back to Districts",()=>l(t),"rc-dd-back"),(o[t][e]||[]).forEach(n=>{c(n,()=>p(t,e,n))}),c("",()=>p(t,e),"rc-dd-done")})(t,e)})}),c("",()=>p(t),"rc-dd-done")}return a.classList.add("rc-dd-grid"),d(),{reset:d}}export function createChipPicker({btnId:t,menuId:e,valueId:n,multi:o=!1,labelMap:r={},onChange:a}){const i=o?new Set:{value:null},s=document.getElementById(t),c=n?document.getElementById(n):s;function l(){const t=o?[...i]:i.value?[i.value]:[];c.textContent=t.length?t.map(t=>r[t]||t).join(" + "):"Select",s.classList.toggle("selected",t.length>0),document.querySelectorAll(`#${e} span`).forEach(t=>{t.classList.toggle("checked",o?i.has(t.dataset.val):t.dataset.val===i.value)})}return l(),{pick(t){o?i.has(t)?i.size>1&&i.delete(t):i.add(t):i.value=t,l(),a&&a(o?[...i]:t)},reset(t){o?(i.clear(),t&&i.add(t)):i.value=t||null,l()},get:()=>o?[...i]:i.value}}export function redirectAfterMessage(t,e,n="https://rahcare.blogspot.com/p/dashboard.html"){const o="whatsapp://send?phone="+toWhatsAppNumber(t),r="sms:"+t+(/iPhone|iPad|iPod/.test(navigator.userAgent)?"&body=":"?body=")+encodeURIComponent(e);let a=!1;function i(){a||(a=!0,window.location.replace(n))}document.addEventListener("visibilitychange",function t(){"visible"===document.visibilityState&&(document.removeEventListener("visibilitychange",t),i())}),setTimeout(i,8e3),window.location.href=o,setTimeout(()=>{a||"visible"!==document.visibilityState||(window.location.href=r)},1500)}export async function downloadElementAsImage(t,e,{scale:n=2,width:o,windowWidth:r}={}){try{const a={scale:n,useCORS:!0,logging:!1,backgroundColor:"#ffffff"};o&&(a.width=o),r&&(a.windowWidth=r);const i=await html2canvas(document.getElementById(t),a),s=document.createElement("a");return s.download=e,s.href=i.toDataURL("image/png"),s.click(),await new Promise(t=>setTimeout(t,1500)),!0}catch(t){return console.error("Image generation failed:",t),!1}}export const $=i=>document.getElementById(i),
sh=(i,v)=>$(i).style.display=v,
md=(i,on)=>$(i).classList.toggle("show",on),
ER=e=>{console.error(e);alert("Error")},
ES=t=>(t+"").replace(/[&<>"]/g,z=>"&#"+z.charCodeAt(0)+";"),
SM=(a,k)=>a.reduce((m,z)=>m+(z[k]||0),0),
OD=t=>{const e=new Date;return e.setDate(e.getDate()+t),toISODate(e)};
export function mountEditModals(t="Edit Form"){if($("mh"))return;window.MD=md;document.body.insertAdjacentHTML("beforeend",`<div id="mh" class="c-modal" onclick="MD('mh',0)"><div class="c-box" style="width:calc(100% - 32px);max-width:560px" onclick="event.stopPropagation()"><h3>${t}</h3><div id="hl" class="lb lbx"></div><div class="bx"><button class="c-no c-no-sm" onclick="MD('mh',0)">Cancel</button><button class="c-yes" onclick="HV()">Save</button></div></div></div><div id="mi" class="c-modal"><div class="c-box" style="width:calc(100% - 32px);max-width:300px"><h3 id="it"></h3><input class="rc-input" id="in" maxlength="40" autocomplete="off" style="margin-bottom:12px" onkeydown="event.key=='Enter'&&FS()"><div class="bx"><button class="c-no c-no-sm" id="id" onclick="FD()">Delete</button><button class="c-no c-no-sm" onclick="MD('mi',0)">Cancel</button><button class="c-yes" onclick="FS()">Save</button></div></div></div>`)}
export const renderEditList=(hc,mx,w)=>{$("hl").innerHTML=hc.map((c,i)=>`<div class="lr"><span class="ar${i?"":" off"}" onclick="HM(${i},-1)">▲</span><span class="ar${i<hc.length-1?"":" off"}" onclick="HM(${i},1)">▼</span><span class="nm">${ES(c.n)}</span>${w?`<select class="ws" onchange="HW(${i},this.value)">${[1,2,3,4].map(n=>`<option${n==c.w?" selected":""}>${n}</option>`).join("")}</select>`:""}<span class="ed" onclick="HE(${i})">✎</span></div>`).join("")+(hc.length<mx?`<div class="lr la" onclick="HE(-1)">+</div>`:"")};
export function createFormEditor({defaults:D0,max:mx=12,get:gt,apply:ap,save:sv}){const D=D0.map(([k,n,w])=>({k,n,w:w||(k=="name"||k=="items"?1:2)})),WS={},FK={pName:"name",phone:"phone",gBtn:"gender",addrVal:"addr",ageInput:"age",timeVal:"time",dateInput:"date"},paint=()=>{const f=$("ff");f&&f.querySelectorAll(":scope>:not(.rc-row-2),:scope>.rc-row-2>*").forEach(e=>{const m=e.querySelector("#pName,#phone,#gBtn,#addrVal,#ageInput,#timeVal,#dateInput,[data-x]"),w=WS[e.dataset.k||m&&(FK[m.id]||m.dataset.x)];w&&(e.style.gridColumn="span "+12/w)})};let hc=[],ce=-1;const parse=s=>{const r=(s||"").split("|").filter(Boolean).map(z=>{const i=z.indexOf(":"),[k,w]=z.slice(0,i).split("~");return{k,n:z.slice(i+1),w:+w}}).filter(z=>z.n&&(D.some(d=>d.k==z.k)||/^c[a-z0-9]+$/.test(z.k)));r.forEach(z=>z.w>0&&z.w<5||(z.w=(D.find(d=>d.k==z.k)||{w:2}).w));D.forEach(d=>r.some(z=>z.k==d.k)||r.push({...d,n:mtFieldName(d.k)||d.n}));r.forEach(z=>{z.k=="name"&&(z.w=1);WS[z.k]=z.w});return r},RL=()=>renderEditList(hc,mx,1);mountEditModals();$("ff")&&new MutationObserver(paint).observe($("ff"),{childList:true});Object.assign(window,{MD:md,EF:()=>{hc=gt().map(z=>({...z}));RL();md("mh",1)},HW:(i,v)=>{hc[i].w=+v},HM:(i,d)=>{hc[i+d]&&([hc[i],hc[i+d]]=[hc[i+d],hc[i]],RL())},HE:i=>{ce=i;$("it").textContent=i<0?"Add Field":"Edit Field";$("in").value=i<0?"":hc[i].n;$("id").style.display=i>=0&&hc[i].k[0]=="c"?"":"none";md("mi",1);$("in").focus()},FS:()=>{const n=$("in").value.trim().replace(/[|\s]+/g," ");if(!n)return alert("Enter name");ce<0?hc.push({k:"c"+Date.now().toString(36),n,w:2}):hc[ce].n=n;md("mi",0);RL()},FD:()=>{confirm("Delete?")&&(hc.splice(ce,1),md("mi",0),RL())},HV:async()=>{try{await sv(hc.map(z=>z.k+"~"+z.w+":"+z.n).join("|"));hc.forEach(z=>WS[z.k]=z.w);ap(hc);paint();md("mh",0)}catch(e){ER(e)}}});return{parse}}
export async function addLogos(root,u,ids){const url=u.logoUrl||u.logo||u.centerLogo||"";root.classList.toggle("hasLogo",!!url);for(const d of ids){let w=$(d);w||(w=new Image,w.id=d,w.className=/WM$/.test(d)?"wm":"lg",w.crossOrigin="anonymous",root.appendChild(w));if(!url){w.style.display="none";continue}await new Promise(r=>{w.onload=w.onerror=r,w.src=url});w.style.display=w.naturalWidth?"block":"none"}}
export const getExtras=p=>{const o={...p};document.querySelectorAll("#ff [data-x]").forEach(i=>{const t=i.value.trim();t?o[i.dataset.x]=t:delete o[i.dataset.x]});window.__rcDoctor&&(o.doctor=window.__rcDoctor);return o},setExtras=x=>{x&&document.querySelectorAll("#ff [data-x]").forEach(i=>{const t=x[i.dataset.x];t&&(i.value=t)})};
function fitMenu(m){const g=m.closest("#ff");if(!g||!m.classList.contains("rc-dd-grid"))return;const a=m.parentElement.getBoundingClientRect(),b=g.getBoundingClientRect(),s=m.style;s.width=b.width+"px";s.left=b.left-a.left+"px";s.right="auto"}
export async function RQ(ref,list,name){name=(name||"").trim();if(!name||list.some(x=>x.toLowerCase()===name.toLowerCase()))return list;const nl=[...list,name];await UPD(ref,{raqiList:nl});return nl}
export const MY=(c,k,v)=>QU(CO(db,c),WH(k,"==",v));export{CO,DO,GD,AD,UPD as UP,DL,ON};
export async function loadUser(t,e="https://rahcare.blogspot.com/p/login.html"){let r=DO(db,"users",t.uid),d={};try{const s=await GS(MY("users","uid",t.uid));s.empty||(d=s.docs[0].data(),r=s.docs[0].ref)}catch(s){console.error(s)}return d.suspended?(alert("Suspended"),SO(auth).then(()=>{location.href=e}),null):{ref:r,d}}
export function initFeeNotice(u,G,B="01780972945"){const x=$("fx");if(!x)return{upd(){},stop(){}};let FE=[],NT=[],nid=null,amt=0;x.innerHTML=`<div class="site-notice" id="sn"><div class="site-notice-inner">ℹ️<span id="snt"></span><button class="site-notice-close" onclick="DN()">&times;</button></div></div><div class="fee-banner" id="fb"><div class="fee-banner-inner">🔔<span id="fbt"></span><button class="fee-btn-pay" onclick="OF()">Pay</button></div></div><div class="fee-banner fee-banner-pending" id="fp"><div class="fee-banner-inner">⏳<span id="fpt"></span></div></div><div id="mf" class="c-modal"><div class="c-box" style="max-width:300px"><h3>📱 Platform Fee</h3><p id="fmd" style="font-size:13px;color:#475569;margin:0 0 12px"></p><div class="fee-num-box"><span id="fbn"></span><button class="fee-copy-btn" onclick="CB()">📋</button></div><div class="fee-num-box"><span id="fav"></span><button class="fee-copy-btn" onclick="CA()">📋</button></div><div class="fee-action-row"><a href="tel:*247%23" class="fee-action-btn">☎️ *247#</a><button class="fee-action-btn" onclick="OB()">📱 App</button></div><p style="font-size:11px;color:#94a3b8;margin:10px 0 16px">Tap after sending.</p><div class="c-row"><button class="c-yes" style="background:#16a34a" onclick="PF()">Paid</button></div><button class="c-no c-no-full" style="margin-top:8px" onclick="md('mf',0)">Close</button></div></div><div id="ft" class="fee-toast">✅ Confirmed</div>`;const sb=(i,o)=>sh(i,o?"block":"none"),LB=a=>a.map(z=>monthLabel(z.period)).join(", "),DS=()=>{try{return JSON.parse(localStorage.getItem("dismissedNotices")||"[]")}catch{return[]}},FW=()=>{const t=new Date,e=[];for(let n=1;n<=6;n++){const m=toISOMonth(new Date(t.getFullYear(),t.getMonth()-n,1));if(FE.some(z=>z.period===m))continue;const s=new Set;G().forEach(g=>{g.date&&(g.date+"").slice(0,7)===m&&isPaid(g)&&s.add((g.phone||"").trim()+"|"+(g.name||"").trim())});s.size&&e.push({period:m,count:s.size,amount:50*s.size})}return e},FB=()=>{const n=FW(),p=FE.filter(z=>z.status==="pending");n.length&&($("fbt").innerHTML=`<b>${LB(n)}</b>: ${SM(n,"count")} pts, due <b>Tk ${SM(n,"amount")}</b>`);sb("fb",n.length);p.length&&($("fpt").innerHTML=`<b>${LB(p)}</b>: Tk ${SM(p,"amount")} verifying`);sb("fp",p.length)},NZ=()=>{const e=DS(),n=NT.filter(t=>(t.scope==="global"||t.scope===u)&&!e.includes(t.id))[0];n&&(nid=n.id,$("snt").textContent=n.message||"");sb("sn",n)},mp=s=>s.docs.map(z=>({id:z.id,...z.data()})),a=ON(MY("platformFees","uid",u),s=>{FE=mp(s);FB()}),b=ON(MY("notices","active",!0),s=>{NT=mp(s);NZ()});Object.assign(window,{DN:()=>{if(!nid)return;const t=DS();t.includes(nid)||t.push(nid);try{localStorage.setItem("dismissedNotices",JSON.stringify(t))}catch{}NZ()},OF:()=>{amt=SM(FW(),"amount");$("fbn").textContent=B;$("fav").textContent="Tk "+amt;$("fmd").innerHTML=`Send <b>Tk ${amt}</b> via bKash, then tap Paid.`;md("mf",1)},CB:()=>copyToClipboard(B),CA:()=>copyToClipboard(amt),OB:()=>{location.href="intent://#Intent;package=com.bKash.customerapp;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.bKash.customerapp;end"},PF:async()=>{try{await Promise.all(FW().map(t=>AD(CO(db,"platformFees"),{uid:u,period:t.period,patientCount:t.count,amount:t.amount,status:"pending",confirmedAt:(new Date).toISOString()})));md("mf",0);const e=$("ft");e.querySelector("span")||(e.innerHTML="✅ <span>Submitted, awaiting verification</span>");e.style.display="block";setTimeout(()=>e.style.display="none",2500)}catch(e){ER(e)}},md});return{upd:FB,stop(){a();b()}}}

/* ===== LABELS: common.js-এর একদম শেষে পেস্ট করুন ===== */
/* অগ্রাধিকার: ইউজারের নিজের লেবেল (users/{uid}.labels) > managementType প্রিসেট > BASE ডিফল্ট
   শুধু স্ক্রিনের লেখা বদলায়, ডাটাবেসের কী (name, phone, idNumber...) কখনো না */
const LB_BASE = {
  person: "Patient", persons: "patients",
  appointmentTitle: "Appointment", appointmentSub: "নিচের তথ্যগুলো পূরণ করুন",
  submit: "Submit", clear: "Clear",
  msgFill: "Please fill in all information correctly.",
  msgOk: "Appointment Submitted Successfully!",
  msgWa: "আসসালামু আলাইকুম {name}, আপনার অ্যাপয়েন্টমেন্ট {date} তারিখে{time} নিশ্চিত করা হয়েছে। ধন্যবাদ।",
  msgTime: " {time} সময়ে",
  searchPh: "🔍 Name/ID/Phone", addCard: "Add Card",
  emptyToday: "No {persons} today", results: "Results", noMatch: "No match",
  reminders: "Reminders", rToday: "Today", rTomorrow: "Tomorrow", rMissed: "Missed Yesterday",
  rmsgToday: "Session today. Please come on time.",
  rmsgTomorrow: "Session tomorrow. Please confirm.",
  rmsgMissed: "Missed yesterday. Please share a new time.",
  waHello: "Assalamu Alaikum, {name}. {msg}",
  billingTitle: "Billing", dashboardTitle: "Dashboard", msgNoPerson: "No {person}!", notFound: "Not found"
};
/* শুধু শুরুর প্রিসেট, সীমা নয় */
const LB_PRESETS = {
  patient: {},
  student: { person: "Student", persons: "students", appointmentTitle: "Admission", billingTitle: "Fees", dashboardTitle: "Student Dashboard",
    doctor: "Teacher", slipTitle: "Admission Slip", slipId: "Student ID", bnPerson: "স্টুডেন্ট",
    msgOk: "Admission Submitted Successfully!", msgWa: "আসসালামু আলাইকুম {name}, আপনার ভর্তি {date} তারিখে{time} নিশ্চিত করা হয়েছে। ধন্যবাদ।" },
  worker: { person: "Worker", persons: "workers", appointmentTitle: "Work Entry", billingTitle: "Payment", dashboardTitle: "Worker Dashboard",
    doctor: "Supervisor", slipTitle: "Work Slip", slipId: "Worker ID", bnPerson: "কর্মী",
    msgOk: "Work Entry Submitted Successfully!", msgWa: "আসসালামু আলাইকুম {name}, আপনার কাজ {date} তারিখে{time} নিশ্চিত করা হয়েছে। ধন্যবাদ।" },
  client: { person: "Client", persons: "clients", appointmentTitle: "Booking", billingTitle: "Billing", dashboardTitle: "Client Dashboard",
    doctor: "Consultant", slipTitle: "Booking Slip", slipId: "Client ID", bnPerson: "ক্লায়েন্ট",
    msgOk: "Booking Submitted Successfully!", msgWa: "আসসালামু আলাইকুম {name}, আপনার বুকিং {date} তারিখে{time} নিশ্চিত করা হয়েছে। ধন্যবাদ।" },
  staff: { person: "Staff", persons: "staff", appointmentTitle: "Staff Entry", billingTitle: "Payroll", dashboardTitle: "Staff Dashboard",
    doctor: "Manager", slipTitle: "Duty Slip", slipId: "Staff ID", bnPerson: "স্টাফ",
    msgOk: "Staff Entry Submitted Successfully!", msgWa: "আসসালামু আলাইকুম {name}, আপনার ডিউটি {date} তারিখে{time} নিশ্চিত করা হয়েছে। ধন্যবাদ।" }
};
/* কোন পেজে কোন কী এডিট হবে। নতুন কী যোগ করলে এখানে আর LB_BASE-এ দিন */
const LB_PAGES = {
  appointment: ["appointmentTitle", "appointmentSub", "submit", "clear", "person", "persons", "msgFill", "msgOk", "msgWa", "msgTime"],
  dashboard: ["searchPh", "addCard", "emptyToday", "results", "noMatch", "persons", "reminders", "rToday", "rTomorrow", "rMissed", "rmsgToday", "rmsgTomorrow", "rmsgMissed", "waHello"],
  billing: ["billingTitle", "submit", "clear", "person", "msgNoPerson", "notFound"]
};

export function createLabels(data, save) {
  data = data || {};
  if (Object.keys(data).length) mtSetType(data.managementType);
  const user = Object.assign({}, data.labels || {});
  const preset = LB_PRESETS[String(data.managementType || "").toLowerCase().trim()] || {};
  const dflt = k => (preset[k] !== undefined ? preset[k] : (LB_BASE[k] !== undefined ? LB_BASE[k] : k));
  const raw = k => {
    const u = user[k];
    return typeof u === "string" && u.trim() ? u : dflt(k);
  };
  const L = (k, v, d) => {
    v = v || {}; d = d || 0;
    return String(raw(k)).replace(/\{(\w+)\}/g, (m, n) =>
      n in v ? v[n] : (d < 3 && n in LB_BASE ? L(n, v, d + 1) : m));
  };
  const mk = (tag, cls, txt) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  };
  let on = false, curPage = null, cbk = null;

  /* একটি লেখা এডিট করার ছোট পপআপ */
  const editOne = k => {
    const ov = mk("div", "lb-ov"), box = mk("div", "lb-box");
    box.appendChild(mk("div", "lb-h", "✎ " + k));
    const d0 = String(dflt(k));
    const inp = mk(d0.length > 40 ? "textarea" : "input", "lb-in");
    if (inp.tagName === "TEXTAREA") inp.rows = 4;
    inp.value = user[k] || "";
    inp.placeholder = d0;
    box.appendChild(inp);
    const vars = d0.match(/\{\w+\}/g);
    if (vars) box.appendChild(mk("div", "lb-hint", "ব্যবহারযোগ্য: " + vars.join(" ")));
    const row = mk("div", "lb-btns");
    const reset = mk("button", "lb-b", "Default"), cancel = mk("button", "lb-b", "Cancel"), ok = mk("button", "lb-b lb-ok", "Save");
    reset.type = cancel.type = ok.type = "button";
    const close = () => ov.remove();
    const go = async val => {
      if (val === (user[k] || "")) return close();
      try {
        await save({ ["labels." + k]: val });
        user[k] = val;
        apply();
        if (cbk) cbk();
        close();
      } catch (err) {
        console.error(err);
        alert("Save failed: " + err.message);
      }
    };
    reset.onclick = () => go("");
    cancel.onclick = close;
    ok.onclick = () => go(inp.value.trim());
    ov.onclick = e => { if (e.target === ov) close(); };
    row.appendChild(reset); row.appendChild(cancel); row.appendChild(ok);
    box.appendChild(row);
    ov.appendChild(box); document.body.appendChild(ov);
    inp.focus();
  };

  const clearUI = () => {
    document.querySelectorAll(".lb-ed,.lb-msgs").forEach(e => e.remove());
  };

  /* Edit Mode চালু থাকলে ✎ আইকন ও নিচের Messages সারি */
  const pencils = () => {
    clearUI();
    document.querySelectorAll("[data-l],[data-lp]").forEach(e => {
      if (e.offsetParent === null) return;
      const k = e.dataset.l || e.dataset.lp;
      const p = mk("span", "lb-ed", "✎");
      p.dataset.k = k;
      p.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); editOne(k); };
      if (e.tagName === "INPUT") e.after(p); else e.appendChild(p);
    });
    const shown = new Set([...document.querySelectorAll(".lb-ed")].map(e => e.dataset.k));
    const keys = (LB_PAGES[curPage] || []).filter(k => !shown.has(k));
    if (!keys.length) return;
    const bar = mk("div", "lb-msgs");
    bar.appendChild(mk("div", "lb-msgs-h", "✎ Messages & hidden texts"));
    keys.forEach(k => {
      const t = L(k);
      const c = mk("span", "lb-chip", t.length > 24 ? t.slice(0, 24) + "…" : t);
      c.title = k;
      c.onclick = () => editOne(k);
      bar.appendChild(c);
    });
    document.body.appendChild(bar);
  };

  let restored = false;
  const apply = root => {
    root = root || document;
    if (!restored) {
      restored = true;
      const pg = detectEditPage();
      if (pg && getEditMode(pg) && !on) toggle(pg);
    }
    root.querySelectorAll("[data-l]").forEach(e => { e.textContent = L(e.dataset.l); });
    root.querySelectorAll("[data-lp]").forEach(e => { e.placeholder = L(e.dataset.lp); });
    relabel();
    if (!obs && (preset.person || preset.dashboardTitle)) {
      obs = new MutationObserver(relabel);
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (on) pencils();
  };
  /* পেজের কোডে হার্ডকোড করা ডিফল্ট লেখা (কলামের "Patient", টাইটেলের "Dashboard") ম্যানেজমেন্ট টাইপ অনুযায়ী বদলায় */
  let obs = null;
  const relabel = () => {
    if (!preset.person && !preset.dashboardTitle) return;
    document.querySelectorAll("th").forEach(t => {
      if (preset.person && t.textContent.trim() === "Patient") t.textContent = L("person");
    });
    const ti = document.getElementById("ti");
    if (ti && preset.dashboardTitle && ti.textContent.trim() === "Dashboard") ti.textContent = L("dashboardTitle");
  };

  const toggle = (page, cb) => {
    on = !on; curPage = page; cbk = cb || null;
    document.body.classList.toggle("lb-on", on);
    setEditMode(page, on);
    document.querySelectorAll("[data-lbt]").forEach(e => {
      if (e.dataset.t0 === undefined) e.dataset.t0 = e.textContent;
      e.textContent = on ? (e.dataset.on || "✔ Done") : e.dataset.t0;
    });
    if (on) pencils(); else clearUI();
  };

  return { L, apply, toggle, raw };
}
/* ===== LABELS শেষ ===== */

/* ===== EDIT MODE (প্রতি পেজের আলাদা + All) ===== */
export const EDIT_PAGES = [
  ["appointment", "Appointment"],
  ["billing", "Billing"],
  ["dashboard", "Dashboard"]
];
const EM_KEY = p => "rc_edit_" + p;
export function getEditMode(page) {
  try { return localStorage.getItem(EM_KEY(page)) === "1"; } catch (e) { return false; }
}
export function setEditMode(page, on) {
  if (!page) return;
  try { localStorage.setItem(EM_KEY(page), on ? "1" : "0"); } catch (e) {}
}
function detectEditPage() {
  if (window.RC_PAGE) return window.RC_PAGE;
  if (document.getElementById("slipTemplate")) return "appointment";
  if (document.getElementById("billingWrap")) return "billing";
  if (document.getElementById("dw")) return "dashboard";
  const path = (location.pathname || "").toLowerCase();
  const hit = EDIT_PAGES.find(([k]) => path.includes(k));
  return hit ? hit[0] : null;
}
/* Report পেজে কল করুন: mountEditModeToggles("editModeBox") */
export function mountEditModeToggles(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;
  if (!document.getElementById("em-style")) {
    const st = document.createElement("style");
    st.id = "em-style";
    st.textContent =
      ".em-row{display:flex;justify-content:space-between;align-items:center;padding:8px 2px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600}" +
      ".em-row.em-all{font-weight:700;color:#4f46e5;border-bottom:2px solid #e5e7eb}" +
      ".em-sw{position:relative;display:inline-block;width:38px;height:20px;flex-shrink:0;cursor:pointer}" +
      ".em-sw input{opacity:0;width:0;height:0;position:absolute}" +
      ".em-sl{position:absolute;inset:0;background:#ccc;transition:.2s;border-radius:20px}" +
      ".em-sl:before{position:absolute;content:'';height:14px;width:14px;left:3px;bottom:3px;background:#fff;transition:.2s;border-radius:50%}" +
      ".em-sw input:checked+.em-sl{background:#4f46e5}" +
      ".em-sw input:checked+.em-sl:before{transform:translateX(18px)}";
    document.head.appendChild(st);
  }
  const row = (id, label, cls) =>
    '<div class="em-row ' + (cls || "") + '"><span>' + label + '</span><label class="em-sw"><input type="checkbox" id="' + id + '"><span class="em-sl"></span></label></div>';
  box.innerHTML =
    row("em-all", "✎ All Edit", "em-all") +
    EDIT_PAGES.map(([k, n]) => row("em-" + k, n)).join("");
  const all = document.getElementById("em-all");
  const sync = () => {
    EDIT_PAGES.forEach(([k]) => { document.getElementById("em-" + k).checked = getEditMode(k); });
    all.checked = EDIT_PAGES.every(([k]) => getEditMode(k));
  };
  EDIT_PAGES.forEach(([k]) => {
    document.getElementById("em-" + k).addEventListener("change", e => { setEditMode(k, e.target.checked); sync(); });
  });
  all.addEventListener("change", e => {
    EDIT_PAGES.forEach(([k]) => setEditMode(k, e.target.checked));
    sync();
  });
  window.addEventListener("pageshow", sync);
  sync();
}
/* ===== EDIT MODE শেষ ===== */

/* Report পেজে (#myReportWrap আছে) Edit Mode টগল নিজে থেকে বসবে */
(function autoMountEditToggles() {
  const go = () => {
    const wrap = document.getElementById("myReportWrap");
    if (!wrap || document.getElementById("editModeBox")) return;
    const card = document.createElement("div");
    card.className = "wrap";
    card.innerHTML = '<div class="sec"><div class="sec-title">✎ Edit Mode</div><div id="editModeBox"></div></div>';
    const second = wrap.querySelectorAll(":scope > .wrap")[1];
    second ? wrap.insertBefore(card, second) : wrap.appendChild(card);
    mountEditModeToggles("editModeBox");
    mountMgmtSelect();
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();

/* টাইটেলের বাম পাশে পেজের আইকন; ✎ সুইচ আর ক্লিক-টগল বন্ধ (টগল এখন Report পেজে) */
(function pageIcons() {
  const go = () => {
    const pg = detectEditPage();
    const ICON = { appointment: "📅", billing: "🧾", dashboard: "📊" };
    document.querySelectorAll(".lb-sw").forEach(e => {
      e.removeAttribute("data-lbt");
      e.removeAttribute("onclick");
      e.onclick = null;
      if (ICON[pg]) e.textContent = ICON[pg];
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();

/* ===== ম্যানেজমেন্ট টাইপ: কেন্দ্রীয় সেটআপ ===== */
let MT_TYPE = "", MT_LOADED = false, MT_OBS = null, MT_RAF = 0;
const MT_FIELDS = {
  student: { name: "Student Name", time: "Class Time", date: "Admission Date" },
  worker: { name: "Worker Name", time: "Shift Time", date: "Work Date" },
  client: { name: "Client Name", time: "Booking Time", date: "Booking Date" },
  staff: { name: "Staff Name", time: "Duty Time", date: "Duty Date" }
};
function mtPreset() { return LB_PRESETS[MT_TYPE] || {}; }
function mtFieldName(k) { const f = MT_FIELDS[MT_TYPE]; return (f && f[k]) || null; }
function mtSetType(t) {
  MT_LOADED = true;
  MT_TYPE = String(t || "").toLowerCase().trim();
  if (!LB_PRESETS[MT_TYPE]) MT_TYPE = "";
  document.dispatchEvent(new Event("rc-preset"));
}
/* স্ক্রিনের বাড়তি লেখা: ব্লগারের "Add Patient" মেনু, স্লিপের টাইটেল ও ID, Report-এর বাংলা "পেশেন্ট" */
function mtRelabel() {
  const p = mtPreset();
  if (!MT_TYPE || !p.person) return;
  const map = { "Add Patient": "Add " + p.person, "Appointment Slip": p.slipTitle, "Patient ID": p.slipId };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const par = n.parentNode && n.parentNode.nodeName;
    if (par === "SCRIPT" || par === "STYLE" || par === "TEXTAREA") continue;
    const t = n.nodeValue, k = t.trim();
    if (map[k] && map[k] !== k) n.nodeValue = t.replace(k, map[k]);
    else if (p.bnPerson && t.indexOf("পেশেন্ট") > -1) n.nodeValue = t.split("পেশেন্ট").join(p.bnPerson);
  }
}
document.addEventListener("rc-preset", () => {
  if (!MT_TYPE) return;
  mtRelabel();
  if (!MT_OBS) {
    MT_OBS = new MutationObserver(() => {
      if (MT_RAF) return;
      MT_RAF = requestAnimationFrame(() => { MT_RAF = 0; mtRelabel(); });
    });
    MT_OBS.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
});
/* যে পেজ createLabels ব্যবহার করে না (যেমন Report), সেখানে ইউজারের টাইপ নিজে লোড করি */
r(auth, async u => {
  if (!u || detectEditPage()) return;
  try {
    const s = await GD(DO(db, "users", u.uid));
    if (s.exists() && !MT_LOADED) mtSetType(s.data().managementType);
    mtSelectSync(s.exists() ? s.data().managementType : "");
  } catch (e) { console.error(e); }
});
/* Report পেজে টাইপ বদলানোর সিলেক্ট (Edit Mode কার্ডের ভেতরে) */
let MT_SEL_VAL = "";
function mtSelectSync(v) {
  MT_SEL_VAL = String(v || "").toLowerCase().trim() || "patient";
  const sel = document.getElementById("mtSel");
  if (sel) sel.value = LB_PRESETS[MT_SEL_VAL] ? MT_SEL_VAL : "patient";
}
function mountMgmtSelect() {
  const box = document.getElementById("editModeBox");
  if (!box || document.getElementById("mtSel")) return;
  const row = document.createElement("div");
  row.className = "em-row";
  row.innerHTML = '<span>Management Type</span><select id="mtSel" style="font-size:13px;padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;background:#fff">' +
    Object.keys(LB_PRESETS).map(k => '<option value="' + k + '">' + k.charAt(0).toUpperCase() + k.slice(1) + '</option>').join("") + '</select>';
  box.appendChild(row);
  const sel = row.querySelector("select");
  sel.value = LB_PRESETS[MT_SEL_VAL] ? MT_SEL_VAL : "patient";
  sel.addEventListener("change", async () => {
    const u = auth.currentUser;
    if (!u) return alert("Login required");
    try {
      await UPD(DO(db, "users", u.uid), { managementType: sel.value });
      mtSetType(sel.value);
      alert("Saved. Other pages will update when opened.");
    } catch (e) { console.error(e); alert("Save failed: " + e.message); }
  });
}
/* ===== ম্যানেজমেন্ট টাইপ শেষ ===== */

/* ===== Doctor চিপ (Appointment পেজ): Name-এর ডান পাশে, ড্রপডাউনে নাম যোগ/এডিট/ডিলিট (শুধু এডিট মোডে) ===== */
(function doctorChip() {
  const start = () => {
    if (detectEditPage() !== "appointment") return;
    const ff = document.getElementById("ff");
    if (!ff) return;
    let list = [], selected = "", editIdx = -1;

    const menuHTML = () => {
      const rows = list.length
        ? list.map((n, i) =>
            '<div class="item-row"><span class="doc-name' + (n === selected ? " checked" : "") + '" data-di="' + i + '">' + ES(n) +
            '</span><span class="edit-ic" data-ei="' + i + '">&#9998;</span></div>').join("")
        : '<div class="item-row"><span class="doc-empty">No doctor added</span></div>';
      return rows + '<div class="item-add-row"><span data-dadd="1">+</span></div>';
    };
    const paint = () => {
      window.__rcDoctor = selected;
      const menu = document.getElementById("docMenu"), btn = document.getElementById("docBtn");
      if (!menu || !btn) return;
      menu.innerHTML = menuHTML();
      const shown = selected || (mtPreset().doctor || "Doctor");
      btn.textContent = shown.length > 14 ? shown.slice(0, 13) + "…" : shown;
      btn.title = shown;
    };
    const persist = async () => {
      const u = auth.currentUser;
      if (!u) return alert("Login required");
      try { await UPD(DO(db, "users", u.uid), { doctorList: list }); } catch (err) { console.error(err); alert("Save failed: " + err.message); }
    };
    const inject = () => {
      const tc = document.getElementById("tcInline");
      if (!tc || document.getElementById("docChipDD")) return;
      const wrap = document.createElement("div");
      wrap.className = "rc-chip-dd";
      wrap.id = "docChipDD";
      wrap.innerHTML = '<span class="rc-chip selected" id="docBtn">Doctor</span><div class="rc-dd-menu" id="docMenu"></div>';
      if (tc.style.display === "none") {
        tc.querySelectorAll(".rc-chip-dd").forEach(x => { x.style.display = "none"; });
        tc.style.display = "flex";
      }
      tc.appendChild(wrap);
      selected = "";
      paint();
    };

    document.body.insertAdjacentHTML("beforeend",
      '<div class="rc-modal" id="docModal"><div class="rc-modal-box"><h3 id="docModalTitle">Add Doctor</h3>' +
      '<input class="rc-input" id="docModalName" placeholder="Doctor name" autocomplete="off">' +
      '<div class="rc-modal-actions" style="margin-top:14px"><button class="c-no" id="docDel" type="button" hidden>Delete</button>' +
      '<button class="c-no" id="docCancel" type="button">Cancel</button>' +
      '<button class="rc-btn rc-btn-primary" style="flex:1" id="docSave" type="button">Save</button></div></div></div>');
    const nameInput = document.getElementById("docModalName");
    const openDocModal = idx => {
      editIdx = idx;
      document.getElementById("docModalTitle").textContent = (idx >= 0 ? "Edit " : "Add ") + (mtPreset().doctor || "Doctor");
      nameInput.value = idx >= 0 ? list[idx] : "";
      document.getElementById("docDel").hidden = idx < 0;
      openModal("docModal");
      nameInput.focus();
    };

    document.addEventListener("click", e => {
      const menu = document.getElementById("docMenu");
      if (e.target.closest("#docBtn")) {
        toggleDropdown(menu);
        if (menu.classList.contains("open")) {
          menu.style.right = "0px";
          const rc = menu.getBoundingClientRect(), vw = document.documentElement.clientWidth;
          if (rc.left < 8) menu.style.right = (rc.left - 8) + "px";
          else if (rc.right > vw - 8) menu.style.right = (rc.right - vw + 8) + "px";
        }
        return;
      }
      if (!e.target.closest("#docMenu")) return;
      const ed = e.target.closest("[data-ei]"), nm = e.target.closest("[data-di]"), ad = e.target.closest("[data-dadd]");
      if (ed) { e.stopPropagation(); openDocModal(+ed.dataset.ei); }
      else if (ad) { e.stopPropagation(); openDocModal(-1); }
      else if (nm) {
        const name = list[+nm.dataset.di];
        selected = selected === name ? "" : name;
        paint();
        menu.classList.remove("open");
      }
    });
    document.getElementById("docCancel").onclick = () => closeModal("docModal");
    document.getElementById("docSave").onclick = async () => {
      const name = nameInput.value.trim().replace(/\s+/g, " ");
      if (!name) return alert("Enter name");
      if (list.some((n, i) => i !== editIdx && n.toLowerCase() === name.toLowerCase())) return alert("Name exists");
      if (editIdx >= 0) { if (selected === list[editIdx]) selected = name; list[editIdx] = name; }
      else list.push(name);
      await persist();
      paint();
      closeModal("docModal");
    };
    document.getElementById("docDel").onclick = async () => {
      if (editIdx < 0 || !confirm("Delete?")) return;
      if (selected === list[editIdx]) selected = "";
      list.splice(editIdx, 1);
      await persist();
      paint();
      closeModal("docModal");
    };

    document.addEventListener("rc-preset", () => { paint(); });
    new MutationObserver(inject).observe(ff, { childList: true });
    inject();
    r(auth, async u => {
      if (!u) return;
      try {
        const s = await GD(DO(db, "users", u.uid));
        if (s.exists() && Array.isArray(s.data().doctorList)) list = s.data().doctorList.slice();
      } catch (err) { console.error(err); }
      paint();
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();
})();
