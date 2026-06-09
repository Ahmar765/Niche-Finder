
'use server';

import { cookies } from 'next/headers';
import { adminFirestore, adminAuth, isAdminConfigured } from './firebase-admin';
import { FieldValue, type UpdateData } from 'firebase-admin/firestore';
import type { 
    Recommendation, 
    SearchRequest, 
    VentureUserMemory, 
    VentureProject, 
    AiOperatingOutput, 
    UserMemory,
    WorkspaceMemory,
    ProcessMemory,
    PlatformEventType
} from '@nichefinder/domain-types';
import { v4 as uuidv4 } from 'uuid';
import { getSupportChatResponse } from '@/ai/flows/support-chatbot-flow';
import { evaluateVentureState } from '@/ai/flows/evaluate-venture-flow';
import { generateVentureAsset, type AssetType } from '@/ai/flows/generate-venture-asset-flow';
import { generateBlogPost } from '@/ai/flows/generate-blog-post-flow';
import { NICHE_FINDER_ACU_ACTIONS, type NicheFinderAcuActionKey } from '@/config/acuActions';
import { ACU_TOP_UP_PACKAGES } from '@/config/acuPackages';
import { handleBilledOperation } from './billing';
import { AutosaveEngine } from '../../services/autosave-engine/src';
import Stripe from 'stripe';
import { serializeFirestoreDoc } from './serialize-firestore';

function toTimestampMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'object' && value !== null && 'toMillis' in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return (value as { seconds: number }).seconds * 1000;
  }
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortDocsByFieldDesc<T extends { data: () => Record<string, unknown> }>(
  docs: T[],
  field: string
): T[] {
  return [...docs].sort(
    (a, b) => toTimestampMillis(b.data()[field]) - toTimestampMillis(a.data()[field])
  );
}

async function safeAdminRead<T>(fallback: T, operation: () => Promise<T>): Promise<T> {
  if (!isAdminConfigured()) {
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    console.warn('[Firebase Admin] Operation failed:', error);
    return fallback;
  }
}

async function getAuthenticatedUserId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

export type { NewUser } from './initialize-new-user';

/**
 * OS CORE: Immutable Platform Event Ledger
 */
export async function trackPlatformEvent(userId: string, eventType: PlatformEventType, payload: any, projectId?: string, decisionId?: string) {
    const eventId = uuidv4();
    try {
        await adminFirestore.collection('platform_events').doc(eventId).set({
            id: eventId,
            userId,
            projectId: projectId || null,
            eventType,
            payload,
            createdAt: FieldValue.serverTimestamp(),
            linkage: {
                decisionId: decisionId || null,
                outcomeStatus: 'pending'
            }
        });
        return eventId;
    } catch (e) {
        console.error(`[Security Alert] Ledger failure:`, e);
        return null;
    }
}

/**
 * OS CORE: Learning Loop Logic
 */
