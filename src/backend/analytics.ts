'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminFirestore } from './firebase-admin';
import { computeRealCostUsd } from '@acu/acu-core';
import { getModelPricing } from './ai/model-pricing';
import type { AIUsageMetrics } from './ai/universal-ai-provider';
import type { ModelPricing } from '@acu/acu-core';

/**
 * OS CORE: Platform Analytics Engine
 * SECURITY RULE: Renames internal providers to Intelligence Cores to hide system logic.
 */
export type PlatformAnalyticsData = {
    totalUsers: number;
    totalIncome: number;
    totalProviderCost: number;
    profit: number;
    costByProvider: { name: string; cost: number }[];
};

export async function getPlatformAnalytics(): Promise<PlatformAnalyticsData> {
    const cookieStore = await cookies();
    const adminUid = cookieStore.get('userId')?.value;

    if (!adminUid) {
        throw new Error('Admin not authenticated.');
    }

    try {
        const adminUserDoc = await adminFirestore.collection('users').doc(adminUid).get();
        const isSuperAdmin = adminUserDoc.data()?.roles?.includes('super_admin');

        if (!isSuperAdmin) {
            throw new Error('Permission denied. Super Admin role required.');
        }

        // Handle possible auth infrastructure failure
        const listUsersResult = await adminAuth.listUsers().catch(() => ({ users: [] }));
        const totalUsers = listUsersResult.users.length;

        const paymentsSnapshot = await adminFirestore.collection('payments').get();
        let totalIncome = 0;
        paymentsSnapshot.forEach(doc => {
            totalIncome += doc.data().priceGBP || 0;
        });

        const ledgerSnapshot = await adminFirestore.collection('acu_transactions')
            .where('type', '==', 'GENERATE_ASSET')
            .get();

        let totalProviderCost = 0;
        const providerMapping: Record<string, string> = {
            'openai': 'Primary Reasoning Core',
            'gemini': 'High-Velocity Discovery Core',
            'vertex': 'Deep-Analysis Cluster',
        };

        const costByProvider: Record<string, number> = {
            'Primary Reasoning Core': 0,
            'High-Velocity Discovery Core': 0,
            'Deep-Analysis Cluster': 0,
        };

        ledgerSnapshot.forEach(doc => {
            const entry = doc.data();
            if (entry.provider && entry.model && entry.usage) {
                const pricing: ModelPricing | undefined = getModelPricing(entry.provider, entry.model);
                if (pricing) {
                    const usage: AIUsageMetrics = entry.usage;
                    const cost = computeRealCostUsd({
                        inputTokens: usage.inputTokens,
                        outputTokens: usage.outputTokens
                    }, pricing);
                    
                    totalProviderCost += cost;
                    const mappedName = providerMapping[entry.provider] || 'Legacy Core';
                    if (costByProvider[mappedName] !== undefined) {
                        costByProvider[mappedName] += cost;
                    }
                }
            }
        });

        const profit = totalIncome - totalProviderCost;

        return {
            totalUsers,
            totalIncome,
            totalProviderCost,
            profit,
            costByProvider: Object.entries(costByProvider).map(([name, value]) => ({ name, cost: value })),
        };
    } catch (e: any) {
        console.error("[Analytics] Core Failure:", e.message);
        return {
            totalUsers: 0,
            totalIncome: 0,
            totalProviderCost: 0,
            profit: 0,
            costByProvider: []
        };
    }
}
