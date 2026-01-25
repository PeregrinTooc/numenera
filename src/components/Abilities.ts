// Abilities component - Displays character abilities in two-column grid

import { html, TemplateResult } from "lit-html";
import { Ability } from "../types/character.js";
import { AbilityItem } from "./AbilityItem.js";
import { t } from "../i18n/index.js";

export class Abilities {
  constructor(
    private abilities: Ability[],
    private onUpdate?: (index: number, updated: Ability) => void,
    private onDelete?: (index: number) => void
  ) {}

  private handleAddAbility(): void {
    // Create temporary ability with empty fields
    const tempAbility: Ability = {
      name: "",
      description: "",
    };

    // Create temporary AbilityItem to leverage its edit UI
    const tempItem = new AbilityItem(tempAbility, -1, (updated) => {
      // Add the new ability to the abilities array
      if (this.onUpdate) {
        this.abilities.push(updated);
        const newIndex = this.abilities.length - 1;
        this.onUpdate(newIndex, updated);
      }
    });

    // Open the edit modal with the temporary item's UI
    tempItem.handleEdit();
  }

  render(): TemplateResult {
    const isEmpty = this.abilities.length === 0;

    if (isEmpty) {
      return html`
        <div data-testid="abilities-section" class="mt-8">
          <div class="flex items-center gap-3 mb-4">
            <h2 class="text-2xl font-serif font-bold text-gray-700">
              ${t("abilities.heading")} ⚡
            </h2>
            ${this.onUpdate
              ? html`
                  <button
                    @click=${() => this.handleAddAbility()}
                    class="add-button p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors"
                    data-testid="add-ability-button"
                    aria-label="Add Ability"
                    title="Add Ability"
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
          <div data-testid="empty-abilities" class="empty-abilities-styled">
            ${t("abilities.empty")}
          </div>
        </div>
      `;
    }

    const abilityItems = this.abilities.map((ability, index) =>
      new AbilityItem(
        ability,
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
      <div data-testid="abilities-section" class="mt-8">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">${t("abilities.heading")} ⚡</h2>
          ${this.onUpdate
            ? html`
                <button
                  @click=${() => this.handleAddAbility()}
                  class="add-button p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors"
                  data-testid="add-ability-button"
                  aria-label="Add Ability"
                  title="Add Ability"
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${abilityItems}</div>
      </div>
    `;
  }
}
