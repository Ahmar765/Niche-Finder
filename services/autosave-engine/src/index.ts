
/**
 * @fileoverview Venture OS: Universal Autosave Engine
 * Provides standard middleware logic for versioning and save-state metadata.
 */

import type { AutosaveMetadata } from '@nichefinder/domain-types';

export class AutosaveEngine {
    /**
     * Prepares standard autosave metadata for a domain object.
     */
    static prepareMetadata(
        currentVersion: number = 0,
        savedBy: string,
        status: "saved" | "saving" | "failed" = "saved",
        summary?: string,
        auditReferenceId?: string
    ): AutosaveMetadata {
        return {
            status,
            lastSavedAt: new Date().toISOString(),
            savedBy,
            version: currentVersion + 1,
            changeSummary: summary,
            auditReferenceId
        };
    }

    /**
     * Marks a metadata object as failed.
     */
    static markFailed(metadata: AutosaveMetadata, reason: string): AutosaveMetadata {
        return {
            ...metadata,
            status: "failed",
            changeSummary: `FAILED: ${reason}`
        };
    }
}
