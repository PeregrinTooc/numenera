// Header component - Displays page header with Load/Clear buttons

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class Header {
  constructor(
    private onLoad: () => void,
    private onClear: () => void
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
          <button data-testid="clear-button" @click=${this.onClear} class="btn-clear">
            ${t("buttons.clear")}
          </button>
        </div>
      </div>
    `;
  }
}
