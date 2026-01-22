// ArtifactItem component - Displays a single artifact card

import { html, TemplateResult } from "lit-html";
import { Artifact } from "../types/character.js";
import { t } from "../i18n/index.js";

export class ArtifactItem {
  constructor(private artifact: Artifact) {}

  render(): TemplateResult {
    return html`
      <div data-testid="artifact-item" class="artifact-item-card">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div data-testid="artifact-name-${this.artifact.name}" class="artifact-name">
              ${this.artifact.name}
            </div>
            <div class="artifact-effect">${this.artifact.effect}</div>
          </div>
          <div data-testid="artifact-level-${this.artifact.name}" class="artifact-level-badge ml-3">
            ${t("artifacts.level")}: ${this.artifact.level}
          </div>
        </div>
      </div>
    `;
  }
}
