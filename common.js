import{initializeApp as t,getApps as e}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";import{getFirestore as n,updateDoc as UPD,collection as CO,doc as DO,getDoc as GD,getDocs as GS,addDoc as AD,deleteDoc as DL,onSnapshot as ON,query as QU,where as WH}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";import{getAuth as o,onAuthStateChanged as r,signOut as SO,EmailAuthProvider as EP,reauthenticateWithCredential as RA}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";export const app=e().length?e()[0]:t({apiKey:"AIzaSyDAicuq_q2KoKLx01Yejo3jEx64n5tZOJA",authDomain:"rah-care.firebaseapp.com",projectId:"rah-care",storageBucket:"rah-care.firebasestorage.app",messagingSenderId:"205338868264",appId:"1:205338868264:web:c5cb43f269346374c2531d"});export const db=n(app);export const auth=o(app);export function blockCacheAndBack(){history.pushState(null,null,location.href),window.addEventListener("popstate",function(){history.pushState(null,null,location.href)}),window.addEventListener("pageshow",function(t){t.persisted&&window.location.reload()}),document.documentElement.style.visibility="hidden"}export function requireAuth(t,e="https://rahcare.blogspot.com/p/login.html"){return r(auth,n=>{if(!n)return localStorage.clear(),void window.location.replace(e);t(n)})}export function togglePasswordVisibility(t,e){const n=document.getElementById(t),o="password"===n.type;n.type=o?"text":"password",e.textContent=o?"🔒":"👁"}export function formatDateDMY(t){const e=new Date(t);return isNaN(e.getTime())?null:`${String(e.getDate()).padStart(2,"0")}.${String(e.getMonth()+1).padStart(2,"0")}.${String(e.getFullYear()).slice(-2)}`}export function formatTime12(t){if(!t)return"";const e=String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/);if(!e)return t;let n=parseInt(e[1],10);const o=parseInt(e[2],10);let r=e[3]?e[3].toUpperCase():null;r||(r=n>=12?"PM":"AM",n%=12,0===n&&(n=12));const a=String(n).padStart(2,"0");return 0===o?`${a} ${r}`:`${a}:${String(o).padStart(2,"0")} ${r}`}export function copyToClipboard(t){navigator.clipboard&&navigator.clipboard.writeText(String(t))}export const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];export function toWhatsAppNumber(t){let e=String(t||"").replace(/\D/g,"");return e.startsWith("01")&&11===e.length?"88"+e:e}export function whatsappLink(t,e=""){const n=toWhatsAppNumber(t);if(!n)return"";const o=`https://api.whatsapp.com/send?phone=${n}`;return e?`${o}&text=${encodeURIComponent(e)}`:o}export function autoClearAuthForm(t=".auth-card input"){function e(){document.querySelectorAll(t).forEach(t=>t.value="")}window.addEventListener("pagehide",e),window.addEventListener("pageshow",function(t){e(),t.persisted&&location.reload()})}export function initDropdowns(t=".rc-dd",e=".rc-dd-menu"){document.addEventListener("click",n=>{n.target.closest(t)||document.querySelectorAll(e+".open").forEach(t=>t.classList.remove("open"))})}export function toggleDropdown(t,e=".rc-dd-menu"){const n=t.classList.contains("open");document.querySelectorAll(e+".open").forEach(t=>t.classList.remove("open")),n||(t.classList.add("open"),fitMenu(t))}export async function loadTimeSlots(){try{const t=await(await fetch(RAHCARE_BASE+"time-data.json")).json();return Array.isArray(t.times)&&t.times.length?t.times:[]}catch(e){console.error(e);return[]}}export function ymd(y,m,d){return y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0")}export function docsOf(s,k="id"){return s.docs.map(d=>({[k]:d.id,...d.data()}))}export function toISODate(t){return ymd(t.getFullYear(),t.getMonth()+1,t.getDate())}export function toISOMonth(t){return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")}export function openModal(t){const e="string"==typeof t?document.getElementById(t):t;e&&e.classList.add("show")}export function closeModal(t){const e="string"==typeof t?document.getElementById(t):t;e&&e.classList.remove("show")}export function isPaid(t){return void 0!==t.bill&&"unpaid"!==String(t.bill).trim().toLowerCase()&&""!==String(t.bill).trim()&&"0"!==String(t.bill).trim()}export function monthLabel(t){const e=(t+"").split("-");return(MONTH_NAMES[parseInt(e[1])-1]||"")+" "+e[0]}export const RAHCARE_BASE="https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/";export function isHijama(t){return!!t.category&&(t.category+"").trim().toLowerCase().startsWith("hijama")}export async function fetchAddressData(){const t=await fetch(RAHCARE_BASE+"address-data.js").then(t=>t.text());return Function(t+";return addressData;")()}export function initAddressDropdown({menuId:t,btnId:e,valueId:n,addressData:o,onSelect:r}){const a=document.getElementById(t),i=document.getElementById(e),s=document.getElementById(n);function v(t,e,n){const o=[t,e,n].filter(Boolean).join(", ");"INPUT"===s.tagName?s.value=o:s.textContent=o,i&&i.classList.add("selected")}function c(t,e,n){const o=document.createElement("span");o.textContent=t,n&&(o.className=n),o.onclick=t=>{t.stopPropagation(),e()},a.appendChild(o)}function p(t,e,n){v(t,e,n),a.classList.remove("open"),r&&r(t,e,n),d()}function d(){a.innerHTML="",Object.keys(o).forEach(t=>{c(t,()=>l(t))})}function l(t){v(t),a.innerHTML="",c("🔙 Back to Divisions",d,"rc-dd-back"),Object.keys(o[t]).forEach(e=>{c(e,()=>{v(t,e);(function(t,e){a.innerHTML="",c("🔙 Back to Districts",()=>l(t),"rc-dd-back"),(o[t][e]||[]).forEach(n=>{c(n,()=>p(t,e,n))}),c("",()=>p(t,e),"rc-dd-done")})(t,e)})}),c("",()=>p(t),"rc-dd-done")}return a.classList.add("rc-dd-grid"),d(),{reset:d}}export function createChipPicker({btnId:t,menuId:e,valueId:n,multi:o=!1,labelMap:r={},onChange:a}){const i=o?new Set:{value:null},s=document.getElementById(t),c=n?document.getElementById(n):s;function l(){const t=o?[...i]:i.value?[i.value]:[];c.textContent=t.length?t.map(t=>r[t]||t).join(" + "):"Select",s.classList.toggle("selected",t.length>0),document.querySelectorAll(`#${e} span`).forEach(t=>{t.classList.toggle("checked",o?i.has(t.dataset.val):t.dataset.val===i.value)})}return l(),{pick(t){o?i.has(t)?i.size>1&&i.delete(t):i.add(t):i.value=t,l(),a&&a(o?[...i]:t)},reset(t){o?(i.clear(),t&&i.add(t)):i.value=t||null,l()},get:()=>o?[...i]:i.value}}export function redirectAfterMessage(t,e,n="https://rahcare.blogspot.com/p/dashboard.html"){const o="whatsapp://send?phone="+toWhatsAppNumber(t),r="sms:"+t+(/iPhone|iPad|iPod/.test(navigator.userAgent)?"&body=":"?body=")+encodeURIComponent(e);let a=!1;function i(){a||(a=!0,window.location.replace(n))}document.addEventListener("visibilitychange",function t(){"visible"===document.visibilityState&&(document.removeEventListener("visibilitychange",t),i())}),setTimeout(i,8e3),window.location.href=o,setTimeout(()=>{a||"visible"!==document.visibilityState||(window.location.href=r)},1500)}export async function downloadElementAsImage(t,e,{scale:n=2,width:o,windowWidth:r}={}){try{const a={scale:n,useCORS:!0,logging:!1,backgroundColor:"#ffffff"};o&&(a.width=o),r&&(a.windowWidth=r);const i=await html2canvas(document.getElementById(t),a),s=document.createElement("a");return s.download=e,s.href=i.toDataURL("image/png"),s.click(),await new Promise(t=>setTimeout(t,1500)),!0}catch(t){return console.error("Image generation failed:",t),!1}}export const $=i=>document.getElementById(i),
sh=(i,v)=>$(i).style.display=v,
md=(i,on)=>$(i).classList.toggle("show",on),
ER=e=>{console.error(e);alert("Error")},
ES=t=>(t+"").replace(/[&<>"]/g,z=>"&#"+z.charCodeAt(0)+";"),
SM=(a,k)=>a.reduce((m,z)=>m+(z[k]||0),0),
OD=t=>{const e=new Date;return e.setDate(e.getDate()+t),toISODate(e)};
export function mountEditModals(t="Edit Form"){if($("mh"))return;window.MD=md;document.body.insertAdjacentHTML("beforeend",`<div id="mh" class="c-modal" onclick="MD('mh',0)"><div class="c-box" style="width:calc(100% - 32px);max-width:560px" onclick="event.stopPropagation()"><h3>${t}</h3><div id="hl" class="lb lbx"></div><div class="bx"><button class="c-no c-no-sm" onclick="MD('mh',0)">Cancel</button><button class="c-yes" onclick="HV()">Save</button></div></div></div><div id="mi" class="c-modal"><div class="c-box" style="width:calc(100% - 32px);max-width:300px"><h3 id="it"></h3><input class="rc-input" id="in" maxlength="40" autocomplete="off" style="margin-bottom:12px" onkeydown="event.key=='Enter'&&FS()"><div id="mt" style="display:none"><select class="rc-input" id="mty" onchange="MT()" style="margin-bottom:8px"><option value="t">Text field</option><option value="d">Dropdown (options)</option></select><textarea class="rc-input" id="mop" rows="4" style="height:auto;padding:8px 12px;margin-bottom:12px;display:none" placeholder="One option per line"></textarea></div><div class="bx"><button class="c-no c-no-sm" id="id" onclick="FD()">Delete</button><button class="c-no c-no-sm" onclick="MD('mi',0)">Cancel</button><button class="c-yes" onclick="FS()">Save</button></div></div></div>`);const hl=$("hl");hl&&new MutationObserver(fmToggle).observe(hl,{childList:true})}
export const renderEditList=(hc,mx,w)=>{$("hl").innerHTML=hc.map((c,i)=>`<div class="lr${w&&c.h?" hid":""}"><span class="ar${i?"":" off"}" onclick="HM(${i},-1)">▲</span><span class="ar${i<hc.length-1?"":" off"}" onclick="HM(${i},1)">▼</span><span class="nm">${ES(c.n)}${c.o&&c.o.length?' <small class="dd-tag">▾ '+c.o.length+'</small>':""}</span>${w?`<select class="ws" onchange="HW(${i},this.value)">${[1,2,3,4].map(n=>`<option${n==c.w?" selected":""}>${n}</option>`).join("")}</select><span class="hd" title="Show / Hide" onclick="HH(${i})">${c.h?"🚫":"👁"}</span>`:""}<span class="ed" onclick="HE(${i})">✎</span></div>`).join("")+(hc.length<mx?`<div class="lr la" onclick="HE(-1)">+</div>`:"")};
export function createFormEditor({defaults:D0,max:mx=12,get:gt,apply:ap,save:sv}){const D=D0.map(([k,n,w])=>({k,n,w:w||(k=="name"||k=="items"?1:2)})),WS={},paint=()=>{const f=$("ff");f&&f.querySelectorAll(BLK).forEach(e=>{const m=e.querySelector(SEL),w=WS[e.dataset.k||m&&(FK[m.id]||m.dataset.x)];w&&(e.style.gridColumn="span "+12/w)})};let hc=[],ce=-1,RAW="";const parse=s=>{s==null||(RAW=s);const fk=detectEditPage();fk&&FORM_DEFAULT[fk]&&(s="");const r=(s||"").split("|").filter(Boolean).map(z=>{const i=z.indexOf(":"),[k,w,fl]=z.slice(0,i).split("~"),q=z.slice(i+1).split("\u241E");return{k,n:q[0],w:+w,h:/h/.test(fl||""),o:q[1]?q[1].split("\u241F").filter(Boolean):[]}}).filter(z=>z.n&&(D.some(d=>d.k==z.k)||/^c[a-z0-9]+$/.test(z.k)));r.forEach(z=>z.w>0&&z.w<5||(z.w=(D.find(d=>d.k==z.k)||{w:2}).w));D.forEach(d=>r.some(z=>z.k==d.k)||r.push({...d,n:mtFieldName(d.k)||d.n}));r.forEach(z=>{z.k=="name"&&(z.w=1);WS[z.k]=z.w});return r},RL=()=>renderEditList(hc,1/0,1);mountEditModals();$("ff")&&new MutationObserver(()=>{paint();EC()}).observe($("ff"),{childList:true});Object.assign(window,{MD:md,EF:()=>{hc=gt().map(z=>({...z}));RL();md("mh",1)},HW:(i,v)=>{hc[i].w=+v},HH:i=>{hc[i].h=!hc[i].h;RL()},MT:()=>{$("mop").style.display=$("mty").value=="d"?"":"none"},HM:(i,d)=>{hc[i+d]&&([hc[i],hc[i+d]]=[hc[i+d],hc[i]],RL())},HE:i=>{ce=i;$("it").textContent=i<0?"Add Field":"Edit Field";$("in").value=i<0?"":hc[i].n;const cu=i<0||hc[i].k[0]=="c";$("id").style.display=i>=0&&hc[i].k[0]=="c"?"":"none";$("mt").style.display=cu?"":"none";$("mty").value=i>=0&&hc[i].o&&hc[i].o.length?"d":"t";$("mop").value=i>=0&&hc[i].o?hc[i].o.join("\n"):"";$("mop").style.display=$("mty").value=="d"?"":"none";md("mi",1);$("in").focus()},FS:()=>{const n=$("in").value.trim().replace(/[|\s]+/g," ");if(!n)return alert("Enter name");const cu=ce<0||hc[ce].k[0]=="c";let o=[];if(cu&&$("mty").value=="d"){o=[...new Set($("mop").value.split("\n").map(x=>x.replace(/[|\u241E\u241F]/g," ").replace(/\s+/g," ").trim()).filter(Boolean))];if(!o.length)return alert("Add at least one option")}ce<0?hc.push({k:"c"+Date.now().toString(36),n,w:2,o}):(hc[ce].n=n,cu&&(hc[ce].o=o));md("mi",0);RL()},FD:()=>{confirm("Delete?")&&(hc.splice(ce,1),md("mi",0),RL())},HV:async()=>{try{const str=hc.map(z=>z.k+"~"+z.w+(z.h?"~h":"")+":"+z.n+(z.o&&z.o.length?"\u241E"+z.o.join("\u241F"):"")).join("|");await sv(str);RAW=str;const fk=detectEditPage();if(fk&&FORM_DEFAULT[fk]){FORM_DEFAULT[fk]=false;try{await UPD(DO(db,"users",auth.currentUser.uid),{["formDefault."+fk]:false})}catch(x){console.error(x)}}hc.forEach(z=>WS[z.k]=z.w);ap(hc);paint();md("mh",0)}catch(e){ER(e)}},__rcFormMode:()=>{const rows=parse(RAW);ap(rows);hc=gt().map(z=>({...z}));RL()}});return{parse}}
export async function addLogos(root,u,ids){const url=u.logoUrl||u.logo||u.centerLogo||"";root.classList.toggle("hasLogo",!!url);for(const d of ids){let w=$(d);w||(w=new Image,w.id=d,w.className=/WM$/.test(d)?"wm":"lg",w.crossOrigin="anonymous",root.appendChild(w));if(!url){w.style.display="none";continue}await new Promise(r=>{w.onload=w.onerror=r,w.src=url});w.style.display=w.naturalWidth?"block":"none"}}
export const getExtras=p=>{const o={...p};document.querySelectorAll("#ff [data-x]").forEach(i=>{const t=i.value.trim();t?o[i.dataset.x]=t:delete o[i.dataset.x]});window.__rcDoctor&&(o.doctor=window.__rcDoctor,o.raqi=window.__rcDoctor);delete o.fc;const c={};document.querySelectorAll("#ff .fc-c[data-v]").forEach(e=>c[e.dataset.n]=e.dataset.v);Object.keys(c).length&&(o.fc=c);return o},setExtras=x=>{x&&(document.querySelectorAll("#ff [data-x]").forEach(i=>{const t=x[i.dataset.x];t&&(i.value=t)}),x.fc&&document.querySelectorAll("#ff .fc-c").forEach(e=>fcPick(e,x.fc[e.dataset.n])))};
function fitMenu(m){const g=m.closest("#ff");if(!g||!m.classList.contains("rc-dd-grid"))return;const a=m.parentElement.getBoundingClientRect(),b=g.getBoundingClientRect(),s=m.style;s.width=b.width+"px";s.left=b.left-a.left+"px";s.right="auto"}
export async function RQ(ref,list,name){name=(name||"").trim();if(!name||list.some(x=>x.toLowerCase()===name.toLowerCase()))return list;const nl=[...list,name];await UPD(ref,{raqiList:nl});return nl}
export const MY=(c,k,v)=>QU(CO(db,c),WH(k,"==",v));export{CO,DO,GD,AD,DL,ON};
async function loadUserBase(t,e="https://rahcare.blogspot.com/p/login.html"){let r=DO(db,"users",t.uid),d={};try{const s=await GS(MY("users","uid",t.uid));s.empty||(d=s.docs[0].data(),r=s.docs[0].ref)}catch(s){console.error(s)}return d.suspended?(alert("Suspended"),SO(auth).then(()=>{location.href=e}),null):{ref:r,d}}
export function initFeeNotice(u,G,B="01780972945"){const x=$("fx");if(!x)return{upd(){},stop(){}};let FE=[],NT=[],nid=null,amt=0;x.innerHTML=`<div class="site-notice" id="sn"><div class="site-notice-inner">ℹ️<span id="snt"></span><button class="site-notice-close" onclick="DN()">&times;</button></div></div><div class="fee-banner" id="fb"><div class="fee-banner-inner">🔔<span id="fbt"></span><button class="fee-btn-pay" onclick="OF()">Pay</button></div></div><div class="fee-banner fee-banner-pending" id="fp"><div class="fee-banner-inner">⏳<span id="fpt"></span></div></div><div id="mf" class="c-modal"><div class="c-box" style="max-width:300px"><h3>📱 Platform Fee</h3><p id="fmd" style="font-size:13px;color:#475569;margin:0 0 12px"></p><div class="fee-num-box"><span id="fbn"></span><button class="fee-copy-btn" onclick="CB()">📋</button></div><div class="fee-num-box"><span id="fav"></span><button class="fee-copy-btn" onclick="CA()">📋</button></div><div class="fee-action-row"><a href="tel:*247%23" class="fee-action-btn">☎️ *247#</a><button class="fee-action-btn" onclick="OB()">📱 App</button></div><p style="font-size:11px;color:#94a3b8;margin:10px 0 16px">Tap after sending.</p><div class="c-row"><button class="c-yes" style="background:#16a34a" onclick="PF()">Paid</button></div><button class="c-no c-no-full" style="margin-top:8px" onclick="md('mf',0)">Close</button></div></div><div id="ft" class="fee-toast">✅ Confirmed</div>`;const sb=(i,o)=>sh(i,o?"block":"none"),LB=a=>a.map(z=>monthLabel(z.period)).join(", "),DS=()=>{try{return JSON.parse(localStorage.getItem("dismissedNotices")||"[]")}catch{return[]}},FW=()=>{const t=new Date,e=[];for(let n=1;n<=6;n++){const m=toISOMonth(new Date(t.getFullYear(),t.getMonth()-n,1));if(FE.some(z=>z.period===m))continue;const s=new Set;G().forEach(g=>{g.date&&(g.date+"").slice(0,7)===m&&isPaid(g)&&s.add((g.phone||"").trim()+"|"+(g.name||"").trim())});s.size&&e.push({period:m,count:s.size,amount:50*s.size})}return e},FB=()=>{const n=FW(),p=FE.filter(z=>z.status==="pending");n.length&&($("fbt").innerHTML=`<b>${LB(n)}</b>: ${SM(n,"count")} pts, due <b>Tk ${SM(n,"amount")}</b>`);sb("fb",n.length);p.length&&($("fpt").innerHTML=`<b>${LB(p)}</b>: Tk ${SM(p,"amount")} verifying`);sb("fp",p.length)},NZ=()=>{const e=DS(),n=NT.filter(t=>(t.scope==="global"||t.scope===u)&&!e.includes(t.id))[0];n&&(nid=n.id,$("snt").textContent=n.message||"");sb("sn",n)},mp=s=>docsOf(s),a=ON(MY("platformFees","uid",u),s=>{FE=mp(s);FB()}),b=ON(MY("notices","active",!0),s=>{NT=mp(s);NZ()});Object.assign(window,{DN:()=>{if(!nid)return;const t=DS();t.includes(nid)||t.push(nid);try{localStorage.setItem("dismissedNotices",JSON.stringify(t))}catch{}NZ()},OF:()=>{amt=SM(FW(),"amount");$("fbn").textContent=B;$("fav").textContent="Tk "+amt;$("fmd").innerHTML=`Send <b>Tk ${amt}</b> via bKash, then tap Paid.`;md("mf",1)},CB:()=>copyToClipboard(B),CA:()=>copyToClipboard(amt),OB:()=>{location.href="intent://#Intent;package=com.bKash.customerapp;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.bKash.customerapp;end"},PF:async()=>{try{await Promise.all(FW().map(t=>AD(CO(db,"platformFees"),{uid:u,period:t.period,patientCount:t.count,amount:t.amount,status:"pending",confirmedAt:(new Date).toISOString()})));md("mf",0);const e=$("ft");e.querySelector("span")||(e.innerHTML="✅ <span>Submitted, awaiting verification</span>");e.style.display="block";setTimeout(()=>e.style.display="none",2500)}catch(e){ER(e)}},md});return{upd:FB,stop(){a();b()}}}

/* ===== LABELS: common.js-এর একদম শেষে পেস্ট করুন ===== */
/* অগ্রাধিকার: ইউজারের নিজের লেবেল (users/{uid}.labels) > managementType প্রিসেট > BASE ডিফল্ট
   শুধু স্ক্রিনের লেখা বদলায়, ডাটাবেসের কী (name, phone, idNumber...) কখনো না */
const LB_BASE = {
  person: "Patient", persons: "patients",
  symptomDx: "Symptom Diagnosis", responseDx: "Response Diagnosis", prescription: "Prescription",
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
let MT_SEL_VAL = ""; /* ফাইলের শুরুতে, কারণ নিচের autoMountEditToggles লোডের সময়ই এটা ব্যবহার করে */
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
  dashboard: ["searchPh", "addCard", "emptyToday", "results", "noMatch", "persons", "reminders", "rToday", "rTomorrow", "rMissed", "rmsgToday", "rmsgTomorrow", "rmsgMissed", "waHello", "symptomDx", "responseDx", "prescription"],
  billing: ["billingTitle", "submit", "clear", "person", "msgNoPerson", "notFound"]
};

const PAGE_ICONS = { appointment: "📅", billing: "🧾", dashboard: "📊" };
const LB_SHOW_MSGS = false; /* true করলে Edit Mode-এ নিচে "Messages & hidden texts" সারি আবার দেখাবে */
/* ===== NAV MENU NAMES: Blogger টেমপ্লেটের মেনু লিংক (/p/xxx.html) এর লেখা ইউজার বদলাতে পারবে (labels.nav_xxx) ===== */
const NAV_REX = /\/p\/([\w-]+)\.html/, NAV_SKIP = new Set(["login", "sign-up"]), NAVDEF = {};
const navEls = () => [...document.querySelectorAll("a[href],option[value]")].filter(e => {
  if (e.closest("#rc-app")) return false;
  if (e.id === "menuToggleBtn") { e.dataset.rcNav = "menu"; return true; }
  const m = NAV_REX.exec(e.getAttribute("href") || e.value || "");
  if (!m || NAV_SKIP.has(m[1])) return false;
  e.dataset.rcNav = m[1];
  return true;
});
const navTexts = e => {
  if (e.tagName === "OPTION") return [e];
  const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), out = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (n.nodeValue.trim() && !(n.parentElement && n.parentElement.closest(".lb-ed"))) out.push(n);
  }
  return out;
};
const navGet = e => e.tagName === "OPTION" ? e.textContent.trim() : navTexts(e).map(n => n.nodeValue.trim()).join(" ").trim();
const navSet = (e, txt) => {
  if (e.tagName === "OPTION") { e.textContent = txt; return; }
  const t = navTexts(e);
  if (!t.length) return;
  t[0].nodeValue = txt;
  t.slice(1).forEach(n => { n.nodeValue = ""; });
};
let NAVLAB = {}, navObs = null;
const navSync = () => {
  navEls().forEach(e => {
    const k = "nav_" + e.dataset.rcNav, cur = navGet(e);
    const v = typeof NAVLAB[k] === "string" ? NAVLAB[k].trim() : "";
    if (e.dataset.rcNav0 === undefined) { e.dataset.rcNav0 = cur; if (NAVDEF[k] === undefined) NAVDEF[k] = cur; }
    if (v) {
      if (cur !== v) navSet(e, v);
      e.dataset.rcNavC = "1";
    } else if (e.dataset.rcNavC) {
      navSet(e, e.dataset.rcNav0);
      delete e.dataset.rcNavC;
    } else if (cur && cur !== e.dataset.rcNav0) { /* টেমপ্লেট নিজে লেখা বদলালে (যেমন Add Patient) সেটাই ডিফল্ট */
      e.dataset.rcNav0 = cur; NAVDEF[k] = cur;
    }
  });
};
export function applyNavLabels(labels) {
  NAVLAB = labels || {};
  navSync();
  if (!navObs) {
    navObs = new MutationObserver(navSync);
    navObs.observe(document.querySelector(".nav-wrapper") || document.body, { childList: true, subtree: true, characterData: true });
  }
}
/* ===== NAV MENU NAMES শেষ ===== */

