import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const authDomain = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? window.location.host
  : (envAuthDomain || "cond-facilit.firebaseapp.com");

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cond-facilit",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cond-facilit.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "883434082733",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:883434082733:web:2f3cc2e52656ed0d81d124"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

export default app;
