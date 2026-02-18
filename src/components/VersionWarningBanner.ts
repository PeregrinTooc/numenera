/**
 * VersionWarningBanner - Warning banner shown when viewing an old version of a character
 * Displays version metadata and provides a restore button to return to latest
 */

import { t } from "../i18n/index.js";

export interface VersionWarningBannerProps {
  description: string;
  timestamp: Date;
  onReturn: () => void;
  onRestore: () => void;
}

export class VersionWarningBanner {
  private props: VersionWarningBannerProps;
  private container: HTMLElement | null = null;

  constructor(props: VersionWarningBannerProps) {
    this.props = props;
  }

  /**
   * Format timestamp as relative time (e.g., "5 minutes ago")
   */
  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return "just now";
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
    } else {
      // For older dates, show the actual date
      return date.toLocaleDateString();
    }
  }

  /**
   * Render the banner content
   */
  private render(): HTMLElement {
    const banner = document.createElement("div");
    banner.setAttribute("data-testid", "version-warning-banner");
    banner.style.cssText = `
            position: fixed;
            top: 4.5rem;
            right: 1rem;
            max-width: 400px;
            z-index: 40;
            background: rgba(251, 191, 36, 0.95);
            border: 1px solid rgb(245, 158, 11);
            border-radius: 0.5rem;
            padding: 0.75rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            font-size: 0.75rem;
        `;

    const innerContainer = document.createElement("div");
    innerContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        `;

    // Warning text (compact)
    const warningText = document.createElement("div");
    warningText.style.cssText = `
            font-weight: 600;
            color: rgb(120, 53, 15);
            margin-bottom: 0.25rem;
        `;
    warningText.textContent = t("versionHistory.warningBanner.title");

    // Metadata (description + timestamp)
    const metadata = document.createElement("div");
    metadata.style.cssText = `
            color: rgb(146, 64, 14);
            margin-bottom: 0.5rem;
        `;

    const description = document.createElement("span");
    description.setAttribute("data-testid", "version-change-description");
    description.style.fontWeight = "500";
    description.textContent = this.props.description;

    const timestamp = document.createElement("span");
    timestamp.setAttribute("data-testid", "version-timestamp");
    timestamp.textContent = ` • ${this.formatTimestamp(this.props.timestamp)}`;

    metadata.appendChild(description);
    metadata.appendChild(timestamp);

    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
            display: flex;
            gap: 0.5rem;
        `;

    // Return button (navigate to current without creating new version)
    const returnButton = document.createElement("button");
    returnButton.setAttribute("data-testid", "version-return-button");
    returnButton.style.cssText = `
            background: rgb(209, 213, 219);
            color: rgb(55, 65, 81);
            font-weight: 600;
            padding: 0.375rem 0.75rem;
            border-radius: 0.375rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s;
            flex: 1;
        `;
    returnButton.textContent = t("versionHistory.warningBanner.returnButton");
    returnButton.addEventListener("click", this.props.onReturn);
    returnButton.addEventListener("mouseenter", () => {
      returnButton.style.background = "rgb(156, 163, 175)";
    });
    returnButton.addEventListener("mouseleave", () => {
      returnButton.style.background = "rgb(209, 213, 219)";
    });

    // Restore button (save old version as new latest)
    const restoreButton = document.createElement("button");
    restoreButton.setAttribute("data-testid", "version-restore-button");
    restoreButton.style.cssText = `
            background: rgb(217, 119, 6);
            color: white;
            font-weight: 600;
            padding: 0.375rem 0.75rem;
            border-radius: 0.375rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s;
            flex: 1;
        `;
    restoreButton.textContent = t("versionHistory.warningBanner.restoreButton");
    restoreButton.addEventListener("click", this.props.onRestore);
    restoreButton.addEventListener("mouseenter", () => {
      restoreButton.style.background = "rgb(180, 83, 9)";
    });
    restoreButton.addEventListener("mouseleave", () => {
      restoreButton.style.background = "rgb(217, 119, 6)";
    });

    buttonContainer.appendChild(returnButton);
    buttonContainer.appendChild(restoreButton);

    innerContainer.appendChild(warningText);
    innerContainer.appendChild(metadata);
    innerContainer.appendChild(buttonContainer);
    banner.appendChild(innerContainer);

    return banner;
  }

  /**
   * Mount the banner to a container element
   */
  mount(container: HTMLElement): void {
    this.container = container;
    const banner = this.render();
    container.appendChild(banner);
  }

  /**
   * Update the banner with new props
   */
  update(props: VersionWarningBannerProps): void {
    this.props = props;
    if (this.container) {
      // Remove old content
      this.unmount();
      // Re-render with new props
      const banner = this.render();
      this.container.appendChild(banner);
    }
  }

  /**
   * Unmount the banner from its container
   */
  unmount(): void {
    if (this.container) {
      const banner = this.container.querySelector('[data-testid="version-warning-banner"]');
      if (banner) {
        banner.remove();
      }
    }
  }
}