/* ===== THEME: সাইটজুড়ে রং (users.theme) — Edit Mode-এর 🎨 Colors থেকে বদলানো যায় ===== */
const HEX = /^#[0-9a-f]{6}$/i;
const THEME_VARS = { text: ["--text-main", "--text-color"], bg: ["--bg", "--bg-color"], card: ["--card-bg"], primary: ["--primary", "--primary-color", "--acc"] };
const THEME_CARDS = ".rc-card,.rc-fcard,.cs,.dc,.profile-box,.category-section,.top-nav-bar,.rc-modal-box,.c-box,.dashboard-container,#rptWrap,.rc-dd-btn,.rc-dd-menu,select.rc-input";
const cleanTheme = t => {
  const o = {};
  if (t && typeof t === "object") ["text", "bg", "card", "primary", "navBg", "navText"].forEach(k => { if (HEX.test(t[k] || "")) o[k] = t[k]; });
  return o;
};
export function applyTheme(t) {
  t = cleanTheme(t);
  let root = "", extra = "";
  Object.keys(THEME_VARS).forEach(k => { if (t[k]) THEME_VARS[k].forEach(v => { root += v + ":" + t[k] + ";"; }); });
  if (t.primary) root += "--primary-dark:color-mix(in srgb," + t.primary + " 70%,#000);--primary-light:color-mix(in srgb," + t.primary + " 12%,#fff);";
  if (t.text) extra += "body{color:var(--text-main)}";
  if (t.bg) extra += "html,body{background-color:var(--bg)!important}";
  if (t.card) extra += THEME_CARDS + "{background-color:var(--card-bg)!important}";
  if (t.navBg) extra += ".nav-wrapper{background:" + t.navBg + "!important}";
  if (t.navText) extra += ".nav-wrapper a,.nav-wrapper button,.nav-wrapper select,#menuToggleBtn{color:" + t.navText + "!important}";
  let st = document.getElementById("rc-theme");
  if (!root && !extra) { if (st) st.remove(); return; }
  if (!st) { st = document.createElement("style"); st.id = "rc-theme"; document.head.appendChild(st); }
  st.textContent = ":root{" + root + "}" + extra;
}
const cacheTheme = t => { try { localStorage.setItem("rcTheme", JSON.stringify(cleanTheme(t))); } catch (e) {} };
try { applyTheme(JSON.parse(localStorage.getItem("rcTheme") || "{}")); } catch (e) {}
/* ===== THEME শেষ ===== */

