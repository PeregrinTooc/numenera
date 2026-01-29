// CardEditModal component - Base modal for editing card content
// Provides consistent modal behavior across all card types

import { html, render, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";
import {
  ModalBehavior,
  ModalContainer,
  renderModalButtons,
  FocusTrappingBehavior,
} from "../services/modalBehavior.js";

export interface CardEditModalConfig {
  content: TemplateResult; // The editable card content
  onConfirm: () => void;
  onCancel: () => void;
}

export class CardEditModal extends ModalBehavior {
  private content: TemplateResult;

  constructor(config: CardEditModalConfig) {
    super({
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
    });

    this.content = config.content;

    // Bind handleKeyDown for Tab key trapping
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Override handleKeyDown to add Tab key focus trapping
   */
  protected handleKeyDown(e: KeyboardEvent): void {
    // Handle Escape through base class
    super.handleKeyDown(e);

    // Handle Tab key for focus trapping
    if (e.key === "Tab") {
      FocusTrappingBehavior.handleTabKey(e, '[data-testid="card-edit-modal"]');
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
            ${renderModalButtons({
              onConfirm: this.handleConfirm,
              onCancel: this.handleCancel,
              confirmLabel: t("cards.confirm"),
              cancelLabel: t("cards.cancel"),
              confirmTestId: "card-modal-confirm",
              cancelTestId: "card-modal-cancel",
            })}
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
  // Create modal container using helper
  const container = new ModalContainer();

  // Create modal with cleanup callbacks
  const modal = new CardEditModal({
    content: config.content,
    onConfirm: () => {
      config.onConfirm();
      container.remove();
    },
    onCancel: () => {
      config.onCancel();
      container.remove();
    },
  });

  // Render modal
  render(modal.render(), container.getElement());

  // Auto-focus first input field in the modal
  container.focusElement(
    '[data-testid="card-edit-modal"] input, [data-testid="card-edit-modal"] textarea'
  );
}
