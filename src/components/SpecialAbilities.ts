// SpecialAbilities component - Displays character special abilities in grid

import { html, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { SpecialAbilityItem } from "./SpecialAbilityItem.js";
import { t } from "@/i18n/index";
import { createAddHandler, createItemInstances } from "./helpers/CollectionBehavior.js";
import { renderAddButton } from "./helpers/collectionRendering.js";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

export class SpecialAbilities {
  private handleAddSpecialAbility: () => void;
  private drag = new CollectionDragReorder({
    section: "specialAbilities",
    itemTestId: "special-ability-item",
    listTestId: "special-abilities-list",
    getCollection: () => this.character.specialAbilities,
    setCollection: (items) =>
      (this.character.specialAbilities = items as Character["specialAbilities"]),
  });

  constructor(private character: Character) {
    // Create add handler using CollectionBehavior helper (event-based pattern)
    this.handleAddSpecialAbility = createAddHandler({
      emptyItem: { name: "", source: "", description: "" },
      ItemComponentClass: SpecialAbilityItem,
      collection: this.character.specialAbilities,
      character: this.character,
      collectionKey: "specialAbilities",
    });
  }

  render(): TemplateResult {
    const isEmpty = this.character.specialAbilities.length === 0;

    // Create special ability item instances using CollectionBehavior helper (event-based pattern)
    // collectionKey enables immutable updates for proper version history undo support
    const specialAbilityItems = isEmpty
      ? []
      : createItemInstances({
          collection: this.character.specialAbilities,
          ItemComponentClass: SpecialAbilityItem,
          character: this.character,
          collectionKey: "specialAbilities",
        });

    return html`
      <div data-testid="special-abilities-section" class="mt-8">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">
            ${t("specialAbilities.title")} ✨
          </h2>
          ${renderAddButton({
            onClick: this.handleAddSpecialAbility,
            testId: "add-special-ability-button",
            colorTheme: "teal",
            ariaLabel: "Add Special Ability",
          })}
        </div>
        ${isEmpty
          ? html`
              <div data-testid="empty-special-abilities" class="empty-special-abilities-styled">
                ${t("specialAbilities.empty")}
              </div>
            `
          : html`
              <div
                data-testid="special-abilities-list"
                class="grid grid-cols-1 gap-4"
                @dragstart=${(e: Event) => this.drag.handleDragStart(e)}
                @dragover=${(e: Event) => this.drag.handleDragOver(e)}
                @drop=${(e: Event) => this.drag.handleDrop(e)}
                @dragend=${() => this.drag.handleDragEnd()}
              >
                ${specialAbilityItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
