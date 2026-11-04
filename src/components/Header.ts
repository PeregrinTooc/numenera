import { html, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";
import { SettingsGear } from "./SettingsGear.js";

export class Header {
  private hasRememberedLocation: boolean = false;
  private supportsFileSystemAccess: boolean = false;
  private isViewingOldVersion: boolean = false;
  private settingsGear: SettingsGear;

  constructor(
    private onLoad: () => void,
    private onNew: () => void,
    private onImport: () => void,
    private onExport: () => void,
    private onQuickExport?: () => void,
    private onSaveAs?: () => void,
    onLanguageChange?: (lang: string) => void,
    onResetLayout?: () => void
  ) {
    this.settingsGear = new SettingsGear(onLanguageChange || (() => {}));

    this.settingsGear.setRerenderCallback(() => {
      const event = new CustomEvent("settings-updated");
      document.getElementById("app")?.dispatchEvent(event);
    });

    if (onResetLayout) {
      this.settingsGear.setResetLayoutCallback(onResetLayout);
    }

    this.supportsFileSystemAccess = "showSaveFilePicker" in window;
  }

  setHasRememberedLocation(hasLocation: boolean): void {
    this.hasRememberedLocation = hasLocation;
  }

  setIsViewingOldVersion(isViewing: boolean): void {
    this.isViewingOldVersion = isViewing;
  }

  render(): TemplateResult {
    return html`
      <div data-testid="character-header" class="character-header">
        <div class="header-settings-row">
          <div class="header-settings-spacer"></div>
          ${this.settingsGear.render()}
        </div>
        <h1 data-testid="page-title" class="page-title">${t("app.title")}</h1>
        <div class="title-underline"></div>
        <div class="header-buttons">
          <button data-testid="load-button" @click=${this.onLoad} class="btn-load">
            ${t("buttons.load")}
          </button>
          <button
            data-testid="import-button"
            @click=${this.onImport}
            class="btn-import"
            ?disabled=${this.isViewingOldVersion}
          >
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

  handleKeyDown(event: KeyboardEvent): void {
    this.settingsGear.handleKeyDown(event);
  }

  closeSettings(): void {
    this.settingsGear.close();
  }

  private renderExportButtons(): TemplateResult {
    if (!this.supportsFileSystemAccess) {
      return html`
        <button data-testid="export-button" @click=${this.onExport} class="btn-export">
          ${t("buttons.export")}
        </button>
      `;
    }

    if (!this.hasRememberedLocation) {
      return html`
        <button data-testid="export-button" @click=${this.onExport} class="btn-export">
          ${t("buttons.export")}
        </button>
      `;
    }

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
