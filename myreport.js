import{requireAuth,blockCacheAndBack,mountMonthlyReport,mountAdminTools}from"https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/common.js?v=15";
blockCacheAndBack();
const v=i=>document.getElementById(i),start=mountMonthlyReport();
/* পুরোনো নামগুলোও চালু রাখা হলো (Blogger পেজের HTML থেকে ডাকা হলে) */
Object.assign(window,{openMonthPick:window.rptOpenMonthPick,shiftMonth:window.rptShiftMonth,pickMonth:window.rptPickMonth,toggleAllView:window.rptToggleAll,toggleRecent:window.rptToggleRecent});
const{ask,initImg}=mountAdminTools();
requireAuth(async u=>{document.documentElement.style.visibility="visible";v("authOverlay").style.display="none";await ask(u);v("myReportWrap").style.display="block";initImg(u.uid);start(u)});
