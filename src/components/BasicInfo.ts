import { html, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { FieldType as ValidationFieldType } from "@/utils/fieldValidation";
import { ModalService, openFieldEditor } from "@/services/modalService";
import { persistCharacterState } from "@/storage/storageFactory";
import { notifyCharacterUpdated } from "./helpers/characterEvents.js";
import { t } from "@/i18n/index";

type FieldType = "name" | "tier" | "descriptor" | "focus" | "currentXp" | "totalXp";

export class BasicInfo {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: string | number) => void
  ) {}

  private handlePortraitUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(t("portrait.notAnImage"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(t("portrait.tooLarge", { maxSize: 2 }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.character.portrait = base64;
      persistCharacterState(this.character);

      const container = document.querySelector('[data-testid="basic-info"]');
      if (container) {
        notifyCharacterUpdated(container, this.character);
      }
    };
    reader.readAsDataURL(file);
  }

  private handlePortraitRemove(): void {
    this.character.portrait = undefined;
    persistCharacterState(this.character);

    const container = document.querySelector('[data-testid="basic-info"]');
    if (container) {
      notifyCharacterUpdated(container, this.character);
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
    persistCharacterState(this.character);

    const container = (e.target as HTMLElement).closest('[data-testid="basic-info"]');
    if (container) {
      notifyCharacterUpdated(container, this.character);
    }
  }

  private openEditModal(fieldType: FieldType): void {
    openFieldEditor(
      fieldType as ValidationFieldType,
      this.character[fieldType],
      async (newValue) => {
        await this.onFieldUpdate(fieldType, newValue);
      }
    );
  }

  render(): TemplateResult {
    return html`
      <div data-testid="basic-info" class="basic-info-card">
        <div class="xp-badge" data-testid="xp-badge">
          <div
            class="xp-badge-cell editable-field"
            data-testid="xp-badge-current"
            @click=${() => this.openEditModal("currentXp")}
            role="button"
            tabindex="0"
            aria-label=${t("character.editCurrentXp")}
          >
            <span class="stat-badge-value">${this.character.currentXp}</span>
            <span class="stat-badge-label">${t("character.xpCurrent")}</span>
          </div>
          <div
            class="xp-badge-cell editable-field"
            data-testid="xp-badge-total"
            @click=${() => this.openEditModal("totalXp")}
            role="button"
            tabindex="0"
            aria-label=${t("character.editTotalXp")}
          >
            <span class="stat-badge-value">${this.character.totalXp}</span>
            <span class="stat-badge-label">${t("character.xpTotal")}</span>
          </div>
        </div>

        <div class="character-info-content">
          <div
            data-testid="character-name"
            class="character-name editable-field"
            @click=${() => this.openEditModal("name")}
            role="button"
            tabindex="0"
            aria-label=${t("character.editName")}
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
              aria-label=${t("character.editTier")}
              >${this.character.tier}</span
            >
            <span
              class="char-descriptor editable-field"
              data-testid="character-descriptor"
              @click=${() => this.openEditModal("descriptor")}
              role="button"
              tabindex="0"
              aria-label=${t("character.editDescriptor")}
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
              aria-label=${t("character.editFocus")}
              >${this.character.focus || t("character.focus")}</span
            >
          </div>
        </div>

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
