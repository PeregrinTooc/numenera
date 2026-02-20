import { t } from "../i18n/index.js";
import type { ConflictDetail, ConflictResolution } from "../services/conflictDetectionService";

/**
 * Modal that displays when a version conflict is detected between tabs.
 * Allows user to choose between loading remote changes or saving local changes.
 */
export class ConflictWarningModal {
  private container: HTMLElement;
  private modal: HTMLElement | null = null;
  private currentConflict: ConflictDetail | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Listen for conflict events
    window.addEventListener("version-conflict", this.handleConflict.bind(this) as EventListener);
    window.addEventListener(
      "newer-version-available",
      this.handleNewerVersion.bind(this) as EventListener
    );
  }

  /**
   * Handle version conflict event
   */
  private handleConflict(event: CustomEvent<ConflictDetail>): void {
    this.currentConflict = event.detail;
    this.showConflictModal();
  }

  /**
   * Handle newer version available notification
   */
  private handleNewerVersion(
    event: CustomEvent<{ etag: string; timestamp: number; characterName?: string }>
  ): void {
    this.showNewerVersionBanner(event.detail);
  }

  /**
   * Show the conflict resolution modal
   */
  private showConflictModal(): void {
    // Remove any existing modal
    this.close();

    this.modal = document.createElement("div");
    this.modal.className = "conflict-modal-overlay";
    this.modal.setAttribute("data-testid", "conflict-modal");
    this.modal.setAttribute("role", "dialog");
    this.modal.setAttribute("aria-modal", "true");
    this.modal.setAttribute("aria-labelledby", "conflict-modal-title");

    this.modal.innerHTML = `
      <div class="conflict-modal">
        <div class="conflict-modal-header">
          <h2 id="conflict-modal-title" class="conflict-modal-title">
            ${t("conflict.title")}
          </h2>
        </div>
        <div class="conflict-modal-body">
          <p class="conflict-modal-message">
            ${t("conflict.message")}
          </p>
          <p class="conflict-modal-hint">
            ${t("conflict.hint")}
          </p>
        </div>
        <div class="conflict-modal-actions">
          <button 
            class="conflict-btn conflict-btn-load" 
            data-testid="conflict-load-remote"
            aria-label="${t("conflict.loadRemote.aria")}"
          >
            ${t("conflict.loadRemote.label")}
          </button>
          <button 
            class="conflict-btn conflict-btn-save" 
            data-testid="conflict-save-local"
            aria-label="${t("conflict.saveLocal.aria")}"
          >
            ${t("conflict.saveLocal.label")}
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    const loadButton = this.modal.querySelector('[data-testid="conflict-load-remote"]');
    const saveButton = this.modal.querySelector('[data-testid="conflict-save-local"]');

    loadButton?.addEventListener("click", () => this.resolveConflict("load-remote"));
    saveButton?.addEventListener("click", () => this.resolveConflict("save-local"));

    // Add keyboard handler for escape
    this.modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // Default to loading remote changes on escape
        this.resolveConflict("load-remote");
      }
    });

    this.container.appendChild(this.modal);

    // Focus the modal
    const firstButton = this.modal.querySelector("button");
    firstButton?.focus();
  }

  /**
   * Resolve the conflict with the chosen option
   */
  private resolveConflict(resolution: ConflictResolution): void {
    if (this.currentConflict) {
      this.currentConflict.resolve(resolution);
      this.currentConflict = null;
    }
    this.close();
  }

  /**
   * Show a banner notification about newer version available
   */
  private showNewerVersionBanner(_detail: {
    etag: string;
    timestamp: number;
    characterName?: string;
  }): void {
    // Remove any existing banner
    const existingBanner = document.querySelector('[data-testid="newer-version-banner"]');
    existingBanner?.remove();

    const banner = document.createElement("div");
    banner.className = "newer-version-banner";
    banner.setAttribute("data-testid", "newer-version-banner");
    banner.setAttribute("role", "alert");

    banner.innerHTML = `
      <span class="newer-version-message">
        ${t("conflict.newerVersionAvailable")}
      </span>
      <button 
        class="newer-version-reload-btn" 
        data-testid="newer-version-reload"
        aria-label="${t("conflict.reload.aria")}"
      >
        ${t("conflict.reload.label")}
      </button>
      <button 
        class="newer-version-dismiss-btn" 
        data-testid="newer-version-dismiss"
        aria-label="${t("conflict.dismiss.aria")}"
      >
        ×
      </button>
    `;

    // Add event listeners
    const reloadButton = banner.querySelector('[data-testid="newer-version-reload"]');
    const dismissButton = banner.querySelector('[data-testid="newer-version-dismiss"]');

    reloadButton?.addEventListener("click", () => {
      window.location.reload();
    });

    dismissButton?.addEventListener("click", () => {
      banner.remove();
    });

    // Insert at top of container
    this.container.insertBefore(banner, this.container.firstChild);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      banner.remove();
    }, 10000);
  }

  /**
   * Close the modal
   */
  public close(): void {
    this.modal?.remove();
    this.modal = null;
  }

  /**
   * Check if modal is currently visible
   */
  public isVisible(): boolean {
    return this.modal !== null;
  }
}
