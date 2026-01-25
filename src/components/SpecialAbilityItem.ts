// SpecialAbilityItem component - Individual special ability card with teal styling
/* global Event, HTMLTextAreaElement */

import { html, TemplateResult } from "lit-html";
import { SpecialAbility } from "../types/character.js";
import { t } from "../i18n/index.js";
import { sanitizeForTestId } from "../utils/testHelpers.js";
import { openCardEditModal } from "./CardEditModal.js";

export class SpecialAbilityItem {
  private editedAbility: SpecialAbility;

  constructor(
    private specialAbility: SpecialAbility,
    private index: number,
    private onUpdate?: (updated: SpecialAbility) => void,
    private onDelete?: () => void
  ) {
    this.editedAbility = { ...specialAbility };
  }

  private handleEdit(): void {
    // Reset edited ability to current values
    this.editedAbility = { ...this.specialAbility };

    openCardEditModal({
      content: this.renderEditableVersion(),
      onConfirm: () => {
        if (this.onUpdate) {
          this.onUpdate(this.editedAbility);
        }
      },
      onCancel: () => {
        // No action needed on cancel
      },
    });
  }

  private renderEditableVersion(): TemplateResult {
    return html`
      <div class="card-edit-wrapper">
        <div
          class="special-ability-item-card bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-teal-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-teal-900 mb-1">
              ${t("character.name")}
            </label>
            <input
              type="text"
              .value=${this.editedAbility.name}
              @input=${(e: Event) => {
                this.editedAbility.name = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-teal-300 focus:border-teal-500 px-2 py-1 text-teal-900 font-semibold"
              data-testid="edit-special-ability-name"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-teal-900 mb-1">
              ${t("specialAbilities.source")}
            </label>
            <input
              type="text"
              .value=${this.editedAbility.source}
              @input=${(e: Event) => {
                this.editedAbility.source = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-teal-300 focus:border-teal-500 px-2 py-1 text-teal-900 font-semibold"
              data-testid="edit-special-ability-source"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-teal-900 mb-1"> Description </label>
            <textarea
              .value=${this.editedAbility.description}
              @input=${(e: Event) => {
                this.editedAbility.description = (e.target as HTMLTextAreaElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-teal-300 focus:border-teal-500 px-2 py-1 text-gray-700"
              rows="3"
              data-testid="edit-special-ability-description"
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    const testIdBase = sanitizeForTestId(this.specialAbility.name);

    return html`
      <div
        data-testid="special-ability-item-${testIdBase}"
        class="special-ability-item-card bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-teal-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all relative pr-8 pl-8"
      >
        <!-- Delete Button -->
        ${this.onDelete
          ? html`
              <button
                @click=${() => this.onDelete!()}
                class="absolute top-2 left-2 p-2 text-teal-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                data-testid="special-ability-delete-button-${this.index}"
                aria-label="${t("cards.delete")}"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            `
          : ""}

        <!-- Edit Button -->
        ${this.onUpdate
          ? html`
              <button
                @click=${() => this.handleEdit()}
                class="absolute top-2 right-2 p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded-full transition-colors"
                data-testid="special-ability-edit-button-${this.index}"
                aria-label="${t("cards.edit")}"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            `
          : ""}

        <div class="special-ability-header flex justify-between items-start mb-2 pr-8">
          <h4
            data-testid="special-ability-name-${this.index}"
            class="special-ability-name font-bold text-lg text-teal-900"
          >
            ${this.specialAbility.name}
          </h4>
          <span
            data-testid="special-ability-source-${testIdBase}"
            class="special-ability-badge px-2 py-1 bg-teal-100 border border-teal-300 rounded text-xs font-semibold text-teal-900"
            title="${t("specialAbilities.source")}"
          >
            ${this.specialAbility.source}
          </span>
        </div>
        <p
          data-testid="special-ability-description-${this.index}"
          class="special-ability-description text-gray-700 text-sm leading-relaxed"
        >
          ${this.specialAbility.description}
        </p>
      </div>
    `;
  }
}