export async function syncUserMemory(userId: string, update: { 
    country?: string; 
    sector?: string; 
    search?: boolean; 
    unlock?: boolean; 
    reject?: string;
    nicheId?: string;
    action?: string;
    userCorrection?: string;
    eventType?: PlatformEventType;
    workflowSuccess?: boolean;
    question?: string;
}) {
    const memoryRef = adminFirestore.collection('user_memory').doc(userId);
    const doc = await memoryRef.get();
    
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
        riskTolerance: "medium",
        acceptedRecommendations: [],
        rejectedRecommendations: [],
        frequentActions: [],
        decisionStyle: "analytical"
    };

    const initialMemory: VentureUserMemory = {
        userId,
        userMemory: initialUserMemory,
        behaviour: { 
            totalSearches: 0, totalUnlocks: 0, totalGeneratedAssets: 0, 
            lastActive: new Date().toISOString(), acceptedNicheIds: [], rejectedNicheIds: [], frequentActions: [],
            editedOutputCount: 0, workflowSuccessRate: 100, commonQuestions: []
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
        autosave: AutosaveEngine.prepareMetadata(0, userId, "saved", "Memory layer initialized.")
    };

    let currentMemory = doc.exists ? doc.data() as VentureUserMemory : initialMemory;

    if (update.country && !currentMemory.userMemory.preferredCountries.includes(update.country)) {
        currentMemory.userMemory.preferredCountries = [update.country, ...currentMemory.userMemory.preferredCountries].slice(0, 5);
    }
    if (update.sector && !currentMemory.userMemory.preferredSectors.includes(update.sector)) {
        currentMemory.userMemory.preferredSectors = [update.sector, ...currentMemory.userMemory.preferredSectors].slice(0, 10);
    }
    
    if (update.search) currentMemory.behaviour.totalSearches++;
    if (update.unlock) {
        currentMemory.behaviour.totalUnlocks++;
        if (update.nicheId) {
            currentMemory.behaviour.acceptedNicheIds.push(update.nicheId);
            currentMemory.userMemory.acceptedRecommendations.push(update.nicheId);
        }
    }
    if (update.reject) {
        currentMemory.behaviour.rejectedNicheIds.push(update.reject);
        currentMemory.userMemory.rejectedRecommendations.push(update.reject);
    }

    if (update.userCorrection) currentMemory.behaviour.editedOutputCount++;
    if (update.question) currentMemory.behaviour.commonQuestions = [update.question, ...currentMemory.behaviour.commonQuestions].slice(0, 10);

    currentMemory.behaviour.lastActive = new Date().toISOString();
    currentMemory.updatedAt = new Date().toISOString();

    const triggerIntelligence =
        update.action === 'manual_recalibration' ||
        update.action === 'onboarding_start' ||
        update.unlock ||
        update.reject ||
        update.userCorrection ||
        update.eventType === 'search.completed' ||
        update.eventType === 'memory.synchronized' ||
        (currentMemory.behaviour.totalSearches > 0 && currentMemory.behaviour.totalSearches % 3 === 0);

    if (triggerIntelligence) {
        const recentEvents = await adminFirestore.collection('platform_events')
            .where('userId', '==', userId)
            .limit(50)
            .get();

        const eventSummary = sortDocsByFieldDesc(recentEvents.docs, 'createdAt')
            .slice(0, 20)
            .map((doc) => doc.data().eventType as string);

        const evaluation = await evaluateVentureState({
            ...currentMemory,
            behaviour: {
                ...currentMemory.behaviour,
                frequentActions: eventSummary
            }
        } as any);

        currentMemory.intelligence = evaluation.intelligence;
        currentMemory.intelligenceMemory.automationRecommendations = evaluation.automationRecommendations || [];
        currentMemory.intelligenceMemory.repeatedRisks = [evaluation.riskAssessment, ...(currentMemory.intelligenceMemory.repeatedRisks || [])].slice(0, 5);
        
        const newAlerts = evaluation.proactiveAlerts.map(a => ({
            ...a,
            detectedAt: new Date().toISOString()
        }));
        currentMemory.intelligenceMemory.proactiveAlerts = [...newAlerts, ...(currentMemory.intelligenceMemory.proactiveAlerts || [])].slice(0, 10);
    }

    const eventId = await trackPlatformEvent(userId, update.eventType || 'memory.synchronized', { changed: Object.keys(update) });

    currentMemory.autosave = AutosaveEngine.prepareMetadata(
        currentMemory.autosave?.version || 0,
        userId,
        "saved",
        "Intelligence recalibrated.",
        eventId || undefined
    );

    await memoryRef.set(currentMemory, { merge: true });
}

export async function generateNicheIdeas(searchRequest: SearchRequest, isInvestorMode?: boolean) {
  const { generateNicheIdeas: runSearch } = await import('./generate-niche-ideas');
  return runSearch(searchRequest, isInvestorMode);
}

