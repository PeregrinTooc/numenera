// ArtifactItem component - Displays a single artifact card

import { html, TemplateResult } from "lit-html";
import { Artifact } from "../types/character.js";

export class ArtifactItem {
  constructor(private artifact: Artifact) {}

  render(): TemplateResult {
    return html`
      <div data-testid="artifact-item" class="border rounded p-3">
        <div class="flex justify-between items-start">
          <div>
            <div data-testid="artifact-name-${this.artifact.name}" class="font-semibold">
              ${this.artifact.name}
            </div>
            <div class="text-sm text-gray-600">${this.artifact.effect}</div>
          </div>
          <div
            data-testid="artifact-level-${this.artifact.name}"
            class="text-sm font-medium bg-gray-100 px-2 py-1 rounded"
          >
            Level: ${this.artifact.level}
          </div>
        </div>
      </div>
    `;
  }
}
