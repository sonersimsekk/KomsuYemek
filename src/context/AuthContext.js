import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const requestId = useRef(0);

  const refreshProfile = async (uid) => {
    const userId = uid || auth.currentUser?.uid;
    if (!userId) {
      setProfile(null);
      return null;
    }

    const id = ++requestId.current;
    setProfileLoading(true);
    try {
      const snapshot = await getDoc(doc(db, 'users', userId));
      if (id !== requestId.current) return null;
      const data = snapshot.exists() ? snapshot.data() : null;
      setProfile(data);
      return data;
    } finally {
      if (id === requestId.current) setProfileLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const id = ++requestId.current;
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setProfileLoading(false);
        setInitializing(false);
        return;
      }

      setProfileLoading(true);
      getDoc(doc(db, 'users', firebaseUser.uid))
        .then((snapshot) => {
          if (id !== requestId.current) return;
          setProfile(snapshot.exists() ? snapshot.data() : null);
        })
        .catch((error) => {
          console.error('Profil okunamadı:', error);
          if (id !== requestId.current) return;
          setProfile(null);
        })
        .finally(() => {
          if (id !== requestId.current) return;
          setProfileLoading(false);
          setInitializing(false);
        });
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, initializing, profileLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth yalnızca AuthProvider içinde kullanılabilir.');
  }
  return context;
}
