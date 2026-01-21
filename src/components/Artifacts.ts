// Artifacts component - Displays artifacts section with list of artifacts

import { html, TemplateResult } from "lit-html";
import { Artifact } from "../types/character.js";
import { ArtifactItem } from "./ArtifactItem.js";

export class Artifacts {
  constructor(private artifacts: Artifact[]) {}

  render(): TemplateResult {
    return html`
      <div data-testid="artifacts-section" class="mt-8">
        <h2 data-testid="artifacts-heading" class="text-2xl font-bold mb-4">Artifacts</h2>
        <div data-testid="artifacts-list" class="space-y-3">
          ${this.artifacts.length === 0
            ? html`<div
                data-testid="empty-artifacts"
                class="text-gray-500 italic p-3 border rounded"
              >
                No artifacts
              </div>`
            : this.artifacts.map((artifact) => new ArtifactItem(artifact).render())}
        </div>
      </div>
    `;
  }
}
