import { render } from "lit-html";
import { forwardAutoSaveFailures } from "@/services/autoSaveFailureBridge";
import {
  STORAGE_WRITE_FAILED_EVENT,
  type StorageWriteFailedDetail,
} from "@/storage/storageWriteFailure";
import type { AppContext } from "./appContext";

function renderSaveIndicator(ctx: AppContext): void {
  const indicatorContainer = document.getElementById("save-indicator-container");
  if (indicatorContainer) {
    render(ctx.saveIndicator.render(), indicatorContainer);
  }
}

/** Wire auto-save outcomes (success timestamp, write failures) to the save indicator. */
export function registerSaveFeedback(ctx: AppContext): void {
  // A failed auto-save and a failed fire-and-forget persist both end up as one
  // storage-write-failed event; show it until the next successful save clears it.
  forwardAutoSaveFailures(ctx.autoSaveService);
  window.addEventListener(STORAGE_WRITE_FAILED_EVENT, (event: Event) => {
    ctx.saveIndicator.showError((event as CustomEvent<StorageWriteFailedDetail>).detail.reason);
    renderSaveIndicator(ctx);
  });

  // Listen for save-completed events to update indicator
  ctx.autoSaveService.on("save-completed", async (event) => {
    // Version history is now handled through VersionHistoryService
    // with smart squashing (timer-based buffering)
    // No need to create versions here anymore

    // Format timestamp for display (HH:MM:SS format)
    const date = new Date(event.timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    ctx.saveIndicator.updateTimestamp(formattedTime);

    // Check if there are versions (squashing may have occurred)
    // Update version navigator to reflect any new versions
    const { versionState, versionHistoryService } = ctx;
    if (versionState && versionHistoryService) {
      // Only reload if buffer is empty (meaning squash just completed)
      if (versionHistoryService.getBufferLength() === 0 && !versionHistoryService.isTimerActive()) {
        await versionState.reload();
        await ctx.actions.updateVersionNavigator(false);
      }
    }

    // Only re-render the indicator, not the full sheet
    // Full sheet re-render would cause flash during drag-drop operations
    renderSaveIndicator(ctx);
  });
}
