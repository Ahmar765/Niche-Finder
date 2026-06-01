'use client';

import { getRedirectResult, type Auth, type UserCredential } from 'firebase/auth';
import { ensureAuthReady } from '@/firebase/config';

let redirectResultPromise: Promise<UserCredential | null> | null = null;

/** Call once per page load so React Strict Mode does not consume the redirect twice. */
export async function consumeAuthRedirectResult(auth: Auth): Promise<UserCredential | null> {
  if (!redirectResultPromise) {
    redirectResultPromise = (async () => {
      const readyAuth = await ensureAuthReady();
      const result = await getRedirectResult(readyAuth);
      await readyAuth.authStateReady();
      return result;
    })();
  }

  return redirectResultPromise;
}
