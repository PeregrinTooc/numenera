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
  private previewOrder: number[] | null = null; // For live preview during drag
  private currentTargetIndex: number | null = null; // Track target during drag

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

  private handleDragStart(e: Event): void {
    const dragEvent = e as globalThis.DragEvent;
    const target = dragEvent.target as HTMLElement;
    const cypherItem = target.closest("[data-testid='cypher-item']") as HTMLElement;
    if (cypherItem) {
      const index = parseInt(cypherItem.dataset.index || "0", 10);
      this.draggedIndex = index;
      this.previewOrder = null; // Reset preview order
      dragEvent.dataTransfer?.setData("text/plain", index.toString());

      // Add dragging visual state
      cypherItem.setAttribute("data-dragging", "true");
    }
  }

  private handleDragOver(e: Event): void {
    e.preventDefault(); // Allow drop

    if (this.draggedIndex === null) return;

    const target = e.target as HTMLElement;
    const cypherItem = target.closest("[data-testid='cypher-item']") as HTMLElement;
    if (!cypherItem) return;

    const targetIndex = parseInt(cypherItem.dataset.index || "0", 10);
    if (this.draggedIndex === targetIndex) return;

    // Store the target index for drop operation
    this.currentTargetIndex = targetIndex;

    // Calculate preview order for live reorder
    const newOrder = this.calculatePreviewOrder(this.draggedIndex, targetIndex);

    // Only re-render if order changed
    if (!this.previewOrderEquals(newOrder)) {
      this.previewOrder = newOrder;
      this.applyPreviewOrder();
    }
  }

  private handleDragEnd(_e: Event, keepOrder: boolean = false): void {
    // Remove dragging visual state from all items
    const items = document.querySelectorAll("[data-testid='cypher-item']");
    items.forEach((item) => {
      item.removeAttribute("data-dragging");
      // Only clear CSS order if not keeping it (for smooth transition after successful drop)
      if (!keepOrder) {
        (item as HTMLElement).style.order = "";
      }
    });

    // Reset preview state
    this.previewOrder = null;
    this.draggedIndex = null;
    this.currentTargetIndex = null;
  }

  private calculatePreviewOrder(fromIndex: number, toIndex: number): number[] {
    const indices = this.character.cyphers.map((_, i) => i);
    const [removed] = indices.splice(fromIndex, 1);
    indices.splice(toIndex, 0, removed);
    return indices;
  }

  private previewOrderEquals(newOrder: number[]): boolean {
    if (!this.previewOrder) return false;
    return this.previewOrder.every((val, i) => val === newOrder[i]);
  }

  private applyPreviewOrder(): void {
    if (!this.previewOrder) return;

    const container = document.querySelector("[data-testid='cyphers-list']");
    if (!container) return;

    const items = Array.from(container.querySelectorAll("[data-testid='cypher-item']"));

    // Use CSS order property for visual reordering (don't move DOM elements)
    // This preserves data-index for correct drop handling
    this.previewOrder.forEach((originalIndex, visualPosition) => {
      const item = items.find(
        (el) => parseInt((el as HTMLElement).dataset.index || "0", 10) === originalIndex
      );
      if (item) {
        (item as HTMLElement).style.order = visualPosition.toString();
      }
    });
  }

  private handleDrop(e: Event): void {
    e.preventDefault();
    const dragEvent = e as globalThis.DragEvent;

    // Get dragged index from dataTransfer (more reliable than instance state)
    // Instance state may be lost if component re-renders during drag
    let draggedIndex = this.draggedIndex;
    if (draggedIndex === null) {
      const transferData = dragEvent.dataTransfer?.getData("text/plain");
      if (transferData) {
        draggedIndex = parseInt(transferData, 10);
      }
    }

    if (draggedIndex === null || isNaN(draggedIndex)) {
      this.handleDragEnd(e);
      return;
    }

    // Use currentTargetIndex from dragover (tracks actual target position)
    // If no dragover occurred, fall back to finding target from drop position
    let targetIndex = this.currentTargetIndex;

    if (targetIndex === null) {
      // Fallback: find target from drop position (for direct drops without dragover)
      const target = e.target as HTMLElement;
      const cypherItem = target.closest("[data-testid='cypher-item']") as HTMLElement;
      if (!cypherItem) {
        this.handleDragEnd(e);
        return;
      }
      targetIndex = parseInt(cypherItem.dataset.index || "0", 10);
    }

    if (draggedIndex === targetIndex) {
      this.handleDragEnd(e);
      return;
    }

    // Reorder the cyphers array
    const newCyphers = reorderArray(this.character.cyphers, draggedIndex, targetIndex);

    // Update character data immediately
    this.character.cyphers = newCyphers;

    // Clean up drag state but keep CSS order to prevent flash
    this.handleDragEnd(e, true);

    // Dispatch cyphers-updated for targeted re-render (smooth, no flash)
    // Dispatch character-updated for save (but won't re-render cyphers)
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.dispatchEvent(new CustomEvent("cyphers-updated"));
      appElement.dispatchEvent(new CustomEvent("character-updated"));
    }
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
                @dragstart=${(e: Event) => this.handleDragStart(e)}
                @dragover=${(e: Event) => this.handleDragOver(e)}
                @drop=${(e: Event) => this.handleDrop(e)}
                @dragend=${(e: Event) => this.handleDragEnd(e)}
              >
                ${cypherItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
