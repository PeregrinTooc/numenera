import { t } from "@/i18n/index";
import type { ConflictDetail, ConflictResolution } from "@/services/conflictDetectionService";

export class ConflictWarningModal {
  private container: HTMLElement;
  private modal: HTMLElement | null = null;
  private currentConflict: ConflictDetail | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    window.addEventListener("version-conflict", this.handleConflict.bind(this) as EventListener);
    window.addEventListener(
      "newer-version-available",
      this.handleNewerVersion.bind(this) as EventListener
    );
  }

  private handleConflict(event: CustomEvent<ConflictDetail>): void {
    this.currentConflict = event.detail;
    this.showConflictModal();
  }

  private handleNewerVersion(
    event: CustomEvent<{ etag: string; timestamp: number; characterName?: string }>
  ): void {
    this.showNewerVersionBanner(event.detail);
  }

  private showConflictModal(): void {
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

    const loadButton = this.modal.querySelector('[data-testid="conflict-load-remote"]');
    const saveButton = this.modal.querySelector('[data-testid="conflict-save-local"]');

    loadButton?.addEventListener("click", () => this.resolveConflict("load-remote"));
    saveButton?.addEventListener("click", () => this.resolveConflict("save-local"));

    this.modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // Default to loading remote changes on escape
        this.resolveConflict("load-remote");
      }
    });

    this.container.appendChild(this.modal);

    const firstButton = this.modal.querySelector("button");
    firstButton?.focus();
  }

  private resolveConflict(resolution: ConflictResolution): void {
    if (this.currentConflict) {
      this.currentConflict.resolve(resolution);
      this.currentConflict = null;
    }
    this.close();
  }

  private showNewerVersionBanner(_detail: {
    etag: string;
    timestamp: number;
    characterName?: string;
  }): void {
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

    const reloadButton = banner.querySelector('[data-testid="newer-version-reload"]');
    const dismissButton = banner.querySelector('[data-testid="newer-version-dismiss"]');

    reloadButton?.addEventListener("click", () => {
      window.location.reload();
    });

    dismissButton?.addEventListener("click", () => {
      banner.remove();
    });

    this.container.insertBefore(banner, this.container.firstChild);

    setTimeout(() => {
      banner.remove();
    }, 10000);
  }

  public close(): void {
    this.modal?.remove();
    this.modal = null;
  }

  public isVisible(): boolean {
    return this.modal !== null;
  }
}
