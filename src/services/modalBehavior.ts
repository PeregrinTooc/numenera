// Modal Behavior Helper - Centralized modal behavior patterns
// Eliminates duplication across EditFieldModal and CardEditModal

import { html, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";

/**
 * Base configuration for modal behavior
 */
export interface BaseModalConfig {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Common modal event handlers
 * Provides consistent backdrop click and keyboard handling
 */
export class ModalBehavior {
  protected onConfirm: () => void;
  protected onCancel: () => void;

  constructor(config: BaseModalConfig) {
    this.onConfirm = config.onConfirm;
    this.onCancel = config.onCancel;

    // Bind methods for event handlers
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  protected handleConfirm(): void {
    this.onConfirm();
  }

  protected handleCancel(): void {
    this.onCancel();
  }

  /**
   * Handles backdrop clicks - only closes if clicking backdrop itself
   */
  protected handleBackdropClick(e: Event): void {
    if (e.target === e.currentTarget) {
      this.handleCancel();
    }
  }

  /**
   * Handles keyboard events common to all modals
   */
  protected handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      this.handleCancel();
    }
  }
}

/**
 * Renders standard modal action buttons (Cancel + Confirm)
 * Provides consistent button structure with SVG icons
 */
export function renderModalButtons(config: {
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTestId?: string;
  cancelTestId?: string;
}): TemplateResult {
  const confirmLabel = config.confirmLabel || t("modal.edit.confirm");
  const cancelLabel = config.cancelLabel || t("modal.edit.cancel");
  const confirmTestId = config.confirmTestId || "modal-confirm-button";
  const cancelTestId = config.cancelTestId || "modal-cancel-button";

  return html`
    <div class="edit-modal-buttons">
      <!-- Cancel Button -->
      <button
        class="edit-modal-button cancel"
        @click=${config.onCancel}
        data-testid=${cancelTestId}
        aria-label=${cancelLabel}
      >
        <!-- X Icon (SVG) -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path
            d="M8 8L16 16M16 8L8 16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span class="button-label">${cancelLabel}</span>
      </button>

      <!-- Confirm Button -->
      <button
        class="edit-modal-button confirm"
        @click=${config.onConfirm}
        ?disabled=${config.confirmDisabled}
        data-testid=${confirmTestId}
        aria-label=${confirmLabel}
      >
        <!-- Checkmark Icon (SVG) -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path
            d="M7 12L10.5 15.5L17 9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="button-label">${confirmLabel}</span>
      </button>
    </div>
  `;
}