export async function unlockNiche(nicheId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "User not authenticated." };
    
    try {
        const nicheDoc = await adminFirestore.collection('niche_results').doc(nicheId).get();
        if (!nicheDoc.exists) throw new Error("Niche data not found.");
        const details = nicheDoc.data() as Recommendation;

        const eventId = await trackPlatformEvent(userId, 'niche.selected', { nicheId, title: details.niche.title });

        const { billingDetails } = await handleBilledOperation({
            userId,
            actionKey: 'unlock_full_opportunity',
            aiOperation: async () => {
                const batch = adminFirestore.batch();
                const updatedMetadata = AutosaveEngine.prepareMetadata(details.autosave?.version || 0, userId, "saved", "Niche unlocked.", eventId || undefined);

                batch.update(adminFirestore.collection('niche_results').doc(nicheId), {
                    is_unlocked: true, 
                    unlocked_at: FieldValue.serverTimestamp(),
                    acu_spent_unlock: 150, 
                    updatedAt: FieldValue.serverTimestamp(),
                    autosave: updatedMetadata
                });

                const workspaceMemory: WorkspaceMemory = {
                    workspaceId: nicheId, 
                    documents: ['initial_niche_report'], 
                    templates: [],
                    businessRules: ['Budget Max $10k equivalent'], 
                    historicalDecisions: [],
                    commercialAssumptions: { startupLimit: 10000, primaryMarket: details.niche.countryCode },
                };

                const processMemory: ProcessMemory = {
                    processId: nicheId, 
                    stage: 'unlocked', 
                    completed: ['unlock'], 
                    pending: [], 
                    blocked: [], 
                    completedActions: ['unlock']
                };

                const projectRef = adminFirestore.collection('venture_projects').doc(nicheId);
                batch.set(projectRef, {
                    id: nicheId, 
                    userId, 
                    nicheId, 
                    title: details.niche.title,
                    country: details.niche.countryCode, 
                    sector: details.niche.sectorSlug,
                    status: 'unlocked', 
                    confidenceScore: details.scores.overallConfidenceScore,
                    totalAcuSpent: 150, 
                    workspaceMemory, 
                    processMemory, 
                    assets: {}, 
                    tags: [],
                    createdAt: new Date().toISOString(), 
                    updatedAt: new Date().toISOString(),
                    autosave: AutosaveEngine.prepareMetadata(0, userId, "saved", "Repository initialized.", eventId || undefined)
                });

                await batch.commit();
                return { success: true };
            },
        });

        await syncUserMemory(userId, { unlock: true, nicheId, eventType: 'niche.selected' });
        return { success: true, newBalance: billingDetails.balanceAfter.totalAvailableAcu };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function generateProjectAsset(projectId: string, assetType: AssetType) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "User not authenticated." };

    try {
        const projectDoc = await adminFirestore.collection('venture_projects').doc(projectId).get();
        if (!projectDoc.exists) throw new Error("Venture repository not found.");
        const project = projectDoc.data() as VentureProject;

        const eventId = await trackPlatformEvent(userId, 'asset.generated', { projectId, assetType });
        
        const { result } = await handleBilledOperation({
            userId,
            actionKey: assetType as NicheFinderAcuActionKey,
            aiOperation: async () => {
                const assetData = await generateVentureAsset({ project, assetType });
                
                const assetId = uuidv4();
                await adminFirestore.collection('generated_assets').doc(assetId).set({
                    ...assetData,
                    id: assetId,
                    userId,
                    projectId,
                    assetType,
                    createdAt: FieldValue.serverTimestamp(),
                    auditReferenceId: eventId
                });

                await adminFirestore.collection('venture_projects').doc(projectId).update({
                    'processMemory.completedActions': FieldValue.arrayUnion(assetType),
                    'processMemory.stage': assetType,
                    updatedAt: new Date().toISOString(),
                    autosave: AutosaveEngine.prepareMetadata(project.autosave?.version || 0, userId, "saved", `${assetType} generated.`, eventId || undefined)
                });

                return assetData;
            }
        });

        return { asset: result };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function submitContactForm(data: any) {
    try {
        await adminFirestore.collection('contact_submissions').add({
            ...data,
            createdAt: FieldValue.serverTimestamp(),
        });
        return { status: 'success' };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function generateAndSaveBlogPostDraft(topic: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "User not authenticated." };

    try {
        const { blogPost } = await generateBlogPost(userId, topic);
        const postRef = adminFirestore.collection('blog_posts').doc();
        
        await postRef.set({
            ...blogPost,
            authorId: userId,
            status: 'draft',
            views: 0,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { status: 'success', message: 'Draft created successfully.', id: postRef.id };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function publishBlogPost(postId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "User not authenticated." };

    try {
        const postRef = adminFirestore.collection('blog_posts').doc(postId);
        await postRef.update({
            status: 'published',
            publishedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        return { status: 'success' };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function incrementBlogPostView(postId: string) {
    try {
        const postRef = adminFirestore.collection('blog_posts').doc(postId);
        await postRef.update({ views: FieldValue.increment(1) });
        return { success: true };
    } catch (e) {
        return { error: "Ledger sync failed." };
    }
}

export async function adminModifyAcu(data: { targetUid: string; deltaAcu: number; reason: string }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "Unauthenticated" };

    const adminDoc = await adminFirestore.collection('users').doc(userId).get();
    const adminRoles = adminDoc.data()?.roles ?? [];
    if (!adminRoles.includes('admin') && !adminRoles.includes('super_admin')) {
      return { error: "Unauthorized" };
    }

    const walletRef = adminFirestore.collection('wallets').doc(data.targetUid);
    
    try {
        const result = await adminFirestore.runTransaction(async t => {
            const walletDoc = await t.get(walletRef);
            if (!walletDoc.exists) throw new Error("Wallet not found.");
            const wallet = walletDoc.data()!;
            
            const newBalance = (wallet.totalAvailableAcu || 0) + data.deltaAcu;
            t.update(walletRef, { 
                totalAvailableAcu: newBalance,
                adminAcuBalance: FieldValue.increment(data.deltaAcu),
                updatedAt: FieldValue.serverTimestamp()
            });

            const ledgerRef = adminFirestore.collection('acu_transactions').doc(uuidv4());
            t.set(ledgerRef, {
                uid: data.targetUid,
                type: 'ADMIN_ADJUSTMENT',
                acusCharged: data.deltaAcu,
                note: `Admin Adjustment: ${data.reason}`,
                createdAt: FieldValue.serverTimestamp()
            });

            return newBalance;
        });

        return { success: true, newBalance: result };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getUserLedgerEntries() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  return safeAdminRead([], async () => {
    const snapshot = await adminFirestore
      .collection('acu_transactions')
      .where('uid', '==', userId)
      .limit(50)
      .get();
    return sortDocsByFieldDesc(snapshot.docs, 'createdAt')
      .slice(0, 30)
      .map((doc) => serializeFirestoreDoc(doc.id, doc.data()));
  });
}

export async function getUserNicheResults() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  return safeAdminRead([], async () => {
    const snapshot = await adminFirestore
      .collection('niche_results')
      .where('user_id', '==', userId)
      .limit(20)
      .get();
    return snapshot.docs.map((doc) => serializeFirestoreDoc(doc.id, doc.data()));
  });
}

export async function getUserSearchHistory() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  return safeAdminRead([], async () => {
    const snapshot = await adminFirestore
      .collection('search_sessions')
      .where('user_id', '==', userId)
      .limit(30)
      .get();
    return sortDocsByFieldDesc(snapshot.docs, 'created_at')
      .slice(0, 10)
      .map((doc) => serializeFirestoreDoc(doc.id, doc.data()));
  });
}

export async function submitChatMessage(history: any[], message: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { error: "User not authenticated." };
  
  const memoryDoc = await adminFirestore.collection('user_memory').doc(userId).get();
  const userMemory = memoryDoc.exists ? memoryDoc.data() as VentureUserMemory : undefined;

  const { response, billingDetails } = await getSupportChatResponse(userId, { message, history }, userMemory);
  
  if (message.length > 10) {
      await syncUserMemory(userId, { question: message, eventType: 'support.question_asked' });
  }

  return { response, billingDetails };
}

export async function recalibrateVentureIntelligence() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "User not authenticated." };
    await syncUserMemory(userId, { action: 'manual_recalibration', eventType: 'memory.synchronized' });
    return { success: true };
}

export async function updateUserProfile(data: {
    displayName: string;
    country?: string;
    bio?: string;
    photoURL?: string | null;
}) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "User not authenticated." };
    try {
        const { photoURL, ...profileFields } = data;
        const updatePayload: Record<string, unknown> = {
            ...profileFields,
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (photoURL !== undefined) {
            updatePayload.photoURL = photoURL;
        }

        await adminFirestore.collection('users').doc(userId).update(updatePayload);
        await adminAuth.updateUser(userId, {
            displayName: data.displayName,
            ...(photoURL !== undefined ? { photoURL: photoURL ?? undefined } : {}),
        });
        await syncUserMemory(userId, { country: data.country, eventType: 'profile.updated' });
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function rejectNiche(nicheId: string, reason: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "User not authenticated." };
    try {
        await syncUserMemory(userId, { reject: nicheId, eventType: 'niche.rejected' });
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function createTopupSession({ packageId }: { packageId: string }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { error: "User not authenticated." };

    const selectedPackage = ACU_TOP_UP_PACKAGES.find((p) => p.id === packageId);
    if (!selectedPackage) return { error: "Invalid package selected." };

    const stripeKey = process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return { error: "Payment system is not configured." };

    try {
        const stripe = new Stripe(stripeKey);
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const successUrl = process.env.STRIPE_SUCCESS_URL || `${origin}/dashboard?payment=success`;
        const cancelUrl = process.env.STRIPE_CANCEL_URL || `${origin}/dashboard?payment=cancelled`;

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            client_reference_id: userId,
            line_items: [{
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: `${selectedPackage.name} ACU Package`,
                        description: selectedPackage.description,
                    },
                    unit_amount: Math.round(selectedPackage.priceGBP * 100),
                },
                quantity: 1,
            }],
            metadata: {
                packageId: selectedPackage.id,
                acus_to_grant: String(selectedPackage.acus),
                bonus_acus_to_grant: String(selectedPackage.bonusACUs),
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        if (!session.url) return { error: "Could not create checkout session." };
        return { url: session.url };
    } catch (error: any) {
        return { error: error.message };
    }
}
