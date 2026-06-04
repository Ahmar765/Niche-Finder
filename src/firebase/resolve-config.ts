export type FirebaseWebConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

export function parseFirebaseWebAppConfig(): FirebaseWebConfig | null {
  const raw = process.env.FIREBASE_WEBAPP_CONFIG;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as FirebaseWebConfig;
  } catch {
    return null;
  }
}

export function parseFirebaseProjectConfig(): { projectId?: string; storageBucket?: string } | null {
  const raw = process.env.FIREBASE_CONFIG;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { projectId?: string; storageBucket?: string };
  } catch {
    return null;
  }
}

/** Resolves client Firebase config from NEXT_PUBLIC_* or App Hosting FIREBASE_WEBAPP_CONFIG. */
export function resolveFirebaseClientConfig(): Required<
  Pick<
    FirebaseWebConfig,
    'apiKey' | 'authDomain' | 'projectId' | 'storageBucket' | 'messagingSenderId' | 'appId'
  >
> & { measurementId: string } {
  const hosted = parseFirebaseWebAppConfig();

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? hosted?.apiKey ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? hosted?.authDomain ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? hosted?.projectId ?? '',
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? hosted?.storageBucket ?? '',
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? hosted?.messagingSenderId ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? hosted?.appId ?? '',
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? hosted?.measurementId ?? '',
  };
}

export function resolveFirebaseProjectId(): string {
  const hosted = parseFirebaseWebAppConfig();
  const firebaseConfig = parseFirebaseProjectConfig();

  return (
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    hosted?.projectId ??
    firebaseConfig?.projectId ??
    ''
  );
}