export function createLabels(data, save) {
  data = data || {};
  if (Object.keys(data).length) { FORM_DEFAULT = Object.assign({}, data.formDefault || {}, FORM_DEFAULT); mtSetType(data.managementType); }
  const user = Object.assign({}, data.labels || {});
  const styles = Object.assign({}, data.labelStyle || {});
  let theme = cleanTheme(data.theme);
  if (Object.keys(data).length) { applyTheme(theme); cacheTheme(theme); }
  const preset = LB_PRESETS[String(data.managementType || "").toLowerCase().trim()] || {};
  const dflt = k => (preset[k] !== undefined ? preset[k] : (LB_BASE[k] !== undefined ? LB_BASE[k] : (NAVDEF[k] !== undefined ? NAVDEF[k] : k)));
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
    box.appendChild(mk("div", "lb-h", k.indexOf("nav_") === 0 ? "✎ Menu: " + (NAVDEF[k] || k.slice(4)) : "✎ " + k));
    const d0 = String(dflt(k));
    const inp = mk(d0.length > 40 ? "textarea" : "input", "lb-in");
    if (inp.tagName === "TEXTAREA") inp.rows = 4;
    inp.value = user[k] || "";
    inp.placeholder = d0;
    box.appendChild(inp);
    const vars = d0.match(/\{\w+\}/g);
    if (vars) box.appendChild(mk("div", "lb-hint", "ব্যবহারযোগ্য: " + vars.join(" ")));
    let cs = Object.assign({}, styles[k] || {});
    const cclean = o => { const r = {}; if (HEX.test(o.c || "")) r.c = o.c; if (HEX.test(o.b || "")) r.b = o.b; return r; };
    [["c", "Text color", "#000000"], ["b", "Background", "#ffffff"]].forEach(([f, label, d]) => {
      const r = mk("div");
      r.style.cssText = "display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12px;color:#334155";
      const sp = mk("span", "", label); sp.style.flex = "1";
      const ci = document.createElement("input"); ci.type = "color"; ci.value = HEX.test(cs[f] || "") ? cs[f] : d;
      ci.style.cssText = "width:42px;height:28px;padding:0;border:1px solid #cbd5e1;border-radius:6px;background:none;opacity:" + (cs[f] ? "1" : ".4");
      const x = mk("button", "lb-b", "×"); x.type = "button"; x.title = "Default"; x.style.cssText = "flex:none;padding:3px 9px";
      ci.oninput = () => { cs[f] = ci.value; ci.style.opacity = "1"; };
      x.onclick = () => { delete cs[f]; ci.value = d; ci.style.opacity = ".4"; };
      r.appendChild(sp); r.appendChild(ci); r.appendChild(x); box.appendChild(r);
    });
    const row = mk("div", "lb-btns");
    const reset = mk("button", "lb-b", "Default"), cancel = mk("button", "lb-b", "Cancel"), ok = mk("button", "lb-b lb-ok", "Save");
    reset.type = cancel.type = ok.type = "button";
    const close = () => ov.remove();
    const go = async val => {
      const ns = cclean(cs), styleChanged = JSON.stringify(ns) !== JSON.stringify(cclean(styles[k] || {}));
      if (val === (user[k] || "") && !styleChanged) return close();
      try {
        const o = {};
        if (val !== (user[k] || "")) o["labels." + k] = val;
        if (styleChanged) o["labelStyle." + k] = ns;
        await save(o);
        user[k] = val;
        styles[k] = ns;
        apply();
        if (cbk) cbk();
        close();
      } catch (err) {
        console.error(err);
        alert("Save failed: " + err.message);
      }
    };
    reset.onclick = () => { cs = {}; go(""); };
    cancel.onclick = close;
    ok.onclick = () => go(inp.value.trim());
    ov.onclick = e => { if (e.target === ov) close(); };
    row.appendChild(reset); row.appendChild(cancel); row.appendChild(ok);
    box.appendChild(row);
    ov.appendChild(box); document.body.appendChild(ov);
    inp.focus();
  };

  /* হেডিং আইকন: নতুন আইকন / Hide / Delete / Default */
  const iconState = () => {
    const pg = detectEditPage(), v = user["icon_" + pg];
    return { pg, none: v === "__none__", custom: typeof v === "string" && v && v !== "__none__" ? v : "", hide: user["iconHide_" + pg] === "1" };
  };
  const applyIcon = () => {
    const st = iconState();
    if (!st.pg) return;
    const txt = st.none ? "" : (st.custom || PAGE_ICONS[st.pg] || "");
    document.querySelectorAll(".lb-sw").forEach(e => {
      e.dataset.ci = "1";
      e.textContent = txt;
      e.style.display = (st.hide || !txt) ? "none" : "";
    });
  };
  const editIcon = () => {
    const st = iconState();
    if (!st.pg) return;
    const ov = mk("div", "lb-ov"), box = mk("div", "lb-box");
    box.appendChild(mk("div", "lb-h", "✎ Icon"));
    const inp = mk("input", "lb-in");
    inp.maxLength = 8; inp.value = st.custom; inp.placeholder = PAGE_ICONS[st.pg] || "";
    box.appendChild(inp);
    box.appendChild(mk("div", "lb-hint", "ইমোজি বা ছোট লেখা দিয়ে Save করুন"));
    const row = mk("div", "lb-btns");
    const mkb = (t, cls) => { const b = mk("button", "lb-b" + (cls ? " " + cls : ""), t); b.type = "button"; row.appendChild(b); return b; };
    const hideB = mkb(st.hide ? "Show" : "Hide"), delB = mkb("Delete"), defB = mkb("Default"), canB = mkb("Cancel"), okB = mkb("Save", "lb-ok");
    const close = () => ov.remove();
    const go = async obj => {
      try {
        const o = {};
        Object.keys(obj).forEach(k => { o["labels." + k] = obj[k]; });
        await save(o);
        Object.assign(user, obj);
        applyIcon();
        if (on) pencils();
        close();
      } catch (err) {
        console.error(err);
        alert("Save failed: " + err.message);
      }
    };
    hideB.onclick = () => go({ ["iconHide_" + st.pg]: st.hide ? "" : "1" });
    delB.onclick = () => { if (confirm("Delete icon?")) go({ ["icon_" + st.pg]: "__none__" }); };
    defB.onclick = () => go({ ["icon_" + st.pg]: "", ["iconHide_" + st.pg]: "" });
    canB.onclick = close;
    okB.onclick = () => { const v = inp.value.trim(); if (!v) return alert("Enter icon"); go({ ["icon_" + st.pg]: v, ["iconHide_" + st.pg]: "" }); };
    ov.onclick = e => { if (e.target === ov) close(); };
    box.appendChild(row);
    ov.appendChild(box); document.body.appendChild(ov);
    inp.focus();
  };

  /* প্রতিটি লেখার আলাদা টেক্সট/ব্যাকগ্রাউন্ড রং (users.labelStyle) */
  const applyLStyles = () => {
    let css = "";
    Object.keys(styles).forEach(k => {
      const s = styles[k] || {}, a = [];
      if (HEX.test(s.c || "")) a.push("color:" + s.c + "!important");
      if (HEX.test(s.b || "")) a.push("background:" + s.b + "!important", "border-radius:4px");
      if (!a.length) return;
      const nav = k.indexOf("nav_") === 0, sel = nav ? '[data-rc-nav="' + k.slice(4).replace(/"/g, "") + '"]' : '[data-l="' + k.replace(/"/g, "") + '"]';
      css += sel + "{" + a.join(";") + "}";
      if (HEX.test(s.b || "") && !nav) css += sel + ":not(button):not(input){padding:0 4px}";
    });
    let el = document.getElementById("rc-lstyle");
    if (!css) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("style"); el.id = "rc-lstyle"; document.head.appendChild(el); }
    el.textContent = css;
  };

  /* সাইট-থিম এডিটর: 🎨 Colors */
  const toHex = v => /^#[0-9a-f]{6}$/i.test(v) ? v : (/^#[0-9a-f]{3}$/i.test(v) ? "#" + v.slice(1).split("").map(c => c + c).join("") : "");
  const themeEditor = () => {
    const ov = mk("div", "lb-ov"), box = mk("div", "lb-box");
    ov.style.cssText = "align-items:flex-end;background:rgba(0,0,0,.12)";
    box.style.maxHeight = "62vh";
    box.appendChild(mk("div", "lb-h", "🎨 Colors"));
    const draft = Object.assign({}, theme);
    const rows = [
      ["text", "Text", "--text-main", "#1a1a1a"],
      ["bg", "Page background", "--bg", "#f0f5f1"],
      ["card", "Card background", "--card-bg", "#ffffff"],
      ["primary", "Main color (headings, buttons)", "--primary-color", "#4f46e5"],
      ["navBg", "Navigation background", "", "#0f5132"],
      ["navText", "Navigation text", "", "#ffffff"]
    ];
    const cur = (k, v, d) => HEX.test(draft[k] || "") ? draft[k] : ((v && toHex(getComputedStyle(document.documentElement).getPropertyValue(v).trim())) || d);
    rows.forEach(([k, label, v, d]) => {
      const r = mk("div");
      r.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:13px;color:#334155";
      const sp = mk("span", "", label); sp.style.flex = "1";
      const ci = document.createElement("input"); ci.type = "color"; ci.value = cur(k, v, d);
      ci.style.cssText = "width:42px;height:30px;padding:0;border:1px solid #cbd5e1;border-radius:6px;background:none";
      const dim = () => { ci.style.opacity = draft[k] ? "1" : ".4"; };
      const x = mk("button", "lb-b", "Default"); x.type = "button"; x.style.cssText = "flex:none;padding:5px 8px;font-size:11px";
      ci.oninput = () => { draft[k] = ci.value; dim(); applyTheme(draft); };
      x.onclick = () => { delete draft[k]; applyTheme(draft); ci.value = cur(k, v, d); dim(); };
      dim();
      r.appendChild(sp); r.appendChild(ci); r.appendChild(x); box.appendChild(r);
    });
    const row = mk("div", "lb-btns");
    const resetB = mk("button", "lb-b", "Reset all"), cancelB = mk("button", "lb-b", "Cancel"), okB = mk("button", "lb-b lb-ok", "Save");
    resetB.type = cancelB.type = okB.type = "button";
    const close = () => ov.remove();
    const go = async obj => {
      try {
        await save({ theme: obj });
        theme = obj; applyTheme(theme); cacheTheme(theme);
        close();
      } catch (err) {
        console.error(err);
        alert("Save failed: " + err.message);
      }
    };
    resetB.onclick = () => go({});
    cancelB.onclick = () => { applyTheme(theme); close(); };
    okB.onclick = () => go(cleanTheme(draft));
    ov.onclick = e => { if (e.target === ov) { applyTheme(theme); close(); } };
    row.appendChild(resetB); row.appendChild(cancelB); row.appendChild(okB);
    box.appendChild(row);
    ov.appendChild(box); document.body.appendChild(ov);
  };

  const clearUI = () => {
    document.querySelectorAll(".lb-ed,.lb-msgs,.lb-theme").forEach(e => e.remove());
  };

  /* Edit Mode চালু থাকলে ✎ আইকন ও নিচের Messages সারি */
  const pencils = () => {
    clearUI();
    document.querySelectorAll(".lb-sw").forEach(e => {
      const p = mk("span", "lb-ed lb-ed-l", "✎");
      p.dataset.k = "__icon";
      p.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); editIcon(); };
      e.before(p);
    });
    document.querySelectorAll("[data-l],[data-lp]").forEach(e => {
      if (e.offsetParent === null) return;
      const k = e.dataset.l || e.dataset.lp;
      const p = mk("span", "lb-ed", "✎");
      p.dataset.k = k;
      p.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); editOne(k); };
      if (e.tagName === "INPUT") e.after(p);
      else if (e.tagName === "BUTTON" && e.closest(".footer-form,.bill-foot")) { if (e.classList.contains("rc-btn-secondary")) e.before(p); else e.after(p); }
      else e.appendChild(p);
    });
    navEls().forEach(e => {
      if (e.tagName === "OPTION" || !navGet(e)) return;
      const k = "nav_" + e.dataset.rcNav;
      const p = mk("span", "lb-ed", "✎");
      p.dataset.k = k;
      p.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); editOne(k); };
      e.appendChild(p);
    });
    const tb = mk("button", "lb-theme", "🎨 Colors");
    tb.type = "button";
    tb.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9990;padding:9px 14px;border:none;border-radius:20px;background:var(--primary-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)";
    tb.onclick = themeEditor;
    document.body.appendChild(tb);
    const shown = new Set([...document.querySelectorAll(".lb-ed")].map(e => e.dataset.k));
    const keys = (LB_PAGES[curPage] || []).filter(k => !shown.has(k));
    if (!LB_SHOW_MSGS || !keys.length) return;
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
    applyIcon();
    applyLStyles();
    applyNavLabels(user);
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

  /* পেজ লুকানো অবস্থায় (লোড হওয়ার আগে) এডিট মোড রিস্টোর হলে ✎ বসতে পারে না; পেজ দেখা গেলেই বাকি ✎ বসিয়ে দেয় */
  const missing = () => [...document.querySelectorAll("[data-l],[data-lp]")].some(e =>
    e.offsetParent !== null &&
    !(e.querySelector(".lb-ed") || [e.previousElementSibling, e.nextElementSibling].some(x => x && x.classList && x.classList.contains("lb-ed") && x.dataset.k === (e.dataset.l || e.dataset.lp))));
  let wobs = null, wt = 0;
  const watch = () => {
    if (!on) { if (wobs) { wobs.disconnect(); wobs = null; } return; }
    if (wobs) return;
    wobs = new MutationObserver(() => {
      clearTimeout(wt);
      wt = setTimeout(() => { if (on && missing()) pencils(); }, 150);
    });
    wobs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style", "class", "hidden"] });
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
    watch();
  };

  window.__rcL = L;
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
/* Report পেজে কল করুন: mountEditModeToggles("editModeBox") — একটাই টগল, অন করলে পুরো সাইটের সব পেজে এডিট মোড চালু */
export function mountEditModeToggles(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;
  if (!document.getElementById("em-style")) {
    const st = document.createElement("style");
    st.id = "em-style";
    st.textContent =
      ".em-sw{position:relative;display:inline-block;width:38px;height:20px;flex-shrink:0;cursor:pointer}" +
      ".em-sw input{opacity:0;width:0;height:0;position:absolute}" +
      ".em-sl{position:absolute;inset:0;background:#ccc;transition:.2s;border-radius:20px}" +
      ".em-sl:before{position:absolute;content:'';height:14px;width:14px;left:3px;bottom:3px;background:#fff;transition:.2s;border-radius:50%}" +
      ".em-sw input:checked+.em-sl{background:var(--primary-color)}" +
      ".em-sw input:checked+.em-sl:before{transform:translateX(18px)}";
    document.head.appendChild(st);
  }
  box.innerHTML = '<label class="em-sw"><input type="checkbox" id="em-all"><span class="em-sl"></span></label>';
  const all = document.getElementById("em-all");
  const sync = () => { all.checked = EDIT_PAGES.every(([k]) => getEditMode(k)); };
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
    card.innerHTML = '<div class="sec" style="margin-bottom:0"><div class="sec-title" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0"><span>✎ Edit Mode</span><span id="editModeBox"></span></div></div>';
    const second = wrap.querySelectorAll(":scope > .wrap")[1];
    second ? wrap.insertBefore(card, second) : wrap.appendChild(card);
    mountEditModeToggles("editModeBox");
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();

/* টাইটেলের বাম পাশে পেজের আইকন; ✎ সুইচ আর ক্লিক-টগল বন্ধ (টগল এখন Report পেজে) */
(function pageIcons() {
  const go = () => {
    const pg = detectEditPage();
    const ICON = PAGE_ICONS;
    document.querySelectorAll(".lb-sw").forEach(e => {
      e.removeAttribute("data-lbt");
      e.removeAttribute("onclick");
      e.onclick = null;
      if (ICON[pg] && !e.dataset.ci) e.textContent = ICON[pg];
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();

/* ===== Edit Form / Edit Table: Custom ⇄ Default সুইচ ===== */
let FORM_DEFAULT = {}, DASH_ORIG = null, DASH_IDX = -1;
const fmIsDash = k => k.indexOf("dashboard") === 0;
function fmKey() {
  const pg = detectEditPage();
  if (pg === "dashboard") return DASH_IDX >= 0 ? "dashboard" + DASH_IDX : null;
  return pg;
}
function fmToggle() {
  const hl = document.getElementById("hl"), key = fmKey();
  if (!hl || !key) return;
  let host = hl.querySelector(".la,.fm-row");
  if (!host) { host = document.createElement("div"); host.className = "lr fm-row"; hl.appendChild(host); }
  host.classList.add("fm-host");
  host.querySelectorAll(".fm-sw").forEach(x => x.remove());
  const d = !!FORM_DEFAULT[key];
  const sw = document.createElement("span");
  sw.className = "fm-sw";
  sw.innerHTML = '<b class="' + (d ? "" : "on") + '">Custom</b><i class="' + (d ? "on" : "") + '"></i><b class="' + (d ? "on" : "") + '">Default</b>';
  sw.onclick = e => { e.stopPropagation(); fmFlip(key); };
  host.appendChild(sw);
}
async function fmFlip(key) {
  const on = !FORM_DEFAULT[key], u = auth.currentUser;
  if (!u) return alert("Login required");
  try { await UPD(DO(db, "users", u.uid), { ["formDefault." + key]: on }); }
  catch (e) { console.error(e); return alert("Save failed: " + e.message); }
  FORM_DEFAULT[key] = on;
  if (fmIsDash(key)) { location.reload(); return; }
  if (window.__rcFormMode) window.__rcFormMode();
}
document.addEventListener("click", e => {
  const t = e.target.closest && e.target.closest(".et");
  if (!t) return;
  const m = (t.getAttribute("onclick") || "").match(/EH\((\d+)\)/);
  if (m) DASH_IDX = +m[1];
}, true);
export async function loadUser(t, e) {
  const res = await loadUserBase(t, e);
  if (res && res.d) {
    try { applyNavLabels(res.d.labels); } catch (err) { console.error(err); }
    FORM_DEFAULT = res.d.formDefault || {};
    const h = Array.isArray(res.d.tblHeads) ? res.d.tblHeads.slice() : [], c = Array.isArray(res.d.tblCols) ? res.d.tblCols.slice() : [];
    DASH_ORIG = { h: h.slice(), c: c.slice() };
    if (Object.keys(FORM_DEFAULT).some(fmIsDash)) {
      h.forEach((v, i) => { if (FORM_DEFAULT["dashboard" + i]) { h[i] = ""; if (i < c.length) c[i] = null; } });
      res.d = Object.assign({}, res.d, { tblHeads: h, tblCols: c });
    }
  }
  return res;
}
export const UP = (ref, data) => {
  if (data && (data.tblHeads || data.tblCols) && DASH_ORIG && Object.keys(FORM_DEFAULT).some(fmIsDash)) {
    data = Object.assign({}, data);
    const h = (data.tblHeads || []).slice(), c = (data.tblCols || []).slice();
    h.forEach((v, i) => {
      const k = "dashboard" + i;
      if (!FORM_DEFAULT[k]) return;
      if (v) { data["formDefault." + k] = false; FORM_DEFAULT[k] = false; }
      else { h[i] = (DASH_ORIG.h || [])[i] || ""; c[i] = (DASH_ORIG.c || [])[i] ?? null; }
    });
    data.tblHeads = h; data.tblCols = c;
    DASH_ORIG = { h: h.slice(), c: c.slice() };
  }
  return UPD(ref, data);
};
/* ===== Custom ⇄ Default শেষ ===== */

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
    if (s.exists()) { applyTheme(s.data().theme); cacheTheme(s.data().theme); }
    if (s.exists() && !MT_LOADED) mtSetType(s.data().managementType);
    mtSelectSync(s.exists() ? s.data().managementType : "");
  } catch (e) { console.error(e); }
});
/* Report পেজে টাইপ সিঙ্ক (সিলেক্ট কার্ড থেকে সরানো হয়েছে; টাইপ সেভ করা সেটিং থেকেই চলে) */
function mtSelectSync(v) {
  MT_SEL_VAL = String(v || "").toLowerCase().trim() || "patient";
  const sel = document.getElementById("mtSel");
  if (sel) sel.value = LB_PRESETS[MT_SEL_VAL] ? MT_SEL_VAL : "patient";
}
/* ===== ম্যানেজমেন্ট টাইপ শেষ ===== */

/* ===== Raqi / Therapist চিপ (Appointment পেজ): Ruqyah = Raqi তালিকা, Hijama = Therapist তালিকা (আলাদা); নাম যোগ/এডিট এডিট মোড ছাড়াই ===== */
(function doctorChip() {
  const start = () => {
    if (detectEditPage() !== "appointment") return;
    const ff = document.getElementById("ff");
    if (!ff) return;
    const lists = { raqi: [], th: [] };
    let selected = "", editIdx = -1, editKey = "raqi", loaded = false;

    const st = document.createElement("style");
    st.textContent = "body:not(.lb-on) #docMenu .edit-ic{display:inline-block!important}body:not(.lb-on) #docMenu .item-add-row{display:flex!important}";
    document.head.appendChild(st);

    const cats = () => window.selectedCategories || new Set(["Ruqyah"]);
    const kind = () => { const c = cats(); return c.has("Hijama") ? (c.has("Ruqyah") ? "both" : "th") : "raqi"; };
    const labelOf = () => mtPreset().doctor || ({ th: "Therapist", both: "Raqi/Therapist", raqi: "Raqi" })[kind()];
    const uniq = a => { const seen = new Set(), o = []; a.forEach(n => { const k = String(n).toLowerCase(); if (!seen.has(k)) { seen.add(k); o.push(n); } }); return o; };
    const items = () => {
      const k = kind();
      const r = lists.raqi.map((n, i) => ({ n, key: "raqi", i })), t = lists.th.map((n, i) => ({ n, key: "th", i }));
      if (k === "th") return t;
      if (k === "both") { const have = new Set(r.map(x => x.n.toLowerCase())); return r.concat(t.filter(x => !have.has(x.n.toLowerCase()))); }
      return r;
    };
    const addKey = () => (kind() === "th" ? "th" : "raqi");

    const menuHTML = () => {
      const it = items();
      const rows = it.length
        ? it.map((o, j) =>
            '<div class="item-row"><span class="doc-name' + (o.n === selected ? " checked" : "") + '" data-di="' + j + '">' + ES(o.n) +
            '</span><span class="edit-ic" data-ei="' + j + '">&#9998;</span></div>').join("")
        : '<div class="item-row"><span class="doc-empty">No name added</span></div>';
      return rows + '<div class="item-add-row"><span data-dadd="1">+</span></div>';
    };
    const paint = () => {
      window.__rcDoctor = selected;
      const menu = document.getElementById("docMenu"), btn = document.getElementById("docBtn");
      if (!menu || !btn) return;
      menu.innerHTML = menuHTML();
      const shown = selected || labelOf();
      btn.textContent = shown.length > 14 ? shown.slice(0, 13) + "…" : shown;
      btn.title = shown;
    };
    const persist = async () => {
      const u = auth.currentUser;
      if (!u) return alert("Login required");
      if (!loaded) return alert("Loading, please try again");
      try { await UPD(DO(db, "users", u.uid), { doctorList: lists.raqi, raqiList: lists.raqi, therapistList: lists.th }); } catch (err) { console.error(err); alert("Save failed: " + err.message); }
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
      '<div class="rc-modal" id="docModal"><div class="rc-modal-box"><h3 id="docModalTitle">Add Raqi</h3>' +
      '<input class="rc-input" id="docModalName" placeholder="Name" autocomplete="off">' +
      '<div class="rc-modal-actions" style="margin-top:14px"><button class="c-no" id="docDel" type="button" hidden>Delete</button>' +
      '<button class="c-no" id="docCancel" type="button">Cancel</button>' +
      '<button class="rc-btn rc-btn-primary" style="flex:1" id="docSave" type="button">Save</button></div></div></div>');
    const nameInput = document.getElementById("docModalName");
    const openDocModal = (key, idx) => {
      editKey = key; editIdx = idx;
      const lb = mtPreset().doctor || (key === "th" ? "Therapist" : "Raqi");
      document.getElementById("docModalTitle").textContent = (idx >= 0 ? "Edit " : "Add ") + lb;
      nameInput.placeholder = lb + " name";
      nameInput.value = idx >= 0 ? lists[key][idx] : "";
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
      if (ed) { e.stopPropagation(); const o = items()[+ed.dataset.ei]; if (o) openDocModal(o.key, o.i); }
      else if (ad) { e.stopPropagation(); openDocModal(addKey(), -1); }
      else if (nm) {
        const o = items()[+nm.dataset.di];
        if (!o) return;
        selected = selected === o.n ? "" : o.n;
        paint();
        menu.classList.remove("open");
      }
    });
    document.getElementById("docCancel").onclick = () => closeModal("docModal");
    document.getElementById("docSave").onclick = async () => {
      const name = nameInput.value.trim().replace(/\s+/g, " ");
      if (!name) return alert("Enter name");
      const arr = lists[editKey];
      if (arr.some((n, i) => i !== editIdx && n.toLowerCase() === name.toLowerCase())) return alert("Name exists");
      if (editIdx >= 0) { if (selected === arr[editIdx]) selected = name; arr[editIdx] = name; }
      else { arr.push(name); selected = name; }
      await persist();
      paint();
      closeModal("docModal");
    };
    document.getElementById("docDel").onclick = async () => {
      if (editIdx < 0 || !confirm("Delete?")) return;
      const arr = lists[editKey];
      if (selected === arr[editIdx]) selected = "";
      arr.splice(editIdx, 1);
      await persist();
      paint();
      closeModal("docModal");
    };

    document.addEventListener("rc-preset", () => { paint(); });
    document.addEventListener("rc-cat", () => {
      if (selected && !items().some(o => o.n === selected)) selected = "";
      paint();
    });
    new MutationObserver(inject).observe(ff, { childList: true });
    inject();
    r(auth, async u => {
      if (!u) return;
      try {
        const s = await GD(DO(db, "users", u.uid));
        if (s.exists()) {
          const d = s.data();
          lists.raqi = uniq([...(Array.isArray(d.doctorList) ? d.doctorList : []), ...(Array.isArray(d.raqiList) ? d.raqiList : [])]);
          lists.th = Array.isArray(d.therapistList) ? d.therapistList.slice() : [];
        }
        loaded = true;
      } catch (err) { console.error(err); }
      paint();
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();
})();

/* ===== সাইটে একটিভ থাকার সময় (অ্যাডমিন প্যানেলের পাসওয়ার্ড ১৫ মিনিট নিষ্ক্রিয়তার পর আবার চাইবে) ===== */
(function siteActivity() {
  const LIM = 15 * 60 * 1000;
  let t = 0;
  const beat = () => {
    const n = Date.now();
    if (n - t < 5000) return;
    t = n;
    try {
      const last = +localStorage.getItem("rcActive") || 0;
      if (last && n - last > LIM) localStorage.removeItem("rcAdminOK");
      localStorage.setItem("rcActive", n);
    } catch (e) {}
  };
  ["pointerdown", "keydown", "touchstart", "scroll"].forEach(ev => addEventListener(ev, beat, { passive: true, capture: true }));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) beat(); });
  beat();
})();

/* ===== ড্যাশবোর্ড: টাইপ অনুযায়ী কলামের নাম, সমান প্রস্থ, ID ক্লিক = অপশন, নামে ক্লিক = ৩ অপশনের মেনু ===== */
(function dynColumns() {
  let lastCard = "", raf = 0;
  const PAGES = {
    symptomDx: "https://rahcare.blogspot.com/p/symptom-diagnosis.html",
    responseDx: "https://rahcare.blogspot.com/p/response-diagnosis.html",
    prescription: "https://rahcare.blogspot.com/p/prescription.html"
  };
  const T = k => (window.__rcL ? window.__rcL(k) : LB_BASE[k]);
  const cardOf = el => {
    const cs = el && el.closest && el.closest(".cs"), sp = cs && cs.querySelector(".ch>span");
    return sp && sp.firstChild ? sp.firstChild.textContent.trim() : "";
  };
  const provider = card => mtPreset().doctor || (/^hijama/i.test(card) ? "Therapist" : "Raqi");

  /* ডিফল্ট প্রস্থ (সেভ করা নেই) হলে কলামগুলো সমান ভাগ; ইউজারের নিজের সেট করা প্রস্থ অপরিবর্তিত */
  const DEF = [5, 6, 3, 5, 3];
  const equalize = tbl => {
    const head = tbl.querySelector("thead tr");
    if (!head) return;
    const cur = head.style.gridTemplateColumns.match(/[\d.]+(?=fr)/g);
    if (!cur) return;
    const n = cur.map(Number), k = Math.min(n.length, DEF.length);
    if (!(n.slice(0, k).every((v, i) => v === DEF[i]) && n.slice(k).every(v => v === 4))) return;
    tbl.querySelectorAll("tr").forEach(r => {
      r.style.gridTemplateColumns = r.style.gridTemplateColumns.replace(/[\d.]+(?=fr)/g, "1");
    });
  };

  /* ID কলামের ঘর ক্লিকযোগ্য */
  const markIds = tbl => {
    const idx = [...tbl.querySelectorAll("thead th")].findIndex(t => /^id$/i.test(t.textContent.trim()));
    if (idx < 0) return;
    tbl.querySelectorAll("tbody tr").forEach(r => {
      const td = r.children[idx];
      if (!td || td.classList.contains("rc-idcell") || td.classList.contains("rc-empty")) return;
      const nb = r.querySelector('.name-btn[onclick^="AM("]');
      const m = nb && nb.getAttribute("onclick").match(/AM\('([^']+)'\)/);
      if (!m) return;
      td.classList.add("rc-idcell");
      td.dataset.doc = m[1];
      td.style.cursor = "pointer";
      const sp = td.firstElementChild;
      if (sp && sp.tagName === "SPAN") {
        if (!sp.textContent.trim()) sp.textContent = "--";
        sp.style.cssText = "color:var(--primary-color,#4f46e5);font-weight:700;text-decoration:underline";
      }
    });
  };

  const run = () => {
    const p = mtPreset();
    document.querySelectorAll("th").forEach(t => {
      const x = t.textContent.trim();
      if (x === "Raqi") { const v = provider(cardOf(t)); if (v !== x) t.textContent = v; }
      else if (x === "Bill" && p.billingTitle) t.textContent = p.billingTitle;
    });
    document.querySelectorAll("table").forEach(tbl => { equalize(tbl); markIds(tbl); });
    const h = document.querySelector("#mr h3"), pv = provider(lastCard);
    if (h && h.textContent.trim() !== pv) h.textContent = pv;
  };

  /* নামে ক্লিক করলে ছোট মেনু: Symptom / Response / Prescription পেজ */
  const menu = () => {
    let m = document.getElementById("rc-pm");
    if (m) return m;
    m = document.createElement("div");
    m.id = "rc-pm";
    m.className = "c-modal";
    m.innerHTML = '<div class="c-box" style="width:calc(100% - 32px);max-width:300px"><h3 id="rc-pm-t" style="word-break:break-word"></h3><div id="rc-pm-b"></div><button class="c-no c-no-full" type="button" style="margin-top:4px">Close</button></div>';
    m.onclick = e => { if (e.target === m || e.target.closest("button")) m.classList.remove("show"); };
    document.body.appendChild(m);
    return m;
  };
  const openMenu = (doc, name, num) => {
    const m = menu();
    m.querySelector("#rc-pm-t").textContent = name;
    const b = m.querySelector("#rc-pm-b");
    b.innerHTML = "";
    Object.keys(PAGES).forEach(k => {
      const a = document.createElement("a");
      a.className = "c-no c-no-full";
      a.textContent = T(k);
      a.href = PAGES[k] + "?d=" + encodeURIComponent(doc) + (num ? "&id=" + encodeURIComponent(num) : "");
      a.style.cssText = "display:block;text-align:center;text-decoration:none;margin-bottom:8px;box-sizing:border-box";
      b.appendChild(a);
    });
    m.classList.add("show");

    /* Hijama রোগী + অ্যাডমিন হলে ৪র্থ অপশন: Hijama Points (বডি-ডায়াগ্রামে ড্রাই/ওয়েট কাপ মার্ক) */
    const tk = (openMenu._t = (openMenu._t || 0) + 1);
    (async () => {
      try {
        const u = auth.currentUser;
        if (!u) return;
        const [ad, ap] = await Promise.all([GD(DO(db, "admins", u.uid)), GD(DO(db, "appointments", doc))]);
        if (tk !== openMenu._t || !ad.exists() || !ap.exists() || !isHijama(ap.data())) return;
        const h = document.createElement("a");
        h.className = "c-no c-no-full";
        h.href = "#";
        h.textContent = "🩸 Hijama Points";
        h.style.cssText = "display:block;text-align:center;text-decoration:none;margin-bottom:8px;box-sizing:border-box";
        h.onclick = async ev => {
          ev.preventDefault();
          m.classList.remove("show");
          try {
            const mod = await import("./hijama-points.js?v=2");
            mod.openHijamaPoints(doc, name);
          } catch (er) { console.error(er); alert("Hijama Points খোলা যায়নি"); }
        };
        b.appendChild(h);
      } catch (er) { console.error(er); }
    })();
  };

  const start = () => {
    new MutationObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; run(); });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    document.addEventListener("rc-preset", run);
    document.addEventListener("click", e => {
      const t = e.target;
      const idc = t.closest && t.closest(".rc-idcell");
      if (idc && window.AM) {
        e.preventDefault(); e.stopPropagation();
        window.AM(idc.dataset.doc);
        return;
      }
      const b = t.closest && t.closest(".name-btn");
      if (!b) return;
      lastCard = cardOf(b);
      const m = /^AM\('([^']+)'\)/.exec(b.getAttribute("onclick") || "");
      if (m) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        const row = b.closest("tr"), c = row && row.querySelector(".rc-idcell");
        let num = c ? c.textContent.trim() : "";
        if (num === "--") num = "";
        if (!num && row) {
          const bl = row.querySelector('a[href*="billing.html?id="]');
          if (bl) { try { num = new URL(bl.href).searchParams.get("id") || ""; } catch (x) {} }
        }
        openMenu(m[1], b.textContent.replace("❌", "").trim() || "Patient", num);
        return;
      }
      run();
    }, true);
    run();
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();
})();
const FK={pName:"name",phone:"phone",gBtn:"gender",addrVal:"addr",ageInput:"age",timeVal:"time",dateInput:"date"},SEL=Object.keys(FK).map(t=>"#"+t).join()+",[data-x]",BLK=":scope>:not(.rc-row-2),:scope>.rc-row-2>*";let FC,FCP,CP,FM,fcCur;const fcLoad=()=>FCP||(FCP=(async()=>{try{await auth.authStateReady();const t=await GD(DO(db,"users",auth.currentUser.uid)),e=t.exists()?t.data():{};FC=e.fieldChips||{},CP=e.chipPrefs||{},FM=(e.managementType||"patient").toLowerCase().trim()}catch(t){console.error(t),FCP=0}})()),fcSave=()=>UPD(DO(db,"users",auth.currentUser.uid),{fieldChips:FC,chipPrefs:CP}),fcFt=t=>'<div class="fc-ft"><button type="button" data-a="l">◀</button><button type="button" data-a="r">▶</button>'+(t?'<button type="button" data-a="e">✎</button>':"")+'<button type="button" data-a="x">✕</button></div>',bid=t=>t.querySelector(".rc-chip").id.replace("Btn",""),fcBk=()=>JSON.stringify([FC,CP]),fcHtml=t=>`<div class="rc-chip-dd fc-c" data-i="${t.i}" data-n="${ES(t.n)}"><span class="rc-chip">${ES(t.n)}</span><div class="rc-dd-menu${"d"==t.d?" fc-dn":""}">${t.o.map(t=>`<span data-v="${ES(t)}">${ES(t)}</span>`).join("")}${fcFt(1)}</div></div>`,fcKey=t=>{const e=t.querySelector(SEL);return t.dataset.k||e&&(FK[e.id]||e.dataset.x)},fcPick=(t,e)=>{const c=!!e&&[...t.querySelectorAll("[data-v]")].some(t=>t.dataset.v==e);c?t.dataset.v=e:delete t.dataset.v,t.firstChild.textContent=c?e:t.dataset.n,t.firstChild.classList.toggle("selected",c),t.querySelectorAll("[data-v]").forEach(t=>t.classList.toggle("checked",c&&t.dataset.v==e))},fcDraw=t=>{const e=fcKey(t);if(!e)return;let c=t.querySelector(".fc-chips");if(!c){c=document.createElement("div"),c.className="fc-chips",c.dataset.k=e;const a=t.querySelector(".name-label-row");if(a)a.insertBefore(c,a.querySelector(".type-cat-inline"));else{const e=t.querySelector(":scope>label");if(!e)return;const a=document.createElement("div");a.className="fc-row",e.replaceWith(a),a.append(e,c)}}const a={};c.querySelectorAll(".fc-c[data-v]").forEach(t=>a[t.dataset.i]=t.dataset.v),c.innerHTML=(FC[e]||[]).map(fcHtml).join("")+'<span class="rc-chip fc-plus">+</span>'+(t.querySelector(".type-cat-inline")&&"patient"==FM&&(CP.hide||[]).length?'<span class="rc-chip fc-rs">↺</span>':""),c.querySelectorAll(".fc-c").forEach(t=>fcPick(t,a[t.dataset.i]))},fcDrawAll=()=>$("ff").querySelectorAll(BLK).forEach(fcDraw),fcRender=()=>{fcPrefs($("ff")),fcDrawAll()},fcModal=()=>{$("fcm")||(document.body.insertAdjacentHTML("beforeend",'<div id="fcm" class="c-modal"><div class="c-box" style="width:calc(100% - 32px);max-width:300px"><h3 id="fct"></h3><input class="rc-input" id="fcn" maxlength="20" placeholder="Chip name" autocomplete="off" style="margin-bottom:8px"><textarea class="rc-input" id="fco" rows="6" placeholder="Options (one per line or comma separated)" style="height:auto;padding:8px 12px;margin-bottom:8px"></textarea><select class="rc-input" id="fcd" style="margin-bottom:12px"><option value="u">Drop-up menu</option><option value="d">Drop-down menu</option></select><div class="bx"><button class="c-no c-no-sm" id="fcx">Delete</button><button class="c-no c-no-sm" id="fcc">Cancel</button><button class="c-yes" id="fcs">Save</button></div></div></div>'),$("fcc").onclick=()=>md("fcm",0),$("fcs").onclick=fcSaveChip,$("fcx").onclick=fcDel)},fcEdit=(t,e)=>{fcModal();const c=e&&(FC[t]||[]).find(t=>t.i==e);fcCur={k:t,i:c?c.i:0},$("fct").textContent=c?"Edit Chip":"Add Chip",$("fcn").value=c?c.n:"",$("fco").value=c?c.o.join("\n"):"",$("fcd").value=c?c.d:"u",$("fcx").style.display=c?"":"none",md("fcm",1),$("fcn").focus()},fcCommit=async t=>{try{await fcSave(),$("fcm")&&md("fcm",0),fcRender()}catch(e){[FC,CP]=JSON.parse(t),ER(e)}},fcSaveChip=()=>{const t=$("fcn").value.replace(/[.\/~*\[\]]/g," ").replace(/\s+/g," ").trim(),e=[...new Set($("fco").value.split(/[\n,،，、]/).map(t=>t.replace(/\s+/g," ").trim()).filter(Boolean))],{k:c,i:a}=fcCur,n=$("fcd").value;if(!t)return alert("Enter chip name");if(!e.length)return alert("Add at least one option");if(Object.values(FC).some(e=>e.some(e=>e.n==t&&e.i!=a)))return alert("এই নামে আরেকটি চিপ আছে");const s=fcBk(),i=FC[c]=FC[c]||[];a?Object.assign(i.find(t=>t.i==a),{n:t,o:e,d:n}):i.push({i:"h"+Date.now().toString(36),n:t,o:e,d:n}),fcCommit(s)},fcDel=()=>{if(!confirm("Delete?"))return;const{k:t,i:e}=fcCur,c=fcBk();FC[t]=FC[t].filter(t=>t.i!=e),fcCommit(c)},fcAct=(t,e)=>{const c=t.closest(".fc-chips").dataset.k,a=t.dataset.i,n=FC[c],s=n.findIndex(t=>t.i==a),i=fcBk();if("e"==e)return fcEdit(c,a);if("x"==e){if(!confirm("Delete?"))return;n.splice(s,1)}else{const t=s+("l"==e?-1:1);if(t<0||t>=n.length)return;[n[s],n[t]]=[n[t],n[s]]}fcCommit(i)},fcBi=(t,e)=>{const c=fcBk(),a=[...t.parentNode.children].map(bid),n=a.indexOf(bid(t));if("x"==e)CP.hide=[...new Set([...CP.hide||[],bid(t)])];else{const t=n+("l"==e?-1:1);if(t<0||t>=a.length)return;[a[n],a[t]]=[a[t],a[n]],CP.order=a}fcCommit(c)},fcPrefs=t=>{t.classList.toggle("fc-pt","patient"==FM);const e=t.querySelector(".type-cat-inline");if(!e)return;const c=CP.hide||[];(CP.order||[]).forEach(t=>{const c=[...e.children].find(e=>bid(e)==t);c&&e.appendChild(c)}),[...e.children].forEach(t=>{const e=t.querySelector(".rc-dd-menu");e.querySelector(".fc-ft")||e.insertAdjacentHTML("beforeend",fcFt(0)),t.classList.toggle("fc-hid",c.includes(bid(t)))})},fcClick=t=>{const e=t.target,c=e.closest(".fc-ft button");if(e.closest(".rc-chip-dd")&&t.stopPropagation(),c){const t=c.closest(".rc-chip-dd");return t.querySelector(".rc-dd-menu").classList.remove("open"),t.classList.contains("fc-c")?fcAct(t,c.dataset.a):fcBi(t,c.dataset.a)}if(e.closest(".fc-rs")){const t=fcBk();return CP.hide=[],fcCommit(t)}const a=e.closest(".fc-chips");if(!a)return;if(e.closest(".fc-plus"))return fcEdit(a.dataset.k);const n=e.closest(".fc-c");if(!n)return;const s=e.closest("[data-v]");if(s)return fcPick(n,n.dataset.v==s.dataset.v?"":s.dataset.v),n.lastChild.classList.remove("open");e.closest(".rc-chip")&&toggleDropdown(n.lastChild)},EC=async()=>{await fcLoad();const t=$("ff");FC&&t&&(t.__fc||(t.__fc=1,t.addEventListener("click",fcClick)),fcRender())};

