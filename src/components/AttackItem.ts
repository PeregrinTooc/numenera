// AttackItem component - Individual attack card with combat styling
/* global Event, HTMLTextAreaElement */

import { html, TemplateResult } from "lit-html";
import { Attack } from "../types/character.js";
import { t } from "../i18n/index.js";
import { sanitizeForTestId } from "../utils/testHelpers.js";
import { openCardEditModal } from "./CardEditModal.js";

export class AttackItem {
  private editedAttack: Attack;

  constructor(
    private attack: Attack,
    private index: number,
    private onUpdate?: (updated: Attack) => void
  ) {
    this.editedAttack = { ...attack };
  }

  private formatModifier(modifier: number): string {
    if (modifier > 0) return `+${modifier}`;
    if (modifier === 0) return "0";
    return modifier.toString();
  }

  private handleEdit(): void {
    this.editedAttack = { ...this.attack };

    openCardEditModal({
      content: this.renderEditableVersion(),
      onConfirm: () => {
        if (this.onUpdate) {
          this.onUpdate(this.editedAttack);
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
          class="attack-item-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-red-900 mb-1">
              ${t("character.name")}
            </label>
            <input
              type="text"
              .value=${this.editedAttack.name}
              @input=${(e: Event) => {
                this.editedAttack.name = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold"
              data-testid="edit-attack-name"
            />
          </div>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label class="block text-sm font-medium text-red-900 mb-1">
                ${t("attacks.damage")}
              </label>
              <input
                type="number"
                .value=${this.editedAttack.damage.toString()}
                @input=${(e: Event) => {
                  const value = (e.target as HTMLInputElement).value;
                  this.editedAttack.damage = parseInt(value, 10) || 0;
                }}
                class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold"
                data-testid="edit-attack-damage"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-red-900 mb-1">
                ${t("attacks.modifier")}
              </label>
              <input
                type="number"
                .value=${this.editedAttack.modifier.toString()}
                @input=${(e: Event) => {
                  const value = (e.target as HTMLInputElement).value;
                  this.editedAttack.modifier = parseInt(value, 10) || 0;
                }}
                class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold"
                data-testid="edit-attack-modifier"
              />
            </div>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-red-900 mb-1">
              ${t("attacks.range")}
            </label>
            <input
              type="text"
              .value=${this.editedAttack.range}
              @input=${(e: Event) => {
                this.editedAttack.range = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold"
              data-testid="edit-attack-range"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-red-900 mb-1">
              ${t("attacks.notes")}
            </label>
            <textarea
              .value=${this.editedAttack.notes || ""}
              @input=${(e: Event) => {
                this.editedAttack.notes = (e.target as HTMLTextAreaElement).value || undefined;
              }}
              class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-gray-700"
              rows="2"
              data-testid="edit-attack-notes"
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    const testIdBase = sanitizeForTestId(this.attack.name);

    return html`
      <div
        data-testid="attack-item-${testIdBase}"
        class="attack-item-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-red-300 transition-all relative"
      >
        <!-- Edit Button -->
        ${this.onUpdate
          ? html`
              <button
                @click=${() => this.handleEdit()}
                class="absolute top-2 right-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                data-testid="attack-edit-button-${this.index}"
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

        <div class="attack-header flex justify-between items-start mb-2 pr-8">
          <h4
            data-testid="attack-name-${this.index}"
            class="attack-name font-bold text-lg text-red-900"
          >
            ${this.attack.name}
          </h4>
          <div class="attack-badges flex gap-2">
            <span
              data-testid="attack-damage-${testIdBase}"
              class="attack-badge attack-damage px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-900"
              title="${t("attacks.damage")}"
            >
              ${this.attack.damage}
            </span>
            <span
              data-testid="attack-modifier-${testIdBase}"
              class="attack-badge attack-modifier px-2 py-1 bg-blue-100 border border-blue-300 rounded text-xs font-semibold text-blue-900"
              title="${t("attacks.modifier")}"
            >
              ${this.formatModifier(this.attack.modifier)}
            </span>
          </div>
        </div>
        <div class="attack-info mb-2">
          <span
            data-testid="attack-range-${testIdBase}"
            class="attack-range text-xs text-red-700 font-semibold"
          >
            ${t("attacks.range")}: ${this.attack.range}
          </span>
        </div>
        ${this.attack.notes
          ? html`
              <p
                data-testid="attack-notes-${testIdBase}"
                class="attack-notes text-gray-700 text-sm leading-relaxed"
              >
                ${this.attack.notes}
              </p>
            `
          : ""}
      </div>
    `;
  }
}
