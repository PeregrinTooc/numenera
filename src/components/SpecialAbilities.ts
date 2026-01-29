// SpecialAbilities component - Displays character special abilities in grid

import { html, TemplateResult } from "lit-html";
import { SpecialAbility } from "../types/character.js";
import { SpecialAbilityItem } from "./SpecialAbilityItem.js";
import { t } from "../i18n/index.js";
import {
  createAddHandler,
  createItemInstances,
  renderAddButton,
} from "./helpers/CollectionBehavior.js";

export class SpecialAbilities {
  private handleAddSpecialAbility: () => void;

  constructor(
    private specialAbilities: SpecialAbility[],
    private onUpdate?: (index: number, updated: SpecialAbility) => void,
    private onDelete?: (index: number) => void
  ) {
    // Create add handler using CollectionBehavior helper
    this.handleAddSpecialAbility = createAddHandler({
      emptyItem: { name: "", source: "", description: "" },
      ItemComponentClass: SpecialAbilityItem,
      collection: this.specialAbilities,
      onUpdate: this.onUpdate,
    });
  }

  render(): TemplateResult {
    const isEmpty = !this.specialAbilities || this.specialAbilities.length === 0;

    // Create special ability item instances using CollectionBehavior helper
    const specialAbilityItems = isEmpty
      ? []
      : createItemInstances({
          collection: this.specialAbilities,
          ItemComponentClass: SpecialAbilityItem,
          onUpdate: this.onUpdate,
          onDelete: this.onDelete,
        });

    return html`
      <div data-testid="special-abilities-section" class="mt-8">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">
            ${t("specialAbilities.title")} ✨
          </h2>
          ${this.onUpdate
            ? renderAddButton({
                onClick: this.handleAddSpecialAbility,
                testId: "add-special-ability-button",
                colorTheme: "teal",
                ariaLabel: "Add Special Ability",
              })
            : ""}
        </div>
        ${isEmpty
          ? html`
              <div data-testid="empty-special-abilities" class="empty-special-abilities-styled">
                ${t("specialAbilities.empty")}
              </div>
            `
          : html`
              <div class="grid grid-cols-1 gap-4">
                ${specialAbilityItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
