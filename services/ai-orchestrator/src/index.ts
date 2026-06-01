
/**
 * @fileoverview Venture OS: AI Orchestration Layer
 * Centralized service for routing tasks, managing memory, and auditing AI operations.
 * Implements strict AI Output Contract (8-point structure).
 */

import { adminFirestore } from '@/backend/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { 
    VentureUserMemory, 
    AiOperatingOutput,
    VentureProject,
    AgentType,
    AgentTask
} from '@nichefinder/domain-types';
import type { FeatureType } from '@acu/provider-contracts';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';
import { getAgentDirectives } from '@/backend/ai/agent-manifest';

export interface OrchestrationRequest {
    userId: string;
    projectId?: string;
    actionKey: string;
    agents: AgentType[];
    prompt: string;
    context?: any;
    tier: "control" | "professional" | "decision" | "enterprise";
    featureType: FeatureType;
}

export class AIOrchestrator {
    private aiClient: UniversalAIClient;

    constructor() {
        this.aiClient = new UniversalAIClient();
    }

    /**
     * Routes a venture task to the appropriate agents and manages the outcome lifecycle.
     */
    async routeTask(request: OrchestrationRequest): Promise<any> {
        const { userId, agents, prompt, featureType, tier, projectId } = request;

        // 1. Permission & Context Validation
        await this.validatePermissions(userId, projectId);

        // 2. Initialize Agent Tasks (Rule 4: Agent Registry)
        const tasks: AgentTask[] = agents.map(agent => ({
            id: uuidv4(),
            agent,
            userId,
            workspaceId: projectId,
            input: { prompt, context: request.context },
            status: "running",
            createdAt: new Date().toISOString()
        }));

        // 3. Fetch Institutional Memory
        const memory = await this.getUserMemory(userId);
        const project = projectId ? await this.getProject(projectId) : null;

        // 4. Agent Orchestration (Directive Synthesis)
        const directives = getAgentDirectives(agents);
        const systemPrompt = this.buildSystemPrompt(directives, memory, project);

        // 5. High-Reasoning Execution
        const result = await this.aiClient.generateText({
            systemPrompt,
            messages: [{ role: 'user', content: prompt }],
            featureType,
            tier,
            jsonMode: true,
            temperature: 0.3
        });

        // 6. Complete Agent Tasks (Audit Trail)
        const completedTasks = tasks.map(task => ({
            ...task,
            status: "completed" as const,
            completedAt: new Date().toISOString(),
            confidence: "high" as const,
            output: { summary: "Operational task executed by Orchestrator." }
        }));

        // 7. Ledger Logging (Rule 10)
        await this.logOrchestrationEvent(request, result, completedTasks);

        return result;
    }

    private async validatePermissions(userId: string, projectId?: string) {
        if (!userId) throw new Error("ORCHESTRATOR_ERR: Unauthenticated access attempt.");
        
        if (projectId) {
            const projectDoc = await adminFirestore.collection('venture_projects').doc(projectId).get();
            if (!projectDoc.exists || projectDoc.data()?.userId !== userId) {
                throw new Error("ORCHESTRATOR_ERR: Ownership validation failed for workspace.");
            }
        }
    }

    private buildSystemPrompt(directives: string, memory: VentureUserMemory, project: VentureProject | null) {
        const profile = memory.userMemory;
        return `
            You are the Core Orchestrator of the Niche Finder Operating System.
            You are coordinating a team of specialized agents to execute a venture task.

            ACTIVE AGENT TEAM:
            ${directives}

            USER VENTURE CONTEXT (MEMORY LAYER):
            - Risk Tolerance: ${profile.riskTolerance}
            - Preferred Markets: ${profile.preferredCountries.join(', ') || 'Global'}
            - Priority Sectors: ${profile.preferredSectors.join(', ') || 'Any'}

            ${project ? `CURRENT PROJECT WORKSPACE: ${project.title} (Status: ${project.status})` : 'GENERAL DISCOVERY SESSION'}

            OPERATIONAL RULES:
            - RULE 5: MANDATORY AI OUTPUT CONTRACT. Every response MUST include:
                1. situation: What is currently happening.
                2. insight: Strategic logic derived from context.
                3. risk: Identified exposure or bottleneck.
                4. recommendation: Primary strategic advice.
                5. nextAction: The most practical immediate step.
                6. owner: Responsibility attribution (usually "Operator" or "OS").
                7. deadline: Timeline for the next action (e.g., "Immediate", "Within 48h").
                8. confidenceLevel: "low" | "medium" | "high".

            - RULE 7: Provide decision intelligence (Best Option, Alternative, Risk of Inaction, Commercial Impact).
            - RULE 15: Act as a business intelligence layer. Remember decisions. Predict outcomes.
            
            Strictly return a valid JSON object. No prose outside JSON.
        `;
    }

    private async logOrchestrationEvent(request: OrchestrationRequest, result: any, tasks: AgentTask[]) {
        const eventId = uuidv4();
        await adminFirestore.collection('platform_events').doc(eventId).set({
            id: eventId,
            userId: request.userId,
            projectId: request.projectId || null,
            eventType: `orchestrated_${request.actionKey}`,
            payload: {
                agents: request.agents,
                tasks: tasks.map(t => t.id),
                usage: result.usage,
                model: result.model,
                provider: result.provider
            },
            createdAt: FieldValue.serverTimestamp(),
            tags: ['orchestrator', request.actionKey, ...request.agents],
            systemMetadata: {
                osVersion: '1.2.0',
                orchestratorMode: 'high_reasoning'
            }
        });
        
        const batch = adminFirestore.batch();
        tasks.forEach(task => {
            const taskRef = adminFirestore.collection('agent_tasks').doc(task.id);
            batch.set(taskRef, task);
        });
        await batch.commit();
    }

    private async getUserMemory(userId: string): Promise<VentureUserMemory> {
        const doc = await adminFirestore.collection('user_memory').doc(userId).get();
        if (!doc.exists) throw new Error("MEMORY_ERR: Could not retrieve User Memory.");
        return doc.data() as VentureUserMemory;
    }

    private async getProject(projectId: string): Promise<VentureProject> {
        const doc = await adminFirestore.collection('venture_projects').doc(projectId).get();
        return doc.data() as VentureProject;
    }
}
