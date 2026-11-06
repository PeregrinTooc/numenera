// Modal asking whether an imported character's layout replaces the current one.

import { html, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";
import { ModalBehavior } from "@/services/modalBehavior";
import { FocusTrappingBehavior } from "@/services/focusTrappingBehavior";

interface LayoutChoiceModalConfig {
  onKeep: () => void;
  onUseImported: () => void;
}

/** Escape and the backdrop keep the current layout, as the "Keep" button does. */
export class LayoutChoiceModal extends ModalBehavior {
  constructor(config: LayoutChoiceModalConfig) {
    super({ onConfirm: config.onUseImported, onCancel: config.onKeep });
  }

  protected handleKeyDown(e: KeyboardEvent): void {
    super.handleKeyDown(e);
    if (e.key === "Tab") {
      FocusTrappingBehavior.handleTabKey(e, '[data-testid="layout-choice-modal"]');
    }
  }

  render(): TemplateResult {
    return html`
      <div
        class="edit-modal-backdrop"
        @click=${this.handleBackdropClick}
        @keydown=${this.handleKeyDown}
        data-testid="layout-choice-modal-backdrop"
      >
        <div
          class="edit-modal-content choice-modal"
          data-testid="layout-choice-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="layout-choice-modal-title"
        >
          <h2 id="layout-choice-modal-title" class="edit-modal-title">
            ${t("layoutChoice.title")}
          </h2>
          <p class="choice-modal-message">${t("layoutChoice.message")}</p>
          <div class="choice-modal-buttons">
            <button
              class="edit-modal-button confirm"
              @click=${this.handleCancel}
              data-testid="keep-current-layout"
            >
              ${t("layoutChoice.keep")}
            </button>
            <button
              class="edit-modal-button secondary"
              @click=${this.handleConfirm}
              data-testid="use-imported-layout"
            >
              ${t("layoutChoice.useImported")}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
