// CyphersBox component - Displays cyphers in a standalone section with max cyphers badge

import { html, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { CypherItem } from "./CypherItem.js";
import { ModalService } from "@/services/modalService";
import { t } from "@/i18n/index";
import { createAddHandler, createItemInstances } from "./helpers/CollectionBehavior.js";
import { renderAddButton } from "./helpers/collectionRendering.js";
import { getVersionHistoryService } from "@/services/versionHistoryServiceAccess";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

type FieldType = "maxCyphers";

export class CyphersBox {
  private handleAddCypher: () => void;
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
    // Create add handler using CollectionBehavior helper (event-based pattern)
    // collectionKey enables immutable updates and proper event dispatch for re-render
    this.handleAddCypher = createAddHandler({
      emptyItem: { name: "", level: "", effect: "" },
      ItemComponentClass: CypherItem,
      collection: this.character.cyphers,
      character: this.character,
      collectionKey: "cyphers",
    });
  }

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.maxCyphers;

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
      },
      versionHistoryService: getVersionHistoryService(),
    });
  }

  render(): TemplateResult {
    // Create cypher item instances using CollectionBehavior helper (event-based pattern)
    // collectionKey enables immutable updates for proper version history undo support
    const cypherItems = createItemInstances({
      collection: this.character.cyphers,
      ItemComponentClass: CypherItem,
      character: this.character,
      collectionKey: "cyphers",
    });

    return html`
      <div data-testid="cyphers-section" class="section-box">
        <!-- Max Cyphers Badge - top-right corner -->
        <div
          data-testid="max-cyphers-badge"
          class="stat-badge badge-top-right editable-field"
          @click=${() => this.openEditModal("maxCyphers")}
          role="button"
          tabindex="0"
          aria-label="Edit Max Cyphers"
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
            onClick: this.handleAddCypher,
            testId: "add-cypher-button",
            colorTheme: "purple",
            ariaLabel: "Add Cypher",
          })}
        </h2>

        ${this.character.cyphers.length === 0
          ? html`
              <div data-testid="empty-cyphers" class="empty-cyphers-styled">
                <p>${t("cyphers.empty")}</p>
              </div>
            `
          : html`
              <div
                data-testid="cyphers-list"
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
                @dragstart=${(e: Event) => this.drag.handleDragStart(e)}
                @dragover=${(e: Event) => this.drag.handleDragOver(e)}
                @drop=${(e: Event) => this.drag.handleDrop(e)}
                @dragend=${() => this.drag.handleDragEnd()}
              >
                ${cypherItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
