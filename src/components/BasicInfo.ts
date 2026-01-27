// BasicInfo component - Displays character basic information

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { t } from "../i18n/index.js";
import { ModalService } from "../services/modalService.js";
import { saveCharacterState } from "../storage/localStorage.js";
/* global Event, HTMLSelectElement, CustomEvent */

type FieldType = "name" | "tier" | "descriptor" | "focus" | "xp";

export class BasicInfo {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: string | number) => void
  ) {}

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
      fieldType === "tier"
        ? this.character.tier
        : fieldType === "name"
          ? this.character.name
          : fieldType === "descriptor"
            ? this.character.descriptor
            : fieldType === "focus"
              ? this.character.focus
              : this.character.xp;

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue);
      },
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
        <div class="character-portrait">
          <span class="character-portrait-text">${t("character.portrait")}</span>
        </div>
      </div>
    `;
  }
}
