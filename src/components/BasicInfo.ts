// BasicInfo component - Displays character basic information

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { FieldType as ValidationFieldType } from "../utils/unified-validation.js";
import { ModalService } from "../services/modalService.js";
import { saveCharacterState } from "../storage/localStorage.js";
import { getVersionHistoryService } from "../services/versionHistoryServiceAccess.js";
import { t } from "../i18n/index.js";

type FieldType = "name" | "tier" | "descriptor" | "focus" | "xp";

export class BasicInfo {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: string | number) => void
  ) {}

  private handlePortraitUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image file is too large. Maximum size is 2MB.");
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.character.portrait = base64;
      saveCharacterState(this.character);

      // Dispatch character-updated event
      const event = new CustomEvent("character-updated", {
        detail: this.character,
        bubbles: true,
        composed: true,
      });

      const container = document.querySelector('[data-testid="basic-info"]');
      if (container) {
        container.dispatchEvent(event);
      }
    };
    reader.readAsDataURL(file);
  }

  private handlePortraitRemove(): void {
    this.character.portrait = undefined;
    saveCharacterState(this.character);

    // Dispatch character-updated event
    const event = new CustomEvent("character-updated", {
      detail: this.character,
      bubbles: true,
      composed: true,
    });

    const container = document.querySelector('[data-testid="basic-info"]');
    if (container) {
      container.dispatchEvent(event);
    }
  }

  private handlePortraitClick(): void {
    if (this.character.portrait) {
      ModalService.openPortraitModal(this.character.portrait);
    }
  }

  private handleTypeChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this.character.type = select.value as "Nano" | "Glaive" | "Jack";
    saveCharacterState(this.character);

    // Dispatch character-updated event
    const event = new CustomEvent("character-updated", {
      detail: this.character,
      bubbles: true,
      composed: true,
    });

    // Find the container element to dispatch from
    const container = (e.target as HTMLElement).closest('[data-testid="basic-info"]');
    if (container) {
      container.dispatchEvent(event);
    }
  }

  private openEditModal(fieldType: FieldType): void {
    const currentValue =
      fieldType === "name"
        ? this.character.name
        : fieldType === "tier"
          ? this.character.tier
          : fieldType === "descriptor"
            ? this.character.descriptor
            : fieldType === "focus"
              ? this.character.focus
              : this.character.xp;

    ModalService.openEditModal({
      fieldType: fieldType as ValidationFieldType,
      currentValue,
      onConfirm: async (newValue) => {
        await this.onFieldUpdate(fieldType, newValue);
      },
      versionHistoryService: getVersionHistoryService(),
    });
  }

  render(): TemplateResult {
    return html`
      <div data-testid="basic-info" class="basic-info-card">
        <!-- XP Badge - top-left corner -->
        <div
          class="xp-badge stat-badge editable-field"
          data-testid="xp-badge"
          @click=${() => this.openEditModal("xp")}
          role="button"
          tabindex="0"
          aria-label="Edit XP"
        >
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
              >${this.character.descriptor || t("character.descriptor")}</span
            >
            <select
              class="char-type-select"
              data-testid="character-type-select"
              @change=${this.handleTypeChange.bind(this)}
              .value=${this.character.type}
              aria-label=${t("character.type.label")}
            >
              <option value="Nano">${t("character.type.nano")}</option>
              <option value="Glaive">${t("character.type.glaive")}</option>
              <option value="Jack">${t("character.type.jack")}</option>
            </select>
            ${t("character.sentence.connector")}
            <span
              class="char-focus editable-field"
              data-testid="character-focus"
              @click=${() => this.openEditModal("focus")}
              role="button"
              tabindex="0"
              aria-label="Edit focus"
              >${this.character.focus || t("character.focus")}</span
            >
          </div>
        </div>

        <!-- Character portrait - RIGHT side, 3:4 ratio (150×200px) -->
        <div class="character-portrait" data-testid="character-portrait">
          ${this.character.portrait
            ? html`
                <img
                  src="${this.character.portrait}"
                  alt="${t("character.portrait")}"
                  class="portrait-image"
                  @click=${this.handlePortraitClick.bind(this)}
                  style="cursor: pointer;"
                  role="button"
                  tabindex="0"
                  aria-label="${t("character.portraitView")}"
                  data-testid="portrait-image-clickable"
                />
                <div class="portrait-overlay">
                  <label class="portrait-button portrait-change">
                    <input
                      type="file"
                      accept="image/*"
                      @change=${this.handlePortraitUpload.bind(this)}
                      style="display: none;"
                      data-testid="portrait-file-input"
                    />
                    ${t("character.portraitChange")}
                  </label>
                  <button
                    class="portrait-button portrait-remove"
                    @click=${this.handlePortraitRemove.bind(this)}
                    data-testid="portrait-remove-button"
                  >
                    ${t("character.portraitRemove")}
                  </button>
                </div>
              `
            : html`
                <span class="character-portrait-text">${t("character.portrait")}</span>
                <label class="portrait-button portrait-upload">
                  <input
                    type="file"
                    accept="image/*"
                    @change=${this.handlePortraitUpload.bind(this)}
                    style="display: none;"
                    data-testid="portrait-file-input"
                  />
                  ${t("character.portraitUpload")}
                </label>
              `}
        </div>
      </div>
    `;
  }
}
