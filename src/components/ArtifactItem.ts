// ArtifactItem component - Displays a single artifact card

import { html, TemplateResult } from "lit-html";
import { Artifact } from "@/types/character";
import { t } from "@/i18n/index";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";
import { renderTextArea, renderTextField } from "./helpers/cardFormFields.js";

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
    const theme = "purple";
    return html`
      <div class="card-edit-wrapper">
        <div
          class="artifact-item-card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4"
        >
          ${renderTextField({
            theme,
            label: t("artifacts.name"),
            testId: "edit-artifact-name",
            value: this.editedArtifact.name,
            onInput: (value) => {
              this.editedArtifact.name = value;
            },
          })}
          ${renderTextField({
            theme,
            label: t("artifacts.level"),
            testId: "edit-artifact-level",
            value: this.editedArtifact.level,
            onInput: (value) => {
              this.editedArtifact.level = value;
            },
          })}
          ${renderTextArea({
            theme,
            label: t("artifacts.effect"),
            testId: "edit-artifact-effect",
            value: this.editedArtifact.effect,
            onInput: (value) => {
              this.editedArtifact.effect = value;
            },
          })}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div
        data-testid="artifact-item"
        data-index="${this.index}"
        class="artifact-item-card relative"
        draggable="true"
      >
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
