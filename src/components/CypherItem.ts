// CypherItem component - Displays a single cypher card
/* global HTMLTextAreaElement, Event */

import { html, TemplateResult } from "lit-html";
import { Cypher } from "../types/character.js";
import { t } from "../i18n/index.js";
import { openCardEditModal } from "./CardEditModal.js";

export class CypherItem {
  private editedCypher: Cypher;

  constructor(
    private cypher: Cypher,
    private index: number,
    private onUpdate?: (updated: Cypher) => void
  ) {
    this.editedCypher = { ...cypher };
  }

  private handleEdit(): void {
    this.editedCypher = { ...this.cypher };
    openCardEditModal({
      content: this.renderEditableVersion(),
      onConfirm: () => {
        if (this.onUpdate) {
          this.onUpdate(this.editedCypher);
        }
      },
      onCancel: () => {},
    });
  }

  private renderEditableVersion(): TemplateResult {
    return html`
      <div class="card-edit-wrapper">
        <div
          class="cypher-item-card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("cyphers.name")}
            </label>
            <input
              type="text"
              .value=${this.editedCypher.name}
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.editedCypher.name = target.value;
              }}
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-purple-900 font-semibold"
              placeholder="${t("cyphers.name")}"
              data-testid="edit-cypher-name"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("cyphers.level")}
            </label>
            <input
              type="number"
              .value=${this.editedCypher.level.toString()}
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.editedCypher.level = target.value || "1";
              }}
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-purple-900 font-semibold"
              data-testid="edit-cypher-level"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("cyphers.effect")}
            </label>
            <textarea
              .value=${this.editedCypher.effect}
              @input=${(e: Event) => {
                const target = e.target as HTMLTextAreaElement;
                this.editedCypher.effect = target.value;
              }}
              rows="3"
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-gray-700"
              placeholder="${t("cyphers.effect")}"
              data-testid="edit-cypher-effect"
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div data-testid="cypher-item" class="cypher-item-card relative">
        ${this.onUpdate
          ? html`
              <button
                @click=${() => this.handleEdit()}
                class="absolute top-2 right-2 p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-full transition-colors"
                data-testid="cypher-edit-button-${this.index}"
                aria-label="${t("cards.edit")}"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            `
          : ""}
        <div class="flex justify-between items-start mb-2 pr-8">
          <div class="flex-1">
            <div data-testid="cypher-name-${this.cypher.name}" class="font-semibold text-lg">
              ⚡ ${this.cypher.name}
            </div>
            <div class="text-sm text-gray-700 mt-1">${this.cypher.effect}</div>
          </div>
          <div data-testid="cypher-level-${this.cypher.name}" class="cypher-level-badge ml-3">
            ${t("cyphers.level")}: ${this.cypher.level}
          </div>
        </div>
        <div data-testid="cypher-warning" class="cypher-warning">⚠️ ONE-USE</div>
      </div>
    `;
  }
}
