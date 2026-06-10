import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { SeoContentType } from '@nichefinder/domain-types';
import { executeGenerateSeoArticle } from '@/backend/seo/seo-article-service';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    const body = (await req.json()) as { topic?: string; type?: SeoContentType };
    if (!body.topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const result = await executeGenerateSeoArticle(
      userId,
      body.topic.trim(),
      body.type ?? 'pillar',
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    console.error('[api/seo/generate-article]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
