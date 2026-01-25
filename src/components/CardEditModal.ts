// CardEditModal component - Base modal for editing card content
// Provides consistent modal behavior across all card types
/* global MouseEvent, KeyboardEvent */

import { html, render, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export interface CardEditModalConfig {
  content: TemplateResult; // The editable card content
  onConfirm: () => void;
  onCancel: () => void;
}

export class CardEditModal {
  private onConfirm: () => void;
  private onCancel: () => void;
  private content: TemplateResult;

  constructor(config: CardEditModalConfig) {
    this.content = config.content;
    this.onConfirm = config.onConfirm;
    this.onCancel = config.onCancel;

    // Bind methods for event handlers
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  private handleConfirm(): void {
    this.onConfirm();
  }

  private handleCancel(): void {
    this.onCancel();
  }

  private handleBackdropClick(e: MouseEvent): void {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      this.handleCancel();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      this.handleCancel();
    }
  }

  render(): TemplateResult {
    return html`
      <div
        class="card-edit-modal-backdrop"
        @click=${this.handleBackdropClick}
        @keydown=${this.handleKeyDown}
        data-testid="card-modal-backdrop"
        aria-hidden="true"
      >
        <div
          class="card-edit-modal-container"
          data-testid="card-edit-modal"
          role="dialog"
          aria-modal="true"
        >
          <!-- Editable card content (scaled up on larger screens) -->
          <div class="card-edit-modal-content">${this.content}</div>

          <!-- Action Buttons -->
          <div class="card-edit-modal-buttons">
            <!-- Cancel Button -->
            <button
              class="card-modal-button cancel"
              @click=${this.handleCancel}
              data-testid="card-modal-cancel"
              aria-label=${t("cards.cancel")}
            >
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
              <span class="button-label">${t("cards.cancel")}</span>
            </button>

            <!-- Confirm Button -->
            <button
              class="card-modal-button confirm"
              @click=${this.handleConfirm}
              data-testid="card-modal-confirm"
              aria-label=${t("cards.confirm")}
            >
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
              <span class="button-label">${t("cards.confirm")}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Service function to open a card edit modal
 */
export function openCardEditModal(config: CardEditModalConfig): void {
  // Create modal container
  const modalContainer = document.createElement("div");
  document.body.appendChild(modalContainer);

  // Create modal with cleanup callbacks
  const modal = new CardEditModal({
    content: config.content,
    onConfirm: () => {
      config.onConfirm();
      closeCardEditModal(modalContainer);
    },
    onCancel: () => {
      config.onCancel();
      closeCardEditModal(modalContainer);
    },
  });

  // Render modal
  render(modal.render(), modalContainer);
}

/**
 * Closes the modal and removes it from DOM
 */
function closeCardEditModal(modalContainer: HTMLElement): void {
  if (modalContainer.parentNode) {
    document.body.removeChild(modalContainer);
  }
}
