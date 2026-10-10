import{requireAuth,mountMonthlyReport}from"https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/common.js?v=12";
const start=mountMonthlyReport();
requireAuth(u=>{document.getElementById("rptWrap").style.display="block";start(u)});
