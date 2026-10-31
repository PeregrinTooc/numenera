import type { AutoSaveService } from "./autoSaveService";
import { reportStorageWriteFailure } from "@/storage/storageWriteFailure";

/**
 * Feed a failed auto-save into the app-level `storage-write-failed` event, the
 * same signal `persistCharacterState` raises, so the user is told either way.
 */
export function forwardAutoSaveFailures(service: AutoSaveService): void {
  service.on("save-error", ({ error }) => reportStorageWriteFailure(error));
}
