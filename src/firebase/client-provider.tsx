'use client';

import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './config';
import { FirebaseProvider } from './provider';
import { useMemo } from 'react';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      app: getFirebaseApp(),
      auth: getFirebaseAuth(),
      firestore: getFirebaseFirestore(),
    }),
    []
  );

  return (
    <FirebaseProvider value={value}>
      {children}
    </FirebaseProvider>
  );
}
