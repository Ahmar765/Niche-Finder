import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { executeUnlockNiche } from '@/backend/unlock-niche-service';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated. Please sign out and sign in again.' },
        { status: 401 },
      );
    }

    const body = (await req.json()) as { nicheId?: string };
    if (!body.nicheId) {
      return NextResponse.json({ error: 'Niche ID is required.' }, { status: 400 });
    }

    const result = await executeUnlockNiche(userId, body.nicheId);

    if ('error' in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unlock failed';
    console.error('[api/niche-unlock]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
