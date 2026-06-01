import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const projectId =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsPath) {
    const resolvedPath = resolve(process.cwd(), credentialsPath);

    if (existsSync(resolvedPath)) {
      try {
        const serviceAccount = JSON.parse(readFileSync(resolvedPath, 'utf8'));
        return initializeApp({
          credential: cert(serviceAccount),
          projectId: projectId || serviceAccount.project_id,
        });
      } catch (error) {
        console.warn('[Firebase Admin] Failed to load service account credentials:', error);
      }
    } else {
      console.warn(`[Firebase Admin] Credentials file not found: ${resolvedPath}`);
    }
  }

  if (!projectId) {
    console.warn('[Firebase Admin] Missing project ID. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.');
  } else if (!credentialsPath) {
    console.warn(
      '[Firebase Admin] No GOOGLE_APPLICATION_CREDENTIALS set. Server writes and admin reads will fail locally until configured.'
    );
  }

  return initializeApp({
    projectId,
  });
}

const adminApp = getAdminApp();

export const adminFirestore: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);

export function isAdminConfigured(): boolean {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath || !projectId) {
    return false;
  }

  return existsSync(resolve(process.cwd(), credentialsPath));
}
