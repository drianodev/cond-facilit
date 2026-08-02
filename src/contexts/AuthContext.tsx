import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'morador';
  updatedAt?: any;
}

interface AuthContextData {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  canToggleRole: boolean;
  signInWithGoogle: () => Promise<any> | void;
  logout: () => Promise<void>;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.warn("Resultado do redirecionamento auth:", err);
    });

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const adminEmailsStr = (import.meta.env.VITE_ADMIN_EMAILS as string) || '';
          const adminEmails = typeof adminEmailsStr === 'string' && adminEmailsStr
            ? adminEmailsStr.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
            : [];
          const isEmailAdmin = currentUser.email ? adminEmails.includes(currentUser.email.toLowerCase()) : false;

          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            const userIsAdmin = isEmailAdmin || data?.role === 'admin';
            setIsAdmin(userIsAdmin);
          } else {
            const defaultRole = isEmailAdmin ? 'admin' : 'morador';
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Morador',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              role: defaultRole,
              updatedAt: serverTimestamp(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
            setIsAdmin(defaultRole === 'admin');
          }
        } catch (err) {
          console.error("Erro ao sincronizar perfil no Firestore", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const toggleRole = () => {
    setIsAdmin(prev => !prev);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.warn("Popup error/blocked, tentando login via redirecionamento:", error);
      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          console.error("Erro no redirecionamento do Google", redirectErr);
        }
      } else {
        console.error("Erro ao fazer login com Google", error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  const superAdminEmail = (import.meta.env.VITE_DEV_SUPERADMIN || 'adrianomendes661@gmail.com').toLowerCase();
  const canToggleRole = user?.email?.toLowerCase() === superAdminEmail;

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAdmin, canToggleRole, signInWithGoogle, logout, toggleRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
