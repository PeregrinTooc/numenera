// Abilities component - Displays character abilities in two-column grid

import { html, TemplateResult } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
import { Character } from "../types/character.js";
import { AbilityItem } from "./AbilityItem.js";
import { t } from "../i18n/index.js";
import {
  createAddHandler,
  createItemInstances,
  renderAddButton,
} from "./helpers/CollectionBehavior.js";
import { reorderArray } from "./helpers/DragDropBehavior.js";

export class Abilities {
  private handleAddAbility: () => void;
  private draggedIndex: number | null = null;
  private previewOrder: number[] | null = null;
  private currentTargetIndex: number | null = null;

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

  // ============================================================================
  // DRAG AND DROP HANDLERS
  // ============================================================================

  private handleDragStart(e: Event): void {
    const dragEvent = e as globalThis.DragEvent;
    const target = dragEvent.target as HTMLElement;
    const abilityItem = target.closest("[data-testid^='ability-item']") as HTMLElement;
    if (abilityItem) {
      const index = parseInt(abilityItem.dataset.index || "0", 10);
      this.draggedIndex = index;
      this.previewOrder = null;
      dragEvent.dataTransfer?.setData("text/plain", index.toString());
      dragEvent.dataTransfer?.setData("application/x-section", "abilities");
      abilityItem.setAttribute("data-dragging", "true");
    }
  }

  private handleDragOver(e: Event): void {
    e.preventDefault();
    if (this.draggedIndex === null) return;

    const target = e.target as HTMLElement;
    const abilityItem = target.closest("[data-testid^='ability-item']") as HTMLElement;
    if (!abilityItem) return;

    const targetIndex = parseInt(abilityItem.dataset.index || "0", 10);
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
    if (sourceSection !== "abilities") {
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
      const abilityItem = target.closest("[data-testid^='ability-item']") as HTMLElement;
      if (!abilityItem) {
        this.handleDragEnd(e);
        return;
      }
      targetIndex = parseInt(abilityItem.dataset.index || "0", 10);
    }

    if (draggedIndex === targetIndex) {
      this.handleDragEnd(e);
      return;
    }

    // Reorder the abilities array
    const newAbilities = reorderArray(this.character.abilities, draggedIndex, targetIndex);
    this.character.abilities = newAbilities;

    this.handleDragEnd(e, true);

    // Dispatch collection-updated for targeted re-render
    // Dispatch character-updated for save
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.dispatchEvent(
        new CustomEvent("collection-updated", { detail: { section: "abilities" } })
      );
      appElement.dispatchEvent(new CustomEvent("character-updated"));
    }
  }

  private handleDragEnd(_e: Event, keepOrder: boolean = false): void {
    const items = document.querySelectorAll("[data-testid^='ability-item']");
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
    const indices = this.character.abilities.map((_, i) => i);
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
    const container = document.querySelector("[data-testid='abilities-list']");
    if (!container) return;

    const items = Array.from(container.querySelectorAll("[data-testid^='ability-item']"));
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
                @dragstart=${(e: Event) => this.handleDragStart(e)}
                @dragover=${(e: Event) => this.handleDragOver(e)}
                @drop=${(e: Event) => this.handleDrop(e)}
                @dragend=${(e: Event) => this.handleDragEnd(e)}
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
