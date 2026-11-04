import { html, TemplateResult } from "lit-html";
import { Character, Cypher } from "@/types/character";
import { CypherItem } from "./CypherItem.js";
import { openFieldEditor } from "@/services/modalService";
import { t } from "@/i18n/index";
import { CollectionSection } from "./helpers/CollectionBehavior.js";
import { renderAddButton, renderCollection } from "./helpers/collectionRendering.js";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

type FieldType = "maxCyphers";

export class CyphersBox {
  private cyphers: CollectionSection<Cypher, CypherItem>;
  private drag = new CollectionDragReorder({
    section: "cyphers",
    itemTestId: "cypher-item",
    updatedEvent: "cyphers-updated",
    getCollection: () => this.character.cyphers,
    setCollection: (items) => (this.character.cyphers = items as Character["cyphers"]),
  });

  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {
    this.cyphers = new CollectionSection(character, {
      collectionKey: "cyphers",
      ItemComponentClass: CypherItem,
      emptyItem: { name: "", level: "", effect: "" },
    });
  }

  private openEditModal(fieldType: FieldType): void {
    openFieldEditor(fieldType, this.character.maxCyphers, (newValue) =>
      this.onFieldUpdate(fieldType, newValue as number)
    );
  }

  render(): TemplateResult {
    return html`
      <div data-testid="cyphers-section" class="section-box">
        <div class="section-box-heading-row">
          <div
            data-testid="max-cyphers-badge"
            class="stat-badge editable-field"
            @click=${() => this.openEditModal("maxCyphers")}
            role="button"
            tabindex="0"
            aria-label=${t("cyphers.editMax")}
          >
            <span class="stat-badge-value"
              >${this.character.cyphers.length}/<span data-testid="max-cyphers-value"
                >${this.character.maxCyphers}</span
              ></span
            >
            <span class="stat-badge-label">${t("cyphers.max")}</span>
          </div>

          <h2 data-testid="cyphers-heading" class="section-box-heading">
            ${t("cyphers.heading")}
            ${renderAddButton({
              onClick: this.cyphers.handleAdd,
              testId: "add-cypher-button",
              colorTheme: "purple",
              ariaLabel: t("cyphers.add"),
            })}
          </h2>
        </div>

        ${renderCollection({
          isEmpty: this.character.cyphers.length === 0,
          emptyState: {
            testId: "empty-cyphers",
            className: "empty-cyphers-styled",
            message: t("cyphers.empty"),
            paragraph: true,
          },
          listTestId: "cyphers-list",
          listClassName: "section-card-grid",
          drag: this.drag,
          items: this.cyphers.items().map((item) => item.render()),
        })}
      </div>
    `;
  }
}