/* ===== Shared: অ্যাডমিন টুলস (পাসওয়ার্ড গেট, লোগো/ইনভয়েস ছবি, ইনস্টল ম্যানিফেস্ট) — admin-panel.html ও myreport.js এখান থেকে ডাকে ===== */
export function mountAdminTools(){
const C=CO,Q=QU,W=WH,GD=GS,UD=UPD,D=DO,getAuth=()=>auth,v=i=>document.getElementById(i);
const ask=user=>new Promise(ok=>{const g=v("pwGate"),p=v("pwInput"),m=v("pwErr"),b=v("pwBtn");g.style.display="flex";p.focus();
const go=async()=>{if(!p.value)return;b.disabled=!0;m.textContent="";try{const u=getAuth().currentUser||user;await RA(u,EP.credential(u.email,p.value));g.style.display="none";ok()}catch{m.textContent="❌ Wrong password";p.value=""}b.disabled=!1;p.focus()};
b.onclick=go;p.onkeydown=e=>e.key==="Enter"&&go()});
const IMG={logo:["logoUrl","logoActive","Logo"],invoice:["invoiceTemplateUrl","invoiceActive","Invoice"],appointment:["appointmentTemplateUrl","appointmentActive","Appointment"]},
UPLOAD_URL="https://imgbb-proxy.raqialamgirabdullah.workers.dev",
imgBox=v("imgBox");
let uDoc=null;const UNF="User not found";
const updU=async p=>{await UD(D(db,"users",uDoc),p);uData&&(Object.assign(uData,p),refreshManifest())},
setImg=(k,url,on)=>{v("row-"+k).classList.toggle("has",!!url);const p=v("pv-"+k);url?p.src=url:p.removeAttribute("src");v("up-"+k).innerText=url?"Change":"Upload";v("tg-"+k).checked=!!on;v("ts-"+k).innerText=on?"Custom":"Default"},
upload=async(k,file)=>{if(!file)return;const[f,a]=IMG[k],b=v("up-"+k),o=b.innerText;if(file.size>33554432)return alert("Max 32MB");b.innerText="Uploading...";b.style.pointerEvents="none";try{if(!uDoc)throw new Error(UNF);const fd=new FormData;fd.append("image",file);const r=await(await fetch(UPLOAD_URL,{method:"POST",body:fd})).json();if(!r.success)throw new Error(r.error?.message||"Failed");await updU({[f]:r.data.url,[a]:!0});setImg(k,r.data.url,!0);alert("Uploaded!")}catch(e){alert("Failed: "+e.message);b.innerText=o}finally{b.style.pointerEvents="auto";v("fl-"+k).value=""}},
initImg=async uid=>{const s=await GD(Q(C(db,"users"),W("uid","==",uid)));if(s.empty)return;uDoc=s.docs[0].id;const d=uData=s.docs[0].data();Object.entries(IMG).forEach(([k,[f,a]])=>setImg(k,d[f],!!d[f]&&d[a]!==!1));refreshManifest()};
imgBox.innerHTML=Object.entries(IMG).map(([k,[,,t]])=>`<div class="img-row" id="row-${k}"><div><div class="lbl-row"><div class="lbl">${t}</div><span class="edit-link map-link" data-a="map" data-k="${k}">Mapping</span></div><div class="val">Not uploaded (using default)</div><img id="pv-${k}" class="img-preview" alt="${t}"></div><div class="img-actions"><div class="toggle-wrap"><label class="toggle-switch"><input type="checkbox" id="tg-${k}" data-k="${k}"><span class="toggle-slider"></span></label><span class="toggle-status-text" id="ts-${k}">Default</span></div><span class="edit-link" id="up-${k}" data-a="up" data-k="${k}">Upload</span><span class="edit-link delete-link" data-a="del" data-k="${k}">Delete</span></div><input type="file" id="fl-${k}" data-k="${k}" accept="image/*" hidden></div>`).join("");
imgBox.addEventListener("click",async e=>{const t=e.target.closest("[data-a]");if(!t)return;const k=t.dataset.k,[f,a]=IMG[k];if(t.dataset.a==="map")return dispatchEvent(new CustomEvent("mapping",{detail:k}));if(t.dataset.a==="up")return v("fl-"+k).click();if(!confirm("Delete this image?"))return;if(!uDoc)return alert(UNF);try{await updU({[f]:"",[a]:!1});setImg(k,"",!1);alert("Deleted!")}catch(x){alert("Error: "+x.message)}});
imgBox.addEventListener("change",async e=>{const t=e.target,k=t.dataset.k;if(!k)return;if(t.type==="file")return upload(k,t.files[0]);if(!uDoc){t.checked=!t.checked;return alert(UNF)}try{await updU({[IMG[k][1]]:t.checked});v("ts-"+k).innerText=t.checked?"Custom":"Default"}catch(x){alert("Error: "+x.message);t.checked=!t.checked}});
const H="https://rahcare.blogspot.com/",DEF_ICO="https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/icon-192.png",DEF_NAME="Rah Care",instBox=v("instCustom");
let prmpt=window.__bip,uData=null,mKey="",bt=0;
const msg=t=>{clearTimeout(bt);v("instMsg").textContent=t},
busy=on=>{clearTimeout(bt);["instDef","instCus","instGo"].forEach(i=>v(i).disabled=on);v("instMsg").textContent=on?"Please wait...":"";on&&(bt=setTimeout(()=>busy(!1),4e3))},
logo=()=>uData?.logoUrl&&uData.logoActive!==!1?uData.logoUrl:DEF_ICO,
setManifest=(name,icon)=>{const n=name||DEF_NAME,i=icon||DEF_ICO,k=n+"|"+i;if(k===mKey)return!1;mKey=k;document.querySelector('link[rel="manifest"]')?.remove();const a={name:n,short_name:n,start_url:H,scope:H,display:"standalone",orientation:"portrait",background_color:"#fff",theme_color:"#1a4731",icons:[192,512].map(s=>({src:i,sizes:`${s}x${s}`,type:"image/png",purpose:"any maskable"}))},l=document.createElement("link");l.rel="manifest";l.href=URL.createObjectURL(new Blob([JSON.stringify(a)],{type:"application/json"}));document.head.appendChild(l);return!0},
refreshManifest=()=>setManifest(uData?.centreName,logo())&&busy(!0),
gotPrompt=()=>{prmpt=window.__bip;busy(!1)},
install=async(name,icon)=>{
if(matchMedia("(display-mode:standalone)").matches)return msg("✅ অ্যাপ থেকেই চলছে");
if(setManifest(name,icon))return busy(!0);
if(!prmpt)return msg(/iphone|ipad|ipod/i.test(navigator.userAgent)?"📲 Safari: Share → 'Add to Home Screen'":"📲 ব্রাউজার মেনু (⋮) → 'Install app'");
try{prmpt.prompt();const r=await prmpt.userChoice;msg(r.outcome=="accepted"?"✅ ইন্সটল হচ্ছে...":"ইন্সটল বাতিল করা হয়েছে");instBox.style.display="none"}catch{msg("⚠️ আবার চেষ্টা করুন")}
prmpt=window.__bip=null;mKey="";refreshManifest()};
prmpt&&gotPrompt();
addEventListener("bip",gotPrompt);
addEventListener("appinstalled",()=>{prmpt=window.__bip=null;instBox.style.display="none";msg("✅ ইন্সটল হয়েছে")});
v("instDef").onclick=()=>setManifest(DEF_NAME,DEF_ICO)?busy(!0):install(DEF_NAME,DEF_ICO);
v("instCus").onclick=()=>{v("instName").value=uData?.centreName||DEF_NAME;instBox.style.display="block";refreshManifest()};
let dt=0;v("instName").oninput=()=>{clearTimeout(dt);busy(!0);dt=setTimeout(()=>setManifest(v("instName").value.trim(),logo())?busy(!0):busy(!1),600)};
v("instGo").onclick=()=>install(v("instName").value.trim()||DEF_NAME,logo());
v("instCancel").onclick=()=>instBox.style.display="none";
return{ask,initImg,updU,UNF,get uDoc(){return uDoc},get uData(){return uData}}}

