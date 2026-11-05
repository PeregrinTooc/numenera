import type { VersionHistoryService } from "./versionHistoryService.js";

export function getVersionHistoryService(): VersionHistoryService | undefined {
  return window.__versionHistoryService ?? undefined;
}
