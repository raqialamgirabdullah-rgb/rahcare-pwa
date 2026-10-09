import{collection as C,onSnapshot as S,query as Q,where as W}from"https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import{db,formatDateDMY as FD,formatTime12 as FT,requireAuth,toISOMonth,isPaid,monthLabel,docsOf}from"https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/common.js?v=12";
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
requireAuth(u=>{v("rptWrap").style.display="block";
const listen=(n,set)=>S(Q(C(db,n),W("uid","==",u.uid)),s=>{set(docsOf(s));render()});
listen("appointments",x=>A=x);listen("rescheduleLogs",x=>RS=x)});
