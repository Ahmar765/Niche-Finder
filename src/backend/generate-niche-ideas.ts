'use server';

import { cookies } from 'next/headers';
import { executeNicheSearch } from './niche-search-service';

/** @deprecated Prefer POST /api/niche-search from the client. */
export async function generateNicheIdeas(
  searchRequest: Parameters<typeof executeNicheSearch>[1],
  isInvestorMode?: boolean,
) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) {
    return { error: 'User not authenticated. Please sign out and sign in again.' };
  }
  return executeNicheSearch(userId, searchRequest, isInvestorMode);
}
