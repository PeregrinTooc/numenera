import { html, render, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";
import { ModalBehavior, renderModalButtons } from "@/services/modalBehavior";
import { ModalContainer } from "@/services/modalContainer";
import { FocusTrappingBehavior } from "@/services/focusTrappingBehavior";
import type { VersionHistoryService } from "@/services/versionHistoryService";

export interface CardEditModalConfig {
  content: TemplateResult;
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

    this.handleKeyDown = this.handleKeyDown.bind(this);
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

  protected handleKeyDown(e: KeyboardEvent): void {
    super.handleKeyDown(e);

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
          <div class="card-edit-modal-content">${this.content}</div>

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

export function openCardEditModal(config: CardEditModalConfig): void {
  const container = new ModalContainer();

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

  render(modal.render(), container.getElement());

  container.focusElement(
    '[data-testid="card-edit-modal"] input, [data-testid="card-edit-modal"] textarea'
  );
}
