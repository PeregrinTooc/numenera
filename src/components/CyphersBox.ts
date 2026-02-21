// CyphersBox component - Displays cyphers in a standalone section with max cyphers badge

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { CypherItem } from "./CypherItem.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";
import {
  createAddHandler,
  createItemInstances,
  renderAddButton,
} from "./helpers/CollectionBehavior.js";
import { getVersionHistoryService } from "../services/versionHistoryServiceAccess.js";
import { reorderArray } from "./helpers/DragDropBehavior.js";

type FieldType = "maxCyphers";

export class CyphersBox {
  private handleAddCypher: () => void;
  private draggedIndex: number | null = null;

  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {
    // Create add handler using CollectionBehavior helper (event-based pattern)
    this.handleAddCypher = createAddHandler({
      emptyItem: { name: "", level: "", effect: "" },
      ItemComponentClass: CypherItem,
      collection: this.character.cyphers,
      character: this.character,
    });
  }

  private handleDragStart(e: Event): void {
    const dragEvent = e as globalThis.DragEvent;
    const target = dragEvent.target as HTMLElement;
    const cypherItem = target.closest("[data-testid='cypher-item']") as HTMLElement;
    if (cypherItem) {
      const index = parseInt(cypherItem.dataset.index || "0", 10);
      this.draggedIndex = index;
      dragEvent.dataTransfer?.setData("text/plain", index.toString());
    }
  }

  private handleDragOver(e: Event): void {
    e.preventDefault(); // Allow drop
  }

  private handleDrop(e: Event): void {
    e.preventDefault();
    if (this.draggedIndex === null) return;

    const target = e.target as HTMLElement;
    const cypherItem = target.closest("[data-testid='cypher-item']") as HTMLElement;
    if (!cypherItem) return;

    const targetIndex = parseInt(cypherItem.dataset.index || "0", 10);
    if (this.draggedIndex === targetIndex) return;

    // Reorder the cyphers array
    const newCyphers = reorderArray(this.character.cyphers, this.draggedIndex, targetIndex);

    // Update character and dispatch event to trigger save and re-render
    this.character.cyphers = newCyphers;
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.dispatchEvent(new CustomEvent("character-updated"));
    }

    this.draggedIndex = null;
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
    const cypherItems = createItemInstances({
      collection: this.character.cyphers,
      ItemComponentClass: CypherItem,
      character: this.character,
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
                @dragstart=${(e: Event) => this.handleDragStart(e)}
                @dragover=${(e: Event) => this.handleDragOver(e)}
                @drop=${(e: Event) => this.handleDrop(e)}
              >
                ${cypherItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
