import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBN4IAnXjUTpMtypZTseVXqmgfuwfjwbL0",
  authDomain: "cond-facilit.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cond-facilit",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cond-facilit.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "883434082733",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:883434082733:web:2f3cc2e52656ed0d81d124"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with explicit LocalStorage persistence for Safari & Firefox compatibility
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Local persistence setting fallback:", err);
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
