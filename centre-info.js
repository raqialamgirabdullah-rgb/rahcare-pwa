import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/**
 * Fetches the logged-in centre's profile document from Firestore.
 * Returns {} if no document exists.
 */
export async function fetchCentreInfo(db, uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : {};
  } catch (err) {
    console.error("Error loading user data:", err);
    return {};
  }
}

/**
 * Fills the slip header elements with the centre's info, if those elements
 * exist on the current page. Safe to call on pages that don't have a slip.
 */
export function renderCentreInfo(info) {
  const g = id => document.getElementById(id);
  if (g("slipCentreName")) g("slipCentreName").textContent = (info.centreName || "Centre Name") + ":";
  if (g("slipCentreType")) g("slipCentreType").textContent = info.centreType || "";
  if (g("slipBranchName")) g("slipBranchName").textContent = "(" + (info.branchName || "Branch") + ")";
  if (g("slipBranchAddress")) g("slipBranchAddress").textContent = info.branchAddress || "";
  if (g("slipBranchNumber")) g("slipBranchNumber").textContent = "Phone: " + (info.branchNumber || "").replace("+880", "0");
}
