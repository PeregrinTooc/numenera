// BottomTextFields component - Editable Background and Notes fields

import { html, render, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { t } from "../i18n/index.js";
import { saveCharacterState } from "../storage/localStorage.js";
/* global MouseEvent, Event, HTMLTextAreaElement, CustomEvent */

export class BottomTextFields {
  private editingField: "background" | "notes" | null = null;
  private container: HTMLElement;

  constructor(
    private character: Character,
    container: HTMLElement
  ) {
    this.container = container;

    // Bind methods to preserve 'this' context
    this.startEditing = this.startEditing.bind(this);
    this.saveField = this.saveField.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.rerender = this.rerender.bind(this);

    // Initial render
    this.rerender();
  }

  private startEditing(field: "background" | "notes"): void {
    this.editingField = field;
    this.rerender();

    // Focus the textarea after render
    setTimeout(() => {
      const textarea = this.container?.querySelector<HTMLTextAreaElement>(
        `[data-testid="character-${field}"]`
      );
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  }

  private saveField(_field: "background" | "notes"): void {
    // Save to character state
    saveCharacterState(this.character);

    // Dispatch character-updated event
    const event = new CustomEvent("character-updated", {
      detail: this.character,
      bubbles: true,
      composed: true,
    });

    if (this.container) {
      this.container.dispatchEvent(event);
    }

    // Exit edit mode
    this.editingField = null;
    this.rerender();
  }

  private handleClick(e: MouseEvent, field: "background" | "notes"): void {
    const textarea = e.target as HTMLTextAreaElement;
    if (textarea.hasAttribute("readonly")) {
      this.startEditing(field);
    }
  }

  private rerender(): void {
    // Re-render this component directly
    render(this.render(), this.container);
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
