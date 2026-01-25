// AbilityItem component - Individual ability card with cost, pool, and action information
/* global Event, HTMLTextAreaElement, HTMLSelectElement */

import { html, TemplateResult } from "lit-html";
import { Ability } from "../types/character.js";
import { t } from "../i18n/index.js";
import { sanitizeForTestId } from "../utils/testHelpers.js";
import { openCardEditModal } from "./CardEditModal.js";

export class AbilityItem {
  private editedAbility: Ability;

  constructor(
    private ability: Ability,
    private index: number,
    private onUpdate?: (updated: Ability) => void
  ) {
    this.editedAbility = { ...ability };
  }

  private handleEdit(): void {
    this.editedAbility = { ...this.ability };

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
          class="ability-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4"
        >
          <div class="ability-header flex justify-between items-start mb-2">
            <input
              type="text"
              .value=${this.editedAbility.name}
              @input=${(e: Event) => {
                this.editedAbility.name = (e.target as HTMLInputElement).value;
              }}
              class="ability-name font-bold text-lg text-indigo-900 bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 flex-1"
              placeholder="Ability Name"
              data-testid="edit-ability-name"
            />
            <div class="ability-badges flex gap-2 ml-2">
              <input
                type="number"
                .value=${this.editedAbility.cost?.toString() || ""}
                @input=${(e: Event) => {
                  const value = (e.target as HTMLInputElement).value;
                  this.editedAbility.cost = value ? parseInt(value, 10) : undefined;
                }}
                class="ability-badge ability-cost px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-900 w-16"
                placeholder="Cost"
                min="0"
                data-testid="edit-ability-cost"
              />
              <select
                .value=${this.editedAbility.pool || ""}
                @change=${(e: Event) => {
                  const value = (e.target as HTMLSelectElement).value;
                  this.editedAbility.pool = value
                    ? (value as "might" | "speed" | "intellect")
                    : undefined;
                }}
                class="ability-badge ability-pool px-2 py-1 rounded text-xs font-semibold"
                data-testid="edit-ability-pool"
              >
                <option value="">None</option>
                <option value="might">${t("stats.might")}</option>
                <option value="speed">${t("stats.speed")}</option>
                <option value="intellect">${t("stats.intellect")}</option>
              </select>
            </div>
          </div>
          <input
            type="text"
            .value=${this.editedAbility.action || ""}
            @input=${(e: Event) => {
              this.editedAbility.action = (e.target as HTMLInputElement).value || undefined;
            }}
            class="ability-action text-xs text-indigo-600 italic mb-2 bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 w-full"
            placeholder="Action (e.g., 1 action)"
            data-testid="edit-ability-action"
          />
          <textarea
            .value=${this.editedAbility.description}
            @input=${(e: Event) => {
              this.editedAbility.description = (e.target as HTMLTextAreaElement).value;
            }}
            class="ability-description text-gray-700 text-sm leading-relaxed w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500"
            placeholder="Description"
            rows="3"
            data-testid="edit-ability-description"
          ></textarea>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    const testIdBase = sanitizeForTestId(this.ability.name);

    return html`
      <div
        data-testid="ability-item-${testIdBase}"
        class="ability-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all relative"
      >
        <!-- Edit Button -->
        ${this.onUpdate
          ? html`
              <button
                @click=${() => this.handleEdit()}
                class="absolute top-2 right-2 p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full transition-colors"
                data-testid="ability-edit-button-${this.index}"
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

        <div class="ability-header flex justify-between items-start mb-2 pr-8">
          <h4
            data-testid="ability-name-${this.index}"
            class="ability-name font-bold text-lg text-indigo-900"
          >
            ${this.ability.name}
          </h4>
          <div class="ability-badges flex gap-2">
            ${this.ability.cost !== undefined
              ? html`
                  <span
                    data-testid="ability-cost-${testIdBase}"
                    class="ability-badge ability-cost px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-900"
                    title="${t("abilities.cost")}"
                  >
                    ${this.ability.cost}
                  </span>
                `
              : ""}
            ${this.ability.pool
              ? html`
                  <span
                    data-testid="ability-pool-${testIdBase}"
                    class="ability-badge ability-pool pool-${this.ability
                      .pool} px-2 py-1 rounded text-xs font-semibold"
                  >
                    ${t(`stats.${this.ability.pool}`)}
                  </span>
                `
              : ""}
          </div>
        </div>
        ${this.ability.action
          ? html`
              <div
                data-testid="ability-action-${testIdBase}"
                class="ability-action text-xs text-indigo-600 italic mb-2"
              >
                ${this.ability.action}
              </div>
            `
          : ""}
        <p
          data-testid="ability-description-${this.index}"
          class="ability-description text-gray-700 text-sm leading-relaxed"
        >
          ${this.ability.description}
        </p>
      </div>
    `;
  }
}
