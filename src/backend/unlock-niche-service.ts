import { FieldValue } from 'firebase-admin/firestore';
import type { Recommendation, ProcessMemory, WorkspaceMemory } from '@nichefinder/domain-types';
import { adminFirestore } from './firebase-admin';
import { handleBilledOperation } from './billing';
import { trackPlatformEvent } from './platform-events';
import { recordNicheUnlockedMemory } from './search-memory';
import { getAcuCost } from '@/config/acuActions';
import { AutosaveEngine } from '../../services/autosave-engine/src';

export type UnlockNicheResult =
  | { success: true; newBalance: number }
  | { error: string };

function formatUnlockError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unlock failed';
  if (message === 'INSUFFICIENT_PAID_ACUS') {
    return 'Unlock requires paid ACU credits (150 ACU). Your welcome credits can be used for search only — top up your wallet to unlock.';
  }
  if (message === 'INSUFFICIENT_ACUS') {
    return 'Not enough ACU credits to unlock this opportunity.';
  }
  if (message === 'Wallet not found.') {
    return 'Account setup incomplete. Open your dashboard and click Retry setup.';
  }
  if (message === 'Niche data not found.') {
    return 'This opportunity could not be found. Run a new search and try again.';
  }
  return message;
}

export async function executeUnlockNiche(userId: string, nicheId: string): Promise<UnlockNicheResult> {
  const walletDoc = await adminFirestore.collection('wallets').doc(userId).get();
  if (!walletDoc.exists) {
    return { error: 'Account setup incomplete. Open your dashboard and click Retry setup.' };
  }

  const unlockCost = getAcuCost('unlock_full_opportunity');

  try {
    const nicheDoc = await adminFirestore.collection('niche_results').doc(nicheId).get();
    if (!nicheDoc.exists) {
      return { error: 'This opportunity could not be found. Run a new search and try again.' };
    }

    const details = nicheDoc.data() as Recommendation & { user_id?: string };
    if (details.user_id && details.user_id !== userId) {
      return { error: 'You do not have access to this opportunity.' };
    }
    if (details.is_unlocked) {
      return { success: true, newBalance: Number(walletDoc.data()?.totalAvailableAcu ?? 0) };
    }

    const eventId = await trackPlatformEvent(userId, 'niche.selected', {
      nicheId,
      title: details.niche.title,
    });

    const { billingDetails } = await handleBilledOperation({
      userId,
      actionKey: 'unlock_full_opportunity',
      aiOperation: async () => {
        const batch = adminFirestore.batch();
        const updatedMetadata = AutosaveEngine.prepareMetadata(
          details.autosave?.version || 0,
          userId,
          'saved',
          'Niche unlocked.',
          eventId || undefined,
        );

        batch.update(adminFirestore.collection('niche_results').doc(nicheId), {
          is_unlocked: true,
          unlocked_at: FieldValue.serverTimestamp(),
          acu_spent_unlock: unlockCost,
          updatedAt: FieldValue.serverTimestamp(),
          autosave: updatedMetadata,
        });

        const workspaceMemory: WorkspaceMemory = {
          workspaceId: nicheId,
          documents: ['initial_niche_report'],
          templates: [],
          businessRules: ['Budget Max $10k equivalent'],
          historicalDecisions: [],
          commercialAssumptions: {
            startupLimit: 10000,
            primaryMarket: details.niche.countryCode,
          },
        };

        const processMemory: ProcessMemory = {
          processId: nicheId,
          stage: 'unlocked',
          completed: ['unlock'],
          pending: [],
          blocked: [],
          completedActions: ['unlock'],
        };

        batch.set(adminFirestore.collection('venture_projects').doc(nicheId), {
          id: nicheId,
          userId,
          nicheId,
          title: details.niche.title,
          country: details.niche.countryCode,
          sector: details.niche.sectorSlug,
          status: 'unlocked',
          confidenceScore: details.scores.overallConfidenceScore,
          totalAcuSpent: unlockCost,
          workspaceMemory,
          processMemory,
          assets: {},
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          autosave: AutosaveEngine.prepareMetadata(
            0,
            userId,
            'saved',
            'Repository initialized.',
            eventId || undefined,
          ),
        });

        await batch.commit();
        return { success: true };
      },
    });

    try {
      await recordNicheUnlockedMemory(userId, nicheId);
    } catch (memoryError) {
      console.error('[executeUnlockNiche] Memory sync failed (unlock still saved):', memoryError);
    }

    return {
      success: true,
      newBalance: billingDetails.balanceAfter.totalAvailableAcu as number,
    };
  } catch (error: unknown) {
    return { error: formatUnlockError(error) };
  }
}
