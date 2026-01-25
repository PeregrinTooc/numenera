// ArtifactItem component - Displays a single artifact card
/* global Event, HTMLTextAreaElement */

import { html, TemplateResult } from "lit-html";
import { Artifact } from "../types/character.js";
import { t } from "../i18n/index.js";
import { openCardEditModal } from "./CardEditModal.js";

export class ArtifactItem {
  private editedArtifact: Artifact;

  constructor(
    private artifact: Artifact,
    private index: number,
    private onUpdate?: (updated: Artifact) => void,
    private onDelete?: () => void
  ) {
    this.editedArtifact = { ...artifact };
  }

  public handleEdit(): void {
    this.editedArtifact = { ...this.artifact };
    openCardEditModal({
      content: this.renderEditableVersion(),
      onConfirm: () => {
        if (this.onUpdate) {
          this.onUpdate(this.editedArtifact);
        }
      },
      onCancel: () => {},
    });
  }

  private renderEditableVersion(): TemplateResult {
    return html`
      <div class="card-edit-wrapper">
        <div
          class="artifact-item-card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("artifacts.name")}
            </label>
            <input
              type="text"
              data-testid="edit-artifact-name"
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-purple-900 font-semibold"
              .value=${this.editedArtifact.name}
              @input=${(e: Event) => {
                this.editedArtifact.name = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("artifacts.level")}
            </label>
            <input
              type="text"
              data-testid="edit-artifact-level"
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-purple-900 font-semibold"
              .value=${this.editedArtifact.level}
              @input=${(e: Event) => {
                this.editedArtifact.level = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("artifacts.effect")}
            </label>
            <textarea
              data-testid="edit-artifact-effect"
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-gray-700"
              rows="3"
              .value=${this.editedArtifact.effect}
              @input=${(e: Event) => {
                this.editedArtifact.effect = (e.target as HTMLTextAreaElement).value;
              }}
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div data-testid="artifact-item-${this.artifact.name}" class="artifact-item-card relative">
        ${this.onDelete
          ? html`
              <button
                @click=${() => this.onDelete?.()}
                class="absolute top-2 left-2 p-2 text-purple-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                data-testid="artifact-delete-button-${this.index}"
                aria-label="${t("cards.delete")}"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10 11v6M14 11v6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            `
          : ""}
        ${this.onUpdate
          ? html`
              <button
                @click=${() => this.handleEdit()}
                class="absolute top-2 right-2 p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-full transition-colors"
                data-testid="artifact-edit-button-${this.index}"
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
        <div class="flex justify-between items-start pr-8 pl-8">
          <div class="flex-1">
            <div data-testid="artifact-name-${this.artifact.name}" class="artifact-name">
              ${this.artifact.name}
            </div>
            <div class="artifact-effect">${this.artifact.effect}</div>
          </div>
          <div class="artifact-level-badge" data-testid="artifact-level-${this.artifact.name}">
            ${t("artifacts.level")}: ${this.artifact.level}
          </div>
        </div>
      </div>
    `;
  }
}
