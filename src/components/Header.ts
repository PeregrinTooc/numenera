// Header component - Displays page header with Load/Clear buttons

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class Header {
  constructor(
    private onLoad: () => void,
    private onNew: () => void,
    private onImport: () => void
  ) {}

  render(): TemplateResult {
    return html`
      <div data-testid="character-header" class="character-header">
        <h1 data-testid="page-title" class="page-title">${t("app.title")}</h1>
        <div class="title-underline"></div>
        <div class="header-buttons">
          <button data-testid="load-button" @click=${this.onLoad} class="btn-load">
            ${t("buttons.load")}
          </button>
          <button data-testid="import-button" @click=${this.onImport} class="btn-import">
            ${t("buttons.import")}
          </button>
          <button data-testid="new-button" @click=${this.onNew} class="btn-new">
            ${t("buttons.new")}
          </button>
        </div>
      </div>
    `;
  }
}
