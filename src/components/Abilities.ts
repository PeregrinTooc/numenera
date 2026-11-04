import { html, TemplateResult } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
import { Ability, Character } from "@/types/character";
import { AbilityItem } from "./AbilityItem.js";
import { t } from "@/i18n/index";
import { CollectionSection } from "./helpers/CollectionBehavior.js";
import { renderAddButton, renderCollection } from "./helpers/collectionRendering.js";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

export class Abilities {
  private abilities: CollectionSection<Ability, AbilityItem>;
  private drag = new CollectionDragReorder({
    section: "abilities",
    itemTestId: "ability-item",
    matchItemTestIdPrefix: true,
    getCollection: () => this.character.abilities,
    setCollection: (items) => (this.character.abilities = items as Character["abilities"]),
  });

  constructor(private character: Character) {
    this.abilities = new CollectionSection(character, {
      collectionKey: "abilities",
      ItemComponentClass: AbilityItem,
      emptyItem: { name: "", description: "" },
    });
  }

  render(): TemplateResult {
    const isEmpty = this.character.abilities.length === 0;

    return html`
      <div data-testid="abilities-section" class="section-box">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">${t("abilities.heading")} ⚡</h2>
          ${renderAddButton({
            onClick: this.abilities.handleAdd,
            testId: "add-ability-button",
            colorTheme: "indigo",
            ariaLabel: t("abilities.add"),
          })}
        </div>
        ${renderCollection({
          isEmpty,
          emptyState: {
            testId: "empty-abilities",
            className: "empty-abilities-styled",
            message: t("abilities.empty"),
          },
          listTestId: "abilities-list",
          listClassName: "section-card-grid",
          drag: this.drag,
          items: repeat(
            this.abilities.items(),
            (_item, index) => `ability-${index}-${this.character.abilities[index]?.name || index}`,
            (item) => item.render()
          ),
        })}
      </div>
    `;
  }
}