/* ===== Shared: মাসিক রিপোর্ট — monthly-report.js ও myreport.js এখান থেকে ডাকে ===== */
export function mountMonthlyReport(){
const C=CO,S=ON,Q=QU,W=WH,FD=formatDateDMY,FT=formatTime12;
const v=i=>document.getElementById(i),
EMPTY='<div class="empty-note">কোনো তথ্য নেই</div>',
low=s=>((s||"")+"").trim().toLowerCase(),
amt=a=>Number(a.paid||a.bill)||0,
fmt=d=>d?FD(d)||"--":"--",
sortBy=(l,k)=>[...l].sort((a,b)=>(b[k]||"").localeCompare(a[k]||"")),
grp=(l,k)=>l.reduce((m,a)=>{const x=((a[k]||"")+"").slice(0,7);x&&(m[x]=m[x]||[]).push(a);return m},{}),
tbl=(cols,rows)=>rows.length?`<table><thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`:EMPTY,
status=a=>["cancelled","canceled","cancel"].includes(low(a.status))?"cancelled":isPaid(a)?"completed":"pending",
isHj=a=>low(a.category).startsWith("hijama"),
uniq=l=>Object.values(l.reduce((m,a)=>{const k=(a.phone||"").trim()+"|"+(a.name||"").trim();(m[k]=m[k]||{name:a.name||"--",phone:a.phone||"--",dates:[]}).dates.push(a.date||"--");return m},{})),
catTable=(l,bill)=>tbl(["Date","Name","Number","Time",...(bill?["Bill"]:[])],sortBy(l,"date").map(a=>[fmt(a.date),a.name||"--",a.phone||"--",FT(a.time)||"--",...(bill?[amt(a)]:[])])),
reschTable=l=>tbl(["Date","Name","Number","Old → New"],sortBy(l,"loggedAt").map(a=>[fmt((a.loggedAt||"").slice(0,10)),a.name||"--",a.phone||"--",fmt(a.oldDate)+" → "+fmt(a.newDate)])),
sect=(t,r)=>`<div class="category-section"><div class="category-heading">${t} (${r.n})</div>${r.h}</div>`,
patients=(l,p)=>uniq(l).map((x,i)=>`<div class="p-row"><div class="p-head" onclick="window.rptToggleRecent('${p}-${i}')"><span>👤 <b>${x.name}</b> — ${x.phone} <span style="color:var(--text-muted)">(${x.dates.length} বার)</span></span><span style="color:var(--muted-2)">▾</span></div><div class="p-visits" id="recent-${p}-${i}">${x.dates.sort().reverse().map(d=>`<div>📅 ${fmt(d)}</div>`).join("")}</div></div>`).join("")||EMPTY,
catBlock=(l,render,sum)=>{const R=render(l.filter(a=>!isHj(a)),"r"),H=render(l.filter(isHj),"h");return sect("Ruqyah",R)+sect("Hijamah",H)+(sum?sum(R,H):"")},
totalBlock=(l,mk)=>catBlock(l,(x,s)=>({n:uniq(x).length,h:patients(x,"tp"+s+"-"+mk)}),(R,H)=>`<div class="sum-box">রুকইয়াহ: ${R.n} জন • হিজামাহ: ${H.n} জন<br><b>সর্বমোট: ${R.n+H.n} জন</b></div>`),
doneBlock=l=>catBlock(l,x=>({n:x.length,h:catTable(x,1),s:x.reduce((t,a)=>t+amt(a),0)}),(R,H)=>`<div class="sum-box">রুকইয়াহ: ${R.n} জন, ${R.s} • হিজামাহ: ${H.n} জন, ${H.s}<br><b>সর্বমোট: ${R.n+H.n} জন, ${R.s+H.s}</b></div>`),
onlyBlock=l=>catBlock(l,x=>({n:x.length,h:catTable(x)}));
let A=[],RS=[],G={},GR={},months=[],cur=null,all=!1;
const card=mk=>{const L=G[mk]||[],RL=GR[mk]||[],st=s=>L.filter(a=>status(a)===s),CL=st("completed"),NL=st("cancelled"),PL=st("pending"),
b=[["ok","tp",`মোট পেশেন্ট: ${uniq(L).length}`,totalBlock(L,mk)],["ok","cp",`সার্ভিস সম্পন্ন: ${CL.length}`,doneBlock(CL)],["danger","cn",`ক্যানসেল: ${NL.length}`,onlyBlock(NL)],["pending","rs",`রিশিডিউল: ${RL.length}`,reschTable(RL)],...(PL.length?[["warning","pd",`পেন্ডিং: ${PL.length}`,onlyBlock(PL)]]:[])];
return`<div class="center-card"><div class="top-row"><div class="name">📅 ${monthLabel(mk)}</div></div><div class="card-actions" style="margin-top:6px">${b.map(([c,i,t])=>`<span class="rc-badge rc-badge-${c}" onclick="window.rptToggleRecent('${i}-${mk}')">${t}</span>`).join("")}</div>${b.map(([,i,,h])=>`<div class="recent-list" id="recent-${i}-${mk}">${h}</div>`).join("")}</div>`},
draw=()=>{v("monthNav").innerHTML=!months.length?"":all?`<span class="all-text active" onclick="window.rptToggleAll()">All ✕</span>`:`<button class="rc-nav-btn" onclick="window.rptShiftMonth(-1)">◀</button><div class="rc-filter-wrapper"><span class="rc-filter-text" onclick="window.rptOpenMonthPick()">${monthLabel(cur)}</span><input type="month" id="monthPick" class="rc-filter-hidden-input" value="${cur}" onchange="window.rptPickMonth(this.value)"></div><button class="rc-nav-btn" onclick="window.rptShiftMonth(1)">▶</button><span class="all-text" onclick="window.rptToggleAll()">All</span>`;
v("myReportList").innerHTML=months.length?(all?months.map(card).join(""):card(cur)):'<div class="empty-note">এখনো কোনো অ্যাপয়েন্টমেন্টের তথ্য পাওয়া যায়নি</div>'},
render=()=>{G=grp(A,"date");GR=grp(RS,"loggedAt");months=[...new Set([...Object.keys(G),...Object.keys(GR)])].sort((a,b)=>b.localeCompare(a));cur=cur||toISOMonth(new Date());draw()},
closeAll=x=>document.querySelectorAll(".recent-list,.p-visits").forEach(e=>e!==x&&(e.style.display="none"));
Object.assign(window,{
rptOpenMonthPick:()=>{const e=v("monthPick");e&&(e.showPicker?e.showPicker():e.click())},
rptShiftMonth:n=>{const d=new Date(cur+"-01T00:00:00");d.setMonth(d.getMonth()+n);cur=toISOMonth(d);draw()},
rptPickMonth:x=>{x&&(cur=x,draw())},
rptToggleAll:()=>{all=!all;draw()},
rptToggleRecent:id=>{const t=v("recent-"+id);if(!t)return;const open=t.style.display!=="block";closeAll(t);t.style.display=open?"block":"none"}});
document.addEventListener("click",e=>{e.target.closest(".rc-badge,.p-head,.recent-list,.p-visits")||closeAll()});
return u=>{const listen=(n,set)=>S(Q(C(db,n),W("uid","==",u.uid)),s=>{set(docsOf(s));render()});
listen("appointments",x=>A=x);listen("rescheduleLogs",x=>RS=x)}}
