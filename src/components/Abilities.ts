// Abilities component - Displays character abilities in two-column grid

import { html, TemplateResult } from "lit-html";
import { Ability } from "../types/character.js";
import { AbilityItem } from "./AbilityItem.js";
import { t } from "../i18n/index.js";
import {
  createAddHandler,
  createItemInstances,
  renderAddButton,
} from "./helpers/CollectionBehavior.js";

export class Abilities {
  private handleAddAbility: () => void;

  constructor(
    private abilities: Ability[],
    private onUpdate?: (index: number, updated: Ability) => void,
    private onDelete?: (index: number) => void
  ) {
    // Create add handler using CollectionBehavior helper
    this.handleAddAbility = createAddHandler({
      emptyItem: { name: "", description: "" },
      ItemComponentClass: AbilityItem,
      collection: this.abilities,
      onUpdate: this.onUpdate,
    });
  }

  render(): TemplateResult {
    const isEmpty = this.abilities.length === 0;

    // Create ability item instances using CollectionBehavior helper
    const abilityItems = isEmpty
      ? []
      : createItemInstances({
          collection: this.abilities,
          ItemComponentClass: AbilityItem,
          onUpdate: this.onUpdate,
          onDelete: this.onDelete,
        });

    return html`
      <div data-testid="abilities-section" class="mt-8">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">${t("abilities.heading")} ⚡</h2>
          ${this.onUpdate
            ? renderAddButton({
                onClick: this.handleAddAbility,
                testId: "add-ability-button",
                colorTheme: "indigo",
                ariaLabel: "Add Ability",
              })
            : ""}
        </div>
        ${isEmpty
          ? html`
              <div data-testid="empty-abilities" class="empty-abilities-styled">
                ${t("abilities.empty")}
              </div>
            `
          : html`
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${abilityItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
