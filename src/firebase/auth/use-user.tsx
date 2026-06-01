'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { ensureAuthReady } from '@/firebase/config';
import { setCookie, deleteCookie } from 'cookies-next';

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      await ensureAuthReady();

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          setCookie('userId', firebaseUser.uid, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
        } else {
          deleteCookie('userId', { path: '/' });
        }
      });

      await auth.authStateReady();
      setIsLoading(false);
    })();

    return () => unsubscribe?.();
  }, [auth]);
  
  const value = useMemo(() => ({
    user,
    isLoading,
  }), [user, isLoading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
