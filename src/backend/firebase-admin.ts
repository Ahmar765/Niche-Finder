import { initializeApp, getApps, getApp, cert, applicationDefault, type App, type Credential } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { resolveFirebaseProjectId } from '@/firebase/resolve-config';

const projectId = resolveFirebaseProjectId() || process.env.GOOGLE_CLOUD_PROJECT || undefined;

function isGcpRuntime(): boolean {
  return Boolean(
    process.env.K_SERVICE ||
    process.env.FIREBASE_CONFIG ||
    process.env.GOOGLE_CLOUD_PROJECT,
  );
}

function loadServiceAccountCredential(): Credential | null {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) return null;

  const resolvedPath = resolve(process.cwd(), credentialsPath);
  if (!existsSync(resolvedPath)) {
    console.warn(`[Firebase Admin] Credentials file not found: ${resolvedPath}`);
    return null;
  }

  try {
    const serviceAccount = JSON.parse(readFileSync(resolvedPath, 'utf8'));
    return cert(serviceAccount);
  } catch (error) {
    console.warn('[Firebase Admin] Failed to load service account credentials:', error);
    return null;
  }
}

function resolveAdminCredential(): Credential | undefined {
  const serviceAccount = loadServiceAccountCredential();
  if (serviceAccount) return serviceAccount;

  if (isGcpRuntime()) {
    return applicationDefault();
  }

  return undefined;
}

function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const credential = resolveAdminCredential();
  const resolvedProjectId = projectId || process.env.GOOGLE_CLOUD_PROJECT;

  if (!credential) {
    if (!resolvedProjectId) {
      console.warn('[Firebase Admin] Missing project ID. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.');
    } else {
      console.warn(
        '[Firebase Admin] No credentials available. Set GOOGLE_APPLICATION_CREDENTIALS locally or deploy to Firebase App Hosting for automatic credentials.',
      );
    }
  }

  return initializeApp({
    projectId: resolvedProjectId,
    ...(credential ? { credential } : {}),
  });
}

const adminApp = getAdminApp();

export const adminFirestore: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);

export function isAdminConfigured(): boolean {
  const resolvedProjectId = projectId || process.env.GOOGLE_CLOUD_PROJECT;
  if (!resolvedProjectId) return false;

  if (loadServiceAccountCredential()) return true;
  if (isGcpRuntime()) return true;

  return false;
}
