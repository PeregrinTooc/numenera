// BasicInfo component - Displays character basic information

import { html, render, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { t } from "../i18n/index.js";
import { EditFieldModal } from "./EditFieldModal.js";

type FieldType = "name" | "tier" | "descriptor" | "focus";

export class BasicInfo {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: string | number) => void
  ) {}

  private openEditModal(fieldType: FieldType): void {
    const currentValue =
      fieldType === "tier"
        ? this.character.tier
        : fieldType === "name"
          ? this.character.name
          : fieldType === "descriptor"
            ? this.character.descriptor
            : this.character.focus;

    // Create modal element and append to body
    const modalContainer = document.createElement("div");
    document.body.appendChild(modalContainer);

    const modal = new EditFieldModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue);
        document.body.removeChild(modalContainer);
      },
      onCancel: () => {
        document.body.removeChild(modalContainer);
      },
    });

    // Render modal into the container
    render(modal.render(), modalContainer);

    // Focus the input field after render
    setTimeout(() => {
      const input = modalContainer.querySelector<HTMLInputElement>(
        '[data-testid="edit-modal-input"]'
      );
      if (input) {
        input.focus();
        // Select all text for easier editing
        input.select();
      }
    }, 0);
  }

  render(): TemplateResult {
    return html`
      <div data-testid="basic-info" class="basic-info-card">
        <!-- XP Badge - top-left corner -->
        <div class="xp-badge stat-badge">
          <span class="stat-badge-value">${this.character.xp}</span>
          <span class="stat-badge-label">${t("character.xp")}</span>
        </div>

        <!-- Character info content - left side -->
        <div class="character-info-content">
          <!-- Large character name - EDITABLE -->
          <div
            data-testid="character-name"
            class="character-name editable-field"
            @click=${() => this.openEditModal("name")}
            role="button"
            tabindex="0"
            aria-label="Edit character name"
          >
            ${this.character.name}
          </div>

          <!-- Numenera sentence format: "A tier 3 Strong Glaive who Bears a Halo of Fire" -->
          <div class="character-sentence">
            ${t("character.sentence.prefix")}
            <span
              class="char-tier editable-field"
              data-testid="character-tier"
              @click=${() => this.openEditModal("tier")}
              role="button"
              tabindex="0"
              aria-label="Edit tier"
              >${this.character.tier}</span
            >
            <span
              class="char-descriptor editable-field"
              data-testid="character-descriptor"
              @click=${() => this.openEditModal("descriptor")}
              role="button"
              tabindex="0"
              aria-label="Edit descriptor"
              >${this.character.descriptor}</span
            >
            <span class="char-type" data-testid="character-type">${this.character.type}</span>
            ${t("character.sentence.connector")}
            <span
              class="char-focus editable-field"
              data-testid="character-focus"
              @click=${() => this.openEditModal("focus")}
              role="button"
              tabindex="0"
              aria-label="Edit focus"
              >${this.character.focus}</span
            >
          </div>
        </div>

        <!-- Character portrait - RIGHT side, 3:4 ratio (150×200px) -->
        <div class="character-portrait">
          <span class="character-portrait-text">${t("character.portrait")}</span>
        </div>
      </div>
    `;
  }
}
