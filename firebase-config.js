import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
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

export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Checks the login state.
 * Calls onLoggedIn(user) if the user is authenticated.
 * Otherwise clears localStorage and redirects to the login page.
 */
export function authGuard(onLoggedIn) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.documentElement.style.visibility = "visible";
      onLoggedIn(user);
    } else {
      localStorage.clear();
      window.location.replace("https://rahcare.blogspot.com/p/login.html");
    }
  });
}
