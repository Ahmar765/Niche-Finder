'use server';

import { cookies } from 'next/headers';

export async function setAuthSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
  });
}
