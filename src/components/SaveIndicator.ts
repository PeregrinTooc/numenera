// SaveIndicator component - Shows last save timestamp

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class SaveIndicator {
  private timestamp: string | null = null;

  /**
   * Update the timestamp and make indicator visible
   * @param timestamp Formatted timestamp string
   */
  updateTimestamp(timestamp: string): void {
    this.timestamp = timestamp;
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
    const visible = this.timestamp !== null;

    return html`
      <div
        data-testid="save-indicator"
        style="
                    position: fixed;
                    bottom: 1rem;
                    right: 1rem;
                    font-size: 0.75rem;
                    color: #666;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    opacity: 0.8;
                    transition: opacity 0.2s ease-in-out;
                    pointer-events: none;
                    z-index: 50;
                    display: ${visible ? "block" : "none"};
                "
      >
        ${t("autoSave.lastSaved")}: ${this.timestamp}
      </div>
    `;
  }
}
