import { logger } from "@/utils/logger";

/** Window event dispatched whenever a character write to storage fails. */
export const STORAGE_WRITE_FAILED_EVENT = "storage-write-failed";

export interface StorageWriteFailedDetail {
  /** "quota" when the storage is full, "unknown" for every other failure. */
  reason: "quota" | "unknown";
}

function isQuotaError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("name" in error && error.name === "QuotaExceededError") return true;
  return "cause" in error && isQuotaError(error.cause);
}

/**
 * Tell the app that a character write failed, so the user is not left
 * believing the change was saved. Logs the error and dispatches
 * `storage-write-failed` on window.
 */
export function reportStorageWriteFailure(error: unknown): void {
  logger.error("Failed to write character state:", error);
  const detail: StorageWriteFailedDetail = { reason: isQuotaError(error) ? "quota" : "unknown" };
  window.dispatchEvent(new CustomEvent(STORAGE_WRITE_FAILED_EVENT, { detail }));
}
