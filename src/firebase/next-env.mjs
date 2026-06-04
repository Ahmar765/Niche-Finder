/** @typedef {import('./resolve-config.ts').FirebaseWebConfig} FirebaseWebConfig */

/**
 * Maps App Hosting FIREBASE_WEBAPP_CONFIG into NEXT_PUBLIC_* for the Next.js build.
 * Used by next.config.mjs (Node only).
 */
export function firebaseEnvFromHosting() {
  /** @type {FirebaseWebConfig | null} */
  let hosted = null;

  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      hosted = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    } catch {
      hosted = null;
    }
  }

  return {
    NEXT_PUBLIC_FIREBASE_API_KEY:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? hosted?.apiKey ?? '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? hosted?.authDomain ?? '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? hosted?.projectId ?? '',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? hosted?.storageBucket ?? '',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? hosted?.messagingSenderId ?? '',
    NEXT_PUBLIC_FIREBASE_APP_ID:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? hosted?.appId ?? '',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? hosted?.measurementId ?? '',
  };
}
