// CyphersBox component - Displays cyphers in a standalone section with max cyphers badge

import { html, render, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { CypherItem } from "./CypherItem.js";
import { EditFieldModal } from "./EditFieldModal.js";
import { t } from "../i18n/index.js";

type FieldType = "maxCyphers";

export class CyphersBox {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {}

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.maxCyphers;

    // Create modal element and append to body
    const modalContainer = document.createElement("div");
    document.body.appendChild(modalContainer);

    const modal = new EditFieldModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
        document.body.removeChild(modalContainer);
      },
      onCancel: () => {
        document.body.removeChild(modalContainer);
      },
    });

    // Render modal into the container
    render(modal.render(), modalContainer);

    // Focus the input field after render
    setTimeout(() => {
      const input = modalContainer.querySelector<HTMLInputElement>(
        '[data-testid="edit-modal-input"]'
      );
      if (input) {
        input.focus();
        // Select all text for easier editing
        input.select();
      }
    }, 0);
  }

  render(): TemplateResult {
    const cypherItems = this.character.cyphers.map((cypher) => new CypherItem(cypher));

    return html`
      <div data-testid="cyphers-section" class="section-box">
        <!-- Max Cyphers Badge - top-right corner -->
        <div
          data-testid="max-cyphers-badge"
          class="stat-badge badge-top-right editable-field"
          @click=${() => this.openEditModal("maxCyphers")}
          role="button"
          tabindex="0"
          aria-label="Edit Max Cyphers"
        >
          <span class="stat-badge-value"
            >${this.character.cyphers.length}/<span data-testid="max-cyphers-value"
              >${this.character.maxCyphers}</span
            ></span
          >
          <span class="stat-badge-label">${t("cyphers.max")}</span>
        </div>

        <h2 data-testid="cyphers-heading" class="section-box-heading">${t("cyphers.heading")}</h2>

        ${this.character.cyphers.length === 0
          ? html`
              <div data-testid="empty-cyphers" class="empty-cyphers-styled">
                <p>${t("cyphers.empty")}</p>
              </div>
            `
          : html`
              <div data-testid="cyphers-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${cypherItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
