import{collection as C,onSnapshot as S,query as Q,where as W,getDocs as GD,updateDoc as UD,doc as D}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import{getAuth,EmailAuthProvider as EP,reauthenticateWithCredential as RA}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import{db,formatDateDMY as FD,formatTime12 as FT,requireAuth,blockCacheAndBack,toISOMonth,isPaid,monthLabel}from"https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/common.js";
blockCacheAndBack();
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
patients=(l,p)=>uniq(l).map((x,i)=>`<div class="p-row"><div class="p-head" onclick="window.toggleRecent('${p}-${i}')"><span>👤 <b>${x.name}</b> — ${x.phone} <span style="color:var(--text-muted)">(${x.dates.length} বার)</span></span><span style="color:var(--muted-2)">▾</span></div><div class="p-visits" id="recent-${p}-${i}">${x.dates.sort().reverse().map(d=>`<div>📅 ${fmt(d)}</div>`).join("")}</div></div>`).join("")||EMPTY,
catBlock=(l,render,sum)=>{const R=render(l.filter(a=>!isHj(a)),"r"),H=render(l.filter(isHj),"h");return sect("Ruqyah",R)+sect("Hijamah",H)+(sum?sum(R,H):"")},
totalBlock=(l,mk)=>catBlock(l,(x,s)=>({n:uniq(x).length,h:patients(x,"tp"+s+"-"+mk)}),(R,H)=>`<div class="sum-box">রুকইয়াহ: ${R.n} জন • হিজামাহ: ${H.n} জন<br><b>সর্বমোট: ${R.n+H.n} জন</b></div>`),
doneBlock=l=>catBlock(l,x=>({n:x.length,h:catTable(x,1),s:x.reduce((t,a)=>t+amt(a),0)}),(R,H)=>`<div class="sum-box">রুকইয়াহ: ${R.n} জন, ${R.s} • হিজামাহ: ${H.n} জন, ${H.s}<br><b>সর্বমোট: ${R.n+H.n} জন, ${R.s+H.s}</b></div>`),
onlyBlock=l=>catBlock(l,x=>({n:x.length,h:catTable(x)}));
let A=[],RS=[],G={},GR={},months=[],cur=null,all=!1;
const card=mk=>{const L=G[mk]||[],RL=GR[mk]||[],st=s=>L.filter(a=>status(a)===s),CL=st("completed"),NL=st("cancelled"),PL=st("pending"),
b=[["ok","tp",`মোট পেশেন্ট: ${uniq(L).length}`,totalBlock(L,mk)],["ok","cp",`সার্ভিস সম্পন্ন: ${CL.length}`,doneBlock(CL)],["danger","cn",`ক্যানসেল: ${NL.length}`,onlyBlock(NL)],["pending","rs",`রিশিডিউল: ${RL.length}`,reschTable(RL)],...(PL.length?[["warning","pd",`পেন্ডিং: ${PL.length}`,onlyBlock(PL)]]:[])];
return`<div class="center-card"><div class="top-row"><div class="name">📅 ${monthLabel(mk)}</div></div><div class="card-actions" style="margin-top:6px">${b.map(([c,i,t])=>`<span class="rc-badge rc-badge-${c}" onclick="window.toggleRecent('${i}-${mk}')">${t}</span>`).join("")}</div>${b.map(([,i,,h])=>`<div class="recent-list" id="recent-${i}-${mk}">${h}</div>`).join("")}</div>`},
draw=()=>{v("monthNav").innerHTML=!months.length?"":all?`<span class="all-text active" onclick="window.toggleAllView()">All ✕</span>`:`<button class="rc-nav-btn" onclick="window.shiftMonth(-1)">◀</button><div class="rc-filter-wrapper"><span class="rc-filter-text" onclick="window.openMonthPick()">${monthLabel(cur)}</span><input type="month" id="monthPick" class="rc-filter-hidden-input" value="${cur}" onchange="window.pickMonth(this.value)"></div><button class="rc-nav-btn" onclick="window.shiftMonth(1)">▶</button><span class="all-text" onclick="window.toggleAllView()">All</span>`;
v("myReportList").innerHTML=months.length?(all?months.map(card).join(""):card(cur)):'<div class="empty-note">এখনো কোনো অ্যাপয়েন্টমেন্টের তথ্য পাওয়া যায়নি</div>'},
render=()=>{G=grp(A,"date");GR=grp(RS,"loggedAt");months=[...new Set([...Object.keys(G),...Object.keys(GR)])].sort((a,b)=>b.localeCompare(a));cur=cur||toISOMonth(new Date());draw()},
closeAll=x=>document.querySelectorAll(".recent-list,.p-visits").forEach(e=>e!==x&&(e.style.display="none"));
Object.assign(window,{
openMonthPick:()=>{const e=v("monthPick");e&&(e.showPicker?e.showPicker():e.click())},
shiftMonth:n=>{const d=new Date(cur+"-01T00:00:00");d.setMonth(d.getMonth()+n);cur=toISOMonth(d);draw()},
pickMonth:x=>{x&&(cur=x,draw())},
toggleAllView:()=>{all=!all;draw()},
toggleRecent:id=>{const t=v("recent-"+id);if(!t)return;const open=t.style.display!=="block";closeAll(t);t.style.display=open?"block":"none"}});
document.addEventListener("click",e=>{e.target.closest(".rc-badge,.p-head,.recent-list,.p-visits")||closeAll()});
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
let prmpt=__bip,uData=null,mKey="",bt=0;
const msg=t=>{clearTimeout(bt);v("instMsg").textContent=t},
busy=on=>{clearTimeout(bt);["instDef","instCus","instGo"].forEach(i=>v(i).disabled=on);v("instMsg").textContent=on?"Please wait...":"";on&&(bt=setTimeout(()=>busy(!1),4e3))},
logo=()=>uData?.logoUrl&&uData.logoActive!==!1?uData.logoUrl:DEF_ICO,
setManifest=(name,icon)=>{const n=name||DEF_NAME,i=icon||DEF_ICO,k=n+"|"+i;if(k===mKey)return!1;mKey=k;document.querySelector('link[rel="manifest"]')?.remove();const a={name:n,short_name:n,start_url:H,scope:H,display:"standalone",orientation:"portrait",background_color:"#fff",theme_color:"#1a4731",icons:[192,512].map(s=>({src:i,sizes:`${s}x${s}`,type:"image/png",purpose:"any maskable"}))},l=document.createElement("link");l.rel="manifest";l.href=URL.createObjectURL(new Blob([JSON.stringify(a)],{type:"application/json"}));document.head.appendChild(l);return!0},
refreshManifest=()=>setManifest(uData?.centreName,logo())&&busy(!0),
gotPrompt=()=>{prmpt=__bip;busy(!1)},
install=async(name,icon)=>{
if(matchMedia("(display-mode:standalone)").matches)return msg("✅ অ্যাপ থেকেই চলছে");
if(setManifest(name,icon))return busy(!0);
if(!prmpt)return msg(/iphone|ipad|ipod/i.test(navigator.userAgent)?"📲 Safari: Share → 'Add to Home Screen'":"📲 ব্রাউজার মেনু (⋮) → 'Install app'");
try{prmpt.prompt();const r=await prmpt.userChoice;msg(r.outcome=="accepted"?"✅ ইন্সটল হচ্ছে...":"ইন্সটল বাতিল করা হয়েছে");instBox.style.display="none"}catch{msg("⚠️ আবার চেষ্টা করুন")}
prmpt=__bip=null;mKey="";refreshManifest()};
prmpt&&gotPrompt();
addEventListener("bip",gotPrompt);
addEventListener("appinstalled",()=>{prmpt=__bip=null;instBox.style.display="none";msg("✅ ইন্সটল হয়েছে")});
v("instDef").onclick=()=>setManifest(DEF_NAME,DEF_ICO)?busy(!0):install(DEF_NAME,DEF_ICO);
v("instCus").onclick=()=>{v("instName").value=uData?.centreName||DEF_NAME;instBox.style.display="block";refreshManifest()};
let dt=0;v("instName").oninput=()=>{clearTimeout(dt);busy(!0);dt=setTimeout(()=>setManifest(v("instName").value.trim(),logo())?busy(!0):busy(!1),600)};
v("instGo").onclick=()=>install(v("instName").value.trim()||DEF_NAME,logo());
v("instCancel").onclick=()=>instBox.style.display="none";
requireAuth(async u=>{document.documentElement.style.visibility="visible";v("authOverlay").style.display="none";await ask(u);v("myReportWrap").style.display="block";initImg(u.uid);
const listen=(n,set)=>S(Q(C(db,n),W("uid","==",u.uid)),s=>{set(s.docs.map(d=>({id:d.id,...d.data()})));render()});
listen("appointments",x=>A=x);listen("rescheduleLogs",x=>RS=x)});
