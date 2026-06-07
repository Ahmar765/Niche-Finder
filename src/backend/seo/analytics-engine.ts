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
    const [articlesSnap, tasksSnap, eventsSnap] = await Promise.all([
        adminFirestore.collection('seo_articles').orderBy('updatedAt', 'desc').limit(50).get(),
        adminFirestore.collection('seo_amplification_tasks').limit(50).get(),
        adminFirestore.collection('platform_events').orderBy('createdAt', 'desc').limit(30).get(),
    ]);

    const { buildSeoCommandCenterView } = await import('@/lib/seo/aggregate-analytics');

    const view = buildSeoCommandCenterView(
        articlesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any)),
        tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any)),
        eventsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any)),
    );

    return {
        id: uuidv4(),
        timestamp: view.timestamp,
        totalUniqueVisitors: view.totalUniqueVisitors,
        totalViews: view.totalViews,
        avgDwellTime: view.avgDwellTime,
        topKeywords: view.topKeywords,
        competitorAttacks: view.competitorAttacks,
        aiSearchVisibility: view.aiSearchVisibility,
        domainAuthority: view.domainAuthority,
    };
}
