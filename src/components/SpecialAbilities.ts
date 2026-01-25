// SpecialAbilities component - Displays character special abilities in grid

import { html, TemplateResult } from "lit-html";
import { SpecialAbility } from "../types/character.js";
import { SpecialAbilityItem } from "./SpecialAbilityItem.js";
import { t } from "../i18n/index.js";

export class SpecialAbilities {
  constructor(
    private specialAbilities: SpecialAbility[],
    private onUpdate?: (index: number, updated: SpecialAbility) => void,
    private onDelete?: (index: number) => void
  ) {}

  private handleAddSpecialAbility(): void {
    // Create temporary special ability with empty fields
    const tempSpecialAbility: SpecialAbility = {
      name: "",
      source: "",
      description: "",
    };

    // Create temporary SpecialAbilityItem to leverage its edit UI
    const tempItem = new SpecialAbilityItem(tempSpecialAbility, -1, (updated) => {
      // Add the new special ability to the special abilities array
      if (this.onUpdate) {
        this.specialAbilities.push(updated);
        const newIndex = this.specialAbilities.length - 1;
        this.onUpdate(newIndex, updated);
      }
    });

    // Open the edit modal with the temporary item's UI
    tempItem.handleEdit();
  }

  render(): TemplateResult {
    const isEmpty = !this.specialAbilities || this.specialAbilities.length === 0;

    if (isEmpty) {
      return html`
        <div data-testid="special-abilities-section" class="mt-8">
          <div class="flex items-center gap-3 mb-4">
            <h2 class="text-2xl font-serif font-bold text-gray-700">
              ${t("specialAbilities.title")} ✨
            </h2>
            ${this.onUpdate
              ? html`
                  <button
                    @click=${() => this.handleAddSpecialAbility()}
                    class="add-button p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full transition-colors"
                    data-testid="add-special-ability-button"
                    aria-label="Add Special Ability"
                    title="Add Special Ability"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                `
              : ""}
          </div>
          <div data-testid="empty-special-abilities" class="empty-special-abilities-styled">
            ${t("specialAbilities.empty")}
          </div>
        </div>
      `;
    }

    const specialAbilityItems = this.specialAbilities.map((specialAbility, index) =>
      new SpecialAbilityItem(
        specialAbility,
        index,
        this.onUpdate
          ? (updated) => {
              this.onUpdate!(index, updated);
            }
          : undefined,
        this.onDelete
          ? () => {
              this.onDelete!(index);
            }
          : undefined
      ).render()
    );

    return html`
      <div data-testid="special-abilities-section" class="mt-8">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">
            ${t("specialAbilities.title")} ✨
          </h2>
          ${this.onUpdate
            ? html`
                <button
                  @click=${() => this.handleAddSpecialAbility()}
                  class="add-button p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-full transition-colors"
                  data-testid="add-special-ability-button"
                  aria-label="Add Special Ability"
                  title="Add Special Ability"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              `
            : ""}
        </div>
        <div class="grid grid-cols-1 gap-4">${specialAbilityItems}</div>
      </div>
    `;
  }
}
