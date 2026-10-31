// Modal offering the kept copy of an unreadable character: download, discard, or decide later.

import { html, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";
import { ModalBehavior } from "@/services/modalBehavior";
import { FocusTrappingBehavior } from "@/services/focusTrappingBehavior";

interface UnreadableCharacterModalConfig {
  onDownload: () => void;
  onDiscard: () => void;
  onLater: () => void;
}

/** Download is the confirm action; Escape, backdrop and "Ask me later" all keep the data. */
export class UnreadableCharacterModal extends ModalBehavior {
  private onDiscard: () => void;

  constructor(config: UnreadableCharacterModalConfig) {
    super({ onConfirm: config.onDownload, onCancel: config.onLater });
    this.onDiscard = config.onDiscard;
  }

  protected handleKeyDown(e: KeyboardEvent): void {
    super.handleKeyDown(e);
    if (e.key === "Tab") {
      FocusTrappingBehavior.handleTabKey(e, '[data-testid="unreadable-modal"]');
    }
  }

  render(): TemplateResult {
    return html`
      <div
        class="edit-modal-backdrop"
        @click=${this.handleBackdropClick}
        @keydown=${this.handleKeyDown}
        data-testid="unreadable-modal-backdrop"
      >
        <div
          class="edit-modal-content unreadable-modal"
          data-testid="unreadable-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unreadable-modal-title"
        >
          <h2 id="unreadable-modal-title" class="edit-modal-title">
            ${t("unreadableCharacter.title")}
          </h2>
          <p class="unreadable-modal-message">${t("unreadableCharacter.message")}</p>
          <div class="unreadable-modal-buttons">
            <button
              class="edit-modal-button confirm"
              @click=${this.handleConfirm}
              data-testid="unreadable-download-button"
            >
              ${t("unreadableCharacter.download")}
            </button>
            <button
              class="edit-modal-button cancel"
              @click=${this.onDiscard}
              data-testid="unreadable-discard-button"
            >
              ${t("unreadableCharacter.discard")}
            </button>
            <button
              class="edit-modal-button unreadable-later"
              @click=${this.handleCancel}
              data-testid="unreadable-later-button"
            >
              ${t("unreadableCharacter.later")}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
