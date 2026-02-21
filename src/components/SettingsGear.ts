// SettingsGear component - Settings dropdown with language switcher

import { html, TemplateResult, nothing } from "lit-html";
import { t } from "../i18n/index.js";

export class SettingsGear {
  private _isOpen: boolean = false;
  private onRerender: (() => void) | null = null;
  private boundHandleDocumentClick: ((e: MouseEvent) => void) | null = null;
  private boundHandleDocumentKeydown: ((e: KeyboardEvent) => void) | null = null;

  constructor(private onLanguageChange: (lang: string) => void) {}

  /**
   * Set callback for triggering re-renders
   */
  setRerenderCallback(callback: () => void): void {
    this.onRerender = callback;
  }

  private triggerRerender(): void {
    if (this.onRerender) {
      this.onRerender();
    }
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  open(): void {
    this._isOpen = true;
    this.addDocumentListeners();
    this.triggerRerender();
  }

  close(): void {
    this._isOpen = false;
    this.removeDocumentListeners();
    this.triggerRerender();
  }

  private addDocumentListeners(): void {
    // Use setTimeout to avoid the current click event from immediately closing the panel
    setTimeout(() => {
      this.boundHandleDocumentClick = (e: MouseEvent) => this.handleDocumentClick(e);
      this.boundHandleDocumentKeydown = (e: KeyboardEvent) => this.handleDocumentKeydown(e);
      document.addEventListener("click", this.boundHandleDocumentClick);
      document.addEventListener("keydown", this.boundHandleDocumentKeydown);
    }, 0);
  }

  private removeDocumentListeners(): void {
    if (this.boundHandleDocumentClick) {
      document.removeEventListener("click", this.boundHandleDocumentClick);
      this.boundHandleDocumentClick = null;
    }
    if (this.boundHandleDocumentKeydown) {
      document.removeEventListener("keydown", this.boundHandleDocumentKeydown);
      this.boundHandleDocumentKeydown = null;
    }
  }

  private handleDocumentClick(e: MouseEvent): void {
    // Check if click was outside the settings container
    const target = e.target as HTMLElement;
    const settingsContainer = target.closest('[data-testid="settings-container"]');
    if (!settingsContainer) {
      this.close();
    }
  }

  private handleDocumentKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.close();
    }
  }

  toggle(): void {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this._isOpen) {
      this.close();
    }
  }

  private handleLanguageSelect(lang: string): void {
    this.onLanguageChange(lang);
    this.close();
  }

  private handleGearClick(): void {
    this.toggle();
  }

  render(): TemplateResult {
    return html`
      <div data-testid="settings-container" class="settings-container">
        <button
          data-testid="settings-gear-button"
          class="settings-gear-button"
          aria-label=${t("settings.aria.openSettings")}
          aria-expanded=${this._isOpen}
          @click=${() => this.handleGearClick()}
        >
          <svg
            class="settings-gear-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
        </button>
        ${this._isOpen ? this.renderPanel() : nothing}
      </div>
    `;
  }

  private renderPanel(): TemplateResult {
    return html`
      <div data-testid="settings-panel" class="settings-panel">
        <div class="settings-panel-header">
          <span class="settings-panel-title">${t("settings.title")}</span>
        </div>
        <div class="settings-panel-content">
          <div class="settings-section">
            <span class="settings-label">${t("settings.language")}</span>
            <div class="settings-language-flags">
              <button
                data-testid="language-flag-en"
                class="language-flag-button"
                aria-label=${t("settings.aria.selectEnglish")}
                @click=${() => this.handleLanguageSelect("en")}
              >
                <span class="flag-emoji" role="img" aria-hidden="true">🇬🇧</span>
              </button>
              <button
                data-testid="language-flag-de"
                class="language-flag-button"
                aria-label=${t("settings.aria.selectGerman")}
                @click=${() => this.handleLanguageSelect("de")}
              >
                <span class="flag-emoji" role="img" aria-hidden="true">🇩🇪</span>
              </button>
            </div>
          </div>
          <div class="settings-divider"></div>
          <button
            data-testid="settings-reset-layout"
            class="settings-reset-button"
            disabled
            title=${t("settings.resetLayoutDisabled")}
          >
            ${t("settings.resetLayout")}
          </button>
        </div>
      </div>
    `;
  }
}
