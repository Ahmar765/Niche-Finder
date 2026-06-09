'use server';

import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';
import type { SearchRequest } from '@nichefinder/domain-types';
import { adminFirestore } from './firebase-admin';
import { generateNicheIdeasFlow } from '@/ai/flows/generate-niche-ideas-flow';
import { syncUserMemory, trackPlatformEvent } from './actions';
import { AutosaveEngine } from '../../services/autosave-engine/src';

export async function generateNicheIdeas(searchRequest: SearchRequest, isInvestorMode?: boolean) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) {
    return { error: 'User not authenticated. Please sign out and sign in again.' };
  }

  const walletDoc = await adminFirestore.collection('wallets').doc(userId).get();
  if (!walletDoc.exists) {
    return {
      error:
        'Account setup incomplete. Open your dashboard and click Retry setup, then try search again.',
    };
  }

  const eventId = await trackPlatformEvent(userId, 'search.created', { searchRequest, isInvestorMode });

  try {
    const { recommendations } = await generateNicheIdeasFlow(
      userId,
      searchRequest,
      isInvestorMode || false,
    );

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
      await syncUserMemory(userId, {
        country: searchRequest.countryCode,
        search: true,
        eventType: 'search.completed',
      });
    } catch (memoryError) {
      console.error('[generateNicheIdeas] Memory sync failed (search still saved):', memoryError);
    }

    return { recommendations };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Search failed');
    const message =
      err.message === 'INSUFFICIENT_ACUS'
        ? 'Not enough ACU credits for this search. Your welcome balance covers one niche search (100 ACU).'
        : err.message === 'INSUFFICIENT_PAID_ACUS'
          ? 'This action requires paid credits. Add credits to continue.'
          : err.message === 'Wallet not found.'
            ? 'Account setup incomplete. Open your dashboard and click Retry setup.'
            : err.message.includes('All AI providers failed')
              ? 'AI services are temporarily unavailable. Please try again in a moment.'
              : err.message;
    return { error: message };
  }
}
