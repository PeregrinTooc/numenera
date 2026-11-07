import { html, TemplateResult } from "lit-html";
import { Ability } from "@/types/character";
import { t } from "@/i18n/index";
import { sanitizeForTestId } from "@/utils/testHelpers";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";
import {
  cardInputClass,
  renderLabeledField,
  renderTextArea,
  renderTextField,
} from "./helpers/cardFormFields.js";

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
    const theme = "indigo";
    return html`
      <div class="card-edit-wrapper">
        <div
          class="ability-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4"
        >
          ${renderTextField({
            theme,
            label: t("character.name"),
            testId: "edit-ability-name",
            value: this.editedAbility.name,
            onInput: (value) => {
              this.editedAbility.name = value;
            },
          })}
          <div class="grid grid-cols-2 gap-3 mb-3">
            ${renderTextField({
              theme,
              grid: true,
              type: "number",
              min: "0",
              label: t("abilities.cost"),
              testId: "edit-ability-cost",
              value: this.editedAbility.cost?.toString() || "",
              onInput: (value) => {
                this.editedAbility.cost = value ? parseInt(value, 10) : undefined;
              },
            })}
            ${renderLabeledField({
              theme,
              grid: true,
              label: t("stats.pool"),
              control: html`
                <select
                  .value=${this.editedAbility.pool || ""}
                  @change=${(e: Event) => {
                    const value = (e.target as HTMLSelectElement).value;
                    this.editedAbility.pool = value
                      ? (value as "might" | "speed" | "intellect")
                      : undefined;
                  }}
                  class="${cardInputClass(theme)}"
                  data-testid="edit-ability-pool"
                >
                  <option value="">${t("abilities.pool.none")}</option>
                  <option value="might">${t("stats.might")}</option>
                  <option value="speed">${t("stats.speed")}</option>
                  <option value="intellect">${t("stats.intellect")}</option>
                </select>
              `,
            })}
          </div>
          ${renderTextField({
            theme,
            label: t("abilities.action"),
            testId: "edit-ability-action",
            value: this.editedAbility.action || "",
            onInput: (value) => {
              this.editedAbility.action = value || undefined;
            },
          })}
          ${renderTextArea({
            theme,
            label: t("abilities.description"),
            testId: "edit-ability-description",
            value: this.editedAbility.description,
            onInput: (value) => {
              this.editedAbility.description = value;
            },
          })}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    const testIdBase = sanitizeForTestId(this.ability.name);

    return html`
      <div
        data-testid="ability-item-${testIdBase}"
        data-index="${this.index}"
        class="ability-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all relative pr-8 pl-8"
        draggable="true"
      >
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `ability-edit-button-${this.index}`,
          deleteButtonTestId: `ability-delete-button-${this.index}`,
          colorTheme: "indigo",
        })}

        <div
          class="ability-header flex flex-wrap justify-between items-start gap-x-2 gap-y-1 mb-2 pr-8"
        >
          <h4
            data-testid="ability-name-${this.ability.name}"
            class="ability-name font-bold text-lg text-indigo-900"
          >
            ${this.ability.name}
          </h4>
          <div class="ability-badges flex flex-wrap gap-2">
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
