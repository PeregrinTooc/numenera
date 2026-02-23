// Attacks component - Displays character attacks in grid

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { AttackItem } from "./AttackItem.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";
import {
  createAddHandler,
  createItemInstances,
  renderAddButton,
} from "./helpers/CollectionBehavior.js";
import { reorderArray } from "./helpers/DragDropBehavior.js";
import { getVersionHistoryService } from "../services/versionHistoryServiceAccess.js";

type FieldType = "armor";

export class Attacks {
  private handleAddAttack: () => void;
  private draggedIndex: number | null = null;
  private previewOrder: number[] | null = null;
  private currentTargetIndex: number | null = null;

  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {
    // Create add handler using CollectionBehavior helper (event-based pattern)
    this.handleAddAttack = createAddHandler({
      emptyItem: { name: "", damage: 0, modifier: 0, range: "" },
      ItemComponentClass: AttackItem,
      collection: this.character.attacks,
      character: this.character,
      collectionKey: "attacks",
    });
  }

  // ============================================================================
  // DRAG AND DROP HANDLERS
  // ============================================================================

  private handleDragStart(e: Event): void {
    const dragEvent = e as globalThis.DragEvent;
    const target = dragEvent.target as HTMLElement;
    const item = target.closest("[data-testid='attack-item']") as HTMLElement;
    if (item) {
      const index = parseInt(item.dataset.index || "0", 10);
      this.draggedIndex = index;
      this.previewOrder = null;
      dragEvent.dataTransfer?.setData("text/plain", index.toString());
      dragEvent.dataTransfer?.setData("application/x-section", "attacks");
      item.setAttribute("data-dragging", "true");
    }
  }

  private handleDragOver(e: Event): void {
    e.preventDefault();
    if (this.draggedIndex === null) return;

    const target = e.target as HTMLElement;
    const item = target.closest("[data-testid='attack-item']") as HTMLElement;
    if (!item) return;

    const targetIndex = parseInt(item.dataset.index || "0", 10);
    if (this.draggedIndex === targetIndex) return;

    this.currentTargetIndex = targetIndex;

    const newOrder = this.calculatePreviewOrder(this.draggedIndex, targetIndex);
    if (!this.previewOrderEquals(newOrder)) {
      this.previewOrder = newOrder;
      this.applyPreviewOrder();
    }
  }

  private handleDrop(e: Event): void {
    e.preventDefault();
    const dragEvent = e as globalThis.DragEvent;

    // Check section to prevent cross-section drops
    const sourceSection = dragEvent.dataTransfer?.getData("application/x-section");
    if (sourceSection !== "attacks") {
      this.handleDragEnd(e);
      return;
    }

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

    let targetIndex = this.currentTargetIndex;
    if (targetIndex === null) {
      const target = e.target as HTMLElement;
      const item = target.closest("[data-testid='attack-item']") as HTMLElement;
      if (!item) {
        this.handleDragEnd(e);
        return;
      }
      targetIndex = parseInt(item.dataset.index || "0", 10);
    }

    if (draggedIndex === targetIndex) {
      this.handleDragEnd(e);
      return;
    }

    // Reorder the attacks array (immutable update for version history)
    const newItems = reorderArray(this.character.attacks, draggedIndex, targetIndex);
    this.character.attacks = newItems;

    this.handleDragEnd(e, true);

    // Dispatch collection-updated for targeted re-render
    // Dispatch character-updated for save
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.dispatchEvent(
        new CustomEvent("collection-updated", { detail: { section: "attacks" } })
      );
      appElement.dispatchEvent(new CustomEvent("character-updated"));
    }
  }

  private handleDragEnd(_e: Event, keepOrder: boolean = false): void {
    const items = document.querySelectorAll("[data-testid='attack-item']");
    items.forEach((item) => {
      item.removeAttribute("data-dragging");
      if (!keepOrder) {
        (item as HTMLElement).style.order = "";
      }
    });
    this.previewOrder = null;
    this.draggedIndex = null;
    this.currentTargetIndex = null;
  }

  private calculatePreviewOrder(fromIndex: number, toIndex: number): number[] {
    const indices = this.character.attacks.map((_, i) => i);
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
    const container = document.querySelector("[data-testid='attacks-list']");
    if (!container) return;

    const items = Array.from(container.querySelectorAll("[data-testid='attack-item']"));
    this.previewOrder.forEach((originalIndex, visualPosition) => {
      const item = items.find(
        (el) => parseInt((el as HTMLElement).dataset.index || "0", 10) === originalIndex
      );
      if (item) {
        (item as HTMLElement).style.order = visualPosition.toString();
      }
    });
  }

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.armor;

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
    const isEmpty = this.character.attacks.length === 0;

    // Create attack item instances using CollectionBehavior helper (event-based pattern)
    // collectionKey enables immutable updates for proper version history undo support
    const attackItems = isEmpty
      ? []
      : createItemInstances({
          collection: this.character.attacks,
          ItemComponentClass: AttackItem,
          character: this.character,
          collectionKey: "attacks",
        });

    return html`
      <div data-testid="attacks-section" class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-serif font-bold text-gray-700">${t("attacks.title")} ⚔️</h2>
            ${renderAddButton({
              onClick: this.handleAddAttack,
              testId: "add-attack-button",
              colorTheme: "red",
              ariaLabel: "Add Attack",
            })}
          </div>
          <div
            data-testid="armor-badge"
            class="stat-badge stat-badge-armor editable-field flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg shadow-sm"
            @click=${() => this.openEditModal("armor")}
            role="button"
            tabindex="0"
            aria-label="Edit Armor"
          >
            <span class="stat-badge-label text-sm font-semibold text-gray-700"
              >${t("resourceTracker.armor")}:</span
            >
            <span data-testid="armor-value" class="stat-badge-value text-lg font-bold text-gray-900"
              >${this.character.armor}</span
            >
          </div>
        </div>
        ${isEmpty
          ? html`
              <div data-testid="empty-attacks" class="empty-attacks-styled">
                ${t("attacks.empty")}
              </div>
            `
          : html`
              <div
                data-testid="attacks-list"
                class="grid grid-cols-1 gap-4"
                @dragstart=${(e: Event) => this.handleDragStart(e)}
                @dragover=${(e: Event) => this.handleDragOver(e)}
                @drop=${(e: Event) => this.handleDrop(e)}
                @dragend=${(e: Event) => this.handleDragEnd(e)}
              >
                ${attackItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
