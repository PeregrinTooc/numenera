// PortraitDisplayModal component - Displays character portrait at full size

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export interface PortraitDisplayModalConfig {
  portraitSrc: string;
  onClose: () => void;
}

export class PortraitDisplayModal {
  constructor(private config: PortraitDisplayModalConfig) {}

  private handleClose(): void {
    this.config.onClose();
  }

  private handleBackdropClick(e: Event): void {
    // Close if clicking the backdrop (not the image)
    if (e.target === e.currentTarget) {
      this.handleClose();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.handleClose();
    }
  }

  render(): TemplateResult {
    return html`
      <div
        class="portrait-display-backdrop"
        @click=${this.handleBackdropClick.bind(this)}
        @keydown=${this.handleKeyDown.bind(this)}
        role="dialog"
        aria-modal="true"
        aria-label=${t("character.portraitView")}
        tabindex="-1"
      >
        <div class="portrait-display-content">
          <button
            class="portrait-display-close"
            @click=${this.handleClose.bind(this)}
            aria-label=${t("buttons.close")}
            data-testid="portrait-display-close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <img
            src="${this.config.portraitSrc}"
            alt=${t("character.portrait")}
            class="portrait-display-image"
            data-testid="portrait-display-image"
          />
        </div>
      </div>
    `;
  }
}
