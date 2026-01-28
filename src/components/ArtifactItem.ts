// ArtifactItem component - Displays a single artifact card

import { html, TemplateResult } from "lit-html";
import { Artifact } from "../types/character.js";
import { t } from "../i18n/index.js";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";

export class ArtifactItem {
  private editedArtifact: Artifact;
  public handleEdit: () => void;

  constructor(
    private artifact: Artifact,
    private index: number,
    private onUpdate?: (updated: Artifact) => void,
    private onDelete?: () => void
  ) {
    this.editedArtifact = { ...artifact };
    this.handleEdit = createEditHandler<Artifact>({
      item: this.artifact,
      getEditedItem: () => this.editedArtifact,
      onUpdate: this.onUpdate,
      renderEditableVersion: () => this.renderEditableVersion(),
      resetEditedItem: () => {
        this.editedArtifact = { ...this.artifact };
      },
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
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `artifact-edit-button-${this.index}`,
          deleteButtonTestId: `artifact-delete-button-${this.index}`,
          colorTheme: "purple",
        })}
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
