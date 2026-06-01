'use client';

import { setCookie } from 'cookies-next';
import type { User } from 'firebase/auth';

export function completeClientAuth(user: User) {
  setCookie('userId', user.uid, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
}

export async function finalizeAuthSession(user: User) {
  completeClientAuth(user);

  // Ensure Firebase has flushed auth state to local storage before full page navigation.
  await user.getIdToken();

  window.location.replace('/dashboard');
}
