// AbilityItem component - Individual ability card with cost, pool, and action information

import { html, TemplateResult } from "lit-html";
import { Ability } from "../types/character.js";
import { t } from "../i18n/index.js";
import { sanitizeForTestId } from "../utils/testHelpers.js";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";

export class AbilityItem {
  private editedAbility: Ability;
  public handleEdit: () => void;

  constructor(
    private ability: Ability,
    private index: number,
    private onUpdate?: (updated: Ability) => void,
    private onDelete?: () => void
  ) {
    this.editedAbility = { ...ability };
    this.handleEdit = createEditHandler<Ability>({
      item: this.ability,
      getEditedItem: () => this.editedAbility,
      onUpdate: this.onUpdate,
      renderEditableVersion: () => this.renderEditableVersion(),
      resetEditedItem: () => {
        this.editedAbility = { ...this.ability };
      },
    });
  }

  private renderEditableVersion(): TemplateResult {
    return html`
      <div class="card-edit-wrapper">
        <div
          class="ability-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-indigo-900 mb-1">
              ${t("character.name")}
            </label>
            <input
              type="text"
              .value=${this.editedAbility.name}
              @input=${(e: Event) => {
                this.editedAbility.name = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 px-2 py-1 text-indigo-900 font-semibold"
              data-testid="edit-ability-name"
            />
          </div>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label class="block text-sm font-medium text-indigo-900 mb-1">
                ${t("abilities.cost")}
              </label>
              <input
                type="number"
                .value=${this.editedAbility.cost?.toString() || ""}
                @input=${(e: Event) => {
                  const value = (e.target as HTMLInputElement).value;
                  this.editedAbility.cost = value ? parseInt(value, 10) : undefined;
                }}
                class="w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 px-2 py-1 text-indigo-900 font-semibold"
                min="0"
                data-testid="edit-ability-cost"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-indigo-900 mb-1">
                ${t("stats.pool")}
              </label>
              <select
                .value=${this.editedAbility.pool || ""}
                @change=${(e: Event) => {
                  const value = (e.target as HTMLSelectElement).value;
                  this.editedAbility.pool = value
                    ? (value as "might" | "speed" | "intellect")
                    : undefined;
                }}
                class="w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 px-2 py-1 text-indigo-900 font-semibold"
                data-testid="edit-ability-pool"
              >
                <option value="">${t("abilities.pool.none")}</option>
                <option value="might">${t("stats.might")}</option>
                <option value="speed">${t("stats.speed")}</option>
                <option value="intellect">${t("stats.intellect")}</option>
              </select>
            </div>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-indigo-900 mb-1">
              ${t("abilities.action")}
            </label>
            <input
              type="text"
              .value=${this.editedAbility.action || ""}
              @input=${(e: Event) => {
                this.editedAbility.action = (e.target as HTMLInputElement).value || undefined;
              }}
              class="w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 px-2 py-1 text-indigo-900 font-semibold"
              data-testid="edit-ability-action"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-indigo-900 mb-1">
              ${t("abilities.description")}
            </label>
            <textarea
              .value=${this.editedAbility.description}
              @input=${(e: Event) => {
                this.editedAbility.description = (e.target as HTMLTextAreaElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 px-2 py-1 text-gray-700"
              rows="3"
              data-testid="edit-ability-description"
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    const testIdBase = sanitizeForTestId(this.ability.name);

    return html`
      <div
        data-testid="ability-item-${testIdBase}"
        class="ability-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all relative pr-8 pl-8"
      >
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `ability-edit-button-${this.index}`,
          deleteButtonTestId: `ability-delete-button-${this.index}`,
          colorTheme: "indigo",
        })}

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
                    ${t("abilities.cost")}: ${this.ability.cost}
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
