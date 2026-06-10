import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isSeoDashboardAdmin, loadSeoDashboardView } from '@/backend/seo/seo-dashboard-service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    if (!(await isSeoDashboardAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const data = await loadSeoDashboardView();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load SEO dashboard';
    console.error('[api/seo/dashboard]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
