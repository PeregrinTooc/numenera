// CyphersBox component - Displays cyphers in a standalone section with max cyphers badge

import { html, TemplateResult } from "lit-html";
import { Character, Cypher } from "../types/character.js";
import { CypherItem } from "./CypherItem.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";
import { saveCharacterState } from "../storage/localStorage.js";

type FieldType = "maxCyphers";

export class CyphersBox {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {}

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.maxCyphers;

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
      },
    });
  }

  private handleAddCypher(): void {
    // Create empty cypher for editing
    const emptyCypher: Cypher = { name: "", level: "", effect: "" };

    // Create temporary CypherItem with onUpdate callback that adds to array
    const tempItem = new CypherItem(
      emptyCypher,
      -1, // temporary index
      (updated) => {
        // onUpdate callback - add the new cypher to array
        this.character.cyphers.push(updated);
        saveCharacterState(this.character);
        const event = new CustomEvent("character-updated");
        document.getElementById("app")?.dispatchEvent(event);
      }
    );

    // Trigger edit on this temporary item
    tempItem.handleEdit();
  }

  render(): TemplateResult {
    const cypherItems = this.character.cyphers.map(
      (cypher, index) =>
        new CypherItem(
          cypher,
          index,
          (updated) => {
            this.character.cyphers[index] = updated;
            saveCharacterState(this.character);
            // Trigger re-render via character-updated event
            const event = new CustomEvent("character-updated");
            document.getElementById("app")?.dispatchEvent(event);
          },
          () => {
            // Delete handler: filter out the cypher at this index
            this.character.cyphers = this.character.cyphers.filter((_, i) => i !== index);
            saveCharacterState(this.character);
            // Trigger re-render via character-updated event
            const event = new CustomEvent("character-updated");
            document.getElementById("app")?.dispatchEvent(event);
          }
        )
    );

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

        <h2 data-testid="cyphers-heading" class="section-box-heading">
          ${t("cyphers.heading")}
          <button
            data-testid="add-cypher-button"
            @click=${() => this.handleAddCypher()}
            class="add-button ml-2"
            aria-label="Add Cypher"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </h2>

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
