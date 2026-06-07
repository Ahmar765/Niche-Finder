'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { resolveFirebaseClientConfig } from './resolve-config';

const firebaseConfig = resolveFirebaseClientConfig();

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let storage: FirebaseStorage | undefined;
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

export function getFirebaseStorage(): FirebaseStorage {
  const firebaseApp = getFirebaseApp();

  if (!storage) {
    storage = getStorage(firebaseApp);
  }

  return storage;
}
