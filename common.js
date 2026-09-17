import{initializeApp as t,getApps as e}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";import{getFirestore as n}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";import{getAuth as o,onAuthStateChanged as r}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";export const app=e().length?e()[0]:t({apiKey:"AIzaSyDAicuq_q2KoKLx01Yejo3jEx64n5tZOJA",authDomain:"rah-care.firebaseapp.com",projectId:"rah-care",storageBucket:"rah-care.firebasestorage.app",messagingSenderId:"205338868264",appId:"1:205338868264:web:c5cb43f269346374c2531d"});export const db=n(app);export const auth=o(app);export function blockCacheAndBack(){history.pushState(null,null,location.href),window.addEventListener("popstate",function(){history.pushState(null,null,location.href)}),window.addEventListener("pageshow",function(t){t.persisted&&window.location.reload()}),document.documentElement.style.visibility="hidden"}export function requireAuth(t,e="https://rahcare.blogspot.com/p/login.html"){return r(auth,n=>{if(!n)return localStorage.clear(),void window.location.replace(e);t(n)})}export function togglePasswordVisibility(t,e){const n=document.getElementById(t),o="password"===n.type;n.type=o?"text":"password",e.textContent=o?"🔒":"👁"}export function formatDateDMY(t){const e=new Date(t);return isNaN(e.getTime())?null:`${String(e.getDate()).padStart(2,"0")}.${String(e.getMonth()+1).padStart(2,"0")}.${String(e.getFullYear()).slice(-2)}`}export function formatTime12(t){if(!t)return"";const e=String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/);if(!e)return t;let n=parseInt(e[1],10);const o=parseInt(e[2],10);let r=e[3]?e[3].toUpperCase():null;r||(r=n>=12?"PM":"AM",n%=12,0===n&&(n=12));const a=String(n).padStart(2,"0");return 0===o?`${a} ${r}`:`${a}:${String(o).padStart(2,"0")} ${r}`}export function copyToClipboard(t){navigator.clipboard&&navigator.clipboard.writeText(String(t))}export const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];export function toWhatsAppNumber(t){let e=String(t||"").replace(/\D/g,"");return e.startsWith("01")&&11===e.length?"88"+e:e}export function whatsappLink(t,e=""){const n=toWhatsAppNumber(t);if(!n)return"";const o=`https://api.whatsapp.com/send?phone=${n}`;return e?`${o}&text=${encodeURIComponent(e)}`:o}export function autoClearAuthForm(t=".auth-card input"){function e(){document.querySelectorAll(t).forEach(t=>t.value="")}window.addEventListener("pagehide",e),window.addEventListener("pageshow",function(t){e(),t.persisted&&location.reload()})}export function initDropdowns(t=".rc-dd",e=".rc-dd-menu"){document.addEventListener("click",n=>{n.target.closest(t)||document.querySelectorAll(e+".open").forEach(t=>t.classList.remove("open"))})}export function toggleDropdown(t,e=".rc-dd-menu"){const n=t.classList.contains("open");document.querySelectorAll(e+".open").forEach(t=>t.classList.remove("open")),n||t.classList.add("open")}export function toISODate(t){return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")}export function toISOMonth(t){return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")}export function openModal(t){const e="string"==typeof t?document.getElementById(t):t;e&&e.classList.add("show")}export function closeModal(t){const e="string"==typeof t?document.getElementById(t):t;e&&e.classList.remove("show")}export function isPaid(t){return void 0!==t.bill&&"unpaid"!==String(t.bill).trim().toLowerCase()&&""!==String(t.bill).trim()&&"0"!==String(t.bill).trim()}export function monthLabel(t){const e=(t+"").split("-");return(MONTH_NAMES[parseInt(e[1])-1]||"")+" "+e[0]}export const RAHCARE_BASE="https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/";export function isHijama(t){return!!t.category&&(t.category+"").trim().toLowerCase().startsWith("hijama")}export async function fetchAddressData(){const t=await fetch(RAHCARE_BASE+"address-data.js").then(t=>t.text());return Function(t+";return addressData;")()}export function initAddressDropdown({menuId:t,btnId:e,valueId:n,addressData:o,onSelect:r}){const a=document.getElementById(t),i=document.getElementById(e),s=document.getElementById(n);function v(t,e,n){const o=[t,e,n].filter(Boolean).join(", ");"INPUT"===s.tagName?s.value=o:s.textContent=o,i&&i.classList.add("selected")}function c(t,e,n){const o=document.createElement("span");o.textContent=t,n&&(o.className=n),o.onclick=t=>{t.stopPropagation(),e()},a.appendChild(o)}function p(t,e,n){v(t,e,n),a.classList.remove("open"),r&&r(t,e,n),d()}function d(){a.innerHTML="",Object.keys(o).forEach(t=>{c(t,()=>l(t))})}function l(t){v(t),a.innerHTML="",c("🔙 Back to Divisions",d,"rc-dd-back"),Object.keys(o[t]).forEach(e=>{c(e,()=>{v(t,e);(function(t,e){a.innerHTML="",c("🔙 Back to Districts",()=>l(t),"rc-dd-back"),(o[t][e]||[]).forEach(n=>{c(n,()=>p(t,e,n))}),c("",()=>p(t,e),"rc-dd-done")})(t,e)})}),c("",()=>p(t),"rc-dd-done")}return a.classList.add("rc-dd-grid"),d(),{reset:d}}
// ---- Generic chip / dropdown picker ----
export function createChipPicker({btnId,menuId,valueId,multi=false,labelMap={},onChange}){
  const state=multi?new Set():{value:null};
  const btn=document.getElementById(btnId);
  const valEl=valueId?document.getElementById(valueId):btn;
  function render(){
    const vals=multi?[...state]:(state.value?[state.value]:[]);
    valEl.textContent=vals.length?vals.map(v=>labelMap[v]||v).join(" + "):"Select";
    btn.classList.toggle("selected",vals.length>0);
    document.querySelectorAll(`#${menuId} span`).forEach(s=>{
      s.classList.toggle("checked",multi?state.has(s.dataset.val):s.dataset.val===state.value);
    });
  }
  function pick(v){
    if(multi){state.has(v)?(state.size>1&&state.delete(v)):state.add(v);}
    else state.value=v;
    render();
    if(onChange)onChange(multi?[...state]:v);
  }
  function reset(def){
    if(multi){state.clear();if(def)state.add(def);}
    else state.value=def||null;
    render();
  }
  render();
  return{pick,reset,get:()=>multi?[...state]:state.value};
}

