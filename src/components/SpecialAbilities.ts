// SpecialAbilities component - Displays character special abilities in grid

import { html, TemplateResult } from "lit-html";
import { SpecialAbility } from "../types/character.js";
import { SpecialAbilityItem } from "./SpecialAbilityItem.js";
import { t } from "../i18n/index.js";
import {
  createAddHandler,
  createItemInstances,
  renderAddButton,
} from "./helpers/CollectionBehavior.js";
import { reorderArray } from "./helpers/DragDropBehavior.js";

export class SpecialAbilities {
  private handleAddSpecialAbility: () => void;
  private draggedIndex: number | null = null;
  private previewOrder: number[] | null = null;
  private currentTargetIndex: number | null = null;

  constructor(
    private specialAbilities: SpecialAbility[],
    private onUpdate?: (index: number, updated: SpecialAbility) => void,
    private onDelete?: (index: number) => void
  ) {
    // Create add handler using CollectionBehavior helper
    this.handleAddSpecialAbility = createAddHandler({
      emptyItem: { name: "", source: "", description: "" },
      ItemComponentClass: SpecialAbilityItem,
      collection: this.specialAbilities,
      onUpdate: this.onUpdate,
    });
  }

  // ============================================================================
  // DRAG AND DROP HANDLERS
  // ============================================================================

  private handleDragStart(e: Event): void {
    const dragEvent = e as globalThis.DragEvent;
    const target = dragEvent.target as HTMLElement;
    const item = target.closest("[data-testid='special-ability-item']") as HTMLElement;
    if (item) {
      const index = parseInt(item.dataset.index || "0", 10);
      this.draggedIndex = index;
      this.previewOrder = null;
      dragEvent.dataTransfer?.setData("text/plain", index.toString());
      dragEvent.dataTransfer?.setData("application/x-section", "specialAbilities");
      item.setAttribute("data-dragging", "true");
    }
  }

  private handleDragOver(e: Event): void {
    e.preventDefault();
    if (this.draggedIndex === null) return;

    const target = e.target as HTMLElement;
    const item = target.closest("[data-testid='special-ability-item']") as HTMLElement;
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
    if (sourceSection !== "specialAbilities") {
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
      const item = target.closest("[data-testid='special-ability-item']") as HTMLElement;
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

    // Reorder the specialAbilities array
    const newItems = reorderArray(this.specialAbilities, draggedIndex, targetIndex);
    this.specialAbilities.length = 0;
    this.specialAbilities.push(...newItems);

    this.handleDragEnd(e, true);

    // Dispatch collection-updated for targeted re-render
    // Dispatch character-updated for save
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.dispatchEvent(
        new CustomEvent("collection-updated", { detail: { section: "specialAbilities" } })
      );
      appElement.dispatchEvent(new CustomEvent("character-updated"));
    }
  }

  private handleDragEnd(_e: Event, keepOrder: boolean = false): void {
    const items = document.querySelectorAll("[data-testid='special-ability-item']");
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
    const indices = this.specialAbilities.map((_, i) => i);
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
    const container = document.querySelector("[data-testid='special-abilities-list']");
    if (!container) return;

    const items = Array.from(container.querySelectorAll("[data-testid='special-ability-item']"));
    this.previewOrder.forEach((originalIndex, visualPosition) => {
      const item = items.find(
        (el) => parseInt((el as HTMLElement).dataset.index || "0", 10) === originalIndex
      );
      if (item) {
        (item as HTMLElement).style.order = visualPosition.toString();
      }
    });
  }

  render(): TemplateResult {
    const isEmpty = !this.specialAbilities || this.specialAbilities.length === 0;

    // Create special ability item instances using CollectionBehavior helper
    const specialAbilityItems = isEmpty
      ? []
      : createItemInstances({
          collection: this.specialAbilities,
          ItemComponentClass: SpecialAbilityItem,
          onUpdate: this.onUpdate,
          onDelete: this.onDelete,
        });

    return html`
      <div data-testid="special-abilities-section" class="mt-8">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">
            ${t("specialAbilities.title")} ✨
          </h2>
          ${this.onUpdate
            ? renderAddButton({
                onClick: this.handleAddSpecialAbility,
                testId: "add-special-ability-button",
                colorTheme: "teal",
                ariaLabel: "Add Special Ability",
              })
            : ""}
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
                @dragstart=${(e: Event) => this.handleDragStart(e)}
                @dragover=${(e: Event) => this.handleDragOver(e)}
                @drop=${(e: Event) => this.handleDrop(e)}
                @dragend=${(e: Event) => this.handleDragEnd(e)}
              >
                ${specialAbilityItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
