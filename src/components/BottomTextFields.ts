// BottomTextFields component - Editable Background and Notes fields

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { t } from "../i18n/index.js";
import { saveCharacterState } from "../storage/localStorage.js";
/* global MouseEvent, Event, HTMLTextAreaElement */

export class BottomTextFields {
  private editingField: "background" | "notes" | null = null;

  constructor(private character: Character) {
    // Bind methods to preserve 'this' context
    this.startEditing = this.startEditing.bind(this);
    this.saveField = this.saveField.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  private startEditing(field: "background" | "notes"): void {
    console.log("startEditing called for field:", field);
    this.editingField = field;

    // Directly manipulate the DOM to remove readonly
    const textarea = document.querySelector<HTMLTextAreaElement>(
      `[data-testid="character-${field}"]`
    );
    console.log("Found textarea:", textarea);
    if (textarea) {
      console.log("Removing readonly attribute");
      textarea.removeAttribute("readonly");
      textarea.focus();
      console.log("Textarea focused, readonly removed");
    }
  }

  private saveField(field: "background" | "notes"): void {
    // Save to character state
    saveCharacterState(this.character);

    // Exit edit mode
    this.editingField = null;

    // Directly manipulate the DOM to add readonly back
    const textarea = document.querySelector<HTMLTextAreaElement>(
      `[data-testid="character-${field}"]`
    );
    if (textarea) {
      textarea.setAttribute("readonly", "");
    }
  }

  private handleClick(e: MouseEvent, field: "background" | "notes"): void {
    console.log("handleClick called for field:", field);
    const textarea = e.target as HTMLTextAreaElement;
    const hasReadonly = textarea.hasAttribute("readonly");
    console.log("Has readonly attribute:", hasReadonly);
    if (hasReadonly) {
      console.log("Calling startEditing for field:", field);
      this.startEditing(field);
    }
  }

  render(): TemplateResult {
    return html`
      <div class="bottom-text-fields">
        <!-- Background Field -->
        <div class="parchment-field">
          <h3 class="text-lg font-bold mb-2 text-amber-900">${t("textFields.background.label")}</h3>
          <textarea
            data-testid="character-background"
            class="inline-edit-textarea"
            .value=${this.character.textFields.background}
            ?readonly=${this.editingField !== "background"}
            placeholder=${this.editingField === "background"
              ? t("textFields.background.placeholder")
              : ""}
            @input=${(e: Event) => {
              const target = e.target as HTMLTextAreaElement;
              this.character.textFields.background = target.value;
            }}
            @blur=${() => {
              if (this.editingField === "background") {
                this.saveField("background");
              }
            }}
            @click=${(e: MouseEvent) => this.handleClick(e, "background")}
          ></textarea>
        </div>

        <!-- Notes Field -->
        <div class="parchment-field">
          <h3 class="text-lg font-bold mb-2 text-amber-900">${t("textFields.notes.label")}</h3>
          <textarea
            data-testid="character-notes"
            class="inline-edit-textarea"
            .value=${this.character.textFields.notes}
            ?readonly=${this.editingField !== "notes"}
            placeholder=${this.editingField === "notes" ? t("textFields.notes.placeholder") : ""}
            @input=${(e: Event) => {
              const target = e.target as HTMLTextAreaElement;
              this.character.textFields.notes = target.value;
            }}
            @blur=${() => {
              if (this.editingField === "notes") {
                this.saveField("notes");
              }
            }}
            @click=${(e: MouseEvent) => this.handleClick(e, "notes")}
          ></textarea>
        </div>
      </div>
    `;
  }
}
