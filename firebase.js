import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXJlXO3OIo_pDXkQCc_9-cDFzMGEWqQOI",
  authDomain: "excel-id-card-d4b53.firebaseapp.com",
  projectId: "excel-id-card-d4b53",
  storageBucket: "excel-id-card-d4b53.firebasestorage.app",
  messagingSenderId: "1006344516000",
  appId: "1:1006344516000:web:875c19c0e63292164f74c5",
  measurementId: "G-32TQTQBVCY"
};

// Initialize Primary App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Secondary App (used strictly for Admin creating user accounts without logging out)
export const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);

// Setup Admin
export const ADMIN_EMAIL = "excelkdly@gmail.com";
