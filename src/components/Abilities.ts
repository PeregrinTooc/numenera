// Abilities component - Displays character abilities in two-column grid

import { html, TemplateResult } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
import { Character } from "@/types/character";
import { AbilityItem } from "./AbilityItem.js";
import { t } from "@/i18n/index";
import { createAddHandler, createItemInstances } from "./helpers/CollectionBehavior.js";
import { renderAddButton } from "./helpers/collectionRendering.js";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

export class Abilities {
  private handleAddAbility: () => void;
  private drag = new CollectionDragReorder({
    section: "abilities",
    itemTestId: "ability-item",
    matchItemTestIdPrefix: true,
    getCollection: () => this.character.abilities,
    setCollection: (items) => (this.character.abilities = items as Character["abilities"]),
  });

  constructor(private character: Character) {
    // Create add handler using CollectionBehavior helper (event-based pattern)
    this.handleAddAbility = createAddHandler({
      emptyItem: { name: "", description: "" },
      ItemComponentClass: AbilityItem,
      collection: this.character.abilities,
      character: this.character,
      collectionKey: "abilities",
    });
  }

  render(): TemplateResult {
    const isEmpty = this.character.abilities.length === 0;

    // Create ability item instances using CollectionBehavior helper (event-based pattern)
    // collectionKey enables immutable updates for proper version history undo support
    const abilityItems = isEmpty
      ? []
      : createItemInstances({
          collection: this.character.abilities,
          ItemComponentClass: AbilityItem,
          character: this.character,
          collectionKey: "abilities",
        });

    return html`
      <div data-testid="abilities-section" class="mt-8">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">${t("abilities.heading")} ⚡</h2>
          ${renderAddButton({
            onClick: this.handleAddAbility,
            testId: "add-ability-button",
            colorTheme: "indigo",
            ariaLabel: "Add Ability",
          })}
        </div>
        ${isEmpty
          ? html`
              <div data-testid="empty-abilities" class="empty-abilities-styled">
                ${t("abilities.empty")}
              </div>
            `
          : html`
              <div
                data-testid="abilities-list"
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
                @dragstart=${(e: Event) => this.drag.handleDragStart(e)}
                @dragover=${(e: Event) => this.drag.handleDragOver(e)}
                @drop=${(e: Event) => this.drag.handleDrop(e)}
                @dragend=${() => this.drag.handleDragEnd()}
              >
                ${repeat(
                  abilityItems,
                  (_item, index) =>
                    `ability-${index}-${this.character.abilities[index]?.name || index}`,
                  (item) => item.render()
                )}
              </div>
            `}
      </div>
    `;
  }
}
