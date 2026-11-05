import { html, TemplateResult } from "lit-html";
import { Character, SpecialAbility } from "@/types/character";
import { SpecialAbilityItem } from "./SpecialAbilityItem.js";
import { t } from "@/i18n/index";
import { CollectionSection } from "./helpers/CollectionBehavior.js";
import { renderAddButton, renderCollection } from "./helpers/collectionRendering.js";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

export class SpecialAbilities {
  private specialAbilities: CollectionSection<SpecialAbility, SpecialAbilityItem>;
  private drag = new CollectionDragReorder({
    section: "specialAbilities",
    itemTestId: "special-ability-item",
    listTestId: "special-abilities-list",
    getCollection: () => this.character.specialAbilities,
    setCollection: (items) =>
      (this.character.specialAbilities = items as Character["specialAbilities"]),
  });

  constructor(private character: Character) {
    this.specialAbilities = new CollectionSection(character, {
      collectionKey: "specialAbilities",
      ItemComponentClass: SpecialAbilityItem,
      emptyItem: { name: "", source: "", description: "" },
    });
  }

  render(): TemplateResult {
    return html`
      <div data-testid="special-abilities-section" class="section-box">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">
            ${t("specialAbilities.title")} ✨
          </h2>
          ${renderAddButton({
            onClick: this.specialAbilities.handleAdd,
            testId: "add-special-ability-button",
            colorTheme: "teal",
            ariaLabel: t("specialAbilities.add"),
          })}
        </div>
        ${renderCollection({
          isEmpty: this.character.specialAbilities.length === 0,
          emptyState: {
            testId: "empty-special-abilities",
            className: "empty-special-abilities-styled",
            message: t("specialAbilities.empty"),
          },
          listTestId: "special-abilities-list",
          listClassName: "section-card-grid",
          drag: this.drag,
          items: this.specialAbilities.items().map((item) => item.render()),
        })}
      </div>
    `;
  }
}
