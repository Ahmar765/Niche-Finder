'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let persistenceReady: Promise<void> | null = null;

function assertFirebaseConfig() {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase is not configured. Check NEXT_PUBLIC_FIREBASE_* values in .env and restart the dev server.'
    );
  }
}

export function getFirebaseApp(): FirebaseApp {
  assertFirebaseConfig();

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  return app;
}

export function getFirebaseAuth(): Auth {
  const firebaseApp = getFirebaseApp();

  if (!auth) {
    auth = getAuth(firebaseApp);
    persistenceReady = setPersistence(auth, browserLocalPersistence).then(() => undefined);
  }

  return auth;
}

export async function ensureAuthReady(): Promise<Auth> {
  const firebaseAuth = getFirebaseAuth();
  if (persistenceReady) {
    await persistenceReady;
  }
  return firebaseAuth;
}

export function getFirebaseFirestore(): Firestore {
  const firebaseApp = getFirebaseApp();

  if (!firestore) {
    firestore = getFirestore(firebaseApp);
  }

  return firestore;
}