// ---- WhatsApp / SMS notify then redirect ----
export function redirectAfterMessage(phone,message,dashboardUrl="https://rahcare.blogspot.com/p/dashboard.html"){
  const wa="whatsapp://send?phone="+toWhatsAppNumber(phone);
  const smsSep=/iPhone|iPad|iPod/.test(navigator.userAgent)?"&body=":"?body=";
  const sms="sms:"+phone+smsSep+encodeURIComponent(message);
  let done=false;
  function go(){if(!done){done=true;window.location.replace(dashboardUrl);}}
  document.addEventListener("visibilitychange",function h(){
    if(document.visibilityState==="visible"){document.removeEventListener("visibilitychange",h);go();}
  });
  setTimeout(go,8000);
  window.location.href=wa;
  setTimeout(()=>{if(!done&&document.visibilityState==="visible")window.location.href=sms;},1500);
}

// ---- Render a DOM element (e.g. a slip template) as a downloadable PNG ----
export async function downloadElementAsImage(elId,filename,{scale=2,width,windowWidth}={}){
  try{
    const opts={scale,useCORS:true,logging:false,backgroundColor:"#ffffff"};
    if(width)opts.width=width;
    if(windowWidth)opts.windowWidth=windowWidth;
    const canvas=await html2canvas(document.getElementById(elId),opts);
    const a=document.createElement("a");
    a.download=filename;
    a.href=canvas.toDataURL("image/png");
    a.click();
    await new Promise(r=>setTimeout(r,1500));
    return true;
  }catch(e){
    console.error("Image generation failed:",e);
    return false;
  }
}
