import { t } from "../i18n/index.js";

export interface VersionNavigatorProps {
  versionCount: number;
  currentIndex: number;
  onNavigateBackward: () => void;
  onNavigateForward: () => void;
}

export class VersionNavigator {
  private props: VersionNavigatorProps;
  private container: HTMLElement | null = null;
  private element: HTMLElement | null = null;

  constructor(props: VersionNavigatorProps) {
    this.props = props;
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.render();
  }

  public update(props: VersionNavigatorProps): void {
    this.props = props;
    this.render();
  }

  public unmount(): void {
    if (this.element && this.container) {
      this.container.removeChild(this.element);
      this.element = null;
      this.container = null;
    }
  }

  private render(): void {
    // Don't render if only 1 or 0 versions exist (navigator only meaningful with 2+ versions)
    if (this.props.versionCount <= 1) {
      if (this.element && this.container) {
        this.container.removeChild(this.element);
        this.element = null;
      }
      return;
    }

    // Create or update element
    if (!this.element) {
      this.element = document.createElement("div");
      this.element.setAttribute("data-testid", "version-navigator");
      if (this.container) {
        this.container.appendChild(this.element);
      }
    }

    // Apply inline styles for fixed positioning in top right corner
    this.element.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: rgba(255, 255, 255, 0.95);
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 40;
            font-size: 0.875rem;
        `;

    // Clear existing content
    this.element.innerHTML = "";

    // Create backward arrow button
    const backwardButton = document.createElement("button");
    backwardButton.setAttribute("data-testid", "version-nav-backward");
    backwardButton.setAttribute("data-read-only-exempt", "true");
    backwardButton.innerHTML = "←";
    backwardButton.setAttribute("aria-label", t("versionHistory.navigateBackward"));
    backwardButton.style.cssText = `
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            padding: 0.25rem 0.75rem;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
            color: #374151;
        `;

    const isAtFirst = this.props.currentIndex === 0;
    backwardButton.disabled = isAtFirst;

    if (isAtFirst) {
      backwardButton.style.opacity = "0.5";
      backwardButton.style.cursor = "not-allowed";
    } else {
      backwardButton.addEventListener("mouseenter", () => {
        backwardButton.style.background = "#e5e7eb";
        backwardButton.style.borderColor = "#9ca3af";
      });
      backwardButton.addEventListener("mouseleave", () => {
        backwardButton.style.background = "#f3f4f6";
        backwardButton.style.borderColor = "#d1d5db";
      });
      backwardButton.addEventListener("click", () => {
        this.props.onNavigateBackward();
      });
    }

    // Create version counter
    const counter = document.createElement("span");
    counter.setAttribute("data-testid", "version-counter");
    counter.style.cssText = `
            font-weight: 600;
            color: #374151;
            white-space: nowrap;
        `;
    const currentVersion = this.props.currentIndex + 1; // Convert 0-based to 1-based
    const counterText = t("versionHistory.versionCounter");
    counter.textContent = counterText
      .replace("{{current}}", String(currentVersion))
      .replace("{{total}}", String(this.props.versionCount));

    // Create forward arrow button
    const forwardButton = document.createElement("button");
    forwardButton.setAttribute("data-testid", "version-nav-forward");
    forwardButton.setAttribute("data-read-only-exempt", "true");
    forwardButton.innerHTML = "→";
    forwardButton.setAttribute("aria-label", t("versionHistory.navigateForward"));
    forwardButton.style.cssText = `
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            padding: 0.25rem 0.75rem;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
            color: #374151;
        `;

    const isAtLast = this.props.currentIndex === this.props.versionCount - 1;
    forwardButton.disabled = isAtLast;

    if (isAtLast) {
      forwardButton.style.opacity = "0.5";
      forwardButton.style.cursor = "not-allowed";
    } else {
      forwardButton.addEventListener("mouseenter", () => {
        forwardButton.style.background = "#e5e7eb";
        forwardButton.style.borderColor = "#9ca3af";
      });
      forwardButton.addEventListener("mouseleave", () => {
        forwardButton.style.background = "#f3f4f6";
        forwardButton.style.borderColor = "#d1d5db";
      });
      forwardButton.addEventListener("click", () => {
        this.props.onNavigateForward();
      });
    }

    // Append elements
    this.element.appendChild(backwardButton);
    this.element.appendChild(counter);
    this.element.appendChild(forwardButton);
  }
}
