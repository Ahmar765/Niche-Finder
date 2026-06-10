import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isPlatformAdmin, searchUsersByEmail } from '@/backend/admin-user-service';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    if (!(await isPlatformAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const users = await searchUsersByEmail(email);
    return NextResponse.json({ users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'User search failed';
    console.error('[api/admin/search-users]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
