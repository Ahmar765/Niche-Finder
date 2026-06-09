import { FieldValue } from 'firebase-admin/firestore';
import type { Recommendation, SearchRequest } from '@nichefinder/domain-types';
import { adminFirestore } from './firebase-admin';
import { runNicheSearch } from './niche-search-engine';
import { trackPlatformEvent } from './platform-events';
import { recordSearchCompletedMemory } from './search-memory';
import { AutosaveEngine } from '../../services/autosave-engine/src';

export type NicheSearchResult =
  | { recommendations: Recommendation[] }
  | { error: string };

function formatSearchError(error: unknown): string {
  const err = error instanceof Error ? error : new Error('Search failed');
  if (err.message === 'INSUFFICIENT_ACUS') {
    return 'Not enough ACU credits for this search. Your welcome balance covers one niche search (100 ACU).';
  }
  if (err.message === 'INSUFFICIENT_PAID_ACUS') {
    return 'This action requires paid credits. Add credits to continue.';
  }
  if (err.message === 'Wallet not found.') {
    return 'Account setup incomplete. Open your dashboard and click Retry setup.';
  }
  if (err.message.includes('All AI providers failed')) {
    return 'AI services are temporarily unavailable. Please try again in a moment.';
  }
  return err.message;
}

export async function executeNicheSearch(
  userId: string,
  searchRequest: SearchRequest,
  isInvestorMode?: boolean,
): Promise<NicheSearchResult> {
  const walletDoc = await adminFirestore.collection('wallets').doc(userId).get();
  if (!walletDoc.exists) {
    return {
      error:
        'Account setup incomplete. Open your dashboard and click Retry setup, then try search again.',
    };
  }

  const eventId = await trackPlatformEvent(userId, 'search.created', { searchRequest, isInvestorMode });

  try {
    const { recommendations } = await runNicheSearch(userId, searchRequest, isInvestorMode || false);

    if (!recommendations.length) {
      return { error: 'No niche ideas were generated. Try a broader search or different country.' };
    }

    const batch = adminFirestore.batch();
    const searchSessionRef = adminFirestore.collection('search_sessions').doc();
    batch.set(searchSessionRef, {
      user_id: userId,
      input_payload: searchRequest,
      ai_results_summary: `Generated ${recommendations.length} niche ideas.`,
      created_at: FieldValue.serverTimestamp(),
    });

    recommendations.forEach((rec) => {
      batch.set(adminFirestore.collection('niche_results').doc(rec.niche.id), {
        ...rec,
        user_id: userId,
        search_session_id: searchSessionRef.id,
        is_unlocked: false,
        unlocked_at: null,
        tags: [searchRequest.countryCode, rec.niche.sectorSlug, 'idea'],
        autosave: AutosaveEngine.prepareMetadata(
          0,
          'System:Orchestrator',
          'saved',
          'Discovery run complete.',
          eventId || undefined,
        ),
      });
    });

    await batch.commit();

    try {
      await recordSearchCompletedMemory(userId, searchRequest.countryCode);
    } catch (memoryError) {
      console.error('[executeNicheSearch] Memory sync failed (search still saved):', memoryError);
    }

    return { recommendations };
  } catch (error: unknown) {
    return { error: formatSearchError(error) };
  }
}
