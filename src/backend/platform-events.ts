import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { PlatformEventType } from '@nichefinder/domain-types';
import { adminFirestore } from './firebase-admin';

export async function trackPlatformEvent(
  userId: string,
  eventType: PlatformEventType,
  payload: unknown,
  projectId?: string,
  decisionId?: string,
) {
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
        outcomeStatus: 'pending',
      },
    });
    return eventId;
  } catch (error) {
    console.error('[platform-events] Ledger failure:', error);
    return null;
  }
}
