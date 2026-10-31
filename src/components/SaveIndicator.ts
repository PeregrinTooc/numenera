// SaveIndicator component - Shows the last save timestamp, or that saving failed

import { html, nothing, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";
import type { StorageWriteFailedDetail } from "@/storage/storageWriteFailure";

type FailureReason = StorageWriteFailedDetail["reason"];

export class SaveIndicator {
  private timestamp: string | null = null;
  private error: FailureReason | null = null;

  /**
   * Update the timestamp and make indicator visible
   * @param timestamp Formatted timestamp string
   */
  updateTimestamp(timestamp: string): void {
    this.timestamp = timestamp;
    this.error = null;
  }

  /**
   * Report that saving failed. Stays until the next successful save
   * (updateTimestamp) clears it.
   * @param reason "quota" when the storage is full, "unknown" otherwise
   */
  showError(reason: FailureReason): void {
    this.error = reason;
  }

  /**
   * Check if the indicator is reporting a failed save
   */
  hasError(): boolean {
    return this.error !== null;
  }

  /**
   * Get the current timestamp
   * @returns Current timestamp or null if never saved
   */
  getTimestamp(): string | null {
    return this.timestamp;
  }

  /**
   * Check if indicator has a timestamp
   * @returns true if timestamp exists
   */
  hasTimestamp(): boolean {
    return this.timestamp !== null;
  }

  /**
   * Render the save indicator
   * Hidden until first save occurs
   */
  render(): TemplateResult {
    const failed = this.error !== null;
    const visible = failed || this.timestamp !== null;
    const message = this.error === "quota" ? t("autoSave.storageFull") : t("autoSave.saveFailed");

    return html`
      <div
        data-testid="save-indicator"
        role=${failed ? "alert" : nothing}
        style="
                    position: fixed;
                    bottom: 1rem;
                    right: 1rem;
                    max-width: calc(100vw - 2rem);
                    font-size: 0.75rem;
                    color: ${failed ? "#b91c1c" : "#666"};
                    background: rgba(255, 255, 255, 0.95);
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.375rem;
                    border: ${failed ? "1px solid #b91c1c" : "none"};
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    opacity: ${failed ? "1" : "0.8"};
                    transition: opacity 0.2s ease-in-out;
                    pointer-events: none;
                    z-index: 50;
                    display: ${visible ? "block" : "none"};
                "
      >
        ${failed ? message : html`${t("autoSave.lastSaved")}: ${this.timestamp}`}
      </div>
    `;
  }
}
