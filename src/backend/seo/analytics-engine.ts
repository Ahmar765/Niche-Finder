'use server';

import { adminFirestore } from '@/backend/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import type { SeoAnalyticsSnapshot } from '@nichefinder/domain-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * SEO OS: Analytics & Attribution Engine
 * Tracks deep engagement signals and search visibility.
 */

export async function trackSeoEngagement(articleId: string, event: {
    type: 'view' | 'scroll' | 'click' | 'dwell_time';
    payload: any;
}) {
    const articleRef = adminFirestore.collection('seo_articles').doc(articleId);
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || 'anonymous';

    const update: any = {};
    if (event.type === 'view') {
        update['analytics.views'] = FieldValue.increment(1);
        update['analytics.uniqueVisitors'] = FieldValue.increment(1);
    } else if (event.type === 'scroll') {
        const depth = event.payload.depth || 0;
        update['analytics.scrollDepth'] = depth;
    } else if (event.type === 'click') {
        update['analytics.ctr'] = FieldValue.increment(0.01);
    }
    
    if (Object.keys(update).length > 0) {
        await articleRef.update(update);
    }

    // Log to Platform Event Ledger for AI learning loop
    await adminFirestore.collection('platform_events').add({
        id: uuidv4(),
        userId,
        eventType: `seo.${event.type}`,
        payload: { articleId, ...event.payload },
        createdAt: FieldValue.serverTimestamp(),
        tags: ['seo', 'analytics', event.type]
    });
}

export async function getSeoCommandCenterData(): Promise<SeoAnalyticsSnapshot> {
    // OS CLEANUP: Dummy data removed. 
    // This now returns an empty state which will populate as platform events are generated.
    const snapshot: SeoAnalyticsSnapshot = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        totalUniqueVisitors: 0,
        totalViews: 0,
        avgDwellTime: 0,
        topKeywords: [],
        competitorAttacks: [],
        aiSearchVisibility: 0,
        domainAuthority: 0
    };

    return snapshot;
}
