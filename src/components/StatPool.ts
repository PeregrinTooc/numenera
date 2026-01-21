// StatPool component - Displays a single stat pool (Might, Speed, or Intellect)

import { html, TemplateResult } from "lit-html";

export class StatPool {
  constructor(
    private name: string,
    private pool: number,
    private edge: number,
    private current: number
  ) {}

  render(): TemplateResult {
    const nameLower = this.name.toLowerCase();
    return html`
      <div data-testid="stat-${nameLower}" class="border rounded p-4">
        <h3 data-testid="stat-${nameLower}-label" class="text-lg font-semibold mb-2">
          ${this.name}
        </h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label data-testid="label-${nameLower}-pool" class="text-sm text-gray-600">Pool:</label>
            <div data-testid="stat-${nameLower}-pool" class="text-lg font-medium">${this.pool}</div>
          </div>
          <div>
            <label data-testid="label-${nameLower}-edge" class="text-sm text-gray-600">Edge:</label>
            <div data-testid="stat-${nameLower}-edge" class="text-lg font-medium">${this.edge}</div>
          </div>
          <div>
            <label data-testid="label-${nameLower}-current" class="text-sm text-gray-600"
              >Current:</label
            >
            <div data-testid="stat-${nameLower}-current" class="text-lg font-medium">
              ${this.current}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
