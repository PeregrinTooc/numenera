import { html, TemplateResult } from "lit-html";
import { Attack, Character } from "@/types/character";
import { AttackItem } from "./AttackItem.js";
import { openFieldEditor } from "@/services/modalService";
import { t } from "@/i18n/index";
import { CollectionSection } from "./helpers/CollectionBehavior.js";
import { renderAddButton, renderCollection } from "./helpers/collectionRendering.js";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

type FieldType = "armor";

export class Attacks {
  private attacks: CollectionSection<Attack, AttackItem>;
  private drag = new CollectionDragReorder({
    section: "attacks",
    itemTestId: "attack-item",
    getCollection: () => this.character.attacks,
    setCollection: (items) => (this.character.attacks = items as Character["attacks"]),
  });

  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {
    this.attacks = new CollectionSection(character, {
      collectionKey: "attacks",
      ItemComponentClass: AttackItem,
      emptyItem: { name: "", damage: 0, modifier: 0, range: "" },
    });
  }

  private openEditModal(fieldType: FieldType): void {
    openFieldEditor(fieldType, this.character.armor, (newValue) =>
      this.onFieldUpdate(fieldType, newValue as number)
    );
  }

  render(): TemplateResult {
    return html`
      <div data-testid="attacks-section" class="section-box">
        <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-serif font-bold text-gray-700">${t("attacks.title")} ⚔️</h2>
            ${renderAddButton({
              onClick: this.attacks.handleAdd,
              testId: "add-attack-button",
              colorTheme: "red",
              ariaLabel: t("attacks.add"),
            })}
          </div>
          <div
            data-testid="armor-badge"
            class="stat-badge stat-badge-armor editable-field flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg shadow-sm"
            @click=${() => this.openEditModal("armor")}
            role="button"
            tabindex="0"
            aria-label=${t("resourceTracker.editArmor")}
          >
            <span class="stat-badge-label text-sm font-semibold text-gray-700"
              >${t("resourceTracker.armor")}:</span
            >
            <span data-testid="armor-value" class="stat-badge-value text-lg font-bold text-gray-900"
              >${this.character.armor}</span
            >
          </div>
        </div>
        ${renderCollection({
          isEmpty: this.character.attacks.length === 0,
          emptyState: {
            testId: "empty-attacks",
            className: "empty-attacks-styled",
            message: t("attacks.empty"),
          },
          listTestId: "attacks-list",
          listClassName: "section-card-grid",
          drag: this.drag,
          items: this.attacks.items().map((item) => item.render()),
        })}
      </div>
    `;
  }
}
