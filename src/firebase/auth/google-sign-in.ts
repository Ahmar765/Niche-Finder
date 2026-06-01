'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
  type User,
} from 'firebase/auth';
import { ensureAuthReady } from '@/firebase/config';
import { finalizeAuthSession } from '@/firebase/auth/post-auth';

export async function signInWithGoogle(
  auth: Auth,
  onAuthenticated?: (user: User) => void
): Promise<void> {
  await ensureAuthReady();
  const provider = new GoogleAuthProvider();

  try {
    const credential = await signInWithPopup(auth, provider);
    onAuthenticated?.(credential.user);
    await finalizeAuthSession(credential.user);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === 'auth/popup-closed-by-user') {
      return;
    }

    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
      return;
    }

    throw error;
  }
}
