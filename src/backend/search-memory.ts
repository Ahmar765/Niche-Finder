import type { VentureUserMemory, UserMemory, AiOperatingOutput } from '@nichefinder/domain-types';
import { adminFirestore } from './firebase-admin';
import { AutosaveEngine } from '../../services/autosave-engine/src';
import { trackPlatformEvent } from './platform-events';

function buildInitialMemory(userId: string): VentureUserMemory {
  const initialIntelligence: AiOperatingOutput = {
    situation: 'Initial onboarding phase.',
    insight: 'Discovery data is available but venture analysis is inactive.',
    risk: 'Stalling at the idea phase increases opportunity cost.',
    recommendation: 'Initialize deep-dive analysis on your top-ranked niche.',
    nextAction: 'Unlock your first high-potential niche concept.',
    owner: 'Operator',
    deadline: 'Immediate',
    confidenceLevel: 'high',
  };

  const initialUserMemory: UserMemory = {
    userId,
    preferredCountries: [],
    preferredSectors: [],
    riskTolerance: 'medium',
    acceptedRecommendations: [],
    rejectedRecommendations: [],
    frequentActions: [],
    decisionStyle: 'analytical',
  };

  return {
    userId,
    userMemory: initialUserMemory,
    behaviour: {
      totalSearches: 0,
      totalUnlocks: 0,
      totalGeneratedAssets: 0,
      lastActive: new Date().toISOString(),
      acceptedNicheIds: [],
      rejectedNicheIds: [],
      frequentActions: [],
      editedOutputCount: 0,
      workflowSuccessRate: 100,
      commonQuestions: [],
    },
    intelligenceMemory: {
      patterns: [],
      proactiveAlerts: [],
      automationRecommendations: [],
      repeatedRisks: [],
      learnedRules: [],
    },
    intelligence: initialIntelligence,
    updatedAt: new Date().toISOString(),
    autosave: AutosaveEngine.prepareMetadata(0, userId, 'saved', 'Memory layer initialized.'),
  };
}

/** Lightweight post-search memory update without AI recalibration (safe for API routes). */
export async function recordSearchCompletedMemory(userId: string, countryCode: string) {
  const memoryRef = adminFirestore.collection('user_memory').doc(userId);
  const doc = await memoryRef.get();
  const currentMemory = doc.exists ? (doc.data() as VentureUserMemory) : buildInitialMemory(userId);

  if (countryCode && !currentMemory.userMemory.preferredCountries.includes(countryCode)) {
    currentMemory.userMemory.preferredCountries = [
      countryCode,
      ...currentMemory.userMemory.preferredCountries,
    ].slice(0, 5);
  }

  currentMemory.behaviour.totalSearches += 1;
  currentMemory.behaviour.lastActive = new Date().toISOString();
  currentMemory.updatedAt = new Date().toISOString();

  const eventId = await trackPlatformEvent(userId, 'search.completed', {
    country: countryCode,
  });

  currentMemory.autosave = AutosaveEngine.prepareMetadata(
    currentMemory.autosave?.version || 0,
    userId,
    'saved',
    'Search recorded.',
    eventId || undefined,
  );

  await memoryRef.set(currentMemory, { merge: true });
}
