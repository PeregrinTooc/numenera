// ItemsBox component - Combines Equipment, Artifacts, and Oddities in a single box with Shins badge

import { html, TemplateResult } from "lit-html";
import { Character, EquipmentItem as EquipmentItemType, Artifact } from "../types/character.js";
import { EquipmentItem } from "./EquipmentItem.js";
import { ArtifactItem } from "./ArtifactItem.js";
import { OddityItem } from "./OddityItem.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";
import { saveCharacterState } from "../storage/localStorage.js";

type FieldType = "shins";

export class ItemsBox {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {}

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.shins;

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
      },
    });
  }

  private handleAddEquipment(): void {
    const emptyEquipment: EquipmentItemType = { name: "", description: "" };
    const tempItem = new EquipmentItem(emptyEquipment, -1, (updated) => {
      this.character.equipment.push(updated);
      saveCharacterState(this.character);
      const event = new CustomEvent("character-updated");
      document.getElementById("app")?.dispatchEvent(event);
    });
    tempItem.handleEdit();
  }

  private handleAddArtifact(): void {
    const emptyArtifact: Artifact = { name: "", level: "", effect: "" };
    const tempItem = new ArtifactItem(emptyArtifact, -1, (updated) => {
      this.character.artifacts.push(updated);
      saveCharacterState(this.character);
      const event = new CustomEvent("character-updated");
      document.getElementById("app")?.dispatchEvent(event);
    });
    tempItem.handleEdit();
  }

  private handleAddOddity(): void {
    const emptyOddity = "";
    const tempItem = new OddityItem(emptyOddity, -1, (updated) => {
      this.character.oddities.push(updated);
      saveCharacterState(this.character);
      const event = new CustomEvent("character-updated");
      document.getElementById("app")?.dispatchEvent(event);
    });
    tempItem.handleEdit();
  }

  render(): TemplateResult {
    const equipmentItems = this.character.equipment.map(
      (item, index) =>
        new EquipmentItem(
          item,
          index,
          (updated) => {
            this.character.equipment[index] = updated;
            saveCharacterState(this.character);
            // Trigger re-render via character-updated event
            const event = new CustomEvent("character-updated");
            document.getElementById("app")?.dispatchEvent(event);
          },
          () => {
            // Delete handler: filter out the equipment at this index
            this.character.equipment = this.character.equipment.filter((_, i) => i !== index);
            saveCharacterState(this.character);
            // Trigger re-render via character-updated event
            const event = new CustomEvent("character-updated");
            document.getElementById("app")?.dispatchEvent(event);
          }
        )
    );

    const artifactItems = this.character.artifacts.map(
      (artifact, index) =>
        new ArtifactItem(
          artifact,
          index,
          (updated) => {
            this.character.artifacts[index] = updated;
            saveCharacterState(this.character);
            // Trigger re-render via character-updated event
            const event = new CustomEvent("character-updated");
            document.getElementById("app")?.dispatchEvent(event);
          },
          () => {
            // Delete handler: filter out the artifact at this index
            this.character.artifacts = this.character.artifacts.filter((_, i) => i !== index);
            saveCharacterState(this.character);
            // Trigger re-render via character-updated event
            const event = new CustomEvent("character-updated");
            document.getElementById("app")?.dispatchEvent(event);
          }
        )
    );

    const oddityItems = this.character.oddities.map(
      (oddity, index) =>
        new OddityItem(
          oddity,
          index,
          (updated) => {
            this.character.oddities[index] = updated;
            saveCharacterState(this.character);
            // Trigger re-render via character-updated event
            const event = new CustomEvent("character-updated");
            document.getElementById("app")?.dispatchEvent(event);
          },
          () => {
            // Delete handler: filter out the oddity at this index
            this.character.oddities = this.character.oddities.filter((_, i) => i !== index);
            saveCharacterState(this.character);
            // Trigger re-render via character-updated event
            const event = new CustomEvent("character-updated");
            document.getElementById("app")?.dispatchEvent(event);
          }
        )
    );

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
            <button
              @click=${() => this.handleAddEquipment()}
              data-testid="add-equipment-button"
              class="add-card-button"
              aria-label="Add equipment"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          ${this.character.equipment.length === 0
            ? html`
                <div data-testid="empty-equipment" class="empty-equipment-styled">
                  <p>${t("equipment.empty")}</p>
                </div>
              `
            : html`
                <div data-testid="equipment-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <button
                @click=${() => this.handleAddArtifact()}
                data-testid="add-artifact-button"
                class="add-card-button"
                aria-label="Add artifact"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
            ${this.character.artifacts.length === 0
              ? html`
                  <div data-testid="empty-artifacts" class="empty-artifacts-styled">
                    <p>${t("artifacts.empty")}</p>
                  </div>
                `
              : html`
                  <div data-testid="artifacts-list" class="space-y-4">
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
              <button
                @click=${() => this.handleAddOddity()}
                data-testid="add-oddity-button"
                class="add-card-button"
                aria-label="Add oddity"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
            ${this.character.oddities.length === 0
              ? html`
                  <div data-testid="empty-oddities" class="empty-oddities-styled">
                    <p>${t("oddities.empty")}</p>
                  </div>
                `
              : html`
                  <div data-testid="oddities-list" class="space-y-3">
                    ${oddityItems.map((item) => item.render())}
                  </div>
                `}
          </div>
        </div>
      </div>
    `;
  }
}
