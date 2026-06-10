import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { executeAmplifySeoContent } from '@/backend/seo/seo-article-service';
import { isSeoDashboardAdmin } from '@/backend/seo/seo-dashboard-service';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    if (!(await isSeoDashboardAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = (await req.json()) as { articleId?: string };
    if (!body.articleId) {
      return NextResponse.json({ error: 'Article ID is required.' }, { status: 400 });
    }

    const tasks = await executeAmplifySeoContent(userId, body.articleId);
    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Amplification failed';
    console.error('[api/seo/amplify]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
