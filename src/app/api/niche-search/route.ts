import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { SearchRequest } from '@nichefinder/domain-types';
import { executeNicheSearch } from '@/backend/niche-search-service';

export const runtime = 'nodejs';
export const maxDuration = 120;

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

    const body = (await req.json()) as {
      searchRequest?: SearchRequest;
      isInvestorMode?: boolean;
    };

    if (!body.searchRequest?.countryCode) {
      return NextResponse.json({ error: 'Country is required for search.' }, { status: 400 });
    }

    const result = await executeNicheSearch(userId, body.searchRequest, body.isInvestorMode);

    if ('error' in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('[api/niche-search]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
