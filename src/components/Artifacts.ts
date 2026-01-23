// Artifacts component - Displays artifacts section with list of artifacts

import { html, TemplateResult } from "lit-html";
import { Artifact } from "../types/character.js";
import { ArtifactItem } from "./ArtifactItem.js";
import { t } from "../i18n/index.js";

export class Artifacts {
  constructor(private artifacts: Artifact[]) {}

  render(): TemplateResult {
    return html`
      <div data-testid="artifacts-section" class="mt-8">
        <h2 data-testid="artifacts-heading" class="text-2xl font-serif font-bold mb-4">
          ${t("artifacts.heading")}
        </h2>
        <div data-testid="artifacts-list" class="space-y-3">
          ${this.artifacts.length === 0
            ? html`<div data-testid="empty-artifacts" class="empty-artifacts-styled">
                ${t("artifacts.empty")}
              </div>`
            : this.artifacts.map((artifact) => new ArtifactItem(artifact).render())}
        </div>
      </div>
    `;
  }
}
