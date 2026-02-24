// ItemsBox component - Combines Equipment, Artifacts, and Oddities in a single box with Shins badge

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { EquipmentItem } from "./EquipmentItem.js";
import { ArtifactItem } from "./ArtifactItem.js";
import { OddityItem } from "./OddityItem.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";
import {
  createAddHandler,
  createItemInstances,
  renderAddButton,
} from "./helpers/CollectionBehavior.js";
import { reorderArray } from "./helpers/DragDropBehavior.js";
import { getVersionHistoryService } from "../services/versionHistoryServiceAccess.js";

type FieldType = "shins";
type ItemSection = "equipment" | "artifacts" | "oddities";

export class ItemsBox {
  private handleAddEquipment: () => void;
  private handleAddArtifact: () => void;
  private handleAddOddity: () => void;

  // Drag state for each section
  private dragState: {
    equipment: {
      draggedIndex: number | null;
      previewOrder: number[] | null;
      currentTargetIndex: number | null;
    };
    artifacts: {
      draggedIndex: number | null;
      previewOrder: number[] | null;
      currentTargetIndex: number | null;
    };
    oddities: {
      draggedIndex: number | null;
      previewOrder: number[] | null;
      currentTargetIndex: number | null;
    };
  } = {
    equipment: { draggedIndex: null, previewOrder: null, currentTargetIndex: null },
    artifacts: { draggedIndex: null, previewOrder: null, currentTargetIndex: null },
    oddities: { draggedIndex: null, previewOrder: null, currentTargetIndex: null },
  };

  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {
    // Create add handlers using CollectionBehavior helper (event-based pattern)
    this.handleAddEquipment = createAddHandler({
      emptyItem: { name: "", description: "" },
      ItemComponentClass: EquipmentItem,
      collection: this.character.equipment,
      character: this.character,
      collectionKey: "equipment",
    });

    this.handleAddArtifact = createAddHandler({
      emptyItem: { name: "", level: "", effect: "" },
      ItemComponentClass: ArtifactItem,
      collection: this.character.artifacts,
      character: this.character,
      collectionKey: "artifacts",
    });

    this.handleAddOddity = createAddHandler({
      emptyItem: "",
      ItemComponentClass: OddityItem,
      collection: this.character.oddities,
      character: this.character,
      collectionKey: "oddities",
    });
  }

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.shins;

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
      },
      versionHistoryService: getVersionHistoryService(),
    });
  }

  // ============================================================================
  // DRAG AND DROP HANDLERS (generic for all 3 sections)
  // ============================================================================

  private handleDragStart(e: Event, section: ItemSection, testIdSelector: string): void {
    const dragEvent = e as globalThis.DragEvent;
    const target = dragEvent.target as HTMLElement;
    const item = target.closest(`[data-testid='${testIdSelector}']`) as HTMLElement;
    if (item) {
      const index = parseInt(item.dataset.index || "0", 10);
      this.dragState[section].draggedIndex = index;
      this.dragState[section].previewOrder = null;
      dragEvent.dataTransfer?.setData("text/plain", index.toString());
      dragEvent.dataTransfer?.setData("application/x-section", section);
      item.setAttribute("data-dragging", "true");
    }
  }

  private handleDragOver(e: Event, section: ItemSection, testIdSelector: string): void {
    e.preventDefault();
    const state = this.dragState[section];
    if (state.draggedIndex === null) return;

    const target = e.target as HTMLElement;
    const item = target.closest(`[data-testid='${testIdSelector}']`) as HTMLElement;
    if (!item) return;

    const targetIndex = parseInt(item.dataset.index || "0", 10);
    if (state.draggedIndex === targetIndex) return;

    state.currentTargetIndex = targetIndex;

    const collection = this.getCollection(section);
    const newOrder = this.calculatePreviewOrder(state.draggedIndex, targetIndex, collection.length);
    if (!this.previewOrderEquals(state.previewOrder, newOrder)) {
      state.previewOrder = newOrder;
      this.applyPreviewOrder(section, testIdSelector);
    }
  }

  private handleDrop(e: Event, section: ItemSection, testIdSelector: string): void {
    e.preventDefault();
    const dragEvent = e as globalThis.DragEvent;
    const state = this.dragState[section];

    // Check section to prevent cross-section drops
    const sourceSection = dragEvent.dataTransfer?.getData("application/x-section");
    if (sourceSection !== section) {
      this.handleDragEnd(e, section, testIdSelector);
      return;
    }

    let draggedIndex = state.draggedIndex;
    if (draggedIndex === null) {
      const transferData = dragEvent.dataTransfer?.getData("text/plain");
      if (transferData) {
        draggedIndex = parseInt(transferData, 10);
      }
    }

    if (draggedIndex === null || isNaN(draggedIndex)) {
      this.handleDragEnd(e, section, testIdSelector);
      return;
    }

    let targetIndex = state.currentTargetIndex;
    if (targetIndex === null) {
      const target = e.target as HTMLElement;
      const item = target.closest(`[data-testid='${testIdSelector}']`) as HTMLElement;
      if (!item) {
        this.handleDragEnd(e, section, testIdSelector);
        return;
      }
      targetIndex = parseInt(item.dataset.index || "0", 10);
    }

    if (draggedIndex === targetIndex) {
      this.handleDragEnd(e, section, testIdSelector);
      return;
    }

    // Reorder the array
    const collection = this.getCollection(section);
    const newItems = reorderArray(collection, draggedIndex, targetIndex);
    collection.length = 0;
    collection.push(...newItems);

    this.handleDragEnd(e, section, testIdSelector, true);

    // Dispatch collection-updated for targeted re-render
    // Dispatch character-updated for save
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.dispatchEvent(new CustomEvent("collection-updated", { detail: { section } }));
      appElement.dispatchEvent(new CustomEvent("character-updated"));
    }
  }

  private handleDragEnd(
    _e: Event,
    section: ItemSection,
    testIdSelector: string,
    keepOrder: boolean = false
  ): void {
    const items = document.querySelectorAll(`[data-testid='${testIdSelector}']`);
    items.forEach((item) => {
      item.removeAttribute("data-dragging");
      if (!keepOrder) {
        (item as HTMLElement).style.order = "";
      }
    });
    this.dragState[section] = { draggedIndex: null, previewOrder: null, currentTargetIndex: null };
  }

  private getCollection(section: ItemSection): unknown[] {
    switch (section) {
      case "equipment":
        return this.character.equipment;
      case "artifacts":
        return this.character.artifacts;
      case "oddities":
        return this.character.oddities;
    }
  }

  private calculatePreviewOrder(fromIndex: number, toIndex: number, length: number): number[] {
    const indices = Array.from({ length }, (_, i) => i);
    const [removed] = indices.splice(fromIndex, 1);
    indices.splice(toIndex, 0, removed);
    return indices;
  }

  private previewOrderEquals(current: number[] | null, newOrder: number[]): boolean {
    if (!current) return false;
    return current.every((val, i) => val === newOrder[i]);
  }

  private applyPreviewOrder(section: ItemSection, testIdSelector: string): void {
    const state = this.dragState[section];
    if (!state.previewOrder) return;

    const listSelector = `[data-testid='${section}-list']`;
    const container = document.querySelector(listSelector);
    if (!container) return;

    const items = Array.from(container.querySelectorAll(`[data-testid='${testIdSelector}']`));
    state.previewOrder.forEach((originalIndex, visualPosition) => {
      const item = items.find(
        (el) => parseInt((el as HTMLElement).dataset.index || "0", 10) === originalIndex
      );
      if (item) {
        (item as HTMLElement).style.order = visualPosition.toString();
      }
    });
  }

  render(): TemplateResult {
    // Create item instances using CollectionBehavior helper (event-based pattern)
    // collectionKey enables immutable updates for proper version history undo support
    const equipmentItems = createItemInstances({
      collection: this.character.equipment,
      ItemComponentClass: EquipmentItem,
      character: this.character,
      collectionKey: "equipment",
    });

    const artifactItems = createItemInstances({
      collection: this.character.artifacts,
      ItemComponentClass: ArtifactItem,
      character: this.character,
      collectionKey: "artifacts",
    });

    const oddityItems = createItemInstances({
      collection: this.character.oddities,
      ItemComponentClass: OddityItem,
      character: this.character,
      collectionKey: "oddities",
    });

    return html`
      <div data-testid="items-section" class="section-box">
        <!-- Shins Badge - top-right corner -->
        <div
          class="stat-badge badge-top-right editable-field"
          data-testid="shins-badge"
          @click=${() => this.openEditModal("shins")}
          role="button"
          tabindex="0"
          aria-label="Edit Shins"
        >
          <span class="stat-badge-value">${this.character.shins}</span>
          <span class="stat-badge-label">${t("character.shins")}</span>
        </div>

        <h2 class="section-box-heading">${t("items.heading")}</h2>

        <!-- Equipment Section (full width) -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 data-testid="equipment-heading" class="subsection-heading">
              ${t("equipment.heading")}
            </h3>
            ${renderAddButton({
              onClick: this.handleAddEquipment,
              testId: "add-equipment-button",
              colorTheme: "green",
              ariaLabel: "Add equipment",
            })}
          </div>
          ${this.character.equipment.length === 0
            ? html`
                <div data-testid="empty-equipment" class="empty-equipment-styled">
                  <p>${t("equipment.empty")}</p>
                </div>
              `
            : html`
                <div
                  data-testid="equipment-list"
                  class="grid grid-cols-1 md:grid-cols-2 gap-4"
                  @dragstart=${(e: Event) => this.handleDragStart(e, "equipment", "equipment-item")}
                  @dragover=${(e: Event) => this.handleDragOver(e, "equipment", "equipment-item")}
                  @drop=${(e: Event) => this.handleDrop(e, "equipment", "equipment-item")}
                  @dragend=${(e: Event) => this.handleDragEnd(e, "equipment", "equipment-item")}
                >
                  ${equipmentItems.map((item) => item.render())}
                </div>
              `}
        </div>

        <!-- Divider -->
        <div class="section-divider"></div>

        <!-- Artifacts and Oddities (two columns) -->
        <div class="two-column-grid">
          <!-- Artifacts Column -->
          <div data-testid="artifacts-section">
            <div class="flex justify-between items-center mb-2">
              <h3 data-testid="artifacts-heading" class="subsection-heading">
                ${t("artifacts.heading")}
              </h3>
              ${renderAddButton({
                onClick: this.handleAddArtifact,
                testId: "add-artifact-button",
                colorTheme: "purple",
                ariaLabel: "Add artifact",
              })}
            </div>
            ${this.character.artifacts.length === 0
              ? html`
                  <div data-testid="empty-artifacts" class="empty-artifacts-styled">
                    <p>${t("artifacts.empty")}</p>
                  </div>
                `
              : html`
                  <div
                    data-testid="artifacts-list"
                    class="space-y-4"
                    @dragstart=${(e: Event) =>
                      this.handleDragStart(e, "artifacts", "artifact-item")}
                    @dragover=${(e: Event) => this.handleDragOver(e, "artifacts", "artifact-item")}
                    @drop=${(e: Event) => this.handleDrop(e, "artifacts", "artifact-item")}
                    @dragend=${(e: Event) => this.handleDragEnd(e, "artifacts", "artifact-item")}
                  >
                    ${artifactItems.map((item) => item.render())}
                  </div>
                `}
          </div>

          <!-- Oddities Column -->
          <div data-testid="oddities-section">
            <div class="flex justify-between items-center mb-2">
              <h3 data-testid="oddities-heading" class="subsection-heading">
                ${t("oddities.heading")}
              </h3>
              ${renderAddButton({
                onClick: this.handleAddOddity,
                testId: "add-oddity-button",
                colorTheme: "indigo",
                ariaLabel: "Add oddity",
              })}
            </div>
            ${this.character.oddities.length === 0
              ? html`
                  <div data-testid="empty-oddities" class="empty-oddities-styled">
                    <p>${t("oddities.empty")}</p>
                  </div>
                `
              : html`
                  <div
                    data-testid="oddities-list"
                    class="space-y-3"
                    @dragstart=${(e: Event) => this.handleDragStart(e, "oddities", "oddity-item")}
                    @dragover=${(e: Event) => this.handleDragOver(e, "oddities", "oddity-item")}
                    @drop=${(e: Event) => this.handleDrop(e, "oddities", "oddity-item")}
                    @dragend=${(e: Event) => this.handleDragEnd(e, "oddities", "oddity-item")}
                  >
                    ${oddityItems.map((item) => item.render())}
                  </div>
                `}
          </div>
        </div>
      </div>
    `;
  }
}
