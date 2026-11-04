/**
 * Helper to access the global VersionHistoryService instance
 * This avoids having to pass the service through every component in the hierarchy
 */

import type { VersionHistoryService } from "./versionHistoryService.js";

export function getVersionHistoryService(): VersionHistoryService | undefined {
  return window.__versionHistoryService ?? undefined;
}
