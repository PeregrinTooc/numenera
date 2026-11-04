// ItemsBox component - Combines Equipment, Artifacts, and Oddities in a single box with Shins badge

import { html, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { EquipmentItem } from "./EquipmentItem.js";
import { ArtifactItem } from "./ArtifactItem.js";
import { OddityItem } from "./OddityItem.js";
import { openFieldEditor } from "@/services/modalService";
import { t } from "@/i18n/index";
import { createAddHandler, createItemInstances } from "./helpers/CollectionBehavior.js";
import { renderAddButton } from "./helpers/collectionRendering.js";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

type FieldType = "shins";
type ItemSection = "equipment" | "artifacts" | "oddities";

export class ItemsBox {
  private handleAddEquipment: () => void;
  private handleAddArtifact: () => void;
  private handleAddOddity: () => void;

  // Drag-reorder behaviour for each section
  private drag: Record<ItemSection, CollectionDragReorder> = {
    equipment: new CollectionDragReorder({
      section: "equipment",
      itemTestId: "equipment-item",
      getCollection: () => this.character.equipment,
      setCollection: (items) => (this.character.equipment = items as Character["equipment"]),
    }),
    artifacts: new CollectionDragReorder({
      section: "artifacts",
      itemTestId: "artifact-item",
      getCollection: () => this.character.artifacts,
      setCollection: (items) => (this.character.artifacts = items as Character["artifacts"]),
    }),
    oddities: new CollectionDragReorder({
      section: "oddities",
      itemTestId: "oddity-item",
      getCollection: () => this.character.oddities,
      setCollection: (items) => (this.character.oddities = items as Character["oddities"]),
    }),
  };

  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {
    // Create add handlers using CollectionBehavior helper
    this.handleAddEquipment = createAddHandler({
      emptyItem: { name: "", description: "" },
      ItemComponentClass: EquipmentItem,
      character: this.character,
      collectionKey: "equipment",
    });

    this.handleAddArtifact = createAddHandler({
      emptyItem: { name: "", level: "", effect: "" },
      ItemComponentClass: ArtifactItem,
      character: this.character,
      collectionKey: "artifacts",
    });

    this.handleAddOddity = createAddHandler({
      emptyItem: "",
      ItemComponentClass: OddityItem,
      character: this.character,
      collectionKey: "oddities",
    });
  }

  private openEditModal(fieldType: FieldType): void {
    openFieldEditor(fieldType, this.character.shins, (newValue) =>
      this.onFieldUpdate(fieldType, newValue as number)
    );
  }

  render(): TemplateResult {
    // Create item instances using CollectionBehavior helper
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
        <!-- Heading row: Shins Badge (top-left), heading -->
        <div class="section-box-heading-row">
          <div
            class="stat-badge editable-field"
            data-testid="shins-badge"
            @click=${() => this.openEditModal("shins")}
            role="button"
            tabindex="0"
            aria-label=${t("resourceTracker.editShins")}
          >
            <span class="stat-badge-value">${this.character.shins}</span>
            <span class="stat-badge-label">${t("character.shins")}</span>
          </div>

          <h2 class="section-box-heading">${t("items.heading")}</h2>
        </div>

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
              ariaLabel: t("equipment.add"),
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
                  class="section-card-grid"
                  @dragstart=${(e: Event) => this.drag.equipment.handleDragStart(e)}
                  @dragover=${(e: Event) => this.drag.equipment.handleDragOver(e)}
                  @drop=${(e: Event) => this.drag.equipment.handleDrop(e)}
                  @dragend=${() => this.drag.equipment.handleDragEnd()}
                >
                  ${equipmentItems.map((item) => item.render())}
                </div>
              `}
        </div>

        <!-- Divider -->
        <div class="section-divider"></div>

        <!-- Artifacts and Oddities (two columns where the section is wide) -->
        <div class="section-card-grid">
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
                ariaLabel: t("artifacts.add"),
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
                    @dragstart=${(e: Event) => this.drag.artifacts.handleDragStart(e)}
                    @dragover=${(e: Event) => this.drag.artifacts.handleDragOver(e)}
                    @drop=${(e: Event) => this.drag.artifacts.handleDrop(e)}
                    @dragend=${() => this.drag.artifacts.handleDragEnd()}
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
                ariaLabel: t("oddities.add"),
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
                    @dragstart=${(e: Event) => this.drag.oddities.handleDragStart(e)}
                    @dragover=${(e: Event) => this.drag.oddities.handleDragOver(e)}
                    @drop=${(e: Event) => this.drag.oddities.handleDrop(e)}
                    @dragend=${() => this.drag.oddities.handleDragEnd()}
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
