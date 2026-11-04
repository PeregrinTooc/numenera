// BottomTextFields component - Editable Background and Notes fields

import { html, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { t } from "@/i18n/index";

type TextField = keyof Character["textFields"];

export class BottomTextFields {
  private editingField: TextField | null = null;

  constructor(private character: Character) {}

  /**
   * Make the field editable before the press focuses it. iOS and iPadOS decide
   * whether to raise the on-screen keyboard at the moment a field takes focus,
   * so a field still readonly then gets no keyboard, even once it turns
   * editable. mousedown precedes that focus for a click and a tap alike, and
   * unlike touchstart it does not fire when a touch scrolls the page.
   */
  private makeEditable(e: MouseEvent): void {
    (e.currentTarget as HTMLTextAreaElement).readOnly = false;
  }

  private startEditing(e: Event, field: TextField): void {
    this.editingField = field;
    (e.currentTarget as HTMLTextAreaElement).readOnly = false;
  }

  private saveField(e: Event, field: TextField): void {
    if (this.editingField !== field) return;
    this.editingField = null;

    const textarea = e.currentTarget as HTMLTextAreaElement;
    textarea.readOnly = true;
    textarea.dispatchEvent(
      new CustomEvent("character-updated", {
        detail: this.character,
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderField(field: TextField, label: string, placeholder: string): TemplateResult {
    return html`
      <div data-testid="${field}-section" class="section-box">
        <h3 class="text-lg font-bold mb-2 text-amber-900">${label}</h3>
        <textarea
          data-testid="character-${field}"
          class="inline-edit-textarea"
          .value=${this.character.textFields[field]}
          ?readonly=${this.editingField !== field}
          placeholder=${placeholder}
          @input=${(e: Event) => {
            this.character.textFields[field] = (e.target as HTMLTextAreaElement).value;
          }}
          @mousedown=${(e: MouseEvent) => this.makeEditable(e)}
          @focus=${(e: Event) => this.startEditing(e, field)}
          @blur=${(e: Event) => this.saveField(e, field)}
        ></textarea>
      </div>
    `;
  }

  /**
   * Render the background field only (for layout system)
   */
  renderBackground(): TemplateResult {
    return this.renderField(
      "background",
      t("textFields.background.label"),
      t("textFields.background.placeholder")
    );
  }

  /**
   * Render the notes field only (for layout system)
   */
  renderNotes(): TemplateResult {
    return this.renderField(
      "notes",
      t("textFields.notes.label"),
      t("textFields.notes.placeholder")
    );
  }

  render(): TemplateResult {
    return html`
      <div class="bottom-text-fields">${this.renderBackground()} ${this.renderNotes()}</div>
    `;
  }
}
