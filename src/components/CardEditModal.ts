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
import type { VersionHistoryService } from "../services/versionHistoryService.js";

export interface CardEditModalConfig {
  content: TemplateResult; // The editable card content
  onConfirm: () => void;
  onCancel: () => void;
  versionHistoryService?: VersionHistoryService;
}

export class CardEditModal extends ModalBehavior {
  private content: TemplateResult;
  private versionHistoryService?: VersionHistoryService;

  constructor(config: CardEditModalConfig) {
    super({
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
    });

    this.content = config.content;
    this.versionHistoryService = config.versionHistoryService;

    // Bind handleKeyDown for Tab key trapping
    this.handleKeyDown = this.handleKeyDown.bind(this);
    // Bind handleInput for version history timer reset
    this.handleInput = this.handleInput.bind(this);
  }

  /**
   * Handle input events to reset version history timer
   */
  private handleInput(): void {
    if (this.versionHistoryService) {
      this.versionHistoryService.resetTimer();
    }
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
        @input=${this.handleInput}
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
    versionHistoryService: config.versionHistoryService,
  });

  // Render modal
  render(modal.render(), container.getElement());

  // Auto-focus first input field in the modal
  container.focusElement(
    '[data-testid="card-edit-modal"] input, [data-testid="card-edit-modal"] textarea'
  );
}
