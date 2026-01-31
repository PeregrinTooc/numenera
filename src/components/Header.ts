// Header component - Displays page header with Load/Clear buttons

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class Header {
  private hasRememberedLocation: boolean = false;
  private supportsFileSystemAccess: boolean = false;

  constructor(
    private onLoad: () => void,
    private onNew: () => void,
    private onImport: () => void,
    private onExport: () => void,
    private onQuickExport?: () => void,
    private onSaveAs?: () => void
  ) {
    // Initialize feature detection state
    this.supportsFileSystemAccess = "showSaveFilePicker" in window;

    // Listen for export handle updates
    window.addEventListener("export-handle-updated", () => {
      this.updateButtonState();
    });
  }

  updateButtonState(): void {
    // This will be called externally when the export manager state changes
    // The component will be re-rendered by the parent
  }

  setHasRememberedLocation(hasLocation: boolean): void {
    this.hasRememberedLocation = hasLocation;
  }

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
          ${this.renderExportButtons()}
          <button data-testid="new-button" @click=${this.onNew} class="btn-new">
            ${t("buttons.new")}
          </button>
        </div>
      </div>
    `;
  }

  private renderExportButtons(): TemplateResult {
    // Non-Chromium browsers: Always show only "Export"
    if (!this.supportsFileSystemAccess) {
      return html`
        <button data-testid="export-button" @click=${this.onExport} class="btn-export">
          ${t("buttons.export")}
        </button>
      `;
    }

    // Chromium browsers without remembered location: Show only "Export"
    if (!this.hasRememberedLocation) {
      return html`
        <button data-testid="export-button" @click=${this.onExport} class="btn-export">
          ${t("buttons.export")}
        </button>
      `;
    }

    // Chromium browsers with remembered location: Show "Quick Export" + "Save As..."
    return html`
      <button
        data-testid="quick-export-button"
        @click=${this.onQuickExport}
        class="btn-quick-export"
      >
        ${t("buttons.quickExport")}
      </button>
      <button data-testid="save-as-button" @click=${this.onSaveAs} class="btn-save-as">
        ${t("buttons.saveAs")}
      </button>
    `;
  }
}
